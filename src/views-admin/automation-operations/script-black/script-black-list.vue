<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <el-input v-model="findQuery.keyword" v-permission="['Search']" placeholder="请输入黑名单名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="NO" prop="id" type="index" width="120" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="黑名单名称" prop="name" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="脚本" prop="script" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="操作" width="250" class-name="small-padding fixed-width">
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
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="findQuery.page"
      :limit.sync="findQuery.limit"
      :auto-scroll="false"
      @pagination="findHyitOpsScriptBlackList"
    />
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="黑名单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入黑名单名称" />
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
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ScriptWhite',
  components: {
    Pagination, ListControl
  },
  data() {
    return {
      findQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      total: 0,
      listLoading: false,
      list: [],
      dialogTitle: '新增黑名单',
      showDialog: false,
      form: {
        name: '',
        script: ''
      },
      formId: '',
      rules: {
        name: [
          { required: true, message: '请输入黑名单名称', trigger: 'blur' }
        ],
        script: [
          { required: true, message: '请输入脚本', trigger: 'blur' }
        ]
      },
      // 显示控制数据 start
      checkList: ['黑名单名称', '脚本', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  mounted() {
    this.findHyitOpsScriptBlackList()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
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
          url: api.automationOperations.deleteHyitOpsScriptBlackList,
          data: {
            id: row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findHyitOpsScriptBlackList()
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
      this.findHyitOpsScriptBlackList()
    },
    findHyitOpsScriptBlackList() {
      request({
        url: api.automationOperations.findHyitOpsScriptBlackList, data: { ...this.findQuery }
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.list = res.data
          this.total = Number(res.count)
        }
      })
    },
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.formId === '' ? api.automationOperations.insertHyitOpsScriptBlackList : api.automationOperations.updateHyitOpsScriptBlackList
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
              this.findHyitOpsScriptBlackList()
            }
          })
        }
      })
    }
  }
}
</script>

