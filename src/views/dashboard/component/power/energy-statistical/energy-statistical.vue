<template>
  <div class="dashboard-box-item width-100">
    <div class="box-item-content content-height-350">
      <div class="item-content-header">
        <div class="title">能耗统计</div>
        <div class="line"><div class="blo" /></div>
      </div>
      <div ref="itemContentBody" class="item-content-body flexBox align-item-center">
        <div class="echart-box-left">
          <div id="leftEcharts" ref="leftEcharts" :style="{width: '100%', height: '200px'}" />
        </div>
        <div class="echart-box-right">
          <div id="rightEcharts" ref="rightEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'

export default {
  name: 'EnergyStatistical',
  data() {
    return {
      devStatus: [
        { value: 20, name: '智能设备', color: '#FE4D4E', level: 1 },
        { value: 40, name: '灯光照明', color: '#FF7F00', level: 2 },
        { value: 30, name: '机电设备', color: '#00b285', level: 3 }
      ],
      newAlarmEchartsObj: null,
      newAlarmList: [],
      alarmSubType: [],
      alarmLogCount: 0,
      chnList: [],
      echartsHeight: 0,
      labelData: []
    }
  },
  computed: {
    setAlarmLevel() {
      const that = this
      return function(alarmTypeMain) {
        const idx = that.devStatus.findIndex(item => item.level === alarmTypeMain)
        if (idx !== -1) {
          return '[' + that.devStatus[idx].name + ']'
        }
      }
    },
    setAlarmLevelColor() {
      const that = this
      return function(alarmTypeMain) {
        const idx = that.devStatus.findIndex(item => item.level === alarmTypeMain)
        if (idx !== -1) {
          return that.devStatus[idx].color
        }
      }
    }
  },
  mounted() {
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    for (let i = 0; i < 25; i++) {
      this.$set(this.labelData, this.labelData.length, `${i}:00`)
    }
    setTimeout(() => {
      this.createLeftEcharts()
      this.createRightEcharts()
    }, 1000)
  },
  methods: {
    // 左侧环形统计图
    createLeftEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['leftEcharts'])
      const option = {
        color: ['#FE4D4E', '#FF7F00', '#00b285'],
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.data.name} ${params.data.value}%`
          }
        },
        legend: {
          bottom: '-3%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '60%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: self.devStatus
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    },
    // 右侧柱状统计图
    createRightEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs['rightEcharts'])
      const option = {
        backgroundColor: '#f9f9f9',
        color: ['#FE4D4E', '#FF7F00', '#00b285'],
        grid: {
          left: '7%',
          right: '7%',
          bottom: '10%',
          top: '14%',
          containLabel: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            align: 'left'
          }
        },
        xAxis: [{
          type: 'category',
          data: self.labelData,
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#666',
              fontSize: 14
            },
            formatter: '{value}'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ccc'
            }
          }
        }],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '智能设备',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            stack: '搜索引擎',
            barWidth: 10,
            data: [320, 332, 301, 334, 390, 330, 320, 320, 332, 301, 334, 390, 320, 332, 301, 334, 390, 330, 320, 320, 332, 301, 334, 390, 390]
          },
          {
            name: '灯光照明',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            stack: '搜索引擎',
            barWidth: 10,
            data: [120, 332, 301, 334, 390, 330, 320, 320, 332, 301, 334, 390, 320, 332, 301, 334, 390, 330, 320, 320, 332, 301, 334, 390, 390]
          },
          {
            name: '机电设备',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            stack: '搜索引擎',
            barWidth: 10,
            data: [320, 332, 301, 334, 390, 330, 320, 320, 332, 301, 334, 390, 320, 332, 301, 334, 390, 330, 320, 320, 332, 301, 334, 390, 390]
          }
        ]
      }
      myChart.setOption(option, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content-body {
  .echart-box-left {
    width: 30%;
  }
  .echart-box-right {
    width: 70%;
  }
  .task-list {
    width: 60%;
    .task-list-item {
      margin: 22px 0;
      font-size: 14px;
      .list-tag {
        margin-right: 6px;
      }
      .list-footer {
        color: #999999;
        margin-top: 12px;
      }
      .list-title {
        width: 80%;
      }
    }
  }
}
</style>
