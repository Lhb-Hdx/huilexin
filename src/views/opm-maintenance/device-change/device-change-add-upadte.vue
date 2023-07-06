<template>
  <div>
    <div class="page-nav">
      <el-page-header :content="navTitle" @back="goBack" />
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-row :gutter="20">
          <el-form ref="form" :model="form" :rules="rules">
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="单位" prop="company" label-width="100px">
                <el-input v-model.trim="form.company" placeholder="请输入申请单位" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="姓名" prop="name" label-width="100px">
                <el-input v-model.trim="form.name" placeholder="请输入申请人姓名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="电话" prop="tel" label-width="100px">
                <el-input v-model.trim="form.tel" placeholder="请输入申请人电话" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="类型" prop="changeType" label-width="100px">
                <el-input v-model.trim="form.changeType" placeholder="请输入申请类型" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="开始时间" prop="changeStartTime" label-width="100px">
                <el-date-picker v-model="form.changeStartTime" class="filter-item" type="datetime" placeholder="变更开始时间" value-format="yyyy-MM-dd HH:mm:ss" style="width: 200px;" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="结束时间" prop="changeEndTime" label-width="100px">
                <el-date-picker v-model="form.changeEndTime" class="filter-item" type="datetime" placeholder="变更结束时间" value-format="yyyy-MM-dd HH:mm:ss" style="width: 200px;" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="地址" prop="changeAddress" label-width="100px">
                <el-input v-model.trim="form.changeAddress" placeholder="请输入操作地址" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="机房" prop="room" label-width="100px">
                <el-input v-model.trim="form.room" placeholder="请输入机房" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="网络区域" prop="netAddress" label-width="100px">
                <el-input v-model.trim="form.netAddress" placeholder="请输入网络区域" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="设备位置" prop="deviceAddress" label-width="100px">
                <el-input v-model.trim="form.deviceAddress" placeholder="请输入设备位置" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="设备类型" prop="deviceType" label-width="100px">
                <el-input v-model.trim="form.deviceType" placeholder="请输入设备类型" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="变更内容" prop="changeContent" label-width="100px">
                <el-input v-model.trim="form.changeContent" placeholder="请输入变更内容" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="变更设备名称" prop="deviceName" label-width="100px">
                <el-input v-model.trim="form.deviceName" placeholder="请输入变更设备名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="变更设备ip" prop="deviceIp" label-width="100px">
                <el-input v-model.trim="form.deviceIp" placeholder="请输入变更设备ip" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="影响设备名称" prop="influenceDeviceName" label-width="100px">
                <el-input v-model.trim="form.influenceDeviceName" placeholder="请输入影响设备名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="影响设备ip" prop="influenceDeviceIp" label-width="100px">
                <el-input v-model.trim="form.influenceDeviceIp" placeholder="请输入影响设备ip" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="影响详情" prop="influence" label-width="100px">
                <el-input v-model.trim="form.influence" placeholder="请输入影响详情" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
              <el-form-item label="备注" prop="backup" label-width="100px">
                <el-input v-model.trim="form.backup" type="textarea" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="" label-width="100px">
                <el-button type="primary" :loading="loading" @click="onSubmit">保存</el-button>
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
  data() {
    return {
      form: {
        company: '',
        name: '',
        tel: '',
        changeType: '',
        changeAddress: '',
        changeStartTime: '',
        changeEndTime: '',
        room: '',
        netAddress: '',
        deviceAddress: '',
        deviceType: '',
        changeContent: '',
        deviceName: '',
        deviceIp: '',
        influenceDeviceName: '',
        influenceDeviceIp: '',
        influence: '',
        backup: ''
      },
      loading: false,
      rules: {
        company: [
          { required: true, message: '请输入申请单位', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入申请人姓名', trigger: 'blur' }
        ],
        tel: [
          { required: true, message: '请输入申请人电话', trigger: 'blur' }
        ],
        changeStartTime: [
          { required: true, message: '请选择变更开始时间', trigger: 'blur' }
        ],
        changeEndTime: [
          { required: true, message: '请选择变更结束时间', trigger: 'blur' }
        ],
        deviceIp: [
          { required: true, message: '请输入影响设备ip', trigger: 'blur' }
        ]
      }
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
  mounted() {
    if (this.id) {
      this.getEsightChange()
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    getEsightChange() {
      this.$request({
        url: this.api.itMonitor.getEsightChange, data: { id: this.id }
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
            // const data = { ...this.form }
            // delete data.createtime
            this.$request({
              url: this.api.itMonitor.updateEsightChange, data: { id: this.id, ...this.form }
            }).then(res => {
              this.$router.back()
            }).finally(() => {
              this.loading = false
            })
          } else { // 新增
            this.loading = true
            this.$request({
              url: this.api.itMonitor.insertEsightChange, data: {...this.form}
            }).then(res => {
              this.$router.back()
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

