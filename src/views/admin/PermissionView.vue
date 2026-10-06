<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { fetchRoles, updateRole } from '@/api/retail'
import { track } from '@/monitor/tracker'
import type { Permission, RoleDefinition } from '@/types/domain'

interface PermissionMeta {
  code: Permission
  label: string
  group: string
}

const auth = useAuthStore()

const roles = ref<RoleDefinition[]>([])
const catalog = ref<PermissionMeta[]>([])
const selectedId = ref('manager')
const saving = ref(false)
const saved = ref(false)

const selected = computed(() => roles.value.find((role) => role.id === selectedId.value))
const groups = computed(() => [...new Set(catalog.value.map((item) => item.group))])

/** owner 是内置角色，不允许改动其权限 */
const isBuiltinOwner = computed(() => selected.value?.id === 'owner')

onMounted(async () => {
  if (!auth.token) return
  const data = await fetchRoles(auth.token)
  // 深拷贝 permissions，避免直接改动接口返回对象
  roles.value = data.items.map((role) => ({ ...role, permissions: [...role.permissions] }))
  catalog.value = data.permissions
})

function select(roleId: string) {
  selectedId.value = roleId
  saved.value = false
}

function toggle(code: Permission) {
  if (!selected.value || isBuiltinOwner.value) return
  const current = selected.value.permissions
  selected.value.permissions = current.includes(code)
    ? current.filter((item) => item !== code)
    : [...current, code]
  saved.value = false
}

async function save() {
  if (!selected.value || !auth.token) return

  saving.value = true
  try {
    const updated = (await updateRole(selected.value.id, selected.value, auth.token)).item
    const index = roles.value.findIndex((role) => role.id === updated.id)
    if (index >= 0) roles.value[index] = updated

    saved.value = true
    track('rbac_role_updated', { role: updated.id })

    // 改的是自己的角色时，重新拉一次导航让菜单即时生效
    if (updated.id === auth.user?.role) {
      auth.accessReady = false
      await auth.loadAccess()
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page-stack">
    <div class="page-heading">
      <div>
        <span class="page-kicker">ACCESS CONTROL</span>
        <h1 class="page-title">角色与权限</h1>
        <p>配置会同步到服务端，并即时更新当前会话的权限菜单。</p>
      </div>
      <button
        v-permission="'rbac:manage'"
        class="btn-primary"
        :disabled="saving || isBuiltinOwner"
        @click="save"
      >
        {{ saving ? '保存中…' : saved ? '已保存' : '保存更改' }}
      </button>
    </div>

    <section class="card permission-shell">
      <aside class="role-list">
        <button
          v-for="role in roles"
          :key="role.id"
          :class="{ active: selectedId === role.id }"
          @click="select(role.id)"
        >
          <span class="role-avatar">{{ role.name.slice(0, 1) }}</span>
          <span>
            <strong>{{ role.name }}</strong>
            <small>{{ role.userCount }} 位用户</small>
          </span>
          <i :class="role.enabled ? 'enabled' : ''" />
        </button>
      </aside>

      <div v-if="selected" class="permission-main">
        <div class="permission-head">
          <div>
            <h2>{{ selected.name }}</h2>
            <p>{{ selected.description }}</p>
          </div>
          <span v-if="isBuiltinOwner" class="permission-badge">系统内置角色</span>
        </div>

        <div v-for="group in groups" :key="group" class="permission-group">
          <h3>{{ group }}</h3>
          <label
            v-for="permission in catalog.filter((item) => item.group === group)"
            :key="permission.code"
            class="permission-row"
          >
            <span>
              <strong>{{ permission.label }}</strong>
              <small>{{ permission.code }}</small>
            </span>
            <input
              type="checkbox"
              :checked="selected.permissions.includes(permission.code)"
              :disabled="isBuiltinOwner || !auth.can('rbac:manage')"
              @change="toggle(permission.code)"
            />
          </label>
        </div>
      </div>
    </section>
  </div>
</template>