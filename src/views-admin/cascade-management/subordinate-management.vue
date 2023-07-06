<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-button class="filter-item" type="primary" @click="addCat">新增</el-button> -->
      <el-input v-model="listQuery.keyword" clearable placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <!-- <el-select v-model="listQuery.userStatue" placeholder="启用状态" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.value" :value="item.id" />
      </el-select> -->
      <el-button class="filter-item" type="primary" @click="findHyitAgent">搜索</el-button>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="dataList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" type="index" />
        <el-table-column label="名称" prop="name" show-overflow-tooltip />
        <el-table-column label="ip" prop="ip" show-overflow-tooltip />
        <!-- <el-table-column label="端口" prop="port" show-overflow-tooltip />
        <el-table-column label="mac地址" prop="mac" show-overflow-tooltip />
        <el-table-column label="版本号" prop="version" show-overflow-tooltip /> -->
        <el-table-column label="连接状态" prop="connectionStatus" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-tag :type="setConnectStatue('class', row.connectionStatus)">
              {{ setConnectStatue('text', row.connectionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onSynchronization(row)">同步</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitAgent" />
    </div>
    <el-dialog title="同步" :visible.sync="showDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <el-button type="primary" :loading="loading" @click="startSynchronization()">开始同步</el-button>
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import { isJSONString } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
export default {
  components: { Pagination },
  data() {
    return {
      SynData: [],
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        userStatue: '',
        agentType: 8
      },
      loading: false,
      dataList: [],
      showDialog: false,
      synchronizationList: {},
      hostData: {percentage: 0, name: '', loading: false},
      tamplateData: {percentage: 0, name: '', loading: false},
      itemData: {percentage: 0, name: '', loading: false},
      triggerData: {percentage: 0, name: '', loading: false},
      hostItemData: {percentage: 0, name: '', loading: false},
      hostTriggerData: {percentage: 0, name: '', loading: false},
      total: 0,
      statusOptions: [
        {id: 0, value: '未启用'},
        {id: 1, value: '启用'}
      ],
      progressData: 50,
      connectStatue: [
        { value: 0, label: '离线', class: 'info' },
        { value: 1, label: '在线', class: 'success' }
      ]
    }
  },
  computed: {
    setConnectStatue() {
      return function(valueType, val) {
        const idx = this.connectStatue.findIndex(item => item.value === val)
        if (idx === -1) {
          if (valueType === 'text') return this.connectStatue[0].label
          if (valueType === 'class') return this.connectStatue[0].class
        } else {
          if (valueType === 'text') return this.connectStatue[1].label
          if (valueType === 'class') return this.connectStatue[1].class
        }
      }
    }
  },
  mounted() {
    this.findHyitAgent()
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
  methods: {
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
      if (this.hostData.loading === true && this.tamplateData.loading === true && this.itemData.loading === true && this.triggerData.loading === true && this.hostItemData.loading === true && this.hostTriggerData.loading === true) {
        this.loading = false
      }
    },

    // 列表数据
    async findHyitAgent() {
      const res = await this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { ...this.listQuery }
      })
      if (res.code !== 1) return
      this.dataList = res.data
      this.total = Number(res.count)

      const agentData = await this.getOnlineAgent()
      if (agentData.length > 0) {
        agentData.forEach(item => {
          res.data.forEach(resItem => {
            if (+item.id === +resItem.id) {
              this.$set(resItem, 'connectionStatus', 1)
            }
          })
        })
      }
    },
    // 同步
    async onSynchronization(row) {
      this.SynData = row
      this.showDialog = true
    },
    // 开始同步
    startSynchronization() {
      this.loading = true
      this.agentGetCenterHost(this.SynData)
    },
    // 同步的数据 websocket
    agentGetCenterHost(val) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetCenterHost,
        data: {
          token: wsToken,
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          agent: String(val.id)
        }
      },
      () => {},
      (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },

    async getOnlineAgent() {
      const res = await this.$request({
        url: this.api.itMonitor.getOnlineAgent,
        data: { limit: -1 }
      })
      if (res.code !== 1) return
      return res.data
    },
    addCat() { // 新增
      this.$router.push({
        name: ''
      })
    },
    // 改变启用状态
    async changeUserStatue(row) {
      const res = await this.$request({
        url: this.api.itMonitor.updateHyitAgent,
        data: {id: row.id, statue: row.statue}
      })
      if (res.code !== 1) return
      this.findHyitAgent()
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
    }
    // async onDelete(row) {
    //   this.$confirm('是否删除该数据？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     this.$request({
    //       url: this.api.itMonitor.deleteHyitAgent,
    //       data: { id: row.id }
    //     }).then(res => {
    //       if (res.code === 1) {
    //         this.findHyitAgent()
    //         this.$message({
    //           type: 'success',
    //           message: '删除成功!'
    //         })
    //       }
    //     })
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '已取消删除'
    //     })
    //   })
    // }
  }
}
</script>
<style lang="scss" scoped>
.progress-bgc {
  margin-top: 10px;
  background-color: rgb(248,248,248);
  overflow: hidden;
  border-radius: 5px;
  padding-top: 20px;
  .progress-box {
  display: flex;
  .progress {
    flex: 6;
    margin-top: 10px;
  }
  .progress-name {
    flex: 4;
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
