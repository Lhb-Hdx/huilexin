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
            <el-input v-model="rulesForm.appKey" placeholder="请输入应用Key" />
          </el-form-item>
          <el-form-item label="应用密钥" prop="secret">
            <el-input v-model="rulesForm.secret" placeholder="请输入应用密钥" />
          </el-form-item>
          <el-form-item label="公众号" prop="parentId">
            <el-select v-model="rulesForm.parentId" placeholder="请选择">
              <el-option
                v-for="(item,index) in options"
                :key="index"
                :label="item.applicationName"
                :value="item.applicationId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="value"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="changeStatus"
            />
          </el-form-item>
          <el-form-item label="小程序二维码" prop="avatar">
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
        <el-button :loading="loading" type="primary" @click="handleSubmit">保存</el-button>
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
        parentId: '', // 关联公众号（Integer）
        status: '', // 状态enable启用；disable停用
        classify: 'wxapp', // 类型，微信小程序
        avatar: '' // 图片路径
      },
      rules: {
        applicationName: [{ required: true, message: '请输入', trigger: 'blur' }],
        appKey: [{ required: true, message: '请输入', trigger: 'blur' }],
        secret: [{ required: true, message: '请输入', trigger: 'blur' }],
        parentId: [{ required: true, message: '请选择', trigger: 'change' }],
        status: [{ required: true, message: '请选择', trigger: 'change' }]
        // avatar: [{ required: true, message: '请选择', trigger: 'change' }]

      },
      value: false,
      loading: false,
      fileList: [],
      host: '', // 当前域名
      options: [] // 公众号数据
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.applicationId
    },
    appId() {
      return this.$route.query.appId
    }
  },
  created() {
    this.host = window.location.host // 获取当前域名
    if (this.id) {
      this.getWeixinConfig()
    }
    if (this.appId) {
      this.rulesForm.parentId = this.appId
    }
    this.getApplication()
  },
  methods: {
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.rulesForm.avatar = `http://${this.host}${file.fileList[0]['url']}` || ''
    },
    // 改变status对应数值
    changeStatus() {
      console.log(111)
      if (this.value === true) {
        this.rulesForm.status = 'enable'
        console.log(this.rulesForm.status)
      } else if (this.value === false) {
        this.rulesForm.status = 'disable'
        console.log(this.rulesForm.status)
      }
    },
    // 获取公众号下拉框数据
    getApplication() {
      request({
        url: api.linkageManage.findSysMobileApplication,
        data: {
          page: 1,
          limit: -1,
          classify: 'weixin'
        }
      }).then(res => {
        this.options = res.data
        console.log(this.options)
      })
    },
    // 保存
    handleSubmit() {
      this.changeStatus()
      delete this.rulesForm.createDate
      delete this.rulesForm.updateDate
      this.$refs['form'].validate(async(val) => {
        console.log(val)
        if (!val) return
        this.loading = true
        let { code } = await request({
          url: this.id ? api.linkageManage.updateSysMobileApplication : api.linkageManage.insertSysMobileApplication,
          data: { ...this.rulesForm, status: this.rulesForm.status }
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
      console.log(model)
      this.rulesForm = model
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

