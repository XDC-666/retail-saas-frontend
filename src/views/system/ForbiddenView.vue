<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="system-page">
    <div class="system-code">403</div>
    <h1>当前角色没有访问权限</h1>
    <p>该页面已被 RBAC 路由守卫拦截。你可以切换演示账号查看不同角色的权限边界。</p>
    <button class="btn-primary" @click="router.push('/')">返回可访问页面</button>
  </div>
</template>
