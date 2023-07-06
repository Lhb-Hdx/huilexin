<template>
  <div>
    <div class="page-nav">
      <el-page-header :content="navTitle" @back="goBack" />
    </div>
    <div class="app-container">
      <el-card>
        <el-row :gutter="20">
          <el-form ref="form" :model="form" :rules="rules">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="线缆名称" prop="name" label-width="100px">
                <el-input v-model.trim="form.name" placeholder="请输入线缆名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="规格程式 " prop="specifications" label-width="100px">
                <el-input v-model.trim="form.specifications" placeholder="请输入规格程式 " />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="机柜" prop="cabinet" label-width="100px">
                <el-input v-model.trim="form.cabinet" placeholder="请输入机柜" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="From" prop="hostFrom" label-width="100px">
                <el-input v-model.trim="form.hostFrom" placeholder="请输入From" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="端口号" prop="port" label-width="100px">
                <el-input v-model.trim="form.port" placeholder="请输入端口号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="机柜2" prop="cabinet2" label-width="100px">
                <el-input v-model.trim="form.cabinet2" placeholder="请输入机柜2" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="T0" prop="hostTo" label-width="100px">
                <el-input v-model.trim="form.hostTo" placeholder="请输入T0" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="端口号2 " prop="port2" label-width="100px">
                <el-input v-model.trim="form.port2" placeholder="请输入端口号2 " />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="布放方式" prop="lineType" label-width="100px">
                <el-input v-model.trim="form.lineType" placeholder="请输入布放方式" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="条数" prop="lineCount" label-width="100px">
                <el-input v-model.trim="form.lineCount" placeholder="请输入条数" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="平均条长" prop="avgLine" label-width="100px">
                <el-input v-model.trim="form.avgLine" placeholder="请输入平均条长（米）" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="数量" prop="lineLong" label-width="100px">
                <el-input v-model.trim="form.lineLong" placeholder="数量（米）" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="备注" prop="backup" label-width="100px">
                <el-input v-model.trim="form.backup" type="textarea" placeholder="备注" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="" label-width="100px">
                <el-button type="primary" :loading="loading" @click="onSubmit">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </el-card>
    </div>
  </div>
</template>
<script>

export default {
  components: {
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10
      },
      form: {
        name: '',
        specifications: '',
        cabinet: '',
        hostFrom: '',
        port: '',
        cabinet2: '',
        hostTo: '',
        port2: '',
        lineType: '',
        lineCount: '',
        avgLine: '',
        lineLong: '',
        backup: ''
      },
      loading: false,
      rules: {
        name: [
          { required: true, message: '请输入线缆名称', trigger: 'blur' }
        ]
      }
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
  mounted() {
    if (this.id) {
      console.log(this.id)
      this.getEsightLine()
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    onReset() { // 清空内容-重置
      this.$refs['form'].resetFields()
    },
    // 获取编辑数据
    getEsightLine() {
      this.$request({
        url: this.api.itMonitor.getEsightLine, data: { id: this.id }
      }).then(res => {
        if (res.code === 1) {
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res.model[key]
          })
          this.form = form
        }
      })
    },
    // 保存
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.id) { // 编辑
            this.loading = true
            this.$request({
              url: this.api.itMonitor.updateEsightLine, data: { id: this.id, ...this.form }
            }).then(res => {
              if (res.code === 1) {
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          } else { // 新增
            this.loading = true
            this.$request({
              url: this.api.itMonitor.insertEsightLine, data: {...this.form}
            }).then(res => {
              if (res.code === 1) {
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          }
        }
      })
    }
  }
}
</script>
  <style lang="scss" scoped>
  </style>

