<template>
  <div class="side-box" :style="{ 'height': paneHeight + 'px' }">
    <div class="side-title">IP资源</div>
    <div class="side-main">
      <div ref="countText" class="count-text">IP总数：{{ ip.count }}</div>
      <div class="ip-use">
        <span class="use" :style="{ 'width': ip.use + '%' }"><em>已用：{{ ip.use }}</em></span>
        <span class="free" :style="{ 'width': ip.free + '%' }"><em>可用：{{ ip.free }}</em></span>
      </div>
      <div class="ip-list" :style="{ 'height': ipListHeight + 'px' }">
        <div v-for="item in ipAddressNetSegment" :key="item.id" class="list-item">
          <div class="item-text">{{ item.netSegment }} / {{ item.maskBit }}</div>
          <div class="percentage-bar">
            <div class="bar-value" :style="{ 'width': setPercentage(item) + '%' }" />
          </div>
          <div class="percentage-text">{{ setPercentage(item) }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IpaddressResource',
  data() {
    return {
      paneHeight: '',
      ip: {
        count: 0,
        use: 0,
        useWidth: 0,
        free: 0,
        freeWidth: 0
      },
      ipAddressNetSegment: [],
      ipListHeight: ''
    }
  },
  computed: {
    setPercentage() {
      return function(val) {
        return Number((((val.ipUsedCount === null ? 0 : val.ipUsedCount) / (val.ipCount === null ? 0 : val.ipCount)) * 100).toFixed(2))
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
    this.$EventBus.$on('start-up-date', async () => {
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
      this.paneHeight = ((windowHeight - 150) / 100) * 35

      const countTextHeight = this.$refs.countText.clientHeight
      this.ipListHeight = this.paneHeight - (countTextHeight + 60 + 40)
    },
    // 初始化
    async init() {
      // 统计数量
      const findOpsIpAddressDetailCount = await this.findOpsIpAddressDetailCount()
      const netSegmentIds = []
      if (findOpsIpAddressDetailCount.code === 1 && findOpsIpAddressDetailCount.map) {
        this.$set(this.ip, 'count', findOpsIpAddressDetailCount.map.ip[0].ipCount + findOpsIpAddressDetailCount.map.ip[1].ipCount)
        let ipCount = 0
        findOpsIpAddressDetailCount.map.ip.forEach(item => {
          ipCount += item.useStatue
        })
        findOpsIpAddressDetailCount.map.ip.forEach(item => {
          if (item.useStatue === 1) this.$set(this.ip, 'use', this.$tool.percentage(item.useStatue, ipCount))
          if (item.useStatue === 2) this.$set(this.ip, 'free', this.$tool.percentage(item.useStatue, ipCount))
        })
      }
      // 网段列表
      const findOpsIpAddressNetSegment = await this.findOpsIpAddressNetSegment()
      if (findOpsIpAddressNetSegment.code === 1 && findOpsIpAddressNetSegment.data) {
        findOpsIpAddressNetSegment.data.forEach(item => netSegmentIds.push(item.id))
      }
      if (netSegmentIds.length > 0) {
        const getOpsIpAddressDetailUsage = await this.getOpsIpAddressDetailUsage({ netSegmentIds: netSegmentIds.toString(), limit: -1 })
        if (getOpsIpAddressDetailUsage.code === 1 && getOpsIpAddressDetailUsage.map) {
          findOpsIpAddressNetSegment.data.forEach(item => {
            if (getOpsIpAddressDetailUsage.map[item.id].length > 0) {
              item.ipUsedCount = getOpsIpAddressDetailUsage.map[item.id][0].useCount ? Number(getOpsIpAddressDetailUsage.map[item.id][0].useCount) : 0
              item.ipDisableCount = getOpsIpAddressDetailUsage.map[item.id][0].total - item.ipUsedCount
            }
          })
        }
      }
      this.ipAddressNetSegment = findOpsIpAddressNetSegment.data
    },
    // 获取ip统计
    async findOpsIpAddressDetailCount() {
      return await this.$request({
        url: this.api.ipAddressManage.findOpsIpAddressDetailCount,
        data: {}
      })
    },
    // 查询网段列表
    async findOpsIpAddressNetSegment() {
      return await this.$request({
        url: this.api.ipAddressManage.findOpsIpAddressNetSegment,
        data: { limit: -1 }
      })
    },
    // 网段使用统计
    async getOpsIpAddressDetailUsage(query) {
      return await this.$request({
        url: this.api.ipAddressManage.getOpsIpAddressDetailUsage,
        data: query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.side-main {
  padding: 0 !important;
  .count-text {
    padding: 20px 12px 12px;
    font-size: 14px;
    color: #ffffff;
    font-weight: bold;
  }
  .ip-use {
    width: calc(100% - 24px);
    height: 10px;
    margin: 0 12px 50px;
    background: #222222;
    border: 1px solid #38404B;
    span {
      float: left;
      display: inline-block;
      position: relative;
      height: 10px;
      line-height: 30px;
      color: #ffffff;
      em {
        position: absolute;
        top: 15px;
        left: 0;
        font-size: 12px;
        color: #cccccc;
        font-style: normal;
      }
    }
    .use {
      background: linear-gradient(to right,#05723E, #0DAD8B);
    }
    .free {
      background: linear-gradient(to right,#1865C9, #12A7EB);
    }
  }
  .ip-list {
    overflow-y: auto;
    .list-item {
      height: 40px;
      line-height: 40px;
      padding-right: 15px;
      background: #0A113B;
      border-bottom: 1px solid #123788;
      display: flex;
      align-items: center;
      font-size: 12px;
      .item-text {
        width: 40%;
        text-indent: 12px;
        color: #ffffff;
      }
      .percentage-bar {
        width: 40%;
        padding: 15px 10px;
        .bar-value {
          display: block;
          height: 7px;
          overflow: hidden;
          line-height: 37px;
          background: linear-gradient(to right,#0B316E, #13A2E8,#08F2F5);
        }
      }
      .percentage-text {
        width: 20%;
        color: #08F2F5;
        text-align: right;
      }
    }
  }
}
</style>
