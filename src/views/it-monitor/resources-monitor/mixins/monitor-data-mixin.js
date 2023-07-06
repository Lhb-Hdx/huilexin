/**
 * @description it监控数据获取方法
 * @author linhaojia
 * @date 2022/9/24 21:50:39
 */
export default {
  data() {
    return {
      monitorItemHistoryData: []
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('getMonitorItemHistoryData,insertHistoryDataInEchart')
  },
  mounted() {
    // 监听获取历史数据 并且请求数据组装方法
    this.$EventBus.$on('getMonitorItemHistoryData', (res) => {
      if (this.echartData) this.setMonitorItemHistoryData(this.echartData, res)
    })
    // 监听组装好的数据到echart
    this.$EventBus.$on('insertHistoryDataInEchart', (res) => {
      console.log('insertHistoryDataInEchart', this.echartData)

      if (!this.echartData) return
      const idx = this.echartData.findIndex(item => +item.itemId === +res.itemId)
      console.log(idx)
      if (idx !== -1) {
        this.echartData[idx].data.unshift(...res.data)
        this.echartData[idx].units.unshift(...res.units)
        this.echartData[idx].time.unshift(...res.time)
        console.log('insertHistoryDataInEchart', this.echartData[idx])
      }
    })
  },
  methods: {
    /**
     * @description 查看监控项的历史数据，由于监控项实时数据曲线不够，所以获取之一个小时的数据出来加进去
     * @param agent 网关
     * @param itemid 监控项id 字符串，多个用逗号隔开
     * @returns {*[]}
     */
    async getMonitorItemHistoryData(agent, itemid, valueType) {
      // 先查询一下监控项的数据
      const monitorItemHistoryData = await this.$request({ url: this.api.itMonitor.findZbxItemsHost, data: { agent, itemids: itemid, limit: -1 } })
      if (monitorItemHistoryData.code === 1 && monitorItemHistoryData.data) {
        this.monitorItemHistoryData = monitorItemHistoryData.data
        // 开始时间
        const startClock = parseInt(this.$tool.callbackTime(1).valueOf() / 1000)
        // 结束时间
        const endClock = parseInt(new Date().valueOf() / 1000)
        const historyData = await this.$request({
          url: this.api.itMonitor.agentGetHistoryData,
          data: { agent, itemid, valueType, startClock, endClock }
        })
        if (historyData.code === 1) {
          this.$EventBus.$emit('getMonitorItemHistoryData', {
            historyData: JSON.parse(historyData.model),
            monitorItemHistoryData: monitorItemHistoryData.data
          })
        }
      } else {
        return []
      }
    },
    /**
     * @description 设置监控项历史数据到echart趋势图
     * @param itemId 监控项id
     * @param echartData 监控项的echart参数
     * @param data 历史数据
     * @returns {Promise<void>}
     */
    async setMonitorItemHistoryData(echartData, historydataRes) {
      echartData.forEach(echartDataItem => {
        if (!echartDataItem.way || echartDataItem.way === 'single') {
          if (historydataRes.historyData[`itemData${echartDataItem.itemId}`]) {
            const getZbxItemsHostIdx = historydataRes.monitorItemHistoryData.findIndex(items => +items.itemid === +echartDataItem.itemId)
            if (getZbxItemsHostIdx === -1) return
            const getZbxItemsHost = historydataRes.monitorItemHistoryData[getZbxItemsHostIdx]
            const time = []
            const units = []
            const data = []
            historydataRes.historyData[`itemData${echartDataItem.itemId}`].forEach(item => {
              // 设置时间段
              const clock = new Date(item.clock * 1000)
              time.push(`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
              let activeValue = item.value

              let resultValue = activeValue
              if (echartDataItem.arithmeticOperator) {
                switch (echartDataItem.arithmeticOperator) {
                  case '+':
                    resultValue = echartDataItem.arithmeticOperatorValue + activeValue
                    break
                  case '-':
                    resultValue = echartDataItem.arithmeticOperatorValue - activeValue
                    break
                  case '*':
                    resultValue = echartDataItem.arithmeticOperatorValue * activeValue
                    break
                  case '/':
                    resultValue = echartDataItem.arithmeticOperatorValue / activeValue
                    break
                }
              }
              if (echartDataItem.isConversion) { // 需要转换单位
                let conversionDataResult = null
                // 转换单位
                if (echartDataItem.isAssignUnit) { // 指定转换单位
                  // hz转换mhz
                  if (echartDataItem.assignUnit.indexOf('Hz') !== -1) {
                    conversionDataResult = +(resultValue / 1000000).toFixed(0)
                  } else {
                    conversionDataResult = this.$tool.sizeUnitsTransform(this.$tool.getDataUnitAndSuffix(getZbxItemsHost.units).splitUnit, echartDataItem.assignUnit, resultValue)
                  }
                } else {
                  conversionDataResult = this.$tool.conversionData(echartDataItem.conversionUnitType, resultValue, this.$tool.getDataUnitAndSuffix(getZbxItemsHost.units).splitUnit)
                }
                // 保存转换后的数据
                if (echartDataItem.assignUnit.indexOf('Hz') !== -1) {
                  resultValue = conversionDataResult
                } else {
                  resultValue = Number(conversionDataResult.size).toFixed(echartDataItem.toFixed)
                }
                // 设置转换后的单位
                units.push(echartDataItem.isAssignUnit ? echartDataItem.assignUnit : conversionDataResult.units)
              } else { // 不需要转换单位直接把单位进行赋值
                units.push(echartDataItem.unit)
              }
              // 设置转换后的数据
              data.push(resultValue)
            })
            this.$EventBus.$emit('insertHistoryDataInEchart', {
              itemId: echartDataItem.itemId, data, units, time
            })
          }
        } else {
          this.$EventBus.$emit('onMethods', { m: echartDataItem.methods, t: 'realTimeBeforeHistory', r: { ...echartDataItem, data: historydataRes.historyData } })
          // this[`${echartDataItem.methods}`]('realTimeBeforeHistory', { ...echartDataItem, data: historydataRes.historyData })
        }
      })
    }
  }
}
