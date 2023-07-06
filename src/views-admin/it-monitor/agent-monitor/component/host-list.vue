<template>
  <div class="app-container">
    <div v-permission="['Search']" class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="请输入网关名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="agentList"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="网关名称" prop="name">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" label="IP地址" prop="ip">
          <template slot-scope="{row}">
            <span>{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="版本" prop="version">
          <template slot-scope="{row}">
            <span>{{ row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="类型" prop="version">
          <template slot-scope="{row}">
            <span>{{ setAgentType(row.agentType) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="状态" prop="statue">
          <template slot-scope="{row}">
            <el-tag :type="row.statue | statusTagFilter">
              {{ row.statue | statusTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="操作" class-name="small-padding fixed-width" width="400" align="center">
          <template slot-scope="{row}">
            <el-button v-permission="['Synchronization']" type="sycn" size="mini" :loading="asyncId === row.id" :disabled="row.statue === 0" @click="asyncAgent(row)">同步</el-button>
            <el-button v-permission="['Host']" type="primary" size="mini" :loading="asyncId === row.id" @click="tohost(row)">主机</el-button>
            <el-button v-permission="['Template']" type="primary" size="mini" :loading="asyncId === row.id" @click="totemplate(row)">模板</el-button>
            <el-button v-permission="['Configure']" type="primary" size="mini" :loading="asyncId === row.id" @click="tpconfigure(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="同步" :visible.sync="showDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <el-select v-if="agentType === 8" v-model="fromAgentData.id" placeholder="请选择类型" clearable class="filter-item syn" style="width: 200px">
          <el-option v-for="item in fromAgentList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-button :loading="loading" type="primary" @click="startSynchronization()">开始同步</el-button>
        <el-row :gutter="2">
          <el-form ref="form" :model="synchronizationList" label-width="110px" class="progress-bgc">
            <el-form-item label="主机" prop="deviceType">
              <div class="progress-box">
                <div class="progress"><el-progress :stroke-width="10" :percentage="hostData.percentage" /></div>
                <div class="progress-name">{{ hostData.name }}</div>
              </div>
            </el-form-item>
            <el-form-item label="模板" prop="deviceType">
              <div class="progress-box">
                <div class="progress"><el-progress :stroke-width="10" :percentage="tamplateData.percentage" /></div>
                <div class="progress-name">{{ tamplateData.name }}</div>
              </div>
            </el-form-item>
            <el-form-item label="监控项" prop="deviceType">
              <div class="progress-box">
                <div class="progress"><el-progress :stroke-width="10" :percentage="itemData.percentage" /></div>
                <div class="progress-name">{{ itemData.name }}</div>
              </div>
            </el-form-item>
            <el-form-item label="触发器" prop="deviceType">
              <div class="progress-box">
                <div class="progress"><el-progress :stroke-width="10" :percentage="triggerData.percentage" /></div>
                <div class="progress-name">{{ triggerData.name }}</div>
              </div>
            </el-form-item>
            <el-form-item label="主机监控项" prop="deviceType">
              <div class="progress-box">
                <div class="progress"><el-progress :stroke-width="10" :percentage="hostItemData.percentage" /></div>
                <div class="progress-name">{{ hostItemData.name }}</div>
              </div>
            </el-form-item>
            <el-form-item label="主机触发器" prop="deviceType">
              <div class="progress-box">
                <div class="progress"><el-progress :stroke-width="10" :percentage="hostTriggerData.percentage" /></div>
                <div class="progress-name">{{ hostTriggerData.name }}</div>
              </div>
            </el-form-item>
          </el-form>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onClose()">关 闭</el-button>
      </div>
    </el-dialog>
    <pagination v-show="listTotal>0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitAgent" />

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api' // secondary package based on el-pagination
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import { isJSONString } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import ListControl from '@/components/ListControl'

export default {
  name: 'SubSystem',
  components: { Pagination, ListControl },
  directives: { waves },
  filters: {
    statusTextFilter(status) {
      const statusMap = {
        '0': '离线',
        '1': '在线'
      }
      return statusMap[status] || '未知'
    },
    statusTagFilter(status) {
      const statusMap = {
        '0': 'info',
        '1': 'success'
      }
      return statusMap[status] || ''
    }
  },
  data() {
    return {
      loading: false,
      SynData: [],
      showDialog: false,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        ids: ''
      },
      form: {
        name: '',
        esightUrl: '',
        userName: '',
        pwd: '',
        agent: ''
      },
      listTotal: 0,
      agentList: [],
      asyncId: '',
      agentTypeList: [
        {id: 1, value: '采集器'},
        {id: 8, value: '下级中心'},
        {id: 10, value: '360采集器'}
      ],
      fromAgentList: [],
      fromAgentData: {
        id: '',
        fromAgentId: ''
      },
      agentType: '',
      synchronizationList: {},
      hostData: {percentage: 0, name: '', loading: false},
      tamplateData: {percentage: 0, name: '', loading: false},
      itemData: {percentage: 0, name: '', loading: false},
      triggerData: {percentage: 0, name: '', loading: false},
      hostItemData: {percentage: 0, name: '', loading: false},
      hostTriggerData: {percentage: 0, name: '', loading: false},
      // 显示控制数据 start
      checkList: ['网关名称', 'IP地址', '版本', '类型', '状态', '操作'],
      lists: [],
      storageVal: 'ip-address-gateway-list' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  computed: {
    setAgentType() {
      return function(val) {
        const idx = this.agentTypeList.findIndex(item => Number(item.id) === Number(val))
        if (idx !== -1) return this.agentTypeList[idx].value
      }
    }
  },
  mounted() {
    // 监控同步数据
    window.addEventListener('watchWsMessage', (res) => {
      switch (res.detail.data.type) {
        case 'host':
          this.setHostData(isJSONString(res.detail.data) ? JSON.parse(res.detail.data) : res.detail.data)
          break
        case 'tamplate':
          this.setTamplateData(isJSONString(res.detail.data) ? JSON.parse(res.detail.data) : res.detail.data)
          break
        case 'item':
          this.setItemData(isJSONString(res.detail.data) ? JSON.parse(res.detail.data) : res.detail.data)
          break
        case 'trigger':
          this.setTriggerData(isJSONString(res.detail.data) ? JSON.parse(res.detail.data) : res.detail.data)
          break
        case 'hostItem':
          this.setHostItemData(isJSONString(res.detail.data) ? JSON.parse(res.detail.data) : res.detail.data)
          break
        case 'hostTrigger':
          this.setHostTriggerData(isJSONString(res.detail.data) ? JSON.parse(res.detail.data) : res.detail.data)
          break
      }
    })
  },
  async created() {
    // this.$set(this.listQuery, 'ids', this.sessionStorageOperation('get', 'agentId'))
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findHyitAgent()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    setHostData(val) {
      this.hostData.percentage = Number(((+val.index / +val.total) * 100).toFixed(0))
      if (this.hostData.percentage !== 100) {
        this.hostData.name = val.name
      } else {
        this.hostData.name = '同步完成'
        this.hostData.loading = true
        this.setLoading()
      }
    },
    setTamplateData(val) {
      this.tamplateData.percentage = Number(((+val.index / +val.total) * 100).toFixed(0))
      if (this.tamplateData.percentage !== 100) {
        this.tamplateData.name = val.name
      } else {
        this.tamplateData.name = '同步完成'
        this.tamplateData.loading = true
        this.setLoading()
      }
    },
    setItemData(val) {
      this.itemData.percentage = Number(((+val.index / +val.total) * 100).toFixed(0))
      if (this.itemData.percentage !== 100) {
        this.itemData.name = val.name
      } else {
        this.itemData.name = '同步完成'
        this.itemData.loading = true
        this.setLoading()
      }
    },
    setTriggerData(val) {
      this.triggerData.percentage = Number(((+val.index / +val.total) * 100).toFixed(0))
      if (this.triggerData.percentage !== 100) {
        this.triggerData.name = val.name
      } else {
        this.triggerData.name = '同步完成'
        this.triggerData.loading = true
        this.setLoading()
      }
    },
    setHostItemData(val) {
      this.hostItemData.percentage = Number(((+val.index / +val.total) * 100).toFixed(0))
      if (this.hostItemData.percentage !== 100) {
        this.hostItemData.name = val.name
      } else {
        this.hostItemData.name = '同步完成'
        this.hostItemData.loading = true
        this.setLoading()
      }
    },
    setHostTriggerData(val) {
      this.hostTriggerData.percentage = Number(((+val.index / +val.total) * 100).toFixed(0))
      if (this.hostTriggerData.percentage !== 100) {
        this.hostTriggerData.name = val.name
      } else {
        this.hostTriggerData.name = '同步完成'
        this.hostTriggerData.loading = true
        this.setLoading()
      }
    },
    setLoading() {
      if (this.hostData.loading && this.tamplateData.loading && this.itemData.loading && this.triggerData.loading && this.hostItemData.loading && this.hostTriggerData.loading) {
        this.loading = false
      }
    },
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { ...this.listQuery, agentTypes: '1,8,10', agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        this.listLoading = false
        this.agentList = res.data
        this.listTotal = Number(res.count)
        this.$emit('setHostCount', res.count)
      })
    },
    // 关闭同步弹窗
    onClose() {
      if (this.loading === false) {
        this.hostData.percentage = 0
        this.hostData.name = ''
        this.tamplateData.percentage = 0
        this.tamplateData.name = ''
        this.itemData.percentage = 0
        this.itemData.name = ''
        this.triggerData.percentage = 0
        this.triggerData.name = ''
        this.hostItemData.percentage = 0
        this.hostItemData.name = ''
        this.hostTriggerData.percentage = 0
        this.hostTriggerData.name = ''
      }
      this.showDialog = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.findHyitAgent()
    },
    // 同步
    async asyncAgent(row) {
      this.agentType = row.agentType
      this.SynData = row
      this.showDialog = true
      if (row.agentType === 8) { this.fromAgentList = await this.findHyitAgentData('1') }
    },
    // 开始同步
    startSynchronization() {
      if (this.agentType === 8) {
        if (!this.fromAgentData.id) {
          this.$message({
            type: 'success',
            message: '请选择先类型'
          })
          return
        }
        this.loading = true
        this.fromAgentList.forEach(item => {
          if (+item.id === +this.fromAgentData.id) {
            this.fromAgentData.fromAgentId = item.fromAgentId
          }
        })
        this.agentGetHost(this.SynData, this.fromAgentData)
      } else {
        this.loading = true
        this.agentGetHost(this.SynData)
      }
    },
    // 同步的数据 websocket
    agentGetHost(val, num) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHost,
        data: {
          token: wsToken,
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          agent: String(val.id),
          fromAgent: num ? String(num.fromAgentId) : ''
        }
      },
      () => {},
      (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    async findHyitAgentData(agentTypes) {
      const res = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentTypes, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      })
      if (res.code !== 1) return
      return res.data
    },
    // asyncAgent(row) {
    //   this.asyncId = row.id
    //   const id = row.id
    //   request({
    //     url: api.itMonitor.agentGetTamplate,
    //     data: { agent: id }
    //   }).then(res => {
    //     if (res.code === 1) {
    //       request({
    //         url: api.itMonitor.agentGetGroup,
    //         data: { agent: id }
    //       }).then(res => {
    //         if (res.code === 1) {
    //           request({
    //             url: api.itMonitor.agentGetHost,
    //             data: { agent: id }
    //           }).then(res => {
    //             if (res.code === 1) {
    //               this.$message.success('同步成功')
    //               this.asyncId = ''
    //             } else {
    //               this.$message.error('同步主机失败')
    //               this.asyncId = ''
    //             }
    //           })
    //         } else {
    //           this.$message.error('同步群组失败')
    //           this.asyncId = ''
    //         }
    //       })
    //     } else {
    //       this.$message.error('同步模板失败')
    //       this.asyncId = ''
    //     }
    //   })
    // },

    tohost(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'BusinessConfigList',
        query: {
          id: row.id
        }
      })
    },
    totemplate(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TemplateMonitorList',
        query: {
          id: row.id
        }
      })
    },
    // 配置
    tpconfigure(row) {
      this.$router.push({
        name: 'ConfigureMonitorList',
        query: {
          id: row.id
        }
      })
    },
    totopo(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TopoConfig',
        query: {
          id: row.id
        }
      })
    },
    totraffictopo(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TrafficTopoConfig',
        query: {
          id: row.id
        }
      })
    }
  }
}
</script>
    <style lang="scss" scoped>
    .syn {
      margin-right: 10px;
    }
    .progress-bgc {
      margin-top: 10px;
      background-color: rgb(248,248,248);
      overflow: hidden;
      border-radius: 5px;
      padding-top: 20px;
      .progress-box {
      display: flex;
      .progress {
        flex: 7;
        margin-top: 10px;
      }
      .progress-name {
        flex: 3;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        word-wrap: break-word;
        white-space: normal !important;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        }
      }
    }
    </style>

