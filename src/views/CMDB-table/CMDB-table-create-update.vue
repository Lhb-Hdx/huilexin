<template>
  <div>
    <div class="page-nav">
      <el-page-header :content="navTitle" @back="goBack" />
    </div>
    <div class="app-container">
      <el-card>
        <el-row :gutter="20">
          <el-form ref="form" :model="form" :rules="rules">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="更新时间" prop="updateTime" label-width="150px">
                <el-input v-model.trim="form.updateTime" placeholder="请输入更新时间" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="云分类 " prop="cloudType" label-width="150px">
                <el-input v-model.trim="form.cloudType" placeholder="请输入云分类 " />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="产品类别" prop="proType" label-width="150px">
                <el-input v-model.trim="form.proType" placeholder="请输入产品类别" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="产品类别英文" prop="proTypeEn" label-width="150px">
                <el-input v-model.trim="form.proTypeEn" placeholder="请输入产品类别英文" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="产品子类别" prop="proSubType" label-width="150px">
                <el-input v-model.trim="form.proSubType" placeholder="请输入产品子类别" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="产品子类别简写" prop="proSubTypeShort" label-width="150px">
                <el-input v-model.trim="form.proSubTypeShort" placeholder="请输入产品子类别简写" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="资产归属" prop="assets" label-width="150px">
                <el-input v-model.trim="form.assets" placeholder="请输入资产归属" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备类型" prop="deviceType" label-width="150px">
                <el-input v-model.trim="form.deviceType" placeholder="请输入设备类型" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备型号" prop="deviceModel" label-width="150px">
                <el-input v-model.trim="form.deviceModel" placeholder="请输入设备型号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="厂家" prop="manufactor" label-width="150px">
                <el-input v-model.trim="form.manufactor" placeholder="请输入厂家" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="数据中心" prop="dataCenter" label-width="150px">
                <el-input v-model.trim="form.dataCenter" placeholder="请输入数据中心" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="网络区域" prop="netArea" label-width="150px">
                <el-input v-model.trim="form.netArea" placeholder="请输入网络区域" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="机房id" prop="computerRoom" label-width="150px">
                <el-input v-model.trim="form.computerRoom" placeholder="请输入机房id" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="机柜编号" prop="cabinetNo" label-width="150px">
                <el-input v-model.trim="form.cabinetNo" placeholder="请输入机柜编号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备位置" prop="deviceAddr" label-width="150px">
                <el-input v-model.trim="form.deviceAddr" placeholder="请输入设备位置" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="占用机位数" prop="deviceSize" label-width="150px">
                <el-input v-model.trim="form.deviceSize" placeholder="请输入占用机位数" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="序号" prop="indexNo" label-width="150px">
                <el-input v-model.trim="form.indexNo" placeholder="请输入序号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="主机名1" prop="hostName1" label-width="150px">
                <el-input v-model.trim="form.hostName1" placeholder="请输入主机名1" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="主机名2" prop="hostName2" label-width="150px">
                <el-input v-model.trim="form.hostName2" placeholder="请输入主机名2" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备状态" prop="deviceStatue" label-width="150px">
                <el-input v-model.trim="form.deviceStatue" placeholder="请输入设备状态" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="业务状态" prop="businessStatue" label-width="150px">
                <el-input v-model.trim="form.businessStatue" placeholder="请输入业务状态" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="sn码" prop="sn" label-width="150px">
                <el-input v-model.trim="form.sn" placeholder="请输入sn码" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="uuid" prop="uuid" label-width="150px">
                <el-input v-model.trim="form.uuid" placeholder="请输入uuid" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="固资号" prop="assetsNo" label-width="150px">
                <el-input v-model.trim="form.assetsNo" placeholder="请输入固资号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="带外管理地址" prop="ip" label-width="150px">
                <el-input v-model.trim="form.ip" placeholder="请输入带外管理地址" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备维保到期时间" prop="deviceOutDate" label-width="150px">
                <el-input v-model.trim="form.deviceOutDate" placeholder="设备维保到期时间" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备是否变更 " prop="deviceChange" label-width="150px">
                <el-input v-model.trim="form.deviceChange" placeholder="请输入设备是否变更 " />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="厂家合同编号" prop="contractNo" label-width="150px">
                <el-input v-model.trim="form.contractNo" placeholder="请输入厂家合同编号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="电信合同编号" prop="contractNo2" label-width="150px">
                <el-input v-model.trim="form.contractNo2" placeholder="请输入电信合同编号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="WBS编号" prop="wbsNo" label-width="150px">
                <el-input v-model.trim="form.wbsNo" placeholder="请输入WBS编号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="设备期数" prop="deviceStage" label-width="150px">
                <el-input v-model.trim="form.deviceStage" placeholder="请输入设备期数" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="布线表文件名称" prop="fileName" label-width="150px">
                <el-input v-model.trim="form.fileName" placeholder="请输入布线表文件名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="扩容上线蓝鲸工单号" prop="lineNo" label-width="150px">
                <el-input v-model.trim="form.lineNo" placeholder="请输入扩容上线蓝鲸工单号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="是否能纳管" prop="manage" label-width="150px">
                <el-input v-model.trim="form.manage" placeholder="请输入是否能纳管" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="备注" prop="backup" label-width="150px">
                <el-input v-model.trim="form.backup" type="textarea" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="" prop="" label-width="100px">
                <el-button type="primary" :loading="loading" @click="onSubmit">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </el-card>
    </div>
  </div>
</template>
<script>

export default {
  components: {
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10
      },
      form: {
        updateTime: '',
        cloudType: '',
        proType: '',
        proTypeEn: '',
        proSubType: '',
        proSubTypeShort: '',
        assets: '',
        deviceType: '',
        deviceModel: '',
        manufactor: '',
        dataCenter: '',
        netArea: '',
        computerRoom: '',
        cabinetNo: '',
        deviceAddr: '',
        deviceSize: '',
        indexNo: '',
        hostName1: '',
        hostName2: '',
        deviceStatue: '',
        businessStatue: '',
        sn: '',
        uuid: '',
        assetsNo: '',
        ip: '',
        deviceOutDate: '',
        deviceChange: '',
        backup: '',
        contractNo: '',
        contractNo2: '',
        wbsNo: '',
        deviceStage: '',
        fileName: '',
        lineNo: '',
        manage: ''
      },
      loading: false,
      rules: {
        updateTime: [
          { required: true, message: '请输入更新时间', trigger: 'blur' }
        ],
        cloudType: [
          { required: true, message: '请输入云分类', trigger: 'blur' }
        ],
        proType: [
          { required: true, message: '请输入产品类别', trigger: 'blur' }
        ],
        proSubType: [
          { required: true, message: '请输入子类别', trigger: 'blur' }
        ]
      }
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
  mounted() {
    if (this.id) {
      console.log(this.id)
      this.getEsightCmdb()
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    onReset() { // 清空内容-重置
      this.$refs['form'].resetFields()
    },
    // 获取编辑数据
    getEsightCmdb() {
      this.$request({
        url: this.api.itMonitor.getEsightCmdb, data: { id: this.id }
      }).then(res => {
        if (res.code === 1) {
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res.model[key]
          })
          this.form = form
        }
      })
    },
    // 保存
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.id) { // 编辑
            this.loading = true
            this.$request({
              url: this.api.itMonitor.updateEsightCmdb, data: { id: this.id, ...this.form }
            }).then(res => {
              if (res.code === 1) {
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          } else { // 新增
            this.loading = true
            this.$request({
              url: this.api.itMonitor.insertEsightCmdb, data: {...this.form}
            }).then(res => {
              if (res.code === 1) {
                this.$router.back()
              }
            }).finally(() => {
              this.loading = false
            })
          }
        }
      })
    }
  }
}
</script>
    <style lang="scss" scoped>
    </style>

