<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :inline="false" :model="form" :rules="rules" label-width="80px" size="normal">
          <el-form-item label="类型ID" prop="typeId" style="width:400px">
            <el-select v-model="form.typeId" placeholder="请选择" style="width:400px" @change="changTypeId">
              <el-option
                v-for="item in typelist"
                :key="item.hyDevTypeId"
                :label="item.hyDevTypeName"
                :value="item.hyDevTypeId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设备ID" prop="deviceId" style="width:400px">
            <el-select v-model="form.deviceId" placeholder="请选择" style="width:400px">
              <el-option
                v-for="item in devicelist"
                :key="item.hyDeviceId"
                :label="(item.hyAlias||'')+`(${item.hyAddr})`"
                :value="item.hyDeviceId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="栏目名称" prop="columnName" size="normal" style="width:400px">
            <el-input v-model="form.columnName" placeholder="请输入" width="220" />
          </el-form-item>
          <el-form-item label="样式" prop="displayPercentage" size="normal">
            <el-radio-group v-model="form.displayType">
              <el-radio key="1" :label="0">数值</el-radio>
              <el-radio key="2" :label="1">历史</el-radio>
              <el-radio key="3" :label="2">仪表盘</el-radio>
              <el-radio key="4" :label="3">开关</el-radio>
              <el-radio key="5" :label="4">多数据柱状</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="优先级" prop="priority" size="normal">
            <el-input-number v-model="form.priority" :max="20" :min="1" label="描述文字" />
          </el-form-item>
          <el-form-item>
            <el-button v-permission="['submit']" type="primary" @click="onSubmit">提交</el-button>
            <el-button @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'ContentUnionDeviceAddUpdate',
  components: { },
  data() {
    return {
      id: '',
      loading: false,
      confirmLoading: false,
      form: {
        typeId: '',
        columnName: '',
        deviceId: '',
        priority: '',
        displayPercentage: 30,
        displayType: 0
      },
      typelist: [],
      devicelist: [],
      rules: {
        typeId: [{ required: true, message: '请选择', trigger: 'blur' }],
        deviceId: [{ required: true, message: '请选择', trigger: 'blur' }],
        columnName: [{ required: true, message: '请输入', trigger: 'blur' }],
        priority: [{ required: true, message: '请输入', trigger: 'blur' }],
        // displayPercentage: [{ required: true, message: '请输入', trigger: 'blur' }],
        displayType: [{ required: true, message: '请输入', trigger: 'blur' }]
      }
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    }
  },
  async created() {
    if (this.$route.query.id) {
      this.id = this.$route.query.id
      await this.getHyitDhMenu()
    }
    await this.findHyitDevType()
    // await this.findHyitDevice()
  },

  methods: {
    changTypeId() {
      console.log('修改')
      this.$set(this.form, 'deviceId', '')
      this.findHyitDevice()
    },
    async findHyitDevType() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevType, data: { limit: -1, pid: 2 }})
      if (code !== 1) return
      this.typelist = data
      await this.findHyitDevice()
    },
    async findHyitDevice() {
      const hyDevTypeValue = this.typelist.find(it => it.hyDevTypeId === this.form.typeId)
      if (!hyDevTypeValue) return
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { limit: -1, hyDevTypeValue: hyDevTypeValue.hyDevTypeValue }})
      if (code !== 1) return
      this.devicelist = data
    },
    async getHyitDhMenu() {
      let { code, model } = await request({ url: api.powerEnv.getHyitDhMenu, data: { id: this.$route.query.id }})
      if (code !== 1) return
      this.form = model
    },
    onSubmit() {
      this.$refs.form.validate(async(val) => {
        if (!val) return
        let { code } = await request({ url: this.id ? api.powerEnv.updateHyitDhMenu : api.powerEnv.insertHyitDhMenu, data: this.form })
        if (code !== 1) return
        this.$message.success('成功')
        this.$router.back()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.attribute-box {
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  min-height: 80px;
  .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
