<template>
  <div ref="playSliderBox" class="play-slider-box" @mousemove="getPosition($event)">
    <div v-for="(item,index) in sources" :key="index" class="play-slider-progress" :style="{left : item.left + 'px' , width : item.width + 'px'}" />
    <div class="play-slider-tip" :style="{left : tipX + 'px'}">{{ tipTime }}</div>
  </div>
</template>

<script>
export default {
  name: 'VideoAlarmSlider',
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
          const left = this.$refs.playSliderBox.clientWidth * (((new Date(`${item.alarmTime}`).getTime() / 1000) - dayFirst) / 86400)
          this.$set(this.sources[index], 'width', 2)
          this.$set(this.sources[index], 'left', left)
        })
      }
    },
    // 鼠标悬停在时间轴上
    getPosition(event) {
      // 将x转换成时间
      const x = event.pageX - this.boxLeft
      this.tipX = x
      this.tipTime = this.distanceToHMS(x)
    },
    // 距离转换时分秒
    distanceToHMS(distance) {
      const currentPositionTimes = (distance / this.boxWidth) * this.secondTimes
      const currentHour = parseInt(currentPositionTimes / 60 / 60)
      const currentMinute = parseInt(currentPositionTimes / 60 % 60)
      const currentSecond = parseInt(currentPositionTimes / 60 / 60 % 60)
      return (currentHour < 10 ? '0' + currentHour : currentHour) + ':' + (currentMinute < 10 ? '0' + currentMinute : currentMinute) + ':' + (currentSecond < 10 ? '0' + currentSecond : currentSecond)
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
  background: chocolate;
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
  background: chocolate;
  left:0;
  cursor: move;
  position: absolute;
}

</style>
