<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const email = ref('owner@demo.local')
const password = ref('123456')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    uni.switchTab({ url: '/pages/dashboard/index' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '登录失败', icon: 'none' })
  } finally { loading.value = false }
}
</script>

<template>
  <view class="login-page">
    <view class="hero">
      <text class="eyebrow">RETAILOPS MOBILE</text>
      <text class="title">零售 SaaS，多端一致体验</text>
      <text class="sub">H5 / 微信小程序 / Android / iOS 共用业务层。</text>
    </view>
    <view class="card form-card">
      <text class="label">账号</text><input v-model="email" class="input" />
      <text class="label">密码</text><input v-model="password" class="input" password />
      <button class="primary-btn" :loading="loading" @click="submit">进入系统</button>
      <text class="hint">默认密码：123456</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page { min-height: 100vh; background: #f6f7fb; }
.hero { padding: 160rpx 52rpx 110rpx; display: flex; flex-direction: column; gap: 22rpx; color: white; background: linear-gradient(145deg,#111827,#312e81); border-radius: 0 0 54rpx 54rpx; }
.eyebrow { font-size: 20rpx; letter-spacing: 6rpx; color: #a5b4fc; }
.title { font-size: 56rpx; line-height: 1.12; font-weight: 800; }
.sub { font-size: 26rpx; color: #cbd5e1; }
.form-card { margin-top: -54rpx; position: relative; }
.label { display: block; margin: 20rpx 0 10rpx; font-size: 24rpx; color: #718096; }
.input { height: 82rpx; padding: 0 24rpx; border: 1px solid #e2e8f0; border-radius: 18rpx; background: #f8fafc; }
.primary-btn { margin-top: 34rpx; }
.hint { display: block; margin-top: 20rpx; text-align: center; color: #94a3b8; font-size: 22rpx; }
</style>
