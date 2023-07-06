<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="APP名称" prop="appName">
                <el-input v-model="form.appName" placeholder="请输入APP名称" />
              </el-form-item>
              <el-form-item label="所属应用" prop="parentId">
                <AiTreeInput
                  :key="reloadKey"
                  :level-start-num="0"
                  :field="{'id':'appId','name':'appName','parent':'parentId'}"
                  remote="/admin/findSysApp"
                  infoapi="/admin/getSysApp"
                  placeholder="请输入上层应用"
                  :param="{}"
                  :bind-value="form.parentId"
                  @input="inputParent"
                />
              </el-form-item>
              <el-form-item label="APP状态">
                <el-switch v-model="form.status" />
              </el-form-item>
              <el-form-item label="logo" prop="avatar">
                <FileUpload
                  button-text="选择图片"
                  upload-type="pic"
                  file-type=".png,.jpg"
                  file-url-list-type="picture"
                  :limit="1"
                  :button-disabled="false"
                  :is-limit-file-size="true"
                  :file-max-size="5"
                  :file-url-list="fileList"
                  @emitFileList="getEmitFileList"
                />
              </el-form-item>
              <el-form-item label="描述" prop="appDesc">
                <el-input v-model="form.appDesc" type="textarea" placeholder="请输入描述" />
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
  </div>
</template>

<script>
import FileUpload from '@/components/Upload/file-upload'
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
import request from '@/utils/request'
import { guid } from '@/utils/utils'
import api from '@/api/api'

export default {
  name: 'SysAppAddUpdate',
  components: { AiTreeInput, FileUpload },
  data() {
    return {
      form: {
        appName: '',
        parentId: 0,
        status: 0,
        appDesc: '',
        picture: ''
      },
      fileList: [],
      host: '',
      rules: {
        appName: [{ required: true, message: '请输入APP名称', trigger: 'blur' }]
      },
      loading: false,
      confirmLoading: false,
      reloadParent: false,
      reloadKey: 'reloadKey',
      inputParentId: 0
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
  created() {
    this.host = window.location.host // 获取当前域名
  },
  mounted() {
    if (this.id) {
      this.loadDetail()
    }
  },
  methods: {
    // 上传图片
    getEmitFileList(file) {
      console.log(file)
      this.fileList = file['fileList']
      // this.form.picture = `http://${this.host}${file.fileList[0]['url']}` || ''
      file.length && (this.form.picture = file.map[0]['original'] || '') // 上传图片画质为原图
    },
    loadDetail() {
      request({
        url: api.sysApp.getSysApp, data: { appId: this.id }
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          res.model.status = Boolean(res.model.status)
          this.form = res.model
          this.inputParentId = res.model.parentId
          if (res.model.picture) {
            this.fileList = [{
              id: guid(),
              name: this.$tool.sliceFileName(res.model.picture),
              url: res.model.picture
            }]
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          this.form.status = this.form.status ? 1 : 0
          this.form.parentId = this.inputParentId
          request({
            url: (this.form.appId && this.form.appId > 0) ? api.sysApp.updateSysApp : api.sysApp.insertSysApp, data: this.form
          }).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.$router.back()
            } else {
              this.$message.error(res.msg)
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    inputParent(val) {
      this.inputParentId = val
    },
    onReset() {
      this.$refs['form'].resetFields()
      this.fileList = []
    }
  }
}
</script>

<style lang="scss"  scoped>
.router-list {
  border: 1px solid #ebeef5;
  .router-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  .router-list-content {
    padding: 10px;
    .list-content-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .router-menu-info {
        .router-menu-name {
          margin-left: 10px;
        }
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}
</style>
