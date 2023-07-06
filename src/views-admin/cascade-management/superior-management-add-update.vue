<template>
  <div class="actionTemplate">
    <div class="page-nav">
      <el-page-header :content="navTitle" @back="goBack" />
    </div>
    <div class="app-container">
      <el-card>
        <el-form ref="form" :model="rulesForm" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
              <el-form-item label="上级中心IP" prop="centerIp">
                <el-input v-model.trim="rulesForm.centerIp" placeholder="请输入上级中心IP" />
              </el-form-item>
              <el-form-item label="上级中心端口" prop="centerPort">
                <el-input v-model.trim="rulesForm.centerPort" placeholder="请输入上级中心端口" />
              </el-form-item>
              <el-form-item label="上级中心名称" prop="centerName">
                <el-input v-model.trim="rulesForm.centerName" placeholder="请输入上级中心名称" />
              </el-form-item>
              <el-form-item label="网关类型" prop="agentType">
                <el-select
                  v-model="rulesForm.agentType"
                  placeholder="请选择网关类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in typeArr"
                    :key="item.id"
                    :label="item.value"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="是否启用" prop="userStatue">
                <el-switch
                  v-model="rulesForm.userStatue"
                  :active-value="1"
                  :inactive-value="0"
                  @change="changeUserStatue(rulesForm)"
                />
              </el-form-item>
              <el-form-item label="备注" prop="backup">
                <el-input v-model="rulesForm.backup" type="textarea" />
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button type="primary" :loading="loading" @click="onSubmit">保存</el-button>
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
import api from '@/api/api'

export default {
  data() {
    return {
      rulesForm: {
        centerIp: '',
        centerPort: '',
        centerName: '',
        backup: '',
        agentType: 8, // 暂时写死为8
        userStatue: null
      },
      listQuery: {
        page: 1,
        limit: -1,
        agentType: 8 // 暂时写死为8
      },
      typeArr: [
        {id: 1, value: 'zabbix网关'},
        {id: 2, value: '动环网关'},
        {id: 3, value: 'ansible网关'},
        {id: 4, value: '人脸识别网关'},
        {id: 5, value: '海康人脸识别网关'},
        {id: 6, value: '微信移动端接口'},
        {id: 7, value: 'esight网关'},
        {id: 8, value: '级联中心服务'}
      ],
      loading: false,
      rules: {
        centerIp: [
          { required: true, message: '请输入上级中心IP', trigger: 'blur' }
        ],
        centerPort: [
          { required: true, message: '请输入上级中心端口', trigger: 'blur' }
        ],
        centerName: [
          { required: true, message: '请输入上级中心名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.id
    }
  },
  watch: {
  },
  async created() {
    if (this.id) {
      await this.getServerCenter()
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    async getServerCenter() {
      const res = await this.$request({
        url: api.itMonitor.getServerCenter,
        data: {
          id: this.id
        }
      })
      if (res.code !== 1) return
      const rulesForm = {}
      Object.keys(this.rulesForm).forEach(key => {
        rulesForm[key] = res.model[key]
      })
      this.rulesForm = rulesForm
    },
    // 改变启用状态
    async changeUserStatue(row) {
      this.rulesForm.userStatue = row.userStatue
    },
    async findServerCenter() {
      const res = await this.$request({
        url: api.itMonitor.findServerCenter,
        data: { ...this.listQuery }
      })
      if (res.code !== 1) return
      return res.data
    },
    onSubmit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          if (this.id) { // 编辑
            this.loading = true
            this.$request({
              url: api.itMonitor.updateServerCenter, data: { id: this.id, ...this.rulesForm }
            }).then(res => {
              if (res.code === 1) {
                this.$request({url: this.api.itMonitor.disconnetAgent })
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          } else {
            const serverData = await this.findServerCenter()
            if (serverData.length > 0) return this.$message.error('已存在上级IP，请删除后再添加')
            this.loading = true
            this.$request({
              url: api.itMonitor.insertServerCenter, data: Object.assign(this.rulesForm)
            }).then(res => {
              if (res.code === 1) {
                this.$request({url: this.api.itMonitor.disconnetAgent })
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          }
        }
      })
    },
    onReset() {
      this.$refs['form'].resetFields()
      this.rulesForm.agentType = 8 // 暂时写死为8
    }
  }
}
</script>

<style scoped lang="scss">
</style>
