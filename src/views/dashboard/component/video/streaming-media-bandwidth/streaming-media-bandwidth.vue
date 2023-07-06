<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100 no-padding">
    <div class="box-item-content content-height-311">
      <div class="item-content-header">
        <div class="title">流媒体带宽监控</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div ref="itemContentBody" class="item-content-body">
        <div class="echart-new-data">
          <div class="new-data-item">
            上行带宽：{{ realData.upBindWidth }}{{ realData.upBindWidthUnit }}
          </div>
          <div class="new-data-item">
            下行带宽：{{ realData.downBindWidth }}{{ realData.downBindWidthUnit }}
          </div>
        </div>
        <div ref="streamingBoxEcharts" class="echarts-boxs">
          <div id="streamingEcharts" ref="streamingEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
import { sizeUnitsTransform } from '@/utils/utils'

export default {
  name: 'StreamingMediaBandwidth',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'streamingMediaBandwidth',
      watchItemShow: null,
      dashboardType: 2,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      getDataInterval: null,
      traffic: [
        {
          name: '上行带宽',
          type: 'line',
          smooth: true,
          data: []
        },
        {
          name: '下行带宽',
          type: 'line',
          smooth: true,
          data: []
        }
      ],
      lastTime: 30000, // 推迟时间
      startTime: new Date().getTime(), // 开始时间
      realData: {}
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
    clearInterval(this.getDataInterval)
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.echartsWidth = this.$refs.streamingBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    this.getVideoBindWidthRealTime()
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      console.log(val)
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      }
    },
    getVideoBindWidthRealTime() { // 获取网关设备带宽/内存/cpu使用情况
      const _this = this
      _this.getDataInterval = setInterval(function() {
        const nowTime = new Date().getTime() // 当前毫秒
        if (nowTime > _this.startTime + _this.lastTime) { // 当前时间毫秒数大于设定的时间毫秒数则删除所有图表数据数组第一个
          // 删除带宽流量数据第一个
          _this.traffic[0].data.shift()
          _this.traffic[1].data.shift()
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
            let upBindWidthUnit = ''
            let downBindWidthUnit = ''
            res.data.forEach(item => {
              /* ====== 各个网关带宽流量相加 START ====== */
              countCtime = item.ctime.split(' ')[1]

              // 将上行和下行的带宽将单位转换为b  最后赋值再把总的带宽进行转换
              const upBindWidthUnitsTransformResult = item.upBindWidth > 0 ? sizeUnitsTransform(item.upBindWidthUnit, 'b', item.upBindWidth) : null
              const downBindWidthUnitsTransformResult = item.downBindWidth > 0 ? sizeUnitsTransform(item.downBindWidthUnit, 'b', item.downBindWidth) : null

              countUpBindWidth = upBindWidthUnitsTransformResult ? countUpBindWidth + Number(upBindWidthUnitsTransformResult.size) : countUpBindWidth
              countDownBindWidth = downBindWidthUnitsTransformResult ? countDownBindWidth + Number(downBindWidthUnitsTransformResult.size) : countDownBindWidth

              upStreamCount = upStreamCount + item.upStreamCount
              downStreamCount = downStreamCount + item.downStreamCount
              /* ====== 各个网关带宽流量相加 START ====== */
            })

            // 将上面转换为b的带宽数据转换为MB
            const upBindWidthUnitsConversionResult = countUpBindWidth > 0 ? sizeUnitsTransform('b', 'mb', countUpBindWidth) : 0
            const upBindWidth = countUpBindWidth > 0 ? Number(upBindWidthUnitsConversionResult.size) : 0
            upBindWidthUnit = countUpBindWidth > 0 ? 'MB' : ''

            const downBindWidthUnitsConversionResult = countDownBindWidth > 0 ? sizeUnitsTransform('b', 'mb', countDownBindWidth) : 0
            const downBindWidth = countDownBindWidth > 0 ? Number(downBindWidthUnitsConversionResult.size) : 0
            downBindWidthUnit = countDownBindWidth > 0 ? 'MB' : ''
            _this.realData = { // 设置顶部实时数据
              upBindWidth: upBindWidth.toFixed(2),
              upBindWidthUnit: upBindWidthUnit,
              downBindWidth: downBindWidth.toFixed(2),
              downBindWidthUnit: downBindWidthUnit
            }
            /* ====== 渲染带宽流量 START ====== */
            _this.traffic[0].data.push([`${countCtime}`, upBindWidth.toFixed(2), upStreamCount])
            _this.traffic[1].data.push([`${countCtime}`, downBindWidth.toFixed(2), downStreamCount])
            _this.getTraffic()
            /* ====== 渲染带宽流量 END ====== */
          }
        })
      }, 1000)
    },
    getTraffic() { // 带宽流量统计图
      const option = {
        animation: false,
        color: ['#fe4244', '#d4d32e'],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: '#333'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        },
        yAxis: [{
          type: 'value',
          show: false,
          axisLabel: {
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        grid: {
          top: '10%',
          left: '0%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = params[0].name
            result += '<br/>'

            params.forEach(function(item) {
              result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>'
              result += item.seriesName
              result += item.data[1] + 'MB'
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
      if (self.$refs['streamingEcharts']) {
        const myChart = echarts.init(self.$refs['streamingEcharts'], 'light')
        myChart.setOption(option, true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.echart-new-data {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  margin-top: 10px;
  margin-bottom: 10px;
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  .new-data-item {
    margin: 0 10px;
    display: flex;
    align-items: center;
    .new-data-color {
      width: 14px;
      height: 14px;
      border-radius: 4px;
      margin-right: 4px;
    }
  }
}
</style>
