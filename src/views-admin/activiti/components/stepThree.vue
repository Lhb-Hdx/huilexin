<template>
  <div class="stepThree">
    <el-form ref="dynamicValidateForm" inline :model="dynamicValidateForm">
      <el-form-item
        v-for="(domain,index) in dynamicValidateForm.domains"
        :key="domain.key"
      >
        <el-form-item label="动作类型：" label-width="120px" prop="hyActionClassId">
          <el-select v-model="domain.hyActionClassId" placeholder="请选择" @change="hyActionClassIdChange($event,domain)">
            <el-option v-for="item in actionClass" :key="item.hyActionClassId" :label="item.hyActionClassName" :value="item.hyActionClassId" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作：" label-width="120px" prop="hyAid">
          <el-select v-model="domain.hyAid" placeholder="请选择" :disabled="!domain.hyActionClassId" @change="hyAidChange($event,domain)">
            <el-option v-for="item in actions" :key="item.hyAid" :label="item.hyActionName" :value="item.hyAid" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作源：" label-width="120px" prop="hyAsId">
          <el-select v-model="domain.hyAsId" placeholder="请选择">
            <el-option v-for="item in actionSource" :key="item.cid" :label="item.cname" :value="item.cid" />
          </el-select>
        </el-form-item>
        <el-button v-if="index!==dynamicValidateForm.domains.length-1" icon="el-icon-minus" @click="removeDomain(domain,index)" />
        <el-button v-else icon="el-icon-plus" @click="addDomain" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { guid } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'StepThree',
  props: {
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dynamicValidateForm: {
        domains: [{
          hyLinkId: '',
          hyActionClassId: '',
          hyAid: '',
          hyAsId: '',
          key: guid()
        }]
      },
      rules: {
        // event: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      actionClass: [],
      actions: [],
      actionSource: [],
      hyId: ''
    }
  },
  computed: {
    hyLinkId() {
      return this.$route.query.hyLinkId
    }
  },
  watch: {
    dynamicValidateForm: {
      deep: true,
      handler(n) {
        this.$emit('update:formData', { ...this.formData, action: n })
      }
    }
  },
  created() {
    this.dynamicValidateForm = this.formData['action']
    this.initData()
    this.findHyitActionClass()
    if (this.hyLinkId) {
      this.fetchData()
    }
  },

  methods: {
    validate() {
      let flag
      this.$refs['form'].validate((val) => { flag = val })
      return flag
    },
    async initData() {
      const that = this
      for (let i = 0; i < this.dynamicValidateForm['domains'].length; i++) {
        const ele = this.dynamicValidateForm['domains'][i]
        await that.findHyitAction(ele['hyActionClassId'])
        const obj = this.actions.find(it => it.hyAid === ele.hyAid)
        if (!obj) return
        await this.getDynamicSelectData(obj)
      }
    },
    async fetchData() {
      const that = this
      let { data, code } = await request({
        url: api.linkageManage.findHyitLinkAction,
        data: { hyLinkIds: this.hyLinkId }
      })
      if (code !== 1) return
      // 如果获取的编辑数据长度为0，不删除第一项
      if (data.length > 0)that.dynamicValidateForm.domains.shift()
      for (let i = 0; i < data.length; i++) {
        const ele = data[i]
        await that.findHyitAction(ele['hyActionClassId'])
        const obj = this.actions.find(it => it.hyAid === ele.hyAid)
        await this.getDynamicSelectData(obj).then(() => {
          that.dynamicValidateForm.domains.push({ ...ele, hyAsId: String(ele.hyAsId), key: guid() })
        })
      }
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    removeDomain(domain, index) {
      this.$confirm('确认删除已保存的动作吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (domain.hyId) {
          request({
            url: api.linkageManage.deleteHyitLinkAction,
            data: { hyId: domain.hyId }
          }).then(() => {
            this.$message.success('删除成功')
          }, () => {
            this.$message.success('删除失败')
          })
        }
        this.dynamicValidateForm.domains.splice(index, 1)
      })
    },
    addDomain() {
      this.dynamicValidateForm.domains.push({
        hyLinkId: '',
        hyActionClassId: '',
        hyAid: '',
        hyAsId: '',
        key: guid()
      })
    },
    async  findHyitActionClass() { // 动作类型
      let { data, code } = await request({
        url: api.linkageManage.findHyitActionClass,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.actionClass = data
    },
    async findHyitAction(id) { // 动作
      let { data, code } = await request({
        url: api.linkageManage.findHyitAction,
        data: { hyActionClassId: id, limit: -1 }
      })
      if (code !== 1) return
      this.actions = data
    },
    getDynamicSelectData(obj) { // 动作源
      console.log(1, obj)
      return new Promise((resolve, reject) => {
        request({
          url: api.linkageManage.getDynamicSelectData,
          data: {
            tableName: obj.hyActionTable,
            fieldName: obj.hyActionSrcName,
            fieldId: obj.hyActionSrcId,
            orgId: '',
            limit: -1
          }
        }).then(({ data, code }) => {
          if (code !== 1) return
          this.actionSource = data.map(it => ({ ...it, hyAsId: it.cid }))
          resolve()
        })
      })
    },
    hyActionClassIdChange(e, item) { // 动作的数据根据动作类型的改变获取
      this.$set(item, 'hyAid', '')
      this.$set(item, 'hyAsId', '')
      this.findHyitAction(item.hyActionClassId)
    },
    hyAidChange(e, item) { // 动作源的数据根据动作的改变获取数据
      this.$set(item, 'hyAsId', '')
      const obj = this.actions.find(it => it.hyAid === item.hyAid)
      this.getDynamicSelectData(obj)
    }
  }
}
</script>

<style>
.stepThree{
  width: 1250px;
  margin: auto;
  padding: 60px;
}
</style>
