<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="select-width-fill">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="区域" prop="hyOrgId">
                <el-select
                  v-model="form.hyOrgId"
                  filterable
                  placeholder="请选择区域"
                >
                  <el-option
                    v-for="item in area"
                    :key="item.hyAreaId"
                    :label="item.hyAreaName"
                    :value="item.hyAreaId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="子系统" prop="hySbId">
                <el-select
                  v-model="form.hySbId"
                  filterable
                  placeholder="请选择子系统"
                >
                  <el-option
                    v-for="item in subSystemList"
                    :key="item.hySbId"
                    :label="item.hySbName"
                    :value="item.hySbId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="唯一编码" prop="hyCoding">
                <el-input v-model.trim="form.hyCoding" placeholder="请输入唯一编码" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备类型" prop="hyDevTypeValue">
                <el-select
                  v-model="form.hyDevTypeValue"
                  filterable
                  placeholder="请选择设备类型"
                  @change="handleDevType"
                >
                  <el-option
                    v-for="item in devTypeList"
                    :key="item.hyDevTypeId"
                    :label="item.hyDevTypeName"
                    :value="item.hyDevTypeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="对应配置类目" prop="cmdbItemTypeId">
                <el-cascader
                  v-model="form.cmdbItemTypeId"
                  placeholder="请选择配置类目"
                  disabled
                  :options="classifyTreeList"
                  :props="{ value: 'id', label: 'name', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="主机名称" prop="hyHostName">
                <el-input v-model.trim="form.hyHostName" placeholder="请输入主机名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="用户名" prop="hyUserName">
                <el-input v-model.trim="form.hyUserName" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="密码" prop="hyPassword">
                <el-input v-model.trim="form.hyPassword" :type="passwordType" placeholder="请输入密码" />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="IP" prop="hyIp">
                <el-input v-model.trim="form.hyIp" placeholder="请输入IP" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="端口" prop="hyPort">
                <el-input v-model.trim="form.hyPort" placeholder="请输入端口" type="number" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="联系人" prop="hyRelation">
                <el-input v-model.trim="form.hyRelation" placeholder="请输入联系人" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="邮箱" prop="hyEmail">
                <el-input v-model.trim="form.hyEmail" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="联系号码" prop="hyTel">
                <el-input v-model.trim="form.hyTel" placeholder="请输入联系号码" />
              </el-form-item>
            </el-col>
            <!-- <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="版本" prop="version">
                <el-select
                  v-model="form.version"
                  filterable
                  placeholder="请选择物联主机版本"
                >
                  <el-option
                    v-for="item in version"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col> -->
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="">
                <el-button v-permission="['add']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
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
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import { isIp, isMobile, validEmail } from '@/utils/validate'

export default {
  name: 'ContentUnionHostAddUpdate',
  data() {
    let checkIp = (rule, val, callback) => {
      if (!val.trim()) return callback(new Error('请输入IP'))
      if (!isIp(val)) return callback(new Error('IP格式不正确'))
      callback()
    }
    let checkMobile = (rule, val, callback) => {
      if (!val) return callback()
      if (!isMobile(val)) return callback(new Error('手机号格式不正确'))
      callback()
    }
    let checkValidEmail = (rule, val, callback) => {
      if (!val) return callback()
      if (!validEmail(val)) return callback(new Error('邮箱格式不正确'))
      callback()
    }
    return {
      loading: false,
      confirmLoading: false,
      form: {
        hyCoding: '',
        hyOrgId: '',
        hyUserName: '',
        hyIp: '',
        hyRelation: '',
        hyTel: '',
        hyHostName: '',
        hyPassword: '',
        hyPort: '',
        hyEmail: '',
        hySbId: '',
        hyDevTypeId: '',
        hyDevTypeValue: '',
        cmdbItemTypeId: 8
      },
      rules: {
        hySbId: [
          { required: true, message: '请选择子系统', trigger: 'blur' }
        ],
        hyOrgId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ],
        hyDevTypeId: [
          { required: true, message: '请选择设备类型', trigger: 'blur' }
        ],
        hyCoding: [
          { required: true, message: '请输入唯一编码', trigger: 'blur' }
        ],
        hyEmail: [
          { validator: checkValidEmail, trigger: 'blur' }
        ],
        hyTel: [
          { validator: checkMobile, trigger: 'blur' }
        ],
        hyIp: [
          { validator: checkIp, required: true, trigger: 'blur' }
        ],
        hyHostName: [
          { required: true, message: '请输入主机名称', trigger: 'blur' }
        ],
        hyPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        hyPort: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ],
        hyDevTypeValue: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        cmdbItemTypeId: [
          { required: true, message: '请选择配置类目', trigger: 'blur' }
        ]
      },
      area: [],
      version: [
        { id: 1, name: '1.0' }
      ],
      devTypeList: [],
      subSystemList: [],
      cmdbItemSourceType: 4,
      classifyTreeList: [],
      passwordType: 'password'
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
    if (this.id) {
      this.fetchData()
    }
    this.findHyitOrg()
    this.findHyitSubSystem()
    this.findHyitDevType()
    this.findCmdbItemType()
  },
  methods: {
    findHyitOrg() {
      request({
        url: api.area.findHyitArea,
        data: {isDh: 1}
      }).then(res => {
        if (res.code === 1) {
          this.area = res.data
        }
      })
    },
    findHyitSubSystem() {
      request({
        url: api.powerEnv.findHyitSubSystem,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          this.subSystemList = res.data
        }
      })
    },
    findHyitDevType() {
      request({
        url: api.powerEnv.findHyitDevType,
        data: { Pid: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    fetchData() { // 获取编辑信息并展示
      request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: this.id }
      }).then(res => {
        if (res.code === 1) {
          this.form.hyCoding = res.model.hyCoding
          this.form.hyOrgId = res.model.hyOrgId
          this.form.hyUserName = res.model.hyUserName
          this.form.hyIp = res.model.hyIp
          this.form.hyRelation = res.model.hyRelation
          this.form.hyTel = res.model.hyTel
          this.form.hyHostName = res.model.hyHostName
          this.form.hyPassword = res.model.hyPassword
          this.form.hyPort = res.model.hyPort
          this.form.hyEmail = res.model.hyEmail
          this.form.hyDevTypeValue = res.model.hyDevTypeValue
          this.form.hyDevTypeId = 2
          this.form.hyHostId = res.model.hyHostId
          this.form.hySbId = res.model.hySbId
          this.form.cmdbItemTypeId = res.model.cmdbItemTypeId
        }
      })
    },
    handleDevType(val) {
      const idx = this.devTypeList.findIndex(item => item.hyDevTypeValue === val)
      if (val !== -1) {
        this.$set(this.form, 'hyDevTypeValue', this.devTypeList[idx].hyDevTypeValue)
      }
    },
    onReset() {
      this.$refs.form.resetFields()
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.id ? api.powerEnv.updateHyitHost : api.powerEnv.insertHyitHost
          this.confirmLoading = true
          const form = { ...this.form }
          form.cmdbItemSourceType = this.cmdbItemSourceType
          form.cmdbItemTypeId = form.cmdbItemTypeId[form.cmdbItemTypeId.length - 1] || form.cmdbItemTypeId
          form.hyDevTypeId = 2
          request({ url: apiName, data: (Object.assign(form)) }).then(res => {
            this.$message.success(res.msg)
            this.$router.back()
          }).finally(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.classifyTreeList = listToTree(res.data, 0, 0, 'id', 'parentId')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.show-pwd {
  position: absolute;
  right: 10px;
  top: 50%;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transform: translateY(-50%);
}
</style>
