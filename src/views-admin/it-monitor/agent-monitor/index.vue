<template>
  <div class="app-container">
    <div class="detail-header">
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="" name="gateway-list">
          <span slot="label" class="g-style">主机列表<span class="num">({{ gatewayCount }})</span></span>
          <gateway-list v-if="activeTabName === 'gateway-list'" @setGatewayCount="setGatewayCount" />
        </el-tab-pane>
        <el-tab-pane label="" name="host-list">
          <span slot="label" class="h-style">网关列表<span class="num">({{ hostCount }})</span></span>
          <host-list v-if="activeTabName === 'host-list'" @setHostCount="setHostCount" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import gatewayList from './component/gateway-list.vue'
import hostList from './component/host-list.vue'

export default {
  components: {
    gatewayList, hostList
  },
  data() {
    return {
      activeTabName: 'gateway-list',
      gatewayCount: '',
      hostCount: ''
    }
  },
  watch: {
    activeTabName: {
      handler(newVal) {
        console.log(newVal)
        this.localStorageOperation('set', 'tabName', newVal)
      },
      deep: true
    }
  },
  mounted() {
    this.findHyitHost()
    this.findHyitAgent()
    this.localStorageOperation('get', 'tabName') ? this.activeTabName = this.localStorageOperation('get', 'tabName') : this.activeTabName = 'gateway-list'
  },
  methods: {
    setGatewayCount(val) {
      this.gatewayCount = val
    },
    setHostCount(val) {
      this.hostCount = val
    },
    // 获取网关列表数量
    findHyitAgent() {
      this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { limit: -1, agentTypes: '1,8,10', ids: this.sessionStorageOperation('get', 'agentId'), agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        this.hostCount = res.data.length
      })
    },
    // 获取主机列表数量
    findHyitHost() {
      this.$request({
        url: this.api.itMonitor.findHyitHost, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.gatewayCount = res.data.length
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
  .detail-header {
    .g-style {
      font-size: 16px;
      font-weight: bold;
      .num {
        font-size: 14px;
        margin-left: 10px;
      }
    }
    .h-style {
      font-size: 16px;
      font-weight: bold;
      .num {
        font-size: 14px;
        margin-left: 10px;
      }
    }
  }
</style>
