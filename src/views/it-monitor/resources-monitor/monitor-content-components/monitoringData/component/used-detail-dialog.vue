<template>
  <el-dialog class="used-detail-dialog" title="查看详情" :visible.sync="getShowDialog" width="50%" top="5vh" append-to-body @close="closeDialog">
    <div class="dialog-content">
      <div class="tab-btns">
        <div v-for="item in tabBtnGroup" :key="item.key" class="tab-btn-item" :class="selectKey === item.key ? 'active' : ''" @click="changeItemType(item.key)">{{ item.value }}</div>
      </div>
      <div class="header-tools">
        <div class="filter-container">
          <el-select v-model="timeTypeValue" class="filter-item" style="width: 200px" @change="changeTimeTypeValue">
            <el-option v-for="item in timeType" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </div>
      </div>
      <UsedStatisticsContainer echart-el="detailChart" :echart-data="getPropsEchartParams" :table-data="tableData" :realtime="true" :show-new-data-tag="showNewDataTag" :custom-configuration="customConfiguration" />
    </div>
  </el-dialog>
</template>

<script>
import UsedStatisticsContainer from './used-statistics-container'
import request from '@/utils/request'
import api from '@/api/api'
import { avg, callbackTime, guid, conversionData, dateFormat, sizeUnitsTransform, formatSTime } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import deviceStatisticsMixins from '@/views/it-monitor/resources-monitor/mixins/device-statistics.mixins'

export default {
  name: 'UsedDetailDialog',
  components: {
    UsedStatisticsContainer
  },
  mixins: [deviceStatisticsMixins],
  props: {
    echartParams: {
      type: Array,
      default() {
        return []
      }
    },
    tableParams: {
      type: Array,
      default() {
        return []
      }
    },
    isTabEchart: {
      type: Boolean,
      default: false
    },
    showDialog: {
      type: Boolean,
      default: false
    },
    propAgent: {
      type: Number,
      default() {
        return 0
      }
    },
    customConfiguration: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      selectKey: '', // 当前切换按钮值
      tabBtnGroup: [], // 切换按钮
      usedDetailEchartKey: 'usedDetailEchartKey',
      timeType: [ // 时间类型
        // 实时数据 t值单位是分钟
        {
          id: 0, // id
          name: '实时', // 选择框标题
          t: 0, // 分钟
          type: 'realTime' // 类型
        },
        {
          id: 1,
          name: '一分钟(实时)',
          t: 1,
          type: 'realTime'
        },
        {
          id: 2,
          name: '五分钟(实时)',
          t: 5,
          type: 'realTime'
        },
        {
          id: 3,
          name: '十分钟(实时)',
          t: 10,
          type: 'realTime'
        },
        // 历史数据 t值单位是小时
        {
          id: 4,
          name: '近一小时(历史)',
          t: 1,
          type: 'history'
        },
        {
          id: 5,
          name: '近三小时(历史)',
          t: 3,
          type: 'history'
        },
        {
          id: 6,
          name: '近二十四小时(历史)',
          t: 24,
          type: 'history'
        },
        {
          id: 7,
          name: '最近三天(历史)',
          t: 72,
          type: 'history'
        }
      ],
      timeTypeValue: 0, // 当前选择的时间类型
      timeTypeObject: null,
      getPropsEchartParams: [], // 获取父组件传过来的统计图参数配置
      getPropsTableParams: [], // 获取父组件传过来的表格参数配置
      agentGetRealTimeDataQuery: { // 获取实时统计图参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: ''
      },
      agentGetHistoryDataQuery: { // 获取历史统计图参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      tableData: [{ col: [] }], // 统计表格数据
      agentGetTrendDataQuery: { // 获取历史统计信息参数
        agent: '',
        hostid: '',
        itemid: '',
        valueType: '',
        startClock: '',
        endClock: ''
      },
      agentGetRealTimeDataInterval: null, // 定时器
      agentGetRealTimeDataIntervalValue: 2000, // 定时器毫秒数
      dataMaxLength: 0, // 数据最大数量，当前选择的分钟 * 60秒 / 定时器毫秒 / 1000 取整数
      showNewDataTag: true, // 显示最新数据标签
      getShowDialog: false
    }
  },
  computed: {
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  watch: {
    showDialog() {
      this.getShowDialog = this.showDialog
    }
  },
  mounted() {
    this.getShowDialog = this.showDialog
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket') {
        if (res.detail.data.way) {
          if (!res.detail.data.way || res.detail.data.way === 'single') {
            this.watchAgentGetRealTimeData(res.detail.data.data)
          } else {
            this[`${res.detail.data.methods}`]('realTime', res.detail.data)
          }
        } else {
          this.watchAgentGetRealTimeData(res.detail.data.data)
        }
      }
    })
    if (this.isTabEchart) { // 是否是可以切换的echart图表
      this.getPropsEchartParams = [this.echartParams[0]]
      this.getPropsTableParams = [this.tableParams[0]]
      this.selectKey = this.echartParams[0].itemid
      this.echartParams.forEach(item => {
        this.$set(this.tabBtnGroup, this.tabBtnGroup.length, {
          key: item.itemid,
          value: item.name
        })
      })
    } else { // 普通图表
      this.getPropsEchartParams = this.echartParams
      this.getPropsTableParams = this.tableParams
    }
    this.agentGetHistoryDataQuery.agent = this.$route.query.agent || this.propAgent
    this.agentGetRealTimeDataQuery.agent = this.$route.query.agent || this.propAgent
    this.agentGetTrendDataQuery.agent = this.$route.query.agent || this.propAgent
    this.initEchart()
  },
  methods: {
    // 选择监控项按钮 就像网络设备哪里的板卡状态点击的时候有三种监控项类型
    changeItemType(key) {
      this.selectKey = key
      const idx = this.echartParams.findIndex(item => item.itemid === key)
      if (idx !== -1) {
        this.usedDetailEchartKey = guid() // 给组件加key强制刷新组件 用于tab切换的echarts实现刷新
        this.getPropsEchartParams = [this.echartParams[idx]]
        this.getPropsTableParams = [this.tableParams[idx]]
        clearInterval(this.agentGetRealTimeDataInterval)
        this.clearData()
        this.initEchart()
      }
    },
    // 选择时间类型 实时或者是按照时间查历史
    changeTimeTypeValue() {
      this.clearData().then(() => {
        this.initEchart()
      })
    },
    // 初始化echart
    async initEchart() {
      const that = this
      this.timeTypeObject = this.$tool.findDataItemByAttr(this.timeType, 'id', this.timeTypeValue)
      if (!this.timeTypeObject) return
      if (this.timeTypeObject.type === 'realTime') {
        this.getPropsEchartParams.forEach(item => {
          this.agentGetHistoryData(item)
        })

        this.showNewDataTag = true
        const activeSelectS = this.timeTypeObject.t * 60 // 得出选择的实时分钟的秒数
        this.dataMaxLength = parseInt(activeSelectS / (this.agentGetRealTimeDataIntervalValue / 1000))
        this.agentGetRealTimeDataInterval = setInterval(() => {
          const itemid = []
          const valueType = []
          let way = ''
          let methods = ''
          that.getPropsEchartParams.forEach(item => {
            itemid.push(item.itemid)
            valueType.push(item.valueType)
            console.log(item)
            if (item.way) way = item.way
            if (item.methods) {
              methods = item.methods
              // key = item.key
            }
          })
          const realTimeQuery = {
            itemid: itemid.toString(),
            valueType: valueType.toString(),
            way, methods
          }

          that.agentGetRealTimeData(realTimeQuery).then(res => {
            if (res.model) {
              const data = this.itMonitorRequireAgreement !== 'WS' ? JSON.parse(res.model) : res.model
              this.watchAgentGetRealTimeData(data)
            }
          })
        }, this.agentGetRealTimeDataIntervalValue)
      } else {
        this.showNewDataTag = false
        let itemids = []
        this.getPropsTableParams.forEach((item) => { itemids.push(item.itemid) })
        const findZbxItemsHost = await this.findZbxItemsHost({ agent: this.$route.query.agent || this.propAgent, itemids: itemids.toString() })
        await this.agentGetTrendData(findZbxItemsHost)
        that.getPropsEchartParams.forEach(item => {
          that.agentGetHistoryData(item)
        })
      }
    },
    // 获取实时统计图
    agentGetRealTimeData(query) {
      return new Promise(resolve => {
        if (this.itMonitorRequireAgreement !== 'WS') {
          this.$set(this.agentGetRealTimeDataQuery, 'itemid', query.itemid)
          this.$set(this.agentGetRealTimeDataQuery, 'valueType', query.valueType)
          request({
            url: api.itMonitor.agentGetRealTimeData,
            data: { ...this.agentGetRealTimeDataQuery }
          }).then(res => {
            if (res.code === 1 && res.model) {
              resolve(res)
            } else {
              resolve(null)
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
              agent: this.agentGetRealTimeDataQuery.agent,
              itemid: query.itemid,
              valueType: query.valueType,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId'),
              way: query.way,
              methods: query.methods
            }
          })
        }
      })
    },
    // 获取历史统计
    async agentGetHistoryData(query) {
      const findZbxItemsHost = !query.way || query.way === 'single' ? await this.findZbxItemsHost({ agent: this.agent, itemids: query.itemid }) : await this.findZbxItemsHost({ agent: this.agent, itemids: query.itemid.toString() })
      this.agentGetHistoryDataQuery.itemid = query.itemid
      this.agentGetHistoryDataQuery.valueType = query.valueType
      this.agentGetHistoryDataQuery.startClock = this.timeTypeObject.type === 'realTime' ? parseInt(callbackTime(2).valueOf() / 1000) : parseInt(callbackTime(this.timeTypeObject.t).valueOf() / 1000)
      this.agentGetHistoryDataQuery.endClock = parseInt(new Date().valueOf() / 1000)
      const request_api = this.timeTypeObject.t > 3 ? api.itMonitor.agentGetTrendData : api.itMonitor.agentGetHistoryData
      request({
        url: request_api,
        data: { ...this.agentGetHistoryDataQuery }
      }).then(async res => {
        if (res.model) {
          const idx = this.getPropsEchartParams.findIndex(item => item.itemid === query.itemid)
          if (this.timeTypeObject.type !== 'realTime') {
            clearInterval(this.agentGetRealTimeDataInterval)
            await this.clearData(idx)
          }
          const model = JSON.parse(res.model)
          if (!query.way || query.way === 'single') {
            console.log('!!!!!', idx)
            if (idx !== -1) {
              const units = []
              const value = []
              for (const item of model[`itemData${query.itemid}`]) {
                // 设置时间段
                const clock = new Date(item.clock * 1000)
                this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
                let activeValue = this.timeTypeObject.t > 3 ? item.valueMax : item.value
                const getItemIdx = findZbxItemsHost.findIndex(getItem => getItem.itemid === query.itemid)
                const sizeConversion = await this.sizeConversion(
                  activeValue,
                  findZbxItemsHost[getItemIdx].units,
                  this.getPropsEchartParams[idx].unit,
                  this.getPropsEchartParams[idx].toFixed,
                  this.getPropsEchartParams[idx].arithmeticOperator,
                  this.getPropsEchartParams[idx].arithmeticOperatorValue,
                  this.getPropsEchartParams[idx].isConversion,
                  this.getPropsEchartParams[idx].conversionUnitType,
                  this.getPropsEchartParams[idx].isAssignUnit,
                  this.getPropsEchartParams[idx].assignUnit,
                  this.getPropsEchartParams[idx].conversionPercentage
                )
                units.push(sizeConversion.units)
                // 设置转换后的数据
                value.push(sizeConversion.value)
              }
              this.getPropsEchartParams[idx].units.unshift(...units)
              this.getPropsEchartParams[idx].data.unshift(...value)
            }
          } else {
            this[`${query.methods}`]('trend', { ...query, data: model })
          }
        }
      })
    },
    // 获取历史统计表格
    async agentGetTrendData(findZbxItemsHost) {
      this.getPropsTableParams.forEach(item => {
        const callbackTimeVal = this.timeTypeValue === 0 ? 1 : this.timeTypeObject.t
        this.agentGetTrendDataQuery.itemid = item.itemid
        this.agentGetTrendDataQuery.valueType = item.valueType
        this.agentGetTrendDataQuery.startClock = parseInt(callbackTime(callbackTimeVal).valueOf() / 1000)
        this.agentGetTrendDataQuery.endClock = parseInt(new Date().valueOf() / 1000)
        request({
          url: api.itMonitor.agentGetTrendData,
          data: { ...this.agentGetTrendDataQuery }
        }).then(async res => {
          if (res.model) {
            this.$set(this.tableData[0], 'col', [])
            const data = JSON.parse(res.model)
            if (!item.way || item.way === 'single') {
              const maxArr = [] // 存储当前时间段的所有最大值
              const minArr = [] // 存储当前时间段的所有最小值
              const avgArr = [] // 存储当前时间段的所有平均值
              data[`itemData${item.itemid}`].forEach(items => {
                maxArr.push(items.valueMax)
                minArr.push(items.valueMin)
                avgArr.push(items.valueAvg)
              })
              maxArr.sort((a, b) => { return a - b }) // 最大值排序
              minArr.sort((a, b) => { return a - b }) // 最小值排序
              for (let i = 0; i < item.label.length; i++) { // 遍历列
                let labelValue = ''
                let labelUnit = this.$tool.deepCopy(item.unit)
                // 当前列要显示的数据类型
                if (item.type[i] === 'max') { // 最大值
                  labelValue = maxArr[maxArr.length - 1]
                } else if (item.type[i] === 'min') { // 最小值
                  labelValue = minArr[0]
                } else { // 平均值
                  labelValue = avg(avgArr)
                }

                const getItemIdx = findZbxItemsHost.findIndex(getItem => getItem.itemid === item.itemid)

                const sizeConversion = await this.sizeConversion(
                  labelValue,
                  findZbxItemsHost[getItemIdx].units,
                  item.unit,
                  item.toFixed,
                  item[`${item.type[i]}ArithmeticOperator`],
                  item[`${item.type[i]}ArithmeticOperatorValue`],
                  item.isConversion,
                  item.conversionUnitType,
                  item.isAssignUnit,
                  item.assignUnit,
                  item.conversionPercentage
                )

                let resultValue = sizeConversion.value
                labelUnit = sizeConversion.units

                this.$set(this.tableData[0].col, this.tableData[0].col.length, {
                  label: item.label[i],
                  value: resultValue,
                  unit: labelUnit,
                  arithmeticOperatorValue: item.arithmeticOperatorValue,
                  arithmeticOperator: item.arithmeticOperator,
                  fixed: item.fixed,
                  unitSuffix: item.unitSuffix
                })
              }
            } else {
              this[`${item.methods}`]('history', { ...item, data })
            }
          }
        })
      })
    },
    // 清空统计图数据
    async clearData(idx) {
      clearInterval(this.agentGetRealTimeDataInterval)
      this.agentGetRealTimeDataInterval = null
      if (idx !== undefined) {
        this.$set(this.getPropsEchartParams[idx], 'data', [])
        this.$set(this.getPropsEchartParams[idx], 'time', [])
      } else {
        for (let i = 0; i < this.getPropsEchartParams.length; i++) {
          this.$set(this.getPropsEchartParams[i], 'data', [])
          this.$set(this.getPropsEchartParams[i], 'time', [])
        }
      }
    },
    // 关闭弹窗
    closeDialog() {
      clearInterval(this.agentGetRealTimeDataInterval)
      this.agentGetRealTimeDataInterval = null
      this.getShowDialog = false
      this.$emit('closeUsedDetailDialog', false)
    },
    // 监听设置实时数据
    watchAgentGetRealTimeData(data) {
      this.getPropsEchartParams.forEach(item => {
        const idx = data.findIndex(items => Number(items.itemid) === Number(item.itemid))
        if (idx !== -1) {
          const clock = new Date()
          // 设置时间段
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${formatSTime(clock.getTime())}`)
          let activeValue = this.itMonitorRequireAgreement === 'WS' ? data[idx].itemValue || 0 : data[idx].value || 0

          let resultValue = activeValue

          // 运算符计算
          if (this.getPropsEchartParams[idx].arithmeticOperator) {
            switch (this.getPropsEchartParams[idx].arithmeticOperator) {
              case '+':
                resultValue = this.getPropsEchartParams[idx].arithmeticOperatorValue + activeValue
                break
              case '-':
                resultValue = this.getPropsEchartParams[idx].arithmeticOperatorValue - activeValue
                break
              case '*':
                resultValue = this.getPropsEchartParams[idx].arithmeticOperatorValue * activeValue
                break
              case '/':
                resultValue = this.getPropsEchartParams[idx].arithmeticOperatorValue / activeValue
                break
            }
          }

          // 数据需要转换单位
          if (this.getPropsEchartParams[idx].isConversion) {
            let conversionDataResult = null

            // 数据转换单位
            if (this.getPropsEchartParams[idx].isAssignUnit) { // 指定转换单位
              conversionDataResult = sizeUnitsTransform(this.$tool.getDataUnitAndSuffix(data[idx].units).splitUnit, this.getPropsEchartParams[idx].assignUnit, Number(resultValue))
            } else {
              conversionDataResult = conversionData(this.getPropsEchartParams[idx].conversionUnitType, Number(resultValue), this.$tool.getDataUnitAndSuffix(data[idx].units).splitUnit)
            }
            // 保存转换后的数据
            resultValue = Number(conversionDataResult.size).toFixed(this.getPropsEchartParams[idx].toFixed)

            // 百分比计算 已占用 除于 总数 得百分比
            if (this.getPropsEchartParams[idx].conversionPercentage) {
              let convertData = conversionData(this.getPropsEchartParams[idx].conversionUnitType, Number(this.getPropsEchartParams[idx].arithmeticOperatorValue), this.getPropsEchartParams[idx].unit)
              resultValue = `${(Number((resultValue / convertData.size).toFixed(2)) * 100)}`
            }

            // 设置转换后的单位
            this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, this.getPropsEchartParams[idx].isAssignUnit ? this.getPropsEchartParams[idx].assignUnit : conversionDataResult.units)
          } else { // 不需要转换单位直接把单位进行赋值
            this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, this.$tool.getDataUnitAndSuffix(data[idx].units).splitUnit)
          }
          // 设置转换后的数据
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, resultValue)
          if (this.getPropsEchartParams[idx].data.length > 1) {
            this.$set(this.getPropsEchartParams[idx].data, 0, this.getPropsEchartParams[idx].data[1])
          }
          if (this.timeTypeValue !== 0) {
            if (this.getPropsEchartParams[idx].time.length === this.dataMaxLength) this.getPropsEchartParams[idx].time.shift()
          }
        }
      })
    },
    // 查看监控项
    async getZbxItemsHost(query) {
      const { model, code } = await request({
        url: api.itMonitor.getZbxItemsHost,
        data: query
      })
      if (code !== 1) return
      return model
    },
    // 查询监控项
    async findZbxItemsHost(query) {
      const { data, code } = await request({
        url: api.itMonitor.findZbxItemsHost,
        data: query
      })
      if (code !== 1) return
      return data
    },
    /**
     * @description 趋势图和表格的数据转换
     * @param data 数据
     * @param originalUnit 原始单位
     * @param conversionUnits 转换单位
     * @param toFixed 保留几位小数点
     * @param arithmeticOperator 算术运算符
     * @param arithmeticOperatorValue 算术运算对比值
     * @param isConversion 是否需要转换
     * @param conversionUnitType 数据转换类型
     * @param isAssignUnit 是否指定单位
     * @param assignUnit 指定的单位
     * @param conversionPercentage 是否转换成百分比
     * @returns {Promise<{units: string, value: number}>}
     */
    async sizeConversion(data, originalUnit, conversionUnits, toFixed, arithmeticOperator, arithmeticOperatorValue, isConversion, conversionUnitType, isAssignUnit, assignUnit, conversionPercentage) {
      let resultValue = data
      let activeValue = data
      let resObj = {
        value: 0,
        units: ''
      }
      switch (arithmeticOperator) {
        case '+':
          resultValue = arithmeticOperatorValue + activeValue
          break
        case '-':
          resultValue = arithmeticOperatorValue - activeValue
          break
        case '*':
          resultValue = arithmeticOperatorValue * activeValue
          break
        case '/':
          resultValue = arithmeticOperatorValue / activeValue
          break
      }

      // 数据需要转换单位
      if (isConversion) {
        let conversionDataResult = null

        // 数据转换单位
        if (isAssignUnit) { // 指定转换单位
          conversionDataResult = sizeUnitsTransform(this.$tool.getDataUnitAndSuffix(originalUnit).splitUnit, assignUnit, Number(resultValue))
        } else {
          conversionDataResult = conversionData(conversionUnitType, Number(resultValue), this.$tool.getDataUnitAndSuffix(conversionUnits).splitUnit)
        }
        // 保存转换后的数据
        resultValue = Number(conversionDataResult.size).toFixed(toFixed)

        // 百分比计算 已占用 除于 总数 得百分比
        if (conversionPercentage) {
          let convertData = conversionData(conversionUnitType, Number(arithmeticOperatorValue), originalUnit)
          resultValue = `${(Number((resultValue / convertData.size).toFixed(2)) * 100)}`
        }

        resObj.units = isAssignUnit ? assignUnit : conversionDataResult.units
        // 设置转换后的单位
      } else { // 不需要转换单位直接把单位进行赋值
        resultValue = resultValue.toFixed(toFixed)
        resObj.units = this.$tool.getDataUnitAndSuffix(conversionUnits).splitUnit
      }
      resObj.value = resultValue
      return resObj
    }
  }
}
</script>
