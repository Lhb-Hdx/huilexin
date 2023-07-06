<template>
  <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="55%" top="5vh">
    <div class="dialog-body">
      <el-form ref="form" label-width="110px" :model="dutyOptions">
        <el-form-item label="值班类型" prop="dutyType">
          <el-select
            v-model="dutyOptions.dutyType"
            placeholder="请选择值班类型"
            style="width: 40%;"
          >
            <el-option
              v-for="item in dutyType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班次">
          <div class="duty-list-body">
            <div v-for="(item, index) in dayItems" :key="index" class="duty-radio">
              <el-radio v-model="handlerItemsIndex" :label="index" @change="changeRadioOption(item, index)">{{ item.itemTitle }}</el-radio>
              <template v-if="handlerItemsIndex === index">
                <div v-for="(dutyNumItem, dutyNumIndex) in item.dutyUsers" :key="dutyNumIndex" class="duty-item-form">
                  <el-select
                    v-model="dutyNumItem.dayType"
                    placeholder="请选择班次"
                    class="select"
                    @change="changeDutyType($event, { ...item, dutyNumIndex })"
                    @focus="focusDutyType(item.dutyUsers[dutyNumIndex].dayType)"
                  >
                    <el-option
                      v-for="dutyTypeItem in dayType"
                      :key="dutyTypeItem.value"
                      :label="dutyTypeItem.label"
                      :value="dutyTypeItem.value"
                    />
                  </el-select>
                  <el-time-picker
                    v-if="item.dutyUsers[dutyNumIndex]"
                    v-model="item.dutyUsers[dutyNumIndex].dutyStartTime"
                    class="start-time"
                    arrow-control
                    placeholder="开始时间"
                    value-format="HH:mm:ss"
                    @change="changeTime(item.dutyUsers[dutyNumIndex])"
                  />
                  <el-time-picker
                    v-if="item.dutyUsers[dutyNumIndex]"
                    v-model="item.dutyUsers[dutyNumIndex].dutyEndTime"
                    class="end-time"
                    arrow-control
                    placeholder="结束时间"
                    value-format="HH:mm:ss"
                    @change="changeTime(item.dutyUsers[dutyNumIndex])"
                  />
                  <el-input v-model="item.dutyUsers[dutyNumIndex].hours" class="hours">
                    <template slot="append">小时</template>
                  </el-input>
                  <el-button class="btn" type="primary" @click="handlerSelectUser(item, dutyNumIndex)">选择人员</el-button>
                  <div class="text">已选择 <span>{{ dutyNumItem.userIds.length > 0 ? dutyNumItem.userIds.length : 0 }}</span> 人</div>
                </div>
              </template>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getUserSession } from '@/utils/auth'

export default {
  name: 'SchedulingDayUserDialog',
  data() {
    return {
      showDialog: false,
      dialogTitle: '值班人员',
      activeDayType: 1,
      reloadKey: 'reloadKey',
      sysUserList: [],
      checkSysUserData: [],
      dictionary: {
        leftPanelDevTypeId: '',
        notInIds: []
      },
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      oldDutyOptions: {},
      dayItems: [ // 值班班次
        /*
          itemTitle 班次标题
          dutyValue 班次值
          dutyNum 班次类型
          dutyHMS 班次设置的开始结束时间
          dutyUsers 选择用户
        */
        { itemTitle: '一天一班', dutyValue: 1, dutyNum: 1, dutyUsers: [] },
        { itemTitle: '一天两班', dutyValue: 1, dutyNum: 2, dutyUsers: [] },
        { itemTitle: '一天三班', dutyValue: 1, dutyNum: 3, dutyUsers: [] }
      ],
      dutyOptions: {}, // 值班数据
      handlerItemsIndex: 0, // 班次类型索引
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      dutyType: [
        { label: '工作日', value: 1 },
        { label: '节假日', value: 2 }
      ],
      dutyTypeForm: {
        dutyType: 1
      },
      oldDayType: -1
    }
  },
  watch: {
    showDialog: {
      handler() {
        if (!this.showDialog) {
          this.batchOffEventBus('left-panel-body-bottom,data-source-null,getCheckUser')
        }
      }
    }
  },
  methods: {
    // 打开弹窗
    open(options) {
      this.showDialog = true
      if (options.dialogTitle) this.dialogTitle = options.dialogTitle || '值班人员'
      if (options.type === 'add') {
        this.handlerItemsIndex = 0
        this.$set(this.dayItems[this.handlerItemsIndex], 'dutyUsers', [])
        this.dutyOptions = {
          dutyType: 1, ...options
        }
        this.resetDutyUsersTmp(0)
      } else {
        this.handlerItemsIndex = options.dutyNum - 1
        this.oldDutyOptions = this.$tool.deepCopy(options)
        this.dutyOptions = options
        this.$set(this.dayItems[this.handlerItemsIndex], 'dutyUsers', [])
        options.days.forEach(item => {
          const userIds = []
          item.users.forEach(items => userIds.push(items.userId))
          const tmp = {
            users: item.users,
            userIds,
            dayType: item.dayType,
            dutyStartTime: item.dutyStartTime,
            dutyEndTime: item.dutyEndTime,
            hours: item.hours
          }
          if (item.id) tmp.id = item.id
          this.$set(this.dayItems[this.handlerItemsIndex].dutyUsers, this.dayItems[this.handlerItemsIndex].dutyUsers.length, tmp)
        })
      }
      this.$EventBus.$on('getCheckUser', (res) => {
        this.$set(this.dayItems[this.handlerItemsIndex].dutyUsers[this.handlerDutyItem.index], 'userIds', this.$tool.deepCopy(res.checkIds))
        this.$set(this.dayItems[this.handlerItemsIndex].dutyUsers[this.handlerDutyItem.index], 'users', this.$tool.deepCopy(res.dataCheck))
      })
    },
    // 保存
    async confirmDialog() {
      const newData = this.dayItems[this.handlerItemsIndex]

      for (let i = 0; i < newData.dutyUsers.length; i++) {
        if (newData.dutyUsers[i].dutyStartTime.length === 0) {
          const dayTypeIdx = this.dayType.findIndex(item => +item.value === +newData.dutyUsers[i].dayType)
          return this.$message(`请选择${this.dutyOptions.dutyDate}${this.dayType[dayTypeIdx].label}值班人员值班开始时间`)
        }
        if (newData.dutyUsers[i].dutyEndTime.length === 0) {
          const dayTypeIdx = this.dayType.findIndex(item => +item.value === +newData.dutyUsers[i].dayType)
          return this.$message(`请选择${this.dutyOptions.dutyDate}${this.dayType[dayTypeIdx].label}值班人员值班结束时间`)
        }
      }

      this.showDialog = false

      if (this.dutyOptions.type === 'add') {
        const waitAdd = []
        const dateObject = this.$tool.getNowDate('object', new Date(this.dutyOptions.ymdTimestamp))
        for (let i = 0; i < newData.dutyUsers.length; i++) {
          const tmp = {
            dutyAddressId: this.dutyOptions.dutyAddressId,
            dutyType: this.dutyOptions.dutyType,
            dutyMonth: dateObject.M,
            dayType: newData.dutyUsers[i].dayType,
            dutyStartTime: newData.dutyUsers[i].dutyStartTime,
            dutyEndTime: newData.dutyUsers[i].dutyEndTime,
            dutyDay: dateObject.D,
            dutyYear: dateObject.Y,
            hours: newData.dutyUsers[i].hours
          }
          const insertHyitDutyDay = await this.insertHyitDutyDay(tmp)
          newData.dutyUsers[i].userIds.forEach(key => {
            waitAdd.push({
              userId: key,
              dutyDayId: insertHyitDutyDay.id
            })
          })
        }
        if (waitAdd.length > 0) {
          await this.insertHyitDutyDayUsers({
            json: JSON.stringify(waitAdd)
          })
        }
        this.$EventBus.$emit('reloadDutyDayData')
      } else {
        const waitAdd = []
        const waitDelete = []
        // 新的班次和旧的班次数量不一致
        if (newData.dutyNum !== this.oldDutyOptions.dutyNum) {
          // 批量删除旧班次的人员关联 和 旧的班次
          const deleteDutyIds = []
          const deleteDutyUserIds = []
          this.oldDutyOptions.days.forEach(item => {
            deleteDutyIds.push(item.id)
            item.users.forEach(userItem => deleteDutyUserIds.push(userItem.dutyDayUserId))
          })
          // 删除班次
          if (deleteDutyIds.length > 0) {
            console.log('deleteDutyIds', deleteDutyIds)
            await this.deleteHyitDutyDays({ids: deleteDutyIds.toString()})
          }
          // 删除班次人员
          if (deleteDutyUserIds.length > 0) {
            console.log('deleteDutyUserIds', deleteDutyUserIds)
            await this.deleteHyitDutyDayUsers({ids: deleteDutyUserIds.toString()})
          }
          const dateObject = this.$tool.getNowDate('object', new Date(this.oldDutyOptions.ymdTimestamp))
          for (let i = 0; i < newData.dutyUsers.length; i++) {
            const tmp = {
              dutyAddressId: this.dutyOptions.dutyAddressId,
              dutyType: this.dutyOptions.dutyType,
              dutyMonth: dateObject.M,
              dayType: newData.dutyUsers[i].dayType,
              dutyStartTime: newData.dutyUsers[i].dutyStartTime,
              dutyEndTime: newData.dutyUsers[i].dutyEndTime,
              dutyDay: dateObject.D,
              dutyYear: dateObject.Y,
              hours: newData.dutyUsers[i].hours
            }
            const insertHyitDutyDay = await this.insertHyitDutyDay(tmp)
            newData.dutyUsers[i].userIds.forEach(key => {
              waitAdd.push({
                userId: key,
                dutyDayId: insertHyitDutyDay.id
              })
            })
          }
          if (waitAdd.length > 0) {
            await this.insertHyitDutyDayUsers({
              json: JSON.stringify(waitAdd)
            })
          }
          this.$EventBus.$emit('reloadDutyDayData')
        } else { // 新的班次和旧的班次数量一致
          // 修改
          newData.dutyUsers.forEach((item, index) => {
            const oldData = this.oldDutyOptions.days.filter(ele => +ele.id === +item.id)
            if (oldData.length > 0) {
              const updateDayYMD = this.$tool.dateFormat('YYYY-mm-dd', new Date(this.oldDutyOptions.ymdTimestamp))

              const newStartHMS = this.$tool.dateFormat('HH:MM:SS', new Date(`${updateDayYMD} ${item.dutyStartTime}`))
              const newEndHMS = this.$tool.dateFormat('HH:MM:SS', new Date(`${updateDayYMD} ${item.dutyEndTime}`))
              const newStartTimestamp = new Date(`${updateDayYMD} ${newStartHMS}`).getTime()
              const newEndTimestamp = new Date(`${updateDayYMD} ${newEndHMS}`).getTime()

              const oldStartTimestamp = new Date(`${updateDayYMD} ${oldData[0].dutyStartTime}`).getTime()
              const oldEndTimestamp = new Date(`${updateDayYMD} ${oldData[0].dutyEndTime}`).getTime()

              if ((item.dayType !== oldData[0].dayType) || (newStartTimestamp !== oldStartTimestamp) || (newEndTimestamp !== oldEndTimestamp)) {
                this.updateHyitDutyDay({
                  id: item.id,
                  dayType: item.dayType,
                  dutyStartTime: newStartHMS,
                  dutyEndTime: newEndHMS,
                  hours: item.hours
                })
              }

              item.users.forEach(dutyUsersItem => {
                const newUserIndex = this.oldDutyOptions.days[index].users.findIndex(newUserItem => +newUserItem.userId === +dutyUsersItem.userId)
                if (newUserIndex === -1) {
                  waitAdd.push({ userId: dutyUsersItem.userId, dutyDayId: item.id })
                }
              })
            }
          })
          this.oldDutyOptions.days.forEach((daysItem, daysIndex) => {
            daysItem.users.forEach(usersItem => {
              const newUserIndex = newData.dutyUsers[daysIndex].users.findIndex(newUserItem => +newUserItem.userId === +usersItem.userId)
              if (newUserIndex === -1) {
                waitDelete.push(usersItem.dutyDayUserId)
              }
            })
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
        }
      }
    },
    // 选择班次
    handlerDayType(dayType, newIndex) {
      const getCheck = this.$refs.sysUserTransferList.getCheck()
      const prevSelectDayTypeIndex = this.dutyOptions.days.findIndex(item => +item.dayType === +this.activeDayType)
      if (prevSelectDayTypeIndex !== -1) {
        this.$set(this.dutyOptions.days[prevSelectDayTypeIndex], 'users', getCheck.dataCheck)
      }
      this.activeDayType = dayType
      this.checkSysUserData = this.dutyOptions.days[newIndex].users
      const idsNotIn = []
      this.dutyOptions.days[newIndex].users.forEach(item => idsNotIn.push(item.userId))
      this.$set(this.findSysUserQuery, 'idsNotIn', idsNotIn.toString())
      this.reloadKey = this.$tool.guid()
      this.sysUserList = []
      this.findSysUser()
    },
    // 查询用户
    findSysUser() {
      this.$request({
        url: this.api.sys.findSysUser,
        data: { ...this.findSysUserQuery, companyId: getUserSession().companyId }
      }).then(res => {
        if (res.code === 1) {
          this.sysUserList = [...this.sysUserList, ...res.data]
        }
      })
    },
    // 批量新增
    async insertHyitDutyDayUsers(data) {
      const { code } = this.$request({ url: this.api.opm.insertHyitDutyDayUsers, data })
      return code
    },
    // 批量删除值班人员
    async deleteHyitDutyDayUsers(data) {
      const { code } = this.$request({ url: this.api.opm.deleteHyitDutyDayUsers, data })
      return code
    },
    // 批量删除值班
    async deleteHyitDutyDays(data) {
      const { code } = this.$request({ url: this.api.opm.deleteHyitDutyDays, data })
      return code
    },
    // 修改值班
    async updateHyitDutyDay(data) {
      const { code } = this.$request({ url: this.api.opm.updateHyitDutyDay, data })
      return code
    },
    // 新增值班
    async insertHyitDutyDay(data) {
      const { code, model } = await this.$request({ url: this.api.opm.insertHyitDutyDay, data })
      if (code !== 1) return
      return model
    },
    // 打开选择值班人
    handlerSelectUser(item, index) {
      this.handlerDutyItem = { data: item, index }
      this.$EventBus.$emit('openSelectUser', this.$tool.deepCopy(item.dutyUsers[index]))
    },
    // 选择排班类型
    changeDutyType(e, val) {
      let count = 0
      this.dayItems[this.handlerItemsIndex].dutyUsers.forEach(item => {
        if (+item.dayType === +e) ++count
      })
      if (count > 1) {
        this.$message('排班类型不可以重复')
        this.$set(this.dayItems[this.handlerItemsIndex].dutyUsers[val.dutyNumIndex], 'dayType', this.oldDayType)
      } else {
        this.oldDayType = e
      }
    },
    // 记录上一个选择的排班类型
    focusDutyType(val) {
      this.oldDayType = val
    },
    // 值班班次类型选择
    changeRadioOption(item, index) {
      this.resetDutyUsersTmp(index)
    },
    // 根据班次设置对应的值班选择人数据
    resetDutyUsersTmp(index) {
      if (this.dayItems[index].dutyUsers.length === 0) {
        for (let i = 0; i < this.dayItems[index].dutyNum; i++) {
          this.$set(this.dayItems[index].dutyUsers, this.dayItems[index].dutyUsers.length, {
            users: [],
            userIds: [],
            dayType: i + 1,
            dutyStartTime: '',
            dutyEndTime: '',
            hours: 0
          })
        }
      }
    },
    // 选择时间
    changeTime(item) {
      if (item.dutyStartTime.length > 0 && item.dutyEndTime.length > 0) {
        const updateDayYMD = this.$tool.dateFormat('YYYY-mm-dd', new Date(this.dutyOptions.ymdTimestamp))
        if (new Date(`${updateDayYMD} ${item.dutyStartTime}`).getTime() > new Date(`${updateDayYMD} ${item.dutyEndTime}`).getTime()) {
          this.$message.error('开始时间不能大于结束时间')
          item.dutyStartTime = ''
          item.dutyEndTime = ''
        } else {
          item.hours = this.$tool.getHoursDiff(`${updateDayYMD} ${item.dutyStartTime}`, `${updateDayYMD} ${item.dutyEndTime}`).toFixed(2)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list {
  width: fit-content;
  margin: 30px auto 0 auto;
}
.duty-list-body {
  padding: 0 15px;
  .duty-radio {
    display: block;
    width: 100%;
  }
  .duty-item-form {
    margin-bottom: 10px;
    margin-top: 10px;
    .start-time {
      margin-right: 10px;
    }
    .start-time, .end-time, .hours {
      width: 20%;
    }
    .select {
      width: 15%;
      margin-right: 10px;
    }
    .end-time {
      margin-right: 10px;
    }
    .btn {
      margin-left: 10px;
      margin-right: 10px;
    }
    .text {
      display: inline-block;
      span {
        color: #0145ab;
        font-weight: bold;
      }
    }
  }
}
</style>
