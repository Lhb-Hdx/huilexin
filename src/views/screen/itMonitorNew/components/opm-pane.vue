<template>
  <div ref="opmPane" class="side-box" :style="{ 'height': paneHeight + 'px' }">
    <div class="side-title">运维事项</div>
    <div class="side-main">
      <div class="echart-box">
        <OpmEchart echart-key="opmServerMatterEchart" echart-text="运维服务事项" :status-options="opmServerMatterEchartOptions" />
        <OpmEchart echart-key="opmGroupTaskEchart" echart-text="运维小组工作任务" :status-options="opmGroupTaskEchartOptions" />
      </div>
      <OpmMatterList :style="{ 'height': opmMatterListHeight + 'px' }" />
    </div>
  </div>
</template>

<script>
import OpmMatterList from '@/views/screen/itMonitorNew/components/opm-matter-list.vue'
import OpmEchart from '@/views/screen/itMonitorNew/components/opm-echart.vue'

export default {
  name: 'OpmPane',
  components: {
    OpmEchart,
    OpmMatterList
  },
  data() {
    return {
      paneHeight: '',
      opmServerMatterEchartOptions: [
        { value: 0, name: '待处理', color: '#6beef3', processState: 0 },
        { value: 0, name: '处理中', color: '#6ae696', processState: 1 },
        { value: 0, name: '待计划', color: '#dd4327', processState: 4 },
        { value: 0, name: '待审批', color: '#579ee3' },
        { value: 0, name: '待确认', color: '#f6c042', processState: 6 }
      ],
      opmGroupTaskEchartOptions: [],
      opmMatterListHeight: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('handler-top-project', () => {
      this.init()
    })
    this.$EventBus.$on('start-up-date', () => {
      this.init()
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-top-project,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = windowHeight - this.$refs.opmPane.getBoundingClientRect().top - 20

      this.opmMatterListHeight = this.paneHeight - (250 + 40 + 20)
    },
    async init() {
      const findOpsOrderProblemProcessStateStatistics = await this.$request({
        url: this.api.opm.findOpsOrderProblemProcessStateStatistics,
        data: {}
      })
      // 服务事项饼图数据
      if (findOpsOrderProblemProcessStateStatistics.code === 1 && findOpsOrderProblemProcessStateStatistics.map) {
        findOpsOrderProblemProcessStateStatistics.map.count.forEach(item => {
          const idx = this.opmServerMatterEchartOptions.findIndex(el => +el.processState === +item.processState)
          if (idx !== -1) this.$set(this.opmServerMatterEchartOptions[idx], 'value', item.processStateCount)
        })
      }
      const findApprove = await this.$request({ url: this.api.approve.findApprove, data: { limit: 1, page: 1, approveType: 496 } })
      if (findApprove.code === 1 && findApprove.data && findApprove.data.length > 0) {
        const idx = this.opmServerMatterEchartOptions.findIndex(el => !el.processState)
        if (idx !== -1) this.$set(this.opmServerMatterEchartOptions[idx], 'value', +findApprove.count)
      }

      // 运维小组服务饼图
      const findHrUserGroup = await this.$request({ url: this.api.sys.findHrUserGroup, data: { limit: -1 } })
      if (findHrUserGroup.code === 1 && findHrUserGroup.data) {
        findHrUserGroup.data.forEach(item => {
          this.$set(this.opmGroupTaskEchartOptions, this.opmGroupTaskEchartOptions.length, {
            value: 0,
            groupId: item.groupId,
            name: item.groupName,
            color: this.$tool.randomHexColor()
          })
        })
      }
      const countOpsOrderProblemByGroup = await this.$request({ url: this.api.opm.countOpsOrderProblemByGroup, data: { limit: -1, processStates: '0,1,4,5' } })
      if (countOpsOrderProblemByGroup.code === 1 && countOpsOrderProblemByGroup.data) {
        countOpsOrderProblemByGroup.data.forEach(item => {
          const idx = this.opmGroupTaskEchartOptions.findIndex(el => +el.groupId === +item.groupId)
          if (idx !== -1) this.$set(this.opmGroupTaskEchartOptions[idx], 'value', item.count)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.side-box {
  padding-left: 15px;
  .echart-box {
    padding: 15px 0;
  }
}
</style>
