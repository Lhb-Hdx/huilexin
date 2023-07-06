<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-390">
      <div class="item-content-header">
        <div class="title">温湿度监控</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-tool flexBox align-item-center space-between">
        <div class="content-body-select">
          <el-select v-model="areaValue" placeholder="区域" size="mini" @change="change">
            <el-option
              v-for="item in areaArr"
              :key="item.hyAreaId"
              :label="item.hyAreaName"
              :value="item.hyAreaId"
            />
          </el-select>
          <el-select v-model="itemValue" v-loadmore="loadMore" :disabled=" areaValue===''" placeholder="监控点(地址)" size="mini" @change="devicechange">
            <el-option
              v-for="item in deviceArr"
              :key="item.hyDeviceId"
              :label="(item.hyAlias || '') + `(${item.hyAddr})`"
              :value="item.hyDeviceId"
            />
          </el-select>
          <el-date-picker
            v-model="today"
            :clearable="false"
            placeholder="选择日期"
            size="mini"
            style="width: 150px"
            type="date"
            value-format="yyyy-MM-dd"
            @change="changDate"
          />
        </div>
        <div class="content-body-btn">
          <el-button-group>
            <el-button v-for="item in valueBtns" :key="item.valueKey" :type="systemActiveSelectValue === item.valueKey ? 'primary' : 'default'" size="mini" @click="handleValue(item.valueKey)">
              {{ item.name }}</el-button>
          </el-button-group>
        </div>
      </div>
      <div ref="itemContentBody" class="item-content-body">
        <div ref="alarmBoxEcharts" class="echarts-boxs">
          <div v-if="echartsData.length" id="envEcharts" ref="envEcharts" :style="{width: '100%', height: echartsHeight + 'px'}" />
          <el-empty v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { dateFormat, hexToRgba } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import loadmore from '@/directive/el-select-loadmore/loadmore'

export default {
  name: 'EnvMonitor',
  components: {},
  directives: { loadmore },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'powerEnvMonitor',
      watchItemShow: null,
      dashboardType: 3,
      modelShow: '',
      echartsWidth: 0,
      echartsHeight: 0,
      echartsLabel: [],
      echartsData: [],
      alarmEchartObject: null,
      alarmEchartData: [],
      legend: ['温度', '湿度'],
      areaColor: ['#ff5224', '#04a97a'],
      systemActiveSelectValue: 2,
      valueBtns: [
        {
          name: '一小时',
          valueKey: 1
        },
        {
          name: '一天',
          valueKey: 2
        }
        // {
        //   name: '近三天',
        //   valueKey: 3
        // }
      ],
      areaValue: '',
      itemValue: '',
      areaArr: [],
      deviceArr: [],
      temperatureEcharts: {},
      today: '',
      loadmoreQuery: {
        page: 1,
        limit: 20,
        hyDevTypeValue: 1000
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  async mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    const date = new Date()
    this.today = dateFormat('YYYY-mm-dd', date)
    await this.getAreaArr()
    // await this.findHyitDevice()
    this.echartsWidth = this.$refs.alarmBoxEcharts.offsetWidth
    this.echartsHeight = this.$refs.itemContentBody.clientHeight - 56
    for (let i = 0; i < 25; i++) {
      this.$set(this.echartsLabel, this.echartsLabel.length, `${i}:00`)
    }
    // this.initEchartsData()
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
    changDate(date) {
      this.today = date
      this.handleValue(this.systemActiveSelectValue)
    },
    async getAreaArr() {
      let { code, data } = await request({ url: api.area.findHyitArea })
      if (code !== 1) return
      this.areaArr = data
      this.areaValue = data[0]['hyAreaId']
      this.findHyitDevice()
      this.echartsData.map(it => {
        return { ...it, data: it.data.fill(0) }
      })
      this.initEchartsData()
    },
    loadMore() {
      this.loadmoreQuery.page += 1
      this.findHyitDevice()
    },
    change() {
      this.deviceArr = []
      this.findHyitDevice()
      this.itemValue = ''
    },
    async findHyitDevice() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { hyOrgId: this.areaValue, ...this.loadmoreQuery }})
      if (code !== 1) return
      this.deviceArr.push(...data)
      this.itemValue = data[0]?.hyDeviceId || ''
      this.handleValue(2)
    },
    handleValue(e) {
      this.systemActiveSelectValue = e
      if (!this.itemValue) {
        this.$message.error('请选择设备')
        return
      }
      this.devicechange()
    },
    initEchartsData() {
      for (let i = 0; i < this.alarmEchartData.length; i++) {
        this.$set(this.echartsData, this.echartsData.length, {
          name: this.alarmEchartData[i]['name'],
          type: 'line',
          smooth: true,
          symbolSize: 0,
          lineStyle: {
            normal: {
              color: this.areaColor[i],
              shadowBlur: 3,
              shadowColor: hexToRgba(this.areaColor[i], 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
                [
                  { offset: 0, color: hexToRgba(this.areaColor[i], 0.3) },
                  { offset: 1, color: hexToRgba(this.areaColor[i], 0) }
                ],
                false
              ),
              shadowColor: hexToRgba(this.areaColor[i], 0.8),
              shadowBlur: 10
            }
          },
          data: this.alarmEchartData[i]['data']
        })
      }
      const that = this
      setTimeout(function() {
        if (that.echartsData.length > 0) that.createEcharts()
      }, 1000)
    },
    async devicechange() {
      const hyDeviceId = this.deviceArr.find(it => it.hyDeviceId === this.itemValue)

      if (!hyDeviceId) return
      this.alarmEchartData = []
      const _this = this
      let temperature = []

      _this.findHyitDeviceValue(hyDeviceId.hyDeviceId).then(hyitDeviceValueList => {
        for (let i = hyitDeviceValueList.length - 1; i >= 0; i--) {
          let it = hyitDeviceValueList[i]
          if (it.hyDes.indexOf('温度') !== -1) {
            temperature.push({ hyVid: it.hyVid, hyDes: it.hyDes, hyType: it.hyType })
            break
          }
        }
        for (let i = hyitDeviceValueList.length - 1; i >= 0; i--) {
          let it = hyitDeviceValueList[i]
          if (it.hyDes.indexOf('湿度') !== -1) {
            temperature.push({ hyVid: it.hyVid, hyDes: it.hyDes, hyType: it.hyType })
            break
          }
        }

        this.aaa(temperature)
      })
    },
    aaa(temperature) {
      const that = this
      let a = []
      this.alarmEchartData = []
      this.echartsData = []
      this.legend = []
      this.legend = temperature.map(it => it.hyDes)
      const time = dateFormat('YYYY-mm-dd', new Date(this.today))

      if (this.systemActiveSelectValue === 1)a = temperature.map(it => this.findHyitDeviceValueLog(it.hyVid, it.hyType, time))
      if (this.systemActiveSelectValue === 2)a = temperature.map(it => this.findHyitDeviceValueLog(it.hyVid, it.hyType))
      if (this.systemActiveSelectValue === 3)a = temperature.map(it => this.showTimeDeviceValueLog(it.hyVid))
      console.log(this.today)
      Promise.all(a).then(res => {
        // this.echartsLabel = this.systemActiveSelectValue === 1 ? Array.from({ length: 60 }, (x, i) => i) : this.systemActiveSelectValue === 2 ? Array.from({ length: 24 }, (x, i) => this.$tool.zero(i) + ':00') : 24
        // let tempData = Array(this.systemActiveSelectValue === 1 ? 60 : this.systemActiveSelectValue === 2 ? 24 : 24).fill(0)
        console.log('res', res)
        const data = []
        for (const it of res) {
          data.push(...it)
        }
        for (let i = 0; i < data.length; i++) {
          const item = data[i]
          for (let j = i + 1; j < data.length; j++) {
            const it = data[j]
            if (item['hyCtime'] === it['hyCtime']) {
              data.splice(i, 1)
            }
          }
        }
        data.sort((a, b) => +new Date(a['hyCtime']) - +new Date(b['hyCtime']))
        const tempData = data
        this.echartsLabel = data.map(it => it['hyCtime'].replace(/[\d-]+\s/, ''))
        this.alarmEchartData = res.map((it, ind) => {
          return {
            name: temperature[ind]['hyDes'],
            data: this.$tool.setRingHistoryChart(it, tempData, 'average', that.today)
          }
        })
        let count = 0
        res.forEach(it => {
          if (!it.length)count += 1
        })
        if (count === res.length) {
          this.alarmEchartData = [{
            name: '',
            data: this.$tool.setRingHistoryChart([], tempData, 'average', that.today)
          }]
        }
        this.$nextTick(() => {
          this.initEchartsData()
        })
      })
    },
    async showHourDeviceValueLog(vid) {
      const time = dateFormat('YYYY-mm-dd', new Date(this.today))
      const house = new Date().getHours()
      let { code, map } = await request({ url: api.powerEnv.showHourDeviceValueLog,
        data: { limit: -1, vid, stime: `${time} ${house}:00:00`, etime: `${time} ${house}:59:59` }})
      if (code !== 1) return
      return map
    },
    async showTimeDeviceValueLog(vid) {
      const stime = dateFormat('YYYY-mm-dd HH:MM:SS', new Date())
      const etime = dateFormat('YYYY-mm-dd HH:MM:SS', new Date(new Date().getTime() - (72 * 60 * 60 * 1000)))
      let { code, map } = await request({ url: api.powerEnv.showTimeDeviceValueLog,
        data: { limit: -1, vid, stime, etime }})
      if (code !== 1) return
      return map
    },
    // 关联表
    async findHyitDeviceMap(deviceId) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceMap,
        data: { limit: -1, hyDeviceId: deviceId }})
      if (code !== 1) return
      // this.hyitDeviceMap = data
      return data
    },
    async findHyitDeviceValueLog(hyVid, hyType, time) {
      const house = new Date().getHours()
      const stime = this.systemActiveSelectValue === 2 ? '' : `${time} ${house}:00:00`
      const etime = this.systemActiveSelectValue === 2 ? '' : `${time} ${house}:59:59`
      let { code, data } = await request({
        url: api.powerEnv.showDayDeviceValueLog,
        data: { time: this.systemActiveSelectValue === 1 ? '' : this.today, hyVid, hyType, stime, etime }
      })
      if (code !== 1) return
      return data
    },
    // 获取设备值
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }})
      if (code !== 1) return
      return data
    },
    createEcharts() {
      const that = this
      this.alarmEchartObject = echarts.init(document.getElementById('envEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: this.areaColor,
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
          data: that.legend,
          icon: 'rect'
        },
        grid: {
          top: '10%',
          left: '2%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'inside',
            show: true,
            height: 30,
            startValue: that.echartsLabel.length - 10,
            endValue: that.echartsLabel.length
          }],
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
          data: that.echartsLabel
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
        series: that.echartsData
      })
    },
    async showDayAlarmLogByHour() {
      const date = new Date()
      const time = `${dateFormat('YYYY-mm-dd', date)}`
      // const time = '2021-3-19'
      return await request({
        url: api.automationOperations.showDayAlarmLogByHour, data: { time }
      }).then(res => {
        if (res.code === 1) {
          return res.map.timeList
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.item-content-tool {
  margin: 14px 0;
}
</style>
