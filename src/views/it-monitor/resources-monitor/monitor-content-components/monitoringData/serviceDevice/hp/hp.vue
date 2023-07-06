<template>
  <div class="hp">
    <MonitorServiceInfoByHP
      :server-info="serverInfo"
      :prop-agent="Number(agent)"
      :prop-zbx-host-id="Number(zbxHostId)"
      :up-data-directive-id="upDataDirectiveId"
    />
    <div
      v-if="isConfig || (!isConfig && !watchItemShow)"
      class="chunk margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="module-header">
        <div class="chunk-opts margin-bottom-7-5 margin-right-7-5">
          <div
            v-if="isConfig"
            class="chunk-opts-select"
          >
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
        </div>
      </div>
      <div class="module-list">
        <div
          v-for="item in moduleList"
          :key="item.key"
          class="module-item box-border margin-left-7-5 margin-right-7-5 margin-bottom-15 pointer"
          :class="moduleKey === item.key ? 'activeModule' : ''"
          @click="handlerModule(item.key)"
        >
          <div class="module-item-main">
            <div class="item-main-left">
              <img
                v-if="item.img"
                class="module-item-img"
                :src="item.img"
              >
              <div class="module-item-title">
                {{ item.title }}（{{ item.count }}）
              </div>
            </div>
            <img
              v-if="item.status"
              class="status-img"
              src="image/common/right.png"
              alt
            >
            <img
              v-if="!item.status"
              class="monitor-icon"
              src="image/common/alarm.png"
              alt
            >
          </div>
        </div>
      </div>
    </div>
    <div class="chunk margin-left-15 margin-right-15">
      <MonitorServiceDiskByHP
        v-if="moduleKey === 'disk'"
        :module-data="diskList"
        :status-list="diskStatusList"
        :smart-status-list="diskSMARTStatusList"
      />
      <!--      <MonitorServiceCpuByHP-->
      <!--        v-if="moduleKey === 'cpu'"-->
      <!--        :module-data="cpuList"-->
      <!--        :fault-status-list="cpuFaultStatusList"-->
      <!--      />-->
      <MonitorServiceNetworkCardByHP
        v-if="moduleKey === 'networkCard'"
        :module-data="networkCardList"
        :status-list="networkCardStatusList"
      />
      <MonitorServiceFanByHP
        v-if="moduleKey === 'fan'"
        :module-data="fanList"
        :status-list="fanListStatusList"
      />
      <MonitorServicePowerByHP
        v-if="moduleKey === 'power'"
        :module-data="powerList"
        :status-list="powerStatusList"
      />
      <!--      <MonitorServiceMemoryByHP-->
      <!--        v-if="moduleKey === 'memory'"-->
      <!--        :module-data="memoryList"-->
      <!--        :fault-status-list="memoryFaultStatusList"-->
      <!--      />-->
      <MonitorServiceTemperatureByHP
        v-if="moduleKey === 'temperature'"
        :module-data="tempList.listTemp"
        :sensor-condition-status-list="sensorConditionStatusList"
      />
    </div>
  </div>
</template>

<script>
import monitorServiceMixins from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/mixins/monitor-service-mixins'
import dataWatchMixins from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/mixins/data-watch-mixins'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

import MonitorServiceInfoByHP from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/hp/monitor-service-info.vue'
import MonitorServiceDiskByHP from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/hp/monitor-service-disk.vue'
import MonitorServiceFanByHP from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/hp/monitor-service-fan.vue'
import MonitorServiceNetworkCardByHP from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/hp/monitor-service-network-card.vue'
import MonitorServicePowerByHP from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/hp/monitor-service-power.vue'
import MonitorServiceTemperatureByHP from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/serviceDevice/hp/monitor-service-temperature.vue'

export default {
  name: 'Hp',
  components: {
    MonitorServiceInfoByHP,
    MonitorServiceDiskByHP,
    MonitorServiceFanByHP,
    MonitorServiceNetworkCardByHP,
    MonitorServicePowerByHP,
    MonitorServiceTemperatureByHP
  },
  mixins: [monitorServiceMixins, dataWatchMixins, MonitorDataMixin],
  data() {
    return {
      initGetMonitorItemHistoryData: false
    }
  },
  methods: {
    async watchAgentGetHostData(data) {
      if (data.cmd === 'it-agentGetHostData-websocket' && data.methed === 'hpServer') {
        const jsonData = this.$tool.isJSONString(data.hpServerData) ? JSON.parse(data.hpServerData) : null
        if (!jsonData) return

        // 系统概要信息
        if (jsonData.general) this.serverInfo = jsonData.general

        // 磁盘
        if (jsonData.physicaldisk) {
          let statusItemId = ''
          let SMARTStatueItemId = ''
          jsonData.physicaldisk.forEach(item => {
            const itemKey = item.itemName.split(':')[0]
            const itemKeyIdx = this.diskList.findIndex(el => el.itemKey === itemKey)
            let itemIdx = itemKeyIdx
            if (itemKeyIdx === -1) {
              this.$set(this.diskList, this.diskList.length, { itemKey, itemValue: itemKey })
              itemIdx = this.diskList.length - 1
            }
            // 容量
            if (item.itemName.indexOf('Disk size') !== -1) {
              this.$set(this.diskList[itemIdx], 'storageItemid', item.itemid)
              this.$set(this.diskList[itemIdx], 'storageUnits', item.units)
              this.$set(this.diskList[itemIdx], 'storageItemValue', item.itemValue)
            }
            // 型号
            if (item.itemName.indexOf('disk model name') !== -1) {
              this.$set(this.diskList[itemIdx], 'modelItemValue', item.itemValue)
            }
            // 状态
            if (item.itemName.indexOf('disk status') !== -1) {
              this.$set(this.diskList[itemIdx], 'statueItemValue', item.itemValue)
              this.$set(this.diskList[itemIdx], 'statueItemid', item.itemid)
              statusItemId = item.itemid
              const findVar = this.$tool.findDataItemByAttr(this.moduleTypeItemId, 'itemid', +item.itemid)
              if (!findVar) this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, { itemid: +item.itemid, var: 'diskList' })
            }
            // S.M.A.R.T 状态
            if (item.itemName.indexOf('S.M.A.R.T') !== -1 && item.itemName.indexOf('status') !== -1) {
              this.$set(this.diskList[itemIdx], 'SMARTStatueItemValue', item.itemValue)
              this.$set(this.diskList[itemIdx], 'SMARTStatueItemid', item.itemid)
              SMARTStatueItemId = item.itemid
              const findVar = this.$tool.findDataItemByAttr(this.moduleTypeItemId, 'itemid', +item.itemid)
              if (!findVar) this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, { itemid: +item.itemid, var: 'diskList' })
            }
            // 序列号
            if (item.itemName.indexOf('disk serial number') !== -1) {
              this.$set(this.diskList[itemIdx], 'snItemValue', item.itemValue)
            }
            // 类型
            if (item.itemName.indexOf('disk media type') !== -1) {
              this.$set(this.diskList[itemIdx], 'typeItemid', item.itemid)
              this.$set(this.diskList[itemIdx], 'typeItemValue', item.itemValue)
            }
          })

          if (this.diskList.length > 0) {
            // 模块数量
            this.$set(this.moduleList[0], 'count', this.diskList.length)
            const itemids = [statusItemId, SMARTStatueItemId]
            const agentGetValueMap = await this.agentGetValueMap(
              itemids.toString()
            )
            if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
          }
        }

        // 网卡
        if (jsonData.network) {
          let statusItemId = ''
          jsonData.network.forEach(item => {
            const itemKey = item.itemName.split(':')[0]
            const itemKeyIdx = this.networkCardList.findIndex(el => el.itemKey === itemKey)
            let itemIdx = itemKeyIdx
            if (itemKeyIdx === -1) {
              this.$set(this.networkCardList, this.networkCardList.length, { itemKey, itemValue: itemKey })
              itemIdx = this.networkCardList.length - 1
            }
            // 状态
            if (item.itemName.indexOf('Status') !== -1) {
              this.$set(this.networkCardList[itemIdx], 'statueItemValue', item.itemValue)
              this.$set(this.networkCardList[itemIdx], 'statueItemid', item.itemid)
              statusItemId = item.itemid
              const findVar = this.$tool.findDataItemByAttr(this.moduleTypeItemId, 'itemid', +item.itemid)
              if (!findVar) this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, { itemid: +item.itemid, var: 'networkCardList' })
            }
          })
          if (this.networkCardList.length > 0) {
            this.$set(this.moduleList[2], 'count', this.networkCardList.length)
            const itemids = [statusItemId]
            const agentGetValueMap = await this.agentGetValueMap(
              itemids.toString()
            )
            if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
          }
        }

        // 风扇
        if (jsonData.fans) {
          let statusItemId = ''
          jsonData.fans.forEach(item => {
            const itemKey = item.itemName.split(':')[0]
            const itemKeyIdx = this.fanList.findIndex(el => el.itemKey === itemKey)
            let itemIdx = itemKeyIdx
            if (itemKeyIdx === -1) {
              this.$set(this.fanList, this.fanList.length, { itemKey, itemName: itemKey })
              itemIdx = this.fanList.length - 1
            }
            // 状态
            if (item.itemName.indexOf('status') !== -1) {
              this.$set(this.fanList[itemIdx], 'statueItemValue', item.itemValue)
              this.$set(this.fanList[itemIdx], 'statueItemid', item.itemid)
              statusItemId = item.itemid
              const findVar = this.$tool.findDataItemByAttr(this.moduleTypeItemId, 'itemid', +item.itemid)
              if (!findVar) this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, { itemid: +item.itemid, var: 'fanList' })
            }
          })
          if (this.fanList.length > 0) {
            this.$set(this.moduleList[3], 'count', this.fanList.length)
            const itemids = [statusItemId]
            const agentGetValueMap = await this.agentGetValueMap(
              itemids.toString()
            )
            if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
          }
        }

        // 电源
        if (jsonData.power) {
          let statusItemId = ''
          jsonData.power.forEach(item => {
            const itemKey = item.itemName.split(':')[0]
            const itemKeyIdx = this.powerList.findIndex(el => el.itemKey === itemKey)
            let itemIdx = itemKeyIdx
            if (itemKeyIdx === -1) {
              this.$set(this.powerList, this.powerList.length, { itemKey, name: itemKey })
              itemIdx = this.powerList.length - 1
            }
            // 状态
            if (item.itemName.indexOf('status') !== -1) {
              this.$set(this.powerList[itemIdx], 'statueItemValue', item.itemValue)
              this.$set(this.powerList[itemIdx], 'statueItemid', item.itemid)
              statusItemId = item.itemid
              const findVar = this.$tool.findDataItemByAttr(this.moduleTypeItemId, 'itemid', +item.itemid)
              if (!findVar) this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, { itemid: +item.itemid, var: 'powerList' })
            }
          })
          if (this.powerList.length > 0) {
            // 模块数量
            this.$set(this.moduleList[4], 'count', this.powerList.length)
            const itemids = [statusItemId]
            const agentGetValueMap = await this.agentGetValueMap(
              itemids.toString()
            )
            if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
          }
        }

        // 温度
        if (jsonData.temp) {
          let sensorCondition = ''
          jsonData.temp.forEach(item => {
            const itemKey = item.itemName.split(':')[0]
            const itemKeyIdx = this.tempList.listTemp.findIndex(el => el.itemKey === itemKey)
            let itemIdx = itemKeyIdx
            if (itemKeyIdx === -1) {
              this.$set(this.tempList.listTemp, this.tempList.listTemp.length, { itemKey, name: itemKey })
              itemIdx = this.tempList.listTemp.length - 1
            }
            // 温度
            if (item.itemName.indexOf('Temperature') !== -1 && item.itemName.indexOf('sensor condition') === -1) {
              this.$set(this.tempList.listTemp[itemIdx], 'temperature', item.itemValue)
              this.$set(this.tempList.listTemp[itemIdx], 'temperatureUnits', item.units)
            }
            // 传感器状态
            if (item.itemName.indexOf('sensor condition') !== -1) {
              this.$set(this.tempList.listTemp[itemIdx], 'sensorConditionItemValue', item.itemValue)
              this.$set(this.tempList.listTemp[itemIdx], 'sensorConditionItemid', item.itemid)
              sensorCondition = item.itemid
              const findVar = this.$tool.findDataItemByAttr(this.moduleTypeItemId, 'itemid', +item.itemid)
              if (!findVar) this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, { itemid: +item.itemid, var: 'temperature' })
            }
          })
          if (this.tempList.listTemp.length > 0) {
            // 模块数量
            this.$set(this.moduleList[6], 'count', this.tempList.listTemp.length)
            const itemids = [sensorCondition]
            const agentGetValueMap = await this.agentGetValueMap(
              itemids.toString()
            )
            if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/monitor-device.scss';
.module-header {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.module-list {
  width: 100%;
  .activeModule {
    background: #f2f2f2;
    border: 1px solid #bdbdbd;
  }
  .module-item {
    width: calc(20% - 15px);
    display: inline-block;
    .module-item-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      .item-main-left {
        display: flex;
        align-items: center;
        height: 25px;
        .module-item-img {
          width: 25px;
          height: 25px;
          margin-right: 6px;
        }
        .module-item-title {
        }
      }
      .status-img {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
