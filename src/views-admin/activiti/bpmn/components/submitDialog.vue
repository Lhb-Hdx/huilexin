<template>
  <div>
    <!-- 保存弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="保存">
      <el-form ref="numberValidateForm" :model="bpmnInfo" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="bpmnInfo.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="模型KEY" prop="modelKey">
          <el-input v-model="bpmnInfo.modelKey" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="bpmnInfo.description" placeholder="请输入" type="textarea" />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input-number v-model="bpmnInfo.version" :min="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="bpmnInfo.status" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
// 引入json转换与高亮
import convert from 'xml-js'
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
        modelKey: '',
        description: '',
        version: '',
        svgXml: '',
        jsonXml: '',
        status: false
      },
      rules: {
        name: [{ required: true, message: '请输入', trigger: 'blur' }],
        modelKey: [{ required: true, message: '请输入', trigger: 'blur' }]
      }
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
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
        let svgXml, jsonXml
        //   await this.bpmnModeler.saveSVG((err, svg) => {
        //     if (err) return
        //     svgXml = svg.slice(svg.indexOf('<svg'))
        //   })
        this.bpmnModeler.saveXML({ format: true }, async(err, xml) => {
          if (err) return
          jsonXml = convert.xml2json(xml, { compact: true, spaces: 0 })
          svgXml = xml

          const data = {
            ...this.bpmnInfo,
            jsonXml,
            svgXml,
            ctime: '',
            utime: ''
          }
          await request({
            url: this.id ? api.linkageManage.updateOmProcessModel : api.linkageManage.insertOmProcessModel,
            data: data
          }).then(({ code }) => {
            this.$message({
              message: code === 1 ? '保存成功' : '保存失败',
              type: code === 1 ? 'success' : 'error'
            })
            this.$router.back()
          })
        })
      })
    }
  }
}
</script>

<style>

</style>
