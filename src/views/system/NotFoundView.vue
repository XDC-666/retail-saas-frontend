<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="system-page">
    <div class="system-code">404</div>
    <h1>页面不存在</h1>
    <p>请检查地址，或返回系统首页。</p>
    <button class="btn-primary" @click="router.push('/')">返回首页</button>
  </div>
</template>
