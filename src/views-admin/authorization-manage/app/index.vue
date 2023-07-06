<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <el-input v-model="sysMenuListQuery.keyword" v-permission="['Search']" placeholder="请输入APP名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="sysAppList"
        style="width: 100%"
        row-key="appId"
        lazy
        :load="loadChildren"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" prop="appId" label="APPID" width="120" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" prop="appName" label="APP名称" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" prop="appDesc" label="描述" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
              v-permission="['StatusSwitch']"
              :value="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="changeMenuStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="操作" width="250">
          <template slot-scope="row">
            <el-button v-permission="['AccreditFunction']" size="mini" type="primary" @click="onMenuRole(row)">
              功能授权
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="sysLevelOneListTotal > 0" :auto-scroll="false" :total="sysLevelOneListTotal" :page.sync="sysMenuListQuery.page" :limit.sync="sysMenuListQuery.limit" @pagination="loadSysAppList" />
    <el-drawer
      title="功能菜单"
      :visible.sync="drawerMenuBox"
      direction="rtl"
      class="drawer-menu-box"
    >
      <div class="menu-box">
        <el-select v-model="menuClassify" class="ml-24 mb-14" @change="changeMenuType">
          <el-option
            v-for="(item,index) in menuListType"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-tree
          ref="treeMenu"
          :data="menuData"
          :show-checkbox="true"
          node-key="menuId"
          :default-expanded-keys="menuExpandedData"
          :default-checked-keys="menuCheckedData"
          :props="menuProps"
          :check-on-click-node="true"
          check-strictly
          @check-change="checkChange"
          @check="handleNode"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span style="margin-left: 10px">
              <el-tag size="mini">{{ setMenuType(data.menuType) }}</el-tag>
            </span>
          </span>
        </el-tree>
        <div class="drawer-menu-btn">
          <el-button :loading="SubmitLoading" @click="saveMenuCheckedKeys">保存</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { listToTree } from '@/utils'
import ListControl from '@/components/ListControl'

export default {
  name: 'SysAppIndex',
  components: { Pagination, ListControl },
  data() {
    return {
      listLoading: false,
      sysAppList: [],
      sysLevelOneListTotal: 0,
      sysMenuListQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        parentId: ''
      },
      inputParentId: 1,
      drawerMenuBox: false,
      menuData: [],
      menuExpandedData: [],
      menuCheckedData: [],
      menuProps: {
        children: 'children',
        label: 'menuName'
      },
      appId: '',
      checkStatus: false,
      SubmitLoading: false,
      menuListType: this.$defineData.getSysMenuType(),
      menuClassify: 'pc',
      handlerApp: {},
      // 显示控制数据 start
      checkList: ['APPID', 'APP名称', '描述', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setMenuType() {
      return function(key) {
        switch (key) {
          case 'menu':
            return '菜单'
          case 'button':
            return '按钮'
          case 'module':
            return '模块'
          case 'tabbar':
            return '导航栏'
          default:
            return ''
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.sysMenuListQuery = pageQuery
    }
  },
  mounted() {
    this.loadSysAppList()
    this.loadMenuData()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 进入创建
    onCreate() {
      // 记录跳转前的页数
      const data = { ...this.sysMenuListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'AddSysApp'
      })
    },
    // 进入编辑
    onEdit(val) {
      // 记录跳转前的页数
      const data = { ...this.sysMenuListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'UpdateSysApp',
        query: {
          id: val.row.appId
        }
      })
    },
    // 删除
    onDelete(val) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.sysApp.deleteSysApp, data: { appId: val.row.appId }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.loadSysAppList()
          }
        })
      })
    },
    // 搜索
    onFilter() {
      this.loadSysAppList()
    },
    // 加载菜单
    loadSysAppList() {
      if (this.sysMenuListQuery.keyword !== '') {
        delete this.sysMenuListQuery.parentId
      } else {
        this.$set(this.sysMenuListQuery, 'parentId', 0)
      }
      this.loadListRequest(this.sysMenuListQuery, res => {
        res.data.forEach(item => {
          item.hasChildren = true
        })
        this.sysAppList = res.data
        this.sysLevelOneListTotal = Number(res.count)
      })
    },
    // 展开加载子级菜单
    loadChildren(tree, treeNode, resolve) {
      const query = {
        parentId: tree.appId
      }
      this.loadListRequest(query, res => {
        res.data.forEach(item => {
          item.hasChildren = true
        })
        resolve(res.data)
      })
    },
    // 获取菜单
    loadListRequest(query, callback) {
      request({
        url: api.sysApp.findSysApp, data: query
      }).then(res => {
        if (res.code === 1) {
          callback(res)
        }
      })
    },
    // 修改状态
    changeMenuStatus(val) {
      val.status = val.status === 1 ? 0 : 1
      request({
        url: '/admin/updateSysApp', data: val
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        }
      })
    },
    loadMenuData() {
      request({
        url: api.sys.findSysMenu, data: {
          page: 1,
          limit: -1,
          appId: this.appId,
          menuType: 'module,data,menu,relation,button,tabbar,unify',
          parentId: 0,
          classify: this.menuClassify,
          version: 1
        }
      }).then(res => {
        this.menuData = listToTree(res.data, 1, 0, 'menuId', 'parentId')
      })
    },
    onMenuRole(val) {
      this.drawerMenuBox = true
      this.appId = val.row.appId
      this.menuCheckedData = []
      this.menuData = []
      // 重新读取当前角色对应的菜单
      this.loadMenuData()
      this.findSysAppMenu()
    },
    saveMenuCheckedKeys() {
      this.SubmitLoading = true
      const menuIds = this.$refs.treeMenu.getCheckedKeys().join(',')
      request({
        url: api.sys.updateSysAppMenu, data: { appId: this.appId, menuIds: menuIds, classify: this.menuClassify, version: 1 }
      }).then((res) => {
        this.SubmitLoading = false
        if (res.code === 1) {
          this.$notify({
            title: '温馨提示',
            message: '保存成功',
            type: 'success',
            duration: 2000
          })
        }
        this.drawerMenuBox = false
      })
    },
    checkChange(a, b, c) {
      this.checkStatus = b
      // 如果为取消
      if (b === false) {
        // 如果当前节点有子集
        if (a.children) {
          // 循环子集将他们的选中取消
          a.children.map(item => {
            this.$refs.treeMenu.setChecked(item.menuId, false)
          })
        }
      } else {
        // 否则(为选中状态)
        // 判断父节点id是否为空
        if (a.parentId !== 0) {
          // 如果不为空则将其选中
          this.$refs.treeMenu.setChecked(a.parentId, true)
        }
      }
    },
    handleNode(nodeData) {
      const node = this.$refs.treeMenu.getNode(nodeData) // 获取节点node数据
      setTimeout(() => {
        this.childNodesChange(node)
      }, 1)
    },
    childNodesChange(node) {
      const len = node.childNodes.length
      for (let i = 0; i < len; i++) {
        node.childNodes[i].checked = this.checkStatus
        this.childNodesChange(node.childNodes[i])
      }
    },
    changeMenuType() {
      this.loadMenuData()
      this.findSysAppMenu()
    },
    findSysAppMenu() {
      request({
        url: api.sys.findSysAppMenu, data: { appId: this.appId, classify: this.menuClassify, version: 1 }
      }).then(res => {
        if (res.data.length > 0) {
          const menuCheckedData = []
          const menuIds = res.data[0].menuIds.split(',')
          menuIds.forEach(item => {
            menuCheckedData.push(item)
          })
          this.menuCheckedData = menuCheckedData
        }
      })
    }
  }
}
</script>

<style lang="scss"  scoped>

</style>
