<template>
  <div>
    <template>
      <el-form :model="form" label-width="100px">
        <!-- <el-form-item label="变更类型：">
          <el-select v-model="form.changeType" placeholder="请选择类型">
            <el-option v-for="item in chnageType" :key="item.catId" :label="item.catName" :value="item.catId" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="备注：">
          <Editor ref="text" v-model="form.backup" class="myQuillEditor ql-editor-class" placeholder="执行任务的信息描述" />
        </el-form-item>
        <el-form-item label="附件" label-width="100px">
          <FileUpload
            ref="fileUpload"
            button-text="上传附件"
            upload-type="doc"
            :limit="9"
            :button-disabled="false"
            :is-limit-file-size="true"
            :file-max-size="1"
            :file-url-list="form.fileUrlList"
            @emitFileList="getEmitFileList"
          />
        </el-form-item>
        <el-form-item label="">
          <el-divider />
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </template>
    <h3 v-if="analysisList.length>0" class="under-line font-16 mb-10">变更记录</h3>
    <div class="detailAnalyze-content">
      <div v-for="item in analysisList" :key="item.id" class="detailAnalyze-content-item">
        <div class="detailAnalyze-content-item-title flex align-center space-between">
          <!-- <h2 class="font-weigth overflow-text-a no-margin-bottom" style="width: 70%">{{ setChange(item.changeType) }}</h2> -->
          <div class="flex-h-center">
            <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <span class="ml-8 overflow-text-a">{{ item.userName }}</span>
          </div>
          <div class="box-right">
            <el-button v-if="info.matter.statue!==7" type="primary" size="mini" @click="deleteOrderAnalyze(item)"> 删除</el-button>
          </div>
        </div>
        <div class="detailAnalyze-content-item-box">
          <div v-html="item.backup" />
          <div v-for="fitem in item.fileList" :key="fitem.id">{{ fitem.fileName }} <el-link v-down="fitem.fileUrl" type="primary" class="font-12">下载</el-link></div>
        </div>

      </div>
    </div>
    <el-empty v-if="!analysisList.length" description="暂无变更记录" />
  </div>
</template>

<script>
import Editor from '@/components/QuillEditorComponent/editor.vue'
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload.vue'

export default {
  components: {
    Editor, FileUpload
  },
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {
        orderType: 1, // 工单类型
        changeType: '',
        backup: ''
      },
      chnageType: [],
      loginUser: {},
      fileList: [],
      findOpsOrderChangeQuery: {
        orderType: 1,
        page: 1,
        limit: -1
      },
      saveFlag: false,
      analysisList: [],
      analysisTotal: 0,
      showAnalyzeDetailDialog: false,
      analyzeDetailContent: '',
      loading: false
    }
  },
  computed: {
    id() { return this.$route.query.id },
    setChange() {
      return function(changeType) {
        const idx = this.chnageType.findIndex(item => Number(item.catId) === Number(changeType))
        if (idx !== -1) return this.chnageType[idx].catName
      }
    }
  },
  async mounted() {
    this.findOpsOrderAnalysis()
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.chnageType = await this.findSysCat()
  },
  methods: {
    // 获取变更类型 运维工单变更类型
    async findSysCat() {
      let { code, data } = await request({
        url: api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: 'userDefine_运维工单变更类型',
          parentId: -1,
          module: 2
        }
      })
      if (code !== 1) return
      return data
    },
    // 监听上传组件
    getEmitFileList(files) {
      this.fileList = files.fileList
    },
    // 点击保存
    async handleSave() {
      if (this.saveFlag) return
      this.saveFlag = true
      const data = { ...this.form, orderId: this.id, userId: this.loginUser.userId }
      const insertOpsOrderAnalysisResult = await this.insertOpsOrderAnalysis(data)
      this.insertOpsOrderFile(insertOpsOrderAnalysisResult.id)
      this.findOpsOrderAnalysis()
    },
    // 新增变更
    async insertOpsOrderAnalysis(data) {
      this.loading = true
      let { code, model } = await request({
        url: api.opm.insertOpsOrderChange,
        data
      })
      this.loading = false
      if (code !== 1) return
      this.$set(this.form, 'backup', '')
      this.$set(this.form, 'changeType', '')
      this.$message({
        type: 'success',
        message: '保存成功'
      })
      return model
    },
    // 新增附件
    insertOpsOrderFile(id) {
      this.fileList.forEach(item => {
        request({
          url: api.opm.insertOpsOrderFile,
          data: {
            type: 4,
            orderType: 1,
            userId: this.loginUser.userId,
            linkId: id,
            fileUrl: item.url,
            fileName: item.name
          }
        })
      })
      this.saveFlag = false
      // this.form.fileUrlList = []
      this.fileList = []
    },
    // 变更列表
    findOpsOrderAnalysis() {
      request({
        url: api.opm.findOpsOrderChange,
        data: {
          ...this.findOpsOrderChangeQuery, orderId: this.id
        }
      }).then(async res => {
        if (res.code === 1) {
          const ids = []
          const userIds = []
          res.data.forEach(item => {
            ids.push(item.id)
            userIds.push(item.userId)
          })
          const getFile = await this.findOpsOrderFile(ids)
          const findUserName = await request({ url: api.sys.findSysUser, data: { ids: userIds, companyId: this.$auth.getUserSession().companyId }})

          let userList = []
          if (findUserName.code === 1) userList = findUserName.data
          res.data.forEach(item => {
            getFile.forEach(fileItem => {
              if (Number(fileItem.linkId) === Number(item.id)) {
                if (!item.fileList) item.fileList = []
                item.fileList.push({
                  fileName: fileItem.fileName,
                  fileUrl: fileItem.fileUrl
                })
              }
            })
            const userIds = userList.findIndex(items => Number(items.userId) === Number(item.userId))
            if (userIds !== -1) {
              item.userName = userList[userIds].userName
            }
          })
          this.analysisList = res.data
          this.analysisTotal = Number(res.count)
        }
      })
    },
    // 查询变更附件
    async findOpsOrderFile(linkIds) {
      let { code, data } = await request({
        url: api.opm.findOpsOrderFile,
        data: {
          type: 4,
          orderType: 1,
          linkIds
        }
      })
      if (code !== 1) return
      return data
    },
    getAnalyzeDetail(row) {
      this.showAnalyzeDetailDialog = true
      this.analyzeDetailContent = row.backup
    },
    deleteOrderAnalyze(row) {
      this.$confirm(`确认删除分析报告吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        console.log(row)
        // return
        let { code, model } = await request({
          url: api.opm.deleteOpsOrderChange,
          data: row
        })
        if (code !== 1) return
        this.findOpsOrderAnalysis()
        console.log(code, model)
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep .myQuillEditor{
  .ql-container.ql-snow{
  height: 210px;
}

.ql-editor{
  height: 200px;
}
}
.detailAnalyze-content{
  padding: 0 20px 0 0;
  .detailAnalyze-content-item{
    background-color: #F4F4F5;
    margin-bottom: 10px;
    border-left: 2px solid #05B387;
    .detailAnalyze-content-item-title{
      border-bottom: 1px solid #e0e0e0;
      padding: 10px 15px;
      align-items: center;
      h2 {
        margin-top: 0;
      }
    }
    .detailAnalyze-content-item-box{
      padding:6px 15px;
      line-height: 24px;
      position: relative;
      .box-right{
        position:absolute;
        right: 0;
        bottom: 50%;
        transform: translate(-25%,50%);
      }
    }
  }
}
</style>

