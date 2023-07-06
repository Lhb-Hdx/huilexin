var timer = null
export default {
  data() {
    return {
      time: '',
      week: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$tool.ADCfullScreen()
    })
    timer = setInterval(() => {
      this.nextTime()
      this.setWeek()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(timer)
  },
  methods: {
    nextTime() { // 获取当前时间
      this.time = this.$tool.getNowDate('')
    },
    openfullScreen() {
      this.$tool.openBrowserFullScreen()
    },
    setWeek() {
      const week = new Date().getDay()
      switch (week) {
        case 1:
          this.week = '星期一'
          break
        case 2:
          this.week = '星期二'
          break
        case 3:
          this.week = '星期三'
          break
        case 4:
          this.week = '星期四'
          break
        case 5:
          this.week = '星期五'
          break
        case 6:
          this.week = '星期六'
          break
        default:
          this.week = '星期天'
          break
      }
    }
  }
}
