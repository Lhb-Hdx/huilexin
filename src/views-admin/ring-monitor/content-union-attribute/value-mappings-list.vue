<template>
  <div class="app-container">
    <el-card shadow="never">

      <el-page-header :content="navTitle" @back="goBack" />
      <div class="filter-container">
        <el-button v-permission="['create']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
        <el-input v-model="findHyitDeviceValueMappingsQuery.hyVal" v-permission="['search']" placeholder="请输入属性数值" style="width: 200px;" class="filter-item" clearable @clear="onFilter" />
        <el-input v-model="findHyitDeviceValueMappingsQuery.hyValName" v-permission="['search']" placeholder="请输入属性数值含义" style="width: 200px;" class="filter-item" clearable @clear="onFilter" />
        <el-button v-permission="['search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="deviceValueMappingsList"
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column label="NO" prop="id" type="index" width="120" />
          <el-table-column label="属性数值" prop="hyVal" show-overflow-tooltip />
          <el-table-column label="属性数值含义" prop="hyValName" show-overflow-tooltip />
          <el-table-column label="操作" width="400" class-name="small-padding fixed-width" align="center">
            <template slot-scope="{row}">
              <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">
                编辑
              </el-button>
              <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="findHyitDeviceValueMappingsQuery.total > 0" :auto-scroll="false" :total="findHyitDeviceValueMappingsQuery.total" :page.sync="findHyitDeviceValueMappingsQuery.page" :limit.sync="findHyitDeviceValueMappingsQuery.limit" @pagination="findHyitDeviceValueMappings" />

      <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
        <div class="equipment_table">
          <el-form ref="form" :model="deviceValueMappingsForm" label-width="120px" :rules="rules" class="select-width-fill">
            <el-form-item label="属性数值" prop="hyVal" :rules="[{required:true,trigger:'blur',message:'请填写'}]">
              <el-input v-model="deviceValueMappingsForm.hyVal" />
            </el-form-item>
            <el-form-item label="属性数值含义" prop="hyValName" :rules="[{required:true,trigger:'blur',message:'请填写'}]">
              <el-input v-model="deviceValueMappingsForm.hyValName" />
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showDialog = false">取 消</el-button>
          <el-button v-permission="['submit']" class="filter-item" type="primary" @click="comfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'ContentUnionAttributeList',
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      findHyitDeviceValueMappingsQuery: {
        page: 1,
        limit: 10,
        total: 0
      },
      deviceValueMappingsList: [],
      valueTypeList: [],
      dialogTitle: '新增值',
      showDialog: false,
      deviceValueMappingsForm: {
        hyVal: '',
        hyValName: ''
      },
      rules: {}
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    setAreaName() {
      return function(hyOrgid) {
        const idx = this.areaList.findIndex(item => item.hyOrgid === hyOrgid)
        if (idx !== -1) {
          return this.areaList[idx].hyOrgName
        }
      }
    }
  },
  mounted() {
    this.findHyitDeviceValueMappings()
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    onCreate() {
      this.resetForm(this.deviceValueMappingsForm)
      this.dialogTitle = '新增值'
      this.showDialog = true
    },
    resetForm(form) {
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
    },
    onEdit(row) {
      this.dialogTitle = '编辑值'
      this.showDialog = true
      const form = {}
      Object.keys(this.deviceValueMappingsForm).forEach(key => {
        form[key] = row[key]
      })
      form.mappingid = row.mappingid
      this.deviceValueMappingsForm = form
    },
    onFilter() {
      this.findHyitDeviceValueMappingsQuery.page = 1
      this.findHyitDeviceValueMappings()
    },
    handleSizeChange() {},
    handleCurrentChange() {},
    comfirm() {
      this.$refs.form.validate(val => {
        if (!val) return
        const apiName = !this.deviceValueMappingsForm.mappingid ? api.powerEnv.insertHyitDeviceValueMappings : api.powerEnv.updateHyitDeviceValueMappings
        if (this.deviceValueMappingsForm.mappingid === '') {
          delete this.deviceValueMappingsForm.mappingid
        }
        request({
          url: apiName,
          data: {
            ...this.deviceValueMappingsForm,
            hyVid: this.id
          }
        }).then(res => {
          if (res.code === 1) {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.showDialog = false
              this.findHyitDeviceValueMappings()
            }
          }
        })
      })
    },
    findHyitDeviceValueMappings() {
      request({
        url: api.powerEnv.findHyitDeviceValueMappings,
        data: {
          ...this.findHyitDeviceValueMappingsQuery,
          hyVid: this.id
        }
      }).then(res => {
        if (res.code === 1) {
          this.deviceValueMappingsList = res.data
        }
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.powerEnv.deleteHyitDeviceValueMappings, data: { mappingid: row.mappingid }}).then(res => {
          if (res.code === 1) {
            this.findHyitDeviceValueMappingsQuery.page = 1
            this.findHyitDeviceValueMappings()
            this.$message.success('删除成功')
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {padding-top: 14px}
</style>
