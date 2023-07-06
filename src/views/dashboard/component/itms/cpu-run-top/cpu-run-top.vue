<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100 no-padding">
    <div class="box-item-content content-height-400">
      <div class="item-content-header">
        <div class="title">CPU运行TOP5</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-body">
        <div class="percentage-list">
          <div v-for="(item, index) in agentGetHostList" :key="index" class="percentage-list-item pointer" @click="toPage(item)">
            <div class="list-item-title">{{ item.hostName }}</div>
            <el-progress :percentage="item.itemValue" :color="index === 0 ? '#FF8000' : '#00B285'" :stroke-width="9" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { compareJson } from '@/utils/utils'
import {isArray} from '@/utils/validate'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import { getUserSession } from '@/utils/auth'
import { mapGetters } from 'vuex'

export default {
  name: 'CpuRunTop',
  components: {},
  props: {
    agentId: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'cpuRunTop',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      agentGetHostList: [],
      data: [],
      loading: true,
      load: true,
      timeCall: ''
    }
  },
  computed: {
    ...mapGetters(['wsStatus'])
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })

    const wsToken = this.sessionStorageOperation('get', 'wsToken')
    if (wsToken && this.load) {
      this.findHyitAgent()
    }

    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostData-websocket' && res.detail.data.methed === 'getHostCpuData') {
        const parse = JSON.parse(res.detail.data.getHostCpuData)
        if (isArray(parse)) {
          parse.forEach(item => {
            if (item.itemName.indexOf('CPU utilization') !== -1 || item.itemName.indexOf('CPU使用率') !== -1) {
              const getCpuIndex = this.data.findIndex(getCpuItem => getCpuItem.hostName === item.hostName)
              if (getCpuIndex === -1) {
                this.data.push(item)
              }
            }
          })
        }
        const compare = this.data.sort(compareJson('itemValue'))
        compare.forEach(item => {
          item.itemValue = Number(Number(item.itemValue).toFixed(0))
        })
        this.agentGetHostList = compare.slice(0, 5)
        this.loading = false
      }
    })

    window.addEventListener('loginWsSuccess', () => {
      this.findRequest()
    })
  },
  methods: {
    findRequest() {
      if (this.wsStatus === 1 && this.load && this.agentId) {
        this.load = false
        this.findHyitAgent()
      }
    },
    // 获取网关
    findHyitAgent() {
      if (this.agentId) {
        let agentIdList = this.agentId.split(',')
        this.agentGetHost(agentIdList)
      } else {
        request({
          url: api.itMonitor.findHyitAgent,
          data: { agentType: 1, page: 1, limit: -1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
        }).then(res => {
          if (res.code === 1) {
            if (res.data.length > 0) {
              let agentIdList = []
              res.data.forEach(item => {
                agentIdList.push(item.id)
              })
              this.agentGetHost(agentIdList)
            }
          }
        })
      }
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    // 获取当前网关的CPU运行情况
    async agentGetHost(agentIdList) {
      agentIdList.forEach(item => {
        this.agentGetHostData(item)
      })
    },
    // 获取CPUtop数据
    agentGetHostData(val) {
      this.loading = true
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostData,
        data: {
          token: wsToken,
          methed: 'getHostCpuData',
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          agent: String(val)
        }
      },
      () => {
      },
      (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    // 更改显示配置
    changemodelDefine(val) {
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      }
    },
    // 跳转
    async toPage(item) {
      const host = await request({
        url: api.itMonitor.findHyitHost,
        data: { zhostId: item.hostid }
      })
      if (host.code === 1 && host.data.length > 0) {
        const { data } = await request({
          url: api.common.findSysDictionaryDetail,
          data: { dictCode: 'it_sub_dev_type', limit: -1, ids: host.data[0].subdevTypeId }
        })
        this.$router.push({
          name: 'ResourceMonitorDetail',
          query: {
            id: host.data[0].hyHostId || 0,
            zbxHostId: host.data[0].hyZhostId,
            agent: host.data[0].agent,
            devTypeId: host.data[0].hyDevTypeId,
            subType: data && data.length > 0 ? data[0].dictdataValue : '',
            hySubdevTypeId: host.data[0].hySubdevTypeId && host.data[0].hySubdevTypeId > 0 ? host.data[0].hySubdevTypeId : ''
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.item-content-body {
  .percentage-list {
    .percentage-list-item {
      margin: 30px 0;
      .list-item-title {
        color: #333333;
        font-size: 14px;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
