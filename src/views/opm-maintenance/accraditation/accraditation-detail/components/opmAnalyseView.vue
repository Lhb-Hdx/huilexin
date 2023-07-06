<template>
  <div class="ompAnalyseView">
    <template>
      <el-form :model="form">
        <!-- <el-form-item label="名称" label-width="70px" prop="name">
          <el-input v-model="form.name" />
        </el-form-item> -->
        <el-form-item label="分析内容" label-width="70px" prop="content">
          <Editor ref="text" v-model="form.content" class="myQuillEditor ql-editor-class" placeholder="执行任务的信息描述" />
        </el-form-item>
        <el-form-item label="附件" label-width="50px">
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
      </el-form>
      <el-divider />
      <el-button :loading="loading" type="primary" @click="handleSave">保存</el-button>
    </template>
    <h3 v-if="analysisList.length>0" class="under-line font-16 mb-10">分析</h3>
    <div class="detailAnalyze-content margin-top-15">
      <div v-for="item in analysisList" :key="item.id" class="detailAnalyze-content-item">
        <div class="detailAnalyze-content-item-title flex align-center space-between">
          <!-- <h2 class="font-weigth overflow-text-a no-margin-bottom" style="width: 70%">{{ item.name }}</h2> -->
          <div class="flex-h-center">
            <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <span class="ml-8 overflow-text-a">{{ item.userName }}</span>
          </div>
          <div class="box-right">
            <el-button v-if="info.matter.statue!==7" type="primary" size="mini" @click="deleteOrderAnalyze(item)"> 删除</el-button>
          </div>
        </div>
        <div class="detailAnalyze-content-item-box">
          <div class="box-left">
            <div class="flex space-between">
              <div v-html="item.content">
                <!-- 分析：
                <el-link type="primary" class="font-12" @click="getAnalyzeDetail(item)">查看</el-link> -->
              </div>
            </div>
            <div v-for="fitem in item.fileList" :key="fitem.id">{{ fitem.fileName }}
              <el-link v-down="fitem.fileUrl" type="primary" class="font-12">下载</el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-if="!analysisList.length" description="暂无分析" />
    <!-- <el-dialog class="abow_dialog" title="查看分析" :visible.sync="showAnalyzeDetailDialog" width="80%" top="5vh">
      <div class="dialog-body">
        <div v-html="analyzeDetailContent" />
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import Editor from '@/components/QuillEditorComponent/editor.vue'
import FileUpload from '@/components/Upload/file-upload.vue'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  components: {
    Editor,
    FileUpload
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
        name: '',
        type: 1, // 类型
        orderType: 1, // 工单类型
        content: '' // 富文本内容
      },
      loginUser: {},
      fileList: [],
      findOpsOrderAnalysisQuery: {
        type: 1,
        orderType: 1,
        page: 1,
        limit: -1
      },
      analysisList: [],
      analysisTotal: 0,
      showAnalyzeDetailDialog: false,
      analyzeDetailContent: '',
      loading: false
    }
  },
  computed: {
    id() { return this.$route.query.id },
    isLockUser() {
      return Number(this.info.matter.lockUserId) === Number(this.loginUser.userId)
    }
  },
  mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.findOpsOrderAnalysis()
  },
  methods: {
    // 监听上传组件
    getEmitFileList(files) { this.fileList = files.fileList },
    // 点击保存
    async handleSave() {
      const data = { ...this.form, orderId: this.id, userId: this.loginUser.userId }
      const insertOpsOrderAnalysisResult = await this.insertOpsOrderAnalysis(data)
      this.insertOpsOrderFile(insertOpsOrderAnalysisResult.id)
      if (insertOpsOrderAnalysisResult) {
        // this.analysisList = []
        this.$refs.fileUpload.fileList = []
        this.form.content = ''
      }
    },
    //  删除分析
    deleteOrderAnalyze(item) {
      this.$confirm(`确认删除分析报告吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let { code, model } = await request({
          url: api.opm.deleteOpsOrderAnalysis,
          data: item
        })
        if (code !== 1) return
        this.findOpsOrderAnalysis()
        console.log(code, model)
      }).catch(() => {})
    },
    // 新增分析
    async insertOpsOrderAnalysis(data) {
      this.loading = true
      let { code, model } = await request({
        url: api.opm.insertOpsOrderAnalysis,
        data
      })
      this.loading = false
      if (code !== 1) return
      this.$set(this.form, 'content', '')
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
            type: 1,
            orderType: 1,
            userId: this.loginUser.userId,
            linkId: id,
            fileUrl: item.url,
            fileName: item.name
          }
        })
      })
      this.fileList = []
      this.findOpsOrderAnalysis()
    },

    // 分析列表
    findOpsOrderAnalysis() {
      request({
        url: api.opm.findOpsOrderAnalysis,
        data: {
          ...this.findOpsOrderAnalysisQuery, orderId: this.id
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
    // 查询附件
    async findOpsOrderFile(linkIds) {
      let { code, data } = await request({
        url: api.opm.findOpsOrderFile,
        data: {
          type: 1,
          orderType: 1,
          linkIds
        }
      })
      if (code !== 1) return
      return data
    },
    getAnalyzeDetail(row) {
      this.showAnalyzeDetailDialog = true
      this.analyzeDetailContent = row.content
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding:6px 15px;
      line-height: 24px;

    }
  }
}
</style>

