<template>
  <div class="app-container">
    <el-page-header content="配置" @back="goBack" />
    <div class="filter-container">
      <el-button v-waves v-permission="['add']" class="filter-item" type="primary" icon="el-icon-plus" @click="openAddFileDialog">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" clearable placeholder="请输入名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="configureList"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="系统地址" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.esightUrl }}</span>
          </template>
        </el-table-column>
        <el-table-column label="账号" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="密码" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.pwd }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="small-padding fixed-width" width="400" align="center">
          <template slot-scope="{row}">
            <!-- <el-button type="primary" size="mini" @click="onGet(row)">查看</el-button> -->
            <el-button v-permission="['Change']" type="primary" size="mini" @click="onChange(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="primary" size="mini" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total > 0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findEsightSystemInfo" />
    </div>
    <el-dialog title="新增信息" :visible.sync="showImportFileDialog" width="35%" top="5vh">
      <el-form label-width="110px" :model="form" :rules="rules">
        <el-form-item label="名称" label-width="90px" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="系统地址" label-width="90px" prop="esightUrl">
          <el-input v-model="form.esightUrl" />
        </el-form-item>
        <el-form-item label="账号" label-width="90px" prop="userName">
          <el-input v-model="form.userName" />
        </el-form-item>
        <el-form-item label="密码" label-width="90px" prop="pwd">
          <el-input v-model="form.pwd" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportFileDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'SubSystem',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        agent: '',
        total: 0,
        keyword: ''
      },
      form: {
        name: '',
        esightUrl: '',
        userName: '',
        pwd: '',
        agent: ''
      },
      formId: '',
      configureList: [],
      showImportFileDialog: false,
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        esightUrl: [
          { required: true, message: '请输入系统地址', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.$set(this.form, 'agent', this.$route.query.id)
    this.findEsightSystemInfo()
  },
  methods: {
    // 查询列表信息
    findEsightSystemInfo() {
      request({
        url: api.esight.findEsightSystemInfo,
        data: { ...this.listQuery, agent: this.$route.query.id }
      }).then(res => {
        this.listLoading = false
        this.configureList = res.data
        console.log(this.configureList)
        this.listQuery.total = Number(res.count)
      })
    },
    // 确定
    confirm() {
      const apiType = this.formId !== '' ? api.esight.updateEsightSystemInfo : api.esight.insertEsightSystemInfo
      request({
        url: apiType,
        data: { ...this.form }
      }).then(res => {
        if (res.code === 1) {
          this.showImportFileDialog = false
          this.findEsightSystemInfo()
        }
      })
    },
    onChange(row) {
      this.formId = row.id
      this.showImportFileDialog = true
      request({
        url: api.esight.getEsightSystemInfo,
        data: { id: row.id }
      }).then(res => {
        if (res.code === 1) {
          this.form = res.model
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.findEsightSystemInfo()
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        request({
          url: api.esight.deleteEsightSystemInfo, data: { id: row.id }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findEsightSystemInfo()
          }
        })
      }).catch(res => {
        this.$message.error(res.msg)
      })
    },
    openAddFileDialog() {
      // Object.keys(this.form).forEach(key => {
      //   this.$set(this.form, `${key}`, '')
      // })
      this.formId = ''
      this.form.name = ''
      this.form.esightUrl = ''
      this.form.userName = ''
      this.form.pwd = ''
      this.showImportFileDialog = true
    },
    goBack() {
      this.$router.go(-1)
    }

  }
}
</script>
<style lang="scss" scoped>
.status-0{color: red;}
.status-1{color: green;}
.status-2{color: gray;}
.filter-container {padding-top: 14px}
</style>
