<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item label="名称" prop="hyKnowName">
                <el-input v-model.trim="form.hyKnowName" placeholder="请输入知识点名称" />
              </el-form-item>
              <el-form-item label="封面图">
                <FileUpload
                  v-permission="['CoverUpload']"
                  button-text="上传"
                  upload-type="pic"
                  file-type=".png,.jpg"
                  :limit="1"
                  :button-disabled="false"
                  :is-limit-file-size="true"
                  :file-max-size="1"
                  :file-url-list="fileList"
                  file-url-list-type="picture"
                  button-type="primary"
                  @emitFileList="getEmitFileList"
                />
              </el-form-item>
              <el-form-item v-if="hyKnowId" label="附件" prop="hyKeyword">
                <el-button class="" size="small" type="primary" @click="showDetail()">附件列表</el-button>
              </el-form-item>
              <el-form-item v-else label="附件" prop="hyKeyword">
                <FileUpload
                  button-text="上传附件"
                  upload-type="doc"
                  file-url-list-type="text"
                  :limit="9"
                  :button-disabled="false"
                  :is-limit-file-size="true"
                  :file-max-size="1"
                  :file-url-list="fileList2"
                  class="margin-bottom-10"
                  @emitFileList="getEmitFileList2"
                />
              </el-form-item>

              <el-form-item label="知识点类型" prop="hyKtId">
                <el-select
                  v-model="form.hyKtId"
                  placeholder="请选择知识点类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in typeArr"
                    :key="item.catId"
                    :label="item.catName"
                    :value="item.catId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词" prop="hyKeyword">
                <el-input v-model.trim="form.hyKeyword" placeholder="请输入关键词" />
              </el-form-item>
              <el-form-item label="描述" prop="knowRemark">
                <el-input v-model="form.knowRemark" type="textarea" />
              </el-form-item>
              <el-form-item label="内容" prop="hyKtxt">
                <ElQuill v-model="form.hyKtxt" />
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <!-- 附件列表 -->
    <el-dialog title="附件列表" :visible.sync="showAttachmentsDialog" width="80%" top="5vh">
      <el-row :gutter="20">
        <el-col :span="8" :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
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
                :http-request="uploadEnclosure"
                :on-change="handleChangeEnclosure"
                :show-file-list="false"
              >
                <el-button type="primary">选择附件</el-button>
              </el-upload>
            </el-form-item>
            <div class="drawer-footer">
              <el-button :loading="loading" class="wrp_button" type="primary" @click="clickUpload">保存</el-button>
            </div>
          </el-form>
        </el-col>
        <el-col :span="16" :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
          <div class="table-wrapper">
            <el-table
              :data="hyFile"
              fit
              highlight-current-row
              style="width: 100%;"
            >
              <el-table-column label="序号" prop="hyId" type="index" width="80" show-overflow-tooltip />
              <el-table-column label="名称" prop="hyFileName" width="250" show-overflow-tooltip />
              <el-table-column label="地址" prop="hyFileAddr" show-overflow-tooltip />
              <el-table-column label="大小" prop="hyFileSize" show-overflow-tooltip />
              <el-table-column label="格式" prop="hyFileType" show-overflow-tooltip />
              <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
                <template slot-scope="{row}">
                  <el-button size="mini" type="primary" @click="onEdit(row)">
                    编辑
                  </el-button>
                  <el-button size="mini" type="danger" @click="onDelete(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showAttachmentsDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import ElQuill from './component/elQuil'
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload'

export default {
  name: 'KnowledgePointsUpdate',
  components: {
    ElQuill, FileUpload
  },
  data() {
    return {
      hyFile: [],
      content: '',
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      hyFileName: null,
      hyFileAddr: null,
      hyFileSize: null,
      hyFileType: null,
      keywords: null,
      editorOption: {
        placeholder: '请输入内容...'
      },
      form: {
        hyKnowName: '',
        hyKtId: '',
        hyKeyword: '',
        hyKtxt: '',
        hyTitleImageUrl: '',
        knowRemark: '',
        hyStatus: 0
      },
      // 类型
      typeArr: [],
      rules: {
        hyKnowName: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        hyKtId: [
          { required: true, message: '请选择类型', trigger: 'blur' }
        ],
        hyKeyword: [
          { required: true, message: '请输入关键词', trigger: 'blur' }
        ],
        hyKtxt: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ],
        knowRemark: [
          { required: true, message: '请输入描述', trigger: 'blur' }
        ]
      },
      loading: false,
      confirmLoading: false,
      fileList: [],
      fileList2: [],
      hyFileUrl: '',
      showAttachmentsDialog: false,
      hyId: 0,
      page: 1,
      limit: -1
    }
  },
  computed: {
    hyKnowId() { // 编辑
      return this.$route.query.hyKnowId
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  created() {
    this.$on('input', (data) => {
      this.form.hyKtxt = data
    })
  },
  mounted() {
    this.getTypeArr()
    if (this.hyKnowId) {
      this.fetchData()
      this.loadCat()
    }
  },
  methods: {
    fetchData() {
      if (this.hyKnowId) {
        request({
          url: api.knowledge.getHyitKnow, data: { hyKnowId: this.hyKnowId }
        }).then(res => {
          if (res.code === 1) {
            const form = {}
            Object.keys(this.form).forEach(key => {
              form[key] = res.model[key]
            })
            this.form = form
            if (form.hyTitleImageUrl) {
              const splitArr = form.hyTitleImageUrl.split('/')
              this.fileList.push({ name: `${splitArr[splitArr.length - 1]}`, url: `${form.hyTitleImageUrl}` })
            }
          }
        })
      }
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.hyKnowId) { // 编辑
            this.confirmLoading = true
            request({
              url: api.knowledge.updateHyitKnow, data: { hyKnowId: this.hyKnowId, ...this.form }
            }).then(res => {
              this.$router.back()
            }).finally(() => {
              this.confirmLoading = false
            })
          } else { // 新增
            this.confirmLoading = true
            request({
              url: api.knowledge.addHyitKnow, data: Object.assign(this.form)
            }).then(res => {
              if (res.code === 1 && !this.hyKnowId && this.fileList2.length > 0) {
                this.fileList2.forEach(async item => {
                  const time = new Date().getTime()
                  this.hyFileName = item.upFileName.replace('.', `_${time}.`)
                  this.hyFileAddr = item.original
                  const size = item.fileSize / 1024
                  this.hyFileSize = size.toFixed(2) + 'k'
                  const stuff = this.hyFileName.match(/^(.*)(\.)(.{1,8})$/)[3]
                  if (stuff === 'docx' || stuff === 'doc' || stuff === 'wps' || stuff === 'wpt' || stuff === 'dot') {
                    this.hyFileType = 'Word文件'
                  } else if (stuff === 'et' || stuff === 'ett' || stuff === 'xls' || stuff === 'xlt' || stuff === 'xlsx') {
                    this.hyFileType = 'Excel文件'
                  } else if (stuff === 'pdf') {
                    this.hyFileType = 'PDF文件'
                  }
                  await this.addHyitKnowFile(res.model.hyKnowId)
                })
              }
              this.$router.back()
            }).finally(() => {
              this.confirmLoading = false
            })
          }
        }
      })
    },
    async addHyitKnowFile(hyKnowId) {
      const res = await request({
        url: api.knowledge.addHyitKnowFile,
        data: { hyOid: hyKnowId, hyFileName: this.hyFileName, hyFileAddr: this.hyFileAddr, hyFileSize: this.hyFileSize, hyFileType: this.hyFileType }
      })
      if (res.code === 1) {
        this.hyFileName = null
        this.hyFileAddr = null
        this.hyFileSize = null
        this.hyFileType = null
      }
    },
    // 获取父类类型select
    getTypeArr() {
      const _this = this
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', pid: 10 }
      }).then(res => {
        _this.typeArr = res.data
      })
    },
    onReset() { // 清空内容-重置
      this.$refs['form'].resetFields()
    },
    handleChange(file, fileList) {
      if (fileList.length > 1) {
        this.fileList = fileList.slice(0, 1)
      }
    },
    // 上传图片
    upload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic, data: this.uploadToken, form: fdata
      }).then(res => {
        this.$set(this.form, 'hyTitleImageUrl', res.map.img)
        // this.fileList.push({ name: res.map.img, url: res.map.img })
        this.fileList = this.fileList.slice(0, 1)
      })
    },
    handleRemove() {
      this.$set(this.form, 'hyTitleImageUrl', '')
    },
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'hyTitleImageUrl', file.fileList[0]['url'])
    },
    getEmitFileList2(file) {
      this.fileList2 = file['map']
    },
    // 附件列表数据
    loadCat() {
      request({
        url: api.knowledge.findHyitKnowFile,
        data: { hyOid: this.hyKnowId, hyFileName: this.keywords }
      }).then(res => {
        if (res.code === 1) {
          this.hyFile = res.data
        }
      })
    },
    onEdit(row) { // 编辑
      this.hyId = row.hyId
      this.hyFileName = row.hyFileName
      this.hyFileAddr = row.hyFileAddr
      this.hyFileSize = row.hyFileSize
      this.hyFileType = row.hyFileType
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
        }).then(res => {
          if (res.code === 1) {
            this.loadCat()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      })
    },
    // 附件列表
    showDetail() {
      this.showAttachmentsDialog = true
      this.hyFileName = null
      this.hyFileAddr = null
      this.hyFileSize = null
      this.hyFileType = null
    },
    confirm() {
      this.showAttachmentsDialog = false
    },
    // 上传附件
    uploadEnclosure(param) {
      var fdata = new FormData()
      fdata.append('file', param.file)
      console.log(this.uploadToken)
      Object.keys(this.uploadToken).forEach(key => fdata.append(key, (this.uploadToken[key] && this.uploadToken[key] !== null && this.uploadToken[key] !== 'null' ? this.uploadToken[key] : '')))
      request({
        url: api.file.uploadDocument, data: this.uploadToken, form: fdata
      }).then(res => {
        if (res.code === 1) {
          const time = new Date().getTime()
          this.$message.success('添加成功')
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
    },
    handleChangeEnclosure(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    // 上传附件
    clickUpload() { // 新增、编辑判断
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
          data: { hyId: this.hyId, hyOid: this.hyKnowId, hyFileName: this.hyFileName, hyFileAddr: this.hyFileAddr, hyFileSize: this.hyFileSize, hyFileType: this.hyFileType }
        }).then(res => {
          if (res.code === 1) {
            this.loading = false
            this.hyFileName = null
            this.hyFileAddr = null
            this.hyFileSize = null
            this.hyFileType = null
            this.page = 1
            this.data = []
            this.loadCat()
            if (this.hyId === 0) {
              this.$message({
                type: 'success',
                message: '新增成功'
              })
            } else if (this.hyId >= 0) {
              this.$message({
                type: 'success',
                message: '编辑成功'
              })
            }
          } else {
            if (this.hyId === 0) {
              this.$message({
                type: 'error',
                message: '新增失败，请重试'
              })
            } else if (this.hyId >= 0) {
              this.$message({
                type: 'error',
                message: '编辑失败，请重试'
              })
            }
          }
        })
      }
    }
  }
}
</script>
<style>
  .wrp_button {
    float: right;
  }
</style>
