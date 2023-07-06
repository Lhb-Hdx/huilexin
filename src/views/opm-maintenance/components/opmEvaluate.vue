<template>
  <div>
    <template v-if="Number(info.matter.lockUserId) !== Number(loginUser.userId)">
      <el-form :model="form">
        <el-form-item label="评分" label-width="70px" prop="name">
          <el-rate v-model="form.star" />
        </el-form-item>
        <el-form-item label="评价内容" label-width="70px" prop="content">
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
            :file-max-size="2"
            :file-url-list="form.fileUrlList"
            @emitFileList="getEmitFileList"
          />
        </el-form-item>
      </el-form>
    </template>
    <el-divider />
    <el-button :loading="loading" type="primary" @click="handleSave">保存</el-button>
    <h3 v-if="evaluateList.length > 0" class="under-line font-16 mb-10">总结&方案</h3>
    <div class="detailAnalyze-content margin-top-15">
      <div v-for="item in evaluateList" :key="item.id" class="detailAnalyze-content-item">
        <div class="detailAnalyze-content-item-title align-center">
          <div class="flex-h-center">
            <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <span class="ml-8 overflow-text-a">{{ item.userName }}</span>
            <el-rate class="ml-8" :value="item.star" style="line-height: 1" />
            <span class="ml-30">{{ item.createTime }}</span>
          </div>
        </div>
        <div class="font-weigth overflow-text-a no-margin-bottom px-10" style="width: 70%" v-html="item.content" />
        <div class="detailAnalyze-content-item-box">
          <div class="box-left">
            <!-- <div class="flex space-between">
              <div>
                分析：
                <el-link type="primary" class="font-12" @click="getAnalyzeDetail(item)">查看</el-link>
              </div>

            </div> -->
            <div v-for="fitem in item.fileList" :key="fitem.id">
              {{ fitem.fileName }}
              <el-link v-down="fitem.fileUrl" type="primary" class="font-12">下载</el-link>
            </div>
          </div>

          <!-- <div class="box-right">
            <el-button type="primary" size="mini" @click="deleteOrderAnalyze(item)"> 删除</el-button>
          </div> -->
        </div>
      </div>
    </div>
    <!-- <el-empty v-if="!evaluateList.length" description="暂无总结&方案" /> -->
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
      form: {},
      loginUser: {},
      fileList: [],
      listQuery: {
        type: 2,
        orderType: 1,
        page: 1,
        limit: -1
      },
      evaluateList: [],
      analysisTotal: 0,
      showAnalyzeDetailDialog: false,
      analyzeDetailContent: '',
      loading: false
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    isLockUser() {
      return Number(this.info.matter.lockUserId) === Number(this.loginUser.userId)
    }
  },
  mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.initData()
  },
  methods: {
    async initData() {
      let { code, data } = await request({
        url: api.opm.findOpsOrderProblemEvaluate,
        data: {
          problemId: this.$route.query.id,
          limit: -1
        }
      })
      if (code !== 1) return
      let fileList = []
      let userList = []
      if (data.length) {
        fileList = await this.findOpsOrderFile(data.map(it => it.id).filter(Boolean))
        userList = await this.findSysUser(data.map(it => it.userId).filter(Boolean))
      }
      for (const it of data) {
        const files = fileList.filter(item => +item.linkId === +it.id)
        it.fileList = files
        const idx = userList.find(item => +item.userId === +it.userId)
        if (idx) it['userName'] = idx['realName']
      }
      this.evaluateList = data
    },

    // 监听上传组件
    getEmitFileList(files) {
      this.fileList = files.fileList
    },
    // 点击保存
    async handleSave() {
      if (!this.form.content) return this.$message.error('请输入评价内容')
      let { code, model } = await request({
        url: api.opm.insertOpsOrderProblemEvaluate,
        data: {
          ...this.form,
          userId: this.loginUser.userId,
          problemId: this.$route.query.id
        }
      })
      if (code !== 1) return this.$message.error('添加失败')
      await this.insertOpsOrderFile(model.id)
      this.$message.success('添加成功')
      // Object.keys(this.form).forEach(it => { this.form[it] = '' })
      this.fileList = []
      this.initData()
    },
    // 新增附件
    insertOpsOrderFile(id) {
      for (const item of this.fileList) {
        request({
          url: api.opm.insertOpsOrderFile,
          data: {
            type: 3,
            orderType: 1,
            userId: this.loginUser.userId,
            linkId: id,
            fileUrl: item.url,
            fileName: item.name
          }
        })
      }
    },
    // 查询附件
    async findOpsOrderFile(linkIds) {
      let { code, data } = await request({
        url: api.opm.findOpsOrderFile,
        data: {
          type: 3,
          orderType: 1,
          linkIds
        }
      })
      if (code !== 1) return
      return data
    },
    async findSysUser(ids) {
      let { code, data } = await request({
        url: api.knowledge.findSysUser,
        data: {
          ids
        }
      })
      if (code !== 1) return []
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-rate {
  line-height: 2;
}
::v-deep .myQuillEditor {
  .ql-container.ql-snow {
    height: 210px;
  }

  .ql-editor {
    height: 200px;
  }
}

.detailAnalyze-content {
  padding: 0 20px 0 0;
  .detailAnalyze-content-item {
    background-color: #f4f4f5;
    margin-bottom: 10px;
    border-left: 2px solid #05b387;
    .detailAnalyze-content-item-title {
      border-bottom: 1px solid #e0e0e0;
      padding: 10px 15px;
      align-items: center;
      h2 {
        margin-top: 0;
      }
    }
    .detailAnalyze-content-item-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 15px;
      line-height: 24px;
    }
  }
}
</style>
