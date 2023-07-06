<template>
  <div>
    <div class="tree-header flex space-between align-item-center">
      <div class="tree-header-title">目录</div>
      <div class="tree-header-action flex space-between align-item-center">
        <div class="action-icon pointer" @click="handlerAddGroupDialog">
          <i class="el-icon-plus" />
        </div>
        <div class="action-icon pointer margin-left-5" @click="handlerEditGroupDialog">
          <i class="el-icon-edit" />
        </div>
        <div class="action-icon pointer margin-left-5" @click="handlerDelGroupDialog">
          <i class="el-icon-minus" />
        </div>
      </div>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showGroupDialog" :append-to-body="true" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="上级分组" prop="parentId">
            <AiTreeInput
              :key="reloadKey"
              :level-start-num="0"
              :field="{'id':'id','name':'groupName','parent':'parentId'}"
              :remote="api.automationOperations.findHyitOpsScriptGroup"
              :infoapi="api.automationOperations.getHyitOpsScriptGroup"
              placeholder="请输入上层菜单"
              :param="{limit: -1}"
              :bind-value="form.parentId"
              :mounted-require="true"
              @input="inputParent"
            />
          </el-form-item>
          <el-form-item label="分组名称" prop="groupName">
            <el-input v-model.trim="form.groupName" placeholder="请输入分组名称" />
          </el-form-item>
          <el-form-item label="图标" label-width="110px" prop="imageUrl">
            <FileUpload
              button-text="上传"
              upload-type="pic"
              file-type=".png,.jpg"
              :limit="1"
              :button-disabled="false"
              :is-limit-file-size="true"
              :file-max-size="1"
              :file-url-list="fileList"
              file-url-list-type="picture"
              button-type="primary"
              @emitFileList="getEmitFileList"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showGroupDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmGroup">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FileUpload from '@/components/Upload/file-upload.vue'
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'

export default {
  name: 'ScriptGroupAuction',
  components: {
    FileUpload,
    AiTreeInput
  },
  data() {
    return {
      dialogTitle: '新增目录',
      showGroupDialog: false,
      rules: {
        groupName: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ],
        areaId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ]
      },
      form: {
        groupName: '',
        parentId: 0,
        imageUrl: ''
      },
      formId: '',
      fileList: [],
      reloadKey: 'reloadKey',
      handlerTreeItemVal: null,
      lastGroupStorage: null
    }
  },
  mounted() {
    // 点击树形节点
    this.$EventBus.$on('handler-tree-item', (msg) => {
      this.handlerTreeItemVal = msg
    })
  },
  methods: {
    // 添加分组
    handlerAddGroupDialog() {
      this.showGroupDialog = true
      Object.keys(this.form).forEach(key => {
        if (key === 'parentId') {
          this.$set(this.form, 'parentId', 0)
        } else {
          this.$set(this.form, `${key}`, '')
        }
      })
    },
    // 编辑分组
    async handlerEditGroupDialog() {
      this.showGroupDialog = true
      this.fileList = []
      const getGroup = await this.getHyitOpsScriptGroup({ id: this.handlerTreeItemVal.activeItemId })
      if (getGroup.imageUrl) {
        this.fileList = [{
          id: getGroup.id,
          name: this.$tool.sliceFileName(getGroup.imageUrl),
          url: getGroup.imageUrl
        }]
      }
      this.lastGroupStorage = getGroup
      this.formId = getGroup.id
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, getGroup[`${key}`])
        if ((key === 'areaId' || key === 'parentId') && getGroup[`${key}`] === 0) {
          this.$set(this.form, `${key}`, 0)
        }
      })
    },
    // 删除分组
    async handlerDelGroupDialog() {
      console.log(this.handlerTreeItemVal)
      if (this.handlerTreeItemVal.activeType === 'group') {
        // 查询是否包含子级分组
        const groupRes = await this.findHyitOpsScriptGroup({ limit: -1, parentId: this.handlerTreeItemVal.activeItemId })
        if (groupRes.length > 0) return this.$message('存在子级，不可删除')
        // 请求删除分组
        const deleteRes = await this.deleteHyitOpsScriptGroup({ id: this.handlerTreeItemVal.activeItemId })
        if (deleteRes === 1) {
          // 更新树形分组节点
          this.$EventBus.$emit('delete-group', { deleteId: this.handlerTreeItemVal.activeItemId })
          this.$message({ type: 'success', message: '删除成功' })
        }
      }
    },
    // 查询分组目录
    async findHyitOpsScriptGroup(query) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsScriptGroup,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 删除分组
    async deleteHyitOpsScriptGroup(query) {
      const { code } = await this.$request({
        url: this.api.automationOperations.deleteHyitOpsScriptGroup,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // 查看分组
    async getHyitOpsScriptGroup(query) {
      const { code, model } = await this.$request({
        url: this.api.automationOperations.getHyitOpsScriptGroup,
        data: query
      })
      if (code !== 1) return
      return model
    },
    // 监听文件上传
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'imageUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    // 监听选择上级分组
    inputParent(val) {
      this.$set(this.form, 'parentId', Number(val))
    },
    // 保存
    confirmGroup() {
      const data = { ...this.form }
      if (data.parentId === '' || data.parentId === null) data.parentId = 0
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? this.api.automationOperations.updateHyitOpsScriptGroup : this.api.automationOperations.insertHyitOpsScriptGroup
          if (this.formId) {
            data.id = this.formId
          }
          this.$request({
            url: requestTopologyInfoApi, data
          }).then(async res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.showGroupDialog = false
              if (this.formId === '') {
                // 插入分组到分组
                this.$EventBus.$emit('add-group', { setInType: 'group', setInId: data.parentId, data: res.model })
              } else {
                // 更新分组到分组
                this.$EventBus.$emit('update-group', {
                  fromType: 'group', // 修改前分组挂在那个类型下 area：区域 group：分组
                  fromPid: this.lastGroupStorage.parentId, // 修改前分组挂在的上层id 挂在区域下就是区域id，挂在分组就是分组id
                  toType: 'group', // 修改后分组挂在那个类型下
                  toPid: data.parentId, // 修改后分组挂在的上层id
                  updateId: this.formId, // 要修改的节点
                  data: res.model
                })
              }
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-header {
  background: #f2f6fb;
  padding: 8px 10px;
  height: 40px;
  .tree-header-title {
    font-size: 16px;
    color: #000;
    font-weight: bold;
  }
  .tree-header-action {
    color: #000;
    font-size: 14px;
  }
}
</style>
