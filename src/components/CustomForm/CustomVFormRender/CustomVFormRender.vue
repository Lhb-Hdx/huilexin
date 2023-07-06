<template>
  <div class="custom-form-render">
    <VFormRender ref="vfRenderRef" />
  </div>
</template>

<script>
import dataSourceManage from '@/components/CustomForm/DataSourceManage/dataSourceManage'

export default {
  name: 'CustomVFormRender',
  props: {
    // 表单id
    formId: {
      type: [String, Number],
      default: ''
    },
    // 工单id 或者是其他绑定的id
    orderId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      formJson: {},
      formData: {},
      optionData: {}
    }
  },
  watch: {
    formId: {
      handler() {
        this.loadForm()
      }
    }
  },
  mounted() {
    this.loadForm()
  },
  methods: {
    // 加载表单相关加载
    async loadForm() {
      if (!this.formId) {
        // 设置输入值
        this.$refs.vfRenderRef.setFormJson(JSON.stringify({ widgetList: [], formConfig: {} }))
      }
      // 获取表单
      const getUserDefineForm = await this.getUserDefineForm()
      if (!getUserDefineForm && getUserDefineForm.code !== 1) return
      // 根据数据源获取数据
      let parseJson = { widgetList: [], formConfig: {} }
      if (getUserDefineForm.model) {
        parseJson = this.$tool.isJSONString(getUserDefineForm.model.userData) ? JSON.parse(getUserDefineForm.model.userData) : { widgetList: [], formConfig: {} }
      }
      const getDataSourceParams = []
      if (parseJson.widgetList) {
        parseJson.widgetList.forEach(parseJsonItem => {
          if (parseJsonItem.options.useDataSource) {
            const idx = getDataSourceParams.findIndex(item => item.dataSourceType === parseJsonItem.options.dataSourceType)
            if (idx === -1) {
              const getIdx = dataSourceManage.findIndex(getItem => getItem.dataSourceType === parseJsonItem.options.dataSourceType)
              if (getIdx !== -1) getDataSourceParams.push(dataSourceManage[getIdx])
            }
          }
        })
        for (let i = 0; i < getDataSourceParams.length; i++) {
          let queryLength = 0
          Object.keys(getDataSourceParams[i].query).forEach(() => ++queryLength)
          const datas = await this.$request({ url: `${getDataSourceParams[i].api}`, data: queryLength === 0 ? { page: 1, limit: -1 } : { page: 1, limit: -1, ...getDataSourceParams[i].query } })
          if (datas.code === 1) {
            const parseJsonIdx = parseJson.widgetList.findIndex(parseJsonItem => parseJsonItem.options.useDataSource && parseJsonItem.options.dataSourceType === getDataSourceParams[i].dataSourceType)
            if (parseJsonIdx !== -1) {
              parseJson.widgetList[parseJsonIdx].options.optionItems = datas.data || []
              parseJson.widgetList[parseJsonIdx].options.labelKey = getDataSourceParams[i].label
              parseJson.widgetList[parseJsonIdx].options.valueKey = getDataSourceParams[i].value
            }
          }
        }
      }
      // 设置输入值
      this.$refs.vfRenderRef.setFormJson(JSON.stringify(parseJson))
      if (this.orderId) {
        const findUserDefineFormValue = await this.findUserDefineFormValue({ page: 1, limit: -1, orderId: this.orderId })
        if (findUserDefineFormValue.code !== 1) return
        const newFormData = {}
        findUserDefineFormValue.data.forEach(item => {
          // 处理布尔值被转字符串问题
          item.keyValue = item.keyValue === 'true' ? true : item.keyValue === 'false' ? false : item.keyValue
          newFormData[`${item.keyId}`] = item.keyValue
        })
        this.$refs.vfRenderRef.setFormData(newFormData)
      }
    },
    // 获取表单值
    async findUserDefineFormValue(query) {
      return this.$request({ url: this.api.userDefineForm.findUserDefineFormValue, data: query })
    },
    // 获取表单json
    async getUserDefineForm() {
      return await this.$request({ url: this.api.userDefineForm.getUserDefineForm, data: { id: this.formId } })
    },
    // 获取输入的内容
    getVFormInputData() {
      this.$refs.vfRenderRef.getFormData().then(formData => {
        this.$emit('getVFormEmitInputData', formData)
      })
    },
    // 校验必填
    async validateForm() {
      return new Promise(resolve => {
        this.$refs.vfRenderRef.validateForm(async (valid) => {
          if (!valid) {
            resolve({
              validate: false
            })
          } else {
            resolve({
              validate: true
            })
          }
        })
      })
    },
    // 保存输入的数据
    async saveVFormInputData(orderId) {
      return new Promise(resolve => {
        this.$refs.vfRenderRef.validateForm(async (valid) => {
          if (!valid) {
            resolve({
              validate: false
            })
          } else {
            const data = { orderId }
            const json = []
            const getFormData = await this.$refs.vfRenderRef.getFormData()
            Object.keys(getFormData).forEach(key => {
              json.push({
                keyId: key, keyValue: getFormData[`${key}`]
              })
            })
            data.json = JSON.stringify(json)
            const insertUserDefineFormValues = await this.$request({ url: this.api.userDefineForm.insertUserDefineFormValues, data })
            resolve({
              validate: true,
              ...insertUserDefineFormValues
            })
          }
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
