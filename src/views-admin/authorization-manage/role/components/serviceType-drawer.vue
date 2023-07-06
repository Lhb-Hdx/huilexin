<template>
  <el-drawer title="服务类型授权" direction="rtl" :visible.sync="drawerServeTypedialog">
    <div class="drawer-coutaner">

      <el-tree
        ref="drawerServeType"
        :data="ServeTypeMenuList"
        :props="ServeTypeMenuProps"
        :show-checkbox="true"
        node-key="serviceId"
        :default-checked-keys="ServeTypeCheckedData"
        :default-expanded-keys="menuExpandedData"
        :check-on-click-node="false"
        :expand-on-click-node="false"
        check-strictly
        @check-change="ServeTypeCheckedChange"
        @check="repetitionHandle"
      >
        <span slot-scope="{ node, }" class="custom-tree-node">
          <span>{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
    <div class="demo-drawer__footer">
      <el-button @click="cancelForm">取 消</el-button>
      <el-button type="primary" :loading="drawerServeTypeloading" @click="submitServeType">{{ drawerServeTypeloading ? '保存中 ...' : '保 存' }}</el-button>
    </div>
  </el-drawer>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import { listToTree } from '@/utils'

export default {
  name: 'ServiceTypeDrawer',
  components: { },
  data() {
    return {
      drawerServeTypedialog: false,
      drawerServeTypeloading: false,
      ServeTypeCheckedStatus: false,
      ServeTypeIDS: [],
      selectRowDatat: [],
      ServeTypeMenuList: [],
      ServeTypeCheckedData: [],
      ServeTypeMenuProps: {
        children: 'children',
        label: 'serviceName'
      }
    }
  },
  methods: {
    open(row) {
      this.drawerServeTypedialog = true
      this.selectRowDatat = row
      this.onServeType(row)
    },
    // 获取服务类型
    createlistToTree(data, pid, level, fieldId = 'id', fieldPId = 'parentId') {
      const tree = []
      data.forEach(item => {
        if (item[fieldPId] === pid) {
          item.level = level
          item.expand = false
          item.children = listToTree(data, item[fieldId], level + 1, fieldId, fieldPId)
          tree.push(item)
        }
      })
      return tree
    },
    onServeType(row) {
      // 获取服务类型
      request({ url: api.opm.findOpsOrderProblemService, data: { limit: -1 } })
        .then(res => {
          if (res.code === 1 && res.data.length > 0) {
            this.ServeTypeMenuList = this.createlistToTree(res.data, -1, 0, 'serviceId', 'pid')
          }
        })

      // 获取关联类型
      request({ url: api.sys.findSysRoleService, data: { roleId: row.roleId, limit: -1 } })
        .then(res => {
          if (res.code === 1 && res.data.length > 0) {
            const brr = []
            res.data.map(i => {
              brr.push(i.serviceId)
            })
            this.ServeTypeCheckedData = brr
          }
        })
    },

    // 选择服务类型授权|节点选中状态发生变化时的回调
    ServeTypeCheckedChange(data, checked) {
      this.ServeTypeCheckedStatus = checked
      if (checked) {
        // 选择子类型时默认选择父类
        if (data.pid !== -1) {
          this.$refs.drawerServeType.setChecked(data.pid, true)
        }
      } else {
        // 取消父类默认取消子类
        let parentID = null
        if (data.pid === -1) {
          data.children.map(item => {
            this.$refs.drawerServeType.setChecked(item.serviceId, false)
          })
        } else {
          parentID = data.pid
        }

        const nowAllarry = this.$refs.drawerServeType.getCheckedNodes()
        if (nowAllarry.length > 0 && parentID) {
          nowAllarry.map(itemN => {
            let nowChildren = []
            // 当前选择类型的父类ID | 以及它父类中子类数组的实际长度
            let nowChildrenLength = null
            if (parentID === itemN.serviceId) {
              nowChildren = itemN?.children
              nowChildrenLength = itemN?.children.length
            }

            // 取消勾选的子类型数组长度
            let unchareLenth = []
            if (nowChildren) {
              nowChildren.map(itemC => {
                const idx = nowAllarry.findIndex(s => s.serviceId === itemC.serviceId)
                if (idx === -1) {
                  unchareLenth.push(idx)
                }
              })
            }

            // 取消父类型的所以子类型时，父类也型默认取消 |
            if (+unchareLenth.length === +nowChildrenLength && parentID) {
              if (+unchareLenth.length !== 0 && +nowChildrenLength !== 0) {
                this.$refs.drawerServeType.setChecked(parentID, false)
              }
            }
          })
        }
      }
    },
    // 选择服务类型|当复选框被点击的时候触发
    repetitionHandle(nodeData) {
      const node = this.$refs.drawerServeType.getNode(nodeData)
      setTimeout(() => {
        this.serveTypeChildNodesChange(node)
      }, 1)
    },
    // 选择父类型时默认选择子类型
    serveTypeChildNodesChange(node) {
      const len = node.childNodes.length
      for (let i = 0; i < len; i++) {
        node.childNodes[i].checked = this.ServeTypeCheckedStatus
        this.serveTypeChildNodesChange(node.childNodes[i])
      }
    },
    // 获取所有被选中节点所组成的数组
    getCheckedNodes() {
      const serviceIdsArry = []
      const arr = this.$refs.drawerServeType.getCheckedNodes()
      arr.forEach(item => {
        serviceIdsArry.push(item.serviceId)
      })
      return serviceIdsArry
    },
    // 按钮--取消
    cancelForm() {
      this.drawerServeTypedialog = false
      this.drawerServeTypeloading = false
    },
    // 按钮--保存
    // 接口在每次新增数据前，都会先删掉之前的关联，然后根据新的关联重新插入数据库
    // 所以每次需要提供勾选的全部 serviceIds
    submitServeType() {
      this.drawerServeTypeloading = true
      const serviceIds = this.getCheckedNodes()
      const roleId = this.selectRowDatat.roleId
      request({ url: api.sys.batchInsertSysRoleService, data: { roleId, serviceIds } })
        .then(res => {
          if (res.code === 1) {
            this.$notify({ title: '温馨提示', message: '保存成功', type: 'success', duration: 2000 })
          }
        }).finally(() => {
          this.drawerServeTypedialog = false
          this.drawerServeTypeloading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-coutaner{
  padding: 10px;
}
.demo-drawer__footer{
  background-color: #f8f8f8;
  width: 100%;
  padding: 10px;
  position: fixed;
  bottom: 0;
  z-index: 99;
  &:hover{
    box-shadow:  0 2px 10px 0 rgba(0, 0, 0, 0.35);
  }
}
</style>
