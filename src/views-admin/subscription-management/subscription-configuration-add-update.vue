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
              <el-form-item label="名称" prop="name">
                <el-input v-model.trim="rulesForm.name" placeholder="请输入名称" />
              </el-form-item>
              <el-form-item label="推送地址" prop="url">
                <el-input v-model.trim="rulesForm.url" placeholder="请输入推送地址URL" />
              </el-form-item>
              <el-form-item label="订阅类型" prop="subscribeType">
                <el-select
                  v-model="rulesForm.subscribeType"
                  placeholder="请选择订阅类型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in connectStatue"
                    :key="item.id"
                    :label="item.dictdataName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="执行时间" prop="executeDate">
                <el-cascader
                  v-model="rulesForm.executeDate"
                  :options="runTimeOptions"
                  @change="handleChangeDate"
                />
                <el-time-picker
                  v-model="rulesForm.executeTime"
                  :disabled="showPicker"
                  :value="rulesForm.executeTime"
                  placeholder="任意时间点"
                  @change="handleChangeTime"
                />
              </el-form-item>
              <el-row v-if="showFrequency" :gutter="12">
                <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
                  <el-form-item :label="`频率 (单位:${company})`" prop="frequency">
                    <el-input v-model.trim="rulesForm.frequency" placeholder="请输入频率" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
                  <el-input v-model.trim="time" disabled />
                </el-col>
              </el-row>

              <el-form-item label="是否鉴权" prop="isAuth">
                <el-switch
                  v-model="rulesForm.isAuth"
                  :active-value="1"
                  :inactive-value="0"
                  @change="changeAuthStatue(rulesForm)"
                />
              </el-form-item>
              <el-form-item label="请求头" prop="header">
                <el-input v-model.trim="rulesForm.header" :disabled="rulesForm.isAuth === 1 ? false : true" placeholder="请输入请求头" />
              </el-form-item>
              <el-form-item label="鉴权码" prop="authToken">
                <el-input v-model.trim="rulesForm.authToken" :disabled="rulesForm.isAuth === 1 ? false : true" placeholder="请输入鉴权码" />
              </el-form-item>
              <el-form-item label="是否启用" prop="isUse">
                <el-switch
                  v-model="rulesForm.isUse"
                  :active-value="1"
                  :inactive-value="0"
                  @change="changeUserStatue(rulesForm)"
                />
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
        name: '',
        url: '',
        isAuth: null,
        isUse: null,
        subscribeType: '',
        authToken: '',
        header: '',
        frequency: '',
        executeDate: '', // 执行日期
        executeTimeType: '',
        executeDay: '',
        executeTime: '', // 执行时间
        executeHour: '',
        executeMinute: '',
        executeSecond: ''
      },
      time: null,
      disabled: false,
      loading: false,
      company: '',
      connectStatue: [],
      executeTimeType: [
        { value: 1, label: '每天' },
        { value: 2, label: '每周' },
        { value: 3, label: '每月' },
        { value: 4, label: '每隔小时数' },
        { value: 5, label: '每隔分钟数' },
        { value: 6, label: '每隔秒数' }
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
        },
        {
          value: 4,
          executeTimeType: 4,
          label: '每隔小时数'
        },
        {
          value: 5,
          executeTimeType: 5,
          label: '每隔分钟数'
        },
        {
          value: 6,
          executeTimeType: 6,
          label: '每隔秒数'
        }
      ],
      showFrequency: false,
      showPicker: false,
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入推送地址URL', trigger: 'blur' }
        ],
        subscribeType: [
          { required: true, message: '请选择订阅类型', trigger: 'blur' }
        ]
      },
      val: ''
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
    'rulesForm.frequency': {
      handler(options) {
        if (this.rulesForm.executeDate[0] === 4 || this.rulesForm.executeDate === 4) {
          this.val = options * 3600
        } else if (this.rulesForm.executeDate[0] === 5 || this.rulesForm.executeDate === 5) {
          this.val = options * 60
        } else if (this.rulesForm.executeDate[0] === 6 || this.rulesForm.executeDate === 6) {
          this.val = options
        }
        this.time = this.$tool.sToYMD(this.val)
      },
      deep: true
    }
  },
  async created() {
    this.setMonth()
    await this.findSysDictionaryDetail()
    if (this.id) {
      await this.getHyitSubscribe()
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    // 设置月份天数
    setMonth() {
      const monthArr = []
      for (var i = 1; i < 32; i++) {
        monthArr.push({ value: i, executeDay: i, label: `${i}号` })
      }
      this.$set(this.runTimeOptions[2], 'children', monthArr)
    },
    async findSysDictionaryDetail() {
      const res = await this.$request({
        url: api.subscription.findSysDictionaryDetail,
        data: { dictCode: 'subscribe_type' }
      })
      if (res.code !== 1) return
      this.connectStatue = res.data
    },
    // 获取数据
    async getHyitSubscribe() {
      const res = await this.$request({
        url: api.subscription.getHyitSubscribe,
        data: {
          id: this.id
        }
      })
      if (res.code !== 1) return
      const rulesForm = {}
      Object.keys(this.rulesForm).forEach(key => {
        rulesForm[key] = res.model[key]
      })
      if (rulesForm['executeTimeType'] === 1) {
        rulesForm['executeDate'] = rulesForm['executeTimeType']
        this.showFrequency = false
      } else if (rulesForm['executeTimeType'] === 2) {
        rulesForm['executeDate'] = [rulesForm['executeTimeType'], rulesForm['executeDay']]
        this.showFrequency = false
      } else if (rulesForm['executeTimeType'] === 3) {
        rulesForm['executeDate'] = [rulesForm['executeTimeType'], rulesForm['executeDay']]
        this.showFrequency = false
      } else if (rulesForm['executeTimeType'] === 4) {
        // rulesForm['frequency'] = (rulesForm['frequency'] / 3600)
        // this.company = '小时'
        // this.rulesForm.frequency = (rulesForm['frequency'] / 3600)
        this.rulesForm.frequency = rulesForm['frequency']
        this.showFrequency = true
        this.showPicker = true
        rulesForm['executeDate'] = [rulesForm['executeTimeType']]
      } else if (rulesForm['executeTimeType'] === 5) {
        // this.company = '分钟'
        // rulesForm['frequency'] = (rulesForm['frequency'] / 60)
        // this.rulesForm.frequency = (rulesForm['frequency'] / 60)
        this.rulesForm.frequency = rulesForm['frequency']
        this.showFrequency = true
        this.showPicker = true
        rulesForm['executeDate'] = [rulesForm['executeTimeType']]
        this.rulesForm.frequency = rulesForm['frequency']
      } else if (rulesForm['executeTimeType'] === 6) {
        this.showFrequency = true
        this.showPicker = true
        this.rulesForm.frequency = rulesForm['frequency']
        // this.company = '秒'
        rulesForm['executeDate'] = [rulesForm['executeTimeType']]
      }
      if (rulesForm['executeTimeType'] === 1 || rulesForm['executeTimeType'] === 2 || rulesForm['executeTimeType'] === 3) {
        const executeHour = rulesForm['executeHour'] >= 10 ? rulesForm['executeHour'] : `0${rulesForm['executeHour']}`
        const executeMinute = rulesForm['executeMinute'] >= 10 ? rulesForm['executeMinute'] : `0${rulesForm['executeMinute']}`
        const executeSecond = rulesForm['executeSecond'] >= 10 ? rulesForm['executeSecond'] : `0${rulesForm['executeSecond']}`
        const NowDate = new Date()
        rulesForm['executeTime'] = new Date(`${NowDate.getFullYear()}-${NowDate.getMonth() + 1}-${NowDate.getDate()} ${executeHour}:${executeMinute}:${executeSecond}`)
      }
      this.rulesForm = rulesForm
    },
    // 选择日期
    handleChangeDate(val) {
      if (val[0] === 1 || val[0] === 2 || val[0] === 3) {
        this.$set(this.rulesForm, 'executeDate', val)
        this.$set(this.rulesForm, 'executeTimeType', val[0])
        this.$set(this.rulesForm, 'executeDay', val[1])
        this.showPicker = false
        this.showFrequency = false
      } else {
        if (val[0] === 4) {
          this.company = '小时'
        } else if (val[0] === 5) {
          this.company = '分钟'
        } else if (val[0] === 6) {
          this.company = '秒'
        }
        this.showFrequency = true
        this.$set(this.rulesForm, 'executeDate', val)
        this.$set(this.rulesForm, 'executeTimeType', val[0])
        this.$set(this.rulesForm, 'executeDay', '')
        this.$set(this.rulesForm, 'executeTime', '')
        this.showPicker = true
      }
    },
    // 选择时间
    handleChangeTime(val) {
      const DateObj = new Date(val)
      this.$set(this.rulesForm, 'executeTime', val)
      this.$set(this.rulesForm, 'executeHour', DateObj.getHours())
      this.$set(this.rulesForm, 'executeMinute', DateObj.getMinutes())
      this.$set(this.rulesForm, 'executeSecond', DateObj.getSeconds())
    },
    // 改变鉴权状态
    async changeAuthStatue(row) {
      this.rulesForm.isAuth = row.isAuth
    },
    // 改变启用状态
    async changeUserStatue(row) {
      this.rulesForm.isUse = row.isUse
    },
    // 保存
    onSubmit() {
      this.$refs['form'].validate(async valid => {
        const formParam = {...this.rulesForm}
        // if (formParam.executeDate[0] === 4) {
        //   formParam.frequency = formParam.frequency * 3600
        // } else if (formParam.executeDate[0] === 5) {
        //   formParam.frequency = formParam.frequency * 60
        // }

        delete formParam.executeTime // 接口不需要的参数
        delete formParam.executeDate // 接口不需要的参数

        if (valid) {
          this.TaskSubscribeChange()
          if (this.id) { // 编辑
            this.loading = true
            this.$request({
              url: api.subscription.updateHyitSubscribe, data: { id: this.id, ...formParam }
            }).then(res => {
              if (res.code === 1) {
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          } else {
            this.loading = true
            this.$request({
              url: api.subscription.insertHyitSubscribe, data: Object.assign(formParam)
            }).then(res => {
              if (res.code === 1) {
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          }
        }
      })
    },
    // 重置
    onReset() {
      this.$refs['form'].resetFields()
    },
    TaskSubscribeChange() {
      this.$request({
        url: api.subscription.TaskSubscribeChange, data: {}
      })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
