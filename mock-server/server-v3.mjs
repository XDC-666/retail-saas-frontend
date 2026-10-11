import http from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.MOCK_PORT || 8787)

const tenants = [
  { id: 'tenant-a', name: '华东零售集团', plan: 'Enterprise' },
  { id: 'tenant-b', name: '北方生活馆', plan: 'Pro' },
]

const users = [
  {
    id: 'u-owner', email: 'owner@demo.local', password: '123456', name: '张店长', role: 'owner', roleLabel: '超级管理员',
    tenantId: 'tenant-a', accessibleTenantIds: ['tenant-a', 'tenant-b'],
    permissions: ['dashboard:view','sales:view','sales:export','stores:view','stores:manage','rbac:view','rbac:manage'],
  },
  {
    id: 'u-manager', email: 'manager@demo.local', password: '123456', name: '李经理', role: 'manager', roleLabel: '区域经理',
    tenantId: 'tenant-a', accessibleTenantIds: ['tenant-a'],
    permissions: ['dashboard:view', 'sales:view', 'sales:export', 'stores:view'],
  },
  {
    id: 'u-clerk', email: 'clerk@demo.local', password: '123456', name: '王店员', role: 'clerk', roleLabel: '门店员工',
    tenantId: 'tenant-a', accessibleTenantIds: ['tenant-a'],
    permissions: ['dashboard:view', 'sales:view'],
  },
]

const stores = [
  { id: 's-1', tenantId: 'tenant-a', name: '上海静安旗舰店', city: '上海', manager: '陈璐', status: 'open', target: 1680000 },
  { id: 's-2', tenantId: 'tenant-a', name: '杭州西湖店', city: '杭州', manager: '周宁', status: 'open', target: 1320000 },
  { id: 's-3', tenantId: 'tenant-a', name: '苏州中心店', city: '苏州', manager: '许晨', status: 'open', target: 1160000 },
  { id: 's-4', tenantId: 'tenant-b', name: '北京朝阳店', city: '北京', manager: '赵倩', status: 'open', target: 1480000 },
  { id: 's-5', tenantId: 'tenant-b', name: '天津和平店', city: '天津', manager: '林森', status: 'closed', target: 980000 },
]

const channels = ['线下门店', '微信小程序', '外卖平台']
const baseDate = new Date()
baseDate.setHours(12, 0, 0, 0)
const sales = []
for (let day = 0; day < 30; day += 1) {
  const date = new Date(baseDate)
  date.setDate(date.getDate() - day)
  const dateText = date.toISOString().slice(0, 10)
  for (let sIndex = 0; sIndex < stores.length; sIndex += 1) {
    const store = stores[sIndex]
    for (let cIndex = 0; cIndex < channels.length; cIndex += 1) {
      const weekdayFactor = [0.82, 0.86, 0.92, 0.98, 1.08, 1.24, 1.18][date.getDay()]
      const tenantFactor = store.tenantId === 'tenant-a' ? 1 : 0.88
      const storeFactor = 0.88 + sIndex * 0.09
      const channelFactor = [1, 0.42, 0.21][cIndex]
      const wave = 1 + Math.sin((day + sIndex * 2 + cIndex) / 3.2) * 0.08
      const amount = Math.round(62000 * weekdayFactor * tenantFactor * storeFactor * channelFactor * wave)
      const orders = Math.max(1, Math.round(amount / (128 + sIndex * 8 + cIndex * 4)))
      sales.push({
        id: `sale-${day}-${store.id}-${cIndex}`,
        tenantId: store.tenantId,
        storeId: store.id,
        storeName: store.name,
        city: store.city,
        date: dateText,
        channel: channels[cIndex],
        amount,
        orders,
        refundRate: Number((0.012 + ((day + sIndex + cIndex) % 7) * 0.0018).toFixed(4)),
      })
    }
  }
}

const tokens = new Map()

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

function error(res, status, message, code = 'API_ERROR') {
  json(res, status, { code, message })
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { return {} }
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

function getUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const userId = tokens.get(token)
  return users.find((item) => item.id === userId) || null
}

function requireUser(req, res) {
  const user = getUser(req)
  if (!user) {
    error(res, 401, '登录状态已失效，请重新登录', 'UNAUTHORIZED')
    return null
  }
  return user
}

function canAccessTenant(user, tenantId) {
  return user.accessibleTenantIds.includes(tenantId)
}

function hasPermission(user, permission) {
  return user.permissions.includes(permission)
}

function navigationFor(user) {
  const manifest = [
    { code: 'dashboard', label: '经营看板', path: '/dashboard', permission: 'dashboard:view', icon: 'chart' },
    { code: 'sales', label: '销售明细', path: '/sales', permission: 'sales:view', icon: 'receipt' },
    { code: 'stores', label: '门店管理', path: '/stores', permission: 'stores:view', icon: 'store' },
    { code: 'permissions', label: '权限配置', path: '/permissions', permission: 'rbac:view', icon: 'shield' },
  ]
  return manifest.filter((item) => hasPermission(user, item.permission))
}

function aggregateDashboard(tenantId) {
  const tenantSales = sales.filter((item) => item.tenantId === tenantId)
  const last7 = [...new Set(tenantSales.map((item) => item.date))].sort().reverse().slice(0, 7).reverse()
  const currentRecords = tenantSales.filter((item) => last7.includes(item.date))
  const amount = currentRecords.reduce((sum, item) => sum + item.amount, 0)
  const orders = currentRecords.reduce((sum, item) => sum + item.orders, 0)
  const avgRefundRate = currentRecords.length
    ? currentRecords.reduce((sum, item) => sum + item.refundRate, 0) / currentRecords.length
    : 0
  const trend = last7.map((date) => {
    const rows = currentRecords.filter((item) => item.date === date)
    return {
      date,
      amount: rows.reduce((sum, item) => sum + item.amount, 0),
      orders: rows.reduce((sum, item) => sum + item.orders, 0),
    }
  })
  const ranking = stores.filter((item) => item.tenantId === tenantId).map((store) => {
    const rows = currentRecords.filter((item) => item.storeId === store.id)
    return {
      storeId: store.id,
      storeName: store.name,
      city: store.city,
      amount: rows.reduce((sum, item) => sum + item.amount, 0),
      orders: rows.reduce((sum, item) => sum + item.orders, 0),
    }
  }).sort((a, b) => b.amount - a.amount)
  return {
    metrics: {
      totalSales: amount,
      totalOrders: orders,
      avgOrderValue: orders ? amount / orders : 0,
      avgRefundRate,
      salesChange: 0.126,
      ordersChange: 0.084,
      aovChange: 0.039,
      refundChange: -0.006,
    },
    trend,
    ranking,
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, null)
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { ok: true, service: 'retailops-mock-api', version: '2.0.0' })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(req)
    const user = users.find((item) => item.email === body.email && item.password === body.password)
    if (!user) return error(res, 401, '账号或密码错误', 'INVALID_CREDENTIALS')
    const token = `demo-${user.id}-${Date.now()}`
    tokens.set(token, user.id)
    return json(res, 200, {
      token,
      user: sanitizeUser(user),
      tenants: tenants.filter((tenant) => user.accessibleTenantIds.includes(tenant.id)),
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    const header = req.headers.authorization || ''
    if (header.startsWith('Bearer ')) tokens.delete(header.slice(7))
    return json(res, 200, { ok: true })
  }

  if (req.method === 'GET' && url.pathname === '/api/session') {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, {
      user: sanitizeUser(user),
      tenants: tenants.filter((tenant) => user.accessibleTenantIds.includes(tenant.id)),
    })
  }

  if (req.method === 'GET' && url.pathname === '/api/navigation') {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, { items: navigationFor(user) })
  }

  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    const user = requireUser(req, res)
    if (!user) return
    if (!hasPermission(user, 'dashboard:view')) return error(res, 403, '没有看板访问权限', 'FORBIDDEN')
    const tenantId = url.searchParams.get('tenantId') || user.tenantId
    if (!canAccessTenant(user, tenantId)) return error(res, 403, '无权访问该租户', 'TENANT_FORBIDDEN')
    return json(res, 200, aggregateDashboard(tenantId))
  }

  if (req.method === 'GET' && url.pathname === '/api/stores') {
    const user = requireUser(req, res)
    if (!user) return
    if (!hasPermission(user, 'stores:view')) return error(res, 403, '没有门店查看权限', 'FORBIDDEN')
    const tenantId = url.searchParams.get('tenantId') || user.tenantId
    if (!canAccessTenant(user, tenantId)) return error(res, 403, '无权访问该租户', 'TENANT_FORBIDDEN')
    return json(res, 200, { items: stores.filter((item) => item.tenantId === tenantId) })
  }
  if(req.method==='POST'&&url.pathname.startsWith('/api/log/')){await readBody(req);return json(res,202,{accepted:true})}
  if(req.method==='GET'&&url.pathname==='/api/rbac/roles'){
    const user=requireUser(req,res);if(!user)return
    // 授权校验：角色/权限清单属敏感配置，必须要求 rbac:view，不能只验登录态
    if(!hasPermission(user,'rbac:view'))return error(res,403,'没有权限配置查看权限','FORBIDDEN')
    return json(res,200,{items:[{id:'owner',name:'超级管理员',description:'完整系统权限',userCount:3,enabled:true,permissions:['dashboard:view','sales:view','sales:export','stores:view','stores:manage','rbac:view','rbac:manage']},{id:'manager',name:'区域经理',description:'经营与门店只读',userCount:12,enabled:true,permissions:['dashboard:view','sales:view','sales:export','stores:view']},{id:'clerk',name:'门店员工',description:'日常经营查看',userCount:80,enabled:true,permissions:['dashboard:view','sales:view']}],permissions:[{code:'dashboard:view',label:'查看看板',group:'看板'},{code:'sales:view',label:'查看销售',group:'销售'},{code:'sales:export',label:'导出销售',group:'销售'},{code:'stores:view',label:'查看门店',group:'门店'},{code:'stores:manage',label:'编辑门店',group:'门店'},{code:'rbac:view',label:'查看权限',group:'系统'},{code:'rbac:manage',label:'配置权限',group:'系统'}]})}
  if(req.method==='PATCH'&&url.pathname.startsWith('/api/rbac/roles/')){
    const user=requireUser(req,res);if(!user)return
    // 授权校验：改角色权限等同提权操作，必须要求 rbac:manage
    if(!hasPermission(user,'rbac:manage'))return error(res,403,'没有权限配置修改权限','FORBIDDEN')
    const body=await readBody(req);return json(res,200,{item:{id:url.pathname.split('/').pop(),name:'区域经理',description:'权限已更新',userCount:12,enabled:true,permissions:body.permissions||[]}})}
  if(req.method==='GET'&&url.pathname==='/api/sales/mock-large'){
    const user=requireUser(req,res);if(!user)return
    // 授权 + 租户校验：该接口一次性返回 10 万条（导出级体量），
    // 因此按导出权限要求 sales:export，并强制租户隔离，避免被当作资源放大器。
    if(!hasPermission(user,'sales:export'))return error(res,403,'没有销售数据导出权限','FORBIDDEN')
    const tenantId=url.searchParams.get('tenantId')||user.tenantId
    if(!canAccessTenant(user,tenantId))return error(res,403,'无权访问该租户','TENANT_FORBIDDEN')
    const seed=sales.filter(x=>x.tenantId===tenantId);const items=Array.from({length:100000},(_,i)=>({...seed[i%seed.length],id:`large-${i}`}));return json(res,200,{items,total:items.length})}
  if(req.method==='GET'&&url.pathname.startsWith('/api/orders/')){
    const user=requireUser(req,res);if(!user)return
    if(!hasPermission(user,'sales:view'))return error(res,403,'没有销售数据权限','FORBIDDEN')
    const row=sales.find(x=>x.id===url.pathname.split('/').pop());
    // 租户隔离：无权访问与不存在统一返回 404，避免通过状态码探测他租户单据是否存在
    if(!row||!canAccessTenant(user,row.tenantId))return error(res,404,'订单不存在','NOT_FOUND');const subtotal=Math.round(row.amount/row.orders);return json(res,200,{item:{id:row.id,orderNo:`SO${row.date.replaceAll('-','')}0001`,tenantId:row.tenantId,storeId:row.storeId,storeName:row.storeName,customer:{name:'林晓',phone:'138****2719',memberLevel:'金卡会员'},status:'completed',paymentMethod:'微信支付',subtotal,discount:8,paidAmount:subtotal-8,refundAmount:0,items:[{id:'1',name:'精品拿铁',quantity:2,unitPrice:34}],timeline:[{id:'1',label:'创建订单',detail:'收银台创建',time:`${row.date} 14:21`,status:'done'},{id:'2',label:'支付成功',detail:'微信支付',time:`${row.date} 14:22`,status:'current'}]}})}

  const storeMatch = url.pathname.match(/^\/api\/stores\/([^/]+)$/)
  if (req.method === 'PATCH' && storeMatch) {
    const user = requireUser(req, res)
    if (!user) return
    if (!hasPermission(user, 'stores:manage')) return error(res, 403, '没有门店管理权限', 'FORBIDDEN')
    const store = stores.find((item) => item.id === storeMatch[1])
    if (!store || !canAccessTenant(user, store.tenantId)) return error(res, 404, '门店不存在', 'NOT_FOUND')
    const body = await readBody(req)
    if (body.status === 'open' || body.status === 'closed') store.status = body.status
    return json(res, 200, { item: store })
  }

  if (req.method === 'GET' && url.pathname === '/api/sales') {
    const user = requireUser(req, res)
    if (!user) return
    if (!hasPermission(user, 'sales:view')) return error(res, 403, '没有销售数据权限', 'FORBIDDEN')
    const tenantId = url.searchParams.get('tenantId') || user.tenantId
    if (!canAccessTenant(user, tenantId)) return error(res, 403, '无权访问该租户', 'TENANT_FORBIDDEN')
    const keyword = (url.searchParams.get('keyword') || '').trim().toLowerCase()
    const storeId = url.searchParams.get('storeId') || ''
    const channel = url.searchParams.get('channel') || ''
    const from = url.searchParams.get('from') || ''
    const to = url.searchParams.get('to') || ''
    const page = Math.max(1, Number(url.searchParams.get('page') || 1))
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || 10)))
    let rows = sales.filter((item) => item.tenantId === tenantId)
    if (keyword) rows = rows.filter((item) => `${item.storeName} ${item.city} ${item.channel}`.toLowerCase().includes(keyword))
    if (storeId) rows = rows.filter((item) => item.storeId === storeId)
    if (channel) rows = rows.filter((item) => item.channel === channel)
    if (from) rows = rows.filter((item) => item.date >= from)
    if (to) rows = rows.filter((item) => item.date <= to)
    rows = rows.sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount)
    const start = (page - 1) * pageSize
    return json(res, 200, {
      items: rows.slice(start, start + pageSize),
      total: rows.length,
      page,
      pageSize,
    })
  }

  return error(res, 404, `未找到接口：${url.pathname}`, 'NOT_FOUND')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-api] http://127.0.0.1:${PORT}`)
  console.log('[mock-api] demo users: owner / manager / clerk @demo.local, password 123456')
})
