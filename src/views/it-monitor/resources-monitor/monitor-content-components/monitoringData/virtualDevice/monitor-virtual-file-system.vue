<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" class="chuck-box file-system margin-left-15 margin-right-15 margin-top-15">
    <div
      v-loading="diskDiskList.length === 0 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="box-border margin-top-15"
    >
      <div class="head head-bar">
        <div class="title">文件系统</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              :disabled="disabledSwitch"
              @change="changeItemSwitch"
            />
          </div>
        </div>
      </div>
      <div class="disk-list" :style="{ padding: diskDiskList.length === 0 ? '20px 0' : '' }">
        <template v-if="!showEmpty">
          <div v-for="(item, index) in diskDiskList" :key="index" class="disk-list-content pointer" @click="openUsedDetailDialog(item.usedPercentageItemId)">
            <div class="disk-icon">
              <img src="image/it-monitor/ico_yp.png" alt="">
            </div>
            <div class="disk-info">
              <div class="disk-info-header">
                <div class="disk-name">{{ item.fsName }}</div>
                <div class="disk-percentage">{{ item.usedPercentage }}{{ item.usedPercentageUnit }}</div>
              </div>
              <el-progress :text-inside="true" :stroke-width="10" :percentage="item.usedPercentage" />
              <div class="disk-info-footer">
                {{ item.remaining }}{{ item.remainingUnit }}可用，共{{ item.total }}{{ item.totalUnit }}
              </div>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无数据" />
      </div>
    </div>
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      :custom-configuration="customConfiguration"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { conversionData, conversionSymbols, isJSONString } from '@/utils/utils'
import UsedDetailDialog from '../component/used-detail-dialog'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

export default {
  name: 'MonitorVirtualFileSystem',
  components: {
    UsedDetailDialog
  },
  props: {
    propAgent: {
      type: Number,
      default() {
        return 0
      }
    },
    propZbxHostId: {
      type: Number,
      default() {
        return 0
      }
    },
    upDataDirectiveId: {
      type: String,
      default() {
        return ''
      }
    },
    fileData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      diskDiskList: [],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      itemGuid: null,
      watchItemSwitch: true,
      watchItemKey: 'virtualDisk',
      watchItemShow: null,
      disabledSwitch: false,
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: 'GB'
      }
    }
  },
  computed: {
    agent() {
      return this.$route.query.agent
    },
    zbxHostId() {
      return this.$route.query.zbxHostId
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id }
  },
  watch: {
    upDataDirectiveId: {
      handler() {
        this.watchAgentGetHostData()
      },
      deep: true
    },
    fileData: {
      handler() {
        this.watchAgentGetHostData()
      },
      deep: true
    }
  },
  mounted() {
    this.watchAgentGetHostData()
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    this.$EventBus.$on('update-item-switch', (data) => {
      if (data.name === this.watchItemKey) {
        this.disabledSwitch = false
        if (!data.status) {
          console.log(data)
        }
      }
    })
    const that = this
    setTimeout(() => {
      if (this.diskDiskList.length === 0) that.showEmpty = true
    }, 10000)
  },
  methods: {
    async watchAgentGetHostData() {
      const getItemVMFileSystemData = this.fileData
      if (getItemVMFileSystemData) {
        if (getItemVMFileSystemData.method === 'getItemVMFileSystemData') {
          const virtualInfoData = getItemVMFileSystemData.data
          console.log('virtualInfoData', virtualInfoData)
          virtualInfoData.forEach(item => {
            // 文件系统
            if (item.itemName.indexOf('disk space on') !== -1) { // 英文模板字眼
              const conversionSymbolsResult = conversionSymbols(item.itemName)
              const dataName = conversionSymbolsResult.split('on')[1]
              const fsName = dataName.indexOf('(') !== -1 ? dataName.split('(')[0] : dataName
              let idx = this.diskDiskList.findIndex(items => items.fsName === fsName)
              if (idx === -1) {
                this.$set(this.diskDiskList, this.diskDiskList.length, {
                  fsName, total: 0, usedPercentage: 0, remaining: 0, usedPercentageUnit: '', totalUnit: '', remainingUnit: '', originalTotal: 0, originalUsed: 0
                })
                // 使用大小
                if (item.itemName.indexOf(`${fsName} `) !== 1 && item.itemName.indexOf('sed disk space on') !== -1) {
                  this.$set(this.diskDiskList[this.diskDiskList.length - 1], 'usedItemId', item.itemid)
                  this.$set(this.diskDiskList[this.diskDiskList.length - 1], 'usedValueType', item.valueType)
                }
              }
              if (idx === -1) idx = this.diskDiskList.length - 1
              // 使用百分比
              if (item.itemName.indexOf(`${fsName}`) !== 1 && item.itemName.indexOf('percentage') !== -1) {
                const usedPercentageVal = 100 - Number(item.itemValue)
                this.$set(this.diskDiskList[idx], 'usedPercentageItemId', item.itemid)
                this.$set(this.diskDiskList[idx], 'usedPercentage', Number(usedPercentageVal.toFixed(2)))
                this.$set(this.diskDiskList[idx], 'usedPercentageUnit', item.units)
              }
              // 可用
              if (item.itemName.indexOf(`${fsName}`) !== 1 && item.itemName.indexOf('Free disk space on') !== -1 && item.itemName.indexOf('percentage') === -1) {
                const conversionDataResult = conversionData('data', Number(item.itemValue), 'b')
                this.$set(this.diskDiskList[idx], 'remaining', conversionDataResult.size)
                this.$set(this.diskDiskList[idx], 'remainingUnit', conversionDataResult.units)
              }
              // 总大小
              if (item.itemName.indexOf(`${fsName}`) !== 1 && item.itemName.indexOf('Total disk space on') !== -1) {
                const conversionDataResult = conversionData('data', Number(item.itemValue), 'b')
                console.log('总大小', fsName, conversionDataResult, idx)
                this.$set(this.diskDiskList[idx], 'total', conversionDataResult.size)
                this.$set(this.diskDiskList[idx], 'totalUnit', conversionDataResult.units)
              }
              // 使用大小
              if (item.itemName.indexOf(`${fsName}`) !== 1 && item.itemName.indexOf('sed disk space on') !== -1) {
                this.$set(this.diskDiskList[idx], 'usedItemId', item.itemid)
                this.$set(this.diskDiskList[idx], 'usedValueType', item.valueType)
              }
            } else { // 中文模板字眼
              item.itemName = conversionSymbols(item.itemName)
              const fsName = item.itemName.split('(')[0]
              const idx = this.diskDiskList.findIndex(items => items.fsName === fsName)
              if (idx === -1) {
                this.$set(this.diskDiskList, this.diskDiskList.length, {
                  fsName, total: 0, usedPercentage: 0, remaining: 0, usedPercentageUnit: '', totalUnit: '', remainingUnit: '', originalTotal: 0, originalUsed: 0
                })
              }
              if (item.itemName.indexOf(`${fsName}(`) !== -1) {
                const idx = this.diskDiskList.findIndex(items => items.fsName === fsName)
                // 使用百分比
                if (item.itemName.indexOf('使用磁盘空间') !== -1) {
                  this.$set(this.diskDiskList[idx], 'usedItemId', item.itemid)
                  this.$set(this.diskDiskList[idx], 'usedValueType', item.valueType)
                }
                // 使用百分比
                if (item.itemName.indexOf('使用磁盘空间百分比') !== -1) {
                  const usedPercentageVal = Number(item.itemValue)
                  this.$set(this.diskDiskList[idx], 'usedPercentage', Number(usedPercentageVal.toFixed(2)))
                  this.$set(this.diskDiskList[idx], 'usedPercentageUnit', item.units)
                }
                // 可用
                if (item.itemName.indexOf('百分比') === -1 && item.itemName.indexOf('剩余磁盘空间') !== -1) {
                  const conversionDataResult = conversionData('data', Number(item.itemValue), 'b')
                  this.$set(this.diskDiskList[idx], 'remaining', conversionDataResult.size)
                  this.$set(this.diskDiskList[idx], 'remainingUnit', conversionDataResult.units)
                }
                // 总空间
                if (item.itemName.indexOf('总磁盘空间') !== -1) {
                  const conversionDataResult = conversionData('data', Number(item.itemValue), 'b')
                  this.$set(this.diskDiskList[idx], 'total', conversionDataResult.size)
                  this.$set(this.diskDiskList[idx], 'totalUnit', conversionDataResult.units)
                }
              }
            }
          })
        }
      }
    },
    openUsedDetailDialog(id) {
      const idx = this.diskDiskList.findIndex(item => item.usedPercentageItemId === id)
      if (idx !== -1) {
        this.showUsedDetailDialog = true
        this.detailParams = [
          {
            itemid: this.diskDiskList[idx].usedItemId,
            valueType: this.diskDiskList[idx].usedValueType,
            name: '当前空间使用',
            color: '#87DEAF',
            unit: this.diskDiskList[idx].usedPercentageUnit,
            echartType: 'value',
            isConversion: true,
            conversionUnitType: 'data',
            data: [],
            units: [],
            time: [],
            isAssignUnit: true,
            assignUnit: 'GB',
            toFixed: 2
          }
        ]
        this.tableParams = [
          {
            label: ['最高使用', '平均使用', '最低使用'],
            value: 0,
            unit: this.diskDiskList[idx].usedPercentageUnit,
            itemid: this.diskDiskList[idx].usedItemId,
            valueType: this.diskDiskList[idx].usedValueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'avg', 'min'],
            isAssignUnit: true,
            assignUnit: 'GB',
            fixed: 2
          }
        ]
      }
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 获取监控项数据
    async agentGetHostData(method) {
      if (this.itMonitorRequireAgreement !== 'WS') {
        return new Promise(resolve => {
          request({ url: api.itMonitor.agentGetHostData, data: { agent: this.agent, hostid: this.zbxHostId, method }}).then(res => {
            if (res.code === 1 && res.model) {
              if (this.$tool.isJSONString(res.model)) {
                const sdwanInfoData = JSON.parse(res.model)
                resolve({
                  data: sdwanInfoData,
                  method,
                  agreement: 'http',
                  guid: this.itemGuid
                })
              }
            }
          })
        })
      } else {
        return new Promise(resolve => {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostData,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              agent: this.agent,
              hostid: this.zbxHostId,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              methed: method,
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          },
          (res) => {
            const wsRes = isJSONString(res[`${method}`]) ? JSON.parse(res[`${method}`]) : res[`${method}`]
            if (wsRes && res.methed === method) {
              resolve({
                data: wsRes,
                method,
                agreement: 'ws',
                guid: this.itemGuid
              })
            }
          }, (err) => {
            this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
            console.log(err)
          })
        })
      }
    },
    changeItemSwitch(val) {
      this.disabledSwitch = true
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '文件系统',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.disk-list {
  display: flex;
  flex-wrap: wrap;
  .disk-list-content, .disk-info-header {
    display: flex;
  }
  .disk-info-footer, .disk-percentage {
    color: #979797;
    font-size: .1rem;
  }
  .disk-list-content {
    padding: 20px 40px;
    align-items: center;
    width: 33%;
    display: flex;
    justify-content: flex-start;
    .disk-icon {
      width: 30%;
      text-align: center;
      img {
        width: 50px;
      }
    }
    .disk-info {
      width: 70%;
      .disk-info-header {
        align-items: flex-end;
        justify-content: space-between;
        padding-bottom: 5px;
        .disk-name {
          font-size: 16px;
        }
        .disk-percentage {}
      }
      .disk-info-footer {
        padding-top: 5px;
      }
    }
  }
}
</style>
