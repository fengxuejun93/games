<template>
  <view class="signature-container">
    <view class="signature-header">
      <text class="signature-title">领导签字</text>
      <text class="signature-close" @click="$emit('close')">✕</text>
    </view>
    
    <view class="signature-body">
      <view class="signer-info">
        <view class="form-item">
          <text class="form-label">签字人姓名</text>
          <input 
            class="form-input" 
            type="text" 
            placeholder="请输入签字人姓名" 
            v-model="signerName"
          />
        </view>
      </view>
      
      <view class="canvas-wrapper">
        <view class="canvas-title">请在下方区域签名</view>
        <canvas 
          canvas-id="signatureCanvas"
          class="signature-canvas"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        />
        <view class="canvas-actions">
          <view class="canvas-btn clear" @click="clearCanvas">
            <text>清除</text>
          </view>
          <view class="canvas-btn save" @click="saveSignature" :class="{ disabled: !hasSignature }">
            <text>保存签名</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'save'])

const signerName = ref('')
const hasSignature = ref(false)
let ctx: UniApp.CanvasContext | null = null
let isDrawing = false
let lastX = 0
let lastY = 0

const initCanvas = () => {
  ctx = uni.createCanvasContext('signatureCanvas')
  ctx.setStrokeStyle('#1e293b')
  ctx.setLineWidth(3)
  ctx.setLineCap('round')
  ctx.setLineJoin('round')
}

const onTouchStart = (e: TouchEvent) => {
  if (!ctx) return
  isDrawing = true
  const touch = e.touches[0]
  lastX = touch.x
  lastY = touch.y - 100
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
}

const onTouchMove = (e: TouchEvent) => {
  if (!ctx || !isDrawing) return
  const touch = e.touches[0]
  const currentX = touch.x
  const currentY = touch.y - 100
  
  ctx.lineTo(currentX, currentY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(currentX, currentY)
  
  ctx.draw(true)
  hasSignature.value = true
}

const onTouchEnd = () => {
  isDrawing = false
  if (ctx) {
    ctx.draw(true)
  }
}

const clearCanvas = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, 750, 300)
  ctx.draw()
  hasSignature.value = false
}

const saveSignature = () => {
  if (!hasSignature.value) return
  if (!signerName.value.trim()) {
    uni.showToast({ title: '请输入签字人姓名', icon: 'none' })
    return
  }
  
  uni.canvasToTempFilePath({
    canvasId: 'signatureCanvas',
    success: (res) => {
      emit('save', {
        signerName: signerName.value,
        signatureData: res.tempFilePath
      })
    },
    fail: () => {
      emit('save', {
        signerName: signerName.value,
        signatureData: ''
      })
    }
  })
}

uni.$on('signatureInit', initCanvas)
</script>

<style lang="scss" scoped>
.signature-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.signature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));
  border-bottom: 1rpx solid #f1f5f9;
}

.signature-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1e293b;
}

.signature-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 28rpx;
  color: #64748b;
}

.signature-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.signer-info {
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #1e293b;
  box-sizing: border-box;
}

.canvas-wrapper {
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 24rpx;
}

.canvas-title {
  font-size: 26rpx;
  color: #64748b;
  text-align: center;
  margin-bottom: 16rpx;
}

.signature-canvas {
  width: 100%;
  height: 300rpx;
  background: #fff;
  border-radius: 12rpx;
  border: 2rpx dashed #cbd5e1;
}

.canvas-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.canvas-btn {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  
  &.clear {
    background: #f8fafc;
    color: #64748b;
    border: 2rpx solid #e2e8f0;
  }
  
  &.save {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    color: #fff;
    
    &.disabled {
      opacity: 0.5;
    }
  }
}
</style>