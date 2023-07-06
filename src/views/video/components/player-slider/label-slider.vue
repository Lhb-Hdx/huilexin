<template>
  <div ref="playSliderBox" class="play-slider-box" @mousedown="playBarMoveDown" @mouseup="playBarMouseUp" @mousemove="getPosition($event)">
    <div v-for="(item,index) in sources" :key="index" class="play-slider-progress" :style="{left : item.left + 'px' , width : item.width + 'px'}">
      <div class="tip">
        {{ item.startHour+':'+item.startMinute+':'+item.startSecond+'~'+item.endHour+':'+item.endMinute+':'+item.endSecond }}
      </div>
    </div>
    <!--有播放视频的进度条-->
    <!--<div class="play-slider-block" :style="{left : barX + 'px'}" @mousedown="playIngMouseDown" @mouseup="playIngMouseUp" @mousemove="playIngMouseMove" />&lt;!&ndash;播放控制条&ndash;&gt;-->
    <div class="play-slider-tip" :style="{left : tipX + 'px'}">{{ tipTime }}</div>
  </div>
</template>

<script>
// import { getNowDate } from '@/utils/utils'

export default {
  name: 'VideoLabelSlider',
  props: {
    sources: { // 视频的列表来源
      type: Array,
      default() {
        return []
      }
    },
    currentDate: { // 当天的时间
      type: String,
      default: null
    },
    currentPlayTime: { // 当前播放时间(秒)
      type: Number,
      default: 0
    },
    stop: { // 停止
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      boxWidth: 0,
      boxHeight: 0,
      boxTop: 0,
      boxLeft: 0,
      secondTimes: 86400, // 总秒数
      tipX: 0,
      tipTime: null,
      barX: 0
    }
  },
  watch: {
    currentDate() {
      this.drawSourcesBar()
    },
    sources() {
      this.drawSourcesBar()
    },
    currentPlayTime() {
      // 当前秒转距离
      if (this.currentPlayTime) {
        this.barX = this.currentPlayTime / this.secondTimes * this.boxWidth
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.boxWidth = this.$refs.playSliderBox.clientWidth
      this.boxHeight = this.$refs.playSliderBox.clientHeight
      this.boxTop = this.$refs.playSliderBox.getBoundingClientRect().top
      this.boxLeft = this.$refs.playSliderBox.getBoundingClientRect().left
    }, 500)
  },
  methods: {
    // 生成时间轴时间段
    drawSourcesBar() {
      const dayFirst = new Date(`${this.currentDate} 00:00:00`).getTime() / 1000
      if (this.sources && this.sources.length > 0) {
        this.sources.forEach((item, index) => {
          // 左侧距离 = 当前时间轴总宽度 * 当时间段的开始时间 / 一天秒数
          const left = this.$refs.playSliderBox.clientWidth * ((item.stime - dayFirst) / 86400)
          // 宽度 = 当前时间轴总宽度 * 当时间段的结束时间 / 一天秒数 - 左侧距离
          const width = (this.$refs.playSliderBox.clientWidth * ((item.etime - dayFirst) / 86400)) - left
          const startDate = this.getDateObject(item.stime)
          const endDate = this.getDateObject(item.etime)
          this.$set(this.sources[index], 'width', width)
          this.$set(this.sources[index], 'left', left)
          this.$set(this.sources[index], 'startHour', startDate.hour)
          this.$set(this.sources[index], 'startMinute', startDate.minute)
          this.$set(this.sources[index], 'startSecond', startDate.second)
          this.$set(this.sources[index], 'endHour', endDate.hour)
          this.$set(this.sources[index], 'endMinute', endDate.minute)
          this.$set(this.sources[index], 'endSecond', endDate.second)
        })
      }
    },
    // 距离转换秒
    distanceToTime(distance) {
      return distance / this.boxWidth * this.secondTimes
    },
    // 距离转换时分秒
    distanceToHMS(distance) {
      const currentPositionTimes = (distance / this.boxWidth) * this.secondTimes
      const currentHour = parseInt(currentPositionTimes / 60 / 60)
      const currentMinute = parseInt(currentPositionTimes / 60 % 60)
      const currentSecond = parseInt(currentPositionTimes / 60 / 60 % 60)
      return (currentHour < 10 ? '0' + currentHour : currentHour) + ':' + (currentMinute < 10 ? '0' + currentMinute : currentMinute) + ':' + (currentSecond < 10 ? '0' + currentSecond : currentSecond)
    },
    // 鼠标悬停在时间轴上
    getPosition(event) {
      // 将x转换成时间
      const x = event.pageX - this.boxLeft
      this.tipX = x
      this.tipTime = this.distanceToHMS(x)
    },
    // 鼠标在一整条时间轴摁下
    playBarMoveDown(event) {},
    // 鼠标在一整条时间轴抬起
    playBarMouseUp(event) {
      const x = event.pageX
      this.barX = x - this.boxLeft
      this.currentChangePlayTime()
    },
    // 鼠标在指针摁下
    playIngMouseDown() {
      document.addEventListener('mousemove', this.movePlayIngBar)
      document.addEventListener('mouseup', this.upPlayIngBar)
    },
    // 鼠标在指针摁下
    playIngMouseUp() {},
    // 鼠标在指针悬停
    playIngMouseMove() {},
    movePlayIngBar(event) {
      const x = event.pageX
      this.barX = (x > this.boxLeft ? (x > (this.boxLeft + this.boxWidth) ? (this.boxLeft + this.boxWidth) : x) : this.boxLeft) - this.boxLeft
    },
    upPlayIngBar() {
      document.removeEventListener('mousemove', this.movePlayIngBar)
      document.removeEventListener('mouseup', this.upPlayIngBar)
      this.currentChangePlayTime()
    },
    currentChangePlayTime() {
      const blockIdx = this.sources.findIndex(item => this.barX >= item.left && this.barX <= item.left + item.width)
      if (blockIdx !== -1) {
        // const date = getNowDate('object')
        // const currentBlockSeconds = this.sources[blockIdx].etime - new Date(`${date.Y}-${date.M}-${date.D} ${this.distanceToHMS(this.barX)}`).getTime() / 1000 // 当前指针在时间段的第几秒
        // this.$emit('currentChangePlayTime', { ...this.sources[blockIdx], index: blockIdx, currentBlockSeconds, sliderType: 'label' })
      }
    },
    getDateObject(seconds) {
      const date = new Date(seconds * 1000)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      return {
        year, month, day, hour, minute, second
      }
    },
    secondToHour(msd) {
      let second = parseInt(msd) // 秒
      let minute = 0 // 分
      let hour = 0 // 小时
      if (second > 60) {
        minute = parseInt(second / 60)
        second = parseInt(second % 60)
        if (minute > 60) {
          hour = parseInt(minute / 60)
          minute = parseInt(minute % 60)
        }
      }
      return {
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: parseInt(second)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tip, .play-slider-tip{
  position: absolute;
  left:50%;
  transform: translateX(-50%);
  display: none;
  font-size: 10px;
  background: #FFFFFF;
}
.play-slider-box{
  position: relative;
  width: 100%;
  height: 12px;
  background: #333;
}
.play-slider-progress, .play-slider-block{
  position: absolute;
  top:0;
  left: 0;
}
.play-slider-progress{
  height:100%;
  background: #ca1818;
  cursor: auto;
}
.play-slider-box:hover{
  .play-slider-tip{
    display: block;
    top:-30px;
    padding: 5px 10px;
  }
}
.play-slider-progress:hover{
  .tip{
    display: block;
    background: #fff;
    color: #000000;
    padding: 5px 10px;
    top:-30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }
}

.play-slider-block{
  width: 2px;
  top: -5px;
  bottom: -5px;
  background: #ca1818;
  left:0;
  cursor: move;
  position: absolute;
}

</style>
