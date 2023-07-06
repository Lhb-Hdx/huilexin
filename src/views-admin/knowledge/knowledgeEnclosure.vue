<template>
  <div class="app-container">
    <el-page-header :content="navTitle" @back="$router.back()" />
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="addCat">新增</el-button>
      <el-input v-model="keywords" v-permission="['Search']" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="searchCat">搜索</el-button>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="hyFile"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" prop="hyId" type="index" width="80" />
        <el-table-column label="名称" prop="hyFileName" width="250" />
        <el-table-column label="地址" prop="hyFileAddr" />
        <el-table-column label="大小" prop="hyFileSize" width="180" />
        <el-table-column label="格式" prop="hyFileType" width="180" />
        <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
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
    <el-drawer
      title="分类信息"
      :visible.sync="drawer"
      :direction="direction"
    >
      <div class="wrp">
        <el-form ref="form" :model="form" label-width="100px">
          <el-form-item label="附件名称" prop="hyFileName">
            <el-input v-model.trim="hyFileName" :readonly="true" placeholder="附件名称" />
          </el-form-item>
          <el-form-item label="附件地址" prop="hyFileAddr">
            <el-input v-model.trim="hyFileAddr" :readonly="true" placeholder="附件地址" />
          </el-form-item>
          <el-form-item label="附件大小" prop="hyFileSize">
            <el-input v-model.trim="hyFileSize" :readonly="true" placeholder="附件大小" />
          </el-form-item>
          <el-form-item label="附件格式" prop="hyFileType">
            <el-input v-model.trim="hyFileType" :readonly="true" placeholder="附件格式" />
          </el-form-item>
          <el-form-item label="附件" prop="hyFileType">
            <el-upload
              class="upload-demo"
              action
              accept=".xls,.xlsx,.doc,.docx,.ppt,.pptx,.pdf"
              :http-request="upload"
              :on-change="handleChange"
              :show-file-list="false"
            >
              <el-button type="primary">附件上传</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <div class="drawer-footer">
          <el-button :loading="loading" class="wrp_button" type="primary" @click="saveCat">保存</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'KnowledgeEnclosure',
  components: { },
  data() {
    return {
      hyId: 0,
      hyFileName: null,
      hyFileAddr: null,
      hyFileSize: null,
      hyFileType: null,
      keywords: null,
      page: 1,
      limit: -1,
      total: 0,
      drawer: false,
      direction: 'rtl',
      form: {
        hyKnowCode: '',
        hyKnowName: ''
      },
      hyFile: [], // 附件名称
      loading: false,
      confirmLoading: false,
      fileList: [],
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      }
    }
  },
  computed: {
    hyOid() { // 获取传递的id
      return this.$route.query.hyKnowId
    },
    navTitle() { // 获取传递的title
      return this.$route.meta.title
    }
  },
  created() {
    this.fetchData()
    this.loadCat()
  },
  methods: {
    fetchData() { // 数据来源展示（头部） xxx的附件管理
      let fetchArr = []
      request({
        url: api.knowledge.findHyitKnow, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          fetchArr = res.data
        }
      })
      if (this.hyOid) {
        request({
          url: api.knowledge.findHyitKnow, data: { hyKnowId: this.hyOid }
        }).then(res => {
          if (res.code === 1) {
            fetchArr.push(res.model)
          }
        })
      }
      this.loading = true
      Promise.all(fetchArr).then(res => { // 判断匹配信息
        if (res.code === 1) {
          if (this.hyOid) {
            const form = {}
            Object.keys(this.form).forEach(key => {
              form[key] = res[1].model[key]
            })
            this.form = form// 赋予信息
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    searchCat() { // 搜索
      console.log(this.keywords)
      this.page = 1
      this.hyFile = []
      this.loadCat()
    },
    loadCat() { // 列表
      request({
        url: api.knowledge.findHyitKnowFile,
        data: { hyOid: this.hyOid, hyFileName: this.keywords }
      })
        .then(res => {
          this.hyFile = res.data
        })
    },
    onDelete(row) { // 删除
      this.$confirm('是否删除该知识点？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.knowledge.deleteHyitKnowFile,
          data: { hyId: row.hyId }
        })
          .then(res => {
            console.log(res)
            if (res.code === 1) {
              this.loadCat()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    addCat() { // 新增
      this.drawer = true
      this.hyId = 0
      this.hyFileName = null
      this.hyFileAddr = null
      this.hyFileSize = null
      this.hyFileType = null
    },
    onEdit(row) { // 编辑
      this.drawer = true
      this.hyId = row.hyId
      this.hyFileName = row.hyFileName
      this.hyFileAddr = row.hyFileAddr
      this.hyFileSize = row.hyFileSize
      this.hyFileType = row.hyFileType
    },
    saveCat() { // 新增、编辑判断
      this.loading = true
      let url = null
      if (this.hyId === 0) {
        url = api.knowledge.addHyitKnowFile
      } else if (this.hyId >= 0) {
        url = api.knowledge.updateHyitKnowFile
      }
      if (url) {
        request({
          url: url,
          data: { hyId: this.hyId, hyOid: this.hyOid, hyFileName: this.hyFileName, hyFileAddr: this.hyFileAddr, hyFileSize: this.hyFileSize, hyFileType: this.hyFileType }
        }).then(res => {
          this.loading = false
          this.drawer = false
          this.page = 1
          this.data = []
          this.loadCat()
          this.$notify({
            title: '温馨提示',
            message: res.msg,
            type: 'success',
            duration: 2000
          })
        })
      }
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    // 上传
    upload(param) {
      var fdata = new FormData()
      fdata.append('file', param.file)
      console.log(this.uploadToken)
      Object.keys(this.uploadToken).forEach(key => fdata.append(key, (this.uploadToken[key] && this.uploadToken[key] !== null && this.uploadToken[key] !== 'null' ? this.uploadToken[key] : '')))
      request({
        url: api.file.uploadDocument, data: this.uploadToken, form: fdata
      }).then(res => {
        if (res.code === 1) {
          const time = new Date().getTime()
          this.$message.success(res.msg)
          this.hyFileName = res.map.upFileName.replace('.', `_${time}.`)
          this.hyFileAddr = res.map.original
          const size = res.map.fileSize / 1024
          this.hyFileSize = size.toFixed(2) + 'k'
          const stuff = this.hyFileName.match(/^(.*)(\.)(.{1,8})$/)[3]
          console.log(stuff)
          if (stuff === 'docx' || stuff === 'doc' || stuff === 'wps' || stuff === 'wpt' || stuff === 'dot') {
            this.hyFileType = 'Word文件'
          } else if (stuff === 'et' || stuff === 'ett' || stuff === 'xls' || stuff === 'xlt' || stuff === 'xlsx') {
            this.hyFileType = 'Excel文件'
          } else if (stuff === 'pdf') {
            this.hyFileType = 'PDF文件'
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>

