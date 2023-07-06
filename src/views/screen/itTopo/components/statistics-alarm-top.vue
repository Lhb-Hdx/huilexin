<template>
  <div ref="statisticsAlarmTop" class="statistics-alarm-top">
    <div class="alarm-top-header">
      <div class="header-left">告警TOP</div>
      <div class="header-right">
        <a :class="queryClockType === 1 ? 'active' : ''" href="#" @click="handlerClock(1)">今天</a>
        <em>|</em>
        <a :class="queryClockType === 2 ? 'active' : ''" href="#" @click="handlerClock(2)">本月</a>
        <em>|</em>
        <a :class="queryClockType === 3 ? 'active' : ''" href="#" @click="handlerClock(3)">本年</a>
      </div>
    </div>
    <div class="alarm-top-main" :style="{ 'height': alarmTopMainHeight + 'px' }">
      <ul v-if="list.length > 0" class="top-list pointer">
        <li v-for="item in list" :key="item.hyHostId" class="top-list-item" @click="handlerHostAlarm(item)">
          <div class="item-main pointers">
            <div class="item-main-info pointer">
              <el-tooltip class="item" effect="dark" :content="item.hyMarkName" placement="top">
                <div class="main-info-name overflow-text-a">[{{ setLeaveType(item.hyDevTypeId) }}]{{ item.hyMarkName }}</div>
              </el-tooltip>
              <div class="main-info-ip overflow-text-a">{{ item.hyIp }}</div>
            </div>
            <div class="item-main-count overflow-text-a">{{ item.alarmCount }}</div>
          </div>
          <div v-if="item.expand" class="item-children">
            <dl v-for="(items, index) in item.children" :key="index">
              <el-tooltip class="item" effect="dark" :content="items.description" placement="top">
                <dt class="overflow-text-a">{{ items.description }}</dt>
              </el-tooltip>
              <dd class="overflow-text-a">{{ items.alarmCount }}</dd>
            </dl>
          </div>
        </li>
      </ul>
      <div v-else class="tip">暂无数据</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatisticsAlarmTop',
  data() {
    return {
      list: [],
      clockQuery: {
        startCLock: '',
        endClock: ''
      },
      queryClockType: 1,
      devTypeList: [],
      activeHostAlarm: {},
      alarmTopMainHeight: '',
      hostIds: []
    }
  },
  computed: {
    setLeaveType() {
      return function(devTypeId) {
        const idx = this.devTypeList.findIndex(item => +item.id === +devTypeId)
        return idx !== -1 ? this.devTypeList[idx].dictdataName : ''
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-statistical,start-up-date')
  },
  mounted() {
    this.findItType()
    this.$EventBus.$on('open-topo-statistical', async () => {
      this.alarmTopMainHeight = this.$refs.statisticsAlarmTop.clientHeight - 40
      await this.getHostAlarmLogCount()
    })
    this.$EventBus.$on('start-up-date', async () => {
      await this.getAlarmLogDesTop()
    })
    this.$set(this.clockQuery, 'startCLock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 00:00:00`).getTime() / 1000)
    this.$set(this.clockQuery, 'endClock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 23:59:59`).getTime() / 1000)
  },
  methods: {
    // 查询主机
    async getHostAlarmLogCount() {
      // 查询top5主机
      const hostIds = await this.$store.dispatch('screen/getNodeHostIds')
      const getHostAlarmLogCount = await this.$request({ url: this.api.itMonitor.getHostAlarmLogCount, data: { page: 1, limit: 5, hostIds: this.$tool.uniqueArray(hostIds).toString(), ...this.clockQuery }})
      if (getHostAlarmLogCount.code !== 1 && !getHostAlarmLogCount.map) return
      const top = getHostAlarmLogCount.map.top
      const ids = []
      top.forEach(item => {
        ids.push(item.hostId)
      })
      const findHyitHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: { page: 1, limit: 5, ids: this.$tool.uniqueArray(ids).toString() }})
      if (findHyitHost.code === 1 && findHyitHost.data) {
        findHyitHost.data.forEach((item) => {
          const topIndex = top.findIndex(el => +el.hostId === +item.hyHostId)
          item.alarmCount = topIndex !== -1 ? top[topIndex].alarmCount : 0
          item.children = []
          item.expand = false
        })
        this.list = findHyitHost.data
      }
      if (!this.activeHostAlarm.hyHostId) {
        this.activeHostAlarm = this.list[0]
        this.$set(this.list[0], 'expand', true)
        await this.getAlarmLogDesTop()
      }
    },
    // 查询设备top告警
    async getAlarmLogDesTop() {
      const findHyitHost = await this.$request({ url: this.api.itMonitor.getAlarmLogDesTop, data: { hostid: this.activeHostAlarm.hyHostId, top: 3 }})
      if (findHyitHost.code === 1 && findHyitHost.map) {
        const top = findHyitHost.map.top
        const idx = this.list.findIndex(item => +item.hyHostId === +this.activeHostAlarm.hyHostId)
        if (idx !== -1) {
          if (!this.list[idx].expand) this.$set(this.list[idx], 'expand', true)
          this.$set(this.list[idx], 'children', top)
        }
      }
    },
    // 点击设备
    async handlerHostAlarm(item) {
      if (item.expand) {
        item.expand = false
      } else {
        this.activeHostAlarm = item
        this.list.forEach((items) => {
          items.expand = false
        })
        await this.getAlarmLogDesTop()
      }
    },
    // 查询设备
    findItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    // 选择时间类型
    handlerClock(t) {
      this.queryClockType = t
      this.list = []
      if (t === 1) {
        this.$set(this.clockQuery, 'startCLock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 00:00:00`).getTime() / 1000)
        this.$set(this.clockQuery, 'endClock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 23:59:59`).getTime() / 1000)
      }
      if (t === 2) {
        this.$set(this.clockQuery, 'startCLock', new Date(`${this.$tool.dateFormat('YYYY-mm', new Date())} 01 00:00:00`).getTime() / 1000)
        this.$set(this.clockQuery, 'endClock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 23:59:59`).getTime() / 1000)
      }
      if (t === 3) {
        this.$set(this.clockQuery, 'startCLock', new Date(`${this.$tool.dateFormat('YYYY', new Date())} 01-01 00:00:00`).getTime() / 1000)
        this.$set(this.clockQuery, 'endClock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 23:59:59`).getTime() / 1000)
      }
      this.getHostAlarmLogCount()
    }
  }
}
</script>

<style lang="scss" scoped>
ul, li, dl, dt {
  margin: 0;
  padding: 0;
  list-style: none;
}
.statistics-alarm-top {
  height: 100%;
  .alarm-top-header {
    width: 100%;
    height: 40px;
    line-height: 40px;
    background: url(/image/screen/title_bg.png) no-repeat 0 0;
    display: flex;
    align-content: center;
    justify-content: space-between;
    .header-left {
      width: 50%;
      padding-left: 15px;
      font-size: 14px;
      font-weight: bold;
      color: #99E5FF;
    }
    .header-right {
      width: 40%;
      text-align: right;
      a {
        display: inline-block;
        width: 40px;
        text-align: center;
        color: #cccccc;
        font-size: 10px;
        &:hover {
          color: #99E5FF;
        }
      }
      .active {
        color: #99E5FF;
      }
      em {
        color: #cccccc;
      }
    }
  }
}
.alarm-top-main {
  overflow-y: auto;
  ul {
    margin-bottom: 20px;
    li {
      line-height: 40px;
      background: rgba(35, 90, 150,.1);
      border-bottom: 1px solid #123788;
      color: #ffffff;
      .item-main {
        height: 40px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        .item-main-info {
          width: 75%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .main-info-name {
            text-indent: 15px;
          }
        }
        .item-main-count {
          float: right;
          color: #08F2F5;
          width: 20%;
          padding-right: 15px;
          text-align: right;
          background: rgba(30, 90, 200, .1);
        }
      }
      .item-children {
        dl {
          display: flex;
          align-items: center;
          dt {
            width: 75%;
            text-indent: 40px;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #cccccc;
          }
          dd {
            width: 20%;
            text-align: right;
            padding-right: 15px;
            color: #08F2F5;
          }
        }
      }
    }
  }
}
.tip {
  text-align: center;
  line-height: 60px;
  font-size: 12px;
}
</style>
