<template>
  <div class="wapper">
    <div class="application">
      <sLoading :loading="loading" :num="5" />
      <div v-for="(item,index) in applicationData" :key="index" class="item" :class="item.activi === true ? 'activi' : ''" @click="onLoadUserData(item)">{{ item.applicationName }}</div>
    </div>
    <div class="main">
      <div class="header">
        <div>
          <el-select v-model="appId">
            <el-option v-for="(item,index) in appData" :key="index" :label="item.appName" :value="item.appId" />
          </el-select>
        </div>
        <div>
          <el-select v-model="companyId">
            <el-option v-for="(item,index) in companyData" :key="index" :label="item.companyName" :value="item.companyId" />
          </el-select>
        </div>
        <div class="search"><el-input v-model="keyword" type="text" placeholder="搜索" /></div>
        <div><el-button type="button" @click="loadData">搜索</el-button></div>
      </div>

      <div class="mbody">
        <div class="items short ">
          <div class="item"><div class="lbl">模板编码</div><div class="val"><el-input v-model="model.templateName" type="text" placeholder="模板名称" /></div></div>
          <div class="item"><div class="lbl">模板编码</div><div class="val"><el-input v-model="model.templateCode" type="text" placeholder="模板编码" /></div></div>
          <div class="divide"><div class="title">模板内容</div></div>
          <div class="template">
            <div><el-input v-model="model.content" type="textarea" /></div>
          </div>
          <div><el-button type="button" @click="onSaveMessageTemplate">新增保存</el-button></div>
        </div>
        <div v-for="(item,index) in data" :key="index" class="items short ">

          <div v-if="item.editor === false" class="name">{{ item.templateName || '' }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(item)" /></div>
          <div v-if="item.editor === true" class="name"><input v-model="item.templateName" type="text"><i class="el-icon-check" @click="onEditorTemplateSave(item)" /></div>

          <div class="item"><div class="lbl">模板编码</div>
            <div v-if="item.editor === false" class="txt">{{ item.templateCode || '' }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(item)" /></div>
            <div v-if="item.editor === true" class="txt"><input v-model="item.templateCode" type="text"><i class="el-icon-check" @click="onEditorTemplateSave(item)" /></div>
          </div>
          <div class="divide"><div class="title">模板内容</div></div>
          <div class="template">
            <div v-if="item.editor === false" class="txt">{{ item.content || '' }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(item)" /></div>
            <div v-if="item.editor === true" class="txt"><input v-model="item.content" type="text"><i class="el-icon-check" @click="onEditorTemplateSave(item)" /></div>
          </div>

          <div class="ops">
            <div v-if="item.status === 'enable'" @click="onPublishTemplate(item,'disable')"><i class="el-icon-remove-outline" />停用</div>
            <div v-if="item.status !== 'enable'" @click="onPublishTemplate(item,'enable')"><i class="el-icon-circle-check" />发布</div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'MessageTemplate',
  data() {
    return {
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 40, 50], data: [], loading: false, total: 0, classify: 'qywx.parent', appData: [], companyData: [],
      applicationData: [], applicationId: 0, appId: null, companyId: null, model: {}
    }
  },
  mounted() {
    this.loadApp()
    this.loadCompany()
    this.loadData()
    this.loadApplication()
  },
  methods: {
    loadApp() {
      request({
        url: '/admin/findSaasSysApp', data: { limit: -1 }
      }).then(res => {
        this.appData = res.data
        if (res.data && res.data.length > 0) this.appId = res.data[0].appId
      })
    },
    loadCompany() {
      request({
        url: '/admin/findSaasCompany', data: { limit: -1 }
      }).then(res => {
        this.companyData = res.data
        if (res.data && res.data.length > 0) this.companyId = res.data[0].companyId
      })
    },
    loadApplication () {
      this.loading = true
      request({
        url: '/admin/findSysMobileApplication', data: { classify: this.classify, limit: -1, status: 'enable' }
      }).then(res => {
        if (res && res.data) {
          res.data.forEach(item => {
            item.activi = false
            this.applicationData.push(item)
          })
          if (this.applicationData.length > 0) {
            this.applicationId = this.applicationData[0].applicationId
            this.applicationData[0].activi = true
            this.loadData()
          }

          this.loading = false
        }
      })
    },
    loadData() {
      if (this.loading) return
      this.loading = true
      this.data = []
      request({
        url: '/admin/findMessageTemplate', data: { page: this.page, limit: this.limit, keyword: this.keyword, classify: this.classify, blobs: true, appId: this.appId, companyId: this.companyId, applicationId: this.applicationId}
      }).then(res => {
        res.data.forEach(item => {
          item.applicationName = null
          item.variables = []
          item.editor = false
          this.data.push(item)
        })
      }).finally(() => {
        this.loading = false
      })
    },
    onLoadUserData (item) {
      this.applicationData.forEach(v => { v.activi = false })
      item.activi = true
      this.applicationId = item.applicationId
      this.page = 1
      this.loadData()
    },
    onSaveMessageTemplate() {
      request({
        url: '/admin/insertMessageTemplate', data: { appId: this.appId, companyId: this.companyId, templateName: this.model.templateName, templateCode: this.model.templateCode, content: this.model.content, applicationId: this.applicationId, classify: this.classify}
      }).then(res => {
        if (res.code === 1) this.data.push(res.model)
      })
    },
    onEditor(item) {
      item.editor = true
    },
    onEditorTemplateSave(item) {
      item.tId = item.tid
      request({
        url: '/admin/updateMessageTemplate', data: item
      }).then(res => {
        if (res.code === 1) item.editor = false
      }).finally(() => {
        this.loading = false
      })
    },
    onPublishTemplate(item, status) {
      item.tId = item.tid
      item.status = status
      request({
        url: '/admin/updateMessageTemplate', data: item
      }).then(res => {
        if (res.code === 1) item.editor = false
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/views/saas/style/css.scss";

</style>
