<template>
  <div class="strategy">
    <div class="strategy_header">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="toAddModal">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="" style="width: 200px;margin: 0 20px;" class="filter-item" @keyup.enter.native="onFilter" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="onFilter">查询</el-button>
    </div>
    <div class="strategy_table">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="NO" type="index" width="200px" />
        <el-table-column prop="hyTname" label="模板名称" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onFilter" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  components: { Pagination },
  data() {
    return {
      total: 0,
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      tableData: [],
      showTimePlanModal: false,
      addOrEdit: '',
      timePlanList: [
        {
          value: 1,
          text: '星期一'
        },
        {
          value: 2,
          text: '星期二'
        },
        {
          value: 3,
          text: '星期三'
        },
        {
          value: 4,
          text: '星期四'
        },
        {
          value: 5,
          text: '星期五'
        },
        {
          value: 6,
          text: '星期六'
        },
        {
          value: 7,
          text: '星期天'
        }
      ],
      hyitTimeParam: {
        tname: ''
      },
      formLabelWidth: ''
    }
  },
  mounted() {
    console.log(this.$route.name, 'this.$route.name')
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.onFilter()
  },
  methods: {
    // 查询
    onFilter() {
      const _this = this
      request({
        url: api.video.findHyitTime,
        data: { ...this.listQuery }
      })
        .then(res => {
          if (res.code === 1) {
            _this.total = Number(res.count)
            _this.tableData = res.data
          }
        })
    },
    // 删除
    onDelete(row) {
      const _this = this
      _this.$confirm('是否删除该时间模板？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteHyitTime,
          data: { hyTid: row.hyTid }
        })
          .then(res => {
            if (res.code === 1) {
              this.onFilter()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      }).catch(() => {
        _this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 编辑
    onEdit(val) {
      // 记录跳转前的页数
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TimeTelUpdate',
        query: {
          id: val.hyTid
        }
      })
    },
    changeStatus(val) {
      console.log(val, '000')
    },
    toAddModal() {
      this.$router.push({
        name: 'TimeTelAdd'
      })
    }
  }
}
</script>

<style lang='scss'>
.strategy {
  padding: 10px;
  &_header {
    margin-bottom: 20px;
  }
}
</style>
