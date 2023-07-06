<template>
  <div class="statistics-count">
    <StatisticsCountEchart echart-key="device" :status-options="deviceEchartOptions" />
    <StatisticsCountEchart echart-key="line" :status-options="lineEchartOptions" />
  </div>
</template>

<script>
import StatisticsCountEchart from '@/views/screen/itTopo/components/statistics-count-echart'

export default {
  name: 'StatisticsCount',
  components: {
    StatisticsCountEchart
  },
  data() {
    return {
      deviceEchartOptions: [],
      lineEchartOptions: []
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-statistical')
  },
  mounted() {
    this.$EventBus.$on('open-topo-statistical', async () => {
      const agentGetTopStatic = await this.agentGetTopStatic()
      if (agentGetTopStatic.code === 1 && agentGetTopStatic.model) {
        const model = JSON.parse(agentGetTopStatic.model)
        const itemOnCount = +model.itemCount - +model.itemOfflineCount
        this.deviceEchartOptions = [
          { value: itemOnCount, name: '正常设备', color: '#59cbf7', alarmCountPercentage: this.$tool.getPercent(+itemOnCount, +model.itemCount) },
          { value: +model.itemOfflineCount, name: '异常设备', color: '#FE4D4E', alarmCountPercentage: this.$tool.getPercent(+model.itemOfflineCount, +model.itemCount) }
        ]
        const itemOnlineCount = +model.itemLinkCount - +model.itemLinkOffCount
        this.lineEchartOptions = [
          { value: itemOnlineCount, name: '正常链路', color: '#59cbf7', alarmCountPercentage: this.$tool.getPercent(+itemOnlineCount, +model.itemLinkCount) },
          { value: +model.itemLinkOffCount, name: '异常链路', color: '#FE4D4E', alarmCountPercentage: this.$tool.getPercent(+model.itemLinkOffCount, +model.itemLinkCount) }
        ]
      }
    })
  },
  methods: {
    async agentGetTopStatic() {
      return await this.$request({
        url: this.api.itMonitor.agentGetTopStatic,
        data: { topId: this.$store.getters.currentTopoInfo.id }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-count {
  padding: 30px 0 15px;
}
</style>
