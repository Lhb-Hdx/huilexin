<template>
  <div class="detail-point-wrapper margin-15">
    <div>
      <el-radio-group v-model="findZbxItemsQuery.tag" @change="changeApplication">
        <el-radio-button v-for="(item, index) in applicationItems" :key="index" :label="item.label">{{ item.sslCertFile }}</el-radio-button>
      </el-radio-group>
    </div>
    <div v-loading="loading" class="table-wrapper">
      <el-table
        :data="zbxItems"
        row-key="zbxItemsKeyId"
        default-expand-all
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="监控项名称" prop="name">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监控项类型" prop="applicationid">
          <template slot-scope="{row}">
            <span>{{ setFlag(row.flags) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监控项周期" prop="delay">
          <template slot-scope="{row}">
            <span>{{ row.delay }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="getNewDataTitle + '(' + getNewDataCountDown + 's)'" prop="delay">
          <template slot-scope="{row}">
            <span>{{ row.newData }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'info'">
              {{ scope.row.status === 0 ? '启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['GetMonitorItem']" type="primary" size="mini" @click="getZbxItems(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :current-page="findZbxItemsQuery.page"
        :page-size="findZbxItemsQuery.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="zbxItemsTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <MonitoringItemDrawer v-if="showDrawer" :item-detail="itemDetail" @closeDrawer="closeDrawer" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { conversionData } from '@/utils/utils'
import MonitoringItemDrawer from './component/monitoring-item-drawer'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'MonitoringItemList',
  components: {
    MonitoringItemDrawer
  },
  props: {
    hostDetail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      showDrawer: false,
      loading: false,
      applicationItems: [],
      findZbxItemsQuery: {
        page: 1,
        limit: 10,
        tag: 'all',
        sbid: '',
        hostid: '',
        total: ''
      },
      zbxItems: [],
      zbxItemsTotal: 0,
      getItemNewDataInterval: null,
      isStatusValueKey: [ // 数据是状态值的监控项key
        'ifAdminStatus',
        'ifOperStatus',
        'FAN',
        'PowerStatus'
      ],
      getNewDataTitle: '最新数据',
      getNewDataCountDown: '5',
      countDownInterval: null,
      itemDetail: {},
      componentGuid: ''
    }
  },
  computed: {
    setApplication() {
      return function(id) {
        const applicationIdx = this.applicationItems.findIndex(item => item.id === id)
        if (applicationIdx !== -1) {
          return this.applicationItems[applicationIdx].name
        }
      }
    },
    setFlag() {
      return function(flag) {
        if (flag === 0) {
          return '模板配置'
        } else if (flag === 4) {
          return '自动发现'
        }
      }
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  mounted() {
    this.componentGuid = this.$tool.guid()
    if (this.hostDetail && this.hostDetail.hyDevTypeValue && this.hostDetail.agent) {
      this.findZbxItems()
      this.getZbxApplicationStatictics()
    }
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket' && res.detail.data.componentGuid === this.componentGuid) {
        this.watchGetItemNewData(res.detail.data.data)
      }
    })
  },
  destroyed() {
    clearInterval(this.countDownInterval)
    clearInterval(this.getItemNewDataInterval)
  },
  methods: {
    // 获取应用集
    getZbxApplicationStatictics() {
      request({
        url: api.itMonitor.findZbxItemsHostTag,
        data: { page: 1, limit: -1, hostid: this.hostDetail.hyZhostId, agent: this.hostDetail.agent }
      }).then(res => {
        if (res.code === 1) {
          const data = []
          res.data.forEach(item => {
            data.push({
              sslCertFile: item.sslCertFile, label: item.sslCertFile
            })
          })
          this.applicationItems = [
            { sslCertFile: '所有', label: 'all' },
            ...data
          ]
        }
      })
    },
    // 获取监控项
    findZbxItems() {
      this.findZbxItemsQuery.sbid = this.hostDetail.agent
      this.findZbxItemsQuery.hostid = this.hostDetail.hyZhostId
      const params = { ...this.findZbxItemsQuery }
      if (params.tag === 'all') {
        params.tag = ''
      }
      delete params.total
      request({
        url: api.itMonitor.findZbxItemsHost,
        data: { ...params }
      }).then(res => {
        if (res.code === 1) {
          const itemid = []
          const valueType = []
          res.data.forEach(item => {
            if (item.status === 0) {
              itemid.push(item.itemid)
              valueType.push(item.valueType)
            }
          })
          this.zbxItems = res.data
          console.log(this.zbxItems)
          this.zbxItemsTotal = Number(res.count)
          this.getNewDataCountDownInterval()
          this.getItemNewDataInterval = setInterval(() => {
            this.getItemNewData(itemid, valueType)
          }, 5000)
        }
      })
    },
    // 最新数据获取倒计时
    getNewDataCountDownInterval() {
      this.countDownInterval = setInterval(() => {
        if (this.getNewDataCountDown === 0) {
          this.getNewDataCountDown = 6
        }
        this.getNewDataCountDown--
      }, 1000)
    },
    // 选择应用集
    changeApplication() {
      clearInterval(this.countDownInterval)
      clearInterval(this.getItemNewDataInterval)
      this.getNewDataCountDown = 5
      this.findZbxItemsQuery.page = 1
      this.findZbxItems()
    },
    // 切换页码条数，重新返回首页加载数据
    handleSizeChange(val) {
      this.getNewDataCountDown = 5
      clearInterval(this.countDownInterval)
      clearInterval(this.getItemNewDataInterval)
      this.findZbxItemsQuery.limit = val
      this.findZbxItemsQuery.page = 1
      this.findZbxItems()
    },
    // 切换当前页码，查询加载数据
    handleCurrentChange(val) {
      this.getNewDataCountDown = 5
      clearInterval(this.countDownInterval)
      clearInterval(this.getItemNewDataInterval)
      this.findZbxItemsQuery.page = val
      this.findZbxItems()
    },
    // 点击监控项详情
    getZbxItems(row) {
      this.showDrawer = true
      this.itemDetail = row
    },
    // 获取最新数据
    async getItemNewData(itemid, valueType) {
      if (itemid.length > 0 && valueType.length > 0) {
        if (this.itMonitorRequireAgreement !== 'WS') {
          request({
            url: api.itMonitor.agentGetRealTimeData,
            data: { agent: this.hostDetail.agent, hostid: '', itemid: itemid.toString(), valueType: valueType.toString() }
          }).then(res => {
            if (res.code === 1) {
              if (res.model) {
                this.watchGetItemNewData(res.model)
              }
            }
          })
        } else {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetRealTimeData,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              agent: this.hostDetail.agent,
              itemid: itemid.toString(),
              valueType: valueType.toString(),
              componentGuid: this.componentGuid,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          })
        }
      }
    },
    // 监听最新数据
    watchGetItemNewData(data) {
      const newData = this.itMonitorRequireAgreement === 'WS' ? data : this.$tool.isJSONString(data) ? JSON.parse(data) : []
      console.log(newData)
      newData.forEach(newDataItem => {
        const idx = this.zbxItems.findIndex(items => Number(items.itemid) === Number(newDataItem.itemid))
        const activeValue = this.itMonitorRequireAgreement === 'WS' ? newDataItem.itemValue : newDataItem.value
        if (idx !== -1) {
          let newNum = `${this.transformItemData(this.zbxItems[idx], Number(activeValue)).transformValue}${this.transformItemData(this.zbxItems[idx], Number(activeValue)).transformUnit}`
          if (newNum !== 'NaN') {
            const dataUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
            let unit = this.zbxItems[idx].units
            if (this.zbxItems[idx].units.indexOf('/') !== -1) unit = this.zbxItems[idx].units.split('/')[0]
            if (this.zbxItems[idx].units.indexOf('ps') !== -1) unit = this.zbxItems[idx].units.split('/')[0]
            const unitIndex = dataUnits.indexOf(unit.toUpperCase())
            if (unitIndex !== -1) {
              const conversionData = this.$tool.conversionData('data', Number(activeValue), dataUnits[unitIndex])
              this.$set(this.zbxItems[idx], 'newData', `${conversionData.size}${conversionData.units}${conversionData.suffix}`)
            } else {
              this.$set(this.zbxItems[idx], 'newData', `${this.transformItemData(this.zbxItems[idx], Number(activeValue)).transformValue}${this.transformItemData(this.zbxItems[idx], Number(activeValue)).transformUnit}`)
            }
          } else {
            this.$set(this.zbxItems[idx], 'newData', activeValue)
          }
        }
      })
    },
    // 转换监控项数据单位
    transformItemData(itemDetail, value) {
      let transformValue = Number(value)
      let transformUnit = itemDetail.units
      // 根据单位转换
      if (itemDetail.units === '' || itemDetail.units.indexOf('%') !== -1) {
        transformValue = value
      } else if (itemDetail.units.indexOf('ps') !== -1) {
        const conversionDataResult = conversionData('data', transformValue, itemDetail.units)
        transformValue = Number(conversionDataResult.size)
        transformUnit = `${conversionDataResult.units}PS`
      } else if (itemDetail.units.indexOf('uptime') !== -1 || itemDetail.units.indexOf('unixtime') !== -1) {
        transformValue = (value / 60 / 60 / 24).toFixed()
        transformUnit = '天'
      } else if (itemDetail.units.indexOf('sectors') !== -1) { // 扇区

      }
      // 根据key值去转换
      if (itemDetail.key && itemDetail.key.indexOf('vfs.fs.size') !== -1) {
        const conversionDataResult = conversionData('data', transformValue, itemDetail.units)
        transformValue = Number(conversionDataResult.size)
        transformUnit = conversionDataResult.units
      }
      this.isStatusValueKey.forEach(item => {
        if (itemDetail.key && itemDetail.key.indexOf(item) !== -1) {
          transformValue = transformValue === 1 ? '正常' : '断开'
        }
      })
      return {
        transformValue,
        transformUnit
      }
    },
    // 关闭抽屉组件
    closeDrawer() {
      this.showDrawer = false
    }
  }
}
</script>

<style lang="scss" scoped>
.header-tools {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  .filter-item {
    margin-bottom: 0 !important;
  }
}
.echarts-boxs {
  margin-bottom: 30px;
}
.point-table {
  .column-value {
    color: #999999;
    font-size: 20px;
  }
}
</style>
