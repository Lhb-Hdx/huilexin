<template>
  <div>
    <!-- 保存弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="保存">
      <el-form ref="numberValidateForm" :model="bpmnInfo" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="bpmnInfo.name" placeholder="请输入流程名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import request from '@/utils/request'
// import api from '@/api/api'
// 引入json转换与高亮
// import convert from 'xml-js'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'SubmitDialog',
  props: {
    bpmnModeler: {
      type: Object,
      default: () => {}
    },
    modelInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: false, // 弹窗
      bpmnInfo: { // bpmn信息
        name: '',
        bpmnKey: '',
        xmlData: '',
        type: ''
      },
      rules: {
        name: [{ required: true, message: '请输入流程名称', trigger: 'blur' }],
        bpmnKey: [{ required: true, message: '请输入流程KEY', trigger: 'blur' }],
        type: [{ required: true, message: '请选择流程类型', trigger: 'blur' }]
      },
      approveType: [],
      submitLoading: false
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.findApproveType()
  },
  methods: {
    // 保存弹窗
    open() {
      // 先让dialog挂载完才能调用重置表单
      this.dialogVisible = true
      this.$nextTick(() => {
        //   this.$refs['numberValidateForm'].resetFields()
        this.bpmnInfo = this.modelInfo
      })
    },
    // 提交流程图
    async handleSubmit() {
      this.$refs['numberValidateForm'].validate((val) => {
        if (!val) return
        this.bpmnModeler.saveXML({ format: true }, async(err, xml) => {
          if (err) return
          // this.$set(this.bpmnInfo, 'bpmnKey', this.$store.getters.bpmnModelInfo.processId)
          if (!this.id) {
            this.$set(this.bpmnInfo, 'type', this.$store.getters.bpmnModelInfo.type)
            this.$set(this.bpmnInfo, 'bpmnKey', this.bpmnModeler._definitions.id.split('diagram_')[1])
          }
          const data = { ...this.bpmnInfo, xmlData: xml }
          // console.log(this.bpmnModeler._definitions)
          // console.log(this.$store.getters.bpmnModelInfo)
          // console.log(data)
          // console.log(xml)
          this.submitLoading = true
          await request({
            url: this.id ? api.activity.updateNewOaActivity : api.activity.insertNewOaActivity,
            data: data
          }).then(({ code }) => {
            this.submitLoading = false
            const resetStatueApi = this.$defineData.projectActivityProcessDefine(this.$store.getters.bpmnModelInfo.type, 'id', 'resetStatueApi')
            if (resetStatueApi) request({ url: resetStatueApi, data: {}})
            this.$message({
              message: code === 1 ? '保存成功' : '保存失败',
              type: code === 1 ? 'success' : 'error',
              duration: 888
            })
            this.$router.back()
          })
        })
      })
    },
    // 流程类型
    findApproveType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { page: 1, limit: -1, dictCode: 'oa_approve_type' }
      }).then(res => {
        if (res.code === 1) this.approveType = res.data
      })
    },
    // 删除已经部署的流程
    async deleteDeployment(deploymentId) {
      return new Promise(resolve => {
        request({
          url: api.activity.deleteDeployment,
          data: { deploymentId }
        }).then(res => {
          if (res.code === 1) resolve(res)
        })
      })
    },
    // 目前规定一个流程类型只有一个流程图，所以查询一下当前选择的流程类型有没有流程图，有的话不可以新增
    async isHaveApproveTypeMap(type) {
      return new Promise(resolve => {
        request({
          url: api.activity.findNewOaActivity,
          data: { type }
        }).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    }
  }
}
</script>

<style>

</style>
