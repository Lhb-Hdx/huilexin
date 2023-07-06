<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
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
          <div v-for="(item, index) in newAlarmList" :key="index" class="task-list-item pointer" @click="handleCheck(item)">
            <div class="list-main flexBox align-item-center">
              <div class="list-tag" :style="{ color: setAlarmLevelColor(item.alevel) }">[{{ setAlarmLevel(item.alevel) }}]</div>
              <el-tooltip class="item" effect="dark" :content=" item.hyMarkName !== undefined ? `${ item.hyMarkName }${item.description}` : `${item.description}`" placement="top-start">
                <div class="list-title overflow-text-a">{{ item.hyMarkName }}  {{ item.description }}</div>
              </el-tooltip>
            </div>
            <div class="list-footer">
              {{ item.ip }} {{ setFormatMsgTime(item.clock) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="故障详情" :visible.sync="drawer" width="80%" top="5vh">
      <FaultDetails v-if="drawer" :model="model" :level-data="alarmLevel" :login-user="loginUser" @emitFindAssetsAlarm="emitFindAssetsAlarm" />
    </el-dialog>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
import { compareJson, dateFormat } from '@/utils/utils'
import FaultDetails from '@/views/it-monitor/fault-manage/components/faultDetails'

export default {
  name: 'NewAlarm',
  components: {
    FaultDetails
  },
  props: {
    agentId: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'newAlarm',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      newAlarmEchartsObj: null,
      alarmLevel: [],
      newAlarmList: [],
      maxAlarmCount: 100,
      newAlarmCount: [],
      indicatorList: [],
      loading: false,
      drawer: false,
      model: {},
      levelData: [],
      loginUser: {}
    }
  },
  computed: {
    setAlarmLevel() {
      return function(level) {
        if (level === undefined) return
        const levelIdx = this.alarmLevel.findIndex(item => Number(item.dictdataValue) === Number(level) && item.dictdataValue !== '')
        if (levelIdx !== -1) {
          return this.alarmLevel[levelIdx].dictdataName
        }
      }
    },
    setAlarmLevelColor() {
      return function(level) {
        if (level === undefined) return
        const levelIdx = this.alarmLevel.findIndex(item => Number(item.dictdataValue) === Number(level) && item.dictdataValue !== '')
        if (levelIdx !== -1) {
          return this.alarmLevel[levelIdx].remark
        }
      }
    },
    setFormatMsgTime() {
      return function(t) {
        const date = new Date(t * 1000)
        return dateFormat('YYYY-mm-dd HH:MM:SS', date)
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
    setTimeout(() => {
      this.loading = true
      this.findSysDictionaryDetail()
      this.findZbxAlarmLog()
      this.showAlarmLogByAll().then(async res => {
        // 排序查出最大告警数量
        const data = res.sort(compareJson('count'))
        // 设置雷达图最大数
        this.maxAlarmCount = data[0].count
        const alarmLevel = await this.findAlarmLevel()
        alarmLevel.forEach(itemLevel => {
          const indicatorData = {}
          indicatorData.name = itemLevel.dictdataName
          indicatorData.max = this.maxAlarmCount
          res.forEach(itemCount => {
            if (Number(itemLevel.dictdataValue) === Number(itemCount.alevel)) {
              indicatorData.alevel = itemCount.alevel
              indicatorData.count = itemCount.count
            }
          })
          this.indicatorList.push(indicatorData)
        })
        // data.forEach(item => {
        //   this.$set(this.newAlarmCount, [Number(item.alevel)], item.count)
        // })
        this.indicatorList.forEach(item => {
          this.$set(this.newAlarmCount, this.newAlarmCount.length, item.count)
        })
        this.createEcharts()
      })
      setTimeout(() => {
        this.loading = false
      }, 500)
    })
  },
  methods: {
    async createEcharts() {
      const that = this
      this.newAlarmEchartsObj = echarts.init(document.getElementById('newAlarmEcharts'))
      // let i = -1
      this.newAlarmEchartsObj.setOption({
        color: '#87DEAF',
        radar: {
          indicator: this.indicatorList
          // name: {
          //   textStyle: {
          //   },
          //   // 只有一条数据时，可以使用该方法，显示单数据
          //   formatter: (a, b) => {
          //     i++
          //     return `${a}\n${that.newAlarmCount[i]}`
          //     // return `{a|${a}}\n{b|${arr1[i]}}`
          //   }
          // }
        },
        series: [{
          type: 'radar',
          lineStyle: {
            color: '#87DEAF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
              [
                { offset: 0, color: '#87DEAF' },
                { offset: 1, color: '#87DEAF' }
              ],
              false
            ),
            shadowColor: '#87DEAF',
            shadowBlur: 10
          },
          data: [
            {
              value: that.newAlarmCount,
              label: {
                show: true,
                formatter: function(params) {
                  return params.value
                }
              }
            }
          ]
        }]
      })
    },
    findZbxAlarmLog() {
      request({
        url: api.itMonitor.findZbxAlarmLog, data: { limit: 6, agents: this.agentId }
      }).then(async res => {
        if (res.code === 1) {
          const idm = []
          res.data.forEach(item => { idm.push(item.hostId) })
          // 查设备名称
          const getName = await this.findHyitHost(idm)
          if (getName.length > 0) {
            for (let i = 0; i < res.data.length; i++) {
              const rdata = res.data[i]
              for (let j = 0; j < getName.length; j++) {
                const gname = getName[j]
                if (Number(rdata.hostId) === Number(gname.hyHostId)) {
                  this.$set(res.data[i], 'hyMarkName', getName[j].hyMarkName)
                }
              }
            }
          }
          this.newAlarmList = res.data
        }
      })
    },
    // 获取告警级别
    async findAlarmLevel() {
      const { code, data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 查询设备名称
    async findHyitHost(idm) {
      const { code, data } = await request({
        url: api.itMonitor.findHyitHost,
        data: { ids: idm, page: 1, limit: 10, agents: this.agentId }
      })
      if (code !== 1) return
      return data
    },
    async showAlarmLogByAll() {
      if (this.agentId !== 'null') {
        return await request({
          url: api.automationOperations.showAlarmLogByAll, data: { agents: this.agentId }
        }).then(res => {
          if (res.code === 1) {
            return res.map.num
          }
        })
      } else {
        return await request({
          url: api.automationOperations.showAlarmLogByAll
        }).then(res => {
          if (res.code === 1) {
            return res.map.num
          }
        })
      }
    },
    findSysDictionaryDetail() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) this.alarmLevel = res.data
      })
    },
    // 更改显示配置
    changemodelDefine(val) {
      this.loginUser = this.localStorageOperation('get', 'userInfo')
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      }
    },
    // 查看告警弹窗
    async handleCheck(data) {
      this.sameFault = []
      this.drawer = true
      this.model = { ...data }
    },
    emitFindAssetsAlarm() {}
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
        width: 80%;
      }
    }
  }
}
</style>
