<template>
  <div class="matter-table">
    <el-table v-loading="loading" :data="tableData">
      <el-table-column label="编号" type="index" width="auto" min-width="10%" />
      <el-table-column prop="name" show-overflow-tooltip width="auto" min-width="80%" label="作业名称" />

      <el-table-column label="状态" width="auto" min-width="10%" show-overflow-tooltip>
        <template slot-scope="{ row }">
          {{ row.statue === null ? '待处理' : setTaskStatue(row.statue) }}
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="tableCount > 0" :auto-scroll="false" :total.sync="tableCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getPagingTableData" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'MatterTable',
  components: {
    Pagination
  },

  data() {
    return {
      taskStatue: [
        { statue: 1, value: '处理中', color: 'warning', colorCode: '#E6A23C' },
        { statue: 2, value: '处理失败', color: 'danger', colorCode: '#F56C6C' },
        { statue: 3, value: '处理成功', color: 'success', colorCode: '#67C23A' }
      ],
      listQuery: {
        page: 1,
        limit: 10
      },
      loading: false,
      tableData: [],
      tableCount: 0,
      statue: '',
      createStime: '',
      createEtime: ''
    }
  },
  computed: {
    setTaskStatue() {
      return function(status) {
        const idx = this.taskStatue.findIndex(item => item.statue === status)
        if (idx !== -1) {
          return this.taskStatue[idx].value
        } else {
          return '未处理'
        }
      }
    }
  },
  watch: {},
  mounted() {},
  methods: {
    async initTroubleLog(val) {
      console.log(val.statue, 'val')
      this.statue = val.statue
      this.createStime = val.createStime
      this.createEtime = val.createEtime
      // console.log(query, 'qeru')
      // this.alarmLogQuery.startCLock = query?.startCLock
      this.loading = true
      const workTask = await this.findOpsOrderWorkTask({
        userId: this.$auth.getUserSession().userId,
        ...this.listQuery,
        statue: this.statue,
        createStime: this.createStime,
        createEtime: this.createEtime
      })
      this.loading = false
      if (workTask) {
        this.tableData = workTask.data
        this.tableCount = Number(workTask.count)
      }
      // await this.findZbxAlarmLog(val)
    },
    async findOpsOrderWorkTask(query) {
      const { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderWorkTask,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    getPagingTableData() {
      console.log('111')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
