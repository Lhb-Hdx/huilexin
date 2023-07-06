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
              <el-form-item label="模板名称" prop="hyTname">
                <el-input v-model.trim="form.hyTname" placeholder="请输入模板名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <div class="time-plan-list">
                <div v-for="item of timePlanList" :key="item.value" class="time-plan-item">
                  <div class="plan-item-week">
                    {{ item.text }}
                  </div>
                  <div class="plan-item-date">
                    <TimePlan v-if="showTimePlanList" :week-plan-item="item" @timePlanDown="timePlanDown" />
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
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
import TimePlan from '@/components/TimePlan/TimePlan'

export default {
  name: 'TimeTelAddUpdate',
  components: {
    TimePlan
  },
  data() {
    return {
      form: {
        hyTname: ''
      },
      rules: {
        hyTname: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ]
      },
      loading: false,
      confirmLoading: false,
      timePlanList: [
        {
          weekValue: 1,
          text: '星期一'
        },
        {
          weekValue: 2,
          text: '星期二'
        },
        {
          weekValue: 3,
          text: '星期三'
        },
        {
          weekValue: 4,
          text: '星期四'
        },
        {
          weekValue: 5,
          text: '星期五'
        },
        {
          weekValue: 6,
          text: '星期六'
        },
        {
          weekValue: 7,
          text: '星期天'
        }
      ],
      timePlanDetail: [],
      timePlanId: '',
      showTimePlanList: false,
      editTpData: [],
      haveTimeBlock: false
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
    } else {
      this.showTimePlanList = true
    }
  },
  methods: {
    fetchData() { // 获取编辑信息并展示
      this.loading = true
      request({ url: api.video.getHyitTime, data: { 'hyTid': this.id }}).then(res => {
        if (res.code === 1) {
          this.$set(this.form, 'hyTname', res.model.hyTname)
        }
      }).finally(() => {
        this.loading = false
      })
      request({ url: api.video.findHyitTimeDetail, data: { 'tid': this.id }}).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) this.haveTimeBlock = true
          for (var i = 0; i < res.data.length; i++) {
            const plans = {
              tid: res.data[i].hyTid,
              tdId: res.data[i].hyTdId,
              startHours: res.data[i].hyTsHours,
              startMinute: res.data[i].hyTsMin,
              endHours: res.data[i].hyTeHours,
              endMinute: res.data[i].hyTeMin
            }
            const weekIndex = this.timePlanList.findIndex((item) => item.weekValue === res.data[i].hyWeek)
            if (this.timePlanList[weekIndex].plans) {
              this.$set(this.timePlanList[weekIndex].plans, this.timePlanList[weekIndex].plans.length, { ...plans })
            } else {
              this.$set(this.timePlanList[weekIndex], 'plans', [{ ...plans }])
            }
          }
          this.showTimePlanList = true
        }
      })
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.id) { // 编辑
            this.timePlanId = this.id
            this.confirmLoading = true
            request({ url: api.video.updateHyitTime, data: { 'hyTid': this.id, 'hyTname': this.form.hyTname }}).then(res => {
              if (res.code === 1) {
                if (this.haveTimeBlock) {
                  request({ url: api.video.deleteHyitTimeDetailByTid, data: { 'tid': this.id }}).then(res => {
                    if (res.code === 1) {
                      this.submitHyitTimeDetail()
                      this.$message({
                        type: 'success',
                        message: '更新成功'
                      })
                      this.$router.back()
                    } else {
                      this.$message({
                        type: 'error',
                        message: '删除时间模板失败'
                      })
                    }
                  })
                } else {
                  this.submitHyitTimeDetail()
                  this.$router.back()
                }
              } else {
                this.$message({
                  type: 'error',
                  message: '编辑时间模板失败'
                })
              }
            }).finally(() => {
              this.confirmLoading = false
            })
          } else { // 新增
            this.confirmLoading = true
            request({ url: api.video.addHyitTime, data: { 'hyTname': this.form.hyTname }}).then(res => {
              if (res.code === 1) {
                this.timePlanId = res.model.hyTid
                this.submitHyitTimeDetail()
                this.$message({
                  type: 'success',
                  message: '新增成功'
                })
                this.$router.back()
              } else {
                this.$message({
                  type: 'error',
                  message: '新增时间模板失败'
                })
              }
            }).finally(() => {
              this.confirmLoading = false
            })
          }
        }
      })
    },
    onReset() { // 清空内容-重置
      this.$refs['form'].resetFields()
      for (var i = 0; i < this.timePlanList.length; i++) {
        delete this.timePlanList[i].plans
      }
      this.showTimePlanList = false
      this.$nextTick(function() {
        this.showTimePlanList = true
      })
    },
    timePlanDown(val) {
      const weekIndex = this.timePlanList.findIndex(item => item.weekValue === val.weekValue)
      for (var i = 0; i < val.tpData.length; i++) {
        if (val.tpData[i].tdId || val.tpData[i].tid) {
          const timePlanIItemIndex = this.timePlanList[weekIndex].plans.findIndex(item => item.tdId === val.tpData[i].tdId)
          this.$set(this.timePlanList[weekIndex].plans, timePlanIItemIndex, val.tpData[i])
        } else {
          if (this.timePlanList[weekIndex].plans) {
            const timestampIndex = this.timePlanList[weekIndex].plans.findIndex(item => item.timestamp === val.tpData[i].timestamp)
            if (timestampIndex === -1) {
              this.$set(this.timePlanList[weekIndex].plans, this.timePlanList[weekIndex].plans.length, val.tpData[i])
            } else {
              this.$set(this.timePlanList[weekIndex].plans, timestampIndex, val.tpData[i])
            }
          } else {
            this.$set(this.timePlanList[weekIndex], 'plans', [val.tpData[i]])
          }
        }
      }
    },
    submitHyitTimeDetail() {
      for (var i = 0; i < this.timePlanList.length; i++) {
        if (this.timePlanList[i].plans) {
          for (var j = 0; j < this.timePlanList[i].plans.length; j++) {
            const submitHyitTimeDetailParams = {
              hyTid: this.timePlanId,
              hyTsHours: Number(this.timePlanList[i].plans[j].startHours),
              hyTsMin: Number(this.timePlanList[i].plans[j].startMinute),
              hyTeHours: Number(this.timePlanList[i].plans[j].endHours),
              hyTeMin: Number(this.timePlanList[i].plans[j].endMinute),
              hyWeek: Number(this.timePlanList[i].weekValue)
            }
            request({ url: api.video.addHyitTimeDetail, data: { ...submitHyitTimeDetailParams }})
          }
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.time-plan-list {
  padding-left: 52px;
  .time-plan-item {
    display: flex;
    margin-bottom: 20px;
    .plan-item-week {
      width: 8%;
      display: flex;
      align-items: center;
    }
    .plan-item-date {
      width: 100%;
    }
  }
}
</style>
