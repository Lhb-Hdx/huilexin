<template>
  <div class="app-container">
    <div class="filter-container mb-10">
      <el-button v-permission="['create']" type="primary" @click="typeDialogVisible=true">新增类型</el-button>
    </div>
    <div class="table-wrapper">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="类型" prop="modelName" />
        <el-table-column fixed="right" label="操作" width="300px">
          <template v-slot="{row}">
            <el-button v-permission="['img']" size="mini" type="primary" @click="onShowPicDialogVisible(row)">设备图片管理</el-button>
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onTypeEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" size="mini" type="danger" @click="onTypeDelete(row.modelId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination
      v-show="typeQuery.total > 0"
      :limit.sync="typeQuery.limit"
      :page.sync="typeQuery.page"
      :auto-scroll="false"
      :total="typeQuery.total"
      @pagination="findDiagramModel"
    />

    <el-dialog :visible.sync="picDialogVisible" title="设备图片管理">
      <el-button class="mb-10" size="mini" type="primary" @click="dialogVisible=true">新增图片</el-button>
      <el-table
        :data="picData"
        style="width: 100%"
      >
        <el-table-column
          label="设备名称"
          prop="name"
        />
        <el-table-column
          label="图片"
          prop="url"
        >
          <template v-slot="{row}">
            <img :src="row.url" alt="" style="height: 30px">
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150px"
        >
          <template v-slot="{row}">
            <el-button size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteDiagramDevicePicture(row.picId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="query.total > 0"
        :limit.sync="query.limit"
        :page.sync="query.page"
        :auto-scroll="false"
        :total="query.total"
        @pagination="findDiagramDevicePicture"
      />
      <div slot="footer">
        <el-button size="mini" type="primary" @click="picDialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="typeDialogVisible" title="类型">
      <el-form ref="typeForm" :model="typeForm" label-width="80px">
        <el-form-item :rules="[{required:true,trigger:'blur',message:'请填写'}]" label="类型" prop="modelName">
          <el-input v-model="typeForm.modelName" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button :loading="loading" size="mini" type="primary" @click="onSubmitType">保存</el-button>
        <el-button size="mini" type="primary" @click="typeDialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" title="">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :rules="[{required:true,trigger:'blur',message:'请填写'}]" label="设备名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="容量(u)" prop="capacity">
          <el-input-number v-model="form.capacity" />
        </el-form-item>
        <el-form-item label="图片" prop="url">
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
        <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
        <el-button size="mini" type="primary" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FileUpload from '@/components/Upload/file-upload.vue'
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'ConfigurationImg',
  components: {
    FileUpload,
    Pagination
  },
  data() {
    return {
      query: {
        page: 1,
        limit: 10,
        modelId: '',
        total: 0
      },
      typeQuery: {
        page: 1,
        limit: 10,
        total: 0
      },
      loading: false,
      tableData: [],
      picData: [],
      fileList: [],
      dialogVisible: false,
      form: {
        type: 0, capacity: 1
      },
      typeDialogVisible: false,
      picDialogVisible: false,
      typeForm: { modelName: '' },
      rules: {
        model: [{ required: true, message: '请填写', trigger: 'blur' }],
        brand: [{ required: true, message: '请填写', trigger: 'blur' }],
        url: [{ required: true, message: '请选择', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.findDiagramModel()
  },
  methods: {
    onEdit(row) {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.getDiagramDevicePicture(row.picId)
      })
    },
    async onShowPicDialogVisible(row) {
      this.picDialogVisible = true
      this.query.modelId = row.modelId
      await this.findDiagramDevicePicture()
    },
    onSubmitType() {
      this.$refs.typeForm.validate(async(val) => {
        if (!val) return
        this.loading = true
        let {
          code,
          msg
        } = await request({
          url: this.typeForm.modelId ? api.diagram.updateDiagramModel : api.diagram.insertDiagramModel,
          data: { ...this.typeForm }
        })
        this.loading = false
        if (code === 1) this.$message.success(msg)
        else this.$message.error(msg)
        this.typeDialogVisible = false
        await this.findDiagramModel()
      })
    },
    onTypeEdit(row) {
      this.typeDialogVisible = true
      this.$nextTick(() => {
        this.query.modelId = row.modelId
        this.$refs.typeForm.resetFields()
        this.findDiagramDevicePicture()
        this.typeForm = { ...row }
      })
    },
    onTypeDelete(modelId) {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let { code, msg } = await request({ url: api.diagram.deleteDiagramModel, data: { modelId }})
        if (code === 1) this.$message.success(msg)
        else this.$message.error(msg)
        await this.findDiagramModel()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    onSubmit() {
      this.$refs.form.validate(async(val) => {
        if (!val) return
        let {
          code,
          msg
        } = await request({
          url: this.form.picId ? api.diagram.updateDiagramDevicePicture : api.diagram.insertDiagramDevicePicture,
          data: { ...this.form, modelId: this.query.modelId }
        })
        if (code === 1) this.$message.success(msg)
        else this.$message.error(msg)
        this.dialogVisible = false
        this.form = { type: 0 }
        this.fileList = []
        await this.findDiagramDevicePicture()
      })
    },
    async findDiagramModel() {
      let { data, code, count } = await request({ url: api.diagram.findDiagramModel, data: this.typeQuery })
      if (code !== 1) return
      this.tableData = data
      this.typeQuery.total = +count
    },

    async findDiagramDevicePicture() {
      let { data, code, count } = await request({ url: api.diagram.findDiagramDevicePicture, data: this.query })
      if (code === 1) {
        this.picData = data
        this.query.total = +count
      }
    },
    async deleteDiagramDevicePicture(picId) {
      let { code, msg } = await request({ url: api.diagram.deleteDiagramDevicePicture, data: { picId }})
      if (code === 1) this.$message.success(msg)
      else this.$message.error(msg)
      await this.findDiagramDevicePicture()
    },
    async getDiagramDevicePicture(picId) {
      let { model, code } = await request({ url: api.diagram.getDiagramDevicePicture, data: { picId }})
      if (code === 1) {
        this.form = model
        this.fileList = [{ name: 111, id: 111, url: this.form.url }]
      }
    },
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'url', file.fileList[0]['url'])
    },
    handleSizeChange(val) {
      this.query.limit = val
      this.findDiagramDevicePicture()
    },
    handleCurrentChange(val) {
      this.query.page = val
      this.findDiagramDevicePicture()
    }
  }
}
</script>

<style scoped>

</style>
