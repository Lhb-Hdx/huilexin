<template>
  <div class="dell">
    <!-- 系统概要1 -->
    <MonitorServiceInfoByDell
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
      <MonitorServiceDiskByDell
        v-if="moduleKey === 'disk'"
        :module-data="diskList"
        :online-status-list="diskOnlineStatusList"
        :fault-status-list="diskFaultStatusList"
      />
      <MonitorServiceCpuByDell
        v-if="moduleKey === 'cpu'"
        :module-data="cpuList"
        :fault-status-list="cpuFaultStatusList"
      />
      <MonitorServiceNetWorkCardByDell
        v-if="moduleKey === 'networkCard'"
        :module-data="networkCardList"
        :fault-status-list="networkCardFaultStatusList"
        :connection-status-list="networkCardConnectionStatusList"
      />
      <MonitorServiceFanByDell
        v-if="moduleKey === 'fan'"
        :module-data="fanList"
        :fault-status-list="fanListFaultStatusList"
      />
      <MonitorServicePowerByDell
        v-if="moduleKey === 'power'"
        :module-data="powerList"
        :online-status-list="powerOnlineStatusList"
        :fault-status-list="powerFaultStatusList"
      />
      <MonitorServiceMemoryByDell
        v-if="moduleKey === 'memory'"
        :module-data="memoryList"
        :fault-status-list="memoryFaultStatusList"
      />
    </div>
    <div
      v-if="moduleKey === 'temperature'"
      class="chunk margin-left-7-5 margin-right-7-5"
    >
      <MonitorServiceTemperatureByDell
        v-for="(item, index) in tempList.boardTemp"
        :key="item.activeTempValueItemid"
        module-title="主板温度"
        module-data-attr="boardTemp"
        :module-data-index="index"
        :module-data.sync="tempList"
        :module-data-interval-value="requestInterval"
      />
      <MonitorServiceTemperatureByDell
        v-for="(item, index) in tempList.cpuTemp"
        :key="item.activeTempValueItemid"
        :module-title="item.name + '温度'"
        module-data-attr="cpuTemp"
        :module-data-index="index"
        :module-data.sync="tempList"
        :module-data-interval-value="requestInterval"
      />
    </div>
  </div>
</template>

<script>
import { conversionSymbols, isJSONString } from '@/utils/utils'
import monitorServiceMixins from '../mixins/monitor-service-mixins'
import dataWatchMixins from '../mixins/data-watch-mixins'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'Dell',
  mixins: [monitorServiceMixins, dataWatchMixins, MonitorDataMixin],
  data() {
    return {
      initGetMonitorItemHistoryData: false
    }
  },
  methods: {
    async watchAgentGetHostData(data) {
      const currentAllMonitorItemIds = []
      const currentAllMonitorItemValueTypes = []

      // 概况
      if (data.methed === 'getItemServerSystemInfoData') {
        const getItemServerSystemInfoData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const deviceSNItemIndex = getItemServerSystemInfoData.findIndex(
          (item) => item.itemName === '服务器SN'
        )
        this.deviceSN =
          deviceSNItemIndex !== -1
            ? getItemServerSystemInfoData[deviceSNItemIndex].itemValue
            : ''
        this.serverInfo = getItemServerSystemInfoData
      }
      // (网吧)系统概况
      if (data.methed === 'getItemServerHealthData') {
        const getItemServerHealthData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const deviceSNItemIndex = getItemServerHealthData.findIndex(
          (item) => item.itemName === 'h3c'
        )
        this.deviceSN =
          deviceSNItemIndex !== -1
            ? getItemServerHealthData[deviceSNItemIndex].itemValue
            : ''
        this.serverOutline = getItemServerHealthData
      }

      // 磁盘
      if (data.methed === 'getItemServerDiskData') {
        const getItemServerDiskData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const disk = [] // 存储磁盘列表
        const storages = [] // 容量
        const models = [] // 型号
        const onlines = [] // 在线状态
        const sn = [] // 序列号
        const fault = [] // 故障状态
        const type = []
        getItemServerDiskData.forEach((item) => {
          if (item.itemValue.indexOf('Disk') !== -1) {
            disk.push({
              itemid: item.itemid,
              itemName: item.itemName.split('名称')[0],
              itemValue: item.itemValue,
              units: item.units
            })
          }
          if (item.itemName.indexOf('型号') !== -1) {
            models.push({
              itemid: item.itemid,
              itemName: item.itemName,
              itemValue: item.itemValue,
              units: item.units
            })
          }
          if (item.itemName.indexOf('在线状态') !== -1) {
            onlines.push({
              itemid: item.itemid,
              itemName: item.itemName,
              itemValue: item.itemValue,
              units: item.units
            })
          }
          if (item.itemName.indexOf('SN') !== -1) {
            sn.push({
              itemid: item.itemid,
              itemName: item.itemName,
              itemValue: item.itemValue,
              units: item.units
            })
          }
          if (item.itemName.indexOf('故障状态') !== -1) {
            fault.push({
              itemid: item.itemid,
              itemName: item.itemName,
              itemValue: item.itemValue,
              units: item.units
            })
          }
          if (item.itemName.indexOf('类型') !== -1) {
            type.push({
              itemid: item.itemid,
              itemName: item.itemName,
              itemValue: item.itemValue,
              units: item.units
            })
          }
          if (item.itemName.indexOf('容量') !== -1) {
            storages.push({
              itemid: item.itemid,
              itemName: conversionSymbols(item.itemName),
              itemValue: item.itemValue,
              units: item.units
            })
          }
        })
        //  设备故障状态数组
        // const alerLogItemIdArr = this.getAlertLogArray(fault)
        // const alerLogItemIdStr = alerLogItemIdArr.join(',')
        // const res = await request({ url: api.itMonitor.findZbxAlarmLogByItemid, data: { page: 0, limit: 0, hostid: this.zbxHostId, itemids: '53502' }})
        let onlineStatusItemId = ''
        let faultStatusItemId = ''
        disk.forEach((item) => {
          // 查找容量
          const findStorage = this.$tool.findDataItemByAttr(
            storages,
            'itemName',
            `${item.itemName}容量`
          )
          if (findStorage) {
            item.storageItemid = findStorage.itemid
            item.storageUnits = findStorage.units
            item.storageItemValue = findStorage.itemValue
          }
          // 查找型号
          const findModel = this.$tool.findDataItemByAttr(
            models,
            'itemName',
            `${item.itemName}型号`
          )
          if (findModel) {
            item.modelItemid = findModel.itemid
            item.modelUnits = findModel.units
            item.modelItemValue = findModel.itemValue
          }
          // 查找类型
          const findType = this.$tool.findDataItemByAttr(
            type,
            'itemName',
            `${item.itemName}类型`
          )
          if (findType) {
            item.typeItemid = findType.itemid
            item.typeUnits = findType.units
            item.typeItemValue = findType.itemValue
          }
          // 查找在线状态
          const findOnline = this.$tool.findDataItemByAttr(
            onlines,
            'itemName',
            `${item.itemName}在线状态`
          )
          if (findOnline) {
            onlineStatusItemId = findOnline.itemid
            item.onlineItemid = findOnline.itemid
            item.onlineUnits = findOnline.units
            item.onlineItemValue = findOnline.itemValue
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(findOnline.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(findOnline.itemid),
                var: 'diskList'
              })
            }
          }
          // 查找序列号
          const findSN = this.$tool.findDataItemByAttr(
            sn,
            'itemName',
            `${item.itemName}SN`
          )
          if (findSN) {
            item.snItemid = findSN.itemid
            item.snUnits = findSN.units
            item.snItemValue = findSN.itemValue
          }
          // 查找故障状态
          const findFault = this.$tool.findDataItemByAttr(
            fault,
            'itemName',
            `${item.itemName}故障状态`
          )
          if (findFault) {
            faultStatusItemId = findFault.itemid
            item.faultItemid = findFault.itemid
            item.faultUnits = findFault.units
            item.faultItemValue = findFault.itemValue
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(findFault.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(findFault.itemid),
                var: 'diskList'
              })
            }
          }
        })
        this.diskList = disk

        if (this.diskList.length > 0) {
          // 模块数量
          this.$set(this.moduleList[0], 'count', this.diskList.length)
          const itemids = [onlineStatusItemId, faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
        }
      }

      // CPU
      if (data.methed === 'getItemServerCpuData') {
        const getItemServerCpuData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        let faultStatusItemId = ''
        getItemServerCpuData.forEach((item) => {
          const itemName = this.$tool.delStringCh(item.itemName)
          const getCpuItem = this.$tool.findDataItemByAttr(
            this.cpuList,
            'itemTag',
            itemName
          )
          if (getCpuItem === null) {
            this.$set(this.cpuList, this.cpuList.length, {
              name: `CPU${this.cpuList.length + 1}`,
              itemTag: itemName
            })
          }
          // 线程
          if (item.itemName.indexOf('线程数:') !== -1) {
            const itemName = this.$tool.delStringCh(item.itemName)
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              itemName
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'threadItemid',
              item.itemid
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'threadItemValue',
              item.itemValue
            )
            this.$set(this.cpuList[getCpuItem.index], 'threadUnits', item.units)
          }
          // 核数量
          if (item.itemName.indexOf('核心数:') !== -1) {
            const itemName = this.$tool.delStringCh(item.itemName)
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              itemName
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'nuclearItemid',
              item.itemid
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'nuclearItemValue',
              item.itemValue
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'nuclearUnits',
              item.units
            )
          }
          // 故障状态
          if (item.itemName.indexOf('故障状态:') !== -1) {
            const itemName = this.$tool.delStringCh(item.itemName)
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              itemName
            )
            faultStatusItemId = item.itemid
            this.$set(
              this.cpuList[getCpuItem.index],
              'faultItemid',
              item.itemid
            )
            this.$set(this.cpuList[getCpuItem.index], 'faultUnits', item.units)
            this.$set(
              this.cpuList[getCpuItem.index],
              'faultItemValue',
              item.itemValue
            )

            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )

            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'cpuList'
              })
            }
          }

          // 频率
          if (item.itemName.indexOf('当前频率:') !== -1) {
            const itemName = this.$tool.delStringCh(item.itemName)
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              itemName
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'frequencyItemid',
              item.itemid
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'frequencyItemValue',
              item.itemValue
            )
            this.$set(
              this.cpuList[getCpuItem.index],
              'frequencyUnits',
              item.units
            )
          }
        })
        if (this.cpuList.length > 0) {
          // 模块数量
          this.$set(this.moduleList[1], 'count', this.cpuList.length)
          const itemids = [faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
        }
      }

      // 网卡
      if (data.methed === 'getItemServerNetCardData') {
        const getItemServerNetCardData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const networkCardList = []
        let faultStatusItemId = ''
        let connectionStatusItemId = ''
        getItemServerNetCardData.forEach((item) => {
          if (item.itemName.indexOf('故障状态') !== -1) {
            const itemName = item.itemName.split('故障状态')[0]
            const getItem = this.$tool.findDataItemByAttr(
              networkCardList,
              'itemName',
              itemName
            )
            const index = getItem ? getItem.index : networkCardList.length
            faultStatusItemId = item.itemid
            if (networkCardList[index]) {
              networkCardList[index].faultItemid = item.itemid
              networkCardList[index].faultItemValue = item.itemValue
              networkCardList[index].faultUnits = item.units
            } else {
              networkCardList[index] = {
                itemName: itemName,
                faultItemid: item.itemid,
                faultItemValue: item.itemValue,
                faultUnits: item.units
              }
            }
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'networkCardList'
              })
            }
          }
          if (item.itemName.indexOf('MAC地址') !== -1) {
            const itemName = item.itemName.split('MAC地址')[0]
            const getItem = this.$tool.findDataItemByAttr(
              networkCardList,
              'itemName',
              itemName
            )
            const index = getItem ? getItem.index : networkCardList.length
            if (networkCardList[index]) {
              networkCardList[index].macItemid = item.itemid
              networkCardList[index].macItemValue = item.itemValue
              networkCardList[index].macUnits = item.units
            } else {
              networkCardList[index] = {
                itemName: itemName,
                macItemid: item.itemid,
                macItemValue: item.itemValue,
                macUnits: item.units
              }
            }
          }
          if (item.itemName.indexOf(' 连接状态') !== -1) {
            const itemName = item.itemName.split(' 连接状态')[0]
            const getItem = this.$tool.findDataItemByAttr(
              networkCardList,
              'itemName',
              itemName
            )
            const index = getItem ? getItem.index : networkCardList.length
            connectionStatusItemId = item.itemid
            if (networkCardList[index]) {
              networkCardList[index].connectionItemid = item.itemid
              networkCardList[index].connectionItemValue = item.itemValue
              networkCardList[index].connectionUnits = item.units
            } else {
              networkCardList[index] = {
                itemName: itemName,
                connectionItemid: item.itemid,
                connectionItemValue: item.itemValue,
                connectionUnits: item.units
              }
            }
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'networkCardList'
              })
            }
          }
        })
        networkCardList.forEach((item) => {
          const getItem = this.$tool.findDataItemByAttr(
            getItemServerNetCardData,
            'itemName',
            item.itemName
          )
          item.itemValue = getItem.itemValue
          item.itemid = getItem.itemid
          item.units = getItem.units
        })
        this.networkCardList = networkCardList
        if (this.networkCardList.length > 0) {
          this.$set(this.moduleList[2], 'count', this.networkCardList.length)
          const itemids = [connectionStatusItemId, faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
        }
      }

      // 风扇
      if (data.methed === 'getItemServerFanData') {
        const getItemServerFanData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const fanList = []
        let faultStatusItemId = ''
        getItemServerFanData.forEach((item) => {
          if (item.itemName.indexOf('转速') !== -1) {
            const itemName = item.itemName.split('转速')[0]
            const getItem = this.$tool.findDataItemByAttr(
              fanList,
              'itemName',
              itemName
            )
            const index = getItem ? getItem.index : fanList.length
            if (fanList[index]) {
              fanList[index].speedItemid = item.itemid
              fanList[index].speedItemValue = item.itemValue
              fanList[index].speedUnits = item.units
            } else {
              fanList[index] = {
                itemName: itemName,
                speedItemid: item.itemid,
                speedItemValue: item.itemValue,
                speedUnits: item.units
              }
            }
          }
          if (item.itemName.indexOf('故障状态') !== -1) {
            const itemName = item.itemName.split('故障状态')[0]
            const getItem = this.$tool.findDataItemByAttr(
              fanList,
              'itemName',
              itemName
            )
            const index = getItem ? getItem.index : fanList.length
            faultStatusItemId = item.itemid
            if (fanList[index]) {
              fanList[index].faultItemid = item.itemid
              fanList[index].faultItemValue = item.itemValue
              fanList[index].faultUnits = item.units
            } else {
              fanList[index] = {
                itemName: itemName,
                faultItemid: item.itemid,
                faultItemValue: item.itemValue,
                faultUnits: item.units
              }
            }
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'fanList'
              })
            }
          }
        })
        this.fanList = fanList
        if (this.fanList.length > 0) {
          this.$set(this.moduleList[3], 'count', this.fanList.length)
          const itemids = [faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
        }
      }

      // 电源
      if (data.methed === 'getItemServerPowerData') {
        const serverSystemInfoData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        let onlineStatusItemId = ''
        let faultStatusItemId = ''
        serverSystemInfoData.forEach((item) => {
          let itemName = `${item.itemName.split('电源')[0]}电源`
          const getMemoryItem = this.$tool.findDataItemByAttr(
            this.powerList,
            'name',
            itemName
          )
          if (getMemoryItem === null) {
            this.$set(this.powerList, this.powerList.length, {
              name: itemName,
              itemTag: itemName
            })
          }
          // 在线状态
          if (item.itemName.indexOf('在线状态') !== -1) {
            let itemName = `${item.itemName.split('电源')[0]}电源`
            const getPowerItem = this.$tool.findDataItemByAttr(
              this.powerList,
              'itemTag',
              itemName
            )
            onlineStatusItemId = item.itemid
            this.$set(
              this.powerList[getPowerItem.index],
              'onlineItemid',
              item.itemid
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'onlineItemValue',
              item.itemValue
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'onlineUnits',
              item.units
            )
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'powerList'
              })
            }
          }
          // 故障状态
          if (item.itemName.indexOf('故障状态') !== -1) {
            let itemName = `${item.itemName.split('电源')[0]}电源`
            const getPowerItem = this.$tool.findDataItemByAttr(
              this.powerList,
              'itemTag',
              itemName
            )
            faultStatusItemId = item.itemid
            this.$set(
              this.powerList[getPowerItem.index],
              'faultItemid',
              item.itemid
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'faultItemValue',
              item.itemValue
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'faultUnits',
              item.units
            )
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'powerList'
              })
            }
          }
          // 电压
          if (item.itemName.indexOf('电压') !== -1) {
            let itemName = `${item.itemName.split('电源')[0]}电源`
            const getPowerItem = this.$tool.findDataItemByAttr(
              this.powerList,
              'itemTag',
              itemName
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'voltageItemid',
              item.itemid
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'voltageItemValue',
              item.itemValue
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'voltageUnits',
              item.units
            )
          }
          // 功率
          if (item.itemName.indexOf('功率') !== -1) {
            let itemName = `${item.itemName.split('电源')[0]}电源`
            const getPowerItem = this.$tool.findDataItemByAttr(
              this.powerList,
              'itemTag',
              itemName
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'powerItemid',
              item.itemid
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'powerItemValue',
              item.itemValue
            )
            this.$set(
              this.powerList[getPowerItem.index],
              'powerUnits',
              item.units
            )
          }
        })
        if (this.powerList.length > 0) {
          // 模块数量
          this.$set(this.moduleList[4], 'count', this.powerList.length)
          const itemids = [onlineStatusItemId, faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
        }
      }

      // 内存
      if (data.methed === 'getItemServerMemData') {
        const getItemServerMemData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        let faultStatusItemId = ''
        getItemServerMemData.forEach((item) => {
          let itemName = this.$tool.delStringCh(item.itemName)
          itemName =
            itemName.indexOf('SN') === -1
              ? itemName
              : itemName.split('SN')[0] + ':'
          const getMemoryItem = this.$tool.findDataItemByAttr(
            this.memoryList,
            'itemTag',
            itemName
          )
          if (getMemoryItem === null) {
            this.$set(this.memoryList, this.memoryList.length, {
              name: `内存${this.memoryList.length + 1}`,
              itemTag: itemName
            })
          }
          // sn
          if (
            item.itemName.indexOf('SN') !== -1 ||
            item.itemName.indexOf('sn') !== -1
          ) {
            let itemName = this.$tool.delStringCh(item.itemName)
            itemName = itemName.split('SN')[0] + ':'
            const getMemoryItem = this.$tool.findDataItemByAttr(
              this.memoryList,
              'itemTag',
              itemName
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'snItemid',
              item.itemid
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'snItemValue',
              item.itemValue
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'snUnits',
              item.units
            )
          }
          // 容量
          if (item.itemName.indexOf('内存大小') !== -1) {
            let itemName = this.$tool.delStringCh(item.itemName)
            const getMemoryItem = this.$tool.findDataItemByAttr(
              this.memoryList,
              'itemTag',
              itemName
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'storageItemid',
              item.itemid
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'storageItemValue',
              item.itemValue
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'storageUnits',
              item.units
            )
          }
          // 故障状态
          if (item.itemName.indexOf('故障状态:') !== -1) {
            const itemName = this.$tool.delStringCh(item.itemName)
            const getMemoryItem = this.$tool.findDataItemByAttr(
              this.memoryList,
              'itemTag',
              itemName
            )
            faultStatusItemId = item.itemid
            this.$set(
              this.memoryList[getMemoryItem.index],
              'faultItemid',
              item.itemid
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'faultItemValue',
              item.itemValue
            )
            this.$set(
              this.memoryList[getMemoryItem.index],
              'faultUnits',
              item.units
            )
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'memoryList'
              })
            }
          }
        })
        if (this.memoryList.length > 0) {
          this.$set(this.moduleList[5], 'count', this.memoryList.length)
          const itemids = [faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') { await this.watchAgentGetValueMap(agentGetValueMap) }
        }
      }

      // 温度
      if (data.methed === 'getItemServerTempData') {
        const getItemServerTempData = isJSONString(data[`${data.methed}`]) ? JSON.parse(data[`${data.methed}`]) : []
        const temp = { ...this.tempList }
        let boardFaultItemid = ''
        let cpuFaultItemid = ''
        getItemServerTempData.forEach((item) => {
          // 警告下限值
          if (item.itemName.indexOf('警告下限值') !== -1) {
            const itemName = item.itemName.split('Temp警告下限值')[0]
            const attr =
              itemName.indexOf('CPU') !== -1 ? 'cpuTemp' : 'boardTemp'
            const getItem = this.$tool.findDataItemByAttr(
              temp[`${attr}`],
              'name',
              itemName
            )
            const index = getItem ? getItem.index : temp[`${attr}`].length
            if (temp[`${attr}`][index]) {
              temp[`${attr}`][index].warnDowmValueItemid = item.itemid
              temp[`${attr}`][index].warnDowmValueItemValue = item.itemValue
              temp[`${attr}`][index].warnDowmValueUnits = item.units
            } else {
              temp[`${attr}`][index] = {
                name: itemName,
                warnDowmValueItemid: item.itemid,
                warnDowmValueItemValue: item.itemValue,
                warnDowmValueUnits: item.units,
                activeTempValueItemValue: [],
                activeTempValueUnits: [],
                time: []
              }
            }
          }
          // 警告上限值
          if (item.itemName.indexOf('警告上限值') !== -1) {
            const itemName = item.itemName.split('Temp警告上限值')[0]
            const attr =
              itemName.indexOf('CPU') !== -1 ? 'cpuTemp' : 'boardTemp'
            const getItem = this.$tool.findDataItemByAttr(
              temp[`${attr}`],
              'name',
              itemName
            )
            const index = getItem ? getItem.index : temp[`${attr}`].length
            if (temp[`${attr}`][index]) {
              temp[`${attr}`][index].warnUpValueItemid = item.itemid
              temp[`${attr}`][index].warnUpValueItemValue = item.itemValue
              temp[`${attr}`][index].warnUpValueUnits = item.units
            } else {
              temp[`${attr}`][index] = {
                name: itemName,
                warnUpValueItemid: item.itemid,
                warnUpValueItemValue: item.itemValue,
                warnUpValueUnits: item.units,
                activeTempValueItemValue: [],
                activeTempValueUnits: [],
                time: []
              }
            }
          }
          // 故障状态
          if (item.itemName.indexOf('故障状态') !== -1) {
            const itemName = item.itemName.split('Temp故障状态')[0]
            const attr =
              itemName.indexOf('CPU') !== -1 ? 'cpuTemp' : 'boardTemp'
            if (itemName.indexOf('CPU') !== -1) {
              cpuFaultItemid = item.itemid
            } else {
              boardFaultItemid = item.itemid
            }
            const getItem = this.$tool.findDataItemByAttr(
              temp[`${attr}`],
              'name',
              itemName
            )
            const index = getItem ? getItem.index : temp[`${attr}`].length
            if (temp[`${attr}`][index]) {
              temp[`${attr}`][index].faultValueItemid = item.itemid
              temp[`${attr}`][index].faultValueItemValue = item.itemValue
              temp[`${attr}`][index].faultValueUnits = item.units
            } else {
              temp[`${attr}`][index] = {
                name: itemName,
                faultValueItemid: item.itemid,
                faultValueItemValue: item.itemValue,
                faultValueUnits: item.units,
                activeTempValueItemValue: [],
                activeTempValueUnits: [],
                time: []
              }
            }
          }
          // 当前温度
          if (item.itemName.indexOf('当前温度') !== -1) {
            const itemName = item.itemName.split('Temp当前温度')[0]
            const attr =
              itemName.indexOf('CPU') !== -1 ? 'cpuTemp' : 'boardTemp'
            const getItem = this.$tool.findDataItemByAttr(
              temp[`${attr}`],
              'name',
              itemName
            )
            const index = getItem ? getItem.index : temp[`${attr}`].length
            const clock = new Date()
            if (temp[`${attr}`][index]) {
              temp[`${attr}`][index].activeTempValueItemid = item.itemid
              temp[`${attr}`][index].activeTempValueItemValue.push(
                item.itemValue
              )
              temp[`${attr}`][index].activeTempValueUnits.push(item.units)
              temp[`${attr}`][index].activeTempValueType = item.valueType
              temp[`${attr}`][index].time.push(
                `${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`
              )
            } else {
              temp[`${attr}`][index] = {
                name: itemName,
                activeTempValueItemid: item.itemid,
                activeTempValueItemValue: [item.itemValue],
                activeTempValueUnits: [item.units],
                activeTempValueType: item.valueType,
                time: [`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`]
              }
            }
          }
          // 临界温度下限值
          if (item.itemName.indexOf('临界温度下限值') !== -1) {
            const itemName = item.itemName.split('Temp临界温度下限值')[0]
            const attr =
              itemName.indexOf('CPU') !== -1 ? 'cpuTemp' : 'boardTemp'
            const getItem = this.$tool.findDataItemByAttr(
              temp[`${attr}`],
              'name',
              itemName
            )
            const index = getItem ? getItem.index : temp[`${attr}`].length
            if (temp[`${attr}`][index]) {
              temp[`${attr}`][index].criticalUpValueItemid = item.itemid
              temp[`${attr}`][index].criticalUpValueItemValue = item.itemValue
              temp[`${attr}`][index].criticalUpValueUnits = item.units
            } else {
              temp[`${attr}`][index] = {
                name: itemName,
                criticalUpValueItemid: item.itemid,
                criticalUpValueItemValue: item.itemValue,
                criticalUpValueUnits: item.units,
                activeTempValueItemValue: [],
                activeTempValueUnits: [],
                time: []
              }
            }
          }
          // 临界温度上限值
          if (item.itemName.indexOf('临界温度上限值') !== -1) {
            const itemName = item.itemName.split('Temp临界温度上限值')[0]
            const attr =
              itemName.indexOf('CPU') !== -1 ? 'cpuTemp' : 'boardTemp'
            const getItem = this.$tool.findDataItemByAttr(
              temp[`${attr}`],
              'name',
              itemName
            )
            const index = getItem ? getItem.index : temp[`${attr}`].length
            if (temp[`${attr}`][index]) {
              temp[`${attr}`][index].criticalUpValueItemid = item.itemid
              temp[`${attr}`][index].criticalUpValueItemValue = item.itemValue
              temp[`${attr}`][index].criticalUpValueUnits = item.units
            } else {
              temp[`${attr}`][index] = {
                name: itemName,
                criticalUpValueItemid: item.itemid,
                criticalUpValueItemValue: item.itemValue,
                criticalUpValueUnits: item.units,
                activeTempValueItemValue: [],
                activeTempValueUnits: [],
                time: []
              }
            }
          }
        })
        this.tempList = temp
        const boardTempCount = this.tempList.boardTemp
          ? this.tempList.boardTemp.length
          : 0
        const cpuTempCount = this.tempList.cpuTemp
          ? this.tempList.cpuTemp.length
          : 0
        this.$set(this.moduleList[6], 'count', boardTempCount + cpuTempCount)

        const agentGetValueMap = await this.agentGetValueMap(
          [boardFaultItemid, cpuFaultItemid].toString()
        )
        const agentGetValueMapList = agentGetValueMap
          ? JSON.parse(agentGetValueMap)
          : []
        const cpuFaultKey = agentGetValueMapList.findIndex(
          (items) => items.newvalue === 'OK' && items.itemid === cpuFaultItemid
        )
        const boardFaultKey = agentGetValueMapList.findIndex(
          (items) =>
            items.newvalue === 'OK' && items.itemid === boardFaultItemid
        )
        let haveCpuFault = false
        let haveBoardFault = false
        if (this.tempList.cpuTemp) {
          this.tempList.cpuTemp.forEach((item) => {
            if (item.faultValueItemValue !== cpuFaultKey && !haveCpuFault) { haveCpuFault = true }
          })
        }
        if (this.tempList.boardTemp) {
          this.tempList.boardTemp.forEach((item) => {
            if (item.faultValueItemValue !== boardFaultKey && !haveBoardFault) { haveBoardFault = true }
          })
        }
        if (haveBoardFault || haveCpuFault) {
          this.$set(this.moduleList[6], 'status', false)
        }
      }

      if (!this.initGetMonitorItemHistoryData) {
        this.tempList.boardTemp.forEach(item => {
          currentAllMonitorItemIds.push(this.ioUsed.readItemId)
          currentAllMonitorItemValueTypes.push(this.ioUsed.readValueType)
        })
        this.tempList.cpuTemp.forEach(item => {
          currentAllMonitorItemIds.push(this.ioUsed.readItemId)
          currentAllMonitorItemValueTypes.push(this.ioUsed.readValueType)
        })
        this.initGetMonitorItemHistoryData = true
        this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
      }
    },
    // 求各种设备的告警日志itemid数组
    getAlertLogArray(deviceTypeData) {
      const alerLogItemIdArr = []
      deviceTypeData.forEach(item => {
        if (item.itemid) {
          alerLogItemIdArr.push(item.itemid + '')
        }
      })
      return alerLogItemIdArr
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
