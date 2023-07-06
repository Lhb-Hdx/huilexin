<template>
  <div class="table-wrapper">
    <el-table
      :data="dutyDayData"
      :span-method="objectSpanMethod"
      border
    >
      <el-table-column
        prop="dutyDate"
        label="值班日期"
        width="180"
      />
      <el-table-column
        prop="dayTypeTitle"
        label="班次"
        width="200"
      />
      <el-table-column
        label="值班人"
      >
        <template slot-scope="{row}">
          <div v-for="item in row.users" :key="item.userId" class="user-item">
            <div class="user-name">
              {{ item.realName }} {{ item.tel }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100"
      >
        <template slot-scope="{row}">
          <el-button v-if="!row.isPast" v-permission="['DutyUserEdit']" type="primary" @click="handlerEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <SchedulingUserDialog ref="schedulingUserDialog" />
  </div>
</template>

<script>
import SchedulingUserDialog from './scheduling-user-dialog'

export default {
  components: {
    SchedulingUserDialog
  },
  data() {
    return {
      dutyDayData: [],
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      handlerDuty: {}
    }
  },
  destroyed() {
    this.batchOffEventBus('getCheckUser,dutyDayData,change-duty-user')
  },
  mounted() {
    this.$EventBus.$on('dutyDayData', (res) => {
      this.generateData({
        dutyData: res
      })
    })
    this.$EventBus.$on('change-duty-user', (res) => {
      this.generateData({
        getType: 'byUser',
        userId: res.selectUserId,
        findHyitDutyDayQuery: res.findHyitDutyDayQuery
      })
    })
  },
  methods: {
    // 生成值班表格数据
    async generateData(options) {
      // 按照班次类型降序排序
      options.dutyData.sort(this.$tool.compareJson('dayType', 'up'))
      // 数据变量
      const dutyDay = []

      // 值班ids 去查询值班关联人员
      const dutyDayIds = []
      options.dutyData.forEach(item => { dutyDayIds.push(item.id) })
      let dutyDayUser = []

      let dutyData = options.dutyData || []

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
      if (userIds.length > 0) userList = await this.commonRequestFn.findSysUser({ ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId })

      // 遍历值班数据
      dutyData.forEach(item => {
        // 数据对象
        const tmp = {}

        // 获取值班人员关联 把当前值班的人员的用户信息取出来
        const getDutyDayUser = []
        dutyDayUser.data.forEach(dutyDayUserItem => {
          if (+dutyDayUserItem.dutyDayId === +item.id) {
            const getUserIndex = userList.findIndex(userItem => +userItem.userId === +dutyDayUserItem.userId)
            if (getUserIndex !== -1) getDutyDayUser.push({ ...userList[getUserIndex], dutyDayUserId: dutyDayUserItem.id })
          }
        })

        // 查找班次信息
        const dayTypeIndex = this.dayType.findIndex(items => +item.dayType === +items.value)
        // 查一下列表中有没有这个日期的班次
        const dutyDayIndex = dutyDay.findIndex(items => items.ymdTimestamp === new Date(`${item.dutyYear}-${item.dutyMonth}-${item.dutyDay}`).getTime())

        tmp.id = item.id
        tmp.dutyDate = `${item.dutyYear}/${item.dutyMonth}/${item.dutyDay} 星期${this.$tool.dayWeek(new Date(`${item.dutyYear}/${item.dutyMonth}/${item.dutyDay}`))}`
        tmp.ymdTimestamp = new Date(`${item.dutyYear}-${item.dutyMonth}-${item.dutyDay}`).getTime()
        tmp.dayType = item.dayType
        tmp.dayTypeTitle = `${this.dayType[dayTypeIndex].label} ${item.dutyStartTime}~${item.dutyEndTime}`
        tmp.users = getDutyDayUser
        tmp.dutyStartTime = item.dutyStartTime
        tmp.dutyEndTime = item.dutyEndTime
        tmp.dutyType = item.dutyType
        tmp.isPast = false
        tmp.dutyAddressId = item.dutyAddressId

        const nowYMD = this.$tool.dateFormat('YYYY-mm-dd', new Date())
        const nowTimestamp = new Date(`${nowYMD} 00:00:00`).getTime()
        if (tmp.ymdTimestamp < nowTimestamp) tmp.isPast = true

        // 没有这个日期班次代表这个日期的班次是第一个，那么在表格中需要跨行
        if (dutyDayIndex === -1) {
          // 查询同一个日期有多少个排版
          const dataFilter = dutyData.filter(ele => new Date(`${ele.dutyYear}-${ele.dutyMonth}-${ele.dutyDay}`).getTime() === new Date(`${item.dutyYear}-${item.dutyMonth}-${item.dutyDay}`).getTime())
          tmp.isDutyDateFirst = dutyDayIndex === -1 // 代表同日期的第一个值班
          tmp.rowspan = dataFilter.length // 跨行个数
        }

        dutyDay.push(tmp)
      })
      // 根据日期时间戳降序排序
      this.dutyDayData = dutyDay.sort(this.$tool.compareJson('ymdTimestamp', 'up'))
    },
    // 行合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (row.isDutyDateFirst) {
          return {
            rowspan: row.rowspan,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    // 点击编辑排班
    handlerEdit(val) {
      this.handlerDuty = this.$tool.deepCopy(val)
      this.$refs.schedulingUserDialog.open({
        dialogTitle: `编辑 ${val.dutyDate} ${val.dayTypeTitle} 值班人员`,
        users: val.users
      })
      this.$EventBus.$off('getCheckUser')
      this.$EventBus.$on('getCheckUser', (res) => {
        this.getCheckUser(res)
      })
    },
    // 获取选择的人员
    async getCheckUser(res) {
      const waitAdd = []
      const waitDelete = []
      res.dataCheck.forEach(item => {
        // 不存在数据库的数据中 则新增
        const addIndex = this.handlerDuty.users.findIndex(items => +items.userId === +item.userId)
        if (addIndex === -1) {
          waitAdd.push({ userId: item.userId, dutyDayId: this.handlerDuty.id })
        }
      })
      this.handlerDuty.users.forEach(item => {
        // 不存在数据库的数据中 则新增
        const deleteIndex = res.dataCheck.findIndex(items => +items.userId === +item.userId)
        if (deleteIndex === -1) {
          waitDelete.push(item.dutyDayUserId)
        }
      })

      if (waitAdd.length > 0) {
        await this.insertHyitDutyDayUsers({
          json: JSON.stringify(waitAdd)
        })
      }
      if (waitDelete.length > 0) {
        await this.deleteHyitDutyDayUsers({
          ids: waitDelete.toString()
        })
      }
      this.$EventBus.$emit('reloadDutyDayData')
    },
    // 批量新增
    async insertHyitDutyDayUsers(data) {
      const { code } = this.$request({ url: this.api.opm.insertHyitDutyDayUsers, data })
      return code
    },
    // 批量删除
    async deleteHyitDutyDayUsers(data) {
      const { code } = this.$request({ url: this.api.opm.deleteHyitDutyDayUsers, data })
      return code
    }
  }
}
</script>

<style lang="scss" scoped>
.user-item {
  padding: 10px;
  display: inline-block;
  margin-right: 15px;
  .user-name {
    font-weight: 400;
    color: #000;
  }
}
</style>
