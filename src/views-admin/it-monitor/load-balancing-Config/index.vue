<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleAdd">新 增</el-button>
      <el-input v-model.trim="keyword" v-permission="['Search']" placeholder="请输入rs名称/group名称/iP地址或域名" style="width: 250px;" class="filter-item" clearable @keyup.enter.native="handleSearch" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">查 询</el-button>
      <el-button type="primary" class="filter-item" icon="el-icon-s-operation" @click="handleImprotExcel">导 入Excel</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table">
      <el-table :data="tableDataList" fit highlight-current-row>
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="group名称" prop="groupName">
          <template slot-scope="{row}">
            <span>{{ row.groupName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="rs名称" prop="rsName">
          <template slot-scope="{row}">
            <span>{{ row.rsName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="网关名称" prop="version">
          <template slot-scope="{row}">
            <span>{{ getDnsNanme(row.agentId) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="iP地址或域名" prop="ip">
          <template slot-scope="{row}">
            <span>{{ (row.ip) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="账号" prop="userName">
          <template slot-scope="{row}">
            <span>{{ (row.userName) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="操作" class-name="small-padding fixed-width" align="center" fixed="right" width="160">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleEdit(row)">配 置</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row)">删 除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listTotal>0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findRadwareUrl" />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="40%" top="5vh">
      <el-form ref="form" :model="form" label-width="110px">
        <el-form-item label="group名称" prop="groupName">
          <el-input v-model.trim="form.groupName" placeholder="请输入group名称" />
        </el-form-item>
        <el-form-item label="rs名称" prop="rsName">
          <el-input v-model.trim="form.rsName" placeholder="请输入rs名称" />
        </el-form-item>
        <el-form-item label="网关名称" prop="agentId">
          <el-select v-model="form.agentId" placeholder="请选择网关名称" @change="changeA">
            <el-option
              v-for="item of agentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="IP" prop="ip">
          <el-input v-model.trim="form.ip" placeholder="请输入iP地址或域名" />
        </el-form-item>
        <el-form-item label="账号" prop="userName">
          <el-input v-model.trim="form.userName" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="passKeyWord">
          <el-input v-model.trim="form.passKeyWord" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 导入Excel -->
    <el-dialog title="文件导入" :visible.sync="showImportExcelDialog" width="36%" top="5vh">
      <el-form class="container-content">
        <el-form-item label="选择导入文件:">
          <el-upload action accept=".xls,.xlsx" :http-request="onHandleImportRadwareUrl" :file-list="fileListTow">
            <el-button size="small" type="primary">选择导入文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="选择导入网关:">
          <el-select v-model="newAgentId" placeholder="请选择网关名称" @change="handleSelectAgentId">
            <el-option
              v-for="item of agentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportExcelDialog = false">取 消</el-button>
        <el-button type="primary" :loading="loadingExcel" @click="onImprotExcel">导 入</el-button>
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
  name: 'SubSystem',
  components: { Pagination, ListControl },
  data() {
    return {
      loading: false,
      loadingExcel: false,
      dialogVisible: false,
      showImportExcelDialog: false,
      formData: new FormData(),
      dialogTitle: '',
      newAgentId: null,
      fileListTow: [],
      tableDataList: [],
      agentList: [],
      fileList: [],
      listTotal: 0,
      keyword: null,
      newListQuery: {},
      listQuery: {
        page: 1,
        limit: 10
        // rsName: '',
        // groupName: '',
        // ip: ''
      },
      formId: '',
      form: {
        groupName: '',
        rsName: '',
        agentId: '',
        ip: '',
        userName: '',
        passKeyWord: ''
      },
      // 显示控制数据 start
      checkList: ['group名称', 'rs名称', '网关名称', 'iP地址或域名', '账号', '操作'],
      lists: []
      // 显示控制数据 end

    }
  },
  computed: {
    getDnsNanme() {
      return function(agentId) {
        const data = this.agentList
        const idx = data.findIndex(item => item.id === agentId)
        if (idx !== -1) return data[idx].name
        return null
      }
    }
  },
  mounted() {
    this.findRadwareUrl()
    this.findHyitAgent()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    changeA() {
      console.log('this.form.agentId', this.form.agentId)
    },
    async sendDataRadWare(agentId) {
      const res = await request({ url: api.itMonitor.sendDataRadWare, data: { agentId } })
      if (res.code !== 1) return
      return res.data
    },
    handleSearch() {
      // this.listQuery.page = 1
      this.listQuery.keyword = this.keyword
      console.log('keyword', this.keyword)
      // this.newListQuery = { ...this.listQuery }
      // const burrmy = Object.keys(this.newListQuery)
      // if (this?.keyword) {
      //   const table = this.tableDataList
      //   burrmy.map(item => {
      //     table.map(itemT => {
      //       if (itemT[item] === this.keyword) {
      //         this.$set(this.newListQuery, item, this.keyword)
      //       }
      //     })
      //   })
      //   this.listQuery = this.newListQuery
      // } else {
      //   this.$set(this.listQuery, 'ip', null)
      //   this.$set(this.listQuery, 'rsName', null)
      //   this.$set(this.listQuery, 'groupName', null)
      // }
      this.findRadwareUrl()
    },
    // 获取列表数据
    async findRadwareUrl() {
      const res = await request({ url: api.itMonitor.findRadwareUrl, data: {...this.listQuery } })
      if (res.code !== 1) return
      this.listTotal = parseInt(res.count) || parseInt(res.data.length)
      this.tableDataList = res.data
      return res.data
    },
    // 获取网关
    async findHyitAgent() {
      const res = await request({ url: api.itMonitor.findHyitAgent, data: {agentTypes: 10, limit: -1 } })
      if (res.code !== 1) return
      this.agentList = res.data
    },
    // 批量导入
    handleImprotExcel() {
      this.fileListTow = []
      this.showImportExcelDialog = true
    },
    // 上传文件
    onHandleImportRadwareUrl(param) {
      this.formData.append('uploadfile', param.file)
    },
    // 选择网关
    handleSelectAgentId() {
      this.formData.append('agentId', this.newAgentId)
    },
    async onImprotExcel() {
      this.loadingExcel = true
      try {
        const { data, code } = await request({ url: api.itMonitor.importRadWare, form: this.formData })
        if (code !== 1) return
        if (data.length <= 0) return this.$message.warning('excel表为空/或使用模板不对')
        this.$message.success('导入成功')
        this.findRadwareUrl()
      } catch (error) {
        this.$message.error('导入失败')
      } finally {
        this.loadingExcel = false
        this.showImportExcelDialog = false
      }
    },
    // 判断新增||编辑
    handleSubmit() {
      this.loading = true
      if (this.formId !== '') {
        this.form.id = this.formId
      }
      const URL = this?.formId ? api.itMonitor.updateRadwareUrl : api.itMonitor.insertRadwareUrl
      request({ url: URL, data: { ...this.form } }).then(async res => {
        if (res.code !== 1) return
        this.dialogVisible = false
        if (this.formId !== '') {
          this.sendDataRadWare(this.form.agentId)
          this.$message({ type: 'success', message: res.msg })
        }
        this.$message({ type: 'success', message: res.msg })
        this.findRadwareUrl()
      }).catch((error) => {
        if (this.formId !== '') return this.$message({ type: 'error', message: error })
        this.$message({ type: 'error', message: error })
      }).finally(() => {
        this.loading = false
      })
    },
    // 新增
    handleAdd() {
      this.dialogTitle = '新增配置'
      this.dialogVisible = true
      this.form = {}
    },
    // 配置
    handleEdit(row) {
      this.dialogTitle = '编辑配置'
      this.dialogVisible = true
      this.formId = row.id
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, row[`${key}`])
      })
    },
    // 删除
    handleDelete(row) {
      this.$confirm('确定删除数据行吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await request({ url: api.itMonitor.deleteRadwareUrl, data: {id: row.id } })
        if (res.code !== 1) return this.$message({ type: 'error', message: res.error })
        this.$message({ type: 'success', message: res.msg })
        this.sendDataRadWare(row.agentId)
        this.findRadwareUrl()
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

