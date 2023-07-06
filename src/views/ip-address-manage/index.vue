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
      <group-subnet-tree :tree-list="groupTree" />
    </div>
    <div class="page-right">
      <el-tabs v-model="activeTabName" class="ip-manage-tab" @tab-click="handleTabClick">
        <el-tab-pane label="子网汇总" name="subnet-summary">
          <subnet-summary v-if="activeTabName === 'subnet-summary'" />
        </el-tab-pane>
        <el-tab-pane label="IP详情" name="ip-detail">
          <ip-detail v-if="activeTabName === 'ip-detail'" />
        </el-tab-pane>
        <el-tab-pane label="历史" name="ip-history">
          <ip-history v-if="activeTabName === 'ip-history'" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showGroupDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="上级分组" prop="parentId">
            <el-select
              v-model="form.parentId"
              placeholder="请选择上级分组"
              style="width: 100%;"
              clearable
            >
              <el-option
                v-for="item in groupData"
                :key="item.id"
                :label="item.groupName"
                :value="item.id"
              />
            </el-select>
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
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload.vue'
import SubnetSummary from './subnet-summary'
import IpDetail from './ip-detail'
import IpHistory from './ip-history'
import GroupSubnetTree from './component/group-subnet-tree'
import { compareJson } from '@/utils/utils'

export default {
  name: 'IpAdressManageIndex',
  components: {
    FileUpload, SubnetSummary, IpDetail, IpHistory, GroupSubnetTree
  },
  data() {
    return {
      agentsIds: '',
      dialogTitle: '新增分组',
      showGroupDialog: false,
      form: {
        groupName: '',
        parentId: '',
        imageUrl: ''
      },
      formId: '',
      areaProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      areaTreeArr: [],
      fileList: [],
      rules: {
        groupName: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ],
        areaId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ]
      },
      groupData: [],
      activeTabName: 'subnet-summary',
      handlerTreeItemVal: null,
      lastGroupStorage: null,
      groupTree: []
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.findIpGroup()
    this.loadOrgList()
    // 点击进入子网汇总
    this.$EventBus.$on('summary', () => {
      this.activeTabName = 'subnet-summary'
    })
    // 点击进入ip详情
    this.$EventBus.$on('detail', (msg) => {
      this.activeTabName = 'ip-detail'
      this.$nextTick(() => {
        this.$EventBus.$emit('change-ip', msg)
      })
    })
    // 点击树形节点
    this.$EventBus.$on('handler-tree-item', (msg) => {
      this.handlerTreeItemVal = msg
    })
  },
  methods: {
    lickCatalogue() {
      this.$EventBus.$emit('click-ip-catalogue')
    },
    // 查询ip分组
    async findIpGroup() {
      // 查询第一级分组
      const firstLevelGroup = await this.findOpsIpGroup({ parentId: 0 })
      const allGroup = await this.findOpsIpGroup({ limit: -1 })
      const groupTree = []
      firstLevelGroup.forEach(item => {
        groupTree.push({
          isGroup: true,
          treeItemId: item.id,
          treeItemName: item.groupName,
          treeParentId: item.parentId,
          imageUrl: item.imageUrl,
          expand: false,
          group: [],
          ip: [],
          level: 0,
          groupIndex: item.groupIndex
        })
      })
      this.groupTree = groupTree
      this.groupTree.sort(compareJson('groupIndex', 'up'))
      this.groupData = this.$tool.listToTree(allGroup, 0, 0, 'id', 'parentId')
    },
    // 获取区域
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: { agents: this.agentsIds }})
        .then(res => {
          if (res.code === 1) {
            this.areaTreeArr = this.$tool.listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
          }
        })
    },
    // 打开新增分组
    handlerAddGroupDialog() {
      this.showGroupDialog = true
      this.fileList = []
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
    },
    // 打开编辑分组
    async handlerEditGroupDialog() {
      this.fileList = []
      this.showGroupDialog = true
      const getGroup = await this.getOpsIpGroup({ id: this.handlerTreeItemVal.activeItemId })
      console.log(getGroup)
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
      if (this.handlerTreeItemVal.activeType === 'group') {
        // 查询是否包含子级分组
        const groupRes = await this.findOpsIpGroup({ limit: -1, parentId: this.handlerTreeItemVal.activeItemId })
        if (groupRes.length > 0) return this.$message('存在子级，不可删除')
        // 查询是否包含网段
        // const ipRes = await this.findOpsIpAddress({ limit: -1, ipGroupId: this.handlerTreeItemVal.activeItemId })
        // if (ipRes) return this.$message('存在网段，不可删除')
        // 请求删除分组
        const deleteRes = await this.deleteOpsIpGroup({ id: this.handlerTreeItemVal.activeItemId })
        if (deleteRes === 1) {
          // 更新树形分组节点
          this.$EventBus.$emit('delete-subnet-group', { deleteId: this.handlerTreeItemVal.activeItemId })
          this.$message({ type: 'success', message: '删除成功' })
          const allGroup = await this.findOpsIpGroup({ limit: -1 })
          this.groupData = this.$tool.listToTree(allGroup, 0, 0, 'id', 'parentId')
        }
      }
    },
    // 确定保存分组
    confirmGroup() {
      const data = { ...this.form }
      if (data.parentId === '' || data.parentId === null) data.parentId = 0
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? api.ipAddressManage.updateOpsIpGroup : api.ipAddressManage.insertOpsIpGroup
          if (this.formId) {
            data.id = this.formId
          }
          request({
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
                this.$EventBus.$emit('add-subnet-group', { setInType: 'group', setInId: data.parentId, data: res.model })
              } else {
                // 更新分组到分组
                this.$EventBus.$emit('update-subnet-group', {
                  fromType: 'group', // 修改前分组挂在那个类型下 area：区域 group：分组
                  fromPid: this.lastGroupStorage.parentId, // 修改前分组挂在的上层id 挂在区域下就是区域id，挂在分组就是分组id
                  toType: 'group', // 修改后分组挂在那个类型下
                  toPid: data.parentId, // 修改后分组挂在的上层id
                  updateId: this.formId, // 要修改的节点
                  data: res.model
                })
              }
              const allGroup = await this.findOpsIpGroup({ limit: -1 })
              this.groupData = this.$tool.listToTree(allGroup, 0, 0, 'id', 'parentId')
            }
          })
        }
      })
    },
    // 切换tab
    handleTabClick() {
      this.$EventBus.$emit('reloadData', this.$tool.guid())
    },
    // // 查询子网
    // async findOpsIpAddress(query) {
    //   const { code, data } = await request({
    //     url: api.ipAddressManage.findOpsIpAddress,
    //     data: query
    //   })
    //   if (code !== 1) return
    //   return data.length
    // },
    // 查询分组
    async findOpsIpGroup(query) {
      const { code, data } = await request({
        url: api.ipAddressManage.findOpsIpGroup,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 删除分组
    async deleteOpsIpGroup(query) {
      const { code } = await request({
        url: api.ipAddressManage.deleteOpsIpGroup,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // 查看分组
    async getOpsIpGroup(query) {
      const { code, model } = await request({
        url: api.ipAddressManage.getOpsIpGroup,
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
