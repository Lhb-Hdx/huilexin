<template>
  <div>
    <div class="page-nav">
      <el-page-header :content="navTitle" @back="goBack" />
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <div class="title">基础信息</div>
        <el-row :gutter="20">
          <el-form ref="form" :model="form" :rules="rules">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-col :span="12" :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="监控网关" prop="agent" label-width="100px">
                  <el-select
                    v-model="form.agent"
                    v-loadmore="loadAgentMore"
                    placeholder="请选择监控网关"
                    style="width: 100%;"
                  >
                    <el-option
                      v-for="item in agentList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12" :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="对应配置类目" prop="cmdbItemTypeId" label-width="100px">
                  <el-select
                    v-model="form.cmdbItemTypeId"
                    placeholder="请选择配置类目"
                    style="width: 100%;"
                  >
                    <el-option
                      v-for="item in classifyTreeList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="选择模板" prop="templateid" label-width="100px">
                  <el-button type="primary" size="mini" @click="onSelectHostTemplate">{{ templateName }}</el-button>
                  <!--                  <el-select-->
                  <!--                    v-model="form.templateid"-->
                  <!--                    placeholder="请选择模板"-->
                  <!--                    style="width: 100%;"-->
                  <!--                    @change="changeTemplate"-->
                  <!--                  >-->
                  <!--                    <el-option-->
                  <!--                      v-for="item in templateList"-->
                  <!--                      :key="item.id"-->
                  <!--                      :label="item.name"-->
                  <!--                      :value="item.id"-->
                  <!--                    />-->
                  <!--                  </el-select>-->
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="主机名称" prop="host" label-width="100px">
                  <el-input v-model.trim="form.host" placeholder="请输入主机名称" />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="设备类型" prop="hyDevTypeId" label-width="100px">
                  <el-select
                    v-model="form.hyDevTypeId"
                    placeholder="请选择设备类型"
                    style="width: 100%;"
                  >
                    <el-option label="无" value="" />
                    <el-option
                      v-for="item in devTypeList"
                      :key="item.id"
                      :label="item.dictdataName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="厂家" prop="manufactor" label-width="100px">
                  <el-select
                    v-model="form.manufactorId"
                    placeholder="请选择厂家"
                    style="width: 100%;"
                  >
                    <el-option
                      v-for="item in manufactor"
                      :key="item.catId"
                      :label="item.catName"
                      :value="item.catId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="设备子类型" prop="subdevTypeId" label-width="100px">
                  <el-select
                    v-model="form.subdevTypeId"
                    placeholder="请选择设备类型"
                    style="width: 100%;"
                  >
                    <el-option label="无" value="" />
                    <el-option
                      v-for="item in subtypeList"
                      :key="item.id"
                      :label="item.dictdataName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="型号" prop="model" label-width="100px">
                  <el-input v-model.trim="form.model" placeholder="请输入主机型号" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="协议" prop="type" label-width="100px">
                  <el-select
                    v-model="form.type"
                    placeholder="请选择协议"
                    style="width: 100%;"
                    @change="changeDeal"
                  >
                    <el-option
                      v-for="item in typeList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-row v-if="form.type === 2" :gutter="12">
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="版本信息" prop="snmpVersion" label-width="100px">
                      <el-select
                        v-model="form.snmpVersion"
                        placeholder="请选择版本"
                        style="width: 100%;"
                      >
                        <el-option
                          v-for="item in SNMPVersion"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="团体字" prop="snmpCommunity" label-width="100px">
                      <el-input v-model.trim="form.snmpCommunity" placeholder="请输入团体字" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="IP" prop="ip" label-width="100px">
                  <el-input v-model.trim="form.ip" placeholder="请输入主机IP地址" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="端口" prop="port" label-width="100px">
                  <el-input v-model.trim="form.port" placeholder="请输入主机端口" />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="区域" prop="orgId" label-width="100px">
                  <el-cascader
                    v-model="form.orgId"
                    clearable
                    class="filter-item"
                    multiple="false"
                    :options="areaTreeArr"
                    :props="orgProps"
                  />

                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <!-- <el-form-item label="地址" prop="address" label-width="100px">
                  <el-input v-model.trim="form.address" placeholder="请输入主机地址" />
                </el-form-item> -->
                <el-form-item label="所在位置" prop="address" label-width="100px">
                  <el-input v-model.trim="form.address" placeholder="请输入主机所在位置" />
                </el-form-item>

              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="管理人" prop="relation" label-width="100px">
                  <!-- <el-input v-model.trim="form.relation" placeholder="请输入管理人" /> -->
                  <el-select
                    v-model="form.relation"
                    filterable
                    placeholder="请输入管理人"
                  >
                    <el-option
                      v-for="item in userList"
                      :key="Number(item.userId)"
                      :label="item.realName"
                      :value="Number(item.userId)"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-col>
          </el-form>
        </el-row>

        <div class="title">运维信息</div>
        <el-form ref="opsForm" :model="opsForm" :rules="rules">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备类型" prop="deviceTypeCatId" label-width="100px">
                <el-select
                  v-model="opsForm.deviceTypeCatId"
                  filterable
                  placeholder="设备类型"
                >
                  <el-option
                    v-for="item in keyTypeArr"
                    :key="item.id"
                    :label="item.dictdataName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="连接协议" prop="connetType" label-width="100px">
                <el-select v-model="opsForm.connetType" placeholder="请选择连接协议" filterable>
                  <el-option
                    v-for="item in agreementOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="连接端口" prop="port" label-width="100px">
                <el-input v-model.trim="opsForm.port" placeholder="连接端口" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="用户名" prop="userName" label-width="100px">
                <el-input v-model.trim="opsForm.userName" placeholder="用户名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="密码" prop="pwd" label-width="100px">
                <el-input v-model.trim="opsForm.pwd" :type="passwordType" placeholder="请输入密码" />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="别名" prop="serverAlias" label-width="100px">
                <el-input v-model.trim="opsForm.serverAlias" placeholder="请输入别名" />
              </el-form-item>
            </el-col>
            <!-- <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="位置" prop="location" label-width="100px">
                <el-input v-model.trim="opsForm.location" placeholder="请输入位置" />
              </el-form-item>
            </el-col> -->
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="备注" prop="remarks" label-width="100px">
                <el-input v-model="opsForm.remarks" type="textarea" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="" label-width="100px">
                <el-button type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <HostSelectTemplateDialog ref="hostSelectTemplateDialog" :is-radio="true" />
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import loadmore from '@/directive/el-select-loadmore/loadmore'
import { listToTree } from '@/utils/index'
import HostSelectTemplateDialog from '@/views-admin/it-monitor/components/HostSelectTemplateDialog'

export default {
  name: 'HostCreateUpdate',
  directives: { loadmore },
  components: {
    HostSelectTemplateDialog
  },
  data() {
    return {
      form: {
        agent: '',
        groupid: '',
        templateid: '',
        host: '',
        orgId: '',
        hyDevTypeId: '',
        subdevTypeId: '',
        address: '',
        model: '',
        type: '',
        main: 1,
        useip: 1,
        ip: '',
        dns: '',
        port: '',
        hostType: 1,
        relation: '',
        cmdbItemTypeId: '',
        snmpVersion: '',
        snmpCommunity: '',
        manufactorId: '' // 厂家字段
      },
      opsForm: {
        deviceTypeCatId: '',
        userName: '',
        pwd: '',
        serverAlias: '',
        location: '',
        remarks: '',
        agent: '',
        connetType: 1,
        port: 22
      },
      listQuery: { // 查主机的参数
        page: 1,
        limit: 10,
        agent: '',
        devType: '',
        // total: 0,
        name: '',
        keyword: '',
        hostType: 1,
        agents: this.sessionStorageOperation('get', 'agentId')
      },
      maintenance: false,
      maintenanceId: '',
      hostName: '', // 选择的主机名
      dataList: [], // 弹窗主机的数据
      radio: [], // 单选绑定的
      listTotal: 1, // 用于主机弹窗分页
      customerSelect: '', // 存储选择的客户row
      agreementOptions: [
        { label: 'ssh', value: 1 }
      ],
      // 设备类型
      keyTypeArr: [],
      areaTreeArr: [], // 机房
      treeData: [], // 厂家
      classifyCatQuery: { // 查询厂家的参数
        page: 1,
        limit: -1,
        classify: 'userDefine_厂家',
        parentId: -1
      },
      classifyStr: 'userDefine_厂家', // 类别字符串前缀
      manufactor: [], // 厂家数据
      rules: {
        agent: [
          { required: true, message: '请选择监控网关', trigger: 'blur' }
        ],
        templateid: [
          { required: true, message: '请选择模板', trigger: 'blur' }
        ],
        host: [
          { required: true, message: '请输入主机名称', trigger: 'blur' }
        ],
        // type: [
        //   { required: true, message: '请选择协议', trigger: 'blur' }
        // ],
        ip: [
          { required: true, message: '请输入IP', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ],
        // snmpVersion: [{ validator: validVeraionIsNotNull, required: true, trigger: 'blur' }],
        // snmpCommunity: [{ validator: validCommunityIsNotNull, required: true, trigger: 'blur' }],
        ports: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ]
      },
      loading: false,
      confirmLoading: false,
      findHyitAgentQuery: {
        page: 1,
        limit: 20,
        agentType: 1
      },
      orgProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      agentList: [],
      zbxHstgrpList: [],
      zbxHstgrpQuery: {
        page: 1,
        limit: 20
      },
      templateList: [],
      templateQuery: {
        page: 1,
        limit: -1
      },
      orgList: [],
      orgQuery: {
        page: 1,
        limit: 20
      },
      devTypeList: [],
      typeList: [
        { value: 1, label: 'AGENT', port: 10050 },
        { value: 2, label: 'SNMP', port: 161 },
        { value: 3, label: 'IPMI', port: 12345 },
        { value: 4, label: 'JMX', port: 623 },
        { value: '', label: '无', port: '' }
      ],
      cmdbItemSourceType: 2,
      cmdbItemSourceTypeNum: 3,
      classifyTreeList: [],
      SNMPVersion: [
        { value: 2, label: 'SNMP V2' }
      ],
      formByDB: {},
      opsFormByDB: {},
      passwordType: 'password',
      allSelection: [],
      templateName: '选择模板',
      subtypeList: [], // 设备子类型列表
      userList: []
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    hyZhostId() { // 编辑获取内容
      return this.$route.query.hyZhostId
    },
    hyHostId() { // 编辑获取内容
      return this.$route.query.hyHostId
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    listPage() {
      return this.$route.query.listPage
    }
  },
  watch: {
    form: {
      handler(newValue, oldValue) {
        console.log(newValue.hyDevTypeId)
        this.loadSubType(newValue.hyDevTypeId)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // this.opsForm.hostId = this.$route.query.id
    this.getTypeArr() // 获取类型select
    this.loadAgent() // 获取监控网关
    this.loadOrgList() // 获取区域列表
    this.loadDevType()
    this.findCmdbItemType() // 获取类目列表
    this.findSysCat()// 获取类别属性列表
    if (this.id) {
      this.fetchDataServer() // 获取运维管理原有数据
      this.fetchData() // 获取资源管理原
    }
    this.$EventBus.$on('complete-selection-device', (res) => {
      this.allSelection = this.$tool.deepCopy(res.device)
      this.templateName = this.allSelection[0].name
    })
  },
  methods: {
    // 获取设备子类型
    loadSubType(n) {
      if (!n) return
      request({
        url: api.common.findSysDictionaryDetail,
        data: { limit: -1, pid: n }
      }).then(res => {
        if (res.code === 1) {
          this.subtypeList = res.data
        }
      })
    },
    // 查询主机名称和ip
    findHyitHost() {
      request({
        url: api.itMonitor.findHyitHost, data: { ...this.listQuery }
      }).then(res => {
        if (res.code === 1) {
          this.dataList = res.data
          this.listTotal = Number(res.count)
          this.listLoading = false
          const ids = []
          this.dataList.forEach(item => {
            if (ids.indexOf(item.hyDevTypeValue)) ids.push(item.hyDevTypeValue)
          })
          if (ids.length > 0) {
            this.findZbxTamplate(ids.toString())
          }
        }
      })
    },
    fetchDataServer() {
      request({
        url: api.automationOperations.findHyitOpsServer,
        data: { hostId: this.id }
      }).then(res => {
        if (res.code === 1 && res.data && res.data.length > 0) {
          this.opsFormByDB = this.$tool.deepCopy(res.data[0])
          if (res.data) {
            this.maintenance = true
            this.maintenanceId = res.data[0].id
            Object.keys(this.opsForm).forEach(key => {
              this.opsForm[key] = res.data[0][key]
            })
            console.log(this.opsForm)
          }
        }
      })
    },
    // 保存
    onSubmit() {
      // 基础信息
      console.log(this.opsForm.location)
      this.$refs['form'].validate(valid1 => {
        if (this.allSelection.length === 0) {
          this.$message('请选择模板')
          return
        }
        this.$set(this.form, 'templateid', this.allSelection[0].zabbixTamplateId)
        this.$refs['opsForm'].validate(async valid2 => {
          if (valid1 && valid2) {
            console.log(this.form)
            this.form.subdevTypeId === '' ? this.form.subdevTypeId = 0 : ''
            console.log(this.form)

            this.confirmLoading = true
            let isChangeITDeviceCount = 0

            Object.keys(this.form).forEach(key => {
              console.log(key, this.form[`${key}`], this.formByDB[`${key}`])
              if (this.form[`${key}`] !== this.formByDB[`${key}`]) ++isChangeITDeviceCount
            })
            console.log('isChangeITDeviceCount', isChangeITDeviceCount)

            let isChangeOpsCount = 0
            Object.keys(this.opsForm).forEach(key => {
              if (this.opsForm[`${key}`] !== this.opsFormByDB[`${key}`]) ++isChangeOpsCount
            })
            // console.log(this.opsForm)
            // console.log(this.opsFormByDB)
            // console.log(isChangeOpsCount)
            // return
            if (this.id) {
              if (isChangeITDeviceCount > 0) await this.saveITDevice()
              if (isChangeOpsCount > 0) await this.saveOpsServer()
              this.confirmLoading = false
            } else {
              let saveITDeviceResult = null
              if (isChangeITDeviceCount > 0) {
                saveITDeviceResult = await this.saveITDevice()
                const resData = JSON.parse(saveITDeviceResult.model)
                if (saveITDeviceResult.code === 1) {
                  if (isChangeOpsCount > 0) await this.saveOpsServer(resData.hostid)
                } else {
                  this.confirmLoading = false
                  this.$notify.error({
                    title: resData.error.message,
                    message: resData.error.data
                  })
                }
              }
            }
            this.$router.back()
          }
        })
      })
    },
    // 运维信息
    saveOpsServer(val) {
      if (val) {
        this.$set(this.opsForm, 'hostId', val)
      } else {
        this.$set(this.opsForm, 'hostId', this.id)
      }
      const formParams = this.opsForm
      formParams.ip = this.form.ip
      if (this.maintenanceId) { // 编辑
        this.confirmLoading = true
        request({ url: api.automationOperations.updateHyitOpsServer, data: (Object.assign({ id: this.maintenanceId, cmdbItemSourceType: this.cmdbItemSourceTypeNum }, formParams)) })
          .finally(() => {
            this.confirmLoading = false
          })
      } else { // 新增
        this.confirmLoading = true
        request({ url: api.automationOperations.insertHyitOpsServer, data: (Object.assign({ cmdbItemSourceType: this.cmdbItemSourceTypeNum }, formParams)) })
          .finally(() => {
            this.confirmLoading = false
          })
      }
    },
    // 保存it监控设备
    async saveITDevice() {
      const params = this.$tool.deepCopy(this.form)
      if (params.groupid === '' && this.zbxHstgrpList.length > 0) {
        params.groupid = this.zbxHstgrpList[0].groupid
      }
      // const idx = this.templateList.findIndex(item => item.id === params.templateid)
      // if (idx !== -1) {
      //   // params.templateid = this.templateList[idx].zabbixTamplateId
      // }
      if (!this.id) {
        this.confirmLoading = true
        if (params.hyDevTypeId === '') {
          this.$message('选择的模板没有设置设备类型')
          this.confirmLoading = false
        }
        params.orgid = this.form.orgId[this.form.orgId.length - 1]
      } else {
        params.id = this.id
        params.cmdbItemSourceType = this.cmdbItemSourceType
        params.orgid = this.form.orgId[this.form.orgId.length - 1]
      }
      const { code, model } = await request({
        url: this.id ? api.itMonitor.agentUpdateHost : api.itMonitor.agentAddHost,
        data: params
      })
      if (code === 1) return
      return { code, model }
    },
    // 获取类型select
    getTypeArr() {
      const _this = this
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        _this.keyTypeArr = res.data
      })
    },
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
        }
      })
    },
    // 获取类目列表
    async findCmdbItemType() {
      const findCmdbItemTypeByValueType = await request({
        url: api.cmdb.findCmdbItemType,
        data: { page: 1, limit: -1, valueType: 2}
      })
      if (findCmdbItemTypeByValueType.count === 0) return

      const findCmdbItemTypeByParent = await request({
        url: api.cmdb.findCmdbItemType,
        data: { page: 1, limit: -1, parentId: findCmdbItemTypeByValueType.data[0].id}
      })
      this.classifyTreeList = findCmdbItemTypeByParent.data
    },

    // 获取监控网关
    loadAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { ...this.findHyitAgentQuery, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.data.length > 0) {
          this.agentList.push(...res.data)
        } else {
          this.findHyitAgentQuery.page = this.findHyitAgentQuery.page > 0 ? this.findHyitAgentQuery.page - 1 : 0
        }
        this.form.agent = res.data[0].id
        // this.loadTemplate()
      })
    },
    // 获取模板
    loadTemplate() {
      request({
        url: api.itMonitor.findZbxTamplate,
        data: { agent: this.form.agent, ...this.templateQuery }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.templateList = res.data
        }
      })
    },
    // 获取区域列表
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: {limit: -1}})
        .then(res => {
          this.listLoading = false
          if (res.code === 1) {
            const data = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
            this.areaTreeArr = this.mapTree(data)
          }
        })
    },
    // 筛选已选择的地址包括父级
    mapTree(arr) {
      let newarr = []
      arr.forEach(item => {
        if (item.isIt === 1) {
          newarr.push(item)
        } else {
          if (item.children && item.children.length > 0) {
            let redata = this.mapTree(item.children)
            if (redata && redata.length > 0) {
              let obj = {
                ...item,
                children: redata
              }
              newarr.push(obj)
            }
          }
        }
      })
      return newarr
    },
    // 获取类别属性列表
    findSysCat() {
      request({
        url: api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: this.classifyStr,
          parentId: -1,
          module: 2
        }
      }).then(res => {
        if (res.code === 1) {
          this.manufactor = res.data
        }
      })
    },
    loadDevType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    fetchData() { // 获取编辑信息并展示
      request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: this.id }
      }).then(async res => {
        console.log(this.form)
        console.log(res.model)
        if (res.code === 1) {
          this.getUserList()
          this.form.agent = res.model.agent
          this.form.groupid = res.model.hyScanSsId
          this.form.templateid = res.model.hyDevTypeValue
          this.form.host = res.model.hyHostName
          this.form.orgId = res.model.hyOrgId
          this.form.hyDevTypeId = res.model.hyDevTypeId
          this.form.subdevTypeId = res.model.hySubdevTypeId === 0 ? '' : res.model.hySubdevTypeId
          this.form.address = res.model.hyAddr
          this.form.model = res.model.hyModel
          this.form.ip = res.model.hyIp
          this.form.relation = +res.model.hyRelation
          this.form.port = res.model.hyPort
          this.form.hostid = res.model.hyZhostId
          this.form.hostType = res.model.hostType
          this.form.cmdbItemTypeId = res.model.cmdbItemTypeId
          this.form.manufactorId = res.model.manufactorId // 选择的厂家
          this.agentGetHostInterface(res.model.agent, res.model.hyZhostId)
          this.formByDB = this.$tool.deepCopy(this.form)
          const findZbxTamplate = await this.$request({ url: this.api.itMonitor.findZbxTamplate, data: {limit: -1, agent: this.form.agent} })
          findZbxTamplate.data.forEach(item => {
            if (+item.zabbixTamplateId === +res.model.hyDevTypeValue) {
              this.templateName = item.name
            }
          })
          this.allSelection = [
            { zabbixTamplateId: res.model.hyDevTypeValue }
          ]
        }
      })
    },
    async getUserList() {
      const users = await this.commonRequestFn.findSysUser({

        companyId: this.$auth.getUserSession().companyId
      })
      if (users) { this.userList = users }
    },
    onReset() { // 清空内容-重置
      this.$refs['form'].resetFields()
      this.$refs['opsForm'].resetFields()
      this.form.orgId = ''
      this.form.manufactorId = ''
    },
    loadAgentMore() {
      this.findHyitAgentQuery.page = this.findHyitAgentQuery.page + 1
      this.loadAgent()
    },
    loadGroupMore() {
      this.zbxHstgrpQuery.page = this.zbxHstgrpQuery.page + 1
    },
    loadOrgMore() {
      this.orgQuery.page = this.orgQuery.page + 1
      this.loadOrgList()
    },
    // 选择模板
    changeTemplate(val) {
      const idx = this.templateList.findIndex(item => item.id === val)
      if (idx !== -1) {
        if (this.templateList[idx].catDevType) {
          this.$set(this.form, 'hyDevTypeId', this.templateList[idx].catDevType)
        } else {
          this.$set(this.form, 'hyDevTypeId', '')
          this.$message('选择的模板没有设置设备类型')
        }
      }
    },
    goBack() {
      this.$router.go(-1)
      this.$route.params.listPage = this.listPage
    },
    changeDeal(val) {
      const getItem = this.$tool.findDataItemByAttr(this.typeList, 'value', val)
      if (getItem) {
        this.$set(this.form, 'port', getItem.port)
      }
      if (val === 2) {
        this.$set(this.form, 'snmpVersion', 2)
        this.$set(this.form, 'snmpCommunity', 'public')
      }
    },
    agentGetHostInterface(agent, hostid) {
      request({
        url: api.itMonitor.agentGetHostInterface,
        data: {
          agent, hostid
        }
      }).then(res => {
        if (res.code === 1) {
          const model = JSON.parse(res.model)
          this.form.type = +model.interface[0].available === 0 ? '' : +model.interface[0].type
          this.formByDB.type = +model.interface[0].available === 0 ? '' : +model.interface[0].type
          console.log(this.form.type)
          if (model.snmp) {
            this.form.snmpVersion = model.snmp[0].version
            this.formByDB.snmpVersion = model.snmp[0].version
            this.form.snmpCommunity = model.snmp[0].community
            this.formByDB.snmpCommunity = model.snmp[0].community
          }
        }
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    onSelectHostTemplate() {
      this.$refs.hostSelectTemplateDialog.open({
        agent: this.form.agent,
        allSelection: this.allSelection
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  font-size: 19px;
  font-weight: bold;
  color: rgb(1,62,154);
  padding-bottom: 20px;
}
.show-pwd {
  position: absolute;
  right: 10px;
  top: 50%;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transform: translateY(-50%);
}
</style>
