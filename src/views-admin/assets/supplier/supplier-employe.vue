<template>
  <div class="app-container">
    <el-page-header :content="navTitle" @back="goBack" />
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入人员名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="人员名称" prop="employeName" show-overflow-tooltip />
        <el-table-column label="联系电话" prop="tel" show-overflow-tooltip />
        <el-table-column label="所属供应商" show-overflow-tooltip>
          <template>
            {{ supplier.supplierName }}
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="small-padding fixed-width" width="400" align="center">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total>0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findAssetsSupplierEmploye" />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="人员名称" prop="employeName">
          <el-input v-model.trim="form.employeName" placeholder="请输入人员名称" />
        </el-form-item>
        <el-form-item label="联系电话" prop="tel">
          <el-input v-model.trim="form.tel" placeholder="请输入联系电话" />
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
  name: 'SupplierEmploye',
  components: { Pagination },
  data() {
    return {
      dialogTitle: '新增人员',
      showDialog: false,
      listLoading: true,
      listQuery: {
        supplierId: '',
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      form: {
        employeName: '',
        tel: '',
        supplierId: '',
        remark: ''
      },
      formId: '', // form主键
      rules: {
        employeName: [
          { required: true, message: '请输入人员名称', trigger: 'blur' }
        ],
        tel: [
          { required: true, message: '请输入人员联系电话', trigger: 'blur' }
        ]
      },
      list: [],
      supplier: []
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  mounted() {
    this.findAssetsSupplierEmploye()
    this.$set(this.form, 'supplierId', this.id)
    this.$set(this.listQuery, 'supplierId', this.id)
    this.getAssetsSupplier()
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    handleCreate() {
      this.showDialog = true
      setTimeout(() => {
        this.$refs.form.resetFields()
      }, 100)
    },
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findAssetsSupplierEmploye()
    },
    findAssetsSupplierEmploye() {
      request({
        url: api.assets.findAssetsSupplierEmploye,
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
    onEdit(row) {
      this.showDialog = true
      this.dialogTitle = '编辑人员'
      this.formId = row.id
      Object.keys(row).forEach(key => {
        this.form[key] = row[key]
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.assets.deleteAssetsSupplierEmploye,
          data: {
            id: row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findAssetsSupplierEmploye()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.formId ? api.assets.updateAssetsSupplierEmploye : api.assets.insertAssetsSupplierEmploye
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
              this.findAssetsSupplierEmploye()
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
    getAssetsSupplier() {
      request({
        url: api.assets.getAssetsSupplier,
        data: { supplierId: this.id }
      }).then(res => {
        if (res.code === 1) {
          this.supplier = res.model
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {padding-top: 14px}
</style>
