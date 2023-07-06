<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
            <el-form-item label="">
              <el-radio-group v-model="form.BOOTPROTO">
                <el-radio :label="true">自动获得IP地址、DNS</el-radio>
                <el-radio :label="false">使用下面的IP地址、DNS</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="IP" prop="IPADDR">
              <el-input v-model="form.IPADDR" :readonly="form.BOOTPROTO" placeholder="请输入IP" />
            </el-form-item>
            <el-form-item label="子网掩码" prop="NETMASK">
              <el-input v-model="form.NETMASK" :readonly="form.BOOTPROTO" placeholder="请输入子网掩码" />
            </el-form-item>
            <el-form-item label="默认网关" prop="GATEWAY">
              <el-input v-model="form.GATEWAY" :readonly="form.BOOTPROTO" placeholder="请输入网关" />
            </el-form-item>
            <el-form-item label="首选DNS服务器" prop="DNS1">
              <el-input v-model="form.DNS1" :readonly="form.BOOTPROTO" placeholder="请输入首选DNS服务器" />
            </el-form-item>
            <el-form-item label="备用DNS服务器" prop="DNS2">
              <el-input v-model="form.DNS2" :readonly="form.BOOTPROTO" placeholder="请输入备用DNS服务器" />
            </el-form-item>
            <el-form-item label="" prop="">
              <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
              <el-button @click="onReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card v-loading="loading" class="item-content-main">
      <div>
        <el-form ref="sysCatForm" :model="sysCatForm" label-width="120px" :rules="rules">
          <el-form-item label="websocket端口" prop="dictdataName">
            <el-input v-model="sysCatForm.dictdataValue" style="width:25%" />
          </el-form-item>

          <el-form-item label="" prop="">
            <el-button type="primary" @click="onEdit()">修改</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { isIp, isNetMask, isGateway } from '@/utils/validate'

export default {
  name: 'NetworkConfig',
  data() {
    const validateIp = (rule, value, callback) => {
      if (!this.form.BOOTPROTO && value !== '') {
        if (!isIp(value)) {
          callback(new Error('请输入正确的IP地址'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateNetMask = (rule, value, callback) => {
      if (!this.form.BOOTPROTO && value !== '') {
        if (!isNetMask(value)) {
          callback(new Error('请输入正确的子网掩码'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateGateway = (rule, value, callback) => {
      if (!this.form.BOOTPROTO && value !== '') {
        if (!isGateway(value)) {
          callback(new Error('请输入正确的网关'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateDNS = (rule, value, callback) => {
      if (!this.form.BOOTPROTO && value !== '') {
        if (!isIp(value)) {
          callback(new Error('请输入正确的DNS'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      confirmLoading: false,
      form: {
        IPADDR: '',
        DNS1: '',
        DNS2: '',
        NETMASK: '',
        GATEWAY: '',
        BOOTPROTO: true // true为动态  false为静态
      },
      sysCatForm: {
        id: '',
        dictdataValue: '' // 获取到的value值
      },
      rules: {
        IPADDR: [{ required: false, trigger: 'blur', validator: validateIp }],
        GATEWAY: [{ required: false, trigger: 'blur', validator: validateGateway }],
        NETMASK: [{ required: false, trigger: 'blur', validator: validateNetMask }],
        DNS1: [{ required: false, trigger: 'blur', validator: validateDNS }],
        DNS2: [{ required: false, trigger: 'blur', validator: validateDNS }]
      },
      loading: false
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
    this.getIpConfig()
    this.getWebsocket()
  },
  methods: {
    // 获取websocket_port
    getWebsocket() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: {
          // page: 1,
          // limit: 10
          dictCode: 'websocket_port'
          // dictCode: '10002'
        }
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          this.sysCatForm.dictdataValue = res.data[0].dictdataValue
          this.sysCatForm.id = res.data[0].id
          console.log(this.sysCatForm.dictdataValue)
        }
      })
    },
    // 修改按钮函数
    onEdit() {
      this.$refs['sysCatForm'].validate(valid => {
        if (valid) {
          this.$confirm('是否确定更改?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
            console.log(this.sysCatForm.dictdataValue)
            await this.updateSysCat({
              id: this.sysCatForm.id,
              dictdataValue: this.sysCatForm.dictdataValue
            })
            // this.$message({
            //   type: 'success',
            //   message: '修改成功'
            // })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消修改'
            })
          })
        } else {
          this.$message.error('请输入websocket_port号')
        }
      })
    },
    // 修改系统类型
    async updateSysCat(data) {
      return new Promise(resolve => {
        request({
          url: api.common.updateSysDictionaryDetail,
          data
        }).then(res => {
          if (res.code === 1) {
            resolve(res)
            console.log(res)
            // this.$message.success('修改成功')
            this.$message({
              type: 'success',
              message: '修改成功'
            })
          }
        })
      })
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          console.log(1)
          const params = { ...this.form }
          params.IPADDR = this.form.IPADDR === '' ? '' : `"${this.form.IPADDR}"`
          params.DNS1 = this.form.DNS1 === '' ? '' : `"${this.form.DNS1}"`
          params.DNS2 = this.form.DNS2 === '' ? '' : `"${this.form.DNS2}"`
          params.NETMASK = this.form.NETMASK === '' ? '' : `"${this.form.NETMASK}"`
          params.GATEWAY = this.form.GATEWAY === '' ? '' : `"${this.form.GATEWAY}"`
          params.BOOTPROTO = this.form.BOOTPROTO ? '"static"' : '"dhcp"'
          request({
            url: api.networkConfig.setIpConfig, data: params
          }).then(res => {
            if (res.code === 1) {
              this.$message.success('设置成功')
            }
          })
        } else {
          console.log(-1)
        }
      })
    },
    onReset() {

    },
    getIpConfig() {
      request({
        url: api.networkConfig.getIpConfig, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.form, 'IPADDR', res.model.ipaddr ? res.model.ipaddr.replace(/\"/g, '') : '')
          this.$set(this.form, 'DNS1', res.model.dns1 ? res.model.dns1.replace(/\"/g, '') : '')
          this.$set(this.form, 'DNS2', res.model.dns2 ? res.model.dns2.replace(/\"/g, '') : '')
          this.$set(this.form, 'NETMASK', res.model.netmask ? res.model.netmask.replace(/\"/g, '') : '')
          this.$set(this.form, 'GATEWAY', res.model.gateway ? res.model.gateway.replace(/\"/g, '') : '')
          this.$set(this.form, 'BOOTPROTO', (res.model.bootproto.replace(/\"/g, '') === '"none"' || res.model.bootproto.replace(/\"/g, '') === '"static"'))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content-main {
  margin-top: 20px;
}
.el-card ::v-deep .el-card__body {
      padding: 10px;
    }
</style>
