<template>
  <div class="stepOne">
    <el-form ref="form" :model="rulesForm" :rules="rules" label-width="120px">
      <el-form-item label="事件类型：" prop="hyEventClassid">
        <el-select v-model="rulesForm.hyEventClassid" placeholder="请选择" style="width:300px" @change="rulesForm.hyEventId='',rulesForm.hySrcId=''">
          <el-option v-for="item in hyitEventClass" :key="item.hyEventClassid" :label="item.hyEventClassname" :value="item.hyEventClassid" />
        </el-select>
      </el-form-item>
      <el-form-item label="事件：" prop="hyEventId">
        <el-select v-model="rulesForm.hyEventId" placeholder="请选择" style="width:300px" :disabled="!rulesForm.hyEventClassid" @change="rulesForm.hySrcId=''">
          <el-option v-for="item in hyitEvent" :key="item.hyEventId" :label="item.hyEventName" :value="item.hyEventId" />
        </el-select>
      </el-form-item>
      <el-form-item label="区域：" prop="hyOrgId">
        <el-select v-model="rulesForm.hyOrgId" placeholder="请选择" style="width:300px">
          <el-option v-for="item in hyitOrg" :key="item.hyOrgId" :label="item.hyOrgName" :value="item.hyOrgId" />
        </el-select>
      </el-form-item>
      <el-form-item label="事件等级：" prop="level">
        <el-select v-model="rulesForm.level" placeholder="请选择" style="width:300px">
          <el-option v-for="item in hyitAlarmLevel" :key="item.level" :label="item.levelName" :value="item.level" />
        </el-select>
      </el-form-item>
      <el-form-item label="事件源：" prop="hySrcId">
        <el-select v-model="rulesForm.hySrcId" placeholder="请选择" style="width:300px" :disabled="!rulesForm.hyEventId">
          <el-option v-for="item in hyitLinkSrc" :key="item.hySrcId" :label="item.hySrcName" :value="+item.hySrcId" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
export default {
  name: 'StepOne',
  props: {
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      rulesForm: {
        hyEventClassid: '',
        hyLinkId: '',
        hyEventId: '',
        hyOrgId: '',
        level: '',
        hySrcId: ''
      },
      rules: {
        hyEventId: [{ required: true, message: '请选择事件', trigger: 'change' }]
      },
      hyitOrg: [], // 区域
      hyitEvent: [], // 事件
      hyitEventClass: [], // 事件类型
      hyitAlarmLevel: [], // 报警等级
      hyitLinkSrc: []// 事件源
    }
  },
  computed: {
    hyLinkSrcId() {
      return this.$route.query.hyLinkSrcId
    }
  },
  watch: {
    rulesForm(n) {
      this.$emit('update:formData', { ...this.formData, event: n })
    },
    'rulesForm.hyEventClassid': { // 选择完事件类型调用事件
      handler() {
        this.findHyitEvent()
      }
    },
    'rulesForm.hyEventId': {
      async handler(n) {
        await this.findHyitEvent()
        if (!this.rulesForm.hyEventId) return
        const obj = this.hyitEvent.find(it => +it.hyEventId === n)
        this.getDynamicSelectData(obj)
      }
    }
  },
  async created() {
    this.rulesForm = this.formData['event']
    await this.findHyitOrg()
    await this.findHyitEventClass()
    await this.findHyitAlarmLevel()
    if (this.hyLinkSrcId) {
      await this.fetchData()
    }
  },
  methods: {
    validate() {
      let flag
      this.$refs['form'].validate((val) => { flag = val })
      return flag
    },
    async fetchData() {
      let { data, code } = await request({
        url: api.linkageManage.findHyitLinkSrc,
        data: { limit: -1 }
      })
      if (code !== 1) return
      let obj = data.find(it => it.hyLinkSrcId === +this.hyLinkSrcId)
      this.rulesForm = obj
    },
    async findHyitEvent() { // 事件
      let { data, code } = await request({
        url: api.linkageManage.findHyitEvent,
        data: { limit: -1, hyEventClassid: this.rulesForm.hyEventClassid || '' }
      })
      if (code !== 1) return
      this.hyitEvent = data
    },
    async findHyitEventClass() { // 事件类型
      let { data, code } = await request({
        url: api.linkageManage.findHyitEventClass,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitEventClass = data
    },
    async findHyitOrg() { // 区域
      let { data, code } = await request({ url: api.org.findHyitOrg, limit: -1 })
      if (code !== 1) return
      this.hyitOrg = data
    },
    async findHyitAlarmLevel() { // 报警等级
      let { data, code } = await request({
        url: api.linkageManage.findHyitAlarmLevel,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitAlarmLevel = data
    },
    async getDynamicSelectData(obj) { // 事件源
      let { data, code } = await request({
        url: api.linkageManage.getDynamicSelectData,
        data: {
          tableName: obj.hySrcTable,
          fieldName: obj.hySrcName,
          fieldId: obj.hySrcId,
          orgId: '',
          limit: -1
        }
      })
      if (code !== 1) return

      data = data.map(it => {
        return {
          hySrcId: it.hyDeviceId || it.cid || it.hyHostId,
          hySrcName: it.cname || it.hyDeviceName || it.hyHostName
        }
      })
      this.hyitLinkSrc = data
    }
  }
}
</script>

<style>
.stepOne{
  width: 600px;
  margin: auto;
  padding: 60px;

}
</style>
