<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { callNativeCapability, getPlatformLabel, scanStoreCode } from '@/utils/platform'
const auth = useAuthStore()
async function scan(){ try{ const code=await scanStoreCode(); uni.showModal({title:'扫码结果',content:code}) }catch{} }
function native(){ uni.showModal({title:'原生能力',content:JSON.stringify(callNativeCapability())}) }
function logout(){ auth.logout(); uni.reLaunch({url:'/pages/login/index'}) }
</script>

<template>
  <view>
    <view class="card profile"><view class="avatar">{{ auth.user?.name?.slice(0,1) }}</view><view><strong>{{ auth.user?.name }}</strong><text>{{ auth.user?.roleLabel }} · {{ getPlatformLabel() }}</text></view></view>
    <view class="card actions"><button @click="scan">扫码 / 相机能力</button><button @click="native">调用 App-Plus 原生插件</button><button class="logout" @click="logout">退出登录</button></view>
  </view>
</template>

<style scoped lang="scss">
.profile{display:flex;align-items:center;gap:24rpx}.avatar{width:86rpx;height:86rpx;display:grid;place-items:center;border-radius:26rpx;color:#4338ca;background:#e0e7ff;font-size:34rpx;font-weight:900}.profile view:last-child{display:flex;flex-direction:column;gap:8rpx}.profile text{color:#718096;font-size:22rpx}.actions button{margin-bottom:16rpx;border-radius:18rpx;background:#f8fafc;color:#172033;font-size:26rpx}.actions .logout{color:#dc2626}
</style>
