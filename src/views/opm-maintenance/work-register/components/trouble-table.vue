<template>
  <div class="matter-table">
    <el-table v-loading="loading" :data="tableData">
      <el-table-column label="编号" type="index" width="auto" min-width="5%" />
      <el-table-column prop="description" show-overflow-tooltip min-width="20%" label="故障名称" />
      <el-table-column prop="hyMarkName" label="设备名称" min-width="20%" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="auto" min-width="15%" show-overflow-tooltip />
      <el-table-column label="故障时间" width="auto" min-width="20%" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span>{{ setFormatMsgTime(row.clock) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" min-width="10%" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span :style="{ color: setAlarmStatusColor(row.status) }">{{ setAlarmStatus(row.status) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="tableCount > 0" :auto-scroll="false" :total.sync="tableCount" :page.sync="alarmLogQuery.page" :limit.sync="alarmLogQuery.limit" @pagination="findZbxAlarmLog" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'MatterTable',
  components: {
    Pagination
  },

  props: {
    // startCLock: {
    //   type: String,
    //   default: ''
    // }
  },

  data() {
    return {
      taskStatue: [
        { statue: 1, value: '处理中', color: 'warning', colorCode: '#E6A23C' },
        { statue: 2, value: '处理失败', color: 'danger', colorCode: '#F56C6C' },
        { statue: 3, value: '处理成功', color: 'success', colorCode: '#67C23A' }
      ],
      listQuery: {
        page: 1,
        limit: 10
      },
      alarmLogQuery: {
        userId: this.$auth.getUserSession().userId,
        page: 1,
        limit: 10,
        keyword: '',
        ctime: '',
        level: '',
        levels: '',
        status: '',
        startCLock: '',
        endClock: '',
        sameType: 0
      },
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '自动恢复', value: 3, color: 'grey' },
        { label: '处理中', value: 4, color: 'grey' }
      ],
      loading: false,
      tableData: [],
      tableCount: 0,
      agentsIds: ''
    }
  },
  computed: {
    setTaskStatue() {
      return function(status) {
        const idx = this.taskStatue.findIndex(item => item.statue === status)
        if (idx !== -1) {
          return this.taskStatue[idx].value
        } else {
          return '未处理'
        }
      }
    },
    setAlarmStatusColor() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].color
        }
      }
    },
    setFormatMsgTime() {
      return function(t) {
        const date = new Date(t * 1000)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds() > 10 ? date.getSeconds() : '0' + date.getSeconds()}`
      }
    },
    setAlarmStatus() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].label
        }
      }
    }
  },
  watch: {
    // startCLock: {
    //   handler(newVal) {
    //     this.alarmLogQuery.startCLock = newVal
    //     this.initTroubleLog()
    //   }
    // }
  },
  async mounted() {
    // this.initTroubleLog()
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
  },
  methods: {
    getPagingTableData() {
      console.log('111')
    },
    async initTroubleLog(val) {
      // console.log(query, 'qeru')
      // this.alarmLogQuery.startCLock = query?.startCLock
      await this.loadAlarmLevel()
      await this.findZbxAlarmLog(val)
    },
    async findZbxAlarmLog(val) {
      console.log(this.alarmLogQuery)
      console.log(val)
      if (val.startCLock && val.endClock) {
        const { startCLock, endClock, status } = val
        this.alarmLogQuery.startCLock = startCLock
        this.alarmLogQuery.endClock = endClock
        this.alarmLogQuery.status = status || ''
      }

      const { data, code, count } = await this.$request({ url: this.api.opm.findZbxAlarmLog, data: { ...this.alarmLogQuery, ...val, agents: this.agentsIds } })
      if (code === 1) {
        const ids = []
        if (data.length > 0) {
          data.forEach(item => ids.push(item.hostId))
        }
        const hostData = await this.findHyitHost(ids)
        console.log(hostData)
        if (hostData && hostData.length > 0) {
          data.forEach(item => {
            const getHost = hostData.filter(ele => +item.hostId === +ele.hyHostId)
            item.hyMarkName = getHost[0].hyMarkName
          })
        }
        this.tableData = data
        this.tableCount = Number(count)
      }
      console.log(data)
    },
    // 查询设备名称
    async findHyitHost(idm) {
      const { code, data } = await this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: { ids: idm, page: 1, limit: -1, agents: this.agentsIds }
      })
      if (code !== 1) return
      return data
    },
    // 故障等级
    async loadAlarmLevel() {
      const { data, code } = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      // this.levelData.push({ name: '全部', color: '#409eff', level: '' })
      if (code !== 1) return
      const levelData = []
      data.forEach(item => {
        levelData.push(item.dictdataValue)
        // this.catData[item.catId] = item.dictdataName
        // this.levelCatData[item.catId] = item.dictdataValue
        // this.levelColorData[item.catId] = item.remark
        // this.levelData.push({ name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })
        // this.colorData.push(item.remark)
        // const f_data = []
        // this.callbackDays.forEach(item2 => {
        //   f_data.push({ date: item2, value: 0 })
        // })
        // this.$nextTick(() => {
        //   this.zbxAlarmLogStaticticsData.push({
        //     dictdataValue: item.dictdataValue,
        //     name: item.dictdataName,
        //     type: 'bar',
        //     stack: '总量',
        //     barWidth: '20px',
        //     fdata: f_data,
        //     data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        //   })
        // })
      })
      const levelsData = this.localStorageOperation('get', 'levelsList')
      if (levelsData) {
        this.alarmLogQuery.levels = levelsData
      } else {
        this.alarmLogQuery.levels = levelData.join()
      }
      // this.$set(this.alarmLogQuery, 'levels', levelsData) : this.$set(this.alarmLogQuery, 'levels', levelData)
      // console.log(this.alarmLogQuery)
      // this.findAssetsAlarm()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
