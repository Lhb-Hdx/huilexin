<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:90vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
          <el-form-item label="网关名称" prop="name">
            <el-input v-model="rulesForm.name" placeholder="请输入网关分组名称" />
          </el-form-item>
          <el-form-item label="备注" prop="backup">
            <el-input v-model="rulesForm.backup" placeholder="请输入备注信息" />
          </el-form-item>
          <el-form-item label="LOGO" prop="imgUrl">
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
          <el-form-item label="背景颜色" prop="backup">
            <el-color-picker v-model="rulesForm.color" class="col" />
            <el-col :span="22">
              <el-input v-model="rulesForm.color" class="col" placeholder="请输入背景颜色" />
            </el-col>
          </el-form-item>
        </el-form>
      </div>
      <div class="card-footer flex-v-center">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
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
        name: '', // 网关分组名称
        backup: '', // 备注
        imgUrl: '', // 图片路径
        color: '#ffffff' // 背景颜色
      },
      rules: {
        name: [{ required: true, message: '请输入网关名称', trigger: 'blur' }]
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
      return this.$route.query.id
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
      this.fileList = file['fileList']
      this.rulesForm.imgUrl = file.fileList[0]['url'] || ''
    },
    // 保存
    handleSubmit() {
      this.$refs['form'].validate(async(val) => {
        if (!val) return
        let { code } = await request({
          url: this.id ? api.itAgentGroup.updateHyitAgentGroup : api.itAgentGroup.insertHyitAgentGroup,
          data: { ...this.rulesForm, id: this.id }
        })
        if (code === 1) {
          this.$message({
            message: this.id ? '更新成功' : '添加成功',
            type: 'success'
          })
          this.$router.back()
        } else {
          this.$message({
            message: this.id ? '更新失败' : '添加失败',
            type: 'error'
          })
        }
      })
    },
    // 编辑进来获取信息
    async getWeixinConfig() {
      let res = await request({
        url: api.itAgentGroup.getHyitAgentGroup,
        data: { id: this.id }
      })
      if (res.code !== 1) return
      this.rulesForm = res.model
      if (res.model.imgUrl) {
        this.fileList = [{
          id: guid(),
          name: this.$tool.sliceFileName(res.model.imgUrl),
          url: res.model.imgUrl
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
.col {
  display: inline;
}

</style>
