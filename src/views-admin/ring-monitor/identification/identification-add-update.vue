<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card>
        <el-form ref="form" :inline="false" :model="form" :rules="rules" label-width="90px">
          <el-row :gutter="20">
            <el-col :offset="0" :span="8">
              <el-form-item :rules="[{ required: true, message: '请输入', trigger: 'blur' }]" label="设备名称" prop="hyHostName">
                <el-input v-model="form.hyHostName" placeholder="请输入设备名称" />
              </el-form-item>
              <el-form-item label="设备ip" prop="hyIp">
                <el-input v-model="form.hyIp" placeholder="请输入设备ip" />

              </el-form-item>
              <el-form-item :rules="[{ required: true, message: '请输入', trigger: 'blur' }]" label="用户名" prop="hyUserName">
                <el-input v-model="form.hyUserName" placeholder="请输入用户名" />

              </el-form-item>
              <el-form-item :rules="[{ required: true, message: '请选择', trigger: 'change' }]" label="设备权限" prop="isPublic">
                <el-select v-model="form.isPublic" clearable filterable placeholder="请选择设备权限" value-key="">
                  <el-option
                    :value="0"
                    label="私有"
                  />
                  <el-option
                    :value="1"
                    label="公有"
                  />
                </el-select>
              </el-form-item>

            </el-col>
            <el-col :offset="0" :span="8">
              <el-form-item :rules="[{ required: true, message: '请选择', trigger: 'change' }]" label="网关服务" prop="agent">
                <el-select v-model="form.agent" clearable filterable placeholder="请选择网关服务" value-key="">
                  <el-option
                    v-for="item in agent"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :rules="[{ required: true, message: '请输入', trigger: 'blur' }]" label="端口" prop="hyPort">
                <el-input v-model="form.hyPort" placeholder="请输入端口" type="number" />
              </el-form-item>
              <el-form-item :rules="[{ required: true, message: '请输入', trigger: 'blur' }]" label="密码" prop="hyPassword">
                <el-input v-model="form.hyPassword" placeholder="请输入密码" />

              </el-form-item>
              <el-form-item label="位置" prop="hyAddr">
                <el-input v-model="form.hyAddr" placeholder="请输入位置" />
              </el-form-item>

            </el-col>
            <el-col :offset="0" :span="10">
              <el-form-item :rules="[{ required: true, message: '请选择', trigger: 'blur' }]" label="子系统" prop="hyAddr">
                <el-select v-model="form.hySbId" clearable filterable placeholder="请选择子系统">
                  <el-option
                    v-for="item in subsystemList"
                    :key="item.hySbId"
                    :label="item.hySbName"
                    :value="item.hySbId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item size="normal">
            <el-button v-permission="['submit']" size="default" type="primary" @click="onSubmit">确定</el-button>
            <el-button size="default" @click="$refs.form.resetFields()">重置</el-button>
          </el-form-item>

        </el-form>
      </el-card>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { isIp } from '@/utils/validate'

export default {
  name: 'ContentUnionDeviceAddUpdate',
  components: { },
  data() {
    var checkIp = (rule, val, callback) => {
      if (!val) return callback(new Error('请输入ip'))
      if (!isIp(val)) return callback(new Error('ip格式不正确'))
      callback()
    }
    return {
      id: '',
      form: {
        hyDevTypeValue: 185,
        hyCoding: 0,
        hyDevTypeId: 192,
        hySbId: ''
      },
      rules: {
        hyIp: [{ validator: checkIp, required: true, trigger: 'blur' }]
      },
      room: [],
      agent: [],
      devtype: [],
      subsystemList: []
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    }
  },
  async created() {
    // this.findEsBuild()
    if (this.$route.query.id) {
      this.id = this.$route.query.id
      await this.getHyitHost()
    }
    await this.findHyitAgent()
    await this.findHyitSubSystem()
  },
  mounted() {
  },
  methods: {
    async findHyitSubSystem() {
      let { data, code } = await request({ url: api.powerEnv.findHyitSubSystem, data: { limit: -1 }})
      // eslint-disable-next-line no-return-assign
      if (code === 1) return this.subsystemList = data
    },

    async getHyitHost() {
      let { code, model } = await request({ url: api.powerEnv.getHyitHost, data: { hyHostId: this.id }})
      if (code !== 1) return
      this.form = model
    },
    // async findEsRoom() {
    //   let { code, data } = await request({ url: api.powerEnv.findEsRoom, data: {}})
    //   if (code !== 1) return
    //   this.room = data
    // },
    async findHyitAgent() {
      let { code, data } = await request({ url: api.itMonitor.findHyitAgent, data: {}})
      if (code !== 1) return
      this.agent = data
    },
    // async findHyitDevType() {
    //   let { code, data } = await request({ url: api.powerEnv.findHyitDevType, data: { hyDevTypeValue: 185, limit: -1 }})
    //   if (code !== 1) return
    //   this.devtype = data
    // },
    onSubmit() {
      this.$refs.form.validate(async(val) => {
        if (!val) return
        let { code, msg } = await request({ url: this.id ? api.powerEnv.updateHyitHost : api.powerEnv.insertHyitHost, data: this.form })
        if (code !== 1) return this.$message.error(msg)
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
