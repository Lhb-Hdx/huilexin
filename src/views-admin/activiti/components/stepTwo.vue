<template>
  <div class="stepTwo">
    <el-form
      ref="form"
      :model="rulesForm"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        label="联动名称："
        prop="hyLinkName"
      >
        <el-input
          v-model="rulesForm.hyLinkName"
          placeholder="请输入联动名称"
          style="width:300px"
        />
      </el-form-item>
      <el-form-item
        label="状态："
        prop="status"
      >
        <el-select
          v-model="rulesForm.status"
          placeholder="请选择"
          style="width:300px"
        >
          <el-option
            v-for="item in status"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="时间模板："
        prop="hyTid"
      >
        <el-select
          v-model="rulesForm.hyTid"
          placeholder="请选择"
          style="width:300px"
        >
          <el-option
            v-for="item in hyitTimes"
            :key="item.hyTid"
            :label="item.hyTname"
            :value="item.hyTid"
          />
        </el-select>
        <el-link
          type="primary"
          class="ml-10"
          @click="handleViewTime"
        >查看</el-link>
      </el-form-item>
      <el-form-item
        label="内容模板："
        prop="hyMhId"
      >
        <el-select
          v-model="rulesForm.hyMhId"
          placeholder="请选择"
          style="width:300px"
        >
          <el-option
            v-for="item in hyitModelHtmls"
            :key="item.hyMhId"
            :label="item.hyModeName"
            :value="item.hyMhId"
          />
        </el-select>
        <el-link
          type="primary"
          class="ml-10"
        >查看</el-link>
      </el-form-item>
    </el-form>

    <el-dialog
      title="时间模板"
      :visible.sync="timeDialog"
      width="50%"
    >
      <div
        ref="timePlanList"
        class="time-plan-list"
      >
        <div
          v-for="item in timePlanDetail"
          :key="item.value"
          class="plan-list-item flexBox align-item-center"
        >
          <div class="label">{{ item.label }}</div>
          <div class="label-block">
            <div
              v-for="(items, index) in item.list"
              :key="index"
              class="block-item"
              :style="{'left': items.left + 'px', width: items.width + 'px'}"
            />
          </div>
        </div>
      </div>
      <span slot="footer">
        <el-button @click=" timeDialog= false">关闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'StepTwo',
  props: {
    formData: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      rulesForm: {
        hyLinkName: '',
        status: '',
        hyTid: '',
        hyMhId: ''
      },
      rules: {
        hyTid: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      status: [{
        label: '无效',
        value: 0
      }, {
        label: '有效',
        value: 1
      }],
      hyitTimes: [],
      hyitModelHtmls: [],
      timeDialog: false,
      timePlanDetail: [
        {
          label: '星期一',
          value: 1,
          list: []
        },
        {
          label: '星期二',
          value: 2,
          list: []
        },
        {
          label: '星期三',
          value: 3,
          list: []
        },
        {
          label: '星期四',
          value: 4,
          list: []
        },
        {
          label: '星期五',
          value: 5,
          list: []
        },
        {
          label: '星期六',
          value: 6,
          list: []
        },
        {
          label: '星期日',
          value: 7,
          list: []
        }
      ]
    }
  },
  computed: {
    hyLinkId() {
      return this.$route.query.hyLinkId
    }
  },
  watch: {
    rulesForm(n) {
      this.$emit('update:formData', { ...this.formData, linkage: n })
    }
  },
  created() {
    this.rulesForm = this.formData['linkage']
    this.findHyitTime()
    this.findHyitModelHtml()
    if (this.hyLinkId) {
      this.rulesForm['hyLinkId'] = this.hyLinkId
      this.fetchData()
    }
  },
  methods: {
    validate() {
      let flag
      this.$refs['form'].validate((val) => { flag = val })
      return flag
    },
    clearTimeDetail() {
      this.timePlanDetail.forEach((item, index) => {
        this.$set(this.timePlanDetail[index], 'list', [])
      })
    },
    async handleViewTime() {
      if (!this.rulesForm['hyTid']) return
      // this.$router.push({
      //   name: 'TimeTelUpdate',
      //   query: {
      //     id: this.rulesForm['hyTid']
      //   }
      // })
      this.timeDialog = true
      await this.$nextTick()
      // 获取时间模板
      this.clearTimeDetail()
      const sWidth = (this.$refs.timePlanList.clientWidth - (20 + 60)) / 86400
      request({
        url: api.video.findHyitTimeDetail,
        data: { tid: this.rulesForm['hyTid'] }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.startSecond = Number(item.hyTsHours * 3600) + Number(item.hyTsMin * 60)
            item.endSecond = Number(item.hyTeHours * 3600) + Number(item.hyTeMin * 60)
            item.left = item.startSecond * sWidth
            item.width = (item.endSecond - item.startSecond) * sWidth
            const idx = this.timePlanDetail.findIndex(items => items.value === item.hyWeek)
            if (idx !== -1) {
              this.$set(this.timePlanDetail[idx].list, this.timePlanDetail[idx].list.length, item)
            }
          })
        }
      })
    },
    async fetchData() {
      let { model } = await request({
        url: api.linkageManage.getHyitLink,
        data: { hyLinkId: this.hyLinkId, limit: -1 }
      })
      for (const key in this.rulesForm) {
        this.$set(this.rulesForm, key, model[key])
      }
    },
    async findHyitTime() { // 时间模板
      let { data, code } = await request({
        url: api.video.findHyitTime,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitTimes = data
    },
    async findHyitModelHtml() { // 内容模板
      let { data, code } = await request({
        url: api.linkageManage.findHyitModelHtml,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitModelHtmls = data
    },
    submit() {
      request({
        url: api.linkageManage.insertHyitLink,
        data: this.rulesForm
      }).then(res => {
        console.log(res)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stepTwo {
  width: 600px;
  margin: auto;
  padding: 60px;
}
.time-plan-list {
  // margin-left: 140px;
  width: 100%;
  background: #f5f7fa;
  padding: 4px 0;
  .plan-list-item {
    padding: 10px;
    .label {
      font-size: 14px;
      width: 60px;
    }
    .label-block {
      background: #e4e4e4;
      width: calc(100% - 60px);
      height: 20px;
      position: relative;
      .block-item {
        position: absolute;
        background: #0866e2;
        height: 20px;
      }
    }
  }
}
</style>
