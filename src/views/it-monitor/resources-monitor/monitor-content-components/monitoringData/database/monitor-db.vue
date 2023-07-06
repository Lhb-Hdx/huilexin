<template>
  <div class="monitor-device">
    <!-- 概况 -->
    <monitorHostInfo
      :up-status="upStatus"
      :usability="usability"
      :up-time="upTime"
      :db-version="dbVersion"
      :db-data-file-size="dbDataFileSize"
    />
    <!-- =====================	 oracle   ======================== -->

    <div v-if="subType === 104">
      <div class="chunk margin-left-7-5 margin-right-7-5">
        <!-- 数据锁数量 -->
        <monitorDbLockCount :lock="lock" />
        <!-- 进程数量 -->
        <monitorDbProcessCount :process-count="processCount" />
        <!-- 用户活动 -->
        <monitorDbUserActivity :user-activity="userActivity" />
      </div>
      <div class=" margin-left-7-5 margin-right-7-5">
        <!-- ASM卷空间 -->
        <monitorDbAsm :volume-space="volumeSpace" />
      </div>
      <div class=" margin-left-7-5 margin-right-7-5">
        <!-- 表空间 -->
        <monitorDbTable :table="table" />
      </div>
      <div class="chunk margin-left-7-5 margin-right-7-5">
        <!-- 等待时间 -->
        <monitorDbTime :wait-time="waitTime" />
        <!-- 事务 -->
        <monitorDbAffair :affair="affair" />
      </div>
    </div>

    <!-- =====================SQL Server======================== -->
    <div v-if="subType === 103">
      <div class="chunk margin-left-7-5 margin-right-7-5">
        <!-- 缓冲池 -->
        <monitorDbMySQLBuffer :buffer="buffer" />
        <!-- 线程 -->
        <monitorDbMySQLThread :thread="thread" />
        <!-- 连接 -->
        <monitorDbMySQLConnect :connect="connect" />
      </div>
      <div class=" margin-left-7-5 margin-right-7-5">
        <!-- 数据库 -->
        <monitorDbMySQLDatabases :databases="databases" />
      </div>

      <div class="chunk margin-left-7-5 margin-right-7-5">
        <!-- 查询 -->
        <monitorDbMySQLQuery :query="query" />
        <!-- 网络 -->
        <monitorDbMySQLNetwork :network="network" />
      </div>

    </div>

    <!-- =====================SQL Server======================== -->
    <div v-if="subType === 105">
      <div class="chunk margin-left-7-5 margin-right-7-5">
        <!-- 日志 -->
        <monitorDbSQLServerJournal :journal="journal" />
        <!-- 锁 -->
        <monitorDbSQLServerLocking :locking="locking" />
        <!-- 内存 -->
        <monitorDbSQLServerMemory :memory="memory" />
      </div>
      <div class=" margin-left-7-5 margin-right-7-5">
        <!-- 数据库数据文件 -->
        <monitorDbSQLServerDatabase :database="database" />
      </div>

      <div class=" margin-left-7-5 margin-right-7-5">
        <!-- 数据库日志文件 -->
        <monitorDbSQLServerDatabaseLog :database-log="databaseLog" />
      </div>
      <div class="chunk margin-left-7-5 margin-right-7-5">
        <!-- 性能 -->
        <monitorDbSQLServerPerformance :performance="performance" />
        <!-- 性能2 -->
        <monitorDbSQLServerPerformanceTwo :performance-two="performanceTwo" />
      </div>

    </div>
    <div class="chunk margin-left-7-5 margin-right-7-5">
      <!-- 自定义监控项趋势图 -->
      <template v-for="item in diyItem">
        <DiyMonitorItemEchart v-if="Number(item.graphType) === 1" :key="item.id" :monitor-item="item" />
        <DiyMonitorItemDash v-if="Number(item.graphType) === 3" :key="item.id" :monitor-item="item" />
      </template>
    </div>
    <!-- 自定义监控项表单 -->
    <DiyMonitorItemForm v-if="isConfig" />
  </div>
</template>

<script>
import monitorHostInfo from '../../common/monitor-host-info'
import request from '@/utils/request'
import api from '@/api/api'
import { dateFormat, isJSONString } from '@/utils/utils'
import DiyMonitorItemForm from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-form'
import DiyMonitorItemEchart from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-echart'
import DiyMonitorItemDash from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/diyMonitorItem/diy-monitor-item-dash'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import monitorDbLockCount from './oracle/monitor-db-lock-count'
import monitorDbUserActivity from './oracle/monitor-db-user-activity'
import monitorDbProcessCount from './oracle/monitor-db-process-count'
import monitorDbTime from './oracle/monitor-db-time'
import monitorDbAffair from './oracle/monitor-db-affair'
import monitorDbAsm from './oracle/monitor-db-asm'
import monitorDbTable from './oracle/monitor-db-table'

import monitorDbSQLServerJournal from './mssql/monitor-db-SQLServer-journal'
import monitorDbSQLServerLocking from './mssql/monitor-db-SQLServer-locking'
import monitorDbSQLServerMemory from './mssql/monitor-db-SQLServer-memory'
import monitorDbSQLServerPerformance from './mssql/monitor-db-SQLServer-performance'
import monitorDbSQLServerPerformanceTwo from './mssql/monitor-db-SQLServer-performancetwo'
import monitorDbSQLServerDatabase from './mssql/monitor-db-SQLServer-database'
import monitorDbSQLServerDatabaseLog from './mssql/monitor-db-SQLServer-databaseLog'

import monitorDbMySQLBuffer from './mysql/monitor-db-MySQL-buffer'
import monitorDbMySQLThread from './mysql/monitor-db-MySQL-thread'
import monitorDbMySQLConnect from './mysql/monitor-db-MySQL-connect'
import monitorDbMySQLQuery from './mysql/monitor-db-MySQL-query'
import monitorDbMySQLNetwork from './mysql/monitor-db-MySQL-network'
import monitorDbMySQLDatabases from './mysql/monitor-db-MySQL-databases'

import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorDatabase',
  components: {
    monitorHostInfo,
    DiyMonitorItemForm,
    DiyMonitorItemEchart,
    DiyMonitorItemDash,
    monitorDbLockCount,
    monitorDbUserActivity,
    monitorDbProcessCount,
    monitorDbTime,
    monitorDbAffair,
    monitorDbAsm,
    monitorDbTable,

    monitorDbSQLServerJournal,
    monitorDbSQLServerLocking,
    monitorDbSQLServerMemory,
    monitorDbSQLServerPerformance,
    monitorDbSQLServerPerformanceTwo,
    monitorDbSQLServerDatabase,
    monitorDbSQLServerDatabaseLog,

    monitorDbMySQLBuffer,
    monitorDbMySQLThread,
    monitorDbMySQLConnect,
    monitorDbMySQLQuery,
    monitorDbMySQLNetwork,
    monitorDbMySQLDatabases
  },
  mixins: [MonitorDataMixin],
  props: {
    usability: {
      type: Number,
      default() {
        return 0
      }
    },
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
    }
  },
  data() {
    return {
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      requestInterval: 10000, // 获取统计数据间隔 毫秒
      /* 传递给子组件的数据 START */
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      dbVersion: '', // 数据库版本
      dbDataFileSize: '', // 数据文件大小
      lock: { // 数据锁
        queryLockValue: [],
        queryLockValueType: '',
        queryLockItemId: '',
        deadLockValue: [],
        deadLockValueType: '',
        deadLockItemId: '',
        time: []
      },
      userActivity: { // 用户活动
        value: [],
        valueType: '',
        itemId: '',
        time: []
      },
      processCount: { // 进程数量
        processValue: [],
        processType: '',
        processId: '',
        maxProcessValue: [],
        maxProcessType: '',
        maxProcessId: '',
        time: []
      },
      waitTime: { // 等待时间
        timeValue: [],
        timeType: '',
        timeId: '',
        freeTimeValue: [],
        freeTimeType: '',
        freeTimeId: '',
        time: []
      },
      affair: { // 事务
        affairValue: [],
        affairType: '',
        affairId: '',
        submitAffairValue: [],
        submitAffairType: '',
        submitAffairId: '',
        time: []
      },
      volumeSpace: { // 卷空间
        totalSize: '', // 总大小
        totalUnits: '',
        useSize: '', // 已用大小
        useUnits: '',
        usePercentageSize: '',
        usePercentageUnits: '',

        ocrTotalSize: '', // 总大小
        ocrTotalUnits: '',
        ocrUseSize: '', // 已用大小
        ocrUseUnits: '',
        ocrUsePercentageSize: '',
        ocrUsePercentageUnits: ''
      },
      table: [], // 表列表数据空间

      // SQL Server数据
      journal: { // 日志
        journalValue: [],
        journalValueType: '',
        journalltemId: '',
        journalItemUnits: '',

        UserJournalValue: [],
        UserJournalValueType: '',
        UserJournalItemId: '',
        UserJournalItemUnits: '',
        time: []
      },
      locking: { // 锁
        lockingValue: [],
        lockingValueType: '',
        lockingltemId: '',
        lockingltemUnits: '',

        TimeLockingValue: [],
        TimeLockingValueType: '',
        TimeLockingItemId: '',
        TimeLockingItemUnits: '',
        time: []
      },
      memory: { // 内存
        grantMemoryValue: [],
        grantMemoryValueType: '',
        grantMemoryltemId: '',
        grantMemoryltemUnits: '',

        maxMemoryValue: [],
        maxMemoryValueType: '',
        maxMemoryItemId: '',
        maxMemoryItemUnits: '',

        currentMemoryValue: [],
        currentMemoryValueType: '',
        currentMemoryItemId: '',
        currentMemoryItemUnits: '',

        totalMemoryValue: [],
        totalMemoryValueType: '',
        totalMemoryItemId: '',
        totalMemoryItemUnits: '',
        time: []
      },
      performance: { // 性能
        fullValue: [],
        fullValueType: '',
        fullItemId: '',
        fullItemUnits: '',

        searchesValue: [],
        searchesValueType: '',
        searchesItemId: '',
        searchesItemUnits: '',

        LatchValue: [],
        LatchValueType: '',
        LatchItemId: '',
        LatchItemUnits: '',
        time: []
      },
      performanceTwo: { // 性能2
        errorsValue: [],
        errorsValueType: '',
        errorsItemId: '',
        errorsItemUnits: '',

        lockValue: [],
        lockValueType: '',
        lockItemId: '',
        lockItemUnits: '',
        time: []
      },
      database: [],
      databaseLog: [],
      // database: { // 数据库
      //   totalSize: '', // 总大小
      //   totalUnits: '',
      //   useSize: '', // 已用大小
      //   useUnits: '',
      //   usePercentageSize: '',
      //   usePercentageUnits: '',

      //   dataTotalSize: '', // 总大小
      //   dataTotalUnits: '',
      //   dataUseSize: '', // 已用大小
      //   dataUseUnits: '',
      //   dataUsePercentageSize: '',
      //   dataUsePercentageUnits: ''
      // },

      // MySQL 数据
      buffer: { // 缓冲池
        bufferValue: [],
        bufferValueType: '',
        bufferItemId: '',
        bufferItemUnits: '',

        efficiencyValue: [],
        efficiencyValueType: '',
        efficiencyItemId: '',
        efficiencyItemUnits: '',
        time: []
      },

      thread: { // 线程
        cachedThreadValue: [],
        cachedThreadValueType: '',
        cachedThreadltemId: '',
        cachedThreadltemUnits: '',

        connectedThreadValue: [],
        connectedThreadValueType: '',
        connectedThreadItemId: '',
        connectedThreadItemUnits: '',

        secondThreadValue: [],
        secondThreadValueType: '',
        secondThreadItemId: '',
        secondThreadItemUnits: '',

        runningThreadValue: [],
        runningThreadValueType: '',
        runningThreadItemId: '',
        runningThreadItemUnits: '',
        time: []
      },
      connect: { // 连接
        secondConnectValue: [],
        secondConnectValueType: '',
        secondConnectItemId: '',
        secondConnectItemUnits: '',

        maxConnectValue: [],
        maxConnectValueType: '',
        maxConnectItemId: '',
        maxConnectItemUnits: '',

        errorsConnectValue: [],
        errorsConnectValueType: '',
        errorsConnectItemId: '',
        errorsConnectItemUnits: '',
        time: []
      },
      query: { // 连接
        queriesQueryValue: [],
        queriesQueryValueType: '',
        queriesQueryItemId: '',
        queriesQueryItemUnits: '',

        questionsQueryValue: [],
        questionsQueryValueType: '',
        questionsQueryItemId: '',
        questionsQueryItemUnits: '',

        slowQueryValue: [],
        slowQueryValueType: '',
        slowQueryItemId: '',
        slowQueryItemUnits: '',
        time: []
      },

      network: { // 网络
        receivedNetworkValue: [],
        receivedNetworkValueType: '',
        receivedNetworkItemId: '',
        receivedNetworkItemUnits: '',

        sentNetworkValue: [],
        sentNetworkValueType: '',
        sentNetworkItemId: '',
        sentNetworkItemUnits: '',
        time: []
      },
      databases: [],
      // databases: { // mysql数据库
      // OASize: '',
      // OAUnits: '',

      // mysqlSize: '',
      // mysqlUnits: '',

      // coreSize: '',
      // coreUnits: '',

      // hydbSize: '',
      // hydbUnits: ''
      // },
      /* 传递给子组件的数据 END */
      diyItem: [],
      initGetMonitorItemHistoryData: false
    }
  },
  computed: {
    agent() {
      if (this.propAgent === 0) {
        return this.$route.query.agent
      } else {
        return String(this.propAgent)
      }
    },
    zbxHostId() {
      if (this.propZbxHostId === 0) {
        return this.$route.query.zbxHostId
      } else {
        return String(this.propZbxHostId)
      }
    },
    id() { return this.$route.query.id },
    isConfig() { return this.$route.query.isConfig },
    hySubdevTypeId() { return this.$route.query.hySubdevTypeId },
    subType() { return Number(this.$route.query.subType) }
  },
  beforeDestroy() {
    this.batchOffEventBus('delete-item-switch,add-item-switch')
  },
  mounted() {
    this.itAgentGetDBData()
    this.setHyitShowSurveyInterval = setInterval(() => {
      this.itAgentGetDBData()
    }, this.requestInterval)
    this.findHyitHostGraphShow()
    this.$EventBus.$on('delete-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    this.$EventBus.$on('add-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetDBData-websocket') {
        this.watchAgentGetDBData(isJSONString(res.detail.data.HostDBData) ? JSON.parse(res.detail.data.HostDBData) : null)
      }
    })
  },
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
  },
  methods: {
    // 查询显示配置
    findHyitHostGraphShow() {
      request({
        url: api.itMonitor.findHyitHostGraphShow, data: { hostId: this.id, zhostId: this.zbxHostId, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('get-graph-show', res.data)
          const diyItem = []
          res.data.forEach(item => {
            if (Number(item.type) === 2) {
              diyItem.push(item)
            }
          })
          this.diyItem = diyItem
        }
      })
    },
    // 获取监控项数据 websocket
    itAgentGetDBData() {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetDBData,
        data: {
          token: wsToken,
          companyId: getUserSessionResult.companyId,
          appId: getUserSessionResult.appId,
          agent: this.agent,
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          hostid: this.zbxHostId,
          fromHostId: this.localStorageOperation('get', 'fromHostId')
        }
      },
      (res) => {
        const wsRes = isJSONString(res.HostStorageData) ? JSON.parse(res.HostStorageData) : res.HostStorageData
        if (wsRes) {
          this.watchAgentGetHostShow(wsRes)
        }
      }, (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    watchAgentGetDBData(data) {
      let deviceData = []
      let mysqlData = []
      let sqlServerData = []
      const currentAllMonitorItemIds = []
      const currentAllMonitorItemValueTypes = []
      if (this.subType === 104) {
        deviceData = data.oracle
      } else if (this.subType === 103) {
        mysqlData = data.mysql
      } else if (this.subType === 105) {
        sqlServerData = data.mssqlServer
      }
      // oracle数据
      if (deviceData.length > 0) {
        // 运行状态
        this.upStatus = deviceData.length > 0 ? 1 : 0
        const clock = new Date()
        // 所有数据文件大小 START
        const dbDataFileSize = this.$tool.findDataItemByAttr(deviceData, 'itemName', '所有数据文件大小')
        if (dbDataFileSize) {
          const conversionData = this.$tool.conversionData('data', Number(dbDataFileSize.itemValue), dbDataFileSize.units)
          this.dbDataFileSize = `${conversionData.size}${conversionData.units}`
        }
        // 所有数据文件大小 END

        // 数据锁 START
        const queryLock = this.$tool.findDataItemByAttr(deviceData, 'itemName', '查询锁数量')
        const deadLock = this.$tool.findDataItemByAttr(deviceData, 'itemName', '死锁数量')
        if (queryLock) {
          this.$set(this.lock, 'queryLockItemId', queryLock.itemid)
          this.$set(this.lock, 'queryLockValueType', queryLock.valueType)
          this.$set(this.lock.queryLockValue, this.lock.queryLockValue.length, queryLock.itemValue)
        }

        if (deadLock) {
          this.$set(this.lock, 'deadLockItemId', deadLock.itemid)
          this.$set(this.lock, 'deadLockValueType', deadLock.valueType)
          this.$set(this.lock.deadLockValue, this.lock.deadLockValue.length, deadLock.itemValue)
        }
        this.$set(this.lock.time, this.lock.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 数据锁 END

        // 活跃用户数量 START
        const userActivity = this.$tool.findDataItemByAttr(deviceData, 'itemName', '活跃用户数量')
        if (userActivity) {
          this.$set(this.userActivity, 'itemId', userActivity.itemid)
          this.$set(this.userActivity, 'valueType', userActivity.valueType)
          this.$set(this.userActivity.value, this.userActivity.value.length, userActivity.itemValue)
        }
        this.$set(this.userActivity.time, this.userActivity.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 活跃用户数量 END

        // 进程数量 START
        const processNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '进程数量')
        const maxProcessNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '进程最大数量')

        if (processNum) {
          this.$set(this.processCount, 'processId', processNum.itemid)
          this.$set(this.processCount, 'processType', processNum.valueType)
          this.$set(this.processCount.processValue, this.processCount.processValue.length, processNum.itemValue)
        }

        if (maxProcessNum) {
          this.$set(this.processCount, 'maxProcessId', maxProcessNum.itemid)
          this.$set(this.processCount, 'maxProcessType', maxProcessNum.valueType)
          this.$set(this.processCount.maxProcessValue, this.processCount.maxProcessValue.length, maxProcessNum.itemValue)
        }
        this.$set(this.processCount.time, this.processCount.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 进程数量 END

        // 等待时间 START
        const timeNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '队列等待时间')
        const freeTimeNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '锁存器空闲等待时间')

        if (timeNum) {
          this.$set(this.waitTime, 'timeId', timeNum.itemid)
          this.$set(this.waitTime, 'timeType', timeNum.valueType)
          this.$set(this.waitTime.timeValue, this.waitTime.timeValue.length, timeNum.itemValue)
        }

        if (freeTimeNum) {
          this.$set(this.waitTime, 'freeTimeId', freeTimeNum.itemid)
          this.$set(this.waitTime, 'freeTimeType', freeTimeNum.valueType)
          this.$set(this.waitTime.freeTimeValue, this.waitTime.freeTimeValue.length, freeTimeNum.itemValue)
        }
        this.$set(this.waitTime.time, this.waitTime.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 等待时间 END

        // 事务 START
        const affairNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '每秒事务数')
        const submitAffairNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '每秒事务提交数量')
        if (affairNum) {
          this.$set(this.affair, 'affairId', affairNum.itemid)
          this.$set(this.affair, 'affairType', affairNum.valueType)
          this.$set(this.affair.affairValue, this.affair.affairValue.length, affairNum.itemValue)
        }

        if (submitAffairNum) {
          this.$set(this.affair, 'submitAffairId', submitAffairNum.itemid)
          this.$set(this.affair, 'submitAffairType', submitAffairNum.valueType)
          this.$set(this.affair.submitAffairValue, this.affair.submitAffairValue.length, submitAffairNum.itemValue)
        }
        this.$set(this.affair.time, this.affair.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 事务 END

        // ASM卷空间 START
        // 第一个
        const sizeNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', 'DATA 大小')
        const useSizeNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', 'DATA 使用大小')
        const usePercentageNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', 'DATA 使用百分比')
        if (sizeNum) {
          let totalData = this.$tool.conversionData('data', (Number(sizeNum.itemValue)), sizeNum.units)
          console.log(totalData)
          this.$set(this.volumeSpace, 'totalSize', totalData.size)
          this.$set(this.volumeSpace, 'totalUnits', totalData.units)
        }
        if (useSizeNum) {
          let useData = this.$tool.conversionData('data', (Number(useSizeNum.itemValue)), useSizeNum.units)
          this.$set(this.volumeSpace, 'useSize', useData.size)
          this.$set(this.volumeSpace, 'useUnits', useData.units)
        }
        if (usePercentageNum) {
          this.$set(this.volumeSpace, 'usePercentageSize', usePercentageNum.itemValue)
          this.$set(this.volumeSpace, 'usePercentageUnits', usePercentageNum.units)
        }
        // 第二个
        const ocrSizeNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', 'OCR 大小')
        const ocrUseSizeNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', 'OCR 使用大小')
        const ocrUsePercentageNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', 'OCR 使用百分比')
        if (ocrSizeNum) {
          let ocrTotalData = this.$tool.conversionData('data', (Number(ocrSizeNum.itemValue)), ocrSizeNum.units)
          this.$set(this.volumeSpace, 'ocrTotalSize', ocrTotalData.size)
          this.$set(this.volumeSpace, 'ocrTotalUnits', ocrTotalData.units)
        }
        if (ocrUseSizeNum) {
          let ocrUseData = this.$tool.conversionData('data', (Number(ocrUseSizeNum.itemValue)), ocrUseSizeNum.units)
          this.$set(this.volumeSpace, 'ocrUseSize', ocrUseData.size)
          this.$set(this.volumeSpace, 'ocrUseUnits', ocrUseData.units)
        }
        if (ocrUsePercentageNum) {
          this.$set(this.volumeSpace, 'ocrUsePercentageSize', ocrUsePercentageNum.itemValue)
          this.$set(this.volumeSpace, 'ocrUsePercentageUnits', ocrUsePercentageNum.units)
        }
        // ASM卷空间 END

        // 表空间 START
        const tableNum = this.$tool.findDataItemByAttr(deviceData, 'itemName', '前端页面表空间展示使用')
        if (tableNum) {
          console.log(tableNum)
          let itemVal = tableNum.itemValue.substr(1)
          let itemdata = itemVal.substring(0, itemVal.length - 1)
          let itemList = itemdata.split(')\n(')
          let itemNum = []
          itemList.forEach(item => {
            itemNum.push(item.split(','))
          })
          let arrayList = []
          itemNum.forEach(item => {
            let val = []
            item.forEach(itemVal => {
              itemNum = itemVal.replace("'", '').replace("'", '').replace(' ', '')
              val.push(itemNum)
            })
            arrayList.push(val)
          })
          this.table = arrayList
        }

        if (!this.initGetMonitorItemHistoryData) {
          if (this.lock.queryLockItemId !== '' && this.lock.queryLockValueType !== '') {
            currentAllMonitorItemIds.push(this.lock.queryLockItemId)
            currentAllMonitorItemValueTypes.push(this.lock.queryLockValueType)
          }
          if (this.lock.deadLockItemId !== '' && this.lock.deadLockValueType !== '') {
            currentAllMonitorItemIds.push(this.lock.deadLockItemId)
            currentAllMonitorItemValueTypes.push(this.lock.deadLockValueType)
          }
          if (this.userActivity.itemId !== '' && this.userActivity.valueType !== '') {
            currentAllMonitorItemIds.push(this.userActivity.itemId)
            currentAllMonitorItemValueTypes.push(this.userActivity.valueType)
          }
          if (this.processCount.processId !== '' && this.processCount.processType !== '') {
            currentAllMonitorItemIds.push(this.processCount.processId)
            currentAllMonitorItemValueTypes.push(this.processCount.processType)
          }
          if (this.waitTime.timeId !== '' && this.waitTime.timeType !== '') {
            currentAllMonitorItemIds.push(this.waitTime.timeId)
            currentAllMonitorItemValueTypes.push(this.waitTime.timeType)
          }
          if (this.waitTime.freeTimeId !== '' && this.waitTime.freeTimeType !== '') {
            currentAllMonitorItemIds.push(this.waitTime.freeTimeId)
            currentAllMonitorItemValueTypes.push(this.waitTime.freeTimeType)
          }
          if (this.affair.affairId !== '' && this.affair.affairType !== '') {
            currentAllMonitorItemIds.push(this.affair.affairId)
            currentAllMonitorItemValueTypes.push(this.affair.affairType)
          }
          if (this.affair.submitAffairId !== '' && this.affair.submitAffairType !== '') {
            currentAllMonitorItemIds.push(this.affair.submitAffairId)
            currentAllMonitorItemValueTypes.push(this.affair.submitAffairType)
          }
          this.initGetMonitorItemHistoryData = true
          this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
        }

        // =========================================  mysql数据  ==============================================
      } else if (mysqlData.length > 0) {
        // 运行状态
        this.upStatus = mysqlData.length > 0 ? 1 : 0
        const clock = new Date()

        // 缓冲池 START
        const bufferData = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Buffer pool utilization')
        const efficiencyData = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Buffer pool efficiency')

        if (bufferData) {
          this.$set(this.buffer, 'bufferItemId', bufferData.itemid)
          this.$set(this.buffer, 'bufferValueType', bufferData.valueType)
          this.$set(this.buffer, 'bufferItemUnits', bufferData.units)
          this.$set(this.buffer.bufferValue, this.buffer.bufferValue.length, bufferData.itemValue)
        }

        if (efficiencyData) {
          this.$set(this.buffer, 'efficiencyItemId', efficiencyData.itemid)
          this.$set(this.buffer, 'efficiencyValueType', efficiencyData.valueType)
          this.$set(this.buffer, 'efficiencyItemUnits', efficiencyData.units)
          this.$set(this.buffer.efficiencyValue, this.buffer.efficiencyValue.length, efficiencyData.itemValue)
        }
        this.$set(this.buffer.time, this.buffer.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 缓冲池 END

        // 线程 START
        const cachedNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Threads cached')
        const connectedNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Threads connected')
        const secondNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Threads created per second')
        const runningNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Threads running')
        if (cachedNum) {
          const grantData = this.$tool.sizeUnitsConversion(cachedNum.itemValue)
          this.$set(this.thread, 'cachedThreadltemId', cachedNum.itemid)
          this.$set(this.thread, 'cachedThreadValueType', cachedNum.valueType)
          this.$set(this.thread.cachedThreadValue, this.thread.cachedThreadValue.length, grantData.size)
        }

        if (connectedNum) {
          const maxData = this.$tool.sizeUnitsConversion(connectedNum.itemValue)
          this.$set(this.thread, 'connectedThreadItemId', connectedNum.itemid)
          this.$set(this.thread, 'connectedThreadValueType', connectedNum.valueType)
          this.$set(this.thread.connectedThreadValue, this.thread.connectedThreadValue.length, maxData.size)
        }

        if (secondNum) {
          const targetData = this.$tool.sizeUnitsConversion(secondNum.itemValue)
          this.$set(this.thread, 'secondThreadItemId', secondNum.itemid)
          this.$set(this.thread, 'secondThreadValueType', secondNum.valueType)
          this.$set(this.thread.secondThreadValue, this.thread.secondThreadValue.length, targetData.size)
        }

        if (runningNum) {
          const totalData = this.$tool.sizeUnitsConversion(runningNum.itemValue)
          this.$set(this.thread, 'runningThreadItemId', runningNum.itemid)
          this.$set(this.thread, 'runningThreadValueType', runningNum.valueType)
          this.$set(this.thread.runningThreadValue, this.thread.runningThreadValue.length, totalData.size)
        }
        this.$set(this.thread.time, this.thread.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 线程 END

        // 连接 START
        const secNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Connections per second')
        const maxNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Max used connections')
        const errorsNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Connection errors tcpwrap per second')
        if (secNum) {
          const grantData = this.$tool.sizeUnitsConversion(secNum.itemValue)
          this.$set(this.connect, 'secondConnectItemId', secNum.itemid)
          this.$set(this.connect, 'secondConnectValueType', secNum.valueType)
          this.$set(this.connect.secondConnectValue, this.connect.secondConnectValue.length, grantData.size)
        }

        if (maxNum) {
          const maxData = this.$tool.sizeUnitsConversion(maxNum.itemValue)
          this.$set(this.connect, 'maxConnectItemId', maxNum.itemid)
          this.$set(this.connect, 'maxConnectValueType', maxNum.valueType)
          this.$set(this.connect.maxConnectValue, this.connect.maxConnectValue.length, maxData.size)
        }

        if (errorsNum) {
          const targetData = this.$tool.sizeUnitsConversion(errorsNum.itemValue)
          this.$set(this.connect, 'errorsConnectItemId', errorsNum.itemid)
          this.$set(this.connect, 'errorsConnectValueType', errorsNum.valueType)
          this.$set(this.connect.errorsConnectValue, this.connect.errorsConnectValue.length, targetData.size)
        }
        this.$set(this.connect.time, this.connect.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 连接 END

        // 查询 START
        const QueriesNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Queries per second')
        const QuestionsNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Questions per second')
        const queriesNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Slow queries per second')
        if (QueriesNum) {
          this.$set(this.query, 'queriesQueryItemId', QueriesNum.itemid)
          this.$set(this.query, 'queriesQueryValueType', QueriesNum.valueType)
          this.$set(this.query.queriesQueryValue, this.query.queriesQueryValue.length, QueriesNum.itemValue)
        }
        if (QuestionsNum) {
          this.$set(this.query, 'questionsQueryItemId', QuestionsNum.itemid)
          this.$set(this.query, 'questionsQueryValueType', QuestionsNum.valueType)
          this.$set(this.query.questionsQueryValue, this.query.questionsQueryValue.length, QuestionsNum.itemValue)
        }
        if (queriesNum) {
          this.$set(this.query, 'slowQueryItemId', queriesNum.itemid)
          this.$set(this.query, 'slowQueryValueType', queriesNum.valueType)
          this.$set(this.query.slowQueryValue, this.query.slowQueryValue.length, queriesNum.itemValue)
        }
        this.$set(this.query.time, this.query.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 查询 END

        // 网络 START
        const receivedNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Bytes received')
        const sentNum = this.$tool.findDataItemByAttr(mysqlData, 'itemName', 'MySQL: Bytes sent')
        if (receivedNum) {
          this.$set(this.network, 'receivedNetworkItemId', receivedNum.itemid)
          this.$set(this.network, 'receivedNetworkValueType', receivedNum.valueType)
          this.$set(this.network, 'receivedNetworkItemUnits', receivedNum.units)
          this.$set(this.network.receivedNetworkValue, this.network.receivedNetworkValue.length, receivedNum.itemValue)
        }
        if (sentNum) {
          this.$set(this.network, 'sentNetworkItemId', sentNum.itemid)
          this.$set(this.network, 'sentNetworkValueType', sentNum.valueType)
          this.$set(this.network, 'sentNetworkItemUnits', sentNum.units)
          this.$set(this.network.sentNetworkValue, this.network.sentNetworkValue.length, sentNum.itemValue)
        }
        this.$set(this.network.time, this.network.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 网络 END

        // mysql数据库 START
        this.databases = []
        mysqlData.forEach(item => {
          if (item.itemName.indexOf('MySQL: Size of database') !== -1) {
            item.name = item.itemName.split('MySQL: Size of database ')[1]
            this.databases.push(item)
          }
        })

        if (!this.initGetMonitorItemHistoryData) {
          if (this.buffer.bufferItemId !== '' && this.buffer.bufferValueType !== '') {
            currentAllMonitorItemIds.push(this.buffer.bufferItemId)
            currentAllMonitorItemValueTypes.push(this.buffer.bufferValueType)
          }
          if (this.buffer.efficiencyItemId !== '' && this.buffer.efficiencyValueType !== '') {
            currentAllMonitorItemIds.push(this.buffer.efficiencyItemId)
            currentAllMonitorItemValueTypes.push(this.buffer.efficiencyValueType)
          }
          if (this.thread.cachedThreadltemId !== '' && this.thread.cachedThreadValueType !== '') {
            currentAllMonitorItemIds.push(this.thread.cachedThreadltemId)
            currentAllMonitorItemValueTypes.push(this.thread.cachedThreadValueType)
          }
          if (this.thread.connectedThreadItemId !== '' && this.thread.connectedThreadValueType !== '') {
            currentAllMonitorItemIds.push(this.thread.connectedThreadItemId)
            currentAllMonitorItemValueTypes.push(this.thread.connectedThreadValueType)
          }
          if (this.connect.secondConnectItemId !== '' && this.connect.secondConnectValueType !== '') {
            currentAllMonitorItemIds.push(this.connect.secondConnectItemId)
            currentAllMonitorItemValueTypes.push(this.connect.secondConnectValueType)
          }
          if (this.connect.maxConnectItemId !== '' && this.connect.maxConnectValueType !== '') {
            currentAllMonitorItemIds.push(this.connect.maxConnectItemId)
            currentAllMonitorItemValueTypes.push(this.connect.maxConnectValueType)
          }
          if (this.connect.errorsConnectItemId !== '' && this.connect.errorsConnectValueType !== '') {
            currentAllMonitorItemIds.push(this.connect.errorsConnectItemId)
            currentAllMonitorItemValueTypes.push(this.connect.errorsConnectValueType)
          }
          if (this.query.queriesQueryItemId !== '' && this.query.queriesQueryValueType !== '') {
            currentAllMonitorItemIds.push(this.query.queriesQueryItemId)
            currentAllMonitorItemValueTypes.push(this.query.queriesQueryValueType)
          }
          if (this.query.questionsQueryItemId !== '' && this.query.questionsQueryValueType !== '') {
            currentAllMonitorItemIds.push(this.query.questionsQueryItemId)
            currentAllMonitorItemValueTypes.push(this.query.questionsQueryValueType)
          }
          if (this.query.slowQueryItemId !== '' && this.query.slowQueryValueType !== '') {
            currentAllMonitorItemIds.push(this.query.slowQueryItemId)
            currentAllMonitorItemValueTypes.push(this.query.slowQueryValueType)
          }
          if (this.network.receivedNetworkItemId !== '' && this.network.receivedNetworkValueType !== '') {
            currentAllMonitorItemIds.push(this.network.receivedNetworkItemId)
            currentAllMonitorItemValueTypes.push(this.network.receivedNetworkValueType)
          }
          if (this.network.sentNetworkItemId !== '' && this.network.sentNetworkValueType !== '') {
            currentAllMonitorItemIds.push(this.network.sentNetworkItemId)
            currentAllMonitorItemValueTypes.push(this.network.sentNetworkValueType)
          }
          this.initGetMonitorItemHistoryData = true
          this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
        }

        // 数据库 END

        // =======================================  sqlServer数据  ============================================
      } else if (sqlServerData.length > 0) {
        // 运行状态
        this.upStatus = sqlServerData.length > 0 ? 1 : 0
        const clock = new Date()

        // 所有数据文件大小 START
        const dbDataFileSize = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total data file size')
        if (dbDataFileSize) {
          const conversionData = this.$tool.conversionData('data', Number(dbDataFileSize.itemValue), dbDataFileSize.units)
          this.dbDataFileSize = `${conversionData.size}${conversionData.units}`
        }
        // 所有数据文件大小 END

        // 日志 START
        const journalData = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total log file size')
        const UserJournalData = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total log file used size')
        if (journalData) {
          const data = this.$tool.sizeUnitsTransform(journalData.units, 'MB', +journalData.itemValue)
          this.$set(this.journal, 'journalltemId', journalData.itemid)
          this.$set(this.journal, 'journalValueType', journalData.valueType)
          this.$set(this.journal, 'journalItemUnits', journalData.units)
          this.$set(this.journal.journalValue, this.journal.journalValue.length, Number(data.size))
        }

        if (UserJournalData) {
          const UserData = this.$tool.sizeUnitsTransform(UserJournalData.units, 'MB', +UserJournalData.itemValue)
          this.$set(this.journal, 'UserJournalItemId', UserJournalData.itemid)
          this.$set(this.journal, 'UserJournalValueType', UserJournalData.valueType)
          this.$set(this.journal, 'UserJournalItemUnits', UserJournalData.units)
          this.$set(this.journal.UserJournalValue, this.journal.UserJournalValue.length, Number(UserData.size))
        }
        this.$set(this.journal.time, this.journal.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 日志 END

        // 锁 START
        const lockingData = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total lock requests per second')
        const lockingTimeData = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Lock wait time')

        if (lockingData) {
          this.$set(this.locking, 'queryLockItemId', lockingData.itemid)
          this.$set(this.locking, 'lockingValueType', lockingData.valueType)
          this.$set(this.locking, 'lockingltemUnits', lockingData.units)
          this.$set(this.locking.lockingValue, this.locking.lockingValue.length, lockingData.itemValue)
        }

        if (lockingTimeData) {
          this.$set(this.locking, 'TimeLockingItemId', lockingTimeData.itemid)
          this.$set(this.locking, 'TimeLockingValueType', lockingTimeData.valueType)
          this.$set(this.locking, 'TimeLockingItemUnits', lockingTimeData.units)
          this.$set(this.locking.TimeLockingValue, this.locking.TimeLockingValue.length, lockingTimeData.itemValue)
        }
        this.$set(this.locking.time, this.locking.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 锁 END

        // 内存 START
        const grantedNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Granted Workspace Memory')
        const maxNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Maximum workspace memory')
        const targetNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Target server memory')
        const totalNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total server memory')
        if (grantedNum) {
          const grantData = this.$tool.sizeUnitsTransform(grantedNum.units, 'GB', grantedNum.itemValue)
          this.$set(this.memory, 'grantMemoryltemId', grantedNum.itemid)
          this.$set(this.memory, 'grantMemoryValueType', grantedNum.valueType)
          this.$set(this.memory, 'grantMemoryltemUnits', grantedNum.units)
          this.$set(this.memory.grantMemoryValue, this.memory.grantMemoryValue.length, grantData.size)
        }

        if (maxNum) {
          const maxData = this.$tool.sizeUnitsTransform(maxNum.units, 'GB', maxNum.itemValue)
          this.$set(this.memory, 'maxMemoryItemId', maxNum.itemid)
          this.$set(this.memory, 'maxMemoryValueType', maxNum.valueType)
          this.$set(this.memory, 'maxMemoryItemUnits', maxNum.units)
          this.$set(this.memory.maxMemoryValue, this.memory.maxMemoryValue.length, maxData.size)
        }

        if (targetNum) {
          const targetData = this.$tool.sizeUnitsTransform(targetNum.units, 'GB', targetNum.itemValue)
          this.$set(this.memory, 'currentMemoryItemId', targetNum.itemid)
          this.$set(this.memory, 'currentMemoryValueType', targetNum.valueType)
          this.$set(this.memory, 'currentMemoryItemUnits', targetNum.units)
          this.$set(this.memory.currentMemoryValue, this.memory.currentMemoryValue.length, targetData.size)
        }

        if (totalNum) {
          const totalData = this.$tool.sizeUnitsTransform(totalNum.units, 'GB', totalNum.itemValue)
          this.$set(this.memory, 'totalMemoryItemId', totalNum.itemid)
          this.$set(this.memory, 'totalMemoryValueType', totalNum.valueType)
          this.$set(this.memory, 'totalMemoryItemUnits', totalNum.units)
          this.$set(this.memory.totalMemoryValue, this.memory.totalMemoryValue.length, totalData.size)
        }
        this.$set(this.memory.time, this.memory.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 内存 END

        // 性能 START
        const fullNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Full scans per second')
        const searchesNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Index searches per second')
        const latchNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Latch waits per second')

        if (fullNum) {
          this.$set(this.performance, 'fullItemId', fullNum.itemid)
          this.$set(this.performance, 'fullValueType', fullNum.valueType)
          this.$set(this.performance.fullValue, this.performance.fullValue.length, fullNum.itemValue)
        }

        if (searchesNum) {
          this.$set(this.performance, 'searchesItemId', searchesNum.itemid)
          this.$set(this.performance, 'searchesValueType', searchesNum.valueType)
          this.$set(this.performance.searchesValue, this.performance.searchesValue.length, searchesNum.itemValue)
        }
        if (latchNum) {
          this.$set(this.performance, 'LatchItemId', latchNum.itemid)
          this.$set(this.performance, 'LatchValueType', latchNum.valueType)
          this.$set(this.performance, 'LatchItemUnits', latchNum.units)
          this.$set(this.performance.LatchValue, this.performance.LatchValue.length, latchNum.itemValue)
        }
        this.$set(this.performance.time, this.performance.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 性能 END

        // 性能2 START
        const errorsNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total errors per second')
        const lockNum = this.$tool.findDataItemByAttr(sqlServerData, 'itemName', 'MSSQL: Total lock requests per second')

        if (errorsNum) {
          this.$set(this.performanceTwo, 'errorsItemId', errorsNum.itemid)
          this.$set(this.performanceTwo, 'errorsValueType', errorsNum.valueType)
          this.$set(this.performanceTwo.errorsValue, this.performanceTwo.errorsValue.length, errorsNum.itemValue)
        }
        if (lockNum) {
          this.$set(this.performanceTwo, 'lockItemId', lockNum.itemid)
          this.$set(this.performanceTwo, 'lockValueType', lockNum.valueType)
          this.$set(this.performanceTwo, 'lockItemUnits', lockNum.units)
          this.$set(this.performanceTwo.lockValue, this.performanceTwo.lockValue.length, lockNum.itemValue)
        }
        this.$set(this.performanceTwo.time, this.performanceTwo.time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        // 性能 END

        // 数据库 START
        // 数据文件
        this.database = []
        // console.log(sqlServerData)
        sqlServerData.forEach(item => {
          if (item.itemName.indexOf('MSSQL DB') !== -1 && item.itemName.indexOf('Data file size') !== -1) {
            item.name = item.itemName.split("'")[1]
            this.database.push(item)
          }
        })
        // 数据库 END

        // 数据库日志文件START

        this.databaseLog = []
        sqlServerData.forEach(item => {
          if (item.itemName.indexOf('MSSQL DB') !== -1 && item.itemName.indexOf('Log file size') !== -1) {
            const data = {}
            item.name = item.itemName.split("'")[1]
            data.name = item.name
            console.log(item)
            console.log(data.name)
            data.totalSize = item.itemValue
            data.totalUnits = item.units
            sqlServerData.forEach(itemS => {
              if (itemS.itemName.indexOf('MSSQL DB') !== -1 && itemS.itemName.indexOf('Log file used size') !== -1 && itemS.itemName.indexOf(data.name) !== -1) {
                console.log(itemS)
                data.useSize = itemS.itemValue
                data.useSizeUnits = itemS.units
                console.log(data)
              }
              if (itemS.itemName.indexOf('MSSQL DB') !== -1 && itemS.itemName.indexOf('Percent log used') !== -1 && itemS.itemName.indexOf(data.name) !== -1) {
                console.log(itemS)
                data.usePercentageSize = itemS.itemValue
                data.usePercentageUnits = itemS.units
              }
            })
            console.log(data)
            this.databaseLog.push(data)
          }
        })
        console.log(this.databaseLog)

        if (!this.initGetMonitorItemHistoryData) {
          if (this.journal.journalltemId !== '' && this.journal.journalValueType !== '') {
            currentAllMonitorItemIds.push(this.journal.journalltemId)
            currentAllMonitorItemValueTypes.push(this.journal.journalValueType)
          }
          if (this.journal.UserJournalItemId !== '' && this.journal.UserJournalValueType !== '') {
            currentAllMonitorItemIds.push(this.journal.UserJournalItemId)
            currentAllMonitorItemValueTypes.push(this.journal.UserJournalValueType)
          }
          if (this.locking.queryLockItemId !== '' && this.locking.lockingValueType !== '') {
            currentAllMonitorItemIds.push(this.locking.queryLockItemId)
            currentAllMonitorItemValueTypes.push(this.locking.lockingValueType)
          }
          if (this.locking.TimeLockingItemId !== '' && this.locking.TimeLockingValueType !== '') {
            currentAllMonitorItemIds.push(this.locking.TimeLockingItemId)
            currentAllMonitorItemValueTypes.push(this.locking.TimeLockingValueType)
          }
          if (this.memory.grantMemoryltemId !== '' && this.memory.grantMemoryValueType !== '') {
            currentAllMonitorItemIds.push(this.memory.grantMemoryltemId)
            currentAllMonitorItemValueTypes.push(this.memory.grantMemoryValueType)
          }
          if (this.memory.maxMemoryItemId !== '' && this.memory.maxMemoryValueType !== '') {
            currentAllMonitorItemIds.push(this.memory.maxMemoryItemId)
            currentAllMonitorItemValueTypes.push(this.memory.maxMemoryValueType)
          }
          if (this.memory.currentMemoryItemId !== '' && this.memory.currentMemoryValueType !== '') {
            currentAllMonitorItemIds.push(this.memory.currentMemoryItemId)
            currentAllMonitorItemValueTypes.push(this.memory.currentMemoryValueType)
          }
          if (this.memory.totalMemoryItemId !== '' && this.memory.totalMemoryValueType !== '') {
            currentAllMonitorItemIds.push(this.memory.totalMemoryItemId)
            currentAllMonitorItemValueTypes.push(this.memory.totalMemoryValueType)
          }
          if (this.performance.fullItemId !== '' && this.performance.fullValueType !== '') {
            currentAllMonitorItemIds.push(this.performance.fullItemId)
            currentAllMonitorItemValueTypes.push(this.performance.fullValueType)
          }
          if (this.performance.searchesItemId !== '' && this.performance.searchesValueType !== '') {
            currentAllMonitorItemIds.push(this.performance.searchesItemId)
            currentAllMonitorItemValueTypes.push(this.performance.searchesValueType)
          }
          if (this.performance.LatchItemId !== '' && this.performance.LatchValueType !== '') {
            currentAllMonitorItemIds.push(this.performance.LatchItemId)
            currentAllMonitorItemValueTypes.push(this.performance.LatchValueType)
          }
          if (this.performanceTwo.errorsItemId !== '' && this.performanceTwo.errorsValueType !== '') {
            currentAllMonitorItemIds.push(this.performanceTwo.errorsItemId)
            currentAllMonitorItemValueTypes.push(this.performanceTwo.errorsValueType)
          }
          if (this.performanceTwo.lockItemId !== '' && this.performanceTwo.lockValueType !== '') {
            currentAllMonitorItemIds.push(this.performanceTwo.lockItemId)
            currentAllMonitorItemValueTypes.push(this.performanceTwo.lockValueType)
          }
          this.initGetMonitorItemHistoryData = true
          this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
        }

        // 数据库日志文件 END
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
