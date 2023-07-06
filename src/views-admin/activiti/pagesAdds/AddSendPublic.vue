<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:90vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
          <el-form-item label="应用名称" prop="applicationName">
            <el-input v-model="rulesForm.applicationName" placeholder="请输入应用名称" />
          </el-form-item>
          <el-form-item label="AppKey" prop="appKey">
            <el-input v-model="rulesForm.appKey" placeholder="请输入AppKey" />
          </el-form-item>
          <el-form-item label="应用密钥" prop="secret">
            <el-input v-model="rulesForm.secret" placeholder="请输入应用密钥" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="value"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="changeStatus"
            />
          </el-form-item>
          <el-form-item label="公众号二维码" prop="avatar">
            <FileUpload
              button-text="选择图片"
              upload-type="pic"
              file-type=".png,.jpg"
              file-url-list-type="picture"
              :limit="1"
              :button-disabled="false"
              :is-limit-file-size="true"
              :file-max-size="1"
              :file-url-list="fileList"
              @emitFileList="getEmitFileList"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="card-footer flex-v-center">
        <el-button v-permission="['submit']" :loading="loading" type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="$router.back()">关闭</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import FileUpload from '@/components/Upload/file-upload'
import request from '@/utils/request'
import api from '@/api/api'
import { guid } from '@/utils/utils'
export default {
  components: {
    FileUpload
  },
  data() {
    return {
      rulesForm: {
        applicationName: '', // 应用名称
        appKey: '', // 应用ID
        secret: '', // 应用密钥
        status: '', // 状态enable启用；disable停用
        classify: 'weixin', // 类型，微信公众号
        avatar: '' // 图片路径
      },
      loading: false,
      rules: {
        applicationName: [{ required: true, message: '请输入', trigger: 'blur' }],
        appKey: [{ required: true, message: '请输入', trigger: 'blur' }],
        secret: [{ required: true, message: '请输入', trigger: 'blur' }],
        status: [{ required: true, message: '请输入', trigger: 'blur' }]
        // avatar: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      fileList: [],
      value: false,
      host: '' // 当前域名
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.applicationId
    }
  },
  created() {
    this.host = window.location.host // 获取当前域名
    if (this.id) {
      this.getWeixinConfig()
    }
  },
  methods: {
    // 上传图片
    getEmitFileList(file) {
      console.log(file)
      this.fileList = file['fileList']
      this.rulesForm.avatar = `http://${this.host}${file.fileList[0]['url']}` || ''
    },
    // 改变status对应数值
    changeStatus() {
      if (this.value === true) {
        this.rulesForm.status = 'enable'
      } else if (this.value === false) {
        this.rulesForm.status = 'disable'
      }
    },
    // 保存
    handleSubmit() {
      console.log(this.rulesForm.avatar)
      delete this.rulesForm.createDate
      delete this.rulesForm.updateDate
      this.changeStatus()
      this.$refs['form'].validate(async(val) => {
        if (!val) return
        this.loading = true
        let { code } = await request({
          url: this.id ? api.linkageManage.updateSysMobileApplication : api.linkageManage.insertSysMobileApplication,
          data: { ...this.rulesForm, status: this.rulesForm.status, applicationId: this.id }
        })
        this.loading = false
        if (code !== 1) return
        this.$message({
          message: this.id ? '更新成功' : '添加成功',
          type: 'success'
        })
        this.$router.back()
      })
    },
    // 编辑进来获取信息
    async getWeixinConfig() {
      let { model, code } = await request({
        url: api.linkageManage.getSysMobileApplication,
        data: { applicationId: this.id }
      })
      if (code !== 1) return
      this.rulesForm = model
      console.log(this.rulesForm)
      if (this.rulesForm.status === 'enable') {
        this.value = true
      } else if (this.rulesForm.status === 'disable') {
        this.value = false
      }
      if (model.avatar) {
        this.fileList = [{
          id: guid(),
          name: this.$tool.sliceFileName(model.avatar),
          url: model.avatar
        }]
      }

      console.log(guid())
    }
  }
}
</script>

<style scoped lang="scss">
 .actionTemplate{
 ::v-deep .card{
  position: relative;
}
.content{
  padding: 20px 20px 100px 20px;
  width: 700px;
  margin: auto;
}
.card-footer{
  padding: 20px;
}
}

</style>

