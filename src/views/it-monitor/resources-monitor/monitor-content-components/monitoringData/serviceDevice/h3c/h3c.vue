<template>
  <div class="h3c">
    <MonitorServiceOutlineByH3C
      :server-outline="serverOutline"
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
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch v-model="watchItemSwitch" @change="changeItemSwitch" />
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
              <img v-if="item.img" class="module-item-img" :src="item.img">
              <div class="module-item-title">
                {{ item.title }}（{{ item.count }}）
              </div>
            </div>
            <img
              v-if="item.status"
              class="status-img"
              src="image/common/right.png"
              alt=""
            >
            <img
              v-if="!item.status"
              class="monitor-icon"
              src="image/common/alarm.png"
              alt=""
            >
          </div>
        </div>
      </div>
    </div>
    <div class="chunk margin-left-15 margin-right-15">
      <MonitorServiceDiskByH3C
        v-if="moduleKey === 'disk'"
        :module-data="diskList"
        :online-status-list="diskOnlineStatusList"
        :fault-status-list="diskFaultStatusList"
      />
      <MonitorServiceCpuByH3C
        v-if="moduleKey === 'cpu'"
        :module-data="cpuList"
        :fault-status-list="cpuFaultStatusList"
      />
      <MonitorServiceNetWorkCardByH3C
        v-if="moduleKey === 'networkCard'"
        :module-data="networkCardList"
        :fault-status-list="networkCardFaultStatusList"
        :connection-status-list="networkCardConnectionStatusList"
      />
      <MonitorServiceFanByH3C
        v-if="moduleKey === 'fan'"
        :module-data="fanList"
        :fault-status-list="fanListFaultStatusList"
      />
      <MonitorServicePowerByH3C
        v-if="moduleKey === 'power'"
        :module-data="powerList"
        :online-status-list="powerOnlineStatusList"
        :fault-status-list="powerFaultStatusList"
      />
      <MonitorServiceMemoryByH3C
        v-if="moduleKey === 'memory'"
        :module-data="memoryList"
        :fault-status-list="memoryFaultStatusList"
      />
      <MonitorServiceTemperatureByH3C
        v-if="moduleKey === 'temperature'"
        :module-data="tempList.listTemp"
      />
    </div>
  </div>
</template>

<script>
import { isJSONString } from '@/utils/utils'
import monitorServiceMixins from '../mixins/monitor-service-mixins'
import dataWatchMixins from '../mixins/data-watch-mixins'

export default {
  name: 'H3c',
  mixins: [monitorServiceMixins, dataWatchMixins],
  methods: {
    async watchAgentGetHostData(data) {
      console.log(JSON.stringify(data))
      // 系统概况
      if (data.methed === 'getItemServerHealthData') {
        const getItemServerHealthData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const deviceSNItemIndex = getItemServerHealthData.findIndex(
          item => item.itemName === 'h3c'
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
        let onlineStatusItemId = ''
        let faultStatusItemId = ''
        console.log(getItemServerDiskData)
        getItemServerDiskData.forEach(item => {
          const splitName = item.itemName.split(']_')
          const itemName = splitName[0] + ']'
          const getDiskItem = this.$tool.findDataItemByAttr(
            disk,
            'itemName',
            itemName
          )
          if (getDiskItem === null) {
            disk.push({
              itemid: item.itemid,
              itemName,
              itemValue: itemName
            })
          }
          // 在线状态
          if (item.itemName.indexOf('DATA_Status') !== -1) {
            onlineStatusItemId = item.itemid
            const getDiskItem = this.$tool.findDataItemByAttr(
              disk,
              'itemName',
              itemName
            )
            if (getDiskItem !== null) {
              disk[getDiskItem.index].onlineItemid = item.itemid
              disk[getDiskItem.index].onlineUnits = item.units
              disk[getDiskItem.index].onlineItemValue = item.itemValue
            }
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'diskList'
              })
            }
          }
          // 类型
          if (item.itemName.indexOf('HardDiskType') !== -1) {
            const getDiskItem = this.$tool.findDataItemByAttr(
              disk,
              'itemName',
              itemName
            )
            if (getDiskItem !== null) {
              disk[getDiskItem.index].typeItemid = item.itemid
              disk[getDiskItem.index].typeUnits = item.units
              const typeSplit = item.itemValue.split(' ')
              disk[getDiskItem.index].typeItemValue =
                typeSplit[typeSplit.length - 1]
            }
          }
          // 故障状态
          if (item.itemName.indexOf('HealthStatus') !== -1) {
            console.log(faultStatusItemId)
            faultStatusItemId = item.itemid
            const getDiskItem = this.$tool.findDataItemByAttr(
              disk,
              'itemName',
              itemName
            )
            if (getDiskItem !== null) {
              disk[getDiskItem.index].faultItemid = item.itemid
              disk[getDiskItem.index].faultUnits = item.units
              disk[getDiskItem.index].faultItemValue = item.itemValue
            }
            const findVar = this.$tool.findDataItemByAttr(
              this.moduleTypeItemId,
              'itemid',
              Number(item.itemid)
            )
            if (!findVar) {
              this.$set(this.moduleTypeItemId, this.moduleTypeItemId.length, {
                itemid: Number(item.itemid),
                var: 'diskList'
              })
            }
          }
          // 容量
          if (item.itemName.indexOf('DATA_CapacityInGB') !== -1) {
            const unitSplit = item.units.split('i')
            const unit = unitSplit.join('')
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform(
              unit,
              'b',
              Number(item.itemValue)
            )
            disk[getDiskItem.index].storageItemid = item.itemid
            disk[getDiskItem.index].storageUnits = 'b'
            disk[getDiskItem.index].storageItemValue = sizeUnitsTransform.size
          }
        })
        this.diskList = disk
        console.log(disk)
        if (this.diskList.length > 0) {
          // 模块数量
          this.$set(this.moduleList[0], 'count', this.diskList.length)
          const itemids = [onlineStatusItemId, faultStatusItemId]
          console.log('磁盘', itemids.toString())
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') {
            await this.watchAgentGetValueMap(agentGetValueMap)
          }
        }
      }
      // CPU
      if (data.methed === 'getItemServerCpuData') {
        const getItemServerCpuData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        let faultStatusItemId = ''
        getItemServerCpuData.forEach(item => {
          const splitName = item.itemName.split('_')
          splitName.pop()
          const itemName = splitName.join('_')
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
          let threadItemName = ''
          if (item.itemName.indexOf('线程数:') !== -1) {
            threadItemName = this.$tool.delStringCh(item.itemName)
          }
          if (item.itemName.indexOf('_Threads') !== -1) {
            // 网吧环境
            threadItemName = item.itemName.split('_Threads')[0]
          }
          if (threadItemName !== '') {
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              threadItemName
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
            this.$set(
              this.cpuList[getCpuItem.index],
              'threadUnits',
              item.units
            )
          }
          // 核数量
          let coreItemName = ''
          if (item.itemName.indexOf('核心数:') !== -1) {
            coreItemName = this.$tool.delStringCh(item.itemName)
          }
          if (item.itemName.indexOf('_Cores') !== -1) {
            // 网吧环境
            coreItemName = item.itemName.split('_Cores')[0]
          }
          if (coreItemName !== '') {
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              coreItemName
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
          let faultItemName = ''
          if (item.itemName.indexOf('故障状态:') !== -1) {
            faultItemName = this.$tool.delStringCh(item.itemName)
          }
          if (item.itemName.indexOf('_Status') !== -1) {
            // 网吧环境
            faultItemName = item.itemName.split('_Status')[0]
          }
          if (faultItemName !== '') {
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              faultItemName
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
          let frequencyItemName = ''
          if (item.itemName.indexOf('当前频率:') !== -1) {
            frequencyItemName = this.$tool.delStringCh(item.itemName)
          }
          if (item.itemName.indexOf('_Threads') !== -1) {
            // 网吧环境
            frequencyItemName = item.itemName.split('_Threads')[0]
          }
          if (frequencyItemName !== '') {
            const getCpuItem = this.$tool.findDataItemByAttr(
              this.cpuList,
              'itemTag',
              frequencyItemName
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
          if (this.itMonitorRequireAgreement !== 'WS') {
            await this.watchAgentGetValueMap(agentGetValueMap)
          }
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
        getItemServerNetCardData.forEach(item => {
          if (item.itemName.indexOf('Name') !== -1) {
            networkCardList.push({
              itemName: item.itemValue,
              itemValue: item.itemValue,
              itemid: item.itemid,
              units: item.units
            })
          }
        })
        getItemServerNetCardData.forEach(item => {
          if (item.itemName.indexOf('MAC') !== -1) {
            const itemNameSplit = item.itemName.split('MAC')
            const trimSpecial = this.$tool.trimSpecial(
              itemNameSplit[itemNameSplit.length - 1]
            )
            const getItem = this.$tool.findDataItemByAttr(
              networkCardList,
              'itemName',
              trimSpecial
            )
            if (getItem !== null) {
              networkCardList[getItem.index].macItemid = item.itemid
              networkCardList[getItem.index].macItemValue = item.itemValue
              networkCardList[getItem.index].macUnits = item.units
            }
          }
          if (item.itemName.indexOf('Status') !== -1) {
            const itemNameSplit = item.itemName.split('Status')
            const trimSpecial = this.$tool.trimSpecial(
              itemNameSplit[itemNameSplit.length - 1]
            )
            const getItem = this.$tool.findDataItemByAttr(
              networkCardList,
              'itemName',
              trimSpecial
            )
            if (getItem !== null) {
              networkCardList[getItem.index].connectionItemid = item.itemid
              networkCardList[getItem.index].connectionItemValue =
                item.itemValue
              networkCardList[getItem.index].connectionUnits = item.units
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
          }
        })
        networkCardList.forEach(item => {
          const getItem = this.$tool.findDataItemByAttr(
            getItemServerNetCardData,
            'itemName',
            item.itemName
          )
          if (getItem !== null) {
            item.itemValue = getItem.itemValue
            item.itemid = getItem.itemid
            item.units = getItem.units
          }
        })
        this.networkCardList = networkCardList
        if (this.networkCardList.length > 0) {
          this.$set(this.moduleList[2], 'count', this.networkCardList.length)
          const itemids = [connectionStatusItemId, faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') {
            await this.watchAgentGetValueMap(agentGetValueMap)
          }
        }
      }
      // 风扇
      if (data.methed === 'getItemServerFanData') {
        const getItemServerFanData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const fanList = []
        let faultStatusItemId = ''
        getItemServerFanData.forEach(item => {
          const splitName = item.itemName.split(']_')
          const itemName = splitName[0] + ']'
          const getFanItem = this.$tool.findDataItemByAttr(
            fanList,
            'itemName',
            itemName
          )
          if (getFanItem === null) {
            fanList.push({
              itemid: item.itemid,
              itemName,
              itemValue: itemName
            })
          }
          if (item.itemName.indexOf('Status') !== -1) {
            const getItem = this.$tool.findDataItemByAttr(
              fanList,
              'itemName',
              itemName
            )
            faultStatusItemId = item.itemid
            if (getItem !== null) {
              fanList[getItem.index].faultItemid = item.itemid
              fanList[getItem.index].faultItemValue = item.itemValue
              fanList[getItem.index].faultUnits = item.units
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
          }
          if (item.itemName.indexOf('Speed') !== -1) {
            const getItem = this.$tool.findDataItemByAttr(
              fanList,
              'itemName',
              itemName
            )
            if (getItem !== null) {
              fanList[getItem.index].speedItemid = item.itemid
              fanList[getItem.index].speedItemValue = item.itemValue
              fanList[getItem.index].speedUnits = item.units
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
          if (this.itMonitorRequireAgreement !== 'WS') {
            await this.watchAgentGetValueMap(agentGetValueMap)
          }
        }
      }
      // 电源
      if (data.methed === 'getItemServerPowerData') {
        const serverSystemInfoData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        let faultStatusItemId = ''
        const powerList = []
        serverSystemInfoData.forEach(item => {
          if (item.itemName.indexOf(']_') !== -1) {
            const splitName = item.itemName.split(']_')
            const itemName = splitName[0] + ']'
            const getPowerItem = this.$tool.findDataItemByAttr(
              powerList,
              'name',
              itemName
            )
            if (getPowerItem === null) {
              powerList.push({
                name: itemName,
                itemTag: itemName
              })
            }
            if (item.itemName.indexOf('Status') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                powerList,
                'itemTag',
                itemName
              )
              faultStatusItemId = item.itemid
              if (getItem !== null) {
                powerList[getItem.index].faultItemid = item.itemid
                powerList[getItem.index].faultItemValue = item.itemValue
                powerList[getItem.index].faultUnits = item.units
                const findVar = this.$tool.findDataItemByAttr(
                  this.moduleTypeItemId,
                  'itemid',
                  Number(item.itemid)
                )
                if (!findVar) {
                  this.$set(
                    this.moduleTypeItemId,
                    this.moduleTypeItemId.length,
                    { itemid: Number(item.itemid), var: 'powerList' }
                  )
                }
              }
            }
            if (item.itemName.indexOf('Max') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                powerList,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                powerList[getItem.index].powerItemid = item.itemid
                powerList[getItem.index].powerItemValue = item.itemValue
                powerList[getItem.index].powerUnits = item.units
              }
            }
            if (item.itemName.indexOf('InputVoltage') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                powerList,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                powerList[getItem.index].voltageItemid = item.itemid
                powerList[getItem.index].voltageItemValue = item.itemValue
                powerList[getItem.index].voltageUnits = item.units
              }
            }
          }
        })
        this.powerList = powerList
        if (this.powerList.length > 0) {
          this.$set(this.moduleList[4], 'count', this.powerList.length)
          const itemids = [faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') {
            await this.watchAgentGetValueMap(agentGetValueMap)
          }
        }
      }
      // 内存
      if (data.methed === 'getItemServerMemData') {
        const getItemServerMemData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const memoryList = []
        let faultStatusItemId = ''
        getItemServerMemData.forEach(item => {
          if (item.itemName.indexOf(']_') !== -1) {
            const splitName = item.itemName.split(']_')
            const itemName = splitName[0] + ']'
            const getPowerItem = this.$tool.findDataItemByAttr(
              memoryList,
              'name',
              itemName
            )
            if (getPowerItem === null) {
              memoryList.push({
                name: itemName,
                itemTag: itemName
              })
            }
            if (item.itemName.indexOf('Status') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                memoryList,
                'itemTag',
                itemName
              )
              faultStatusItemId = item.itemid
              if (getItem !== null) {
                memoryList[getItem.index].faultItemid = item.itemid
                memoryList[getItem.index].faultItemValue = item.itemValue
                memoryList[getItem.index].faultUnits = item.units
                const findVar = this.$tool.findDataItemByAttr(
                  this.moduleTypeItemId,
                  'itemid',
                  Number(item.itemid)
                )
                if (!findVar) {
                  this.$set(
                    this.moduleTypeItemId,
                    this.moduleTypeItemId.length,
                    { itemid: Number(item.itemid), var: 'memoryList' }
                  )
                }
              }
            }
            if (item.itemName.indexOf('Size') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                memoryList,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                memoryList[getItem.index].storageItemid = item.itemid
                memoryList[getItem.index].storageItemValue = item.itemValue
                memoryList[getItem.index].storageUnits = item.units || 'MB'
              }
            }
          }
        })
        this.memoryList = memoryList
        if (this.memoryList.length > 0) {
          this.$set(this.moduleList[5], 'count', this.memoryList.length)
          const itemids = [faultStatusItemId]
          const agentGetValueMap = await this.agentGetValueMap(
            itemids.toString()
          )
          if (this.itMonitorRequireAgreement !== 'WS') {
            await this.watchAgentGetValueMap(agentGetValueMap)
          }
        }
      }
      // 温度
      if (data.methed === 'getItemServerTempData') {
        const getItemServerTempData = isJSONString(data[`${data.methed}`])
          ? JSON.parse(data[`${data.methed}`])
          : []
        const temp = []
        getItemServerTempData.forEach(item => {
          if (item.itemName.indexOf(']_') !== -1) {
            const splitName = item.itemName.split(']_')
            const itemName = splitName[0] + ']'
            const getPowerItem = this.$tool.findDataItemByAttr(
              temp,
              'name',
              itemName
            )
            if (getPowerItem === null) {
              temp.push({
                name: itemName,
                itemTag: itemName
              })
            }
            if (item.itemName.indexOf('TempHigherCriticalThres') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                temp,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                temp[getItem.index].higherCriticalThresItemid = item.itemid
                temp[getItem.index].higherCriticalThresItemValue =
                  item.itemValue
                temp[getItem.index].higherCriticalThresUnits = item.units
              }
            }
            if (item.itemName.indexOf('TempHigherNonCriticalThres') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                temp,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                temp[getItem.index].higherNonCriticalThresItemid = item.itemid
                temp[getItem.index].higherNonCriticalThresItemValue =
                  item.itemValue
                temp[getItem.index].higherNonCriticalThresUnits = item.units
              }
            }
            if (item.itemName.indexOf('TempLowerCriticalThres') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                temp,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                temp[getItem.index].lowerCriticalThresItemid = item.itemid
                temp[getItem.index].lowerCriticalThresItemValue =
                  item.itemValue
                temp[getItem.index].lowerCriticalThresUnits = item.units
              }
            }
            if (item.itemName.indexOf('TempLowerNonCriticalThres') !== -1) {
              const getItem = this.$tool.findDataItemByAttr(
                temp,
                'itemTag',
                itemName
              )
              if (getItem !== null) {
                temp[getItem.index].lowerNonCriticalThresItemid = item.itemid
                temp[getItem.index].lowerNonCriticalThresItemValue =
                  item.itemValue
                temp[getItem.index].lowerNonCriticalThresUnits = item.units
              }
            }
          }
        })
        this.$set(this.tempList, 'listTemp', temp)
        if (this.tempList.listTemp.length > 0) {
          this.$set(this.moduleList[6], 'count', this.tempList.listTemp.length)
          const TempHealthStatusItem = this.$tool.findDataItemByAttr(
            this.serverOutline,
            'itemName',
            'h3cTempHealthStatus[0]'
          )
          if (TempHealthStatusItem === null) return
          this.$set(
            this.moduleList[6],
            'status',
            Number(TempHealthStatusItem.itemValue) === 0
          )
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
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
