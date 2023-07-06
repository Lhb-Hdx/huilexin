<template>
  <el-dialog title="全局扫描" :visible.sync="showDialog" top="5vh" width="60%">
    <div slot="title">
      全局扫描
      <div class="header-form">
        <el-select
          v-model="agentItemId"
          size="mini"
          filterable
          placeholder="请选择网关"
          class="filter-item"
          @change="changeAgent"
        >
          <el-option
            v-for="item in agentList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <el-select
          v-if="showChildrenAgentItem"
          v-model="childrenAgentItemId"
          size="mini"
          filterable
          placeholder="请选择下级网关"
          class="filter-item"
        >
          <el-option
            v-for="item in childrenAgentList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <el-button :loading="loading" size="mini" class="filter-item" type="primary" @click="startScanning">开始扫描</el-button>
      </div>
    </div>
    <span class="explain"><span>*</span>请先选择网关，实际连接状态为连接的，但扫描结果为未连接，可更改网关重新扫描。</span>
    <div class="dialog">
      <div v-if="(showWsRes[0].index + 1) === showWsRes[0].total" class="speed">
        <div class="words">扫描结束</div>
        <div class="piex">
          <el-progress type="circle" :stroke-width="10" :percentage="Number(((ststueNum / showWsRes[0].total)*100).toFixed(2))" :width="290" color="#00b285" />
        </div>
        <div class="word">总扫描: <a>{{ showWsRes[0].total }}</a></div>
        <div class="word">可用：<a>{{ ststueNum }}</a></div>
        <div class="word">已用：<a>{{ noStstueNum }}</a></div>
      </div>
      <div v-else class="picture">
        <div class="jx">
          <div class="L_transform">
            <div class="trans_bg">
              <div class="bg_shade" />
              <div class="heart_box">
                <div class="heart" />
                <div v-if="startScan" class="shan" style="transform: rotate(274deg);" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="startScan || showWsRes[0].total !== 0">
          <div class="scanning">扫描中......</div>
          <div v-if="showWsRes[0].total === 0" class="scanning">{{ 0 }}%</div>
          <div v-else class="scanning">{{ (((showWsRes[0].index + 1)/(showWsRes[0].total))*100).toFixed(0) }}%</div>
        </div>
      </div>
      <div class="dataList">
        <el-table
          :data="showWsResList"
          style="width: 100%"
        >
          <el-table-column label="ip地址" prop="ip" show-overflow-tooltip align="center">
            <template slot-scope="{row}">
              {{ row.ip }}
            </template>
          </el-table-column>

          <el-table-column label="连接状态" prop="ping" show-overflow-tooltip align="center">
            <template slot-scope="{row}">
              {{ pingStatue(row.ping) }}
            </template>
          </el-table-column>

          <el-table-column label="可用状态" prop="ping" show-overflow-tooltip align="center">
            <template slot-scope="{row}">
              <span :style="{ color: setStatusColor(row.useStatue) }"> {{ setStatue(row.useStatue) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import {getUserSession} from '@/utils/auth'
import {sendWebsocket} from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import {isJSONString} from '@/utils/utils'

export default {
  name: 'IpScanningDialog',
  props: {
    netSegmentIds: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showDialog: false,
      loading: false,
      showWsRes: [{ index: 0, total: 0 }],
      showWsResList: [],
      ststueNum: 0,
      noStstueNum: 0,
      stopStstueNum: 0,
      // showResTotal: [],
      // showSuccess: 0,
      showRes: [{
        id: '',
        index: 0,
        ip: '',
        ping: '',
        total: 2
      }],
      startScan: false,
      pingStatueList: [
        { value: 1, label: '连接' },
        { value: 0, label: '未连接' }
      ],
      useStatue: [
        { value: 1, label: '已用', bg: '#00b285', color: 'red' },
        { value: 2, label: '可用', bg: '#d6d6d6', color: '#00B25F' },
        { value: 3, label: '禁用', bg: '#fe6162', color: 'red' }
      ],
      agentList: [],
      agentItem: {},
      agentItemId: '',
      childrenAgentItem: {},
      childrenAgentItemId: '',
      childrenAgentList: [],
      showChildrenAgentItem: false,
      agentsIds: '',
      // netSegmentIds: '',
      selectSubNetId: {}
    }
  },
  computed: {
    // 设置连接状态
    pingStatue() {
      return function(val) {
        const idx = this.pingStatueList.findIndex(item => item.value === Number(val))
        if (idx !== -1) {
          return this.pingStatueList[idx].label
        }
      }
    },
    // 设置状态
    setStatue() {
      return function(val) {
        const idx = this.useStatue.findIndex(item => item.value === val)
        if (idx !== -1) {
          return this.useStatue[idx].label
        }
      }
    },
    setStatusColor() {
      return function(val) {
        const idx = this.useStatue.findIndex(item => item.value === Number(val))
        if (idx !== -1) {
          return this.useStatue[idx].color
        }
      }
    }
  },
  async mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentList = await this.findHyitAgent('1,8')
    if (this.agentList.length > 0) {
      this.agentItemId = this.agentList[0].id
      this.agentItem = this.agentList[0]
      if (this.agentItem.agentType === 8) {
        this.showChildrenAgentItem = true
        this.childrenAgentList = await this.findHyitAgent('1')
        if (this.childrenAgentList.length > 0) {
          this.childrenAgentItemId = this.childrenAgentList[0].id
          this.childrenAgentItem = this.childrenAgentList[0]
        }
        this.$EventBus.$emit('change-agent', this.childrenAgentList[0].id)
      } else {
        this.$EventBus.$emit('change-agent', this.agentList[0].id)
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true
      this.$nextTick(() => {
        this.startScan = false
        this.showWsRes = [{ index: 0, total: 0 }]
        this.showWsResList = []
        this.showRes[0].index = 0
        this.ststueNum = 0
        this.noStstueNum = 0
        this.stopStstueNum = 0
        this.showRes[0].total = 2
      })
    },
    startScanning() {
      this.startScan = true
      this.loading = true
      this.showWsRes = [{ index: 0, total: 0 }]
      this.showWsResList = []
      this.showRes[0].index = 0
      this.ststueNum = 0
      this.noStstueNum = 0
      this.stopStstueNum = 0
      this.showRes[0].total = 2
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()

      const socketData = {
        token: wsToken,
        companyId: String(getUserSessionResult.companyId),
        appId: String(getUserSessionResult.appId),
        netSegmentIds: String(this.netSegmentIds && this.netSegmentIds > 0 ? this.netSegmentIds : ''),
        ipIds: ''
      }
      if (this.agentItem.agentType === 8) {
        socketData.agent = this.childrenAgentItem.id
      } else {
        socketData.agent = this.agentItem.id
      }
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.ansiblePingIp,
        data: socketData
      },
      (res) => {
        this.loading = false
        const wsRes = isJSONString(res.data) ? JSON.parse(res.data) : res.data
        if (wsRes) {
          this.$set(this.showWsRes, 0, wsRes)
          this.$set(this.showRes, 0, wsRes)
          this.showWsResList.push(wsRes)
          if (Number(wsRes.useStatue) === 2) {
            this.ststueNum = this.ststueNum + 1
          } else if (Number(wsRes.useStatue) === 1) {
            this.noStstueNum = this.noStstueNum + 1
          } else if (Number(wsRes.useStatue) === 3) {
            this.stopStstueNum = this.stopStstueNum + 1
          }
          // this.findSubNetVal()
        }
      }, (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    async findHyitAgent(agentTypes) {
      const res = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentTypes, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (res.code !== 1) return
      return res.data
    },
    async changeAgent(val) {
      const idx = this.agentList.findIndex(item => Number(item.id) === Number(val))
      if (idx === -1) return
      this.agentItem = this.agentList[idx]
      if (this.agentList[idx].agentType === 8) {
        this.childrenAgentList = await this.findHyitAgent('9')
        this.showChildrenAgentItem = true
        if (this.childrenAgentList.length > 0) {
          this.childrenAgentItemId = this.childrenAgentList[0].id
          this.childrenAgentItem = this.childrenAgentList[0]
        }
      } else {
        this.childrenAgentList = []
        this.childrenAgentItem = {}
        this.childrenAgentItemId = ''
        this.showChildrenAgentItem = false
      }
    }
    // 查询子网信息
    // async findSubNetVal(val) {
    //   this.showSuccess = 0
    //   const res = await this.findOpsIpAddressDetail({
    //     netSegments: this.selectSubNetId.netSegment,
    //     page: 1,
    //     limit: -1
    //   })
    //   if (res.code === 1) this.showResTotal[0] = res.data
    //   this.showResTotal[0].forEach(item => {
    //     if (item.pingStatue === 1) {
    //       this.showSuccess = this.showSuccess + 1
    //     }
    //   })
    // },
    // 查询子网详情
    // async findOpsIpAddressDetail(query) {
    //   return await request({ url: api.ipAddressManage.findOpsIpAddressDetail, data: query })
    // }
  }
}
</script>

<style lang="scss" scoped>
.jx {
  width: 375px;
  height: 375px;
  margin-top: 0;
  .L_transform {
    float: left;
    width: 375px;
    height: 310px;
    margin-top: 35px;
    .trans_bg {
      position: relative;
      float: left;
      margin-left: 26px;
      width:300px;
      height:300px;
      .bg_shade {
        background: url(../../../../public/image/scanning/quan_bg.png) no-repeat;
        width: 419px;
        height: 390px;
        position: absolute;
        left: -56px;
        top: -39px;
      }
      .heart_box {
        width: 301px;
        display: inline-block;
        height: 300px;
        .heart {
          position:absolute;
          width:88px;
          height:88px;
          background: url(../../../../public/image/scanning/quan_circle.png) no-repeat;
          left: 105px;
          top: 105px;
        }
        .shan {
          width: 211px;
          height: 129px;
          background: url(../../../../public/image/scanning/quan_rotate.png) no-repeat;
          top: 25px;
          left: 42px;
          position: absolute;
          -webkit-transform-origin: 107px 124px;
          transform-origin: 108px 124px;
          transform: rotate(0deg);
          animation: radar 5s linear infinite;
        }
      }
    }
  }
}

@keyframes radar {
  0%{
    transform: rotate(0deg);
  }
  50%{
    transform: rotate(180deg);
  }
  100%{
    transform: rotate(360deg);
  }
}
.explain {
  border: 3px solid orange;
  padding: 6px;
  margin:0 0 10px 0;
  font-weight: 700;
  display: inline-block;
  width: 100%;
  span {
    margin-left:  5px;
    color: red;
  }
}
.dialog {
  display: flex;
  .picture {
    width: 375px;
    height: 600px;
  }
  .scanning {
    width: 100%;
    font-size: 24px;
    margin-top: 10px;
    text-align:center;
  }
  .dataList {
    width: calc(100% - 375px);
    height: 600px;
    overflow:auto;
  }
  .speed {
    width: 375px;
    height: 600px;
    .piex {
      text-align:center;
      margin: 20px 0 40px -20px;
    }
    .words {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: -10px;
      font-size: 20px;
    }
    .word {
      width: 100%;
      font-size: 20px;
      margin-top: 10px;
      margin-left: -10px;
      text-align:center;
      a {
        font-size: 24px;
      }
    }
  }
}
.header-form {
  margin-left: 10px;
  display: inline-block;
  .filter-item {
    margin-right: 10px;
  }
}
</style>
