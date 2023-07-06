<template>
  <div class="map-dialog">
    <el-dialog :title="form.id?'修改组态图':'新增组态图'" :visible.sync="dialogVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :rules="[{required:true,trigger:'blur',message:'请填写'}]" label="名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入组态图名称" />
        </el-form-item>
        <el-form-item label="背景图" prop="imageUrl">
          <FileUpload
            :button-disabled="false"
            :file-max-size="1"
            :file-url-list="fileList"
            :is-limit-file-size="true"
            :limit="1"
            button-text="上传"
            button-type="primary"
            file-type=".png,.jpg"
            file-url-list-type="picture"
            upload-type="pic"
            @emitFileList="getEmitFileList"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button type="primary" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload.vue'

export default {
  name: 'MapDialog',
  components: {
    FileUpload
  },
  data() {
    return {
      form: {
        name: '',
        orgId: '',
        imageUrl: ''
      },
      rules: {},
      fileList: [],
      dialogVisible: false
    }
  },
  mounted() {
    this.$EventBus.$on('updateDiagram', (n) => {
      this.$set(this.form, 'name', n.name)
      this.$set(this.form, 'id', n.id)
      this.$set(this.form, 'orgId', n.orgId)
      this.$set(this.form, 'imageUrl', n.imageUrl)
      if (!n.imageUrl) return (this.fileList = [])
      this.fileList = [{
        id: Math.random().toString(16).slice(2),
        name: Math.random().toString(16).slice(2),
        url: n.imageUrl
      }]
    })
    this.$EventBus.$on('addDiagram', (hyareaId) => {
      this.form = {}
      this.form.orgId = hyareaId
      this.fileList = []
    })
    this.$EventBus.$on('openDialog', () => {
      this.dialogVisible = true
    })
  },
  methods: {
    onSubmit() {
      if (!this.form.orgId) return this.$message.error('请选择区域')
      const data = { ...this.form }
      console.log(data)
      this.$refs['form'].validate(async val => {
        if (!val) return
        let { code, msg } = await request({
          url: this.form.id ? api.diagram.updateDiagram : api.diagram.insertDiagram,
          data
        })
        if (code !== 1) return
        this.$message.success(msg)
        this.$emit('updateMenuList')
        this.dialogVisible = false
      })
    },
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'imageUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    async findDiagramManageField(hyAreaId) {
      let { data, code } = await request({
        url: api.diagram.findDiagramManageField, data: {
          areaId: hyAreaId
        }
      })
      code === 1 && (this.form = data[0])
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
