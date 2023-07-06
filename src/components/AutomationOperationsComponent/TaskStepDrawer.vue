<template>
  <div>
    <el-drawer
      title="新增步骤"
      :visible.sync="showDrawer"
      direction="rtl"
      size="50%"
    >
      <div class="drawer-container">
        <div class="drawer-main">
          <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="步骤名称" class="script-form-item label-text-left" prop="name">
              <el-input v-model="form.name" placeholder="请输入步骤名称" />
            </el-form-item>
            <el-form-item label="作业模板" class="script-form-item label-text-left">
              <el-button-group>
                <el-button :type="form.stepType === 2 ? 'primary' : 'default'" size="mini" @click="handlerStepScriptType(2)">作业模板</el-button>
                <el-button :type="form.stepType === 1 ? 'primary' : 'default'" size="mini" @click="handlerStepScriptType(1)">脚本库</el-button>
              </el-button-group>
              <div class="task-template">
                <div class="template-header">
                  <template v-if="form.stepType === 1">
                    <el-select v-model="taskTemplateQuery.applyDeviceType" size="mini" class="filter-item" placeholder="适用设备类型" clearable>
                      <el-option
                        v-for="item in deviceTypes"
                        :key="item.id"
                        :label="item.dictdataName"
                        :value="item.id"
                      />
                    </el-select>
                    <el-select v-model="taskTemplateQuery.deviceTypeCatId" size="mini" class="filter-item" placeholder="适用品牌" clearable>
                      <el-option
                        v-for="item in applyDeviceTypes"
                        :key="item.id"
                        :label="item.dictdataName"
                        :value="item.id"
                      />
                    </el-select>
                    <el-input v-model="taskTemplateQuery.scriptName" size="mini" placeholder="搜索关键词" class="filter-item" style="width: 200px" />
                  </template>
                  <template v-else>
                    <el-input v-model="taskTemplateQuery.keyword" size="mini" placeholder="搜索关键词" class="filter-item" style="width: 200px" />
                  </template>
                  <el-button size="mini" class="filter-item" type="primary" @click="searchTaskTemplate">查询</el-button>
                </div>
                <div v-if="taskTemplateData.length > 0" class="template-body">
                  <div v-for="item in taskTemplateData" :key="item.id" class="template-body-item pointer">
                    <el-radio v-model="form.scriptId" :label="item.id" class="no-margin-right none-radio-label" />
                    <div class="body-item-main">
                      <div class="script-name">{{ form.stepType === 1 ? item.scriptName : item.tamplateName }}</div>
                      <div v-if="form.stepType === 1" class="script-desc">快速巡检</div>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无数据" />
              </div>
              <pagination v-show="taskTemplateDataTotal > 0" :auto-scroll="false" :total="taskTemplateDataTotal" :page.sync="taskTemplateQuery.page" :limit.sync="taskTemplateQuery.limit" @pagination="paginationList" />
            </el-form-item>
            <el-form-item label="执行设备" class="script-form-item label-text-left">
              <el-button type="primary" size="mini" @click="handlerSelectDevice">选择设备</el-button>
              <div class="task-template">
                <!--                <div class="template-header">-->
                <!--                  <el-input v-model="findStorageHostQuery.keyword" size="mini" placeholder="搜索关键词" class="filter-item" style="width: 200px" />-->
                <!--                  <el-button size="mini" class="filter-item" type="primary" @click="searchStorageHost">查询</el-button>-->
                <!--                </div>-->
                <div v-if="taskTemplateData.length > 0" class="template-body">
                  <div v-for="item in checkDeviceData" :key="item.id" class="template-body-item pointer">
                    <div class="body-item-main">
                      <div class="script-name">{{ item.hyMarkName }}</div>
                      <div class="script-desc">{{ item.hyIp }}</div>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无数据" />
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="drawer-footer">
          <el-button type="primary" @click="save">保存</el-button>
          <el-button type="default" @click="showDrawer = false">取消</el-button>
        </div>
      </div>
    </el-drawer>
    <ScriptSelectDeviceDialog ref="scriptSelectDeviceDialog" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ScriptSelectDeviceDialog from '@/components/AutomationOperationsComponent/ScriptSelectDeviceDialog'

export default {
  name: 'TaskStepDrawer',
  components: {
    ScriptSelectDeviceDialog,
    Pagination
  },
  data() {
    return {
      showDrawer: false,
      form: {
        taskId: '',
        scriptId: '',
        serverIds: '',
        name: '',
        stepType: 2
      },
      rules: {
        name: [
          { required: true, message: '请输入步骤名称' }
        ]
      },
      deviceList: [],
      checkDeviceData: [],
      value: 1,
      devTypeList: [],
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        agent: '',
        devType: '',
        keyword: '',
        hostType: 1
      },
      findTaskDeviceQuery: {
        devType: '',
        agent: ''
      },
      taskTemplateData: [],
      taskTemplateDataTotal: 0,
      findHyitOpsScriptQuery: {
        page: 1,
        limit: 10,
        verifyStatue: 1,
        scriptStatue: 1
      },
      taskTemplateQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      reloadKey: 'reloadKey',
      dictionary: {
        leftPanelDevTypeId: '',
        notInIds: []
      },
      allCheckDeviceData: [],
      findStorageHostQuery: {
        keyword: ''
      },
      deviceTypes: [],
      applyDeviceTypes: []
    }
  },
  mounted() {
    this.loadItType()
    this.$EventBus.$on('change-find-it-host-query', (res) => {
      this.$set(this.findHyitHostQuery, 'agent', res.agent)
      if (res.notInIds) {
        this.$set(this.findHyitHostQuery, 'notInIds', res.notInIds.toString())
        this.$set(this.dictionary, 'notInIds', res.notInIds)
      }
      this.loadDeviceList()
    })
    this.$EventBus.$on('change-notInIds', (res) => {
      this.$set(this.findHyitHostQuery, 'notInIds', res.notInIds.toString())
    })
    this.$EventBus.$on('get-check-device', (res) => {
      this.checkDeviceData = res.data
      console.log(res.data)
    })
    this.$EventBus.$on('left-panel-body-bottom', () => {
      this.$set(this.findHyitHostQuery, 'page', ++this.findHyitHostQuery.page)
      this.loadDeviceList()
    })
    this.$EventBus.$on('complete-selection-device', (res) => {
      this.checkDeviceData = this.$tool.deepCopy(res.device)
    })
  },
  methods: {
    // 打开
    open(data) {
      this.deviceList = []
      this.taskTemplateData = []
      this.$set(this.form, 'scriptId', '')
      if (data) {
        this.form = { ...data, type: 'edit' }
      } else {
        this.form = {
          scriptId: '',
          serverIds: '',
          name: '',
          stepType: 2,
          type: 'add',
          id: this.$tool.guid()
        }
        this.reloadKey = this.$tool.guid()
      }
      this.showDrawer = true
      if (this.form.stepType	=== 1) {
        this.findHyitOpsScript()
      } else {
        this.findHyitOpsTamplate()
      }
      this.loadDeviceTypes()
      this.loadApplyDeviceTypes()
    },
    // 保存
    save() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const serverIds = []
          this.checkDeviceData.forEach(item => {
            serverIds.push(item.opsServerId)
          })
          this.$set(this.form, 'serverIds', serverIds.toString())
          this.$EventBus.$emit('submit-task-step', this.$tool.deepCopy(this.form))
          this.showDrawer = false
        }
      })
    },
    // 获取设备类型
    loadItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
          this.$set(this.findHyitHostQuery, 'devType', res.data[0].id)
          this.$set(this.findTaskDeviceQuery, 'devType', res.data[0].id)
          this.$set(this.dictionary, 'leftPanelDevTypeId', res.data[0].id)
        }
      })
    },
    // 选择设备类型
    changeDevType() {
      this.deviceList = []
      this.$set(this.findHyitHostQuery, 'page', 1)
      this.loadDeviceList()
      this.$set(this.dictionary, 'leftPanelDevTypeId', this.findHyitHostQuery.devType)
    },
    // 获取设备
    async loadDeviceList() {
      // 获取it监控设备
      const itHost = await this.$request({ url: this.api.itMonitor.findHyitHost, data: this.findHyitHostQuery })
      if (itHost.code !== 1 && !itHost.data) return
      this.total = Number(itHost.count)
      const hostIds = []
      itHost.data.forEach(item => hostIds.push(item.hyHostId))
      if (hostIds.length === 0) return
      // 根据it监控去获取运维设备
      const opsServer = await this.$request({ url: this.api.automationOperations.findHyitOpsServer, data: { hostIds: hostIds.toString() }})
      itHost.data.forEach(item => {
        const getOpsServerIdx = opsServer.data.findIndex(getOpsServerItem => Number(getOpsServerItem.hostId) === Number(item.hyHostId))
        if (getOpsServerIdx !== -1) {
          item.opsServerId = opsServer.data[getOpsServerIdx].id
          item.userName = opsServer.data[getOpsServerIdx].userName
          item.pwd = opsServer.data[getOpsServerIdx].pwd
          item.location = opsServer.data[getOpsServerIdx].location
          item.serverAlias = opsServer.data[getOpsServerIdx].serverAlias
          item.remarks = opsServer.data[getOpsServerIdx].remarks
          item.disabled = false
        } else {
          item.disabled = true
        }
      })
      this.deviceList = [...this.deviceList, ...itHost.data]
    },
    // 获取模板
    findHyitOpsTamplate() {
      this.$request({
        url: this.api.automationOperations.findHyitOpsTamplate,
        data: { ...this.taskTemplateQuery }
      }).then(async res => {
        if (res.code === 1) {
          this.taskTemplateDataTotal = Number(res.count)
          this.taskTemplateData = res.data
        }
      })
    },
    // 获取脚本
    findHyitOpsScript() {
      this.$request({
        url: this.api.automationOperations.findHyitOpsScript,
        data: { ...this.findHyitOpsScriptQuery, ...this.taskTemplateQuery }
      }).then(async res => {
        if (res.code === 1) {
          this.taskTemplateDataTotal = Number(res.count)
          this.taskTemplateData = res.data
        }
      })
    },
    // 作业模板 搜索
    searchTaskTemplate() {
      if (this.form.stepType	=== 1) {
        this.findHyitOpsScript()
      } else {
        this.findHyitOpsTamplate()
      }
    },
    // 选择脚本类型
    handlerStepScriptType(type) {
      this.$set(this.form, 'stepType', Number(type))
      this.taskTemplateData = []
      this.$set(this.taskTemplateQuery, 'page', 1)
      if (this.form.stepType	=== 1) {
        this.findHyitOpsScript()
      } else {
        this.findHyitOpsTamplate()
      }
    },
    // 点击打开选择设备弹窗
    handlerSelectDevice() {
      this.$refs.scriptSelectDeviceDialog.open({ allSelection: this.checkDeviceData})
    },
    paginationList() {
      this.form.stepType === 1 ? this.findHyitOpsScript() : this.findHyitOpsTamplate()
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
.task-template {
  border: 1px solid #dddddd;
  margin-top: 22px;
  .template-header {
    background: #f5f7fa;
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    .filter-item {
      margin-right: 10px;
    }
  }
  .template-body {
    .template-body-item {
      display: flex;
      align-items: center;
      padding: 0 15px;
      .body-item-main {
        padding-left: 10px;
        display: flex;
        align-items: center;
        width: 100%;
        .script-name {
          width: 85%;
          color: #000;
        }
        .script-desc {
          width: 15%;
          color: #aaaaaa;
        }
      }
    }
  }
}
</style>
