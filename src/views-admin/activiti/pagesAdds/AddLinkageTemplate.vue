<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:90vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
          <el-form-item label="模板名称" prop="hyModeName">
            <el-input v-model="rulesForm.hyModeName" placeholder="请输入模板名称" />
          </el-form-item>

          <el-form-item label="请输入模板正文" prop="hyModeInfo">
            <Editor ref="text" v-model="rulesForm.hyModeInfo" class="myQuillEditor ql-editor-class" placeholder="执行任务的信息描述" />
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
import request from '@/utils/request'
import api from '@/api/api'
import Editor from '@/components/QuillEditorComponent/editor.vue'
export default {
  components: {
    Editor
  },
  data() {
    return {
      loading: false,
      rulesForm: {
        hyModeName: '',
        hyModeInfo: ''
      },
      options: [{ label: 1, value: '1' }],
      rules: {
        hyModeName: [{ required: true, message: '请输入', trigger: 'blur' }],
        hyModeInfo: [{ required: true, message: '请输入', trigger: 'blur' }]
      }
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.hyMhId
    }
  },
  created() {
    if (this.id) {
      this.getHyitModelHtml()
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate(async(val) => {
        if (!val) return
        this.$refs['form'].validate(async(val) => {
          if (!val) return
          this.loading = true
          let { code } = await request({
            url: this.id ? api.linkageManage.updateHyitModelHtml : api.linkageManage.insertHyitModelHtml,
            data: { ...this.rulesForm, hyStatus: this.id ? this.rulesForm.hyStatus : 1 }
          })
          this.loading = false
          if (code !== 1) return
          this.$message({
            message: this.id ? '更新成功' : '添加成功',
            type: 'success'
          })
          this.$router.back()
        })
      })
    },
    async getHyitModelHtml() {
      let { model, code } = await request({
        url: api.linkageManage.getHyitModelHtml,
        data: { hyMhId: this.id }
      })
      if (code !== 1) return
      this.rulesForm = model
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
