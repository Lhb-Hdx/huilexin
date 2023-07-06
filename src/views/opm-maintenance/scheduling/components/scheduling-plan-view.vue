<template>
  <div>
    <datePicker
      ref="calendar"
      :options="calendarArr"
      class="calendar"
    >
      <div slot="dateDayItem" slot-scope="row" class="calend-main">
        <div ref="calendText" class="calend-item-header">
          <div class="calend-text">{{ row.item.month >= 10 ? row.item.month : '0' + row.item.month }}/{{ row.item.day >= 10 ? row.item.day : '0' + row.item.day }}</div>
          <template v-if="row.item.isCurrentMonth">
            <el-button v-if="!row.item.isPast && isDutyDay(row.item.ymdTimestamp)" v-permission="['DutyUserEdit']" type="text" @click="handlerEditDuynUser(row.item.ymdTimestamp)">编辑</el-button>
            <el-button v-if="!isDutyDay(row.item.ymdTimestamp)" v-permission="['DutyUserEdit']" type="text" @click="handlerEditDuynUser(row.item.ymdTimestamp)">添加</el-button>
          </template>
        </div>
        <div ref="calendBtns" class="calend-btns">
          <el-button-group>
            <template v-for="item in dayType">
              <el-button v-if="setDayTypeBtnShow(row.item.ymdTimestamp, item.value)" :key="item.value" :type="setActiveDayType(row.item.ymdTimestamp, item.value) ? 'primary' : 'default'" size="mini" @click="handlerDayType(row.item.ymdTimestamp, item.value)">{{ item.label }}</el-button>
            </template>
          </el-button-group>
        </div>
        <div class="calend-duty-list" :style="{ height: dutyDayDataListHeight + 'px' }">
          <div v-for="item in setCalendarDutyList(row.item.ymdTimestamp)" :key="item.id" class="duty-list-item" :class="row.item.isPast ? 'is-past' : ''" @click="handlerDutyUser(item)">
            <el-tooltip :disabled="!getDayUserLeave(item, row.item.ymdTimestamp)" class="item" effect="dark" content="点击查看请假记录" placement="top">
              <div class="name-item">
                <div class="name overflow-text-a">
                  {{ item.realName }} {{ item.tel }}
                </div>
                <el-tag v-if="getDayUserLeave(item, row.item.ymdTimestamp)" class="pointer" :type="item.leave.length === 1 ? 'success' : 'warning'">{{ setLeaveType(item.leave[0].leaveType) }}</el-tag>
                <i v-if="!row.item.isPast" v-permission="['DutyUserDelete']" class="el-icon-close" @click.t.stop="handlerDeleteDuynUser(item)" />
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
    </datePicker>
    <UserDialog ref="userDialog" />
  </div>
</template>

<script>
import datePicker from './date-picker'
import UserDialog from '@/views/opm-maintenance/scheduling/components/user-dialog'

export default {
  components: {
    datePicker,
    UserDialog
  },
  data() {
    return {
      calendarArr: {
        type: 'combination',
        headStyle: { // 头部样式
          todayBtn: 'right',
          combination: 'center',
          checkBtn: 'right',
          show: false
        },
        viewStyle: { // 视图样式
          day: 'right',
          activeStaue: false,
          height: 360
        },
        slot: { // 插槽启用
          dateDayItem: true
        },
        dataOptions: {
          m: ''
        }
      },
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      dutyDayData: [],
      dutyDayDataListHeight: 0,
      getListQuery: {},
      leaveLogData: [], // 审核通过的请假
      handlerShowUserLeave: [], // 查看的用户请假,
      leaveTypes: this.$paramsModel.opm.get('leaveType')
    }
  },
  computed: {
    // 设置日历值班数据
    setCalendarDutyList() {
      return function(ymdTimestamp) {
        if (this.dutyDayData.length > 0) {
          const getItem = this.dutyDayData.filter(ele => +ele.ymdTimestamp === +ymdTimestamp)
          if (getItem.length === 0) return []
          const getDayItem = getItem[0].days.filter(ele => +ele.dayType === +getItem[0].filterDayType)
          if (getDayItem.length === 0) return []
          return getDayItem[0].users
        } else {
          return []
        }
      }
    },
    // 设置选择班次高亮
    setActiveDayType() {
      return function(ymdTimestamp, dayType) {
        if (this.dutyDayData.length > 0) {
          const getItem = this.dutyDayData.filter(ele => +ele.ymdTimestamp === +ymdTimestamp)
          if (getItem.length === 0) return false
          if (getItem[0].filterDayType === dayType) return true
        }
      }
    },
    // 过滤没有的班次
    setDayTypeBtnShow() {
      return function(ymdTimestamp, dayType) {
        const getItem = this.dutyDayData.filter(ele => +ele.ymdTimestamp === +ymdTimestamp)
        if (getItem.length === 0) return false
        const getDayTypeItem = getItem[0].days.filter(ele => +ele.dayType === +dayType)
        return getDayTypeItem.length !== 0
      }
    },
    // 日期是否排班
    isDutyDay() {
      return function(ymdTimestamp) {
        return this.dutyDayData.filter(ele => +ele.ymdTimestamp === +ymdTimestamp).length > 0
      }
    },
    // 查询当天用户的请假记录
    getDayUserLeave() {
      return function (user, ymdTimestamp) {
        const res = []
        const userLeave = this.leaveLogData.filter(ele => +ele.userId === +user.userId)
        const ymd = this.$tool.dateFormat('YYYY-mm-dd', new Date(ymdTimestamp))
        if (userLeave.length === 0) return
        userLeave.forEach(item => {
          const dutyStartTimeFixedDates = this.$tool.checkDateInFixedDates(item.leaveStartTime, item.leaveEndTime, `${ymd} ${user.dutyStartTime}`)
          const dutyEndTimeFixedDates = this.$tool.checkDateInFixedDates(item.leaveStartTime, item.leaveEndTime, `${ymd} ${user.dutyEndTime}`)
          if (dutyStartTimeFixedDates || dutyEndTimeFixedDates) {
            res.push(item)
          }
        })
        if (res.length > 0) {
          user.leave = res
          return true
        } else {
          return false
        }
      }
    },
    // 设置请假类型数据
    setLeaveType() {
      return function(leaveType) {
        const idx = this.leaveTypes.findIndex(item => +item.value === +leaveType)
        return idx !== -1 ? this.leaveTypes[idx].label : ''
      }
    }
  },
  mounted() {
    this.$EventBus.$on('dutyDayData', (res) => {
      this.generateData({
        dutyData: res
      })
    })
    this.$EventBus.$on('switchMonth', (res) => {
      if (res.switchType === 1) this.$refs.calendar.handlePrevMonth()
      if (res.switchType === 2) this.$refs.calendar.handleNextMonth()
      this.$set(this.calendarArr.dataOptions, 'm', +res.dutyMonth)
    })
    this.$EventBus.$on('getListQuery', (res) => {
      this.getListQuery = res
      this.$set(this.calendarArr.dataOptions, 'month', +res.dutyMonth)
      this.$set(this.calendarArr.dataOptions, 'year', +res.dutyYear)
      this.$set(this.calendarArr.dataOptions, 'day', +res.dutyDay)
    })
    this.$EventBus.$on('change-duty-user', (res) => {
      this.generateData({
        getType: 'byUser',
        userId: res.selectUserId,
        findHyitDutyDayQuery: res.findHyitDutyDayQuery
      })
    })
  },
  destroyed() {
    this.batchOffEventBus('switchMonth,dutyDayData,getListQuery,change-duty-user')
  },
  methods: {
    // 生成值班表格数据
    async generateData(options) {
      let dutyData = options.dutyData || []
      // 数据变量
      const dutyDay = []

      // 值班ids 去查询值班关联人员
      const dutyDayIds = []
      dutyData.forEach(item => { dutyDayIds.push(item.id) })
      let dutyDayUser = []

      // 根据用户值班 再去查询值班
      if (options.getType && options.getType === 'byUser') {
        dutyDayUser = await this.$request({ url: this.api.opm.findHyitDutyDayUser, data: { limit: -1, userId: options.userId } })
        if (dutyDayUser.code === 1 && dutyDayUser.data && dutyDayUser.data.length > 0) {
          const dutyDayIds = []
          dutyDayUser.data.forEach(dutyDayUserItem => dutyDayIds.push(dutyDayUserItem.dutyDayId))
          if (dutyDayIds.length > 0) {
            const dutyDay = await this.$request({
              url: this.api.opm.findHyitDutyDay,
              data: { ids: dutyDayIds.toString(), ...options.findHyitDutyDayQuery }
            })
            if (dutyDay.code === 1 && dutyDay.data && dutyDay.data.length > 0) {
              dutyData = dutyDay.data
            }
          }
        }
      } else {
        dutyDayUser = await this.$request({ url: this.api.opm.findHyitDutyDayUser, data: { limit: -1, dutyDayIds: dutyDayIds.toString() } })
      }

      // 查询值班人员 用户信息
      const userIds = []
      let userList = []
      if (dutyDayUser.code === 1 && dutyDayUser.data) {
        dutyDayUser.data.forEach(item => userIds.push(item.userId))
      }
      if (userIds.length > 0) {
        userList = await this.commonRequestFn.findSysUser({ ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId })
        this.findUserLeaveApply({ userIds: this.$tool.uniqueArray(userIds).toString(), limit: -1 })
      }

      // 遍历值班数据
      dutyData.forEach(item => {
        // 数据对象
        const tmp = {}
        // 获取值班人员关联 把当前值班的人员的用户信息取出来
        const getDutyDayUser = []
        dutyDayUser.data.forEach(dutyDayUserItem => {
          if (+dutyDayUserItem.dutyDayId === +item.id) {
            const getUserIndex = userList.findIndex(userItem => +userItem.userId === +dutyDayUserItem.userId)
            if (getUserIndex !== -1) getDutyDayUser.push({ ...userList[getUserIndex], dutyDayUserId: dutyDayUserItem.id, dutyStartTime: item.dutyStartTime, dutyEndTime: item.dutyEndTime })
          }
        })

        // 查找班次信息
        const dayTypeIndex = this.dayType.findIndex(items => +item.dayType === +items.value)
        // 查一下列表中有没有这个日期的班次
        const dutyDayIndex = dutyDay.findIndex(items => items.ymdTimestamp === new Date(`${item.dutyYear}-${item.dutyMonth}-${item.dutyDay}`).getTime())
        if (dutyDayIndex !== -1) {
          const getDaysIndex = dutyDay[dutyDayIndex].days.findIndex(items => +items.dayType === +item.dayType)
          if (item.filterDayType !== item.dutyType) dutyDay[dutyDayIndex].filterDayType = item.dayType
          if (getDaysIndex !== -1) {
            dutyDay[dutyDayIndex].days[getDaysIndex].users.push(getDutyDayUser)
          } else {
            dutyDay[dutyDayIndex].dutyNum = ++dutyDay[dutyDayIndex].dutyNum
            dutyDay[dutyDayIndex].days.push({
              id: item.id,
              dayType: item.dayType,
              dayTypeTitle: `${this.dayType[dayTypeIndex].label} ${item.dutyStartTime}~${item.dutyEndTime}`,
              dutyStartTime: item.dutyStartTime,
              dutyEndTime: item.dutyEndTime,
              users: getDutyDayUser
            })
          }
        } else {
          tmp.id = item.id
          tmp.dutyDate = `${item.dutyYear}/${item.dutyMonth}/${item.dutyDay} 星期${this.$tool.dayWeek(new Date(`${item.dutyYear}/${item.dutyMonth}/${item.dutyDay}`))}`
          tmp.ymdTimestamp = new Date(`${item.dutyYear}-${item.dutyMonth}-${item.dutyDay}`).getTime()
          tmp.dutyNum = 1
          tmp.dutyType = item.dutyType
          tmp.dutyAddressId = item.dutyAddressId
          console.log(item.dutyType)
          if (!item.filterDayType) tmp.filterDayType = item.dayType
          tmp.days = [
            {
              id: item.id,
              dayType: item.dayType,
              dayTypeTitle: `${this.dayType[dayTypeIndex].label} ${item.dutyStartTime}~${item.dutyEndTime}`,
              dutyStartTime: item.dutyStartTime,
              dutyEndTime: item.dutyEndTime,
              users: getDutyDayUser,
              hours: item.hours
            }
          ]
        }
        if (Object.keys(tmp).length > 0) dutyDay.push(tmp)
      })
      this.dutyDayData = dutyDay
      if (this.$refs.calendBtns && this.$refs.calendBtns) {
        this.dutyDayDataListHeight = 360 - (70 + this.$refs.calendBtns.clientHeight + this.$refs.calendBtns.clientHeight)
      }
    },
    // 选择班次类型
    handlerDayType(ymdTimestamp, val) {
      const idx = this.dutyDayData.findIndex(item => +item.ymdTimestamp === +ymdTimestamp)
      if (idx !== -1) this.$set(this.dutyDayData[idx], 'filterDayType', val)
    },
    // 点击删除值班人
    handlerDeleteDuynUser(item) {
      this.$confirm('确定移除该值班人员吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(item)
        this.$request({
          url: this.api.opm.deleteHyitDutyDayUser,
          data: { id: item.dutyDayUserId }
        }).then(res => {
          if (res.code === 1) {
            this.$EventBus.$emit('reloadDutyDayData')
          }
        })
      })
    },
    // 点击编辑日期排版
    handlerEditDuynUser(ymdTimestamp) {
      const idx = this.dutyDayData.findIndex(item => +item.ymdTimestamp === +ymdTimestamp)
      if (idx !== -1) {
        this.$EventBus.$emit('openDayDutyUserEdit', { type: 'edit', ...this.dutyDayData[idx] })
      } else {
        this.$EventBus.$emit('openDayDutyUserAdd', {
          type: 'add',
          dutyAddressId: this.getListQuery.dutyAddressId,
          ymdTimestamp,
          dutyDate: this.$tool.dateFormat('YYYY-mm-dd', new Date(ymdTimestamp))
        })
      }
    },
    // 查询用户已通过的请假申请
    async findUserLeaveApply(query) {
      const leaveData = await this.$request({ url: this.api.opm.findHyitDutyLeave, data: query })
      if (leaveData.code === 1 && leaveData.data) {
        const approveIds = []
        leaveData.data.forEach(item => {
          approveIds.push(item.id)
        })
        const logData = await this.$request({
          url: this.api.approveLog.findNewOaApproveLog, data: {
            approveIds,
            approveType: this.$defineData.projectActivityProcessDefine('opmLeave', 'key', 'id'),
            approveStatue: 1,
            limit: -1
          }
        })
        const leaveLogData = []
        if (logData.code === 1 && logData.data) {
          logData.data.forEach(item => {
            const idx = leaveData.data.findIndex(items => +items.id === +item.approveId)
            if (idx !== -1) leaveLogData.push({ ...leaveData.data[idx], log: item })
          })
        }
        this.leaveLogData = leaveLogData
      }
    },
    // 点击用户
    handlerDutyUser(item) {
      this.$refs.userDialog.open(item)
    }
  }
}
</script>

<style lang="scss" scoped>
.calend-main {
  padding: 10px 0;
  .calend-item-header {
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .calend-text {
      font-weight: bold;
      font-size: 20px;
    }
  }

  .calend-btns {
    margin: 10px 0;
    text-align: center;
    padding: 0 10px;
  }
  .calend-duty-list {
    overflow-y: auto;
    //border-top: 1px solid #E4E7EA;
    .is-past {
      color: #aaaaaa !important;
    }
    .duty-list-item {
      padding: 9px;
      color: #000;
      font-weight: 400;
      border-bottom: 1px solid #E4E7EA;
      &:last-of-type {
        border-bottom: none !important;
      }
      &:hover {
        background: #efefef;
      }
      .name-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 28px;
        .name {
          width: 65%;
        }
      }
      .desc-item {
        .tag {
          margin-top: 9px;
        }
      }
    }
  }
}
</style>
