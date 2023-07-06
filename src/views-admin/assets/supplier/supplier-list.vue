<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入供应商名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="供应商名称" prop="supplierName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="供应商类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setSupplierType(row.supplierCatId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="行业" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setIndustryType(row.industryCatId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="地址" prop="address" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="操作" class-name="small-padding fixed-width" width="400">
          <template slot-scope="{row}">
            <el-button v-permission="['GetEmploye']" type="primary" size="mini" @click="toSupplierEmploye(row)">查看人员</el-button>
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal>0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findAssetsSupplier" />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model.trim="form.supplierName" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="供应商类型" prop="supplierCatId">
          <el-select
            v-model="form.supplierCatId"
            placeholder="请选择供应商类型"
            style="width: 100%;"
          >
            <el-option
              v-for="item in supplierTypeList"
              :key="item.catId"
              :label="item.catName"
              :value="item.catId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行业" prop="industryCatId">
          <el-select
            v-model="form.industryCatId"
            placeholder="请选择行业"
            style="width: 100%;"
          >
            <el-option
              v-for="item in industryList"
              :key="item.catId"
              :label="item.catName"
              :value="item.catId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model.trim="form.address" placeholder="请输入地址" />
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
import ListControl from '@/components/ListControl'

export default {
  name: 'SupplierList',
  components: { Pagination, ListControl },
  data() {
    return {
      dialogTitle: '新增供应商',
      showDialog: false,
      listLoading: true,
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      listTotal: 0,
      form: {
        supplierName: '',
        supplierCatId: '',
        address: '',
        industryCatId: '',
        remark: ''
      },
      formId: '', // form主键
      rules: {
        supplierName: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' }
        ],
        supplierCatId: [
          { required: true, message: '请选择供应商类型', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        industryCatId: [
          { required: true, message: '请选择行业', trigger: 'blur' }
        ]
      },
      list: [],
      supplierTypeList: [],
      industryList: [],
      // 显示控制数据 start
      checkList: ['供应商名称', '供应商类型', '行业', '地址', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setSupplierType() {
      return function(supplierCatId) {
        const idx = this.supplierTypeList.findIndex(item => item.catId === supplierCatId)
        if (idx !== -1) {
          return this.supplierTypeList[idx].catName
        }
      }
    },
    setIndustryType() {
      return function(industryCatId) {
        const idx = this.industryList.findIndex(item => item.catId === industryCatId)
        if (idx !== -1) {
          return this.industryList[idx].catName
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
  },
  mounted() {
    this.findSupplierTypeCat()
    this.findIndustryCat()
    this.findAssetsSupplier()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    handleCreate() {
      this.formId = ''
      this.showDialog = true
      this.dialogTitle = '新增供应商'
      // setTimeout(() => {
      this.$refs.form.resetFields()
      // }, 100)
    },
    onEdit(row) {
      this.formId = row.supplierId
      this.dialogTitle = '编辑供应商'
      this.showDialog = true
      this.$nextTick(() => {
        Object.keys(row).forEach(key => {
          this.form[key] = row[key]
        })
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.assets.deleteAssetsSupplier,
          data: {
            supplierId: row.supplierId
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findAssetsSupplier()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findAssetsSupplier()
    },
    toSupplierEmploye(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'SupplierEmploye',
        query: {
          id: row.supplierId || 0
        }
      })
    },
    findAssetsSupplier() {
      request({
        url: api.assets.findAssetsSupplier,
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
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.formId ? api.assets.updateAssetsSupplier : api.assets.insertAssetsSupplier
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
              this.findAssetsSupplier()
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
    findSupplierTypeCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_供应商类型', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.supplierTypeList = res.data
        }
      })
    },
    findIndustryCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_行业', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.industryList = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
