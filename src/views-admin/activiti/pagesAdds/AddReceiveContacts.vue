<template>
  <div class="app-container actionTemplate">
    <el-card :header="title" shadow="never" style="height:90vh" class="card">
      <template #header>
        <el-page-header :title="title" @back="$router.back()" />
      </template>
      <div class="content">
        <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
          <el-form-item label="姓名" prop="hyRealName">
            <el-input v-model="rulesForm.hyRealName" placeholder="" />
          </el-form-item>
          <el-form-item label="email" prop="hyEmail">
            <el-input v-model="rulesForm.hyEmail" placeholder="" />
          </el-form-item>
          <el-form-item label="手机" prop="hyMobile">
            <el-input v-model="rulesForm.hyMobile" placeholder="" />
          </el-form-item>
          <el-form-item label="关联用户" prop="hyUserId">
            <el-select v-model="rulesForm.hyUserId" placeholder="请选择" style="width:100%">
              <el-option
                v-for="item in users"
                :key="item.userId"
                :label="item.userName"
                :value="+item.userId"
              />
            </el-select>
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
import { validEmail, isMobile } from '@/utils/validate'
import { getUserInfo } from '@/utils/auth'
export default {
  data() {
    var checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机不能为空'))
      }
      setTimeout(() => {
        if (!isMobile(value)) {
          callback(new Error('手机格式不正确'))
        } else {
          callback()
        }
      }, 100)
    }
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('邮箱不能为空'))
      }
      setTimeout(() => {
        if (validEmail(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的邮箱格式'))
        }
      }, 100)
    }
    return {
      rulesForm: {
        hyRealName: '',
        hyEmail: '',
        hyMobile: '',
        hyUserId: ''
      },
      rules: {
        hyRealName: [{ required: true, message: '请输入', trigger: 'blur' }],
        hyEmail: [{ validator: checkEmail, required: true, trigger: 'blur' }],
        hyMobile: [{ validator: checkPhone, required: true, trigger: 'blur' }]
      },
      users: [],
      loading: false
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.hyBookId
    }
  },
  created() {
    this.findSysUser()
    if (this.id) {
      this.getHyitBook()
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate(async(val) => {
        if (!val) return
        this.loading = true
        let { code } = await request({
          url: this.id ? api.linkageManage.updateHyitBook : api.linkageManage.insertHyitBook,
          data: { ...this.rulesForm }
        })
        this.loading = false
        if (code !== 1) return
        this.$message({
          message: this.id ? '修改成功' : '添加成功',
          type: 'success'
        })
        this.$router.back()
      })
    },
    async findSysUser() {
      const { companyId } = getUserInfo()
      let { data, code } = await request({
        url: api.sys.findSysUser,
        data: { limit: -1, companyId }
      })
      if (code !== 1) return
      this.users = data
    },
    async getHyitBook() {
      let { model, code } = await request({
        url: api.linkageManage.getHyitBook,
        data: { hyBookId: this.id }
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
