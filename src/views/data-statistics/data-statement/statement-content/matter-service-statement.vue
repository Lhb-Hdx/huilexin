<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-cascader v-model="value" :options="classifyList" class="filter-item" placeholder="请选择服务类型" clearable @change="handleChange" />
      <el-select v-model="listQuery.groupId" placeholder="运维小组" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in groupIdList" :key="item.groupId" :label="item.groupName" :value="item.groupId" />
      </el-select>
      <el-date-picker v-model="listQuery.solveEtime" class="filter-item" type="date" placeholder="响应时间" value-format="yyyy-MM-dd" style="width: 200px" />

      <el-select v-model="listQuery.processState" class="filter-item" clearable placeholder="选择事项状态">
        <el-option v-for="item in stateCatData" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>

      <el-date-picker v-model="listQuery.sTime" class="filter-item" type="date" placeholder="开始时间" value-format="yyyy-MM-dd" style="width: 200px" />
      <el-button class="filter-item" type="primary" @click="search">搜索</el-button>
      <OutputExcel ref="outputExcel" @submitQuery="submitQuery" />
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table :data="statement" fit highlight-current-row style="width: 100%">
        <el-table-column label="序号" prop="hyKnowId" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="事项名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="服务类型" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>{{ `${row.problemTypeName ? row.problemTypeName + '/' : ''}` }} {{ `${row.serviceTypeName ? row.serviceTypeName : ''}` }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="提交时间" prop="createTime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="运维小组" prop="groupName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="响应时间" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div>
              {{ getSolveEtimeTime(row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" prop="statue" label="事项状态" width="auto" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <!-- setStatue(row.statue) -->
            <!-- <span :style="{ color: setStatue(row.statue) }"> -->
            <!-- {{ row.statue === null ? '待确认' : setAudioStatus(row.processState) }} -->
            <!-- </span> -->
            <span>{{ row.processStateName }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="generateStatement" />
    </div>
  </div>
</template>
<script>
import ProjectTab from '../../components/data-statement/project-tab'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import OutputExcel from '@/components/outputExcel'
import ListControl from '@/components/ListControl'

export default {
  name: 'MatterServiceStatement',
  components: {
    ProjectTab,
    Pagination,
    OutputExcel,
    ListControl
  },
  data() {
    return {
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '处理中', value: 1, color: 'grey' },
        { label: '待确认', value: 4, color: 'green' },
        { label: '待安排', value: 5, color: 'grey' },
        { label: '成功处理', value: 2, color: 'grey' },
        { label: '处理失败', value: 3, color: 'grey' }
      ],
      value: [],
      groupIdList: [],
      classifyList: [],
      netSegmentList: [],
      audioStatus: [
        // { statue: 1, value: '未提交', color: 'danger' },
        { statue: 0, value: '待受理', color: 'danger', colorCode: '#F56C6C' },
        { statue: 1, value: '已确认', color: 'danger', colorCode: '#F56C6C' },
        { statue: 2, value: '审批中', color: 'danger', colorCode: '#F56C6C' },
        // { statue: 3, value: '待确认', color: 'success', colorCode: '#67C23A' },
        { statue: 3, value: '已审批', color: 'success', colorCode: '#67C23A' },
        { statue: 4, value: '驳回', color: 'danger', colorCode: '#F56C6C' },
        { statue: 5, value: '待审核', color: 'success', colorCode: '#67C23A' },
        { statue: 7, value: '关闭', color: 'success', colorCode: '#67C23A' },
        { statue: 8, value: '修改', color: 'success', colorCode: '#67C23A' }
      ],
      agentList: [],
      listQuery: {
        page: 1,
        limit: 10,
        status: '',
        sTime: '',
        problemType: '',
        keyword: '',
        serviceType: ''
      },
      statement: [],
      listTotal: 0,
      ipDeviceAgent: [],
      opsDeviceType: [],
      itDeviceType: [],
      videoType: [],
      useStatue: [
        { value: 1, label: '已用', class: 'success' },
        { value: 2, label: '可用', class: 'warning' },
        { value: 3, label: '禁用', class: 'info' }
      ],
      pingStatue: [
        { value: 1, label: '在线', class: 'success' },
        { value: 2, label: '离线', class: 'danger' },
        { value: 3, label: '未连接', class: 'info' }
      ],
      useType: [
        { value: 1, label: '已用' },
        { value: 2, label: '可用' },
        { value: 3, label: '禁用' }
      ],
      connectionType: [
        { value: 1, label: '在线' },
        { value: 2, label: '离线' }
      ],
      pingStatueList: [
        { value: 1, label: '连接' },
        { value: 0, label: '未连接' }
      ],
      activeName: '',
      // 显示控制数据 start
      checkList: ['事项名称', '服务类型', '提交时间', '运维小组', '响应时间', '事项状态'],
      lists: [],
      storageVal: 'event-service-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  computed: {
    getSolveEtimeTime() {
      return function(row) {
        let createTimeStamp = this.$tool.getTimeF(row.createTime)
        let solveEtimeTimeStamp = this.$tool.getTimeF(row.solveEtime)
        let result = solveEtimeTimeStamp - createTimeStamp
        if (result / 3600 <= 1) {
          return (result / 60).toFixed(0) + '分钟'
        } else if (result / 3600 > 1 && result / (3600 * 24) <= 1) {
          let left = result % 3600

          return (result / 3600).toFixed(0) + '小时' + (left / 60).toFixed(0) + '分'
        } else {
          return row.solveEtime
        }
      }
    },
    // 事项状态文字样式
    setStatue() {
      return function(status) {
        const idx = this.audioStatus.findIndex(item => Number(item.statue) === Number(status))
        if (idx !== -1) return this.audioStatus[idx].colorCode
        // return status === 1 ? '#67C23A' : '#F56C6C'
      }
    }
  },
  async mounted() {
    // this.findOpsOrderProblem()
    await this.findOpsOrderProblemService()
    const groupIdList = await this.findHrUserGroup({ limit: -1 })
    this.groupIdList = groupIdList.data
  },

  methods: {
    setLists(val) {
      this.lists = val
    },
    async handleClick(val) {
      // this.agents = val.agent
      this.activeName = val.id
      this.$set(this.listQuery, 'agents', val.agent.toString())
      this.generateStatement()
    },
    async findOpsOrderProblemService() {
      const { data, code } = await request({ url: api.opm.findOpsOrderProblemService, data: { pid: -1 } })
      if (code !== -1) {
        const pids = []
        if (data.length > 0) {
          data.forEach(item => {
            pids.push(item.serviceId)
          })

          const childrenData = await this.findOpsOrderProblemService2({ pids })
          this.classifyList = data.map(item => {
            return { value: item.serviceId, label: item.serviceName }
          })

          if (childrenData.data.length > 0) {
            this.classifyList.forEach((item, index) => {
              const filterChhildren = childrenData.data.filter(v => v.pid === item.value)
              filterChhildren.map(item => {
                return { value: item.serviceId, label: item.serviceName }
              })
              if (filterChhildren.length > 0) {
                const mapChildrenData = filterChhildren.map(item => {
                  return { value: item.serviceId, label: item.serviceName }
                })
                this.$set(this.classifyList[index], 'children', mapChildrenData)
              }
            })
          }
        }

        // this.classifyList = data.map(item => {
        //   return { value: item.serviceId, label: item.serviceName }
        // })
        // for (let index = 0; index < this.classifyList.length; index++) {
        //   const problemService = await this.findOpsOrderProblemService2({ pid: this.classifyList[index].value })
        //   if (problemService) {
        //     let children = problemService.data.map(item => {
        //       return { value: item.serviceId, label: item.serviceName }
        //     })
        //     this.$set(this.classifyList[index], 'children', children)
        //   }
        // }
        // console.log(this.classifyList, 'ss')
      }
    },

    async search() {
      this.$set(this.listQuery, 'page', 1)

      await this.generateStatement()
    },
    async handleChange(value) {
      console.log(value)
      this.listQuery.problemType = value[0]
      this.listQuery.serviceType = value[1]
    },
    async generateStatement() {
      const findOpsOrderProblem = await this.getDataSource(this.listQuery.page, this.listQuery.limit)
      if (findOpsOrderProblem.code !== 1) return
      console.log(findOpsOrderProblem, 'findOpsOrderProblem')
      this.statement = findOpsOrderProblem.data
      this.listTotal = +findOpsOrderProblem.count
      // this.statement = findOpsOrderProblem.data
      // this.listTotal = +findOpsOrderProblem.count
    },

    async findOpsOrderProblem(listQuery) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: { ...listQuery }
      })
      if (code !== 1) return
      return { data, count, code }
    },
    // 查询服务类型
    async findOpsOrderProblemService2(query) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblemService,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 分组关联事项
    async findOpsOrderProblemGroupMap(query) {
      const { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblemGroupMap,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询运维小组
    async findHrUserGroup(query) {
      let { code, data, count } = await this.$request({
        url: this.api.sys.findHrUserGroup,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    /**
     * @description 获取主表数据
     * @param page 页码
     * @param limit 条数，全部则传-1
     */

    async getDataSource(page, limit) {
      const listQuery = { ...this.listQuery }
      if (limit === -1) {
        listQuery.page = 1
        listQuery.limit = -1
      } else {
        listQuery.page = page
        listQuery.limit = limit
      }
      const problemIds = []
      if (this.listQuery.groupId) {
        const OrderProblemGroupMap = await this.findOpsOrderProblemGroupMap({ groupId: listQuery.groupId })
        if (OrderProblemGroupMap.data.length > 0) {
          OrderProblemGroupMap.data.forEach(item => {
            problemIds.push(item.problemId)
          })
          listQuery.ids = this.$tool.uniqueArray(problemIds)
        }
      }
      if (this.listQuery.sTime) {
        listQuery.sTime = `${this.listQuery.sTime} 00:00:00`
        listQuery.eTime = `${this.listQuery.sTime} 23:59:59`
      }
      const findHyitAgentGroupAuth = await this.findHyitAgentGroupAuth({ groupId: this.activeName })
      if (!findHyitAgentGroupAuth) return

      const roleIds = []
      findHyitAgentGroupAuth.forEach(item => roleIds.push(item.roleId))
      if (roleIds.length === 0) return
      let roleListQuery = {page: 1, limit: -1}
      const user = await this.findSysUserRole({ roleIds: roleIds.toString(), ...roleListQuery })
      if (user.code !== 1) return

      const userIds = []
      user.data.forEach(item => userIds.push(item.userId))
      if (userIds.length === 0) return

      listQuery.userIds = userIds
      const findOpsOrderProblem = await this.findOpsOrderProblem(listQuery)
      if (findOpsOrderProblem.code !== 1) return
      const serviceTypeIds = []
      const orderProblemIds = []
      const groupIds = []
      if (findOpsOrderProblem.data.length > 0) {
        findOpsOrderProblem.data.forEach(item => {
          if (item.serviceType) serviceTypeIds.push(item.serviceType)
          if (item.problemType) serviceTypeIds.push(item.problemType)
          orderProblemIds.push(item.id)
        })
        let serviceType = []
        const findOpsOrderProblemService = await this.findOpsOrderProblemService2({ ids: this.$tool.uniqueArray(serviceTypeIds).toString(), limit: -1 })
        if (findOpsOrderProblemService && findOpsOrderProblemService.data && findOpsOrderProblemService.data.length > 0) serviceType = findOpsOrderProblemService.data

        // 查询事项关联分组
        let opmGroup = []
        const findOpsOrderProblemGroupMap = await this.findOpsOrderProblemGroupMap({ problemIds: orderProblemIds, limit: -1 })
        if (findOpsOrderProblemGroupMap && findOpsOrderProblemGroupMap.data && findOpsOrderProblemGroupMap.data.length > 0) {
          const findHrUserGroup = await this.findHrUserGroup({ ids: this.$tool.uniqueArray(groupIds).toString(), limie: -1 })
          if (findHrUserGroup && findHrUserGroup.data && findHrUserGroup.data.length > 0) opmGroup = findHrUserGroup.data
        }

        findOpsOrderProblem.data.forEach(item => {
          const getProblemTypeNameIndex = serviceType.findIndex(items => +items.serviceId === +item.problemType)
          if (getProblemTypeNameIndex !== -1) item.problemTypeName = serviceType[getProblemTypeNameIndex].serviceName

          const getServiceTypeNameIndex = serviceType.findIndex(items => +items.serviceId === +item.serviceType)
          if (getServiceTypeNameIndex !== -1) {
            item.serviceTypeName = serviceType[getServiceTypeNameIndex].serviceName
          }
          item.problemTypeNameAndserviceTypeName = ''
          if (getServiceTypeNameIndex !== -1 && getProblemTypeNameIndex !== -1) {
            item.problemTypeNameAndserviceTypeName = serviceType[getProblemTypeNameIndex].serviceName + '/' + serviceType[getServiceTypeNameIndex].serviceName
          }
          item.processStateName = ''
          const processStateName = this.setProcessStateStatus(item.processState)
          if (processStateName) {
            item.processStateName = processStateName
          }
          // 设置运维小组
          if (findOpsOrderProblemGroupMap && findOpsOrderProblemGroupMap.data && findOpsOrderProblemGroupMap.data.length > 0) {
            const findOpsOrderProblemGroupMapFilter = findOpsOrderProblemGroupMap.data.filter(el => +el.problemId === +item.id)
            if (findOpsOrderProblemGroupMapFilter.length > 0) {
              const groupName = []
              let opmGroupFilter = []
              findOpsOrderProblemGroupMapFilter.forEach(items => {
                opmGroupFilter = opmGroup.filter(el => +el.groupId === +items.groupId)
              })
              opmGroupFilter.forEach(items => {
                groupName.push(items.groupName)
              })
              item.groupName = groupName.toString()
            }
          }
        })
      }
      return findOpsOrderProblem
    },
    // async getDataSource2() {
    //   const OrderProblemGroupMap = await this.findOpsOrderProblemGroupMap({ groupId: this.listQuery.groupId })
    //   if (OrderProblemGroupMap.data.length > 0) {
    //     const problemIds = []
    //     OrderProblemGroupMap.data.forEach(item => {
    //       problemIds.push(item.problemId)
    //     })
    //     await this.findOpsOrderProblem({ ids: this.$tool.uniqueArray(problemIds), ...this.listQuery })
    //   }
    // },
    async findHyitAgentGroupAuth(query) {
      const { code, data } = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroupAuth,
        data: query
      })
      if (code !== 1) return
      return data
    },
    setProcessStateStatus(processState) {
      const idx = this.stateCatData.findIndex(item => Number(item.value) === Number(processState))
      if (idx !== -1) return this.stateCatData[idx].label
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
      console.log(data)
      const excelTitle = [
        {
          title: '事项名称',
          dataIndex: 'name'
        },
        {
          title: '服务类型',
          dataIndex: 'problemTypeNameAndserviceTypeName'
        },
        {
          title: '提交时间',
          dataIndex: 'createTime'
        },
        {
          title: '运维小组',
          dataIndex: 'groupName'
        },
        {
          title: '响应时间',
          dataIndex: 'solveEtime'
        },
        {
          title: '事项状态',
          dataIndex: 'processStateName'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data.data)
    },
    async findSysUserRole(query) {
      return await this.$request({
        url: this.api.sys.findSysUserRole,
        data: query
      })
    }
  }
}
</script>
<style scoped lang="scss">
.filter-container {
  display: flex;
  align-items: center;
}
</style>
