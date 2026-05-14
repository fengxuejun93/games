<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './styles/variables.scss';

page {
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  line-height: 1.5;
  color: #333333;
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333333;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.text-primary {
  color: #667eea;
}

.text-success {
  color: #52c41a;
}

.text-warning {
  color: #faad14;
}

.text-danger {
  color: #ff4d4f;
}

.text-muted {
  color: #999999;
}

.text-sm {
  font-size: 24rpx;
}

.text-lg {
  font-size: 32rpx;
}

.text-xl {
  font-size: 36rpx;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.flex-1 {
  flex: 1;
}

.gap-sm {
  gap: 16rpx;
}

.gap-md {
  gap: 24rpx;
}

.mt-sm {
  margin-top: 16rpx;
}

.mt-md {
  margin-top: 24rpx;
}

.mb-sm {
  margin-bottom: 16rpx;
}

.mb-md {
  margin-bottom: 24rpx;
}

.ml-sm {
  margin-left: 16rpx;
}

.mr-sm {
  margin-right: 16rpx;
}
</style>
