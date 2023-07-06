<template>
  <div class="main">
    <el-row :gutter="20">
      <el-col :span="12" style="padding-left:10px;" class="padding-10">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>带宽流量</span>
          </div>
          <div ref="traffic" class="traffic" style="height: 250px" />
        </el-card>
      </el-col>
      <el-col :span="12" class="padding-10">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>CPU</span>
          </div>
          <div ref="cpu" class="cpu" style="height: 250px" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12" class="padding-10">
        <el-card class="box-card ">
          <div slot="header" class="clearfix">
            <span>内存</span>
          </div>
          <div ref="memory" class="memory" style="height: 250px" />
        </el-card>
      </el-col>
      <el-col :span="12" class="padding-10">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>设备在线/离线</span>
          </div>
          <div ref="online" class="online" style="height: 250px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts/theme/macarons.js'
import request from '@/utils/request'
import api from '@/api/api'

/**
 * @description 转换rgba
 * @param hex
 * @param opacity
 * @returns {string}
 */
function hexToRgba(hex, opacity) {
  let rgbaColor = ''
  const reg = /^#[\da-f]{6}$/i
  if (reg.test(hex)) {
    rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
      '0x' + hex.slice(3, 5)
    )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
  }
  return rgbaColor
}

export default {
  name: 'SystemMonitor',
  data() {
    return {
      clientList: [],
      traffic: [ // 带宽
        {
          name: '上行带宽',
          type: 'line',
          data: [],
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            color: '#87DEAF',
            shadowBlur: 3,
            shadowColor: hexToRgba('#87DEAF', 0.5),
            shadowOffsetY: 8
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba('#87DEAF', 0.3) },
                { offset: 1, color: hexToRgba('#87DEAF', 0) }
              ],
              false
            )
          }
        },
        {
          name: '下行带宽',
          type: 'line',
          data: [],
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            color: '#3ba9ed',
            shadowBlur: 3,
            shadowColor: hexToRgba('#3ba9ed', 0.5),
            shadowOffsetY: 8
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: hexToRgba('#3ba9ed', 0.3) },
                { offset: 1, color: hexToRgba('#3ba9ed', 0) }
              ],
              false
            )
          }
        }
      ],
      cpu: [], // cpu
      memory: [], // 内存
      memTotal: 0, // 总内存
      memUnit: '', // 内存单位
      lastTime: 30000, // 推迟时间
      startTime: new Date().getTime(), // 开始时间
      getDataInterval: null, // 获取统计图数据的定时器
      cpuColor: ['#87DEAF', '#3ba9ed'],
      memColor: ['#87DEAF', '#3ba9ed']
    }
  },
  computed: {
    getClientName() {
      return function(cid) {
        const clientIdx = this.clientList.findIndex(item => item.clientId === cid)
        if (clientIdx !== -1) {
          return this.clientList[clientIdx].name
        }
      }
    }
  },
  created() {
  },
  destroyed: function() {
    clearInterval(this.getDataInterval)
  },
  mounted() {
    const _this = this
    // 添加CPU和内存的图表颜色
    // _this.rgb()
    clearInterval(_this.getDataInterval) // 清除定时器
    return request({
      url: api.video.findVideoGateway, data: {}
    }).then(res => {
      if (res.code === 1) {
        _this.clientList = res.data
      }
      _this.getVideoBindWidthRealTime()
      _this.getVideoDvrDetail()
    })
  },
  methods: {
    getVideoBindWidthRealTime() { // 获取网关设备带宽/内存/cpu使用情况
      const _this = this
      _this.getDataInterval = setInterval(function() {
        const nowTime = new Date().getTime() // 当前毫秒
        if (nowTime > _this.startTime + _this.lastTime) { // 当前时间毫秒数大于设定的时间毫秒数则删除所有图表数据数组第一个
          // 删除带宽流量数据第一个
          _this.traffic[0].data.shift()
          _this.traffic[1].data.shift()
          // 删除各个网关CPU数据第一个
          for (let i = 0; i < _this.cpu.length; i++) {
            _this.cpu[i].data.shift()
          }
          // 删除各个网关内存数据第一个
          for (let i = 0; i < _this.memory.length; i++) {
            _this.memory[i].data.shift()
          }
        }
        request({
          url: api.video.getVideoBindWidthRealTime, data: {}
        }).then(res => {
          if (res.code === 1) {
            let countUpBindWidth = 0 // 当前所有网关的总上行带宽
            let countDownBindWidth = 0 // 当前所有网关的总下行带宽
            let upStreamCount = 0 // 当前所有网关的总上行连接数
            let downStreamCount = 0 // 当前所有网关的总下行连接数
            let countCtime = '' // 当前带宽的时间
            res.data.forEach(item => {
              const ctime = item.ctime.split(' ')[1]

              /* ====== 各个网关带宽流量相加 START ====== */
              countCtime = item.ctime.split(' ')[1]

              // 将带宽单位换算成Mb

              let upBindWidth = 0
              if (item.upBindWidthUnit === 'Kb') {
                upBindWidth = item.upBindWidth * 0.0009765625
              } else if (item.upBindWidthUnit === 'Gb') {
                upBindWidth = item.upBindWidth * 1024
              } else {
                upBindWidth = item.upBindWidth
              }

              let downBindWidth = 0
              if (item.downBindWidthUnit === 'Kb') {
                downBindWidth = item.downBindWidth * 0.0009765625
              } else if (item.downBindWidthUnit === 'Gb') {
                downBindWidth = item.downBindWidth * 1024
              } else {
                downBindWidth = item.downBindWidth
              }

              countUpBindWidth = countUpBindWidth + upBindWidth
              countDownBindWidth = countDownBindWidth + downBindWidth
              upStreamCount = upStreamCount + item.upStreamCount
              downStreamCount = downStreamCount + item.downStreamCount
              /* ====== 各个网关带宽流量相加 START ====== */

              /* ====== 渲染CPU START ====== */
              const cpuIndex = _this.cpu.findIndex(items => items.clientId === item.clientId)
              const systemCpu = item.systemCpu

              /* 多网关CPU
              if (cpuIndex !== -1) {
                _this.cpu[cpuIndex].data.push([`${ctime}`, systemCpu.toFixed(2)])
              } else {
                _this.cpu.push(
                  {
                    clientId: item.clientId,
                    name: _this.getClientName(item.clientId) ? _this.getClientName(item.clientId) : '',
                    type: 'line',
                    areaStyle: {},
                    data: [
                      [`${ctime}`, systemCpu.toFixed(2)]
                    ]
                  }
                )
              } */

              if (cpuIndex !== -1) {
                _this.cpu[cpuIndex].data.push([`${ctime}`, systemCpu.toFixed(2)])
              }

              if (_this.cpu.length === 0) {
                _this.cpu.push(
                  {
                    clientId: item.clientId,
                    name: _this.getClientName(item.clientId) ? _this.getClientName(item.clientId) : '',
                    type: 'line',
                    smooth: true,
                    symbolSize: 8,
                    lineStyle: {
                      color: '#87DEAF',
                      shadowBlur: 3,
                      shadowColor: hexToRgba('#87DEAF', 0.5),
                      shadowOffsetY: 8
                    },
                    areaStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                        [
                          { offset: 0, color: hexToRgba('#87DEAF', 0.3) },
                          { offset: 1, color: hexToRgba('#87DEAF', 0) }
                        ],
                        false
                      )
                    },
                    data: [
                      [`${ctime}`, systemCpu.toFixed(2)]
                    ]
                  }
                )
              }

              _this.getCPU()
              /* ====== 渲染CPU END ====== */

              /* ====== 渲染内存 START ====== */
              const memoryIndex = _this.memory.findIndex(items => items.clientId === item.clientId)
              _this.memTotal = item.memTotal.toFixed(2)
              _this.memUnit = item.memUnit
              const memUsed = item.memUsed

              /* 多网关内存
              if (memoryIndex !== -1) {
                _this.memory[memoryIndex].data.push([`${ctime}`, memUsed.toFixed(2)])
              } else {
                _this.memory.push(
                  {
                    clientId: item.clientId,
                    name: _this.getClientName(item.clientId) ? _this.getClientName(item.clientId) : '',
                    type: 'line',
                    areaStyle: {},
                    data: [
                      [`${ctime}`, memUsed.toFixed(2)]
                    ]
                  }
                )
              } */

              if (memoryIndex !== -1) {
                _this.memory[memoryIndex].data.push([`${ctime}`, memUsed.toFixed(2)])
              }

              if (_this.memory.length === 0) {
                _this.memory.push(
                  {
                    clientId: item.clientId,
                    name: _this.getClientName(item.clientId) ? _this.getClientName(item.clientId) : '',
                    type: 'line',
                    smooth: true,
                    symbolSize: 8,
                    lineStyle: {
                      color: '#87DEAF',
                      shadowBlur: 3,
                      shadowColor: hexToRgba('#87DEAF', 0.5),
                      shadowOffsetY: 8
                    },
                    areaStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                        [
                          { offset: 0, color: hexToRgba('#87DEAF', 0.3) },
                          { offset: 1, color: hexToRgba('#87DEAF', 0) }
                        ],
                        false
                      )
                    },
                    data: [
                      [`${ctime}`, memUsed.toFixed(2)]
                    ]
                  }
                )
              }

              _this.getMemory()
              /* ====== 渲染内存 END ====== */
            })

            /* ====== 渲染带宽流量 START ====== */
            _this.traffic[0].data.push([`${countCtime}`, countUpBindWidth.toFixed(2), upStreamCount])
            _this.traffic[1].data.push([`${countCtime}`, countDownBindWidth.toFixed(2), downStreamCount])
            _this.getTraffic()
            /* ====== 渲染带宽流量 END ====== */
          }
        })
      }, 1000)
    },
    getVideoDvrDetail() { // 获取在线离线
      return request({
        url: api.video.getVideoDvrDetail, data: {}
      }).then(res => {
        if (res.code === 1) {
          const onlineData = [
            { value: res.model.onlineCount, name: '在线设备' },
            { value: res.model.offlineCount, name: '离线设备' }
          ]
          this.getOnline(onlineData)
        }
      })
    },
    getTraffic() { // 带宽流量统计图
      const option = {
        animation: false,
        color: ['#87DEAF', '#3ba9ed'],
        xAxis: {
          type: 'category',
          boundaryGap: false
          // axisPointer: {
          //   label: {
          //     show: false
          //   },
          //   handle: {
          //     show: true
          //   }
          // }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} Mb'
          }
        },
        grid: {
          top: 10,
          left: 60,
          right: 15,
          height: 220
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = params && params.length > 0 ? params[0].name : ''
            result += '<br/>'

            params.forEach(function(item) {
              result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>'
              result += item.seriesName
              result += item.data[1] + 'Mb'
              result += '<br/>'
            })

            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[0].color + '"></span>'
            result += '上行连接数'
            result += params[0].data[2]

            result += '<br/>'
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[1].color + '"></span>'
            result += '下行连接数'
            result += params[1].data[2]

            return result
          }
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        series: this.traffic
      }
      const self = this
      const myChart = echarts.init(self.$refs['traffic'], 'light')
      myChart.setOption(option, true)
    },
    getCPU() { // CPU统计图
      const option = {
        animation: false,
        color: this.cpuColor,
        xAxis: [{
          type: 'category',
          axisPointer: {
            label: {
              show: false
            },
            handle: {
              show: true
            }
          },
          splitLine: {
            show: false
          }
        }],
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} %'
          },
          max: 100
        },
        grid: {
          top: 10,
          left: 45,
          right: 15,
          height: 220
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            let result = params && params.length > 0 ? params[0].name : ''
            result += '<br/>'

            if (params && params.length > 0) {
              params.forEach(function(item) {
                result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>'
                result += item.seriesName
                result += item.data[1] + '%'
                result += '<br/>'
              })
            }

            return result
          }
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        series: this.cpu
      }
      const self = this
      const myChart = echarts.init(self.$refs['cpu'], 'light')
      myChart.setOption(option, true)
    },
    getMemory() { // 获取内存统计图
      const _this = this
      const option = {
        animation: false,
        color: this.memColor,
        xAxis: [{
          type: 'category',
          axisPointer: {
            label: {
              show: false
            },
            handle: {
              show: true
            }
          },
          splitLine: {
            show: false
          }
        }],
        yAxis: {
          type: 'value',
          max: this.memTotal,
          axisLabel: {
            formatter: function(value) {
              const labelText = []
              if (value < _this.memTotal) {
                labelText.push(`${value}${_this.memUnit}`)
              } else {
                labelText.push(`${_this.memTotal}${_this.memUnit}`)
              }
              return labelText
            }
          }
        },
        grid: {
          top: 10,
          left: 50,
          right: 15,
          height: 220
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            let result = params && params.length > 0 ? params[0].name : ''
            result += '<br/>'

            params.forEach(function(item) {
              result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>'
              result += item.seriesName
              result += item.data[1] + _this.memUnit
              result += '<br/>'
            })

            return result
          }
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        series: this.memory
      }
      const self = this
      const myChart = echarts.init(self.$refs['memory'], 'light')
      myChart.setOption(option, true)
    },
    getOnline(data) { // 设备在线离线统计
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 1,
          fontSize: '10',
          data: ['在线设备', '离线设备']
        },
        series: [
          {
            name: '设备在线/离线统计',
            type: 'pie',
            radius: ['50%', '70%'],
            label: {
              formatter: '{b}: {c}'
            },
            labelLine: {
              show: true
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              normal: {
                color: function(params) {
                  // 自定义颜色
                  var colorList = [
                    'rgb(0, 178, 133)', 'red'
                  ]
                  return colorList[params.dataIndex]
                }
              }
            },
            data: data
          }
        ]
      }
      const self = this
      const myChart = echarts.init(self.$refs['online'], 'light')
      myChart.setOption(option, true)
    }
    // rgb() { // rgb颜色随机
    //   for (let i = 0; i < 50; i++) {
    //     const r = Math.floor(Math.random() * 256)
    //     const g = Math.floor(Math.random() * 256)
    //     const b = Math.floor(Math.random() * 256)
    //     if (i < 25) {
    //       this.cpuColor.push('rgb(' + r + ',' + g + ',' + b + ')')
    //     } else {
    //       this.memColor.push('rgb(' + r + ',' + g + ',' + b + ')')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
  .main {
    padding: 10px;
  }
  .el-card.is-always-shadow {
    box-shadow:0 0;
  }
  .padding-10 {
    padding: 10px;
  }
  .el-card ::v-deep .el-card__body {
	padding: 10px;
}
</style>
