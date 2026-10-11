/**
 * Mock Server 授权回归测试
 * 覆盖：认证失败、角色权限隔离、多租户隔离、提权拦截
 * 运行：npm run test:api
 *
 * 背景：此前 /api/rbac/roles、PATCH /api/rbac/roles/:id、/api/sales/mock-large、
 * /api/orders/:id 仅校验登录态而未校验权限/租户，低权角色可读 RBAC 配置、
 * 修改角色权限（提权），并可跨租户读取订单。本文件用于防止回归。
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const PORT = 8900 + (process.pid % 400)
const BASE = `http://127.0.0.1:${PORT}`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let proc
const tokens = {}
const H = (role) => ({ authorization: `Bearer ${tokens[role]}` })

before(async () => {
  proc = spawn(process.execPath, [join(HERE, 'server-v3.mjs')], {
    cwd: ROOT,
    env: { ...process.env, MOCK_PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (let i = 0; i < 80; i += 1) {
    try {
      if ((await fetch(`${BASE}/api/health`)).ok) break
    } catch {
      /* 未就绪 */
    }
    await sleep(150)
  }
  for (const role of ['owner', 'manager', 'clerk']) {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `${role}@demo.local`, password: '123456' }),
    })
    tokens[role] = (await res.json()).token
  }
})

after(() => proc?.kill())

test('未登录访问受保护接口返回 401', async () => {
  assert.equal((await fetch(`${BASE}/api/session`)).status, 401)
  assert.equal(
    (await fetch(`${BASE}/api/rbac/roles`, { headers: { authorization: 'Bearer forged' } })).status,
    401,
  )
})

test('三种角色均可登录并拿到 token', () => {
  for (const role of ['owner', 'manager', 'clerk']) {
    assert.ok(tokens[role], `${role} 应拿到 token`)
  }
})

test('导航按权限裁剪：manager 无 permissions，clerk 无 stores/permissions', async () => {
  const nav = async (role) => (await fetch(`${BASE}/api/navigation`, { headers: H(role) })).json()
  const owner = JSON.stringify(await nav('owner'))
  const manager = JSON.stringify(await nav('manager'))
  const clerk = JSON.stringify(await nav('clerk'))
  assert.ok(owner.includes('permissions'), 'owner 应可见 permissions')
  assert.ok(!manager.includes('permissions'), 'manager 不应可见 permissions')
  assert.ok(!clerk.includes('stores'), 'clerk 不应可见 stores')
  assert.ok(!clerk.includes('permissions'), 'clerk 不应可见 permissions')
})

test('RBAC 配置读取需要 rbac:view，manager/clerk 均被拒', async () => {
  assert.equal((await fetch(`${BASE}/api/rbac/roles`, { headers: H('owner') })).status, 200)
  assert.equal((await fetch(`${BASE}/api/rbac/roles`, { headers: H('manager') })).status, 403)
  assert.equal((await fetch(`${BASE}/api/rbac/roles`, { headers: H('clerk') })).status, 403)
})

test('RBAC 角色修改需要 rbac:manage，低权角色无法提权', async () => {
  for (const role of ['manager', 'clerk']) {
    const res = await fetch(`${BASE}/api/rbac/roles/${role}`, {
      method: 'PATCH',
      headers: { ...H(role), 'content-type': 'application/json' },
      body: JSON.stringify({ permissions: ['rbac:manage'] }),
    })
    assert.equal(res.status, 403, `${role} 不应能修改角色权限`)
  }
})

test('销售明细强制租户隔离：clerk 请求他租户返回 403', async () => {
  const own = await fetch(`${BASE}/api/sales?page=1&pageSize=5`, { headers: H('clerk') })
  assert.equal(own.status, 200)
  const cross = await fetch(`${BASE}/api/sales?tenantId=tenant-b`, { headers: H('clerk') })
  assert.equal(cross.status, 403)
})

test('订单详情不得跨租户读取，且不泄露资源存在性（统一 404）', async () => {
  const list = await (
    await fetch(`${BASE}/api/sales?tenantId=tenant-b&page=1&pageSize=1`, { headers: H('owner') })
  ).json()
  const foreignId = list.items[0].id
  assert.equal((await fetch(`${BASE}/api/orders/${foreignId}`, { headers: H('clerk') })).status, 404)
  assert.equal((await fetch(`${BASE}/api/orders/${foreignId}`, { headers: H('owner') })).status, 200)
  assert.equal((await fetch(`${BASE}/api/orders/no-such-id`, { headers: H('owner') })).status, 404)
})

test('大批量接口要求 sales:export，clerk 被拒、owner 放行', async () => {
  assert.equal((await fetch(`${BASE}/api/sales/mock-large`, { headers: H('clerk') })).status, 403)
  assert.equal((await fetch(`${BASE}/api/sales/mock-large`, { headers: H('owner') })).status, 200)
})

test('门店写操作需要 stores:manage，clerk 被拒', async () => {
  const res = await fetch(`${BASE}/api/stores/s-1`, {
    method: 'PATCH',
    headers: { ...H('clerk'), 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'closed' }),
  })
  assert.equal(res.status, 403)
})

test('分页参数上限被强制约束（pageSize 不得超过 50）', async () => {
  const res = await fetch(`${BASE}/api/sales?page=1&pageSize=9999`, { headers: H('owner') })
  assert.equal(res.status, 200)
  assert.equal((await res.json()).pageSize, 50)
})
