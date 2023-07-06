<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:88vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
          <el-form-item label="发送邮箱账号" prop="hySendMail">
            <el-input v-model="rulesForm.hySendMail" placeholder="请输入发送邮箱账号" />
          </el-form-item>
          <el-form-item label="授权码" prop="hySendPass">
            <el-input v-model="rulesForm.hySendPass" placeholder="请输入授权码" />
          </el-form-item>
          <el-form-item>
            <div style="color:red">！授权码需要到相应的邮箱平台获取</div>
          </el-form-item>
          <el-form-item label="发送服务器" prop="hySendServer">
            <el-input v-model="rulesForm.hySendServer" placeholder="请输入发送服务器" />
          </el-form-item>
          <el-form-item label="发送端口" prop="hySendPort">
            <el-input v-model="rulesForm.hySendPort" placeholder="请输入发送服务器" type="number" />
          </el-form-item>
          <el-form-item label="加密类型" prop="hyPassType">
            <el-select v-model="rulesForm.hyPassType" placeholder="请选择加密类型" style="width:100%">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="card-footer flex-v-center">
        <el-button v-permission="['submit']" type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
        <el-button @click="$router.back()">关闭</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { validEmail } from '@/utils/validate'
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('邮箱不能为空'))
      }
      setTimeout(() => {
        if (!validEmail(value)) {
          callback(new Error('邮箱格式不正确'))
        } else {
          callback()
        }
      }, 100)
    }
    return {
      rulesForm: {
        hySendMail: '', // 发送账号
        hySendServer: '', // 发送服务器
        hySendPass: '',
        hyPassType: '',
        hySendPort: ''
      },
      options: [
        { label: 'none', value: 0 },
        { label: 'ssl', value: 1 }
      ],
      rules: {
        hySendMail: [{ validator: checkEmail, required: true, trigger: 'blur' }],
        hySendServer: [{ required: true, trigger: 'blur', message: '请填写' }],
        hySendPass: [{ required: true, trigger: 'blur', message: '请填写' }],
        hyPassType: [{ required: true, trigger: 'blur', message: '请填写' }],
        hySendPort: [{ required: true, trigger: 'blur', message: '请填写' }]
      },
      loading: false
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    hyId() {
      return this.$route.query.hyId
    }
  },
  created() {
    if (this.hyId) {
      this.getComSendMailNo()
    }
  },
  methods: {
    handleSubmit() {
      this.$refs['form'].validate(async(val) => {
        if (!val) return
        this.loading = true
        let { code, msg } = await request({
          url: api.linkageManage[this.hyId ? 'updateComSendMailNo' : 'insertComSendMailNo'],
          data: this.rulesForm
        })
        this.loading = false
        if (code === 1) {
          this.$message.success(this.hyId ? '修改成功' : '添加成功')
          this.$router.back()
          return
        }
        this.$message.error(msg)
      })
    },
    async getComSendMailNo() {
      let { model, code } = await request({
        url: api.linkageManage.getComSendMailNo,
        data: { hyId: this.hyId }
      })
      if (code !== 1) return
      this.rulesForm = model
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
