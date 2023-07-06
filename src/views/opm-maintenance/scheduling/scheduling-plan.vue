<template>
  <div class="matter app-container">
    <div class="filter-container flexBox space-between align-item-center">
      <div class="left">
        <el-select v-model="listQuery.dutyAddressId" class="filter-item filter-group" @change="findHyitDutyDay">
          <el-option
            v-for="item in dutyAddressList"
            :key="item.catId"
            :label="item.catName"
            :value="item.catId"
          />
        </el-select>
        <el-button class="filter-item" type="default" @click="switchMonth(1)">上个月</el-button>
        <el-date-picker
          v-model="dutyDayDate"
          class="filter-item"
          type="month"
          placeholder="选择日期"
          :clearable="false"
          @change="changeDutyDayDate"
        />
        <el-button class="filter-item filter-group" type="default" @click="switchMonth(2)">下个月</el-button>
        <el-select v-model="currentChangeUserId" v-loadmore="loadMoreSysUser" class="filter-item filter-group" placeholder="值班人" clearable @change="changeDutyUser" @clear="clearChangeDutyUser">
          <el-option
            v-for="item in allDutyUserList"
            :key="item.userId"
            :label="item.realName + ' ' + item.tel"
            :value="item.userId"
          />
        </el-select>
        <el-checkbox-group v-if="viewTypeValue === 2" v-model="checkDutyTypeList" class="filter-item" @change="changeDayType">
          <el-checkbox v-for="item in dayType" :key="item.value" :label="item.label" />
        </el-checkbox-group>
      </div>
      <div class="right">
        <el-button-group>
          <el-button v-for="(item, index) in viewType" :key="item.value" class="filter-item" :class="index === viewType.length ? 'no-margin-right' : ''" :type="viewTypeValue === item.value ? 'primary' : 'default'" @click="handlerViewType(item.value)">{{ item.label }}</el-button>
        </el-button-group>
        <el-button v-permission="['DutyPlanDialog']" class="filter-item no-margin-right" type="primary" @click="handlerOpenPlan">值班计划</el-button>
      </div>
    </div>
    <SchedulingPlanView v-if="viewTypeValue === 1" />
    <SchedulingPlanList v-if="viewTypeValue === 2" />
    <SchedulingPlanDialog ref="schedulingPlanDialog" />
    <SchedulingDayUserDialog :key="schedulingDayUserDialogKey" ref="schedulingDayUserDialog" />
    <SchedulingUserDialog :key="schedulingUserDialogKey" ref="schedulingUserDialog" />
  </div>
</template>

<script>
import SchedulingPlanList from './components/scheduling-plan-list'
import SchedulingPlanView from './components/scheduling-plan-view'
import SchedulingPlanDialog from './components/scheduling-plan-dialog'
import SchedulingDayUserDialog from './components/scheduling-day-user-dialog'
import SchedulingUserDialog from './components/scheduling-user-dialog'

export default {
  name: 'SchedulingPlan',
  components: {
    SchedulingPlanList,
    SchedulingPlanView,
    SchedulingPlanDialog,
    SchedulingDayUserDialog,
    SchedulingUserDialog
  },
  data() {
    return {
      listQuery: {
        limit: -1,
        dutyAddressId: '',
        dayType: '',
        dutyYear: '',
        dutyMonth: '',
        dutyDay: ''
      },
      viewType: [
        { value: 1, label: '日历模式' },
        { value: 2, label: '列表模式' }
      ],
      viewTypeValue: 1,
      dutyAddressList: [],
      dutyDayDate: '',
      checkDutyTypeList: [],
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      schedulingDayUserDialogKey: this.$tool.guid(),
      schedulingUserDialogKey: this.$tool.guid(),
      allDutyUserList: [],
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      currentChangeUserId: ''
    }
  },
  destroyed() {
    this.batchOffEventBus('openSelectUser,openDayDutyUserEdit,openDayDutyUserAdd,reloadDutyDayData')
  },
  mounted() {
    this.findSysCatByDutyAddress()
    this.findSysUser()
    this.$EventBus.$on('openSelectUser', (res) => {
      this.schedulingUserDialogKey = this.$tool.guid()
      setTimeout(() => {
        this.$refs.schedulingUserDialog.open(res)
      }, 200)
    })
    this.$EventBus.$on('openDayDutyUserEdit', (res) => {
      this.schedulingDayUserDialogKey = this.$tool.guid()
      setTimeout(() => {
        this.$refs.schedulingDayUserDialog.open({
          dialogTitle: `编辑 ${res.dutyDate} 值班人员`,
          ...res
        })
      }, 200)
    })
    this.$EventBus.$on('openDayDutyUserAdd', (res) => {
      this.schedulingDayUserDialogKey = this.$tool.guid()
      setTimeout(() => {
        this.$refs.schedulingDayUserDialog.open({
          dialogTitle: `添加 ${res.dutyDate} 值班人员`,
          ...res
        })
      }, 200)
    })
    this.$EventBus.$on('reloadDutyDayData', () => {
      setTimeout(() => {
        this.findHyitDutyDay()
      }, 500)
    })
    this.dutyDayDate = [
      this.$tool.getFirstDay().text,
      this.$tool.getLastDay().text
    ]
    this.$set(this.listQuery, 'dutyYear', this.$tool.getFirstDay().y)
    this.$set(this.listQuery, 'dutyMonth', this.$tool.getFirstDay().m)
    this.dutyDayDate = new Date(`${this.$tool.getFirstDay().y}-${this.$tool.getFirstDay().m}-${this.$tool.getFirstDay().d} 00:00:00`)
  },
  methods: {
    // 搜索
    handleFilter() {},
    // 选择列表模式
    handlerViewType(value) {
      this.viewTypeValue = value
      this.findHyitDutyDay()
      setTimeout(() => {
        this.$EventBus.$emit('getListQuery', this.listQuery)
      }, 100)
    },
    // 获取值班地点
    findSysCatByDutyAddress() {
      this.$request({
        url: this.api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_值班地点', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.dutyAddressList = res.data
          this.$set(this.listQuery, 'dutyAddressId', res.data[0].catId)
          this.$EventBus.$emit('getListQuery', this.listQuery)
          this.findHyitDutyDay()
        }
      })
    },
    // 查询值班
    findHyitDutyDay() {
      this.$request({
        url: this.api.opm.findHyitDutyDay,
        data: this.listQuery
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('dutyDayData', res.data)
        }
      })
    },
    // 打开排班计划
    handlerOpenPlan() {
      this.$refs.schedulingPlanDialog.open()
    },
    // 选择月份
    changeDutyDayDate() {
      this.$set(this.listQuery, 'dutyYear', this.dutyDayDate.getFullYear())
      this.$set(this.listQuery, 'dutyMonth', this.dutyDayDate.getMonth() + 1)
      this.findHyitDutyDay()
      this.$EventBus.$emit('getListQuery', this.listQuery)
    },
    // 选择班次
    changeDayType() {
      const dayTypes = []
      this.checkDutyTypeList.forEach(item => {
        const idx = this.dayType.findIndex(items => items.label === item)
        if (idx !== -1) dayTypes.push(this.dayType[idx].value)
      })
      this.$set(this.listQuery, 'dayTypes', dayTypes.toString())
      this.findHyitDutyDay()
    },
    // 上个月、下个月切换
    switchMonth(switchType) {
      if (switchType === 1) { // 上个月
        if (this.listQuery.dutyMonth === 1) {
          this.$set(this.listQuery, 'dutyYear', +this.listQuery.dutyYear - 1)
          this.$set(this.listQuery, 'dutyMonth', 12)
        } else {
          this.$set(this.listQuery, 'dutyMonth', +this.listQuery.dutyMonth - 1)
        }
      }
      if (switchType === 2) { // 下个月
        if (this.listQuery.dutyMonth === 12) {
          this.$set(this.listQuery, 'dutyYear', +this.listQuery.dutyYear + 1)
          this.$set(this.listQuery, 'dutyMonth', 1)
        } else {
          this.$set(this.listQuery, 'dutyMonth', +this.listQuery.dutyMonth + 1)
        }
      }
      this.$EventBus.$emit('switchMonth', {
        switchType,
        dutyMonth: this.listQuery.dutyMonth
      })
      this.$EventBus.$emit('getListQuery', this.listQuery)
      this.dutyDayDate = new Date(`${this.listQuery.dutyYear}-${this.listQuery.dutyMonth}-${this.listQuery.dutyDay} 00:00:00`)
      if (this.currentChangeUserId !== '') {
        this.$EventBus.$emit('change-duty-user', {
          findHyitDutyDayQuery: this.listQuery,
          selectUserId: this.currentChangeUserId
        })
      } else {
        this.findHyitDutyDay()
      }
    },
    // 加载更多指令
    loadMoreSysUser() {
      this.$set(this.findSysUserQuery, 'page', ++this.findSysUserQuery.page)
      this.findSysUser()
    },
    // 获取用户
    async findSysUser() {
      const users = await this.commonRequestFn.findSysUser({
        ...this.findSysUserQuery,
        companyId: this.$auth.getUserSession().companyId
      })
      if (users) {
        this.allDutyUserList = [...this.allDutyUserList, ...users]
      }
    },
    // 选择用户筛选
    changeDutyUser() {
      this.$EventBus.$emit('change-duty-user', {
        findHyitDutyDayQuery: this.listQuery,
        selectUserId: this.currentChangeUserId
      })
    },
    // 取消选择用户
    clearChangeDutyUser() {
      this.findHyitDutyDay()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-group {
  margin-right: 30px;
}
</style>
