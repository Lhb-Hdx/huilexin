<template>
  <el-dialog title="屏蔽告警推送" :visible.sync="showDialog" append-to-body width="40%" top="5vh">
    <div class="dialog-body">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="屏蔽设备" prop="ip">
          <el-select v-model="form.ip" style="width: 100%">
            <el-option v-for="item in deviceIp" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="屏蔽开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择屏蔽开始时间"
            @change="selectDate"
          />
        </el-form-item>
        <el-form-item label="屏蔽结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择结束开始时间"
            @change="selectDate"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="text"
            :readonly="true"
          />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button v-permission="['MaskingAlarmPushManage']" type="primary" @click="handleToMaskingAlarmPush">管理屏蔽告警推送</el-button>
      <el-button class="filter-item" type="primary" :loading="loading" @click="handleSave">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'MaskingAlarmPushDialog',
  data() {
    return {
      showDialog: false,
      options: {},
      loading: false,
      form: {
        ip: '',
        startTime: '',
        endTime: '',
        description: ''
      },
      deviceIp: [],
      rules: {
        ip: [{ required: true, message: '请选择屏蔽设备', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择屏蔽开始时间', trigger: 'blur' }],
        endTime: [{ required: true, message: '请选择屏蔽结束时间', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(options) {
      this.deviceIp = [
        {
          label: '所有设备',
          value: '*'
        },
        {
          label: options.ip,
          value: options.ip
        }
      ]
      this.$set(this.form, 'ip', options.ip)
      this.$set(this.form, 'description', options.description)
      this.$set(this.form, 'startTime', '')
      this.$set(this.form, 'endTime', '')
      this.options = options
      this.showDialog = true
    },
    handleSave() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
          this.loading = true
          this.$request({
            url: this.api.linkageManage.insertLinkageAlramFilter, data: this.form
          }).then(res => {
            this.loading = false
            if (res.code === 1) {
              this.showDialog = false
              this.$message({ type: 'success', message: res.msg })
            } else {
              this.$message({ type: 'error', message: res.msg })
            }
          })
        }
      })
    },
    selectDate() {
      if (this.form.startTime && this.form.endTime) {
        if (new Date(this.form.startTime).getTime() > new Date(this.form.endTime).getTime()) {
          this.$message('开始时间不能小于结束时间')
          this.$set(this.form, 'startTime', '')
          this.$set(this.form, 'endTime', '')
        } else {
          // if (this.form.startTime.getTime() < new Date().getTime()) {
          //   this.$message('不能选择过去时间')
          //   this.$set(this.form, 'startTime', '')
          //   this.$set(this.form, 'endTime', '')
          // }
        }
      }
    },
    handleToMaskingAlarmPush() {
      this.$router.push({
        name: 'MaskingAlarmPushList'
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
