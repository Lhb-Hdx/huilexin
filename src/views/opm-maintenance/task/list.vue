<template>
  <div class="matter app-container">
    <div class="filter-container">
      <div>
        <el-form :inline="true" :model="search" class="demo-form-inline">
          <div v-permission="['search']" style="display: inline">
            <el-form-item>
              <el-select v-model="search.statue" placeholder="所有状态" clearable class="filter-item" style="width: 150px">
                <el-option v-for="item in audioStatus" :key="item.statue" :label="item.label" :value="item.statue" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="search.keyword" placeholder="关键词查询" />
            </el-form-item>
            <el-form-item>
              <el-button class="filter-item" type="primary" icon="el-icon-search" @click="findOpsOrderWorkTask">查询</el-button>
            </el-form-item>
            <ListControl :check-list="checkList" @setLists="setLists" />
          </div>
        </el-form>
      </div>
    </div>
    <div class="table-wrapper">
      <el-table :data="taskList" fit highlight-current-row style="width: 100%">
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" prop="matterName" align="left" label="关联事项" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" prop="statue" align="left" label="事项状态" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span :style="{ color: setStatueColor(row.matterstatue) }">
              {{ row.matterstatue === null ? '待确认' : setWorkStatus(row.matterstatue) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" prop="name" align="left" show-overflow-tooltip label="作业名称" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="作业状态" align="left" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span :style="{ color: setJobColor(row.statue) }">
              {{ setAudioStatus(row.statue) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" prop="workStime" align="right" show-overflow-tooltip label="作业开始时间" width="300" />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" prop="workEtime" align="right" show-overflow-tooltip label="作业结束时间" width="300" />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" prop="excessTime" align="right" label="剩余处理时间" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.excessTime }}天</template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="操作" align="left" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="skipDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-show="listQuery.total > 0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findOpsOrderWorkTask" />
    </div>
    <TaskDialog ref="taskDialog" :task-id="selectTaskId" @reload="realoadTask" @freshList="freshList" />
  </div>
</template>

<script>
// import FileUpload from '@/components/Upload/file-upload'
import TaskDialog from './components/taskDialog.vue'
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import workTaskType from '@/params-model/opm/function'
import ListControl from '@/components/ListControl'
export default {
  name: 'Matter',
  components: {
    // FileUpload
    TaskDialog,
    Pagination,
    ListControl
  },
  data() {
    return {
      findOpsOrderWorkTaskQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      listQuery: {
        total: 0,
        page: 1,
        limit: 10
      },
      loginUser: {},
      taskList: [],
      audioStatus: workTaskType.get('workTaskType'),
      // [
      //   { statue: 1, value: '处理中', color: 'warning', colorCode: '#E6A23C'},
      //   { statue: 2, value: '处理失败', color: 'danger', colorCode: '#F56C6C'},
      //   { statue: 3, value: '处理成功', color: 'success', colorCode: '#67C23A'}
      //   { statue: 1, value: '未提交', color: 'danger' },
      //   { statue: 2, value: '审核中', color: 'danger' },
      //   { statue: 3, value: '已审核', color: 'success' }
      //   { statue: 8, value: '修改', color: 'success' },
      //   { statue: 8, value: '已完成', color: 'success' },
      //   { statue: 7, value: '关闭', color: 'success' }
      // ],
      workStatus: [
        { statue: 1, value: '已确认', color: 'danger', colorCode: '#EB4C4C' },
        { statue: 2, value: '审批中', color: 'danger', colorCode: '#EB4C4C' },
        { statue: 3, value: '已审批', color: 'success', colorCode: '#3CA170' },
        { statue: 4, value: '驳回', color: 'success', colorCode: '#3CA170' },
        { statue: 5, value: '待审核', color: 'success', colorCode: '#3CA170' },
        { statue: 7, value: '关闭', color: 'success', colorCode: '#3CA170' },
        { statue: 8, value: '修改', color: 'success', colorCode: '#3CA170' }
      ],
      stateOption: [
        { label: '待提交', value: 0 },
        { label: '待确认', value: 1 },
        { label: '已确认', value: 2 },
        { label: '已关闭', value: 3 },
        { label: '已撤回', value: 4 }
      ],
      fileUrlList: [],
      search: {
        keyword: '',
        dataTime: '',
        typeText: '',
        stateText: ''
      },
      selectTaskId: '',
      // 显示控制数据 start
      checkList: ['关联事项', '事项状态', '作业名称', '作业状态', '作业开始时间', '作业结束时间', '剩余处理时间', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setAudioStatus() {
      const that = this
      return function (statue) {
        const idx = that.audioStatus.findIndex(item => Number(item.statue) === Number(statue))
        if (idx !== -1) return that.audioStatus[idx].label
      }
    },
    setWorkStatus() {
      const that = this
      return function (statue) {
        const idx = that.workStatus.findIndex(item => Number(item.statue) === Number(statue))
        if (idx !== -1) return that.workStatus[idx].value
      }
    },
    // 事项状态文字样式
    setStatueColor() {
      return function (status) {
        const idx = this.workStatus.findIndex(item => Number(item.statue) === Number(status))
        if (idx !== -1) return this.workStatus[idx].colorCode
        // return status === 1 ? '#67C23A' : '#F56C6C'
      }
    },
    setJobColor() {
      return function (status) {
        const idx = this.audioStatus.findIndex(item => Number(item.statue) === Number(status))
        if (idx !== -1) return this.audioStatus[idx].color
        // return status === 1 ? '#67C23A' : '#F56C6C'
      }
    }
  },
  mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.findOpsOrderWorkTask()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    freshList() {
      // if (this.taskList.length < 2 && this.listQuery.page > 1) this.$set(this.listQuery, 'page', --this.listQuery.page)
      this.findOpsOrderWorkTask()
      console.log('findOpsOrderWorkTask')
    },
    findOpsOrderWorkTask() {
      const findDataQuery = { ...this.listQuery }
      request({
        url: api.opm.findOpsOrderWorkTask,
        data: { ...findDataQuery, userId: this.loginUser.userId, ...this.search }
      }).then(async res => {
        if (res.code === 1) {
          this.listQuery.total = +res.count
          let ids = []
          res.data.forEach(item => {
            ids.push(item.orderProblemId)
            const ymd = this.$tool.dateFormat('YYYY-mm-dd', new Date())
            const e = item.workEtime.split(' ')
            item.excessTime = this.$tool.getDaysBetween(ymd, e[0]) < 0 ? 0 : this.$tool.getDaysBetween(ymd, e[0])
          })
          const matter = await this.findOpsOrderProblem(ids.toString())
          res.data.forEach(item => {
            // const idx = matter.findIndex(items => Number(items.id) === Number(item.orderProblemId))
            // if (idx !== -1) item.matterName = item.name
            matter.forEach(item2 => {
              if (Number(item2.id) === Number(item.orderProblemId)) {
                item.matterName = item2.name
                item.matterstatue = item2.statue
              }
            })
          })
          this.taskList = res.data
        }
      })
    },
    async findOpsOrderProblem(ids) {
      const { code, data } = await request({
        url: api.opm.findOpsOrderProblem,
        data: { limit: -1, ids }
      })
      if (code !== 1) return
      return data
    },
    handleFilter() {},
    skipDetail(val) {
      this.selectTaskId = val.id
      console.log(val)
      this.$refs.taskDialog.open(val)
    },
    realoadTask() {
      this.findOpsOrderWorkTask()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0px !important;
}
.border {
  border: 1px solid #ddd;
}
</style>
