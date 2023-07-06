<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100 no-padding">
    <div class="box-item-content content-height-311">
      <div class="item-content-header">
        <div class="title">事件高发区</div>
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
        <div ref="highMarksBoxEcharts" class="echarts-boxs">
          <div id="highMarksEcharts" ref="highMarksEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
import { callbackDay, dateFormat, compareJson } from '@/utils/utils'

export default {
  name: 'EventHighMarks',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'eventHighMarks',
      watchItemShow: null,
      dashboardType: 2,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      echartsObject: null
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.echartsWidth = this.$refs.highMarksBoxEcharts.clientWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight
    this.getVideoAlarmLogAreaStatic().then(res => {
      const label = []
      const labelData = []
      res.forEach(item => {
        label.push(item.orgName)
        labelData.push(item.count)
      })
      this.echartsLabel = label
      this.echartsData = labelData
      this.createEcharts()
    })
  },
  methods: {
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('highMarksEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: ['#ff731b'],
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name} ${params[0].data}`
          }
        },
        grid: {
          top: '10%',
          left: '-5%',
          right: '0%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: that.echartsLabel,
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          }
        }],
        yAxis: [{
          type: 'value',
          show: false
        }],
        series: [
          {
            type: 'bar',
            barWidth: 10,
            data: that.echartsData
          }
        ]
      })
    },
    async getVideoAlarmLogAreaStatic() {
      const date = new Date()
      const callbackDayList = callbackDay(30) // 倒推30天
      const sTime = `${callbackDayList[callbackDayList.length - 1]} 00:00:00`
      const eTime = `${dateFormat('YYYY-mm-dd', date)} 23:59:59`
      return await request({
        url: api.video.getVideoAlarmLogAreaStatic, data: { sTime, eTime }
      }).then(res => {
        if (res.code === 1) {
          res.data.sort(compareJson('count'))
          return res.data.slice(0, 5) // 获取前5个区域
        }
      })
    },
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
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.echart-new-data-block {
  margin-top: 10px;
  margin-bottom: 10px;
  height: 14px;
}
</style>
