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
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item class="script-form-item label-text-left" label="模板名称" prop="tamplateName">
                <el-input v-model="form.tamplateName" placeholder="请输入模板名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item class="script-form-item label-text-left" label="适用场景" prop="sceneType">
                <el-select
                  v-model="form.sceneType"
                  placeholder="请选择适用场景"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in sceneType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item class="script-form-item label-text-left" label="目录" prop="scriptGroupId">
                <AiTreeInput
                  :level-start-num="0"
                  :field="{'id':'id','name':'groupName','parent':'parentId'}"
                  :remote="api.automationOperations.findHyitOpsScriptGroup"
                  :infoapi="api.automationOperations.getHyitOpsScriptGroup"
                  placeholder="请输入目录"
                  :param="{limit: -1}"
                  :bind-value="form.scriptGroupId"
                  :mounted-require="true"
                  @input="inputParent"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item class="script-form-item label-text-left" label="关键标签" prop="tagName">
                <div class="current-tag">
                  <el-tag
                    v-for="tag in dynamicTags"
                    :key="tag"
                    closable
                    :disable-transitions="false"
                    @close="handleClose(tag)"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-input
                    v-if="inputVisible"
                    ref="saveTagInput"
                    v-model="inputValue"
                    class="input-new-tag"
                    size="small"
                    @keyup.enter.native="handleInputConfirm"
                    @blur="handleInputConfirm"
                  />
                  <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加标签</el-button>
                </div>
                <div class="tag-list">
                  <div class="tag-list-label">标签：</div>
                  <div class="tag-list-body">
                    <div v-for="item in tagLink" :key="item.id" class="tag-list-item pointer" @click="handlerTag(item.tagName)">{{ item.tagName }}</div>
                  </div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item class="script-form-item label-text-left" label="备注说明" prop="backup">
                <el-input v-model="form.backup" type="textarea" placeholder="请输入备注说明" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <el-form-item label="选择脚本" class="label-text-left task-template-select-script">
                <div class="filter-container">
                  <el-select v-model="scriptListQuery.applyDeviceType" class="filter-item" placeholder="适用设备类型" clearable>
                    <el-option
                      v-for="item in deviceTypes"
                      :key="item.id"
                      :label="item.dictdataName"
                      :value="item.id"
                    />
                  </el-select>
                  <el-select v-model="scriptListQuery.deviceTypeCatId" class="filter-item" placeholder="适用品牌" clearable>
                    <el-option
                      v-for="item in applyDeviceTypes"
                      :key="item.id"
                      :label="item.dictdataName"
                      :value="item.id"
                    />
                  </el-select>
                  <el-input v-model="scriptListQuery.scriptName" placeholder="搜索关键词" class="filter-item" style="width: 200px" />
                  <el-button class="filter-item" type="primary" @click="search">查询</el-button>
                </div>
                <el-transfer v-model="currentScriptDataScriptIds" :data="scriptList" :titles="['脚本库','已选择脚本']">
                  <span slot-scope="{ option }">{{ option.label }}</span>
                  <div slot="left-footer" class="transfer-footer-main">
                    <el-button class="transfer-footer" size="small" @click="loadMoreScript">加载更多</el-button>
                  </div>
                </el-transfer>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="submitLoading" @click="onSubmit">保存</el-button>
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
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'

export default {
  name: 'TaskTemplateForm',
  components: {
    AiTreeInput
  },
  data() {
    return {
      loading: false,
      form: {
        tamplateName: '',
        sceneType: '',
        backup: '',
        tamplateTypeId: '',
        scriptGroupId: 0
      },
      rules: {
        tamplateName: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        sceneType: [
          { required: true, message: '请选择适用场景', trigger: 'blur' }
        ]
      },
      sceneType: this.$defineData.getOpsSceneType(),
      scriptList: [],
      scriptListQuery: {
        page: 1,
        limit: 10,
        verifyStatue: 1,
        scriptStatue: 1,
        applyDeviceType: '',
        deviceTypeCatId: '',
        scriptName: ''
      },
      currentScriptDataScriptIds: [],
      currentScriptData: [],
      currentScriptDataQuery: {
        tamplateId: '',
        page: 1,
        limit: 10
      },
      submitLoading: false,
      tagLink: [],
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      notInIds: [],
      deviceTypes: [],
      applyDeviceTypes: []
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
  async mounted() {
    this.findHyitOpsTag()
    if (this.id) {
      const getTamplate = await this.getHyitOpsTamplate({ id: this.id })
      if (getTamplate) {
        Object.keys(this.form).forEach(key => {
          this.$set(this.form, [`${key}`], getTamplate[`${key}`])
        })
        if (getTamplate.tagName.length > 0) this.dynamicTags = getTamplate.tagName.split(',')

        this.currentScriptData = await this.findHyitOpsTamplateScript({ limit: -1, tamplateId: this.id })

        // 查询未选择脚本
        const notInIds = []
        this.currentScriptData.forEach(item => {
          this.$set(this.currentScriptDataScriptIds, this.currentScriptDataScriptIds.length, item.scriptId)
          notInIds.push(item.scriptId)
        })
        this.notInIds = notInIds
        this.findHyitOpsScript({ ...this.scriptListQuery, notInIds: this.notInIds.toString() })

        // 查询已选择
        if (this.notInIds.length > 0) this.findHyitOpsScript({ ids: this.notInIds.toString(), limit: -1 })
      }
    } else {
      this.findHyitOpsScript({ ...this.scriptListQuery })
    }
    this.loadDeviceTypes()
    this.loadApplyDeviceTypes()
  },
  methods: {
    // 提交
    onSubmit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          // 模板参数
          const params = this.$tool.deepCopy(this.form)
          params.tagName = this.dynamicTags.toString()
          if (this.id) params.id = this.id
          this.$request({
            url: this.id ? this.api.automationOperations.updateHyitOpsTamplate : this.api.automationOperations.insertHyitOpsTamplate,
            data: params
          }).then(res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.saveTemplateScriptData(res.model.id)
              this.$router.back()
            } else {
              this.$message({
                type: 'error',
                message: res.msg
              })
            }
          })
        }
      })
    },
    // 重置
    onReset() {},
    // 查询脚本
    findHyitOpsScript(query) {
      this.$request({
        url: this.api.automationOperations.findHyitOpsScript,
        data: query
      }).then(res => {
        if (res.code === 1) {
          const data = []
          res.data.forEach(item => {
            data.push({ key: item.id, label: item.scriptName })
          })
          this.scriptList = [...this.scriptList, ...data]
        }
      })
    },
    // 查询三个热门标签
    findHyitOpsTag() {
      this.$request({
        url: this.api.automationOperations.findHyitOpsTag,
        data: { limit: 3 }
      }).then(res => {
        if (res.code === 1) {
          this.tagLink = res.data
        }
      })
    },
    // 查询模板
    async getHyitOpsTamplate(query) {
      const { code, model } = await this.$request({
        url: this.api.automationOperations.getHyitOpsTamplate,
        data: query
      })
      if (code !== 1) return
      return model
    },
    // 删除标签
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    // 显示标签输入框
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 确定标签
    handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    // 监听选择目录
    inputParent(val) {
      this.$set(this.form, 'scriptGroupId', Number(val))
    },
    // 保存模板脚本
    saveTemplateScriptData(tamplateId) {
      // 模板关联脚本
      const addTemplateScript = []
      const delTemplateScript = []
      if (this.currentScriptData.length === 0) { // 没有绑定模板脚本
        this.currentScriptDataScriptIds.forEach(item => {
          addTemplateScript.push({
            tamplateId: this.id || tamplateId,
            scriptId: item
          })
        })
        if (addTemplateScript.length > 0) this.insertHyitOpsTamplateScripts({ json: JSON.stringify(addTemplateScript) })
      } else { // 绑定了模版脚本
        // 如果当前选择的脚本id不存在于数据库中的模板脚本id 则新增
        this.currentScriptDataScriptIds.forEach(item => {
          const idx = this.currentScriptData.findIndex(items => Number(items.scriptId) === Number(item))
          if (idx === -1) {
            addTemplateScript.push({
              tamplateId: this.id || tamplateId,
              scriptId: item
            })
          }
        })
        if (addTemplateScript.length > 0) this.insertHyitOpsTamplateScripts({ json: JSON.stringify(addTemplateScript) })
        // 如果数据库中的模板脚本id不存在于当前选择的脚本id 则删除
        this.currentScriptData.forEach(item => {
          const idx = this.currentScriptDataScriptIds.findIndex(items => Number(item.scriptId) === Number(items))
          if (idx === -1) {
            delTemplateScript.push(item.scriptId)
          }
        })
        if (delTemplateScript.length > 0) this.deleteHyitOpsTamplateScriptByTamplateId({ tamplateId: this.id, scriptIds: delTemplateScript.toString() })
      }
    },
    // 批量添加模板脚本
    insertHyitOpsTamplateScripts(query) {
      this.$request({
        url: this.api.automationOperations.insertHyitOpsTamplateScripts,
        data: query
      })
    },
    // 批量删除模板脚本
    deleteHyitOpsTamplateScriptByTamplateId(query) {
      this.$request({
        url: this.api.automationOperations.deleteHyitOpsTamplateScriptByTamplateId,
        data: query
      })
    },
    // 查询模板脚本
    async findHyitOpsTamplateScript(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsTamplateScript,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 加载更多脚本
    loadMoreScript() {
      this.$set(this.scriptListQuery, 'page', ++this.scriptListQuery.page)
      this.findHyitOpsScript({ ...this.scriptListQuery, notInIds: this.notInIds.toString() })
    },
    // 点击标签
    handlerTag(tagName) {
      const idx = this.dynamicTags.findIndex(item => item === tagName)
      if (idx !== -1) {
        this.$message('已关联该标签')
      } else {
        this.$set(this.dynamicTags, this.dynamicTags.length, tagName)
      }
    },
    async search() {
      this.$set(this.scriptListQuery, 'page', 1)
      this.scriptList = []
      this.findHyitOpsScript({ ...this.scriptListQuery })
    },
    loadDeviceTypes() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type', limit: -1}
      }).then(res => {
        if (res.code === 1) {
          this.deviceTypes = res.data
        }
      })
    },
    loadApplyDeviceTypes() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1}
      }).then(res => {
        if (res.code === 1) {
          this.applyDeviceTypes = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.script-form-item {
  display: inline-block !important;
  width: 50%;
}
.transfer-footer-main {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
}
.transfer-footer {
  padding: 6px 5px;
  margin: 0 auto;
}

.current-tag {
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  padding: 10px;
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
.tag-list {
  margin-top: 12px;
  .tag-list-label {
    font-size: 13px;
    width: 10%;
    display: inline-block;
    vertical-align: top;
  }
  .tag-list-body {
    width: 90%;
    display: inline-block;
    .el-form-item__content {
      line-height: normal !important;
    }
    .tag-list-item {
      background: #f2f2f2;
      color: #666666;
      border-radius: 15px;
      padding: 5px 10px;
      display: inline-block;
      font-size: 13px;
      line-height: normal !important;
      margin-right: 10px;
    }
  }
}
</style>
