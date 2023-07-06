<template>
  <div class="app-container actionTemplate">
    <!-- <el-card shadow="never" style="height:88vh" class="card"> -->
    <template>
      <el-page-header :title="title" @back="$router.back()" />
    </template>

    <div class="main">
      <div class="leftTemplate">
        <div class="leftTitle">
          <el-select v-model="selappId" placeholder="请选择模板" @change="currentappId(selappId)">
            <el-option
              v-for="item in applicationList"
              :key="item.applicationId"
              :label="item.applicationName"
              :value="item.applicationId"
            />
          </el-select></div>
        <div v-for="item of messageList" :key="item.template_id" class="leftContent" :class="[isActive===item.template_id ? 'activeClass' : '']" @click="getMessageItem(item)">
          {{ item.title }}
        </div>

      </div>
      <div class="mainTemplate">
        <!-- <div class="title">  消息模板标题</div> -->
        <el-form :model="form" label-width="120px">
          <el-form-item label="模板名称" prop="">
            <div><el-input v-model="form.templateName" placeholder="请输入发送邮箱账号" />
            </div>
          </el-form-item>
          <el-form-item label="类型" prop="">
            <el-select v-model="form.classify" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="代码" prop="">
            <el-input v-model="form.templateCode" placeholder="请输入发送邮箱账号" />
          </el-form-item>
          <el-form-item label="模板id" prop="">
            <el-input v-model="form.templateId" placeholder="请输入发送邮箱账号" />
          </el-form-item>
          <el-form-item label="外连接" prop="">
            <el-input v-model="form.templateUrl" placeholder="请输入发送邮箱账号" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <!-- <el-input v-model="form.status" placeholder="请输入授权码" /> -->
            <el-switch
              v-model="form.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="enable"
              inactive-value="disable"
            />
          </el-form-item>

          <el-form-item label="描述" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="5"
              placeholder="请输入发送邮箱账号"
            />
          </el-form-item>

          <el-divider content-position="center">模板</el-divider>

        </el-form>

        <div v-for="(item,index) in contentObj" :key="index">
          <el-form :model="item" label-width="120px">
            <el-form-item :label="item.variablesName">
              <span @dragover.prevent="allowMove($event,index)" @drop="allowDrag(index)">
                <el-input v-model="item.templateContent" placeholder="请输入" /></span>
            </el-form-item>

          </el-form>

        </div>
        <div class="exitBtn">
          <el-button type="primary" @click="judge()">提交</el-button>

        </div>

      </div>
      <div class="rightTemplate">
        <div v-for="item in variableTag" :key="item.id">
          <ul><li><div @dragstart="drag($event,item)"><el-tag type="success" style="display=inline;!important " draggable="true">{{ item.variableName }}</el-tag></div>
          </li></ul>

        </div>
      </div>

    </div>
    <!-- </el-card> -->
    <!-- 拖动选择 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      :modal="!dialogVisible"
      top="30vh"
    >

      <div v-for="(item,index) in templateSelect" :key="index" style="display:inline;margin-left:10px!important">
        <el-tag @click="selectItem(item)">{{ item }}</el-tag>
      </div>

    </el-dialog>

  </div>
</template>
<script>
import api from '@/api/api'
import request from '@/utils/request'
export default {
  name: 'AddMessageTemplate',
  data() {
    return {
      form: {
        templateId: '',
        templateCode: '',
        templateName: '',
        templateUrl: '',
        content: '',
        classify: '',
        status: ''
      },
      rules: [],

      variableTag: [],
      options: [
        { value: 'weixin', label: '微信公众号' },
        { value: 'qywx', label: '企业微信(内部)' },
        { value: 'email', label: '邮箱' }

      ],
      dragging: null,
      messageQuery: {
        limit: 10,
        page: 1,
        keyWorld: ''
      },
      messageList: [],
      contentDataList: [],
      contentName: [],
      contentMain: [],
      contentObj: [

      ],
      isActive: '',
      testContent: [],
      dialogVisible: false,
      templateSelect: [],
      selectWorld: '',
      val: '',
      applicationList: [],
      selappId: 4
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    tid() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.findApplication()
    this.findMessage()
    this.currentappId()

    if (this.tid) {
      this.getMessageTemplate()
      // 左侧信息渲染
      this.currentappId()
    }
  },
  methods: {
    selectItem(item) {
      console.log(item, '121213')
      this.selectWorld = item
      this.dialogVisible = false
      const sel = this.testContent[this.val].replace(item, this.dragging.variableCode)
      this.$set(this.contentObj[this.val], 'templateContent', sel)
    },
    drag(e, item) {
      this.dragging = item
      console.log(this.dragging)
    },
    allowMove(e) {
      // e.dataTransfer.dropEffect = 'move'
      // this.$set(this.form, 'templateName', this.dragging.name)
    },
    async allowDrag(index) {
      this.contentObj.forEach(item => {
        this.testContent.push(item.templateContent)
      })
      // 拿到指定行数
      const getTemplate = this.testContent[index].match(/{{\w+}}/g)
      if (getTemplate.length > 1) {
        this.val = index
        this.templateSelect = getTemplate
        console.log('你拿到的数值大于1，请选择需要更改的名称')
        this.dialogVisible = true
      } else {
        const aa = this.testContent[index].replace(getTemplate[0], this.dragging.variableCode)
        this.$set(this.contentObj[index], 'templateContent', aa)
      }
    },
    // 左侧查询变量
    async findApplication() {
      // let appId = ''
      const classifyRes = await request({
        url: api.linkageManage.findSysMobileApplication, data: { classify: 'weixin' }
      })
      if (classifyRes.code === 1) {
        console.log(classifyRes.data, 'classifyRes')
        classifyRes.data.forEach(item => {
          this.applicationList.push(item)
        })
      }
    },
    // 根据所选值，渲染数组
    async currentappId(val) {
      this.messageList = []
      console.log(val, '当第一次运行时')
      // 查询当前applicationId
      if (!val) {
        val = 4
      }
      const ApplicationRes = await request({
        url: api.template.findWeiXinTemplate, data: { applicationId: val }
      })
      if (ApplicationRes.code === 1) {
        this.messageList = ApplicationRes.model.template_list
      } else {
        this.$message.error(ApplicationRes.msg)
      }
    },
    // 选中消息模板
    getMessageItem(val) {
      console.log(val)
      this.isActive = val.template_id
      this.form.templateId = val.template_id
      this.contentObj = []
      let contentALL = []
      contentALL = (val.content).split('\n')
      console.log(contentALL, 'contentALL')
      let contentZh = []
      let contentMain = []
      contentALL.forEach(item => {
        if (item.indexOf('：') !== -1) {
          contentZh = item.split('：')
          contentMain = contentZh[1]
          contentMain = contentMain.replace(/{{/g, '')
          contentMain = contentMain.replace(/}}/g, '')
          contentMain = contentMain.split('.')
          contentMain = contentMain[0]
          this.$set(this.contentObj, this.contentObj.length, {
            tId: '',
            variablesCode: contentMain,
            variablesName: contentZh[0],
            templateContent: ''
          })
        }
      })
      this.$set(this.contentObj, this.contentObj.length, {
        tId: '',
        variablesCode: 'first',
        variablesName: '顶位内容',
        templateContent: ''

      })
      this.$set(this.contentObj, this.contentObj.length, {
        tId: '',
        variablesCode: 'remark',
        variablesName: '备注信息',
        templateContent: ''

      })
    },
    judge() {
      if (this.tid) {
        this.edit()
      } else {
        this.sumbit
      }
    },
    async sumbit() {
      let id = ''
      // 提交大表,返回tid
      await request({
        url: api.template.insertMessageTemplate, data: { ...this.form }
      }).then(temRes => {
        if (temRes.code === 1) {
        // 拿到tid
          id = temRes.model.tid
          this.contentObj.forEach(item => {
            item.tId = id
          })
        }
      })
      const messageRes = await request({
        url: api.message.saveMessageTemplateVariables, data: { json: JSON.stringify(this.contentObj), tId: id }
      })
      if (messageRes.code === 1) {
        this.$message.success(messageRes.msg)
        this.$router.back(-1)
      } else {
        this.$message.error(messageRes.msg)
      }
    },
    async edit() {
      await request({
        url: api.message.updateMessageTemplate, data: { ...this.form, tId: this.tid }
      }).then(temRes => {
        if (temRes.code !== 1) {
          this.$message.error(temRes.msg)
        }
      })
      // 更新item
      this.contentObj.forEach(item => {
        if (item.tId === '') {
          item.tId = this.tid
        } else {
          return
        }
      })
      await request({
        url: api.message.saveMessageTemplateVariables, data: { json: JSON.stringify(this.contentObj), tId: this.tid }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$router.back(-1)
        }
      })
    },
    // 右侧数据
    async findMessage() {
      const messageRes = await request({
        url: api.message.findMessageVariable, data: { ...this.messageQuery }
      })
      if (messageRes.code === 1) {
        this.variableTag = messageRes.data
        console.log(messageRes.data, 'data')
      }
    },

    // 查找信息模板
    async getMessageTemplate() {
      const res = await request({
        url: api.message.getMessageTemplate, data: { tId: this.tid }
      })
      if (res.code === 1) {
        console.log(res.model)
        Object.keys(this.form).forEach(key => {
          this.$set(this.form, key, res.model[key])
        })
        this.isActive = this.form.templateId
      }
      // 查找item
      const resItem = await request({
        url: api.message.findMessageTemplateVariables, data: { tId: this.tid }
      })
      if (resItem.code === 1) {
        resItem.data.forEach(item => {
          this.$set(this.contentObj, this.contentObj.length, {
            tId: item.tid,
            variablesCode: item.variablesCode,
            variablesName: item.variablesName,
            templateContent: item.templateContent
          })
        })
      }
    }

  }
}
</script>
<style scoped lang="scss">
.actionTemplate{
  overflow:auto;
.title{
      margin: 60px ;
    text-align: center;
    font-weight: 900;
    font-size: 16px;
}
.main{
  margin-top: 20px;
display: flex;
background-color: white;
padding-top: 10px;
  .leftTemplate{
  flex: 1;
  background-color: #e5ecf6;

  }
  .mainTemplate{
   flex: 3;
    margin: 50px auto;
    padding: 0px 303px;
    position: relative;

  }
  .rightTemplate{
    flex: 1;
  background-color: #e5ecf6;

  }
  .leftTitle{
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 10px;

  }
  .activeClass{
    background-color: #cedbee !important;
  }
  .leftContent{
    height: 40px;
    font-size: 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
    line-height: 40px;
    cursor: pointer;

  }
  .exitBtn{
    margin-left: 40px;
    text-align: left;
  }

}

}
</style>
