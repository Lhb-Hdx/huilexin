<template>
  <div>
    <div class="search" />
    <h1>微信小程序通知模板</h1>
    <div>同步</div>
    <div class="main saas">
      <div v-for="(item,index) in data" :key="index" class="items saas">
        <div class="name">{{ item.templateName }}</div>
        <div class="item"><div class="lbl">模板编码</div><div class="val">{{ item.templateCode }}</div></div>
        <div class="item"><div class="lbl">微信公众号</div><div class="val">{{ item.applicationName }}</div></div>
        <div class="item"><div class="lbl">微信编码</div><div class="val">{{ item.templateId }}</div></div>

        <div class="divide"><div class="title">模板内容</div></div>
        <div class="template">
          <div v-for="(vari , index2) in item.variables" :key="index2" class="first"><block v-if="vari.variablesCode === 'first'">{{ vari.templateContent }}</block></div>
          <div v-for="(vari , index3) in item.variables" :key="index3" class="remark">
            <block v-if="vari.variablesCode !== 'first' && vari.variablesCode !== 'remark'">
              <div class="line"><div class="lbl">{{ vari.variablesName }}</div><div class="txt">{{ vari.templateContent }}</div></div>
            </block>
          </div>
          <div v-for="(vari , index4) in item.variables" :key="index4" class="remark">
            <block v-if="vari.variablesCode === 'remark'">
              <div class="line"><div class="lbl">备注</div><div class="txt">{{ vari.templateContent }}</div></div>
            </block>
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
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 40, 50], data: [], loading: false, total: 0
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      if (this.loading) return
      this.loading = true
      this.data = []
      request({
        url: '/admin/findMessageTemplate', data: { page: this.page, limit: this.limit, keyword: this.keyword, classify: 'wxapp' }
      }).then(res => {
        var applicationIds = []
        var tIds = []
        res.data.forEach(item => {
          item.applicationName = null
          item.variables = []
          if (item.applicationId && item.applicationId > 0)applicationIds.push(item.applicationId)
          tIds.push(item.tid)
          this.data.push(item)
        })
        this.loadApplicationData(applicationIds)
        this.loadMessageTemplateVariables(tIds)
      }).finally(() => {
        this.loading = false
      })
    },
    loadApplicationData(applicationIds) {
      if (!applicationIds || applicationIds.length === 0) return
      console.log('applicationIds', applicationIds, applicationIds.join(','), applicationIds.length)
      request({
        url: '/admin/findSysMobileApplication', data: { page: 1, limit: -1, classify: 'wxapp', ids: applicationIds.join(',') }
      }).then(res => {
        this.data.forEach(item => {
          res.data.forEach(item1 => {
            if (item.applicationId === item1.applicationId)item.applicationName = item1.applicationName
          })
        })
      }).finally(() => {
        this.loading = false
      })
    },
    loadMessageTemplateVariables(tIds) {
      if (!tIds || tIds.length === 0) return
      request({
        url: '/admin/findMessageTemplateVariables', data: { page: 1, limit: -1, tIds: tIds.join(',') }
      }).then(res => {
        this.data.forEach(item => {
          res.data.forEach(item1 => {
            if (item.tid === item1.tid) {
              item1.editor = false
              item.variables.push(item1)
            }
          })
        })
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/saas/style/css.scss';
</style>
