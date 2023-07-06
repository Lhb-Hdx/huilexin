/**
 * @description 自定义统计方法
 */

/*
规定结构：

自定义逻辑方法：
方法名称(type, res) {
    const { data } = res // 返回的数据

    if (type === 'realTime') {
        this.getPropsEchartParams.forEach((item, idx) => {
            if (item.key === res.key) {
                // 自定义处理逻辑

                // 设置数据
                this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, '数据')
                this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '单位')
                if (this.getPropsEchartParams[idx].data.length > 1) this.$set(this.getPropsEchartParams[idx].data, 0, this.getPropsEchartParams[idx].data[1])
                if (this.timeTypeValue !== 0) {
                    if (this.getPropsEchartParams[idx].time.length === this.dataMaxLength) this.getPropsEchartParams[idx].time.shift()
                }
            }
        })
    }
    if (type === 'trend') {
        this.getPropsEchartParams.forEach((item, idx) => {
            if (item.key === res.key) {
                // 自定义处理逻辑

                //设置数据
                this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, '数据')
                this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '单位')
            }
        })
    }
    if (type === 'history') {}
}
*/

import {dateFormat} from '@/utils/utils'

export default {
  mounted() {
    this.$EventBus.$on('onMethods', (o) => {
      this[`${o.m}`](o.t, o.r)
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('onMethods')
  },
  methods: {
    /**
     * @description 存储设备 - 内存使用统计
     * @param {*} type 数据类型（realTime：实时趋势图 trend：历史趋势图 history：历史表格 realTimeBeforeHistory：设备详情监控项实时统计图里面的一段一个月历史数据）
     * @param {*} res 数据
     */
    monitorStorageDeviceMemoryStatistics(type, res) {
      const { data } = res
      // 实时统计图
      if (type === 'realTime') {
        this.getPropsEchartParams.forEach((item, idx) => {
          const clock = new Date()
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

          let memoryAble = null
          let memoryTotal = null
          data.forEach(dataItem => {
            if (dataItem.itemName.indexOf('Total Physical Available') !== -1) memoryAble = dataItem.itemValue
            if (dataItem.itemName.indexOf('Total Physical Memory') !== -1) memoryTotal = dataItem.itemValue
          })

          const memoryAbleVal = this.$tool.sizeUnitsConversion(Number(memoryAble), 'capital') // 可用内存
          const memoryTotalVal = this.$tool.sizeUnitsConversion(Number(memoryTotal), 'capital') // 总内存
          const memoryOccVal = Number((memoryTotalVal.size - memoryAbleVal.size).toFixed(2)) // 已用内存
          const memoryPercentage = `${(Number((memoryOccVal / memoryTotalVal.size).toFixed(2)) * 100)}`

          this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '%')
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, memoryPercentage)
        })
      }
      // 实时统计图里面的一段一个月历史数据
      if (type === 'realTimeBeforeHistory') {
        const time = []
        const units = []
        const echartData = []
        const totalMemory = data[`itemData${res.objAttrDictionary.totalMemoryItemId}`] || []
        const ableValMemory = data[`itemData${res.objAttrDictionary.ableValMemoryItemId}`] || []
        totalMemory.forEach((item) => {
          const getAbleValMemoryIndex = ableValMemory.findIndex(el => +el.clock === +item.clock)
          if (getAbleValMemoryIndex !== -1) {
            const clock = new Date(item.clock * 1000)
            time.push(`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
            units.push('%')
            echartData.push(this.$tool.getPercent(+item.value - +ableValMemory[getAbleValMemoryIndex].value, +item.value))
          }
        })
        this.$EventBus.$emit('insertHistoryDataInEchart', {
          itemId: res.itemId, data: echartData, units, time
        })
      }
      // 历史统计图
      if (type === 'trend') {
        this.getPropsEchartParams.forEach((item, idx) => {
          let memoryAble = data[`itemData${res.objAttrDictionary.ableValMemoryItemId}`]
          let memoryTotal = data[`itemData${res.objAttrDictionary.totalMemoryItemId}`]
          let valueKeyName = this.timeTypeObject.t > 3 ? 'valueMax' : 'value'

          if (memoryAble.length > 0 && memoryTotal.length > 0) {
            memoryAble.forEach((item, index) => {
              // 设置时间段
              const clock = new Date(item.clock * 1000)
              this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
              const memoryAbleVal = this.$tool.sizeUnitsConversion(Number(item[`${valueKeyName}`]), 'capital') // 可用内存
              const memoryTotalVal = this.$tool.sizeUnitsConversion(Number(memoryTotal[index][`${valueKeyName}`]), 'capital') // 总内存
              const memoryOccVal = Number((memoryTotalVal.size - memoryAbleVal.size).toFixed(2)) // 已用内存
              const memoryPercentage = `${(Number((memoryOccVal / memoryTotalVal.size).toFixed(2)) * 100)}`
              this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, memoryPercentage)
              this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '%')
            })
            if (this.timeTypeObject.type === 'history') {
              this.getPropsTableParams.forEach(item => {
                item.type.forEach((key, i) => {
                  if (key === 'max') {
                    this.$set(this.tableData[0].col, this.tableData[0].col.length, {
                      label: item.label[i],
                      value: Math.max(...this.getPropsEchartParams[idx].data),
                      unit: '%',
                      fixed: 2
                    })
                  }
                  if (key === 'avg') {
                    this.$set(this.tableData[0].col, this.tableData[0].col.length, {
                      label: item.label[i],
                      value: this.$tool.avg(this.getPropsEchartParams[idx].data),
                      unit: '%',
                      fixed: 2
                    })
                  }
                  if (key === 'min') {
                    this.$set(this.tableData[0].col, this.tableData[0].col.length, {
                      label: item.label[i],
                      value: Math.min(...this.getPropsEchartParams[idx].data),
                      unit: '%',
                      fixed: 2
                    })
                  }
                })
              })
            }
          }
        })
      }
      // 历史表格
      // if (type === 'history') {}
    },
    /**
     * @description 操作系统 - 磁盘使用率统计
     * @param {*} type 数据类型（realTime：实时趋势图 trend：历史趋势图 history：历史表格 realTimeBeforeHistory：设备详情监控项实时统计图里面的一段一个月历史数据）
     * @param {*} res 数据
     */
    operatingSystemDiskUsagePercentsStatistics(type, res) {
      const { data } = res
      if (type === 'realTime') {
        this.getPropsEchartParams.forEach((item, idx) => {
          const clock = new Date()
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

          let used = 0
          let total = 0
          let usagePercents = 0

          data.forEach(item => {
            if (item.itemName.indexOf('Used space') !== -1) {
              // 所有磁盘使用大小
              used += Number(item.itemValue)
            }
            if (item.itemName.indexOf('Total space') !== -1) {
              // 所有磁盘空间大小
              total += Number(item.itemValue)
            }
          })
          // 计算各个空间的大小和使用大小去计算出运行性能使用的磁盘百分比
          if (used > 0 && total > 0) {
            const setDiskUsedPercentageVal = (used / total) * 100
            if (total > 0) {
              usagePercents = Number(setDiskUsedPercentageVal.toFixed(2))
            }
          }

          this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '%')
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, usagePercents)
        })
      }
      if (type === 'trend') {
        let valueKeyName = this.timeTypeObject.t > 3 ? 'valueMax' : 'value'
        let allTotal = []
        let allUsed = []
        let time = []
        let units = []
        let echartData = []
        res.objAttrDictionary.totalItemId.forEach(key => {
          if (data[`itemData${key}`]) {
            if (allTotal.length === 0) {
              allTotal = data[`itemData${key}`]
            } else {
              data[`itemData${key}`].forEach((item, index) => {
                console.log(item[`${valueKeyName}`])
                allTotal[index].value += item[`${valueKeyName}`]
              })
            }
          }
        })
        res.objAttrDictionary.usedItemId.forEach(key => {
          if (data[`itemData${key}`]) {
            if (allUsed.length === 0) {
              allUsed = data[`itemData${key}`]
            } else {
              data[`itemData${key}`].forEach((item, index) => {
                allUsed[index].value += item[`${valueKeyName}`]
              })
            }
          }
        })
        allTotal.forEach((item, index) => {
          const clock = new Date(item.clock * 1000)
          time.push(`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
          units.push('%')
          echartData.push(this.$tool.getPercent(+allUsed[index][`${valueKeyName}`], +item[`${valueKeyName}`]))
        })
        this.getPropsEchartParams[0].time.unshift(...time)
        this.getPropsEchartParams[0].data.unshift(...echartData)
        this.getPropsEchartParams[0].units.unshift(...units)
      }
      // if (type === 'history') {}
    },
    /**
     * @description 存储设备 - 卷使用率统计
     * @param {*} type 数据类型（realTime：实时趋势图 trend：历史趋势图 history：历史表格 realTimeBeforeHistory：设备详情监控项实时统计图里面的一段一个月历史数据）
     * @param {*} res 数据
     */
    monitorStorageDeviceVolumeUsagePercentsStatistics(type, res) {
      const { data } = res
      if (type === 'realTime') {
        this.getPropsEchartParams.forEach((item, idx) => {
          const clock = new Date()
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

          let totalSize = 0
          let usedSize = 0
          data.forEach(item => {
            if (item.itemName.indexOf('Storage Size on') !== -1) {
              totalSize += +item.itemValue
            }
            if (item.itemName.indexOf('Storage Used on') !== -1) {
              usedSize += +item.itemValue
            }
          })

          this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '%')
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, this.$tool.getPercent(+usedSize, +totalSize))
        })
      }
      if (type === 'trend') {
        let valueKeyName = this.timeTypeObject.t > 3 ? 'valueMax' : 'value'
        let allTotal = []
        let allUsed = []
        let time = []
        let units = []
        let echartData = []
        res.objAttrDictionary.totalItemId.forEach(key => {
          if (data[`itemData${key}`]) {
            if (allTotal.length === 0) {
              allTotal = data[`itemData${key}`]
            } else {
              data[`itemData${key}`].forEach((item, index) => {
                allTotal[index].value += item[`${valueKeyName}`]
              })
            }
          }
        })
        res.objAttrDictionary.usedItemId.forEach(key => {
          if (data[`itemData${key}`]) {
            if (allUsed.length === 0) {
              allUsed = data[`itemData${key}`]
            } else {
              data[`itemData${key}`].forEach((item, index) => {
                allUsed[index].value += item[`${valueKeyName}`]
              })
            }
          }
        })
        allTotal.forEach((item, index) => {
          const clock = new Date(item.clock * 1000)
          time.push(`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
          units.push('%')
          echartData.push(this.$tool.getPercent(+allUsed[index][`${valueKeyName}`], +item[`${valueKeyName}`]))
        })
        this.getPropsEchartParams[0].time.unshift(...time)
        this.getPropsEchartParams[0].data.unshift(...echartData)
        this.getPropsEchartParams[0].units.unshift(...units)
      }
    },
    /**
     * @description 虚拟设备 - 内存使用率统计
     * @param {*} type 数据类型（realTime：实时趋势图 trend：历史趋势图 history：历史表格 realTimeBeforeHistory：设备详情监控项实时统计图里面的一段一个月历史数据）
     * @param {*} res 数据
     */
    monitorVMDeviceMemoryUsagePercentsStatistics(type, res) {
      const { data } = res
      if (type === 'realTime') {
        this.getPropsEchartParams.forEach((item, idx) => {
          const clock = new Date()
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)

          let usedSize = 0
          let totalSize = 0
          data.forEach(item => {
            if (item.itemName.indexOf('Memory size') !== -1) {
              totalSize = item.itemValue
            }
            if (item.itemName.indexOf('memory usage') !== -1) {
              usedSize = item.itemValue
            }
          })

          this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, '%')
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, this.$tool.getPercent(+usedSize, +totalSize))
        })
      }
      if (type === 'trend') {
        let time = []
        let units = []
        let echartData = []
        let valueKeyName = this.timeTypeObject.t > 3 ? 'valueMax' : 'value'
        data[`itemData${res.objAttrDictionary.memoryUsageItemId}`].forEach(item => {
          const clock = new Date(item.clock * 1000)
          time.push(`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
          units.push('%')
          echartData.push(this.$tool.getPercent(+item[`${valueKeyName}`], +res.objAttrDictionary.primitiveMemoryTotal))
        })
        this.getPropsEchartParams[0].time.unshift(...time)
        this.getPropsEchartParams[0].data.unshift(...echartData)
        this.getPropsEchartParams[0].units.unshift(...units)
      }
    },
    /**
     * @description 数据库 - 文件大小统计
     * @param {*} type 数据类型（realTime：实时趋势图 trend：历史趋势图 history：历史表格 realTimeBeforeHistory：设备详情监控项实时统计图里面的一段一个月历史数据）
     * @param {*} res 数据
     */
    monitorDBDeviceFileSizeStatistics(type, res) {
      const { data } = res
      if (type === 'realTime') {
        this.getPropsEchartParams.forEach((item, idx) => {
          const clock = new Date()
          let total = 0
          data.forEach((item) => {
            total += +item.itemValue
          })
          const sizeUnitsTransform = this.$tool.sizeUnitsTransform('B', 'GB', total)
          this.$set(this.getPropsEchartParams[idx].time, this.getPropsEchartParams[idx].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
          this.$set(this.getPropsEchartParams[idx].units, this.getPropsEchartParams[idx].units.length, 'GB')
          this.$set(this.getPropsEchartParams[idx].data, this.getPropsEchartParams[idx].data.length, sizeUnitsTransform.size.toFixed(2))
        })
      }
      if (type === 'trend') {
        let time = []
        let units = []
        let echartData = []
        let allData = []
        data.itemid.split(',').forEach(key => {
          allData = [...allData, ...data[`itemData${key}`]]
        })
        const allDataGroup = this.$tool.classifiedJSONDataByField(allData, 'clock')

        let valueKeyName = this.timeTypeObject.t > 3 ? 'valueMax' : 'value'
        Object.keys(allDataGroup).forEach(key => {
          allDataGroup[`${key}`].forEach(item => {
            const clock = new Date(item.clock * 1000)
            const sizeUnitsTransform = this.$tool.sizeUnitsTransform('B', 'GB', item[`${valueKeyName}`])
            time.push(`${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
            units.push('GB')
            echartData.push(+sizeUnitsTransform.size.toFixed(2))
          })
        })

        this.getPropsEchartParams[0].time.unshift(...time)
        this.getPropsEchartParams[0].data.unshift(...echartData)
        this.getPropsEchartParams[0].units.unshift(...units)
      }
    }
  }
}
