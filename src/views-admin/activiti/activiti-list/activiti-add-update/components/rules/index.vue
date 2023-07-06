<template>
  <!-- <el-row :gutter="20"> -->
  <el-form
    ref="eventform"
    :model="rulesForm"
    :rules="rules"
    label-width="110px"
    inline
  >
    <el-col v-bind="colSpan">
      <el-form-item label="事件类型：" prop="hyEventClassid">
        <el-select
          v-model="rulesForm.hyEventClassid"
          :disabled="rulesForm.hyLinkId > 0 && rulesForm.hyLinkSrcId > 0"
          placeholder="请选择"
          style="width: 300px"
          @change="onEventClassChange"
        >
          <el-option
            v-for="item in hyitEventClass"
            :key="item.hyEventClassid"
            :label="item.hyEventClassname"
            :value="item.hyEventClassid"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col v-bind="colSpan">
      <el-select
        v-model="rulesForm.type"
        class="typeWrap"
        placeholder="事件"
        style="width: 80px"
        @change="clearEventIds"
      >
        <el-option label="事件" :value="0" />
        <el-option label="阈值" :value="1" />
      </el-select>
      <el-form-item
        ref="hyEventId"
        label
        prop="hyEventIds"
        class="typeContainer"
      >
        <el-select
          v-if="rulesForm.type === 0"
          v-model="rulesForm.hyEventIds"
          multiple
          placeholder="请选择"
          style="width: 300px"
          @blur="blurClear"
        >
          <el-option
            v-for="item in filterHyitEvent"
            :key="item.hyEventId"
            :label="item.hyEventName"
            :value="item.hyEventId"
          />
        </el-select>
        <el-select
          v-if="rulesForm.type === 1"
          v-model="rulesForm.hyEventIds"
          multiple
          placeholder="请选择"
          style="width: 300px"
          @blur="blurClear"
        >
          <el-option
            v-for="item in thresholdIdList"
            :key="item.conditionId"
            :label="item.name"
            :value="item.conditionId"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col v-bind="colSpan">
      <el-form-item label="设备类型：">
        <el-select v-model="rulesForm.deviceTypeIds" multiple placeholder="请选择" style="width:300px" @change="changedeviceTypeIds">
          <el-option
            v-for="item in deviceTypeList"
            :key="item.id"
            :label="item.dictdataName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-col>
  </el-form>
  <!-- </el-row> -->
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'Rules',
  data() {
    return {
      rulesForm: {
        hyEventClassid: '',
        hyLinkId: '',
        hyEventIds: 0,
        hyOrgId: '',
        level: '',
        type: 0,
        deviceTypeIds: []
      },
      rules: {
        hyEventIds: [
          { required: true, message: '请选择事件', trigger: 'blur' }
        ],
        hyEventClassid: [
          { required: true, message: '请选择事件类型', trigger: 'change' }
        ]
      },
      hyitEventClass: [], // 事件类型
      thresholdIdList: [], // 阈值类型ID列表
      hyitEvent: [],
      colSpan: {
        xs: 24,
        md: 12,
        lg: 12,
        xl: 12
      },
      listQuery: {
        name: '',
        HyEventClassId: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      tempFlag: false,
      tempEventId: '',
      tempEven2tId: '',
      deviceTypeList: []
    }
  },
  computed: {
    hyLinkSrcId() {
      return this.$route.query.hyLinkSrcId
    },
    hyLinkId() {
      return this.$route.query.hyLinkId
    },
    filterHyitEvent() {
      return this.hyitEvent.filter(it => +it.hyEventClassid === this.rulesForm.hyEventClassid)
    }
  },
  watch: {
    rulesForm: {
      handler(val) {
        this.$emit('emitRulesForm', val)
      },
      deep: true
    }
  },
  async created() {
    await this.findHyitEventClass()
    await this.findHyitEvent()
    await this.findLinkageThresholdCondition()
    await this.findSysDictionaryDetail()
    if (this.hyLinkSrcId) {
      await this.initData()
    }
  },
  methods: {
    onEventClassChange() {
      this.rulesForm.hyEventId = ''
      this.rulesForm.hySrcIds = []
    },
    changedeviceTypeIds() {
      this.rulesForm['hySrcIds'] = []
    },
    async validate() {
      try {
        await this.$refs.eventform.validate()
      } catch (error) {
        throw new Error(error)
      }
    },
    async submit(hyLinkId) {
      try {
        const hySrcIds = this.rulesForm.hySrcIds
          .map((it) => it.hyVid || it.hyHostId || it.dvrId)
          .join(',')
        delete this.rulesForm.hySrcIds
        let query = {}
        if (this.rulesForm.deviceTypeIds.length) {
          query = {...this.rulesForm, hyLinkId, deviceTypeIds: this.rulesForm['deviceTypeIds'].join(','), hyEventIds: this.rulesForm['hyEventIds'].join(',')}
        } else {
          query = {...this.rulesForm, hyLinkId, hySrcIds, hyEventIds: this.rulesForm['hyEventIds'].join(',')}
        }

        await request({
          url: api.linkageManage.changeHyitLinkSrc,
          data: query
        })
      } catch (error) {
        throw new Error(error)
      }
    },
    async findSysDictionaryDetail() {
      const {data, code} = await request({url: api.linkageManage.findSysDictionaryDetail, data: {
        dictCode: 'it_dev_type', limit: -1
      }})
      if (code === 1) this.deviceTypeList = data
    },
    async initData() {
      // 获取编辑数据
      let { model, code } = await request({
        url: api.linkageManage.getHyitLinkSrc,
        data: { hyLinkSrcId: this.hyLinkSrcId, limit: -1 }
      })
      if (code !== 1) return
      if (!model) return
      this.rulesForm = {
        ...model,
        hySrcIds: [],
        hyEventIds: model['hyEventIds'].split(',').map((it) => +it),
        deviceTypeIds: []
      }
      if (model.type === null) this.rulesForm.type = 0 // 给个默认值显示

      // 获取事件源
      let { data: srcdata, code: srcCode } = await request({
        // 获取事件
        url: api.linkageManage.findLinkageSrc,
        data: { hyLinkId: this.hyLinkId, limit: -1 }
      })
      if (srcCode !== 1) return
      this.rulesForm.deviceTypeIds = srcdata.map((it) => it['deviceTypeId']).filter(Boolean)
      if (this.rulesForm.hyEventClassid === 1) {
        this.matchHySrcIds('findVideoDvr', srcdata, 'dvrId')
      }
      if (this.rulesForm.hyEventClassid === 2) {
        this.matchHySrcIds('findHyitHost', srcdata, 'hyHostId')
      }
      if (this.rulesForm.hyEventClassid === 3) {
        this.matchHySrcIds('findHyitDeviceValue', srcdata, 'hyVid')
      }
    },
    matchHySrcIds(fun, hysrcids, field) {
      let hySrcIds = []
      const ids = hysrcids.map((it) => it.hySrcId).join(',')
      if (!ids.length) return
      this[fun](ids).then((res) => {
        // 匹配对象
        res.forEach((it) => {
          hysrcids.forEach((dataIt) => {
            if (it[field] === dataIt.hySrcId) {
              hySrcIds.push(it)
            }
          })
        })
        this.rulesForm.hySrcIds = hySrcIds
      })
    },
    async findVideoDvr(ids) {
      let { data, code } = await request({
        url: api.video.findVideoDvr,
        data: { limit: -1, ids }
      })
      if (code === 1) return data
    },
    async findHyitHost(ids) {
      let { data, code } = await request({
        url: api.itMonitor.findHyitHost,
        data: { limit: -1, ids }
      })
      if (code === 1) return data
    },
    async findHyitDeviceValue(ids) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, ids }
      })
      if (code === 1) return data
    },
    async findHyitEventClass() {
      // 事件类型
      let { data, code } = await request({
        url: api.linkageManage.findHyitEventClass,
        data: { limit: -1 }
      })
      if (code !== 1) return

      this.hyitEventClass = data.filter((item) => {
        return +item.level === 0
      })
      return data
    },
    async findHyitEvent() {
      // 事件
      let { data, code } = await request({
        url: api.linkageManage.findHyitEvent,
        data: {
          limit: -1,
          hyEventClassid: this.rulesForm.hyEventClassid || ''
        }
      })
      if (code !== 1) return
      this.hyitEvent = data
      return data
    },
    // 查找阈值类型
    async findLinkageThresholdCondition() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageThresholdCondition,
        data: {...this.listQuery, limit: -1}
      })
      if (code !== 1) return
      this.thresholdIdList = data
    },
    // 切换事件和阈值时调用，解决多选里出现混乱的选项问题
    clearEventIds(item) {
      this.rulesForm.type = item
      if (!this.tempFlag) {
        this.tempEventId = this.rulesForm.hyEventIds
        this.rulesForm.hyEventIds = this.tempEven2tId
        this.tempFlag = true
      } else {
        this.tempEven2tId = this.rulesForm.hyEventIds
        this.rulesForm.hyEventIds = this.tempEventId
        this.tempFlag = false
      }
    },
    blurClear() {
      this.$refs.eventform.clearValidate()
    }
  }
}
</script>

<style></style>
