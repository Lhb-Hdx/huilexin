<template>
  <div class="margin-15">
    <div v-permission="['SearchEvent']" class="filter-container">
      <el-input v-model="findQuery.keyword" placeholder="故障关键字" clearable style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="sameType" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in alarmType" :key="item.id" :label="item.value" :value="item.id" />
      </el-select>
      <el-select v-model="findQuery.status" style="width: 200px;" class="filter-item" placeholder="请选择状态">
        <el-option v-for="item in stateCatData" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
      <el-date-picker
        v-model="startCLock"
        class="filter-item"
        type="datetime"
        placeholder="开始时间"
        value-format="timestamp"
        @change="changeClock('startCLock')"
      />
      <el-date-picker
        v-model="endClock"
        class="filter-item"
        type="datetime"
        placeholder="结束时间"
        value-format="timestamp"
        @change="changeClock('endClock')"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-tag
        v-for="item in levelData"
        :key="item.label"
        class="filter-item"
        :color="item.color"
        effect="dark"
        @click="handleClick(item)"
      >
        {{ item.name }}
      </el-tag>
    </div>

    <div class="fault-echarts">
      <div ref="columnar" class="columnar" style="height: 240px; margin-bottom:20px" />
    </div>

    <div class="event-list">
      <div v-for="item in alarmLog" :key="item.id" class="event-list-item" :style="{ 'border-left': '4px solid ' + setLevelTagColor(item.alevel) }">
        <div class="introduce">
          <!-- <div class="title overflow-text-a">
            <i class="el-icon-warning" style="font-size: 24px;margin-right:10px;" :style="{ color: setLevelTagColor(item.alevel) }" />
            <span>{{ item.description }}</span>
          </div>
          <div class="subtitle overflow-text-a">
            <span>{{ item.description }}</span>
          </div> -->
          <div class="data-title">{{ item.description }}</div>
          <div class="data-fault">
            <div class="fault-state">故障状态：</div>
            <div class="fault-result" :style="{ color: setAlarmStatusColor(item.status) }">{{ setAlarmStatus(item.status) }}</div>
          </div>
          <div class="data-time">{{ item.ctime }}</div>
          <div class="data-state">告警详情: <span>{{ item.description }}</span></div>
          <div class="data-state">影响范围：<span>{{ item.coverage }}</span></div>
          <div class="data-state">原因说明：<span>{{ item.causeDescription }}</span></div>
          <div class="data-state">处理进度：<span>{{ item.progress }}</span></div>
        </div>
      </div>
    </div>
    <pagination v-show="alarmLogTotal > 0" :auto-scroll="false" :total="alarmLogTotal" :page.sync="findQuery.page" :limit.sync="findQuery.limit" @pagination="findZbxAlarmLog" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import * as echarts from 'echarts'
import { callbackDay } from '@/utils/utils'

export default {
  name: 'DetailEvent',
  components: {
    Pagination
  },
  props: {
    hostInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      alarmLogTotal: 0,
      loading: false,
      // 事件查询参数
      findQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        level: '',
        status: ''
      },
      sameType: '',
      // sdwan事件查询参数
      agentGetSdwanEventQuery: {
        agent: '',
        hostid: '',
        eventSeverity: '',
        page: 1,
        limit: 10
      },
      alarmType: [
        { id: 0, value: '全部告警'},
        { id: 1, value: '相同告警'}
      ],
      stateCatData: [
        { label: '全部状态', id: '' },
        { label: '待处理', id: 0 },
        { label: '已处理', id: 1},
        { label: '自动恢复', id: 3 },
        { label: '处理中', id: 4 }
      ],
      sameTypeData: '',
      alarmLog: [],
      levelData: [],
      startCLock: null,
      endClock: null,
      zbxAlarmLogStaticticsData: [],
      catData: {},
      levelCatData: {},
      levelColorData: {},
      colorData: [],
      callbackDays: [],
      agentsIds: '',
      stateData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '自动恢复', value: 3, color: 'grey' },
        { label: '处理中', value: 4, color: 'grey' }
      ],
      toGetEchartData: false
    }
  },
  computed: {
    setLevelTagColor() {
      const that = this
      return function(level) {
        const levelIdx = that.levelData.findIndex(item => Number(item.level) === Number(level))
        if (levelIdx !== -1) {
          return that.levelData[levelIdx].color
        }
      }
    },
    setLevelTagName() {
      const that = this
      return function(level) {
        const levelIdx = that.levelData.findIndex(item => Number(item.level) === Number(level))
        if (levelIdx !== -1) {
          return that.levelData[levelIdx].name
        }
      }
    },
    setAlarmStatusColor() {
      return function(level) {
        const idx = this.stateData.findIndex(item => +item.value === +level)
        if (idx !== -1) {
          return this.stateData[idx].color
        }
      }
    },
    setAlarmStatus() {
      return function(level) {
        const idx = this.stateData.findIndex(item => +item.value === +level)
        if (idx !== -1) {
          return this.stateData[idx].label
        }
      }
    },
    // 获取zabbix主机id
    devTypeId() {
      return this.$route.query.devTypeId
    },
    id() {
      return this.$route.query.id
    },
    sClock() {
      return this.$route.query.startCLock
    },
    eClock() {
      return this.$route.query.endClock
    }
  },
  mounted() {
    if (this.$route.query.sameType) { this.sameType = this.$route.query.sameType }
    if (this.$route.query.keyword) { this.findQuery.keyword = this.$route.query.keyword }
    // if (this.$route.query.status) { this.findQuery.status = this.$route.query.status }
    if (this.sClock) { this.startCLock = this.sClock * 1000 }
    if (this.eClock) { this.endClock = this.eClock * 1000 }
    this.callbackDays = callbackDay(15).reverse()
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.loadAlarmLevel()
    if (this.devTypeId === 490) {
      this.agentGetSdwanEventQuery.agent = this.hostInfo.agent
      this.agentGetSdwanEventQuery.hostid = this.hostInfo.hyZhostId
      const sTime = `${this.$tool.dateFormat('Y-m-d', new Date())} 00:00:00`
      const eTime = `${this.$tool.dateFormat('Y-m-d', new Date())} 23:59:59`
      this.startCLock = new Date(sTime).getTime()
      this.endClock = new Date(eTime).getTime()
      this.agentGetSdwanEvent()
    } else {
      this.findZbxAlarmLog()
    }
  },
  methods: {
    handleFilter() {
      this.callbackDays = this.$tool.getdiffdate(this.$tool.dateFormat('YYYY-mm-dd', new Date(this.startCLock)), this.$tool.dateFormat('YYYY-mm-dd', new Date(this.endClock)))
      if (this.toGetEchartData) this.getZbxAlarmLogStatictics()
      if (this.devTypeId === 490) {
        this.agentGetSdwanEventQuery.page = 1
        this.agentGetSdwanEvent()
      } else {
        this.findQuery.page = 1
        this.findZbxAlarmLog()
      }
    },
    handleClick(item) {
      if (this.devTypeId === 490) {
        this.$set(this.agentGetSdwanEventQuery, 'eventSeverity', item.level)
        this.agentGetSdwanEvent()
      } else {
        this.$set(this.findQuery, 'level', item.level)
        this.findZbxAlarmLog()
      }
    },
    // 获取事件日志
    findZbxAlarmLog() {
      if (+this.sameType === 1) {
        request({ url: api.itMonitor.findZbxAlarmLog, data: { sameType: this.sameType, startCLock: this.startCLock ? this.startCLock / 1000 : '', endClock: this.endClock ? this.endClock / 1000 : '', ...this.findQuery, hostid: this.hostInfo.hyHostId ? this.hostInfo.hyHostId : this.id }}).then(res => {
          if (res.code === 1) {
            this.alarmLog = res.data
            console.log(this.alarmLog)
            this.alarmLogTotal = Number(res.count)
          }
        })
      } else {
        request({ url: api.itMonitor.findZbxAlarmLog, data: { startCLock: this.startCLock ? this.startCLock / 1000 : '', endClock: this.endClock ? this.endClock / 1000 : '', ...this.findQuery, hostid: this.hostInfo.hyHostId ? this.hostInfo.hyHostId : this.id }}).then(res => {
          if (res.code === 1) {
            this.alarmLog = res.data
            console.log(this.alarmLog)

            this.alarmLogTotal = Number(res.count)
          }
        })
      }
    },
    // 故障等级
    loadAlarmLevel() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.levelData.push({ name: '全部', color: '#409eff', level: '' })
          res.data.forEach(item => {
            this.catData[item.catId] = item.dictdataName
            this.levelCatData[item.catId] = item.dictdataValue
            this.levelColorData[item.catId] = item.remark

            this.levelData.push({ name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })

            this.colorData.push(item.remark)
            const f_data = []
            this.callbackDays.forEach(item2 => {
              f_data.push({ date: item2, value: 0 })
            })
            this.$nextTick(() => {
              this.zbxAlarmLogStaticticsData.push({ dictdataValue: item.dictdataValue, name: item.dictdataName, type: 'bar', stack: '总量', barWidth: '20px', fdata: f_data, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
            })
          })

          this.$nextTick(() => {
            this.getZbxAlarmLogStatictics()
          })
        }
      })
    },
    // sdwan事件日志
    agentGetSdwanEvent() {
      const data = { ...this.agentGetSdwanEventQuery }
      data.startCLock = this.startCLock / 1000
      data.endClock = this.endClock / 1000
      request({ url: api.itMonitor.agentGetSdwanEvent, data }).then(res => {
        if (res.code === 1 && res.model) {
          const getResData = JSON.parse(res.model)
          const alarmData = []
          getResData.data.forEach(item => {
            alarmData.push({
              description: item.eventDescription,
              ctime: this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(item.eventTime * 1000)),
              alevel: item.eventSeverity
            })
          })
          this.alarmLog = alarmData
          this.alarmLogTotal = Number(getResData.count)
        }
      })
    },
    // 按照从今天开始往前15天请求告警日志
    getZbxAlarmLogStatictics() {
      const json = []
      this.callbackDays.forEach(item => {
        json.push({
          startClock: Number(new Date(`${item} 00:00:00`).valueOf() / 1000),
          endClock: Number(new Date(`${item} 23:59:59`).valueOf() / 1000)
        })
      })
      request({
        url: api.itMonitor.getZbxAlarmLogStatictics, data: { agents: this.agentsIds, json: JSON.stringify(json), hyHostId: this.id }
      }).then(res => {
        if (res.code === 1 && res.data) {
          this.zbxAlarmLogStaticticsData.forEach((sitem, skey) => {
            res.data.forEach(dItem => {
              if (dItem[`level${sitem.dictdataValue}Count`] !== undefined) {
                const fdata = this.zbxAlarmLogStaticticsData[skey].fdata
                const dateIdx = fdata.findIndex(item => {
                  return new Date(item.date).getTime() === new Date(dItem.date).getTime()
                })

                this.$nextTick(() => {
                  if (dateIdx !== -1) {
                    this.zbxAlarmLogStaticticsData[skey].fdata[dateIdx].value = dItem[`level${sitem.dictdataValue}Count`]
                    this.$set(this.zbxAlarmLogStaticticsData[skey].data, dateIdx, dItem[`level${sitem.dictdataValue}Count`])
                  }
                })
              }
            })
          })
        }
        this.$nextTick(() => {
          this.initmyChart()
        })
        console.log(this.zbxAlarmLogStaticticsData)
      })
    },
    // 初始化echart
    initmyChart: function() {
      const self = this
      const myChart = echarts.init(self.$refs['columnar'])
      myChart.getZr().off('click') // 不加上这个点击事件会出现点击事件出现多次
      const option = {
        backgroundColor: '#f9f9f9',
        color: this.colorData,
        legend: {
          data: this.levelData,
          right: 'center',
          top: '2%',
          textStyle: {
            color: '#666F'
          }
        },
        grid: {
          left: '0%',
          right: '0%',
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
          data: this.callbackDays,
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
          },
          splitLine: { // 网格线
            show: true,
            lineStyle: {
              color: 'rgba(181,181,181,0.2)'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ccc'
            }
          },
          axisLabel: {
            show: false,
            textStyle: {
              color: '#666',
              fontSize: 14
            }
          },
          splitLine: { // 网格线
            show: true,
            lineStyle: {
              color: 'rgba(181,181,181,0.2)'
            }
          }
        }],
        series: this.zbxAlarmLogStaticticsData
      }
      myChart.setOption(option, true)
      myChart.getZr().on('click', (params) => {
        const pointInPixel = [params.offsetX, params.offsetY]
        if (myChart.containPixel('grid', pointInPixel)) {
          let xIndex = myChart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0]
          const echartsClickStartTime = new Date(`${self.callbackDays[xIndex]} 00:00:00`).getTime()
          const echartsClickEndTime = new Date(`${self.callbackDays[xIndex]} 23:59:59`).getTime()
          // this.$set(this.findQuery, 'startCLock', echartsClickStartTime)
          // this.$set(this.findQuery, 'endClock', echartsClickEndTime)
          this.startCLock = echartsClickStartTime
          this.endClock = echartsClickEndTime
          // this.$set(this.findQuery, 'agentGetSdwanEventQuery', echartsClickStartTime)
          // this.$set(this.findQuery, 'agentGetSdwanEventQuery', echartsClickEndTime)
          this.handleFilter()
        }
      })
      self.resizeWin = window.addEventListener('resize', () => {
        myChart.resize()
      })
    },
    changeClock(attr) {
      if (this.startCLock && this.endClock) {
        const calculateDiffTime = this.$tool.calculateDiffTime(this.startCLock, this.endClock)
        if (calculateDiffTime.month > 3 && (calculateDiffTime.day > 0 || calculateDiffTime.hour > 0 || calculateDiffTime.minute > 0 || calculateDiffTime.second > 0)) {
          this.$message('柱状图最多只能查询3个月的告警数据')
          this.toGetEchartData = false
        } else {
          this.toGetEchartData = true
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.event-list-item {
  display: flex;
  justify-content: space-around;
  text-align: center;
  height: 200px;
  // padding: 10px;
  background-color: #f2f2f2;
  margin-bottom: 10px;
  position: relative;
  .introduce {
    flex: 2;
    text-align: left;
    overflow: hidden;
    padding: 10px 10px;
    .title {
      padding-left: 10px;
      display: flex;
      line-height: 24px;
      color: #0145ab;
    }
    .subtitle {
      padding-left: 44px;
      color: #606066;
    }
    div {
      margin: 10px 5px;
    }
    .data-title {
      font-size: 17px;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .data-fault {
      display: flex;
      float: right;
      margin-top: -8px;
      div {
        font-size: 14px;
        font-weight: bold;
        color: rgb(150,150,150);
      }
    }
    .data-time {
      font-size: 14px;
      color:rgb(150,150,150);
    }
    .data-state {
      font-size: 15px;
      font-weight: bold;
      span {
        margin-left: 10px;
        font-weight: 400;
      }
    }
  }
  .time {
    flex: 1;
    line-height: 40px;
  }
  .status {
    flex: 1;
    line-height: 40px;
  }
  /* &::before {
    content: "";
    display: inline-block;
    position: absolute;
    left: 0;
    width: 5px;
    height: 100%;
    top: 0px;
    background-color: red;
  } */
}
</style>
