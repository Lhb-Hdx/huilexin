<template>
  <!-- <el-row> -->
  <!--      联动-->
  <div>
    <el-form
      ref="form"
      :model="linkForm"
      :rules="linkrules"
      label-width="110px"
      inline
    >
      <el-col v-bind="colSpan">
        <el-form-item label="事件等级：" prop="level">
          <el-select
            v-model="linkForm.level"
            placeholder="请选择"
            style="width: 300px"
          >
            <el-option
              v-for="item in hyitAlarmLevel"
              :key="+item.dictdataValue"
              :label="item.dictdataName"
              :value="+item.dictdataValue"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col v-bind="colSpan">
        <el-form-item label="联动名称：" prop="hyLinkName">
          <el-input
            v-model="linkForm.hyLinkName"
            placeholder="请输入联动名称"
            style="width: 300px"
          />
        </el-form-item>
      </el-col>
      <el-col v-bind="colSpan">
        <el-form-item label="状态：" prop="status">
          <el-select
            v-model="linkForm.status"
            placeholder="请选择"
            style="width: 300px"
          >
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col v-bind="colSpan">
        <el-form-item label="时间模板：" prop="hyTid">
          <el-select
            v-model="linkForm.hyTid"
            placeholder="请选择"
            style="width: 300px"
          >
            <el-option
              v-for="item in hyitTimes"
              :key="item.hyTid"
              :label="item.hyTname"
              :value="item.hyTid"
            />
          </el-select>
          <el-link type="primary" class="ml-10" @click="handleViewTime">查看</el-link>
        </el-form-item>
      </el-col>
      <el-col v-bind="colSpan">
        <el-form-item label="是否过滤时间：">
          <el-switch v-model="linkForm.showTime" @change="linkForm.time=0" />
          <span class="ml-8">同一告警在过滤时间内不会重复执行配置的动作</span>
        </el-form-item>
        <el-form-item
          v-if="linkForm.showTime"
          label="过滤时间(秒):"
          prop="time"
        >
          <el-input
            v-model.number="linkForm.time"
            placeholder="请输入过滤时间"
            style="width: 300px"
            type="number"
          />
        </el-form-item>
      </el-col>
    </el-form>
    <!-- </el-row> -->

    <el-dialog title="时间模板" :visible.sync="timeDialog" width="50%">
      <div ref="timePlanList" class="time-plan-list">
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
              :style="{ left: items.left + 'px', width: items.width + 'px' }"
            />
          </div>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="timeDialog = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
  <!--    时间模板选择-->
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'Event',
  data() {
    return {
      linkForm: {
        hyLinkName: '',
        status: '',
        hyTid: '',
        hyMhId: '',
        time: ''
      },
      linkrules: {
        hyTid: [{ required: true, message: '请选择', trigger: 'change' }],
        hyLinkName: [{ required: true, message: '请输入', trigger: 'blur' }]
        // time: [
        //   {
        //     required: false,
        //     type: number,
        //     message: '请输入数字',
        //     trigger: ['change', 'blur']
        //   }
        // ]
      },
      colSpan: {
        xs: 24,
        md: 12,
        lg: 12,
        xl: 12
      },
      status: [
        {
          label: '无效',
          value: 0
        },
        {
          label: '有效',
          value: 1
        }
      ],
      hyitAlarmLevel: [],
      hyitTimes: [],
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
      ],
      timeDialog: false
    }
  },
  computed: {
    hyLinkSrcId() {
      return this.$route.query.hyLinkSrcId
    },
    hyLinkId() {
      return this.$route.query.hyLinkId
    }
  },
  created() {
    this.findHyitAlarmLevel()
    this.findHyitTime()
    if (this.hyLinkSrcId) {
      this.initData()
    }
  },
  methods: {
    async validate() {
      try {
        await this.$refs.form.validate()
      } catch (error) {
        throw new Error(error)
      }
    },
    async submit() {
      try {
        // 提交联动
        delete this.linkForm.hyCtime
        delete this.linkForm.hyUtime
        let { model, code } = await request({
          url: this.hyLinkId
            ? api.linkageManage.updateLinkageRules
            : api.linkageManage.insertLinkageRules,
          data: { ...this.linkForm, time: !this.linkForm.time ? 0 : this.linkForm.time }
        })
        if (code === 1) return (model && model.hyLinkId) || this.hyLinkId
      } catch (error) {
        console.log('error: ', error)
        throw new Error(error)
      }
    },
    async initData() {
      let { code: code, model: model } = await request({
        url: api.linkageManage.getHyitLink,
        data: { hyLinkId: this.hyLinkId, limit: -1 }
      })
      if (code !== 1) return
      if (model.time) model.showTime = true
      this.linkForm = model
    },
    async findHyitAlarmLevel() {
      // 报警等级
      let { data, code } = await request({
        url: api.linkageManage.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', limie: -1 }
      })
      if (code !== 1) return
      this.hyitAlarmLevel = data
    },
    async findHyitTime() {
      // 时间模板
      let { data, code } = await request({
        url: api.video.findHyitTime,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitTimes = data
    },
    clearTimeDetail() {
      this.timePlanDetail.forEach((item, index) => {
        this.$set(this.timePlanDetail[index], 'list', [])
      })
    },
    async handleViewTime() {
      if (!this.linkForm['hyTid']) return
      this.timeDialog = true
      await this.$nextTick()
      // 获取时间模板
      this.clearTimeDetail()
      const sWidth = (this.$refs.timePlanList.clientWidth - (20 + 60)) / 86400
      request({
        url: api.video.findHyitTimeDetail,
        data: { tid: this.linkForm['hyTid'], limit: -1 }
      }).then((res) => {
        if (res.code === 1) {
          res.data.forEach((item) => {
            item.startSecond =
              Number(item.hyTsHours * 3600) + Number(item.hyTsMin * 60)
            item.endSecond =
              Number(item.hyTeHours * 3600) + Number(item.hyTeMin * 60)
            item.left = item.startSecond * sWidth
            item.width = (item.endSecond - item.startSecond) * sWidth
            const idx = this.timePlanDetail.findIndex(
              (items) => items.value === item.hyWeek
            )
            if (idx !== -1) {
              this.$set(
                this.timePlanDetail[idx].list,
                this.timePlanDetail[idx].list.length,
                item
              )
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
