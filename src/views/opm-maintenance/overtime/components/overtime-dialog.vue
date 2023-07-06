<template>
  <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
    <div class="dialog-body">
      <el-form ref="form" label-width="110px" :rules="rules" :model="form">
        <el-form-item label="申请人">
          <div class="user-info">
            <div class="user-name">{{ userInfo.realName }} {{ userInfo.tel }}</div>
            <div class="user-desc">{{ userInfo.positionName }} {{ userInfo.orgName }}</div>
          </div>
        </el-form-item>
        <el-form-item label="加班类型" prop="otType">
          <el-radio v-for="item in otTypes" :key="item.value" v-model="form.otType" :label="item.value">{{ item.label }}</el-radio>
        </el-form-item>
        <el-form-item label="加班开始时间" prop="otStartTime">
          <el-date-picker
            v-model="form.otStartTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择加班开始时间"
            @change="changeTime('otStartTime')"
          />
        </el-form-item>
        <el-form-item label="加班结束时间" prop="otEndTime">
          <el-date-picker
            v-model="form.otEndTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择加班结束时间"
            @change="changeTime('otEndTime')"
          />
        </el-form-item>
        <el-form-item label="累计时长" class="total-house">
          <div class="time-count">
            <div class="total">
              <span class="total-value">{{ form.totalHour }}</span> 小时
            </div>
          </div>
        </el-form-item>
        <el-form-item label="累计加班时间" class="total-house">
          <div class="time-count">
            <div class="total">
              <span class="total-value">{{ totalHourSummary.toFixed(2) }}</span> 小时
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.backup" type="textarea" />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { getUserInfo } from '@/utils/auth'

export default {
  name: 'OvertimeDialog',
  data() {
    return {
      showDialog: false,
      form: {
        otType: '',
        otStartTime: '',
        otEndTime: '',
        backup: '',
        statue: 1,
        totalHour: 0
      },
      formId: '',
      userInfo: {},
      otTypes: this.$paramsModel.opm.get('otType'),
      rules: {
        otType: [
          { required: true, message: '请选择加班类型', trigger: 'blur' }
        ],
        otStartTime: [
          { required: true, message: '请选择加班开始时间', trigger: 'blur' }
        ],
        otEndTime: [
          { required: true, message: '请选择加班结束时间', trigger: 'blur' }
        ]
      },
      dialogTitle: '',
      totalHourSummary: 0
    }
  },
  methods: {
    // 打开
    async open(options) {
      this.showDialog = true
      const userInfo = this.localStorageOperation('get', 'userInfo')
      if (!options) {
        this.dialogTitle = '新增加班申请'
        this.$set(this.form, 'otType', 1)
        this.$set(this.form, 'userId', userInfo.userId)
      } else {
        this.dialogTitle = '编辑加班申请'
        Object.keys(this.form).forEach(key => {
          this.$set(this.form, `${key}`, options[`${key}`])
        })
        this.formId = options.id
      }
      const getSysUser = await this.$request({ url: this.api.sys.getSysUser, data: { userId: userInfo.userId }})
      const findHrUserInfo = await this.commonRequestFn.findHrUserInfo({userId: userInfo.userId, companyId: getUserInfo().companyId})
      if (findHrUserInfo && findHrUserInfo.length > 0) {
        const getPosition = await this.$request({ url: this.api.sys.getSysCat, data: { catId: findHrUserInfo[0].positionCatId } })
        if (getPosition.code === 1 && getPosition.model) {
          getSysUser.model.positionName = getPosition.model.catName
        }
        const getOrg = await this.commonRequestFn.getHyitOrg({ hyOrgId: findHrUserInfo[0].organizationCatId })
        if (getOrg) {
          getSysUser.model.orgName = getOrg.hyOrgName
        }
      }
      this.userInfo = getSysUser.model
      const findHyitDutyOverTimeSummary = await this.$request({ url: this.api.opm.findHyitDutyOverTime, data: { userId: this.localStorageOperation('get', 'userInfo').userId, limit: 1 } })
      if (findHyitDutyOverTimeSummary.code === 1 && findHyitDutyOverTimeSummary.data) this.totalHourSummary = findHyitDutyOverTimeSummary.data.length > 0 ? findHyitDutyOverTimeSummary.data[0].otTotalHour : 0
    },
    // 保存
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const data = { ...this.form }
          if (this.formId !== '') data.id = this.formId
          const api = this.formId !== '' ? this.api.opm.updateHyitDutyOverTime : this.api.opm.insertHyitDutyOverTime
          this.$request({ url: api, data }).then(res => {
            if (res.code === 1) {
              this.showDialog = false
              this.$message.success(res.msg)
              this.$EventBus.$emit('reloadOvertimeList')
            }
          })
        }
      })
    },
    // 选择时间
    changeTime(attr) {
      if (new Date(this.form.otStartTime).getTime() > new Date(this.form.otEndTime).getTime()) {
        this.$set(this.form, `${attr}`, '')
        return this.$message('开始时间不能大于结束时间')
      }
      if (this.form.otStartTime.length > 0 && this.form.otEndTime.length > 0) {
        this.$set(this.form, 'totalHour', this.$tool.getHoursDiff(this.form.otStartTime, this.form.otEndTime).toFixed(2))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-body {
  .time {
    &:first-of-type {
      margin-right: 10px;
    }
  }
  .user-info {
    .user-desc {
      color: #9b9b9b;
    }
  }
  .time-count {
    .total {
      display: inline-block;
      .total-value {
        font-weight: 700;
      }
    }
  }
  .total-house {
    display: inline-block;
    width: 35%;
  }
}
</style>
