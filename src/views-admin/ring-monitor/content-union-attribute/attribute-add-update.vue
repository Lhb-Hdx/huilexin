<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" class="select-width-fill" label-width="120px" style="width:500px">
          <el-form-item label="属性名称" prop="hyDes">
            <el-input v-model.trim="form.hyDes" placeholder="请输入属性名称" />
          </el-form-item>
          <el-form-item label="属性单位" prop="hyUnits">
            <el-input v-model.trim="form.hyUnits" placeholder="请输入属性名称" />
          </el-form-item>
          <el-form-item label="属性类型" prop="hyDevTypeValue">
            <el-select
              v-model="form.hyDevTypeValue"
              filterable
              placeholder="请选择属性类型"
            >
              <el-option
                v-for="item in devTypeList"
                :key="item.hyDevTypeValue"
                :label="item.hyDevTypeName"
                :value="item.hyDevTypeValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="别名" prop="hyVname">
            <el-input v-model.trim="form.hyVname" placeholder="请输入别名" />
          </el-form-item>
          <el-form-item label="" prop="">
            <el-button v-permission="['save']" :loading="confirmLoading" type="primary" @click="onSubmit">保存</el-button>
            <el-button @click="onReset">重置</el-button>
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
  name: 'AttributeAddUpdate',
  data() {
    return {
      loading: false,
      confirmLoading: false,
      form: {
        hyDes: '',
        hyUnits: '',
        hyDevTypeValue: '',
        hyVname: ''
      },
      rules: {},
      host: [
        { id: 1, name: '动环监控主机' }
      ],
      showAttributeList: false,
      selectDevice: '',
      selectValueType: '',
      selectAttribute: [],
      attributeTypeList: [],
      alarmRules: [],
      alarmRuleForm: {
        hyEventId: '',
        hyLevel: '',
        hyCondType: '',
        hyAlarmValue: '',
        hyDes: ''
      },
      eventType: [],
      alarmLevel: [],
      alarmConditions: [],
      devTypeList: []
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
    this.findHyitDevType()
    if (this.id) {
      this.fetchData()
    }
  },
  methods: {
    onReset() {
      this.$refs.form.resetFields()
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          request({ url: api.powerEnv.updateHyitDeviceValue, data: (Object.assign(this.form)) }).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.$router.back()
            }
          }).finally(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    loadAttributeList() {},
    selectionChange(val) {
      this.selectAttribute = val
    },
    openAttributeList() {
      this.showAttributeList = true
    },
    fetchData() { // 获取编辑信息并展示
      request({
        url: api.powerEnv.getHyitDeviceValue,
        data: { hyVid: this.id }
      }).then(res => {
        if (res.code === 1) {
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res.model[key]
          })
          form.hyVid = res.model.hyVid
          this.form = form
        }
      })
    },
    findHyitDevType() {
      request({
        url: api.powerEnv.findHyitDevType,
        data: { hyDevTypeId: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
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
