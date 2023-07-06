<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <el-input v-model="findQuery.name" v-permission="['Search']" placeholder="请输入白名单名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="NO" prop="id" type="index" width="120" />
        <el-table-column label="白名单名称" prop="name" />
        <el-table-column label="脚本" prop="script" />
        <el-table-column label="操作" width="250" class-name="small-padding fixed-width">
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
    <el-pagination
      background
      :current-page.sync="findQuery.page"
      :page-sizes="[10, 20, 30, 50, 100, 200, 300, 500]"
      :page-size="findQuery.limit"
      layout="total,sizes, prev, pager, next, jumper"
      :total="findQuery.total"
      class="mt-10"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="白名单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入白名单名称" />
        </el-form-item>
        <el-form-item label="脚本" prop="script">
          <el-input v-model="form.script" placeholder="请输入脚本" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'ScriptWhite',
  data() {
    return {
      findQuery: {
        name: '',
        page: 1,
        limit: 10,
        total: 0
      },
      listLoading: false,
      list: [],
      dialogTitle: '新增白名单',
      showDialog: false,
      form: {
        name: '',
        script: ''
      },
      formId: '',
      rules: {
        name: [
          { required: true, message: '请输入白名单名称', trigger: 'blur' }
        ],
        script: [
          { required: true, message: '请输入脚本', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.findHyitOpsScriptWhiteList()
  },
  methods: {
    onEdit(row) {
      this.showDialog = true
      this.formId = row.id
      this.form = {
        name: row.name,
        script: row.script
      }
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.automationOperations.deleteHyitOpsScriptWhiteList,
          data: {
            id: row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findHyitOpsScriptWhiteList()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    onCreate() {
      this.showDialog = true
      this.formId = ''
      Object.keys(this.form).forEach(key => {
        this.form[key] = ''
      })
    },
    onFilter() {
      this.findQuery.page = 1
      this.findHyitOpsScriptWhiteList()
    },
    handleSizeChange(val) {
      this.findQuery.limit = val
    },
    handleCurrentChange(val) {
      this.findQuery.page = val
      this.findHyitOpsScriptWhiteList()
    },
    findHyitOpsScriptWhiteList() {
      request({
        url: api.automationOperations.findHyitOpsScriptWhiteList, data: { ...this.findQuery }
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.list = res.data
          this.findQuery.total = Number(res.count)
        }
      })
    },
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.formId === '' ? api.automationOperations.insertHyitOpsScriptWhiteList : api.automationOperations.updateHyitOpsScriptWhiteList
          const data = this.form
          if (this.formId !== '') data.id = this.formId
          request({
            url: apiName, data
          }).then(res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.showDialog = false
              this.findHyitOpsScriptWhiteList()
            }
          })
        }
      })
    }
  }
}
</script>
