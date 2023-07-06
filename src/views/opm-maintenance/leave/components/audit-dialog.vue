<template>
  <el-dialog title="审批" :visible.sync="showDialog" width="40%" top="5vh">
    <div class="dialog-body">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="审批状态" prop="approveStatue">
          <el-select v-model="form.approveStatue" placeholder="请选择审批状态" style="width: 100%">
            <el-option v-for="item in audioStatus" :key="item.key" :label="item.value" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="意见" prop="backup">
          <el-input v-model.trim="form.backup" placeholder="意见" />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" :loading="loading" @click="handleCompleteActivity">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      showDialog: false,
      form: {
        taskId: '',
        approveStatue: '',
        backup: ''
      },
      rules: {
        approveStatue: [{ required: true, message: '请选择审批状态', trigger: 'blur' }]
      },
      audioStatus: [
        { key: 1, value: '通过' },
        { key: 2, value: '不通过' },
        { key: 6, value: '驳回' }
      ]
    }
  },
  methods: {
    // 打开
    async open(options) {
      console.log(options)
      if (options) {
        this.$set(this.form, 'taskId', options.taskId)
        this.showDialog = true
      }
    },
    // 确定
    handleCompleteActivity() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
          this.loading = true
          this.$request({
            url: this.api.activity.completeActivity, data: this.form
          }).then(res => {
            this.loading = false
            if (res.code === 1) {
              this.showDialog = false
              this.$message({ type: 'success', message: '审核成功' })
              this.$EventBus.$emit('reloadOvertimeList')
            } else {
              this.$message({ type: 'error', message: res.msg })
            }
          })
        }
      })
    }
  }
}
</script>
