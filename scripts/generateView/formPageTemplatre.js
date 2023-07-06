module.exports = {
  formPageTemplate: compoenntName => {
    return `<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="${compoenntName}Form" :model="${compoenntName}Form" :rules="${compoenntName}FormRules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="" prop="">
                <el-button type="primary" :loading="confirmLoading" @click="saveCmdbItemType">保存</el-button>
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
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: '${compoenntName}',
  data() {
    return {
      // 表单数据
      ${compoenntName}Form: {},
      // 表单主键ID
      ${compoenntName}FormId: '',
      // 校验规则
      ${compoenntName}FormRules: {},
      // 提交loading
      confirmLoading: false
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  methods: {
    // 提交
    onSubmit() {},
    // 重置
    onReset() {}
  }
}
</script>
<style lang="less" scoped>
</style>
`
  }
}
