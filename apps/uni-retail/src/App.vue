<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/store/auth'

onLaunch(() => {
  useAuthStore().restore()
})
</script>

<style lang="scss">
page { background: #f6f7fb; color: #172033; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
button::after { border: 0; }
.card { margin: 24rpx; padding: 28rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 12rpx 36rpx rgba(15,23,42,.05); }
.muted { color: #718096; }
.primary-btn { height: 88rpx; line-height: 88rpx; border-radius: 22rpx; color: #fff; background: linear-gradient(135deg,#4f46e5,#6366f1); font-size: 28rpx; font-weight: 700; }
