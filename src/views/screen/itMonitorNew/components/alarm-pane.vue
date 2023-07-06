<template>
  <div ref="alarmPane" class="side-box" :style="{ 'height': paneHeight + 'px' }">
    <div class="side-title">最新告警</div>
    <div class="side-main">
      <AlarmCount />
      <AlarmEchart />
      <AlarmList />
    </div>
  </div>
</template>

<script>
import AlarmCount from '@/views/screen/itMonitorNew/components/alarm-count'
import AlarmEchart from '@/views/screen/itMonitorNew/components/alarm-echart'
import AlarmList from '@/views/screen/itMonitorNew/components/alarm-list'

export default {
  name: 'AlarmPane',
  components: {
    AlarmCount,
    AlarmEchart,
    AlarmList
  },
  data() {
    return {
      paneHeight: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('open-topo-alarm', () => {
      this.init()
    })
    this.$EventBus.$on('start-up-date', async () => {})
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-alarm,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = windowHeight - this.$refs.alarmPane.getBoundingClientRect().top - 20
      this.$store.dispatch('screen/setState', { stateName: 'alarmPaneHeight', stateData: this.paneHeight })
    }
  }
}
</script>

<style lang="scss" scoped>
.side-box {
  padding-right: 15px;
}
</style>
