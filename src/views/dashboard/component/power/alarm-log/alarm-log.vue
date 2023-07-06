<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content ">
      <div class="item-content-header">
        <div class="title">告警日志</div>
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
        <div class="task-list">
          <div v-for="(item, index) in newAlarmList.slice(0,5)" :key="index" class="task-list-item">
            <div class="list-main flexBox align-item-center">
              <div :style="{ color: $tool.formatStr(item.hyLevel,'2:#FF7F00,3:#FE4D4E,4:#00B285,5:#82a026') }" class="list-tag">{{ setAlarmLevel(item.hyLevel) }}</div>
              <div class="list-title overflow-text-a">
                {{ item.hyAlarmDesc }}
              </div>
              <div class="list_rtime">
                {{ item.hyCtime }}
              </div>
            </div>
            <div class="list-footer">
              {{ $tool.matchData(deviceList,item,'hyDeviceId','hyAlias','hyDeviceId') }}
            </div>
          </div>
        </div>
        <div class="echart-box">
          <div id="newAlarmEcharts" ref="newAlarmEcharts" style="height: 220px" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'AlarmLog',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'powerAlarmLog',
      watchItemShow: null,
      dashboardType: 3,
      modelShow: '',
      devStatus: [
        { value: 0, name: '灾难的', color: '#FE4D4E', level: 1 },
        { value: 0, name: '严重的', color: '#FF7F00', level: 2 },
        { value: 0, name: '危险的', color: '#00B285', level: 3 },
        { value: 0, name: '一般的', color: '#268CF2', level: 4 },
        { value: 0, name: '普通的', color: '#88CEFD', level: 5 }
      ],
      level: [],
      newAlarmEchartsObj: null,
      newAlarmList: [

      ],
      alarmSubType: [],
      alarmLogCount: 0,
      chnList: [],
      deviceList: []
    }
  },
  computed: {
    setAlarmLevel() {
      const that = this
      return function(hyLevel) {
        const idx = that.level.findIndex(item => item.hyLevel === hyLevel)
        if (idx !== -1) {
          return '[' + that.level[idx].hyLevelName + ']'
        }
      }
    },
    setAlarmLevelColor() {
      const that = this
      return function(hyLevel) {
        const idx = that.devStatus.findIndex(item => item.level === hyLevel)
        if (idx !== -1) {
          console.log(hyLevel)
          return that.devStatus[idx].color
        }
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
    await this.hyitAlarmLevel()
    await this.showDHAlarmLogByAll().then(res => {
      this.devStatus = res['num'].map((it, index) => ({
        value: it.count,
        level: it.hyLevel,
        color: this.devStatus[index]['color'],
        name: this.setAlarmLevel(it.hyLevel)
      }))
      this.createEcharts()
    })
    await this.findHyitAlarmLog()
    await this.findHyitDevice()
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
    async findHyitDevice() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.deviceList = data
    },
    async showDHAlarmLogByAll() {
      let { code, map } = await request({ url: api.powerEnv.showDHAlarmLogByAll, data: {}})
      if (code !== 1) return
      return map
    },
    async findHyitAlarmLog() {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLog, data: { limit: 8 }})
      if (code !== 1) return
      this.newAlarmList = data
    },
    async hyitAlarmLevel() {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLevel, data: {}})
      if (code !== 1) return
      this.level = data
      return data
    },
    createEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['newAlarmEcharts'])
      const option = {
        color: ['#FE4D4E', '#FF7F00', '#00b285'],
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
        width: 40px;
        float: left;
      }
      .list-footer {
        color: #999999;
        margin-top: 10px;
      }
      .list-title {
        width: 60%;
        float: left;
      }
      .list_rtime {
        width: 40%;
        float: right;
        text-align: right;
      }
    }
  }
}
</style>
