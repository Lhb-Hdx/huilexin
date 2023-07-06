<template>
  <div ref="alarmList" class="alarm-list" :style="{ 'height': alarmListHeight + 'px' }">
    <template v-if="alarmList.length > 0">
      <ul>
        <li v-for="item in alarmList" :key="item.id" @click="handlerAlarmItem(item)">
          <div class="alarm-left" :style="{ 'color': setColor(item.status) }">
            <el-tooltip class="item" effect="dark" :content="item.description" placement="top">
              <p class="alarm-title pointer overflow-text-a">
                {{ item.description }}
              </p>
            </el-tooltip>
            <p class="alarm-desc overflow-text-a">[{{ setLeaveType(item.devTypeId) }}] {{ item.hyMarkName }} {{ item.ip }}</p>
          </div>
          <div class="alarm-right overflow-text-a" :style="{ 'color': setTimeStyle(new Date(item.ctime)).timeSpanColor }">{{ setTimeStyle(new Date(item.ctime)).timeSpanStr }}</div>
        </li>
      </ul>
    </template>
    <div v-else class="tip">暂无数据</div>
  </div>
</template>

<script>
export default {
  name: 'AlarmList',
  data() {
    return {
      alarmList: [],
      devTypeList: [],
      alarmHost: [],
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '自动恢复', value: 3, color: 'grey' },
        { label: '处理中', value: 4, color: 'grey' }
      ],
      listQuery: {
        page: 1,
        limit: 20
      },
      listAllPageNum: 0,
      hostIds: [],
      alarmListHeight: ''
    }
  },
  computed: {
    setLeaveType() {
      return function(devTypeId) {
        const idx = this.devTypeList.findIndex(item => item.id === devTypeId)
        return idx !== -1 ? this.devTypeList[idx].dictdataName : ''
      }
    },
    setColor() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].color
        }
      }
    },
    // 设置时间格式和颜色
    setTimeStyle() {
      return function (targetDate) {
        const targetTime = targetDate.getTime()
        const nowDate = new Date()
        const now_new = Date.parse(nowDate.toString())
        let milliseconds = 0
        let timeSpanStr = ''
        let timeSpanColor = ''
        milliseconds = now_new - targetTime
        if (milliseconds <= 1000 * 60) {
          timeSpanStr = '刚刚'
        } else if (1000 * 60 < milliseconds && milliseconds <= 1000 * 60 * 60) {
          timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前'
          timeSpanColor = '#08F2F5'
        } else {
          timeSpanStr = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', targetDate)
          timeSpanColor = '#888888'
        }
        return {
          timeSpanStr, timeSpanColor
        }
      }
    }
  },
  mounted() {
    this.findItType()
    this.$EventBus.$on('open-topo-alarm', () => {
      this.init()
    })
    this.$EventBus.$on('start-up-date', async () => {
      await this.toLoadAlarmList()
    })
    this.$EventBus.$on('load-alarm-list', async () => {
      await this.toLoadAlarmList()
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('open-topo-alarm,start-up-date,load-alarm-list')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 初始化
    async init() {
      await this.setSize()
      window.addEventListener('resize', this.setSize)
      this.alarmList = []
      this.hostIds = await this.$store.dispatch('screen/getNodeHostIds')
      if (this.hostIds && this.hostIds.length > 0) await this.getAlarmData()
    },
    // 设置相关尺寸
    async setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.alarmListHeight = windowHeight - (50 + this.$refs.alarmList.getBoundingClientRect().top)
    },
    // 重新加载告警列表
    async toLoadAlarmList() {
      this.$set(this.listQuery, 'limit', this.listQuery.page * this.listQuery.limit)
      this.$set(this.listQuery, 'page', 1)
      await this.getAlarmData(true)
      this.$set(this.listQuery, 'limit', 20)
    },
    // 获取待处理告警列表
    async getAlarmData(isTimeUpdate) {
      const findZbxAlarmLogQuery = {
        levels: '1,2,3,4,5',
        sameType: 0,
        status: 0,
        agents: '',
        hostIds: this.hostIds.toString(),
        ...this.listQuery
      }
      const findZbxAlarmLog = await this.$request({ url: this.api.itMonitor.findZbxAlarmLog, data: findZbxAlarmLogQuery })
      if (findZbxAlarmLog.code !== 1 && !findZbxAlarmLog.data) return
      if (isTimeUpdate) {
        this.alarmList = findZbxAlarmLog.data
      } else {
        this.alarmList = [...this.alarmList, ...findZbxAlarmLog.data]
      }
      this.listAllPageNum = Math.ceil(+findZbxAlarmLog.count / 20)
      const findHostIds = []
      findZbxAlarmLog.data.forEach(item => {
        const idx = this.alarmHost.findIndex(items => +items.hostId === +item.hostId)
        if (idx === -1) findHostIds.push(item.hostId)
      })
      if (findHostIds.length === 0) return
      const findHyitHost = await this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: { ids: findHostIds.toString(), page: 1, limit: -1 }
      })
      if (findHyitHost.code !== 1 && !findHyitHost.data) return
      this.alarmHost = [...this.alarmHost, ...findHyitHost.data]
      this.$refs.alarmList.addEventListener('scroll', this.scrollBody)
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
    },
    scrollBody() {
      const scrollTop = this.$refs.alarmList.scrollTop
      // 获取可视区的高度
      const windowHeight = this.$refs.alarmList.clientHeight
      // 获取滚动条的总高度
      const scrollHeight = this.$refs.alarmList.scrollHeight
      if (scrollTop + windowHeight >= scrollHeight - 1) {
        // 把距离顶部的距离加上可视区域的高度 等于或者大于滚动条的总高度就是到达底部
        if (this.listAllPageNum > this.listQuery.page) {
          this.$set(this.listQuery, 'page', ++this.listQuery.page)
          this.getAlarmData()
        }
      }
    },
    // 打开告警
    handlerAlarmItem(item) {
      this.$EventBus.$emit('handler-alarm-item', item)
    }
  }
}
</script>

<style lang="scss" scoped>
ul, li {
  margin: 0;
  padding: 0;
}
.alarm-list {
  margin: 15px 0;
  overflow-y: auto;
  li {
    display: flex;
    border-top: 1px solid #444444;
    border-bottom: 1px solid #444444;
    margin-bottom: -1px;
    .alarm-left {
      width: 68%;
      border-left-width: 3px;
      border-left-style: solid;
      padding-left: 15px;
      .alarm-title {
        color: #ffffff;
        text-decoration: none;
        transition: all .5s;
        &:hover {
          color: #99CCFF;
        }
      }
      .alarm-desc {
        color: #999999;
      }
    }
    .alarm-right {
      width: 32%;
      color: #08F2F5;
      font-size: 12px;
      font-style: normal;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
.tip {
  text-align: center;
  line-height: 60px;
  font-size: 12px;
}
</style>
