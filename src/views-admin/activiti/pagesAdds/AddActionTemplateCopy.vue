<template>
  <div class="app-container actionTemplate">
    <el-card shadow="never" style="height:90vh" class="card">
      <template #header>
        <el-page-header title="返回" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
          <el-form-item label="动作名称" prop="hyActionName">
            <el-input v-model="rulesForm.hyActionName" placeholder="动作名称" />
          </el-form-item>
          <el-form-item label="动作类型" prop="hyActionClassId">
            <el-select v-model="rulesForm.hyActionClassId" placeholder="请选择" style="width:100%">
              <el-option
                v-for="item in actionClass"
                :key="item.hyActionClassId"
                :label="item.hyActionClassName"
                :value="item.hyActionClassId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型" prop="hyActionType">
            <el-select v-model="rulesForm.hyActionType" placeholder="请选择" style="width:100%">
              <el-option
                v-for="item in ActionTypeOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="动作源表名" prop="hyActionTable">
            <el-input v-model="rulesForm.hyActionTable" placeholder="动作源表名" />
          </el-form-item>
          <el-form-item label="动作源id" prop="hyActionSrcId">
            <el-input v-model="rulesForm.hyActionSrcId" placeholder="动作源id" />
          </el-form-item>
          <el-form-item label="动作源字段名" prop="hyActionSrcName">
            <el-input v-model="rulesForm.hyActionSrcName" placeholder="动作源字段名" />
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
export default {
  data() {
    return {
      rulesForm: {
        hyActionName: '',
        hyActionClassId: '',
        hyActionTable: '',
        hyActionSrcId: '',
        hyActionSrcName: ''
      },
      loading: false,
      rules: {
        hyActionName: [{ required: true, message: '请填写', trigger: 'blur' }],
        hyActionType: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      actionClass: [],
      ActionTypeOption: [
        { label: '系统类', value: 0 },
        { label: '设备类', value: 1 }
      ]
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    hyAid() {
      return this.$route.query.hyAid
    }
  },
  created() {
    this.findHyitActionClass()
    if (this.hyAid) {
      this.getHyitAction()
    }
  },
  methods: {
    async findHyitActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findHyitActionClass,
        data: this.query
      })
      if (code !== 1) return
      this.actionClass = data
    },
    async getHyitAction() {
      let { model, code } = await request({
        url: api.linkageManage.getHyitAction,
        data: { hyAid: this.hyAid }
      })
      if (code !== 1) return
      this.rulesForm = model
    },
    handleSubmit() {
      this.$refs['form'].validate(async(val) => {
        if (!val) return
        this.loading = true
        let { code } = await request({
          url: api.linkageManage[this.hyAid ? 'updateHyitAction' : 'insertHyitAction'],
          data: this.rulesForm
        })
        this.loading = false
        if (code === 1) {
          this.$message.success(this.hyAid ? '修改成功' : '添加成功')
          this.$router.back()
          return
        }
        this.$message.error(this.hyAid ? '修改失败' : '添加失败')
      })
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
