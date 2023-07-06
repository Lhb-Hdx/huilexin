<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:88vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form :model="rulesForm" label-width="120px">
          <el-form-item label="签名">
            <el-input v-model="rulesForm.a" placeholder="请输入签名" />
          </el-form-item>
          <el-form-item label="服务商地区">
            <el-input v-model="rulesForm.c" placeholder="请输入服务商地区" />
          </el-form-item>
          <el-form-item label="AccessKeyID">
            <el-input v-model="rulesForm.e" placeholder="请输入AccessKeyID" />
          </el-form-item>
          <el-form-item label="AccessSecret">
            <el-input v-model="rulesForm.d" placeholder="请输入AccessSecret" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="rulesForm.e" placeholder="请输入domain" />
          </el-form-item>
          <el-form-item label="版本号">
            <el-input v-model="rulesForm.e" placeholder="请输入版本号" />
          </el-form-item>
          <el-form-item label="短信模板号">
            <el-input v-model="rulesForm.e" placeholder="请输入短信模板号" />
          </el-form-item>
          <el-form-item label="短信模板内容">
            <el-input v-model="rulesForm.e" placeholder="请输入短信模板内容" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
      </div>
      <div class="card-footer flex-v-center">
        <el-button type="primary">保存</el-button>
        <el-button>关闭</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rulesForm: {
        a: ''
      },
      options: [{ label: 1, value: '1' }]
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
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
