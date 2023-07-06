<template>
  <div class="map-dialog">
    <el-dialog :visible.sync="dialogVisible" title="组态图信息">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          {{ form.name }}
        </el-form-item>
        <el-form-item label="背景图" prop="imageUrl">
          <img :src="form.imageUrl" alt="" width="80px">
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'MapDialog',
  components: {
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
