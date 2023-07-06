<template>
  <div>
    <div class="search" />
    <h1>微信通知模板</h1>
    <div @click="onSynchronization">同步</div>
    <div v-loading="loading" class="main saas">
      <div v-for="(item,index) in data" :key="index" class="items saas">
        <div class="name">{{ item.templateName }}</div>
        <div class="item">
          <div class="lbl">模板编码</div>
          <div v-if="item.editor === false" class="val">{{ item.templateCode }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(item)" /></div>
          <div v-if="item.editor === true" class="val"><input v-model="item.templateCode" type="text"><i class="el-icon-check" @click="onEditorTemplateSave(item)" /></div>
        </div>
        <div class="item">
          <div class="lbl">微信公众号</div>
          <div class="val">{{ item.applicationName }}</div>
        </div>
        <div class="item">
          <div class="lbl">微信编码</div>
          <div class="val">{{ item.templateId }}</div>
        </div>

        <div class="divide">
          <div class="title">模板内容</div>
        </div>
        <div v-if="item.variables && item.variables.length > 0" class="template">
          <div v-for="(vari , index1) in item.variables" :key="index1">
            <div v-if="vari.variablesCode === 'first' && vari.editor === false" class="first" :style="(vari.themes && vari.themes !=='') ? ('color:'+vari.themes) : ''">{{ vari.templateContent || '' }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(vari)" /></div>
            <div v-if="vari.variablesCode === 'first' && vari.editor === true" class="first">
              <input v-model="vari.templateContent" type="text">
              <el-color-picker v-model="vari.themes" size="mini" />
              <i class="el-icon-check" @click="onEditorVariablesSave(vari)" />
            </div>
            <div v-if="vari.variablesCode !== 'first' && vari.variablesCode !== 'remark'" class="line">
              <div class="lbl">{{ vari.variablesName }}</div>
              <div v-if="vari.editor === false" class="txt" :style="(vari.themes && vari.themes !=='') ? ('color:'+vari.themes) : ''">{{ vari.templateContent || '' }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(vari)" /></div>
              <div v-if="vari.editor === true" class="txt">
                <input v-model="vari.templateContent" type="text">
                <el-color-picker v-model="vari.themes" size="mini" />
                <i class="el-icon-check" @click="onEditorVariablesSave(vari)" />
              </div>
            </div>
            <div v-if="vari.variablesCode === 'remark'" class="line">
              <div class="lbl">备注</div>
              <div v-if="vari.editor === false" class="txt" :style="(vari.themes && vari.themes !=='') ? ('color:'+vari.themes) : ''">{{ vari.templateContent || '' }}<i v-if="item.status !== 'enable'" class="el-icon-edit" @click="onEditor(vari)" /></div>
              <div v-if="vari.editor === true" class="txt">
                <input v-model="vari.templateContent" type="text">
                <el-color-picker v-model="vari.themes" size="mini" />
                <i class="el-icon-check" @click="onEditorVariablesSave(vari)" />
              </div>
            </div>

          </div>

        </div>
        <div class="ops">
          <!-- <div><i class="el-icon-document-copy" />复制</div> -->
          <div v-if="item.status === 'enable'" @click="onDisEnableTemplate(item)"><i class="el-icon-remove-outline" />停用</div>
          <div v-if="item.status !== 'enable'" @click="onPublishTemplate(item)"><i class="el-icon-circle-check" />发布</div>
          <!-- <div v-if="item.status !== 'enable'" @click="onDeleteTemplate(item,index)"><i class="el-icon-circle-close" />删除</div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'MessageTemplate',
  data () {
    return {
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 40, 50], data: [], loading: false, total: 0
    }
  },
  mounted () {
    this.data = []
    this.loadData()
  },
  methods: {
    loadData () {
      if (this.loading) return
      this.loading = true
      this.data = []
      request({
        url: '/admin/findMessageTemplate', data: { page: this.page, limit: this.limit, keyword: this.keyword, classify: 'weixin' }
      }).then(res => {
        var applicationIds = []
        var tIds = []
        res.data.forEach(item => {
          item.applicationName = null
          item.variables = []
          item.editor = false
          if (item.applicationId && item.applicationId > 0) applicationIds.push(item.applicationId)
          tIds.push(item.tid)
          this.data.push(item)
        })
        this.loadApplicationData(applicationIds)
        this.loadMessageTemplateVariables(tIds)
      }).finally(() => {
        this.loading = false
      })
    },
    loadApplicationData (applicationIds) {
      if (!applicationIds || applicationIds.length === 0) return
      request({
        url: '/admin/findSysMobileApplication', data: { page: 1, limit: -1, classify: 'weixin', ids: applicationIds.join(',') }
      }).then(res => {
        this.data.forEach(item => {
          res.data.forEach(item1 => {
            if (item.applicationId === item1.applicationId) item.applicationName = item1.applicationName
          })
        })
      }).finally(() => {
        this.loading = false
      })
    },
    loadMessageTemplateVariables (tIds) {
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
        console.log('findMessageTemplateVariables', JSON.stringify(this.data))
      }).finally(() => {
        this.loading = false
      })
    },
    onSynchronization () {
      // 同步微信模板信息
      request({
        url: '/admin/findSysMobileApplication', data: { page: 1, limit: -1, classify: 'weixin' }
      }).then(async res => {
        console.log('res', JSON.stringify(res))
        res.data.forEach(async item => {
          await this.findWeiXinTemplateEvent(item.applicationId)// 开始加载模板数据
        })
        this.data = []
        this.loadData()
      }).finally(() => {
        this.loading = false
      })
    },
    findWeiXinTemplateEvent (applicationId) {
      request({
        url: '/admin/findWeiXinTemplate', data: { applicationId: applicationId }
      }).then(res => {
        // console.log('res', JSON.stringify(res))
        if (res.model) {
          var list = res.model.template_list
          list.forEach(async item => {
            var content = item.content
            if (content.indexOf('first') > 0 && content.indexOf('remark') > 0) {
              var _variables = content.split('\n')
              var variables = []
              _variables.forEach(item2 => {
                console.log('variables:', item2)
                var v = { tid: null }
                if (item2.indexOf('first') > 0) {
                  v.variablesCode = 'first'
                  v.variablesName = 'first'
                  variables.push(v)
                } else if (item2.indexOf('：') > 0) {
                  var v2 = item2.split('：')
                  v.variablesName = v2[0]
                  v.variablesCode = v2[1].replace('{{', '').replace('.DATA}}', '')
                  variables.push(v)
                } else if (item2.indexOf('remark') > 0) {
                  v.variablesCode = 'remark'
                  v.variablesName = 'remark'
                  variables.push(v)
                }
              })

              var mtData = { applicationId: applicationId, classify: 'weixin', templateId: item.template_id, templateName: item.title }
              // console.log('保存的数据', JSON.stringify(mtData), JSON.stringify(variables))
              var _data = await this.insertMessageTemplate(mtData)
              console.log('model', JSON.stringify(_data.model))
              if (_data.model && _data.code === 1) {
                variables.forEach(item => {
                  item.TId = _data.model.tid
                })
                this.saveMessageTemplateVariables(_data.model.tid, variables)
              }

              console.log('=======================================')
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    async insertMessageTemplate (data) {
      return await request({
        url: '/admin/insertMessageTemplate', data: data
      })
    },
    saveMessageTemplateVariables (tid, variables) {
      request({
        url: '/admin/saveMessageTemplateVariables', data: { tid: tid, json: JSON.stringify(variables) }
      }).then(res => {
        console.log('res', JSON.stringify(res))
        var model = res.model
        variables.forEach(item => {
          item.tid = model.tid
        })
      }).finally(() => {
        this.loading = false
      })
    },
    onEditor (item) {
      item.editor = true
    },
    onEditorTemplateSave (item) {
      item.tId = item.tid
      request({
        url: '/admin/updateMessageTemplate', data: item
      }).then(res => {
        if (res.code === 1) item.editor = false
      }).finally(() => {
        this.loading = false
      })
    },
    onEditorVariablesSave (item) {
      item.tId = item.tid
      request({
        url: '/admin/editorMessageTemplateVariables', data: item
      }).then(res => {
        if (res.code === 1) item.editor = false
      }).finally(() => {
        this.loading = false
      })
    },
    onPublishTemplate (item) { // 发布
      item.tId = item.tid
      item.status = 'enable'
      request({
        url: '/admin/updateMessageTemplate', data: item
      }).then(res => {
        if (res.code === 1) item.editor = false
      }).finally(() => {
        this.loading = false
      })
    },
    onDisEnableTemplate (item) { // 停用
      item.tId = item.tid
      item.status = 'disable'
      request({
        url: '/admin/updateMessageTemplate', data: item
      }).then(res => {
        if (res.code === 1) item.editor = false
      }).finally(() => {
        this.loading = false
      })
    },
    onDeleteTemplate (item, index) { // 删除
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((res) => {
        if (res === 'confirm') {
          item.tId = item.tid
          item.status = 'disenable'
          request({
            url: '/admin/deleteMessageTemplate', data: item
          }).then(res => {
            if (res.code === 1) {
              this.data.splice(index, 1)
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/views/saas/style/css.scss";
.ops {
  display: flex;
  flex-wrap: wrap;
  padding-top: 20px;
  > div {
    padding-right: 10px;
    cursor: pointer;
    &:hover {
      font-weight: bold;
      color: #555;
    }
  }
}
</style>
