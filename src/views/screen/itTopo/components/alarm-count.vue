<template>
  <div class="alarm-count">
    <div class="count-box-item">
      <div class="val">{{ alarmCount.wait }}</div>
      <div class="tit">待处理</div>
    </div>
    <div class="count-box-item">
      <div class="val">{{ alarmCount.confirm }}</div>
      <div class="tit">处理中</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlarmCount',
  data() {
    return {
      alarmCount: {
        wait: 0,
        confirm: 0
      },
      hostIds: []
    }
  },
  mounted() {
    this.$EventBus.$on('open-topo-alarm', async () => {
      this.hostIds = await this.$store.dispatch('screen/getNodeHostIds')
      await this.getAlarmData()
    })
    this.$EventBus.$on('start-up-date', async () => {
      await this.getAlarmData()
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-alarm,start-up-date')
  },
  methods: {
    async getAlarmData() {
      if (this.hostIds.length === 0) return
      // 待处理
      const waitLog = await this.$request({ url: this.api.itMonitor.findZbxAlarmLog, data: { status: 0, limit: 1, hostIds: this.hostIds.toString() } })
      if (waitLog.code === 1) {
        this.$set(this.alarmCount, 'wait', +waitLog.count)
      }

      // 处理中
      const confirmLog = await this.$request({ url: this.api.itMonitor.findZbxAlarmLog, data: { status: 4, limit: 1, hostIds: this.hostIds.toString() } })
      if (confirmLog.code === 1) {
        this.$set(this.alarmCount, 'confirm', +confirmLog.count)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-count {
  display: flex;
  text-align: center;
  .count-box-item {
    flex: 1;
    .val {
      font-size: 24px;
      margin: 25px auto 15px;
      font-weight: bold;
      background-image: -webkit-linear-gradient(bottom,#00BFFF,#08F2F5,#ffffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tit {
      line-height: 25px;
      background: #0A113B;
      color: #99E5FF;
    }
  }
}
</style>
