<template>
  <div class="custom-form-design">
    <VFormDesigner ref="vfDesignerRef" :designer-config="designerConfig">
      <template #customToolButtons>
        <el-button type="text" @click="printFormJson">保存</el-button>
      </template>
    </VFormDesigner>
  </div>
</template>

<script>
import DataSourceManage from '@/components/CustomForm/DataSourceManage/dataSourceManage'

export default {
  name: 'CustomFormDesign',
  props: {
    formId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      designerConfig: {
        resetFormJson: false,
        toolbarMaxWidth: 490
      }
    }
  },
  watch: {
    formId: {
      handler() {
        this.getUserDefineForm()
      }
    }
  },
  beforeDestroy() {
    if (this.formId) {
      this.localStorageOperation('clean', 'widget__list__backup')
    }
    this.localStorageOperation('clean', 'form__config__backup')
  },
  mounted() {
    this.getUserDefineForm()
  },
  methods: {
    // 保存数据
    async printFormJson() {
      const formJson = { ...this.$refs.vfDesignerRef.getFormJson() }
      formJson.formConfig.dataSources = []
      const updateUserDefineForm = await this.updateUserDefineForm(JSON.stringify(formJson))
      if (updateUserDefineForm.code === 1) {
        this.$message.success('保存成功')
      } else {
        this.$message.error(updateUserDefineForm.msg)
      }
    },
    // 更新表单json
    async updateUserDefineForm(userData) {
      return this.$request({ url: this.api.userDefineForm.updateUserDefineForm, data: { id: this.formId, userData } })
    },
    // 获取表单json
    async getUserDefineForm() {
      const getUserDefineForm = await this.$request({ url: this.api.userDefineForm.getUserDefineForm, data: { id: this.formId } })
      if (getUserDefineForm.code !== 1) return
      // 设置表单设计器json内容
      let parseJson = {}
      if (getUserDefineForm.model.userData) {
        parseJson = JSON.parse(getUserDefineForm.model.userData)
      } else {
        parseJson = {
          formConfig: {}
        }
      }
      parseJson.formConfig.dataSources = DataSourceManage
      // 设置数据源到 form__config__backup 缓存中，给vform插件调用
      this.$refs.vfDesignerRef.setFormJson(JSON.stringify(parseJson))
    }
  }
}
</script>

<style scoped>

</style>
