<template>
  <div ref="recordTabsHeader" class="record mt-20">
    <div v-if="days.length > 0" class="record-tabs">
      <div class="record-tabs-header" :style="{ 'width': itemWidth * (days.length + 1) + 'px' }">
        <div class="record-tabs-header-item" :style="{ 'width': itemWidth + 'px' }" />
        <div v-for="(item, index) in days" :key="index" class="record-tabs-header-item" :style="{ 'width':days.length<5?((itemWidth*5/days.length)-2 + 'px'): (itemWidth + 'px') }"><div class="day">{{ item }}</div></div>
      </div>
      <div class="record-tabs-content" :style="{ 'width': itemWidth * (days.length + 1) + 'px' }">
        <template v-for="(recordItem,index) in workRecordData">
          <div :key="index" class="record-tabs-content-item font-14" :style="{ 'width': itemWidth + 'px' }">
            <div class="row-user">
              <el-avatar :size="20" />
              <span class="ml-10 font-14">{{ recordItem.realName }}</span>
            </div>
          </div>
          <div v-for="logItem in recordItem.getWorkLog" :key="logItem.id" class="record-tabs-content-item font-14" :style="{ 'width':days.length<5?((itemWidth*5/days.length)-2 + 'px'): (itemWidth + 'px') }">
            <div class="font-14" :style="{ 'color': setLogStatusBg(logItem.workProgress), 'opacity': setLogStatusOpacity(logItem.workProgress) }">{{ setLogStatusText(logItem.workProgress) }}</div>
            <div v-if="logItem.workProgress" class="status-tag margin-top-5" :style="{ 'background-color': setLogStatusBg(logItem.workProgress) }" />
          </div>
        </template>
      </div>
    </div>
    <div class="record-list">
      <div v-for="item in workRecordData" :key="item.id" class="record-list-item">
        <div class="record-list-item-header flex-v-between flex-h-center mb-16">
          <div class="header flex flex-h-center">
            <h2 class="overflow-text-a">{{ item.title }}</h2>
          </div>
          <div class="flex-h-center font-14">
            <el-avatar :size="20" />
            <span class="ml-10 ">{{ item.realName }}</span>
            <span class="ml-20 font-14">计划时间: {{ item.sTime }} 到 {{ item.eTime }}</span>
          </div>
        </div>
        <div class="record-list-item-content">
          <template v-for="(items, indexs) in item.getWorkLog">
            <div v-if="items.workLog !== null" :key="indexs" class="record-list-item-content-item flex">
              <div class="item-content-date">
                <div class="font-50">{{ items.d }}</div>
                <div style="color:#999">{{ items.m }}</div>
              </div>
              <div class="contentAndProgress">
                <div class="item-content-desc">
                  {{ items.workLog }}
                </div>
                <div class="stateProgress">
                  处理状态：<span :style="{color:getProgressStyle(items.workProgress)}"> {{ getProgress(items.workProgress) }}</span>
                </div>
              </div>

            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      workRecordData: [], // 日期记录数据
      days: [], // 日期数据
      itemWidth: 0,
      jobStateOption: [], // 作业完成状态
      workRecordDataList: [] // 作业日志列表
    }
  },
  computed: {
    id() { return this.$route.query.id },
    setLogStatusText() {
      return function(workProgress) {
        const idx = this.jobStateOption.findIndex(item => item.id === workProgress)
        return idx !== -1 ? this.jobStateOption[idx].key : '未记录记录'
      }
    },
    setLogStatusBg() {
      return function(workProgress) {
        const idx = this.jobStateOption.findIndex(item => item.id === workProgress)
        return idx !== -1 ? this.jobStateOption[idx].color : ''
      }
    },
    setLogStatusOpacity() {
      return function(workProgress) {
        const idx = this.jobStateOption.findIndex(item => item.id === workProgress)
        return idx !== -1 ? 1 : 0
      }
    },
    getProgress() {
      return function(workProgress) {
        const idx = this.jobStateOption.findIndex(item => item.id === workProgress)
        return idx !== -1 ? this.jobStateOption[idx].key : '未记录记录'
      }
    },
    getProgressStyle() {
      return function(workProgress) {
        const idx = this.jobStateOption.findIndex(item => item.id === workProgress)
        return idx !== -1 ? this.jobStateOption[idx].color : ''
      }
    }
  },
  mounted() {
    this.jobStateOption = this.$defineData.opmWorkLogStatus()
    this.initWorkRecord()
  },
  methods: {
    // 创建工作记录
    async initWorkRecord() {
      /**
       * 工作记录逻辑：
       * 1、未分配作业的情况下 时间段：开始时间 ~ 开始时间后推5天
       * 2、已经分配作业情况下 时间段：所有作业里时间最早的 ~ 所有作业哩时间最晚的
       */
      if (!this.info) return
      this.itemWidth = (this.$refs.recordTabsHeader.clientWidth / 6) // 日期数组

      // 获取当前事项所有的作业指派人
      const workLog = []
      const workLogItem = []

      const getTask = await this.findOpsOrderWorkTask({ limit: -1, orderProblemId: this.id })
      console.log('getTask', getTask)
      if (getTask && getTask.length > 0) { // 存在事项
        const taskIds = []
        const sTimes = []
        const eTimes = []
        const userIds = []
        // 遍历任务存储所有的任务开始、结束时间
        getTask.forEach(item => {
          taskIds.push(item.id)
          sTimes.push(new Date(item.workStime).getTime())
          eTimes.push(new Date(item.workEtime).getTime())
          userIds.push(item.userId)
        })
        // 取出最早的任务开始时间和最晚的任务结束时间
        const s = Math.min(...sTimes)
        const e = Math.max(...eTimes)
        // 获取出两个时间的时间段区间
        this.days = this.$tool.getdiffdate(this.$tool.dateFormat('YYYY-mm-dd', new Date(s)), this.$tool.dateFormat('YYYY-mm-dd', new Date(e)))
        console.log(this.days, 'days')
        // 获取作业指派人的工作日志
        const getAllLog = await this.findOpsOrderWorkLog({ orderType: 2, orderIds: taskIds.toString(), limit: -1 })
        const getUser = await this.commonRequestFn.findSysUser({ ids: userIds.toString(), limit: -1, companyId: this.$auth.getUserSession().companyId })
        getTask.forEach(item => {
          const idx = getUser.findIndex(items => Number(items.userId) === Number(item.userId))
          workLog.push({
            realId: item.id,
            id: this.$tool.guid(),
            title: item.name,
            userId: item.userId,
            realName: idx === -1 ? '' : getUser[idx].realName,
            getWorkLog: [],
            sTime: item.workStime.split(' ')[0],
            eTime: item.workEtime.split(' ')[0]
          })
        })
        this.days.forEach(item => {
          const timeSplit = item.split('-')
          workLog.forEach(wlogItem => {
            wlogItem.getWorkLog.push({
              id: this.$tool.guid(),
              workTime: item,
              workProgress: 0,
              workLog: null,
              m: timeSplit[0] + '-' + timeSplit[1],
              d: timeSplit[2]
            })
          })
          const dayLog = [] // 当前日期的日志
          getAllLog.forEach(logItem => {
            if (logItem.workTime === item) dayLog.push(logItem)
          })
          if (dayLog.length > 0) {
            console.log(workLog)
            console.log(dayLog)
            dayLog.forEach(dlogItem => {
              const idx = workLog.findIndex(wlogItem => wlogItem.userId === dlogItem.userId && wlogItem.realId === dlogItem.orderId)
              if (idx !== -1) {
                const userLogTimeIdx = workLog[idx].getWorkLog.findIndex(wlogItem => wlogItem.workTime === dlogItem.workTime)
                if (userLogTimeIdx !== -1) {
                  workLog[idx].getWorkLog[userLogTimeIdx].workProgress = dlogItem.workProgress
                  workLog[idx].getWorkLog[userLogTimeIdx].workLog = dlogItem.workLog
                }
              }
            })
          }
        })
        this.workRecordData = workLog
      } else {
        // 获取当前事项锁定人的工作日志
        const s = this.info.matter.createTime.split(' ')[0] // 开始时间 事项的创建时间
        const e = this.$tool.dateOperator(this.info.matter.createTime.split(' ')[0], 4, '+') // 结束时间 默认是事项创建时间倒推5天
        this.days = this.$tool.getdiffdate(s, e)
        const getWorkLog = await this.findOpsOrderWorkLog({ userIds: this.info.matter.lockUserId, orderType: 1, orderId: this.id, limit: -1 })
        const getUser = await this.commonRequestFn.findSysUser({ ids: this.info.matter.lockUserId, limit: -1, companyId: this.$auth.getUserSession().companyId })
        this.days.forEach(item => {
          const idx = getWorkLog.findIndex(items => items.workTime === item)
          const timeSplit = item.split('-')
          workLogItem.push({
            workTime: item,
            workProgress: idx !== -1 ? getWorkLog[idx].workProgress : 0,
            workLog: idx !== -1 ? getWorkLog[idx].workLog : null,
            m: timeSplit[0] + '-' + timeSplit[1],
            d: timeSplit[2]
          })
        })
        workLog.push({ id: this.$tool.guid(), title: '', userId: getUser[0].userId, realName: getUser[0].realName, getWorkLog: workLogItem, sTime: this.days[0], eTime: this.days[this.days.length - 1] })
        this.workRecordData = workLog
      }
    },
    // 查询工作日志
    async findOpsOrderWorkLog(query) {
      let { code, data } = await request({
        url: api.opm.findOpsOrderWorkLog,
        data: query
      })
      if (code !== 1) return
      return data
    },
    async findOpsOrderWorkTask(query) {
      let { code, data } = await request({
        url: api.opm.findOpsOrderWorkTask,
        data: query
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.record-tabs{
  overflow-x: scroll;
  .user-tabs {
    text-align: center;
  }
  .record-tabs-header{
    background-color: #EEEEEE;
    // width: 100% !important;
    min-width: 100%;
    .record-tabs-header-item{
      // background-color: #CEDBEE;
      padding: 15px 20px;
      flex: 1;
      text-align: center;
      font-size: 14px;
      display: inline-block;
    }

    .record-tabs-header-item:first-of-type {
      background-color: transparent;
    }
    .record-tabs-header-item:last-of-type {
       border-right: 1px solid white;
    }
    .record-tabs-header-item:nth-of-type(n+2){
      border-left: 1px solid white;
      background-color: #CEDBEE;
    }
  }
  .record-tabs-content{
    .record-tabs-content-item{
      padding: 5px 0;
      display: inline-block;
      .row-user {
        display: flex;
        align-items: center;
        height: 45px;
        width: 100%;
        text-align: center;
        padding-left: 10px;
        padding-right: 10px;
      }
      .status-tag {
        background-color: #E9E8EA;
        width: 100%;
        height: 5px;
      }
    }
  }
}
.record-list-item{
  border: 1px solid #CEDBEE;
  margin-top: 20px;
  padding: 20px;
  .record-list-item-header {
    .header {
      width: 50%;
      h2 {
        width: 100%;
      }
    }
  }
  .record-list-item-content-item{
    margin-top: 14px;
    border-bottom: 1px solid #CEDBEE;
    padding-bottom: 5px;
    .item-content-date{
      text-align: center;
      flex-basis: 50px;
      margin-right: 15px;
    }
    .contentAndProgress{
      display: flex;
      flex-direction: column;
      padding: 10px 0;
  .item-content-desc{
      flex: 1;
      font-size: 14px;
    }
    .stateProgress{

    }
    }

  }
}

</style>
