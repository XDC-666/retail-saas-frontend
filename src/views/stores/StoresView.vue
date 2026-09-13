<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStoresStore } from '@/stores/stores'
import { money } from '@/utils/format'
import StoreFormDrawer from './StoreFormDrawer.vue'; import type { Store,StoreInput } from '@/types/domain'; import { track } from '@/monitor/tracker'

const auth = useAuthStore()
const storeState = useStoresStore()
const formOpen=ref(false); const editing=ref<Store>()

watch(
  () => [auth.activeTenantId, auth.token] as const,
  ([tenantId, token]) => { if (tenantId && token) storeState.load(tenantId, token) },
  { immediate: true },
)

async function toggle(store: (typeof storeState.items)[number]) {
  if (auth.token) await storeState.toggleStatus(store, auth.token)
}
function openForm(store?:Store){editing.value=store;formOpen.value=true}
async function save(input:StoreInput){if(!auth.token)return;const item=await storeState.save(input,auth.token,editing.value?.id);track(editing.value?'store_updated':'store_created',{storeId:item.id});formOpen.value=false}
</script>

<template>
  <div class="page-stack">
    <div class="page-heading">
      <div>
        <span class="page-kicker">STORE NETWORK</span>
        <h1 class="page-title">门店管理</h1>
        <p>Owner 可修改营业状态，Manager 仅可查看；权限由服务端返回的 RBAC 决定。</p>
      </div>
      <div class="heading-actions"><span class="permission-badge">当前角色：{{ auth.user?.roleLabel }}</span><button v-permission="'stores:manage'" class="btn-primary" @click="openForm()">+ 新增门店</button></div>
    </div>

    <div class="store-grid">
      <article v-for="store in storeState.items" :key="store.id" class="card store-card">
        <div class="store-card__top">
          <div class="store-logo">{{ store.name.slice(0, 1) }}</div>
          <span class="store-status" :class="store.status === 'open' ? 'is-open' : 'is-closed'"><i />{{ store.status === 'open' ? '营业中' : '已停业' }}</span>
        </div>
        <h2>{{ store.name }}</h2>
        <p>{{ store.city }} · 店长 {{ store.manager }}</p>
        <div class="store-stat-grid">
          <div><span>月度目标</span><strong>{{ money.format(store.target) }}</strong></div>
          <div><span>门店编号</span><strong>{{ store.id.toUpperCase() }}</strong></div>
        </div>
        <div class="store-card__footer">
          <span class="permission-note">stores:manage</span>
          <div><button v-permission="'stores:manage'" class="btn-ghost btn-sm" @click="openForm(store)">编辑</button><button v-permission="'stores:manage'" class="btn-ghost btn-sm" @click="toggle(store)">{{ store.status === 'open' ? '设为停业' : '恢复营业' }}</button></div>
        </div>
      </article>
    </div>
    <StoreFormDrawer :open="formOpen" :store="editing" @close="formOpen=false" @submit="save"/>
  </div>
</template>
