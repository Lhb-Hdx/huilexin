<template>
  <div class="app-container">
    <div v-permission="['Search']" class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" placeholder="搜索关键词" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table :data="list">
        <el-table-column label="No" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="leeft" label="名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="leeft" label="创建人" prop="realName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="leeft" label="备注" prop="backup" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="leeft" label="操作" width="300" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button v-permission="['Config']" type="primary" size="mini" @click="handlerConfig(row)">配置</el-button>
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="handlerEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="handlerDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findUserDefineForm" />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" label-width="110px" :rules="rules" :model="form">
          <el-form-item label="创建人">
            <div class="user-info">
              <div class="user-name">{{ userInfo.realName }} {{ userInfo.tel }}</div>
              <div class="user-desc">{{ userInfo.positionName }} {{ userInfo.orgName }}</div>
            </div>
          </el-form-item>
          <el-form-item label="表单名称" prop="name">
            <el-input v-model.trim="form.name" placeholder="请输入表单名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.backup" type="textarea" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
      </div>
    </el-dialog>
    <TestDialog ref="testDialog" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import TestDialog from '@/views/opm-maintenance/custom-form/test-dialog'
import ListControl from '@/components/ListControl'

export default {
  name: 'CustomFormList',
  components: {
    Pagination,
    TestDialog,
    ListControl
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      listTotal: 0,
      list: [],
      form: {
        name: '',
        userData: '',
        userId: '',
        backup: ''
      },
      formId: '',
      showDialog: false,
      dialogTitle: '新增表单',
      userInfo: {},
      rules: {
        name: [
          {required: true, message: '请输入表单名称'}
        ]
      },
      // 显示控制数据 start
      checkList: ['名称', '创建人', '备注', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  mounted() {
    this.findUserDefineForm()
    this.userInfo = this.localStorageOperation('get', 'userInfo')
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    handleCreate() {
      this.formId = ''
      Object.keys(this.form).forEach(key => { this.$set(this.form, `${key}`, '') })
      this.dialogTitle = '新增表单'
      this.showDialog = true
    },
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findUserDefineForm()
    },
    handlerConfig(row) {
      this.$router.push({
        name: 'CustomFormDesign',
        query: { id: row.id }
      })
    },
    handlerEdit(row) {
      this.formId = row.id
      Object.keys(this.form).forEach(key => { this.$set(this.form, `${key}`, row[`${key}`]) })
      this.dialogTitle = '编辑表单'
      this.showDialog = true
    },
    handlerDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({ url: this.api.userDefineForm.deleteUserDefineForm, data: { id: row.id } }).then(async res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findUserDefineForm()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const data = { ...this.form }
          if (this.formId !== '') {
            data.id = this.formId
          } else {
            data.userId = this.userInfo.userId
          }
          const api = this.formId !== '' ? this.api.userDefineForm.updateUserDefineForm : this.api.userDefineForm.insertUserDefineForm
          this.$request({ url: api, data }).then(res => {
            if (res.code === 1) {
              this.showDialog = false
              this.$message.success(res.msg)
              this.findUserDefineForm()
            }
          })
        }
      })
    },
    async findUserDefineForm() {
      const userIds = []
      const findUserDefineForm = await this.$request({
        url: this.api.userDefineForm.findUserDefineForm,
        data: this.listQuery
      })
      if (findUserDefineForm.code !== 1) return
      findUserDefineForm.data.forEach(item => {
        if (item.userId) userIds.push(item.userId)
      })
      const findSysUser = await this.$request({
        url: this.api.sys.findSysUser,
        data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1, companyId: this.$auth.getUserSession().companyId }
      })
      findUserDefineForm.data.forEach(item => {
        if (item.userId && findSysUser.code === 1) {
          const idx = findSysUser.data.findIndex(items => +items.userId === +item.userId)
          if (idx !== -1) item.realName = findSysUser.data[idx].realName
        }
      })
      this.list = findUserDefineForm.data
      this.listTotal = +findUserDefineForm.count
    },
    test() {
      this.$refs.testDialog.open()
    }
  }
}
</script>

<style scoped>

</style>
