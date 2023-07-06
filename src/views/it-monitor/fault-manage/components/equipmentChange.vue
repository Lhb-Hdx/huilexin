<template>
  <div>
    <el-card v-loading="loading">
      <el-row :gutter="20">
        <el-form ref="form" :model="form">
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="单位" prop="company" label-width="100px">
              <el-input v-model.trim="form.company" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="姓名" prop="name" label-width="100px">
              <el-input v-model.trim="form.name" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="电话" prop="tel" label-width="100px">
              <el-input v-model.trim="form.tel" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="类型" prop="changeType" label-width="100px">
              <el-input v-model.trim="form.changeType" />
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
              <el-input v-model.trim="form.changeAddress" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="机房" prop="room" label-width="100px">
              <el-input v-model.trim="form.room" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="网络区域" prop="netAddress" label-width="100px">
              <el-input v-model.trim="form.netAddress" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="设备位置" prop="deviceAddress" label-width="100px">
              <el-input v-model.trim="form.deviceAddress" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="设备类型" prop="deviceType" label-width="100px">
              <el-input v-model.trim="form.deviceType" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="变更内容" prop="changeContent" label-width="100px">
              <el-input v-model.trim="form.changeContent" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="变更设备名称" prop="deviceName" label-width="100px">
              <el-input v-model.trim="form.deviceName" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="变更设备ip" prop="deviceIp" label-width="100px">
              <el-input v-model.trim="form.deviceIp" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="影响设备名称" prop="influenceDeviceName" label-width="100px">
              <el-input v-model.trim="form.influenceDeviceName" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="影响设备ip" prop="influenceDeviceIp" label-width="100px">
              <el-input v-model.trim="form.influenceDeviceIp" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="影响详情" prop="influence" label-width="100px">
              <el-input v-model.trim="form.influence" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <el-form-item label="备注" prop="backup" label-width="100px">
              <el-input v-model.trim="form.backup" type="textarea" />
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    }
  },
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
      changeShow: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.findEsightChange(this.item)
    }
    )
  },
  methods: {
    // 变更设备
    findEsightChange(row) {
      this.$request({
        url: this.api.itMonitor.findEsightChange,
        data: { limit: -1, ip: row.ip }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            const form = {}
            Object.keys(this.form).forEach(key => {
              form[key] = res.data[0][key]
            })
            this.form = form
            this.$emit('setShow', true)
          }
        }
      })
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
