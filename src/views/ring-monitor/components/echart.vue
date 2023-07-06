<template>
  <div style="position: relative;">
    <template>
      <el-row v-if="list.res.length">
        <el-col v-for="(item,index) in series.infos" :key="index" :span="6" class="mb-10 echart-col" style="text-align: center">
          <el-row><span style="font-size:18px;font-weight:bold">{{ item['val'] || 0 }} {{ item['hyUnits'] }}</span></el-row>
          <el-row><p class="mt-4" style="font-size:12px;font-weight: lighter;">{{ item['hyDes'] }}</p></el-row>
        </el-col>
      </el-row>
    </template>

    <div v-if="list.res.length" class="flex mb-6" style="flex-direction: row-reverse">
      <el-date-picker
        v-model="today"
        :clearable="false"
        class="ml-6"
        format="yyyy 年 MM 月 dd 日"
        placeholder="选择日期"
        type="date"
        value-format="yyyy-MM-dd"
        @change="changDate"
      />
      <el-button-group>
        <el-button v-for="(item,index) in btns" :key="index" :type="index===btnType?'primary':''" @click="changTime(item)">{{ item.title }}</el-button>
      </el-button-group>
    </div>
    <div ref="columnar" class="columnar" style="height: 350px;position:relative">
      <el-empty style="margin:auto;padding:10px 0;left:0;top:0;right:0;position: absolute;" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { dateFormat, hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  props: {
    list: {
      type: Object,
      default: () => {}
    },
    type: {
      type: [String, Number],
      default: 1
    }
  },
  data() {
    return {
      // info: {}
      today: '',
      btnType: 1,
      series: {
        infos: [],
        times: [],
        series: []
      },
      btns: [
        { title: '一小时', type: 0 },
        { title: '一天', type: 1 }
        // { title: '近三天', type: 2 }
      ],
      colors: ['#f9e459', '#00DDFF', '#f52443', '#FF0087', '#37A2FF', '#FFBF00', '#dffff5', '#ffbc9b', '#7ecdb6',
        '#c76079', '#623131', '#95a5a6', '#ff9c6e', '#87e8de', '#f759ab', '#391085', '#d9480f', '#7cb342', '#eeff41', '#dd2c00', '#bcaaa4', '#9fa0d7',
        '#42929e', '#b8e986', '#bd10e0', '#d0021b', '#fd5469', '#12141e', '#d08302', '#f37c40', '#546249', '#eabe53', '#a093a5', '#391a50', '#e5eae2'
      ]
    }
  },
  mounted() {
    this.today = this.$tool.dateFormat('YYYY-mm-dd', new Date())
    this.$nextTick(() => {
      this.$nextTick(() => {
        this.init(this.list.hyitDeviceIds, this.list.hyitDevice, this.list.hyitValueType, this.list.dhMenuItem, this.list.res)
      })
    })
  },
  methods: {
    changDate(date) {
      this.today = date
      this.init(this.list.hyitDeviceIds, this.list.hyitDevice, this.list.hyitValueType, this.list.dhMenuItem, this.list.res)
    },
    changTime(item) {
      this.btnType = item.type
      this.init(this.list.hyitDeviceIds, this.list.hyitDevice, this.list.hyitValueType, this.list.dhMenuItem, this.list.res)
    },
    async showHourDeviceValueLog(vid) {
      const house = new Date().getHours()
      let { code, map } = await request({ url: api.powerEnv.showHourDeviceValueLog,
        data: { limit: -1, vid, stime: `${this.today} ${house}:00:00`, etime: `${this.today} ${house}:59:59` }})
      if (code !== 1) return
      return map
    },
    async showTimeDeviceValueLog(vid) {
      const etime = dateFormat('YYYY-mm-dd', new Date()) + ' 00:00:00'
      const stime = dateFormat('YYYY-mm-dd', new Date(new Date().getTime() - (72 * 60 * 60 * 1000))) + ' 00:00:00'
      let { code, map } = await request({ url: api.powerEnv.showTimeDeviceValueLog,
        data: { limit: -1, vid, stime, etime }})
      if (code !== 1) return
      return map
    },
    async findHyitDeviceValueAlarmRule(vid) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValueAlarmRule,
        data: { vid }
      })
      if (code !== 1) return
      return data
    },
    async findHyitDeviceValueLog(hyVid, hyType, time) {
      console.log(time)
      const house = new Date().getHours()
      const stime = this.btnType === 0 ? `${time} ${house}:00:00` : ''
      const etime = this.btnType === 0 ? `${time} ${house}:59:59` : ''
      let { code, data } = await request({
        url: api.powerEnv.showDayDeviceValueLog,
        data: { time: this.btnType === 0 ? '' : this.today, hyVid, hyType, stime, etime }
      })
      if (code !== 1) return
      return data
    },
    init(hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res) {
      if (!res.length) return

      const time = dateFormat('YYYY-mm-dd', new Date(this.today))
      console.log(hyitDeviceIds)

      Promise.all(
        hyitDevice.map(it => this.btnType === 0 ? this.findHyitDeviceValueLog(it.hyVid, it.hyType, time) : this.btnType === 1 ? this.findHyitDeviceValueLog(it.hyVid, it.hyType) : this.btnType === 2 ? this.showTimeDeviceValueLog(it.hyVid) : '')
      ).then(res => {
        let obj = {
          infos: [],
          times: [],
          series: []
        }
        // const tempData = Array(this.btnType === 0 ? 60 : this.btnType === 1 ? 24 : 24).fill(0, 0)
        // obj.times = this.btnType === 0 ? Array.from({ length: 60 }, (x, i) => i)
        //   : this.btnType === 1 ? Array.from({ length: 24 }, (x, i) => zero(i) + ':00')
        //     : Array.from({ length: 24 }, (x, i) => i)
        obj.times = []
        for (const it of res) {
          obj.times.push(...it)
        }
        for (let i = 0; i < obj.times.length; i++) {
          const item = obj.times[i]
          for (let j = i + 1; j < obj.times.length; j++) {
            const it = obj.times[j]
            if (item['hyCtime'] === it['hyCtime']) {
              obj.times.splice(i, 1)
            }
          }
        }
        obj.times.sort((a, b) => {
          return new Date(a['hyCtime']) - new Date(b['hyCtime'])
        })
        const tempData = obj.times
        obj.times = obj.times.map(it => it['hyCtime'].replace(/[\d-]+\s/, ''))
        console.log(obj.times)

        res.forEach((it, index) => {
          obj.series.push({
            name: hyitDeviceIds[index]['hyVname'] || hyitDeviceIds[index]['hyDes'],
            type: 'line',
            smooth: true,
            symbolSize: 0,
            lineStyle: {
              normal: {
                color: this.colors[index],
                shadowBlur: 3,
                shadowColor: hexToRgba(this.colors[index], 0.5),
                shadowOffsetY: 8
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    { offset: 0, color: hexToRgba(this.colors[index], 0.3) },
                    { offset: 1, color: hexToRgba(this.colors[index], 0) }
                  ],
                  false
                ),
                shadowColor: hexToRgba(this.colors[index], 0.8),
                shadowBlur: 10
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: this.$tool.setRingHistoryChart(it || [], tempData, 'average', this.today)
          })
        })
        for (let i = 0; i < hyitValueType.length; i++) {
          const hyitValueTypeEle = hyitValueType[i]
          for (let j = 0; j < hyitDevice.length; j++) {
            const hyitDeviceEle = hyitDevice[j]
            if (hyitDeviceEle['hyType'] === hyitValueTypeEle['hyTypeId']) {
              let str = this.$tool.humpStr(hyitValueTypeEle['hyFieldName'])
              obj.infos.push({
                hyDes: hyitDeviceEle['hyVname'] || hyitDeviceEle['hyDes'],
                val: hyitDeviceEle[str],
                hyUnits: hyitDeviceEle['hyUnits'],
                hyId: hyitDeviceEle['hyId'],
                hyVid: hyitDeviceEle['hyVid']
              })
            }
          }
        }
        obj.infos.forEach((it, index) => {
          this.findHyitDeviceValueMappings(it.hyVid).then(res => {
            let idx = res.find(resIt => resIt.hyVal === it.val)
            if (idx) obj.infos[index]['val'] = idx['hyValName']
          })
        })
        this.series = obj
        this.initChart(obj)
      })
    },
    async findHyitDeviceValueMappings(vid) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid }})
      if (code === 1) return data
    },
    initChart(obj) {
      this.chart = echarts.init(this.$refs['columnar'], 'light')

      this.chart.setOption({
        color: this.colors,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          // data: this.legendData
        },
        dataZoom: [
          {
            type: 'inside',
            show: true,
            height: 30,
            startValue: this.series.times.length - 10,
            endValue: this.series.times.length
          }],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10',
          containLabel: true
        },
        xAxis: [{
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
          },
          data: obj['times']
        }],
        yAxis: [{
          type: 'value',
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
        series: obj['series']
      })
    }

  }
}
</script>

<style>
.echart-col{
  height: 38px;
}
</style>
