<template>
  <div class="maintenanceView_container">
    <!-- 日历 -->
    <div class="content_time">
      <div class="Calendar_box">
        <!-- 选择日期组件 -->
        <el-calendar v-model="Calendar">
          <template slot="dateCell" slot-scope="{ data }">
            <p :class="data.isSelected ? 'is-selected' : '' ">
              {{ selectHandleDate( data) }}{{ data.isSelected ? '✔️' : '' }}
            </p>
          </template>
        </el-calendar>
      </div>
    </div>
    <!-- 工作 -->
    <div class="content_work">
      <div class="work_title flexBox space-between align-item-center">
        工作
        <el-button v-permission="['ToDutyPlan']" type="primary" size="mini" @click="toPlan">排班计划</el-button>
      </div>
      <div class="work_tabpane">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <!-- 列表1 -->
          <el-tab-pane label="事项" name="first">
            <div class="work_table_1">
              <el-table :data="tableData1" style="width: 100%">
                <el-table-column label="指定人员" align="left">
                  <template slot-scope="{row}">
                    <el-link @click="goToPersonalList(row)"> {{ row.lockUserId === null ? row.groupName : getUserName(row) }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="服务类型" align="left">
                  <template slot-scope="{row}">
                    <span> {{ getServiceType( row.serviceType ) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="事项名称" align="left">
                  <template slot-scope="{row}">
                    <el-link class="work_table_column primary" @click="goToPersonalList(row)"> {{ row.name }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="事项状态" align="left">
                  <template slot-scope="{row}">
                    <span :class="getStatusClass(row.statue)">{{ row.statue === null ? '待处理' : getWorkProgress(row.statue) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <!-- 列表2 -->
          <el-tab-pane label="作业" name="second">
            <div class="work_table_2">
              <el-table :data="tableData2" style="width: 100%">
                <el-table-column label="人员" align="left">
                  <template slot-scope="{row}">
                    <el-link @click="goToPersonalList(row,'work')">{{ getUserName2(row.userId) }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="作业名称" align="left">
                  <template slot-scope="{row}">
                    {{ row.name }}
                  </template>
                </el-table-column>
                <el-table-column label="作业描述" align="left">
                  <template slot-scope="{row}">
                    <div class="work_table_column" @click="goToPersonalList(row,'work')"> {{ row.backup }}</div>
                  </template>
                </el-table-column>

                <el-table-column label="作业状态" align="left" width="100px">
                  <template slot-scope="{row}">
                    <span :class="getStatusClass(row.statue)">{{ getWorkProgress(row.statue) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="排班" name="scheduling">
            <div class="work_table_3">
              <el-table
                :data="dutyData"
                style="width: 100%"
              >
                <el-table-column label="地点" align="left">
                  <template slot-scope="{row}">
                    {{ dutyAddress(row.dutyAddressId) }}
                  </template>
                </el-table-column>
                <el-table-column label="人员" align="left">
                  <template slot-scope="{row}">
                    {{ row.realName }} {{ row.tel }}
                  </template>
                </el-table-column>
                <el-table-column label="角色" align="left">
                  <template slot-scope="{row}">
                    {{ row.roleName }}
                  </template>
                </el-table-column>
                <el-table-column label="班次" align="left">
                  <template slot-scope="{row}">
                    {{ setDayType(row.dayType) }}
                  </template>
                </el-table-column>
              </el-table>
              <pagination v-show="dutyTotal > 0" :auto-scroll="false" :total="dutyTotal" :page.sync="findHyitDutyDayQuery.page" :limit.sync="findHyitDutyDayQuery.limit" @pagination="dutyList" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-- 分析 -->
    <div class="content_analyse">
      <div class="analys_top">
        <div class="load_title">负荷</div>
        <div class="load_table">
          <el-table :data="tableData3" style="width: 100%">
            <el-table-column label="人员" width="180" align="left">
              <template slot-scope="{row}">
                <span> {{ row.realname }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="tasknum" label="工作量" align="left" />
            <el-table-column prop="finish_tasknum" label="已完成" align="left" />
            <el-table-column prop="working_tasknum" label="在处理" align="left" />
          </el-table>
        </div>
      </div>
      <!-- 饼图 -->
      <div class="analys_dow">
        <div class="analysisChart_title">分析</div>
        <div class="analysisChart_Echart">
          <div id="newAnalyseEchartsObj" ref="newAnalyseEchartsObj" class="Echart_box" />
          <div id="newAnalyseEchartsObj2" ref="newAnalyseEchartsObj2" class="Echart_box" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'MaintenanceView',
  components: {
    Pagination
  },
  data() {
    return {
      Calendar: new Date(), // 日历
      activeName: 'first', // 工作--表头选择
      tirme: null,
      WorkerLogList: {
        workTime: '',
        // orderType: 1,
        createTime: '',
        limit: -1
      },
      serviceType: 0, // 服务类型
      ServerTypeList: [], // 服务类型列表
      workLog: [],
      orderIds: [], // 查询事项的ids
      userIds: [], // 查询用户的ids
      problemUserList: [],
      workUserList: [],
      subTypes: [],
      tableData1: [{
        realName: '',
        catName: '',
        workLog: ''
      }], // 工作--事项
      taskNameList: [
        { value: 0, name: '已完成', cnum: null },
        { value: 1, name: '处理中', cnum: null }
      ],
      tableData2: [], // 工作--作业
      tableData3: [], // 工作--负荷
      ProblemRealName: [], // 事项列表人员
      WorkTaskRealName: [], // 作业列表人员
      servicecountList: [], // 分析数据
      serviceAnalyzeTitle: [], // 分析数据标题
      serviceAnalyzeResult: [], // 分析数据所占数值
      taskProcessCount: [],
      // 值班
      dutyData: [],
      findHyitDutyDayQuery: {
        page: 1,
        limit: 10,
        dutyYear: '',
        dutyMonth: '',
        dutyDay: ''
      },
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      taskStatue: [
        { statue: 1, value: '处理中', color: 'warning', colorCode: '#E6A23C' },
        { statue: 2, value: '处理失败', color: 'danger', colorCode: '#EB4C4C' },
        { statue: 3, value: '处理成功', color: 'success', colorCode: '#3CA170' }
      ],
      dutyAddressList: [],
      dutyTotal: 0
    }
  },
  computed: {
    /* 日历的计算 */
    selectHandleDate() {
      return function(data) {
        let newData = data.day.split('-').slice(2).join('-')
        let DATE = data.isSelected ? 1 : ''
        if (DATE === 1) {
          this.WorkerLogList.workTime = data.day// 将选择的新时间赋值给查询接口参数
          this.WorkerLogList.createTime = data.day// 将选择的新时间赋值给查询接口参数
          this.findOpsOrderProblem()
          this.findOpsOrderWorkTask()
          const dateObject = new Date(data.day)
          this.$set(this.findHyitDutyDayQuery, 'dutyYear', dateObject.getFullYear())
          this.$set(this.findHyitDutyDayQuery, 'dutyMonth', dateObject.getMonth() + 1)
          this.$set(this.findHyitDutyDayQuery, 'dutyDay', dateObject.getDate())
          this.dutyList()
        }
        return newData
      }
    },
    // 登录用户
    userInfo() {
      const userInfo = this.localStorageOperation('get', 'userInfo')
      return userInfo
    },
    // 状态
    getWorkProgress() {
      return function(statue) {
        const statusObj = this.taskStatue
        const idx = statusObj.findIndex(item => item.statue === statue)
        if (idx !== -1) return statusObj[idx].value
        return '待处理'
      }
    },
    getStatusClass() {
      return function(stateValue) {
        const statusObj = this.taskStatue
        const idx = statusObj.findIndex(item => Number(item.statue) === Number(stateValue))
        if (idx !== -1) return statusObj[idx].color
        return 'info'
      }
    },
    // 事项人员
    getUserName() {
      return function(row) {
        const arr = this.problemUserList
        if (row?.lockUserId) {
          const uidx = arr.findIndex(u => Number(u.userId) === Number(row.lockUserId))
          return uidx !== -1 ? arr[uidx].realName : ''
        }
        return ''
      }
    },
    // 作业提交人
    getUserName2() {
      return function(userId) {
        const uidx = this.workUserList.findIndex(u => Number(u.userId) === Number(userId))
        return uidx !== -1 ? this.workUserList[uidx].realName : ''
      }
    },
    // 事项服务类型
    getServiceType() {
      return function(serviceType) {
        const tidx = this.subTypes.findIndex(t => Number(t.serviceId) === Number(serviceType))
        return tidx !== -1 ? this.subTypes[tidx].serviceName : ''
      }
    },
    // 值班地点
    dutyAddress() {
      return function(dutyAddressId) {
        const idx = this.dutyAddressList.findIndex(item => +item.catId === dutyAddressId)
        return idx !== -1 ? this.dutyAddressList[idx].catName : ''
      }
    },
    // 值班班次类型
    setDayType() {
      return function(dayType) {
        const idx = this.dayType.findIndex(item => +item.value === dayType)
        return idx !== -1 ? this.dayType[idx].label : ''
      }
    }
  },
  watch: {
    WorkerLogList: {
      deep: true,
      handler(newVal, oldVal) {
        /* 触发防抖 */
        this.unShake(
          this.findOpsOrderWorkLogLoadCount, // 负荷
          this.findOpsOrderWorkLogAnalyzeCount // 分析
        )
      }
    }
  },
  mounted() {
    this.getEcharts1()
    this.getEcharts2()
    this.findSysCatByDutyAddress()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandlePieOne)
    window.removeEventListener('resize', this.resizeHandlePieTow)
    this.newAnalyseEchartsObj.dispose()
    this.newAnalyseEchartsObj2.dispose()
  },
  methods: {
    // 运维用户
    async findSysUser(val) {
      const {data, code} = await request({ url: api.opm.findSysUser, data: {imit: -1, ids: val, companyId: this.$auth.getUserSession().companyId} })
      if (code === 1 && data.length > 0) {
        return data
      }
    },
    // 服务类型
    async findSysCatServeType(ids) {
      let { code, data } = await request({ url: api.opm.findOpsOrderProblemService, data: { limit: -1, ids: ids } })
      if (code !== 1) return
      this.subTypes = data
      return data
    },
    // 分组关联事项
    async findOpsOrderProblemGroupMap(query) {
      const { code, data, count } = await this.$request({ url: this.api.opm.findOpsOrderProblemGroupMap, data: query })
      if (code !== 1) return
      return { data, count }
    },
    // 查询运维小组
    async findHrUserGroup(query) {
      let { code, data, count } = await this.$request({ url: this.api.sys.findHrUserGroup, data: query })
      if (code !== 1) return
      return { data, count }
    },
    /* 获取全部事项|工作数据 */
    findOpsOrderProblem() {
      request({ url: api.opm.findOpsOrderProblem, data: this.WorkerLogList }).then(async res => {
        if (res.code === 1) {
          let ids = []
          let pids = []
          let groupId = []
          let opmGroup = []
          let lockUserId = []
          let problemIds = []

          res.data.map(i => {
            ids.push(i.userId)
            pids.push(i.serviceType)
            problemIds.push(i.id)
            if (i?.lockUserId) {
              lockUserId.push(i.lockUserId)
            }
          })
          // 服务类型
          const serveTypeArry = await this.findSysCatServeType(pids)
          serveTypeArry.map(itemS => {
            if (itemS?.groupId) {
              groupId.push(itemS.groupId)
            }
          })
          const UserList = await this.findSysUser(lockUserId)
          this.problemUserList = UserList

          // 指定运维小组
          const ProblemGroupMap = await this.findOpsOrderProblemGroupMap({ problemIds: problemIds, limit: -1 })
          const findHrUserGroup = await this.findHrUserGroup({ ids: groupId, limie: -1 })
          if (findHrUserGroup && findHrUserGroup.data && findHrUserGroup.data.length > 0) opmGroup = findHrUserGroup.data

          if (ProblemGroupMap && ProblemGroupMap.data && ProblemGroupMap.data.length > 0) {
            let opmGroupFilter = []
            res.data.map(item => {
              const ProblemGroupMapFilter = ProblemGroupMap.data.filter(el => +el.problemId === +item.id)
              ProblemGroupMapFilter.map(itemP => {
                opmGroupFilter = opmGroup.filter(el => +el.groupId === +itemP.groupId)
              })
              opmGroupFilter.forEach(items => {
                item.groupName = items.groupName
              })
            })
          }

          // 事项列表赋值
          this.tableData1 = res.data
        }
      })
    },
    async findOpsOrderWorkTask() {
      request({ url: api.opm.findOpsOrderWorkTask, data: this.WorkerLogList }).then(async res => {
        if (res.code === 1) {
          this.tableData2 = res.data
          let ids = []
          res.data.map(i => {
            ids.push(i.userId)
          })
          const UserList = await this.findSysUser(ids)
          this.workUserList = UserList
        }
      })
    },
    // 切换--事项|作业
    handleClick() {
      if (this.activeName === 'first') {
        this.WorkerLogList.orderType = 1
        this.findOpsOrderProblem()
      } else {
        this.WorkerLogList.orderType = 2
        this.findOpsOrderWorkTask()
      }
    },
    /* 跳转到员详情界面 */
    goToPersonalList(row, str) {
      let DATE = this.WorkerLogList.workTime
      const userId = str === 'work' ? row.userId : row.lockUserId
      this.$router.push({
        name: 'personalList',
        query: {
          userId,
          date: DATE,
          gochild: true
        }
      })
    },
    // 获取负荷数据
    findOpsOrderWorkLogLoadCount() {
      let DATA = this.WorkerLogList
      request({ url: api.opm.findOpsOrderWorkLogLoadCount, data: DATA }).then(res => {
        if (res.code === 1) {
          this.tableData3 = res.map.loadcount
        } else {
          this.tableData3 = []
        }
      })
    },
    // 获取分析数据
    findOpsOrderWorkLogAnalyzeCount() {
      let DATA = this.WorkerLogList
      request({ url: api.opm.findOpsOrderWorkLogAnalyzeCount, data: DATA}).then(res => {
        if (res.code === 1) {
          this.servicecountList = res.map.servicecount
          this.taskProcessCount = res.map.task_process_count
          this.getTitleList()
        }
      })
    },
    // 获取分析数据title、value
    getTitleList() {
      let titleTmp = []
      let titleTmp2 = []
      let resultTmp = []
      let taskPCount = []
      this.servicecountList.forEach(item => {
        if (item['serviceName'] !== '') {
          titleTmp.push(item['serviceName'])
        }
        if (item['cnum'] !== '' && item['serviceName'] !== '') {
          resultTmp.push({
            value: item['cnum'],
            name: item['serviceName']
          })
        }
      })

      /* getEcharts :title、value */
      if (titleTmp.length > 0 && resultTmp.length > 0) {
        this.serviceAnalyzeTitle = titleTmp
        this.serviceAnalyzeResult = resultTmp
      }
      /* getEcharts2 :title、value */
      for (let key in this.taskProcessCount) {
        taskPCount.push({
          value: this.taskProcessCount[key]
        })
      }
      /* getEcharts2:titil */
      for (let index = 0; index < taskPCount.length; index++) {
        const element = taskPCount[index]
        for (let itemR of this.taskNameList) {
          titleTmp2.push(itemR.name)
          if (index === itemR.value) {
            element.name = itemR.name
          }
        }
      }

      if (titleTmp2.length > 0 && taskPCount.length > 0) {
        this.serviceAnalyzeTitle2 = titleTmp2
        this.serviceAnalyzeResult2 = taskPCount
      }
      /* 调用图像函数 */
      this.getEcharts1()
      this.getEcharts2()
    },
    // 分析--饼图1
    getEcharts1() {
      this.newAnalyseEchartsObj = echarts.init(document.getElementById('newAnalyseEchartsObj'))

      this.newAnalyseEchartsObj.setOption({
        // color: ['#ffc626', '#00ae7f', '#0145ab', '#ff9326', '#ae2900'],
        color: ['#ffc626', '#00ae7f', '#0145ab', '#ff9326', '#ae2900', '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          data: this.serviceAnalyzeTitle.length !== 0 ? this.serviceAnalyzeTitle : [
            '暂无数据'
          ] // 动态数据
        },
        series: [
          {
            name: '服务类型占比',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['24%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: ' {b}: {d}% '
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16' // 中间文字
              }
            },
            labelLine: {
              show: false
            },
            data: this.serviceAnalyzeResult.length !== 0 ? this.serviceAnalyzeResult : [
              { value: 0, name: '暂无数据' }
            ]// 动态数据
          }
        ]
      })
      window.addEventListener('resize', () => {
        this.resizeHandlePieOne()
      })
    },
    resizeHandlePieOne() {
      if (this.newAnalyseEchartsObj) {
        this.newAnalyseEchartsObj.resize()
      }
    },
    // 分析--饼图2
    getEcharts2() {
      this.newAnalyseEchartsObj2 = echarts.init(document.getElementById('newAnalyseEchartsObj2'))
      this.newAnalyseEchartsObj2.setOption({
        color: ['#00ae7f', '#0145ab'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          top: 'center',
          right: '16%',
          orient: 'vertical',
          data: this.serviceAnalyzeTitle2 // 动态数据
        },
        series: [
          {
            name: '工作进度占比',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['24%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: ' {b}: {d}% '
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16' // 中间文字
              }
            },
            labelLine: {
              show: false
            },
            data: this.serviceAnalyzeResult2 // 动态数据
          }
        ]
      })
      window.addEventListener('resize', () => {
        this.resizeHandlePieTow()
      })
    },
    resizeHandlePieTow() {
      if (this.newAnalyseEchartsObj2) {
        this.newAnalyseEchartsObj2.resize()
      }
    },
    /* 防抖函数 */
    unShake(func1, func2, time = 500) {
      if (this.tirme) { clearTimeout(this.tirme) }
      this.tirme = setTimeout(() => {
        func1()
        func2()
      }, time)
    },
    // 进入排班计划
    toPlan() {
      this.$router.push({
        name: 'SchedulingPlan'
      })
    },
    // 获取值班地点
    findSysCatByDutyAddress() {
      this.$request({
        url: this.api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_值班地点', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.dutyAddressList = res.data
        }
      })
    },
    // 值班列表
    async dutyList() {
      const dutyData = []
      const dutyList = await this.$request({ url: this.api.opm.findHyitDutyDay, data: this.findHyitDutyDayQuery })
      if (dutyList.data.length === 0) return
      this.dutyTotal = +dutyList.count
      const dutyDayIds = []
      dutyList.data.forEach(item => dutyDayIds.push(item.id))
      const dutyDayUserList = await this.$request({ url: this.api.opm.findHyitDutyDayUser, data: { limit: -1, dutyDayIds: dutyDayIds.toString() } })
      if (dutyDayUserList.data.length > 0) {
        const userIds = []
        let userList = []
        let userRoleList = []
        if (dutyDayUserList.code === 1 && dutyDayUserList.data) dutyDayUserList.data.forEach(item => userIds.push(item.userId))
        if (userIds.length > 0) {
          userList = await this.commonRequestFn.findSysUser({ ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId })
          userRoleList = await this.$request({ url: this.api.sys.findRoleByUser, data: { limit: -1, userId: this.$tool.uniqueArray(userIds).toString() } })
        }
        if (userRoleList?.data) {
          dutyDayUserList.data.forEach(item => {
            const tmp = {}
            const getUserIndex = userList.findIndex(items => +items.userId === +item.userId)
            const getDutyIndex = dutyList.data.findIndex(items => +items.id === +item.dutyDayId)
            const getRoleIndex = userRoleList.data.findIndex(items => +items.userId === +item.userId)
            if (getUserIndex !== -1) {
              tmp.userId = userList[getUserIndex].userId
              tmp.realName = userList[getUserIndex].realName
              tmp.tel = userList[getUserIndex].tel
            }
            if (getDutyIndex !== -1) {
              tmp.dutyAddressId = dutyList.data[getDutyIndex].dutyAddressId
              tmp.dayType = dutyList.data[getDutyIndex].dayType
            }
            if (getRoleIndex !== -1) {
              tmp.roleName = userRoleList.data[getRoleIndex].roleName
            }
            dutyData.push(tmp)
          })
          this.dutyData = dutyData
        }
      }
    }
  }
}
</script>

<style >
.el-calendar-table .el-calendar-day{
  height: 45px;
}
.el-calendar-table tr:last-child{
  display: none;
}
/* 日历单元格鼠标经过背景色 */
.el-calendar-table .el-calendar-day:hover {
  background-color: #00ae7f;
}
</style>

<style lang="scss" scoped>
.is-selected {
  color: #1989FA;
}
.maintenanceView_container{
  padding: 10px;
  display: flex;
  justify-content: flex-start;
  // background-color: #bfc1c4;
  height: 100vh;
  .content_time{
    display: flex;
    width: 320px;
    max-height: 400px;
    border: 1px solid rgb(240, 240, 240);
    border-radius: 4px;
    background-color:white;
    .Calendar_box{
      display: flex;
    }
  }
  .content_work{
    flex: 1;
    margin: 0px 10px;
    max-height: 90%;
    overflow-y: auto;
    border: 1px solid rgb(240, 240, 240);
    border-radius: 4px;
    background-color:white;
    .work_title{
      padding: 10px;
      font-size: 15px;
      color: rgb(35, 35, 36);
      font-weight: 600;
      line-height: 14px;
      border-radius: 4px 4px 0 0 ;
      background-color: rgb(240, 240, 240);
    }
    .work_tabpane{
      padding: 0 10px 0 10px;
      .work_table_1{
        .work_table_column{
            color: rgb(9, 109, 192);
            font-weight: 600;
        }
      }
    }
  }
  .el-calendar ::v-deep .el-calendar__body {
    padding: 10px;
  }
  .content_analyse{
    width: 30%;

    .analys_top{
      max-height: 365px;
      overflow-y: auto;
      border: 1px solid rgb(240, 240, 240);
      border-radius: 4px;
      background-color:white;
      margin-bottom: 10px;
      .load_title{
        padding: 10px;
        font-size: 15px;
        color: rgb(35, 35, 36);
        border-radius: 4px 4px 0 0 ;
        font-weight: 600;
        line-height: 14px;
        background-color: rgb(240, 240, 240);
      }
      .load_table{
        margin: 10px ;
      }
    }
    .analys_dow{
      border: 1px solid rgb(240, 240, 240);
      border-radius: 4px;
      background-color:white;
      .analysisChart_title{
        padding: 10px;
        font-size: 15px;
        color: rgb(35, 35, 36);
        border-radius: 4px 4px 0 0 ;
        font-weight: 600;
        line-height: 14px;
        background-color: rgb(240, 240, 240);
      }
      .analysisChart_Echart{
        padding: 10px;
        text-align: center;
        .Echart_box{
          width: 100%;
          min-height: 240px;
          // height: 200px;
        }
      }
    }
  }
}

</style>
