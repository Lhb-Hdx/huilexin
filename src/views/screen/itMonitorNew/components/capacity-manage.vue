<template>
  <div ref="sideBox" class="side-box" :style="{ 'height': paneHeight + 'px' }">
    <div class="side-title">容量管理</div>
    <div class="side-main" :style="{ 'height': sideBoxWidth + 'px' }">
      <div class="scroll" :style="{ 'width': capacityScrollWidth + 'px', 'height': capacityItemWidth + 30 + 'px' }">
        <div v-for="item in cabinetList" :key="item.cabinetId" class="capacity-item" :style="{ 'width': capacityItemWidth + 'px', 'height': capacityItemWidth + 40 + 'px' }">
          <el-progress type="circle" :percentage="setAvailability(item)" :format="format" :width="capacityItemWidth" class="capacity-progress" />
          <div class="cabinet-name overflow-text-a">{{ item.name }}</div>
        </div>
        <div class="svg-box" style="height: 0">
          <svg width="100%" height="100%">
            <defs>
              <linearGradient id="cabinetLine" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: #13A2E8" stop-opacity="1" />
                <stop offset="100%" style="stop-color: #08F2F5" stop-opacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CapacityManage',
  data() {
    return {
      paneHeight: '',
      cabinetList: [],
      capacityItemWidth: '',
      capacityScrollWidth: '',
      sideBoxWidth: ''
    }
  },
  computed: {
    // 可用度百分比
    setAvailability() {
      return function(row) {
        return Math.floor((row.availableCount / (row.availableCount + row.usedCount)) * 100)
      }
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
      this.paneHeight = ((windowHeight - 150) / 100) * 30

      const sideBoxWidth = this.$refs.sideBox.clientWidth
      this.sideBoxWidth = this.$refs.sideBox.clientHeight - 50
      this.capacityItemWidth = (sideBoxWidth / 100) * 25
      this.capacityScrollWidth = (this.cabinetList.length + 1) * (this.capacityItemWidth + 14 + 30)
    },
    // 初始化
    async init() {
      const findDiagramCabinet = await this.findDiagramCabinet()
      if (findDiagramCabinet.code !== 1 && !findDiagramCabinet.data) return
      const cabinetIds = []
      findDiagramCabinet.data.forEach(item => cabinetIds.push(item.cabinetId))
      const getDiagramCabinetStatistics = await this.getDiagramCabinetStatistics({ cabinetIds: cabinetIds.toString() })
      if (getDiagramCabinetStatistics.code === 1 && getDiagramCabinetStatistics.model) {
        const getDiagramCabinetStatisticsModel = JSON.parse(getDiagramCabinetStatistics.model)
        findDiagramCabinet.data.forEach(item => {
          const idx = getDiagramCabinetStatisticsModel.findIndex(el => +el.cabinetId === +item.cabinetId)
          if (idx !== -1) {
            item.availability = getDiagramCabinetStatisticsModel[idx].availability
            item.availableCount = getDiagramCabinetStatisticsModel[idx].availableCount
            item.usedCount = getDiagramCabinetStatisticsModel[idx].usedCount
          }
        })
      }
      this.cabinetList = findDiagramCabinet.data
      this.$nextTick(() => {
        for (let i = 0; i < this.cabinetList.length; i++) {
          this.svgColor(i, this.setAvailability(this.cabinetList[i]))
        }
        this.setSize()
      })
    },
    // 查询机柜
    async findDiagramCabinet() {
      return await this.$request({url: this.api.diagram.findDiagramCabinet, data: { limit: -1 }})
    },
    // 查询机柜统计
    async getDiagramCabinetStatistics(query) {
      return await this.$request({url: this.api.diagram.getDiagramCabinetStatistics, data: query})
    },
    svgColor(i, percentage) {
      const progress = document.getElementsByClassName('capacity-progress')[i]
      const svg = progress.querySelector('svg > path:nth-child(2)')
      svg.style.stroke = 'url(#cabinetLine)'
    },
    // 环内显示的内容
    format(percentage) {
      return `${percentage}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.side-main {
  overflow-x: auto;
  overflow-y:  hidden;
  position: relative;
  .scroll {
    position: absolute;
    top: 50%;
    .capacity-item {
      display: inline-block;
      margin: 14px;
      transform: translateY(-50%);
      .cabinet-name {
        padding: 10px;
        text-align: center;
      }
    }
  }
}
</style>
