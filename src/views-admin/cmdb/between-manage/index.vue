<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入关系名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="正向关系" align="left" prop="relationshipForward" />
        <el-table-column label="反向关系" align="left" prop="relationshipReverse" />
        <el-table-column label="操作" align="left" class-name="small-padding fixed-width" width="400">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total>0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findCmdbRelationshipType" />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="正向关系" prop="relationshipForward">
          <el-input v-model.trim="form.relationshipForward" placeholder="请输入正向关系" />
        </el-form-item>
        <el-form-item label="反向关系" prop="relationshipReverse">
          <el-input v-model.trim="form.relationshipReverse" placeholder="请输入反向关系" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="form.remark" placeholder="备注" />
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
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'BetweenManageIndex',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      list: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        total: 0
      },
      form: {
        relationshipForward: '',
        relationshipReverse: '',
        remark: ''
      },
      formId: '', // form主键
      rules: {
        relationshipForward: [
          { required: true, message: '请输入正向关系', trigger: 'blur' }
        ],
        relationshipReverse: [
          { required: true, message: '请选择反向关系', trigger: 'blur' }
        ]
      },
      dialogTitle: '新增关系',
      showDialog: false
    }
  },
  mounted() {
    this.findCmdbRelationshipType()
  },
  methods: {
    // 获取关系列表
    findCmdbRelationshipType() {
      request({
        url: api.cmdb.findCmdbRelationshipType,
        data: this.listQuery
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.list = res.data
          this.$set(this.listQuery, 'total', Number(res.count))
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 保存
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.form.id ? api.cmdb.updateCmdbRelationshipType : api.cmdb.insertCmdbRelationshipType
          request({
            url: apiName,
            data: this.form
          }).then(res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.showDialog = false
              this.findCmdbRelationshipType()
              this.$refs.form.resetFields()
            } else {
              this.$message({
                type: 'error',
                message: res.msg
              })
            }
          })
        }
      })
    },
    // 打开新增
    handleCreate() {
      this.showDialog = true
      this.dialogTitle = '新增关系'
      delete this.form.id
      setTimeout(() => {
        this.$refs.form.resetFields()
      }, 100)
    },
    // 打开编辑
    onEdit(row) {
      Object.keys(row).forEach(key => {
        this.form[key] = row[key]
      })
      this.showDialog = true
      this.dialogTitle = '编辑关系'
    },
    // 搜索
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findCmdbRelationshipType()
    },
    // 删除
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.cmdb.deleteCmdbRelationshipType,
          data: {
            id: row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findCmdbRelationshipType()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
