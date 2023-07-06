<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-460">
      <div class="item-content-header">
        <div class="title">最新告警</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-body flexBox align-item-center">
        <div class="echart-box">
          <div id="newAlarmEcharts" ref="newAlarmEcharts" style="height: 220px" />
        </div>
        <div class="task-list">
          <div v-for="(item, index) in newAlarmList" :key="index" class="task-list-item">
            <div class="list-main flexBox align-item-center">
              <div :style="{ color: setAlarmLevelColor(item.alarmTypeMain) }" class="list-tag">{{ setAlarmLevel(item.alarmTypeMain) }}</div>
              <el-tooltip class="item" effect="dark" :content="setDvr(item.dvrId) !== 'undefinedundefined' ? `${setDvr(item.dvrId)}${setChn(item.dvrId)}产生${setAlarmType(item.alarmType)}` : `产生${setAlarmType(item.alarmType)}`" placement="top-start">
                <div class="list-title overflow-text-a">
                  {{ setDvr(item.dvrId) }}{{ setChn(item.dvrId) }} 产生 {{ setAlarmType(item.alarmType) }}
                </div>
              </el-tooltip>

            </div>
            <div class="list-footer">
              {{ item.ipcIp }} {{ item.alarmTime }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
import { callbackDay, dateFormat } from '@/utils/utils'

export default {
  name: 'NewAlarm',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'videoNewAlarm',
      watchItemShow: null,
      dashboardType: 2,
      modelShow: '',
      devStatus: [
        { value: 0, name: '状态告警', color: '#FE4D4E', alarmTypeMainId: 1 },
        { value: 0, name: '事件告警', color: '#FF7F00', alarmTypeMainId: 2 },
        { value: 0, name: '运维告警', color: '#00b285', alarmTypeMainId: 3 }
      ],
      newAlarmEchartsObj: null,
      newAlarmList: [],
      alarmSubType: [],
      alarmLogCount: 0,
      chnList: [],
      dvrList: []
    }
  },
  computed: {
    setAlarmLevel() {
      const that = this
      return function(alarmTypeMain) {
        const idx = that.devStatus.findIndex(item => item.alarmTypeMainId === alarmTypeMain)
        if (idx !== -1) {
          return '[' + that.devStatus[idx].name + ']'
        }
      }
    },
    setDvr() {
      const that = this
      return function(dvrId) {
        const idx = that.dvrList.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return that.dvrList[idx].title
        }
      }
    },
    setAlarmLevelColor() {
      const that = this
      return function(alarmTypeMain) {
        const idx = that.devStatus.findIndex(item => item.alarmTypeMainId === alarmTypeMain)
        if (idx !== -1) {
          return that.devStatus[idx].color
        }
      }
    },
    setAlarmType() {
      const that = this
      return function(keyword) {
        const idx = that.alarmSubType.findIndex(item => Number(item.dictdataValue) === keyword)
        if (idx !== -1) {
          return that.alarmSubType[idx].dictdataName
        }
      }
    },
    setChn() {
      const that = this
      return function(dvrId) {
        const idx = that.chnList.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return that.chnList[idx].cname
        }
      }
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
    this.findSysCat()
    this.getChn()
    this.findVideoDvr()
    this.createEcharts()
    this.getVideoAlarmLogTypeStatic().then(res => {
      const that = this
      let alarmLogCount = 0
      res.forEach(resItem => {
        alarmLogCount += resItem.alarmCount
        const idx = that.devStatus.findIndex(item => item.alarmTypeMainId === resItem.alarmTypeMain)
        this.alarmLogCount = alarmLogCount
        if (idx !== -1) {
          that.$set(that.devStatus[idx], 'value', resItem.alarmCount)
        }
      })
      that.createEcharts()
    })
    this.findVideoAlarmLog()
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
    createEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['newAlarmEcharts'])
      const option = {
        color: ['#FE4D4E', '#FF7F00', '#00b285'],
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '32%',
              style: {
                fill: '#666666',
                text: ['告警事件'],
                font: '12px Arial Normal'
              }
            },
            {
              type: 'text',
              left: 'center', // 相对父元素居中
              top: '42%',
              style: {
                fill: '#0045AB',
                text: [`${self.alarmLogCount}`],
                font: '20px Arial Normal'
              }
            }
          ]
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '0%',
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
    async getVideoAlarmLogTypeStatic() {
      const date = new Date()
      const callbackDayList = callbackDay(30) // 倒推30天
      const sTime = `${callbackDayList[callbackDayList.length - 1]} 00:00:00`
      const eTime = `${dateFormat('YYYY-mm-dd HH:MM:SS', date)}`
      return await request({
        url: api.video.getVideoAlarmLogTypeStatic, data: { sTime, eTime }
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    },
    findVideoAlarmLog() {
      request({
        url: api.video.findVideoAlarmLog, data: {}
      }).then(res => {
        if (res.code === 1) {
          const alarmData = res.data.splice(0, 6)
          this.newAlarmList = alarmData
          console.log(this.newAlarmList)
        }
      })
    },
    findVideoDvr() {
      request({
        url: api.video.findVideoDvr, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.dvrList = res.data
        }
      })
    },
    findSysCat() {
      request({
        url: api.common.findSysDictionaryDetail, data: {
          dictCode: 'video_alarm_type',
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.alarmSubType = res.data
        }
      })
    },
    // 获取通道
    getChn() {
      request({
        url: api.video.findVideoChn, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.chnList = res.data
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
.item-content-body {
  .echart-box {
    width: 40%;
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
        width: 60%;
      }
    }
  }
}
</style>
