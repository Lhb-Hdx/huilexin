<template>
  <div ref="sideBox" class="side-box scheduling-screen" :style="{ 'height': paneHeight + 'px' }">
    <div class="side-title has-action">
      值班人员
      <div class="title-action">
        <el-select
          v-model="addressValue"
          placeholder="请选择值班地点"
          style="width: 100%;"
          size="mini"
          @change="changeDutyAddress"
        >
          <el-option
            v-for="item in dutyAddressList"
            :key="item.catId"
            :label="item.catName"
            :value="item.catId"
          />
        </el-select>
      </div>
    </div>
    <div class="side-main" :style="{ 'height': mainHeight + 'px' }">
      <div v-if="dutyDayData.length > 0">
        <div v-for="item in dutyDayData" :key="item.ymdTimestamp" class="day-item">
          <div class="day-text">{{ item.dutyDate }}</div>
          <div class="day-user">
            <div v-for="childrenItem in item.children" :key="childrenItem.id">
              {{ setDayTypeText(childrenItem.dayType) }}：
              {{ childrenItem.usersText.toString() }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="tip">暂无数据</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SchedulingManage',
  data() {
    return {
      paneHeight: '',
      dutyDayData: [],
      allDutyDayData: [],
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      mainHeight: '',
      dutyAddressList: [],
      addressValue: ''
    }
  },
  computed: {
    setDayTypeText() {
      return function(dayType) {
        const idx = this.dayType.findIndex(el => +el.value === +dayType)
        return idx !== -1 ? this.dayType[idx].label : ''
      }
    }
  },
  mounted() {
    this.$EventBus.$on('handler-top-project', () => {
      this.dutyDayData = []
      this.allDutyDayData = []
      this.setSize()
      this.findDutyAddress()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('start-up-date', () => {
      this.allDutyDayData = []
      this.init()
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-top-project,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 30
      this.mainHeight = this.$refs.sideBox.clientHeight - 40
    },
    // 初始化
    async init() {
      const currentDate = this.$tool.dateFormat('YYYY-mm-dd', new Date())
      const prevDate = this.$tool.dateOperator(currentDate, 1, '-')
      const nextDate = this.$tool.dateOperator(currentDate, 1, '+')
      let m = []
      const getdiffdate = this.$tool.getdiffdate(prevDate, nextDate)
      const prevYM = [new Date(`${prevDate} 00:00:00`).getFullYear(), new Date(`${prevDate} 00:00:00`).getMonth() + 1]
      const nextYM = [new Date(`${nextDate} 00:00:00`).getFullYear(), new Date(`${nextDate} 00:00:00`).getMonth() + 1]
      m.push(prevYM)
      m.push(nextYM)
      m = this.$tool.uniqueArray(m)
      m.forEach(async (item, index) => {
        const findHyitDutyDay = await this.findHyitDutyDay({
          limit: -1,
          dutyYear: item[0],
          dutyMonth: item[1],
          dutyAddressId: this.addressValue
        })
        if (findHyitDutyDay.code !== 1 && !findHyitDutyDay.data) return
        const filter = []
        findHyitDutyDay.data.forEach(el => {
          if (getdiffdate.indexOf(`${el.dutyYear}-${el.dutyMonth}-${el.dutyDay >= 10 ? el.dutyDay : '0' + el.dutyDay}`) !== -1) {
            filter.push(el)
          }
        })
        this.allDutyDayData = [...this.allDutyDayData, ...filter]
        if (index + 1 === m.length) {
          await this.generateData()
          this.setSize()
        }
      })
    },
    // 查询值班计划
    async findHyitDutyDay(query) {
      return await this.$request({
        url: this.api.opm.findHyitDutyDay,
        data: query
      })
    },
    // 生成值班表格数据
    async generateData() {
      // 按照班次类型降序排序
      this.allDutyDayData.sort(this.$tool.compareJson('dayType', 'up'))
      // 数据变量
      const dutyDay = []

      // 值班ids 去查询值班关联人员
      const dutyDayIds = []
      this.allDutyDayData.forEach(item => { dutyDayIds.push(item.id) })
      let dutyDayUser = []

      dutyDayUser = await this.$request({ url: this.api.opm.findHyitDutyDayUser, data: { limit: -1, dutyDayIds: dutyDayIds.toString() } })

      // 查询值班人员 用户信息
      const userIds = []
      let userList = []
      if (dutyDayUser.code === 1 && dutyDayUser.data) {
        dutyDayUser.data.forEach(item => userIds.push(item.userId))
      }
      if (userIds.length > 0) userList = await this.commonRequestFn.findSysUser({ ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId })

      // 遍历值班数据
      this.allDutyDayData.forEach(item => {
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

        tmp.id = item.id
        tmp.dutyDate = `${item.dutyYear}/${item.dutyMonth}/${item.dutyDay} 星期${this.$tool.dayWeek(new Date(`${item.dutyYear}/${item.dutyMonth}/${item.dutyDay}`))}`
        tmp.ymdTimestamp = new Date(`${item.dutyYear}-${item.dutyMonth}-${item.dutyDay}`).getTime()
        tmp.dayType = item.dayType
        tmp.users = getDutyDayUser
        tmp.dutyStartTime = item.dutyStartTime
        tmp.dutyEndTime = item.dutyEndTime
        tmp.dutyType = item.dutyType
        tmp.dutyAddressId = item.dutyAddressId

        dutyDay.push(tmp)
      })
      // 根据日期时间戳降序排序
      const dutyDayData = dutyDay.sort(this.$tool.compareJson('ymdTimestamp', 'up'))
      const sameDay = []
      dutyDayData.forEach(item => {
        const dayIdx = sameDay.findIndex(el => el.ymdTimestamp === item.ymdTimestamp)
        const usersText = []
        item.users.forEach(el => usersText.push(`${el.realName} ${el.tel}`))
        if (dayIdx === -1) {
          sameDay.push({
            dutyDate: item.dutyDate,
            ymdTimestamp: item.ymdTimestamp,
            children: [
              {
                dayType: item.dayType,
                users: item.users,
                id: this.$tool.guid(),
                usersText
              }
            ]
          })
        } else {
          const dayTypeIdx = sameDay[dayIdx].children.findIndex(el => +el.dayType === +item.dayType)
          if (dayTypeIdx === -1) {
            sameDay[dayIdx].children = [
              ...sameDay[dayIdx].children,
              {
                id: this.$tool.guid(),
                dayType: item.dayType,
                users: item.users,
                usersText
              }]
          } else {
            sameDay[dayIdx].children[dayTypeIdx].users = [
              ...sameDay[dayIdx].children[dayTypeIdx].users,
              ...item.users
            ]
            sameDay[dayIdx].children[dayTypeIdx].usersText = [
              ...sameDay[dayIdx].children[dayTypeIdx].usersText,
              ...usersText
            ]
          }
        }
      })
      this.dutyDayData = sameDay
    },
    findDutyAddress() {
      this.$request({
        url: this.api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_值班地点', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.dutyAddressList = res.data
          this.addressValue = res.data[0].catId
        }
        this.init()
      })
    },
    changeDutyAddress() {
      this.allDutyDayData = []
      this.init()
    }
  }
}
</script>

<style lang="scss" scoped>
.side-main {
  padding: 0 !important;
  overflow-y: auto;
  .day-item {
    font-size: 12px;
    position: relative;
    min-height: 40px;
    height: auto;
    overflow: hidden;
    .day-text {
      width: 40%;
      height: 100%;
      background: rgba(30, 90, 200, .1);
      padding: 15px;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
    }
    .day-user {
      width: 100%;
      padding: 15px 15px 15px calc(40% + 15px);
      line-height: 19px;
    }
  }
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip {
  text-align: center;
  line-height: 60px;
  font-size: 12px;
}
</style>
