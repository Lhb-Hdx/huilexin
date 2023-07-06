<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="网关" prop="agent">
                <el-select
                  v-model="form.agent"
                  placeholder="请选择网关"
                  style="width: 100%;"
                  clearable
                >
                  <el-option
                    v-for="item in agentList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="名称" prop="name">
                <el-input v-model.trim="form.name" placeholder="请输入名称" />
              </el-form-item>
              <el-form-item label="IP" prop="ip">
                <el-input v-model.trim="form.ip" placeholder="请输入IP" />
              </el-form-item>
              <el-form-item label="端口" prop="port">
                <el-input v-model.trim="form.port" type="number" placeholder="请输入端口" />
              </el-form-item>
              <el-form-item label="用户名" prop="userName">
                <el-input v-model.trim="form.userName" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="密码" prop="pwd">
                <el-input v-model.trim="form.pwd" :type="passwordType" placeholder="请输入密码" />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-form-item>
              <el-form-item label="备份类型" prop="backupType">
                <el-select
                  v-model="form.backupType"
                  placeholder="请选择备份类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in backupType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="执行类型" prop="type">
                <el-select
                  v-model="form.type"
                  placeholder="请选择执行类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in type"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item v-if="form.type === 2" label="执行时间" prop="executeDate">
                <el-cascader
                  v-model="form.executeDate"
                  :options="runTimeOptions"
                  @change="handleChangeDate"
                />
                <el-time-picker
                  v-model="form.executeTime"
                  :value="form.executeTime"
                  placeholder="任意时间点"
                  @change="handleChangeTime"
                />
              </el-form-item>
              <el-form-item label="数据库名" prop="dbName">
                <el-input v-model.trim="form.dbName" placeholder="请输入数据库名" />
              </el-form-item>
              <el-form-item label="表名" prop="tableName">
                <el-input v-model.trim="form.tableName" placeholder="请输入表名" />
              </el-form-item>
              <el-form-item label="保留天数" prop="keepDays">
                <el-input v-model.trim="form.keepDays" type="number" placeholder="请输入保留天数" />
              </el-form-item>
              <el-form-item v-if="(form.backupType === 4 || form.backupType === 5)" label="字段名称" prop="columnName">
                <el-input v-model.trim="form.columnName" placeholder="请字段名称" />
              </el-form-item>
              <el-form-item v-if="(form.backupType === 4 || form.backupType === 5)" label="时间类型" prop="columnTimeType">
                <el-select
                  v-model="form.columnTimeType"
                  placeholder="请选择执行类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in columnTimeType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态" prop="statue">
                <el-select
                  v-model="form.statue"
                  placeholder="请选择状态"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in statue"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button :loading="confirmLoading" type="primary" size="small" @click="onSubmit">确认提交</el-button>
                <el-button type="info" size="small" @click="resetForm()">重置</el-button>
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

export default {
  name: 'DatabaseBackupForm',
  data() {
    const validateKeepDays = (rule, value, callback) => {
      if (value === '' && this.form.backupType === 4) {
        return callback(new Error('请输入保留天数'))
      }
      if (+value < 1 && this.form.backupType === 4) {
        return callback(new Error('保留天数必须大于或者等于1'))
      }
      callback()
    }
    const validateColumnName = (rule, value, callback) => {
      if (value === '' && this.form.backupType === 4) {
        return callback(new Error('请输入字段名称'))
      }
      callback()
    }
    const validateColumnTimeType = (rule, value, callback) => {
      if (value === '' && this.form.backupType === 4) {
        return callback(new Error('请输入字段类型'))
      }
      callback()
    }
    return {
      loading: false,
      form: {
        name: '',
        ip: '',
        port: '',
        userName: '',
        pwd: '',
        backupType: '',
        type: '',
        executeTimeType: '',
        executeTime: '',
        executeDay: '',
        executeHour: '',
        executeMinute: '',
        executeSecond: '',
        dbName: '',
        tableName: '',
        agent: '',
        keepDays: '',
        statue: 2,
        columnName: '',
        columnTimeType: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        dbName: [
          { required: true, message: '请输入数据库名称', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入IP', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        tableName: [
          { required: true, message: '请输入表名', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择执行类型', trigger: 'blur' }
        ],
        backupType: [
          { required: true, message: '请选择备份类型', trigger: 'blur' }
        ],
        statue: [
          { required: true, message: '请选择状态', trigger: 'blur' }
        ],
        keepDays: [
          { required: true, validator: validateKeepDays, trigger: 'blur' }
        ],
        columnName: [
          { required: true, validator: validateColumnName, trigger: 'blur' }
        ],
        columnTimeType: [
          { required: true, validator: validateColumnTimeType, trigger: 'blur' }
        ]
      },
      backupType: [
        { value: 1, label: '数据库备份' },
        { value: 2, label: '数据表备份' },
        { value: 3, label: '数据库分表' },
        { value: 4, label: '按保留天数清除数据' },
        { value: 5, label: '数据表分区' }
      ],
      type: [
        { value: 1, label: '手动备份' },
        { value: 2, label: '定时备份' }
      ],
      executeTimeType: [
        { value: 1, label: '每天' },
        { value: 2, label: '每周' },
        { value: 3, label: '每月' }
      ],
      statue: [
        { value: 1, label: '启用' },
        { value: 2, label: '禁用' }
      ],
      runTimeOptions: [ // 执行日期联动选择
        {
          value: 1,
          executeTimeType: 1,
          label: '每日'
        },
        {
          value: 2,
          executeTimeType: 2,
          label: '每周',
          children: [
            {
              value: 1,
              executeDay: 1,
              label: '星期一'
            },
            {
              value: 2,
              executeDay: 2,
              label: '星期二'
            },
            {
              value: 3,
              executeDay: 3,
              label: '星期三'
            },
            {
              value: 4,
              executeDay: 4,
              label: '星期四'
            },
            {
              value: 5,
              executeDay: 5,
              label: '星期五'
            },
            {
              value: 6,
              executeDay: 6,
              label: '星期六'
            },
            {
              value: 7,
              executeDay: 0,
              label: '星期天'
            }
          ]
        },
        {
          value: 3,
          executeTimeType: 3,
          label: '每月',
          children: [

          ]
        }
      ],
      agentList: [],
      executeDate: '', // 执行日期内容
      executeTime: [], // 执行时间内容
      confirmLoading: false,
      lastAgent: '', // 编辑时保存上一次的网关
      columnTimeType: [
        { value: 1, label: 'unix时间类型' },
        { value: 2, label: '正常时间类型' }
      ],
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
    this.setMonth()
    this.findHyitAgent()
    if (this.id) this.getDbBackup()
  },
  methods: {
    // 设置月份天数
    setMonth() {
      const monthArr = []
      for (var i = 1; i < 32; i++) {
        monthArr.push({ value: i, executeDay: i, label: `${i}号` })
      }
      this.$set(this.runTimeOptions[2], 'children', monthArr)
    },
    // 选择日期
    handleChangeDate(val) {
      this.$set(this.form, 'executeDate', val)
      this.$set(this.form, 'executeTimeType', val[0])
      this.$set(this.form, 'executeDay', val[1])
    },
    // 选择时间
    handleChangeTime(val) {
      const DateObj = new Date(val)
      this.$set(this.form, 'executeTime', val)
      this.$set(this.form, 'executeHour', DateObj.getHours())
      this.$set(this.form, 'executeMinute', DateObj.getMinutes())
      this.$set(this.form, 'executeSecond', DateObj.getSeconds())
    },
    // 提交
    onSubmit() {
      this.$set(this.rules, 'executeDate', [{ required: true, message: '请选择执行日期' }])
      this.$set(this.rules, 'executeTime', [{ required: true, message: '请选择执行时间' }])
      const formParam = { ...this.form }
      delete formParam.executeTime // 接口不需要的参数
      delete formParam.executeDate // 接口不需要的参数
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          const apiName = this.id ? api.dbBackup.updateDbBackup : api.dbBackup.insertDbBackup
          if (this.id) formParam.id = this.id
          request({
            url: apiName,
            data: formParam
          }).then(res => {
            this.confirmLoading = false
            if (res.code === 1) {
              if (formParam.agent !== '') this.DbTaskChange({ agent: formParam.agent })
              if (this.id) {
                if (this.lastAgent !== '' && this.lastAgent !== formParam.agent) this.DbTaskChange({ agent: this.lastAgent })
              }
              this.$router.back()
              this.$message({
                type: 'success',
                message: res.msg
              })
            } else {
              this.$message({
                type: 'error',
                message: res.msg
              })
            }
          })
        }
      })
    },
    // 重置
    resetForm() {},
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
        }
      })
    },
    // 查看数据库备份
    getDbBackup() {
      request({
        url: api.dbBackup.getDbBackup,
        data: { id: this.id }
      }).then(res => {
        if (res.code === 1) {
          this.lastAgent = res.model.agent !== null ? res.model.agent : ''
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res.model[`${key}`]
          })
          if (form['executeTimeType'] === 1) {
            form['executeDate'] = form['executeTimeType']
          } else if (form['executeTimeType'] === 2) {
            form['executeDate'] = [form['executeTimeType'], form['executeDay']]
          } else if (form['executeTimeType'] === 3) {
            form['executeDate'] = [form['executeTimeType'], form['executeDay']]
          }
          const executeHour = form['executeHour'] >= 10 ? form['executeHour'] : `0${form['executeHour']}`
          const executeMinute = form['executeMinute'] >= 10 ? form['executeMinute'] : `0${form['executeMinute']}`
          const executeSecond = form['executeSecond'] >= 10 ? form['executeSecond'] : `0${form['executeSecond']}`
          const NowDate = new Date()
          form['executeTime'] = new Date(`${NowDate.getFullYear()}-${NowDate.getMonth()}-${NowDate.getDate()} ${executeHour}:${executeMinute}:${executeSecond}`)
          this.form = form
        }
      })
    },
    // 通知网关
    DbTaskChange(query) {
      request({
        url: api.dbBackup.DbTaskChange,
        data: query
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
