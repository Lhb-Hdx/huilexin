<template>
  <div class="el-message-box__wrapper el-message-box-canvas" :class="showCanvas === true ? 'active':''">
    <div class="el-canvas-box" style="z-index:2001;">
      <canvas id="hyCanvas" ref="hyCanvas" class="el-canvas" :width="videoWidth" :height="videoHeight" style="z-index:2002;" @mousedown="handlerMouseDown($event)" @mousemove="handlerMouseMove($event)" @mouseup="handlerMouseUp($event)" @mouseout="handlerMouseOut($event)" />
      <div class="footer">
        <el-button v-permission="['SaveScreenshot']" type="primary" @click="saveCanvas">保存</el-button>
        <el-button @click="closeCanvas">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerScreenshots',
  props: {
    showPlayerScreenshots: {
      type: Boolean,
      default: false
    },
    canvasNode: {
      type: Node,
      default: null
    },
    canvasWidth: {
      type: Number,
      default: 0
    },
    canvasHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      videoWidth: 0,
      videoHeight: 0,
      showCanvas: false,
      isMouseDown: false,
      coordinate: { X: 0, Y: 0, X1: 0, Y1: 0 },
      flag: 0
    }
  },
  watch: {
    showPlayerScreenshots(newVal, oldVal) {
      this.showCanvas = newVal
      if (newVal) {
        this.printVideoScreen()
      }
    }
  },
  methods: {
    // 视频截图
    printVideoScreen() {
      const canvas = this.$refs.hyCanvas
      canvas.width = this.canvasWidth
      canvas.height = this.canvasHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.canvasNode, 0, 0, this.canvasWidth, this.canvasHeight)
    },
    // 关闭截图
    closeCanvas() {
      this.showCanvas = false
      this.closePlayerScreenshots()
    },
    // 保存截图
    saveCanvas() {
      const link = document.createElement('a')
      const canvas = this.$refs.hyCanvas
      const imgData = canvas.toDataURL({
        format: 'png',
        quality: 1,
        width: this.canvasWidth,
        height: this.canvasHeight
      })
      const blob = this.dataURLtoBlob(imgData)
      const time2 = new Date().getTime()
      const objurl = URL.createObjectURL(blob)
      link.download = time2 + '.png'
      link.href = objurl
      link.click()
      this.closeCanvas()
      this.closePlayerScreenshots()
    },
    dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    handlerMouseDown(e) {
      console.log('handlerMouseDown', e.offsetX, e.offsetY)
      this.isMouseDown = true
      // 记录鼠标点下的坐标
      this.coordinate.X = e.offsetX
      this.coordinate.Y = e.offsetY
      this.flag = 1
    },
    handlerMouseMove(e) {
      console.log('handlerMouseMove', e.offsetX, e.offsetY)
      if (this.isMouseDown) {
        this.coordinate.X1 = e.offsetX
        this.coordinate.Y1 = e.offsetY
        this.drawLine()
        this.flag++
      }
    },
    drawLine() {
      const { X, Y, X1, Y1 } = this.coordinate
      const canvasEl = this.$refs.hyCanvas
      const ctx = canvasEl.getContext('2d')
      ctx.moveTo(X, Y) // 起点
      ctx.lineWidth = 4 // 定义画笔宽度
      ctx.strokeStyle = this.checkedPen || 'red'
      ctx.lineTo(X1, Y1)
      ctx.stroke()
      this.coordinate.X = X1
      this.coordinate.Y = Y1
    },
    handlerMouseUp(e) {
      console.log('handlerMouseUp', e.offsetX, e.offsetY)
      this.isMouseDown = false
      this.flag = 0
    },
    handlerMouseOut(e) {
      console.log('handlerMouseUp', e.offsetX, e.offsetY)
      this.isMouseDown = false
      this.flag = 0
    },
    closePlayerScreenshots() {
      this.$emit('closePlayerScreenshots', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-canvas-box{
  display: inline-block;
  padding-bottom: 10px;
  vertical-align: middle;
  background-color: #FFFFFF;
  border-radius: 4px;
  border: 1px solid #e6ebf5;
  font-size: 18px;
  box-shadow: 0 2px 12px 0 #d7d6d6;
  text-align: left;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  z-index: 2001;
  canvas{
    z-index: 2002;
  }
  .footer{
    text-align: center;
  }
}
.el-canvas{
  width: 100%;
  height: 100%;
}
.el-message-box-canvas{
  display: none;
  z-index: 99;
}
.el-message-box-canvas.active{
  display: block;
}
</style>
