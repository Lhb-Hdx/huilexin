<template>
  <div ref="statisticsAlarmTop" class="statistics-virtual-load" :style="{ 'height': paneHeight + 'px' }">
    <div class="alarm-top-header">
      <div class="header-left">虚拟资源负载TOP</div>
      <div class="header-right">
        <a :class="queryClockType === 1 ? 'active' : ''" href="#" @click="handlerClock(1)">今天</a>
        <em>|</em>
        <a :class="queryClockType === 2 ? 'active' : ''" href="#" @click="handlerClock(2)">本月</a>
        <em>|</em>
        <a :class="queryClockType === 3 ? 'active' : ''" href="#" @click="handlerClock(3)">本年</a>
      </div>
    </div>
    <div class="tab-bar">
      <div v-for="(item, index) in tabItem" :key="index" class="tab-item pointer" :class="tabItemIndex === index ? 'active' : ''" @click="handlerTabItem(index)">{{ item }}</div>
    </div>
    <div class="alarm-top-main" :style="{ 'height': alarmTopMainHeight + 'px' }">
      <ul v-if="list.length > 0" class="top-list">
        <li v-for="item in list" :key="item.hyHostId" class="top-list-item">
          <div class="item-main pointers">
            <div class="item-main-info">
              <div class="main-info-name overflow-text-a">[{{ setLeaveType(item.hyDevTypeId) }}]{{ item.hyMarkName }}</div>
              <div class="main-info-ip overflow-text-a">{{ item.hyIp }}</div>
            </div>
            <div class="item-main-count overflow-text-a">{{ item.avgValue.toFixed(2) }}%</div>
          </div>
        </li>
      </ul>
      <div v-else class="tip">暂无数据</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatisticsVirtualLoad',
  data() {
    return {
      list: [],
      clockQuery: {
        dataType: 1,
        startCLock: '',
        endClock: ''
      },
      queryClockType: 1,
      devTypeList: [],
      activeHostAlarm: {},
      tabItem: ['CPU', '内存', '磁盘'],
      tabItemIndex: 0,
      alarmTopMainHeight: '',
      paneHeight: ''
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
    this.batchOffEventBus('handler-top-project,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('handler-top-project', async (val) => {
      this.hostIds = val.hostIds
      this.alarmTopMainHeight = this.$refs.statisticsAlarmTop.clientHeight - 95
      await this.findZbxTrendStatistics()
    })
    this.$EventBus.$on('start-up-date', async () => {
      await this.findZbxTrendStatistics()
    })
    this.findItType()
    this.$set(this.clockQuery, 'startCLock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 00:00:00`).getTime() / 1000)
    this.$set(this.clockQuery, 'endClock', new Date(`${this.$tool.dateFormat('YYYY-mm-dd', new Date())} 23:59:59`).getTime() / 1000)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 35
    },
    // tab选择
    handlerTabItem(i) {
      this.tabItemIndex = i
      this.list = []
      this.$set(this.clockQuery, 'dataType', i + 1)
      this.findZbxTrendStatistics()
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
      this.findZbxTrendStatistics()
    },
    // 查询统计
    async findZbxTrendStatistics() {
      this.$request({
        url: this.api.Summary.findZbxTrendStatistics,
        data: { ...this.clockQuery, hostIds: this.$tool.uniqueArray(this.hostIds).toString(), limit: 5 }
      }).then(async res => {
        if (res.code === 1 && res.data) {
          const ids = []
          res.data.forEach(item => ids.push(item.hostId))
          if (ids.length === 0) return
          const findHyitHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: { page: 1, limit: -1, ids: this.$tool.uniqueArray(ids).toString() }})
          if (findHyitHost.code === 1) {
            res.data.forEach(item => {
              const hostIdx = findHyitHost.data.findIndex(el => +el.hyHostId === item.hostId)
              if (hostIdx !== -1) {
                item.hyMarkName = findHyitHost.data[hostIdx].hyMarkName
                item.hyDevTypeId = findHyitHost.data[hostIdx].hyDevTypeId
                item.hyIp = findHyitHost.data[hostIdx].hyIp
              }
            })
          }
          this.list = res.data
        }
      })
    },
    findItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
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
.statistics-virtual-load {
  height: 100%;
  overflow: hidden;
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
  .tab-bar {
    padding-top: 15px;
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    .tab-item {
      flex: 1;
      color: #cccccc;
      text-align: center;
      z-index: 1;
      text-decoration: none;
      transition: all .5s;
      height: 40px;
      line-height: 30px;
      &:hover {
        color: #99E5FF;
        background: url(/image/screen/tab_bg.png) no-repeat 50% 100%;
      }
    }
    .active {
      color: #99E5FF;
      background: url(/image/screen/tab_bg.png) no-repeat 50% 100%;
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
