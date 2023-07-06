<template>
  <div class="app-container flex" style="padding:0">
    <div class="page-left">
      <div class="tree-header flex space-between align-item-center">
        <div class="tree-header-title pointer" @click="lickCatalogue">目录</div>
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

      <!-- 树形 -->
      <port-subnet-tree :tree-list="portTree" />

    </div>
    <div class="page-right">
      <!-- 右边数据展示 -->
      <add-equipment ref="AddEquipment" />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showGroupDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="分组名称" prop="portDeviceGroup">
            <el-input v-model.trim="form.portDeviceGroup" placeholder="请输入分组名称" />
          </el-form-item>
          <el-form-item label="上级分组" label-width="110px">
            <el-cascader
              v-model="form.parentId"
              clearable
              class="filter-item w-100"
              multiple="false"
              :options="groupData"
              :props="portProps"
            />
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
          <el-form-item label="备注" prop="backup">
            <el-input v-model="form.backup" placeholder="请输入" type="textarea" />
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
import PortSubnetTree from './component/port-subnet-tree'
import FileUpload from '@/components/Upload/file-upload.vue'
import request from '@/utils/request'
import api from '@/api/api'
import AddEquipment from './add-equipment'
import {compareJson} from '@/utils/utils'

export default {
  name: '',
  components: {
    PortSubnetTree, AddEquipment, FileUpload
  },
  data() {
    return {
      agentsIds: '',
      agentGroupId: '',
      portTree: [],
      dialogTitle: '新增分组',
      showGroupDialog: false,
      form: {
        portDeviceGroup: '', // 设备分组名字
        parentId: 0, // 父节点id
        agentGroupId: 0, // 项目分组id
        backup: ''// 备注
      },
      formId: '',
      portProps: { label: 'portDeviceGroup', value: 'id', checkStrictly: true },
      areaTreeArr: [],
      fileList: [],
      rules: {},
      groupData: [],
      activeTabName: 'subnet-summary',
      handlerTreeItemVal: null,
      lastGroupStorage: null
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    this.findPort()
    // 点击进入子网汇总
    this.$EventBus.$on('summary-equipment', () => {
      this.activeTabName = 'subnet-summary'
    })
    // 点击进入ip详情
    this.$EventBus.$on('detail', (msg) => {
      this.activeTabName = 'ip-detail'
      this.$EventBus.$emit('change-ip', msg)
    })
    // 点击树形节点
    this.$EventBus.$on('handler-tree-item-equipment', (msg) => {
      this.handlerTreeItemVal = msg
    })
  },
  methods: {
    lickCatalogue() {
      this.$EventBus.$emit('click-port-catalogue')
    },
    // 初始化分组数据
    async findPort() {
      // 区域数据
      const areaList = await this.findPortDeviceGroup()
      areaList.forEach(item => {
        item.isArea = true
        item.treeItemId = item.id
        item.treeItemName = item.portDeviceGroup
        item.group = []
        item.ip = []
        item.level = 0
      })
      if (!areaList || areaList.length === 0) return
      let dataTree = this.$tool.listToTree(areaList, 0, 0, 'id', 'parentId')
      this.portTree = dataTree
      this.portTree.sort(compareJson('groupIndex', 'up'))
      this.groupData = dataTree
    },
    // 查询上级分组
    async findPortDeviceGroup() {
      const { code, data } = await request({
        url: api.port.findPortDeviceGroup,
        data: {
          limit: -1,
          agentGroupId: this.agentGroupId
        }
      })
      if (code !== 1) return
      this.groupData = this.$tool.listToTree(data, 0, 0, 'id', 'parentId')
      return data
    },
    // 打开新增分组
    handlerAddGroupDialog() {
      this.showGroupDialog = true
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
    },
    // 打开编辑分组
    async handlerEditGroupDialog() {
      this.fileList = []
      this.dialogTitle = '编辑分组'
      this.showGroupDialog = true
      const getGroup = await this.getPortDeviceGroup({ id: this.handlerTreeItemVal.activeItemId })
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
          this.$set(this.form, `${key}`, '')
        }
      })
    },

    // 监听文件上传
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'imageUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    // 点击删除分组
    async handlerDelGroupDialog() {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async res => {
        const groupRes = await this.findPortDeviceGroupData({ limit: -1, groupId: this.handlerTreeItemVal.activeItemId })
        if (groupRes > 0) return this.$message('存在设备，不可删除')
        const deleteRes = await this.deletePortDeviceGroup({ id: this.handlerTreeItemVal.activeItemId })
        if (deleteRes === 1) {
        // 更新树形分组节点
          this.$refs.AddEquipment.findPortDevice()
          this.findPort()
          this.$message({ type: 'success', message: '删除成功' })
        }
      })
    },
    // 查是否包含子集
    async findPortDeviceGroupData(query) {
      const { code, data } = await request({
        url: api.port.findPortDevice,
        data: { ...query }
      })
      if (code !== 1) return
      return data.length
    },
    // 删除分组
    async deletePortDeviceGroup() {
      const res = await request({
        url: api.port.deletePortDeviceGroup,
        data: { id: this.handlerTreeItemVal.activeItemId }
      })
      if (res.code !== 1) return
      return res.code
    },
    // 保存 新增或编辑分组
    confirmGroup() {
      const data = { ...this.form }
      if (data.parentId === '') {
        data.parentId = 0
      } else {
        data.parentId = data.parentId[0]
      }
      data.agentGroupId = this.agentGroupId
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? api.port.updatePortDeviceGroup : api.port.insertPortDeviceGroup
          if (this.formId) {
            data.id = this.formId
          }
          request({
            url: requestTopologyInfoApi, data
          }).then(res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.findPort()
              this.showGroupDialog = false
            }
          })
        }
      })
    },
    // 查询分组
    async findOpsIpGroup(query) {
      const { code, data } = await request({
        url: api.ipAddressManage.findOpsIpGroup,
        data: query
      })
      if (code !== 1) return
      return data.length
    },
    // 删除分组
    async deleteOdeletePortDeviceGrouppsIpGroup(query) {
      const { code } = await request({
        url: api.port.deletePortDeviceGroup,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // 查看分组
    async getPortDeviceGroup(query) {
      const { code, model } = await request({
        url: api.port.getPortDeviceGroup,
        data: query
      })
      if (code !== 1) return
      return model
    }
  }
}
</script>

<style lang="scss" scoped>
.page-left {
  width: 300px;
  background: #e5ecf6;
  position: fixed;
  height: 100%;
  overflow-x: hidden;
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
}
.page-right {
  padding-left: 300px;
  height: 100%;
  width: 100%;
}
.ip-manage-tab {
  .el-tabs__header {
    margin-bottom: 0;
  }
}
</style>
