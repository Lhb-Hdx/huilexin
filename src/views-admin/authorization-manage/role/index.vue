<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">
        新增
      </el-button>
      <el-select v-model="findQuery.companyId" v-permission="['SelectSysCompany']" class="filter-item" placeholder="请选择公司">
        <el-option
          v-for="item in companyList"
          :key="item.companyId"
          :label="item.companyName"
          :value="item.companyId"
        />
      </el-select>
      <el-input v-model="findQuery.keyword" v-permission="['Search']" placeholder="请输入角色名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">
        查询
      </el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="roleData"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="角色名称" prop="roleName" align="left">
          <template slot-scope="{row}">
            <span>{{ row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="角色类型" align="left">
          <template slot-scope="{row}">
            <span>{{ setRoleType(row.classify) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="备注" prop="roleDesc" align="left">
          <template slot-scope="{row}">
            <span>{{ row.roleDesc }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="状态" prop="roleDesc" align="left">
          <template slot-scope="{row}">
            <span v-if="row.status == 1">可用</span>
            <span v-if="row.status == 0">停用</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="操作" align="left" width="580" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
            <el-button v-permission="['AccreditFunction']" size="mini" type="primary" @click="onMenuRole(row)">
              功能授权
            </el-button>
            <!-- <el-button v-permission="['AccreditScript']" size="mini" type="primary" @click="onScriptAuth(row)">
              脚本授权
            </el-button> -->
            <el-button v-permission="['Authorization']" size="mini" type="primary" @click="onAuthorization(row.roleId)">
              项目授权
            </el-button>
            <el-button v-permission="['AccreditDevice']" size="mini" type="primary" @click="onDeviceAuthorization(row.roleId)">
              设备授权
            </el-button>
            <el-button v-permission="['ServeType']" size="mini" type="primary" @click="onServeType(row)">
              服务类型授权
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      background
      :current-page.sync="findQuery.page"
      :page-size="findQuery.limit"
      layout="total, prev, pager, next, jumper"
      :total="total"
      class="mt-10"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 各授权模块 -->
    <el-drawer title="功能菜单" :visible.sync="drawerMenuBox" direction="rtl" class="drawer-menu-box">
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
          :check-on-click-node="false"
          :expand-on-click-node="false"
          check-strictly
          @check-change="checkChange"
          @check="handleNode"
        >
          <span :key="reloadTemplate" slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span v-if="data.parentId === 1 && node.checked">
              <el-button class="reset-mini-button margin-left-10" size="mini" :type="setMenuLayout(data.menuId) === 1 ? 'success' : ''" @click.prevent="handleMenuLayout(data.menuId, 1)">纵向</el-button>
              <el-button class="reset-mini-button" size="mini" :type="setMenuLayout(data.menuId) === 2 ? 'success' : ''" @click.prevent="handleMenuLayout(data.menuId, 2)">横向</el-button>
            </span>
            <span style="margin-left: 10px">
              <el-tag size="mini">{{ setMenuType(data.menuType) }}</el-tag>
            </span>
          </span>
        </el-tree>
        <div class="drawer-menu-btn">
          <el-button :loading="submitLoading" @click="saveMenuCheckedKeys">保存</el-button>
        </div>
      </div>
    </el-drawer>
    <el-dialog title="授权脚本" :visible.sync="showAuthDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <div class="filter-container">
          <el-button v-permission="['AddAccreditScript']" class="filter-item" type="primary" @click="onAddAccreditScript">新增授权</el-button>
          <el-button v-permission="['BatchCancelAccreditScriptButton']" class="filter-item" type="primary" @click="onBatchCancelAccreditScript">批量取消授权</el-button>
        </div>
        <div v-loading="listLoading" class="table-wrapper">
          <check-select-table
            v-if="showAuthDialog"
            :table-data="roleScriptData"
            row-key="id"
            @selectData="handlerSelectData"
          >
            <el-table-column label="白名单名称" prop="scriptName" />
            <el-table-column label="脚本" prop="script" />
            <el-table-column label="操作" width="250" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-button v-permission="['CancelAccreditScriptButton']" size="mini" type="danger" @click="onCancelAccreditScript(row)">
                  取消授权
                </el-button>
              </template>
            </el-table-column>
          </check-select-table>
        </div>
        <el-pagination
          background
          :current-page.sync="roleScriptWhiteListQuery.page"
          :page-size="roleScriptWhiteListQuery.limit"
          layout="total, prev, pager, next, jumper"
          :total="roleScriptWhiteListQuery.total"
          class="mt-10"
          @size-change="handleRoleScriptSizeChange"
          @current-change="handleRoleScriptCurrentChange"
        />
      </div>
    </el-dialog>
    <el-dialog title="新增授权" :visible.sync="showAdduthDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <div class="filter-container">
          <el-button v-permission="['BatchAccreditScriptButton']" class="filter-item" type="primary" icon="el-icon-plus" @click="onBatchAddAccreditScript">批量授权</el-button>
          <el-input v-model="findScriptQuery.name" v-permission="['SearchScriptWhite']" placeholder="请输入白名单名称" style="width: 200px;" class="filter-item" />
          <el-button v-permission="['SearchScriptWhite']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilterScript">查询</el-button>
        </div>
        <div v-loading="listLoading" class="table-wrapper">
          <check-select-table
            v-if="showAdduthDialog"
            :table-data="scriptData"
            row-key="id"
            @selectData="handlerSelectScriptData"
          >
            <el-table-column label="白名单名称" prop="name" />
            <el-table-column label="脚本" prop="script" />
            <el-table-column label="操作" width="250" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-button v-permission="['AccreditScriptButton']" size="mini" type="primary" @click="onAccreditScript(row)">
                  授权
                </el-button>
              </template>
            </el-table-column>
          </check-select-table>
        </div>
        <el-pagination
          background
          :current-page.sync="findScriptQuery.page"
          :page-size="findScriptQuery.limit"
          layout="total, prev, pager, next, jumper"
          :total="findScriptQuery.total"
          class="mt-10"
          @size-change="handleRoleScriptSizeChange"
          @current-change="handleRoleScriptCurrentChange"
        />
      </div>
    </el-dialog>
    <!-- 项目授权 -->
    <el-dialog title="项目授权" :visible.sync="addVideoDvrModal" top="5vh">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>已授权网关</span>
        </div>
        <div>
          <span v-for="(item,index) in agentListSee" :key="index" class="agent">
            <el-tag>{{ item }}</el-tag>
          </span>
        </div>

      </el-card>
      <el-table
        ref="table"
        :data="authorizationDialog"
        fit
        highlight-current-row
        :row-key="getRowKeys"
        @selection-change="selectionListChange"
      >
        <el-table-column type="selection" reserve-selection width="55" />
        <el-table-column label="LOGO" prop="imgUrl" align="center" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-image
              style="width: 40px; height: 40px"
              :src="row.imgUrl"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="网关名称" prop="name">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="backup">
          <template slot-scope="{row}">
            <span>{{ row.backup }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotalDialog>0" :auto-scroll="false" :total="listTotalDialog" :page.sync="listQueryDialog.page" :limit.sync="listQueryDialog.limit" @pagination="findHyitAgent" />

      <div slot="footer" class="dialog-footer">
        <el-button @click="addVideoDvrModal = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="onRelation()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 服务类型授权 -->
    <ServiceTypeDrawer ref="ServiceTypeDrawer" />

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import { getUserSession } from '@/utils/auth'
import { guid } from '@/utils/utils'
import CheckSelectTable from '@/components/Table/CheckSelectTable'
import Pagination from '@/components/Pagination'
import ServiceTypeDrawer from './components/serviceType-drawer'
import ListControl from '@/components/ListControl'

export default {
  name: 'Role',
  components: { CheckSelectTable, Pagination, ServiceTypeDrawer, ListControl},
  data() {
    return {
      loading: false,
      listLoading: false,
      drawerMenuBox: false,
      drawerAppBox: false,
      drawerServeTypedialog: false,
      drawerServeTypeloading: false,
      menuData: [],
      menuExpandedData: [],
      menuCheckedData: [],
      menuProps: {
        children: 'children',
        label: 'menuName'
      },
      findQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        companyId: ''
      },
      listQueryDialog: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      roleInfo: [],
      roleId: null,
      roleData: [],
      total: 0,
      appData: [],
      tableData: [],
      appCheckedData: [],
      appExpandedData: [],
      getRoleApp: [],
      companyList: [],
      companyId: '',
      handleRoleAppId: '', // 当前点击的角色的appid
      handleRoleAppMenuIds: '', // 当前点击的角色的应用分配的菜单id
      checkStatus: false,
      submitLoading: false,

      addVideoDvrModal: false,
      listTotalDialog: 0,
      authorizationDialog: [],
      userRoleId: 0,
      selectionListChangeValue: '',
      findAuthorizedList: [],
      HyitList: [],
      agentListSee: [],

      firstLevelMenu: [],
      reloadTemplate: '',
      menuCheckedLayoutData: [],
      roleScriptWhiteListQuery: {
        page: 1,
        limit: 10,
        total: 0
      },
      showAuthDialog: false,
      roleScriptWhiteList: [],
      roleScriptData: [],
      multipleSelectionAll: [],
      selectData: [],
      showAdduthDialog: false,
      scriptData: [],
      findScriptQuery: {
        name: '',
        page: 1,
        limit: 10,
        total: 0
      },
      menuListType: this.$defineData.getSysMenuType(),
      menuClassify: 'pc',
      roleTypes: this.$paramsModel.common.get('roleTypes'),
      // 显示控制数据 start
      checkList: ['角色名称', '角色类型', '备注', '状态', '操作'],
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
          default:
            return ''
        }
      }
    },
    setMenuLayout() {
      const that = this
      return function(menuId) {
        const idx = that.firstLevelMenu.findIndex(item => item.menuId === menuId)
        if (idx !== -1) {
          return that.firstLevelMenu[idx].layout
        }
      }
    },
    // 显示授权按钮
    showAccreditScriptButton() {
      return function(id) {
        const idx = this.roleScriptData.findIndex(item => Number(id) === item.scriptWhiteId)
        return idx === -1
      }
    },
    // 显示取消授权按钮
    showCancelAccreditScriptButton() {
      return function(id) {
        const idx = this.roleScriptData.findIndex(item => Number(id) === item.scriptWhiteId)
        return idx !== -1
      }
    },
    // 设置角色类型
    setRoleType() {
      return function(classify) {
        const idx = this.roleTypes.findIndex(item => item.value === classify)
        return idx !== -1 ? this.roleTypes[idx].label : ''
      }
    }
  },
  created() {
    this.roleInfo = this.localStorageOperation('get', 'roleInfo')
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.findQuery = pageQuery
    }
  },
  mounted() {
    this.findQuery.companyId = getUserSession().companyId
    this.loadMenuData()
    this.loadData()
    this.findSysCompany()
    this.findAllHyitAgent()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },

    // 服务类型授权
    onServeType(row) {
      this.$refs.ServiceTypeDrawer.open(row)
    },

    // 获取行键
    getRowKeys(row) {
      return row.id
    },
    // 项目授权按钮
    onAuthorization(val) {
      this.roleId = val
      this.addVideoDvrModal = true
      this.userRoleId = val
      this.findAuthorized(val)
      this.findHyitAgent()
    },
    // 选框
    selectionListChange(val) {
      this.selectionListChangeValue = val
    },
    // 网关分组信息
    findHyitAgent() {
      request({
        url: api.itAgentGroup.findHyitAgentGroup,
        data: { page: this.listQueryDialog.page, limit: this.listQueryDialog.limit, keyword: this.listQueryDialog.keyword }
      }).then(res => {
        if (res.code === 1) {
          this.authorizationDialog = res.data
          this.listTotalDialog = Number(res.count)
          this.$nextTick(() => {
            this.initTableSelection()
          })
        }
      })
    },
    initTableSelection() {
      this.$nextTick(() => {
        for (let i = 0; i < this.authorizationDialog.length; i++) {
          const tableEle = this.authorizationDialog[i]
          for (let j = 0; j < this.findAuthorizedList.length; j++) {
            const ele = this.findAuthorizedList[j]
            if (tableEle.id === ele.groupId) {
              this.$refs['table'].toggleRowSelection(tableEle, true)
            }
          }
        }
      })
    },
    // 全部网关分组信息
    findAllHyitAgent() {
      request({
        url: api.itAgentGroup.findHyitAgentGroup,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.HyitList = res.data
        }
      })
    },
    // 查询已授权网关
    findAuthorized(val) {
      this.findAuthorizedList = []
      request({
        url: api.itAgentGroup.findHyitAgentGroupAuth,
        data: {
          page: 1,
          limit: -1,
          roleId: val
        }
      }).then(res => {
        if (res.code === 1) {
          this.findAuthorizedList = res.data
          let seeList = []
          for (let i = 0; i < res.data.length; i++) {
            let val = res.data[i].groupId
            for (let j = 0; j < this.HyitList.length; j++) {
              let num = this.HyitList[j].id
              if (val === num) {
                seeList.push(this.HyitList[j].name)
              }
            }
          }
          this.agentListSee = seeList
        }
      })
    },
    // 确定按钮
    onRelation() {
      if (this.roleInfo[0].roleId === this.roleId) {
        this.$message({
          message: '不可更改所属角色项目',
          type: 'error'
        })
      } else {
        this.loading = true
        request({
          url: api.itAgentGroup.deleteHyitAgentGroupAuthByRoleId,
          data: {
            roleId: this.userRoleId
          }
        }).then(res => {
          this.selectionListChangeValue.forEach(item => {
            request({
              url: api.itAgentGroup.insertHyitAgentGroupAuth,
              data: {
                roleId: this.userRoleId,
                groupId: item.id
              }
            }).then(res => {
              if (res.code === 1) {
                this.$message({
                  message: '授权成功',
                  type: 'success'
                })
                this.addVideoDvrModal = false
              } else {
                this.$message({
                  message: '授权失败',
                  type: 'error'
                })
              }
            })
          })
          this.loading = false
          this.addVideoDvrModal = false
        })
      }
    },
    loadMenuData(appId, menuIds) {
      request({
        url: api.sys.findSysMenu, data: {
          page: this.page,
          limit: -1,
          appId,
          ids: menuIds,
          menuType: 'module,data,menu,relation,button,tabbar,unify',
          parentId: 0,
          classify: this.menuClassify,
          version: 1
        }
      }).then(res => {
        res.data.forEach(item => {
          if (item.parentId === 1) {
            this.$set(this.firstLevelMenu, this.firstLevelMenu.length, {
              menuId: item.menuId
            })
          }
        })
        this.menuData = listToTree(res.data, 1, 0, 'menuId', 'parentId')
      })
    },
    loadData() {
      this.listLoading = true
      request({
        url: api.sys.findSysRole,
        data: this.findQuery
      }).then(res => {
        this.roleData = res.data || []
        this.total = parseInt(res.count)
      })
    },
    onFilter() {
      this.loadData()
    },
    handleSizeChange(val) {
      this.findQuery.limit = val
    },
    handleCurrentChange(val) {
      this.findQuery.page = val
      this.loadData()
    },
    onCreate() {
      // 记录跳转前的页数
      const data = { ...this.findQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'RoleCreate'
      })
    },
    onEdit(row) {
      // 记录跳转前的页数
      const data = { ...this.findQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'RoleUpdate',
        query: {
          id: row.roleId || 0
        }
      })
    },
    onDelete(row) {
      this.$confirm('确定删除该角色?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        request({
          url: api.sys.deleteSysRole, data: { roleId: row.roleId }
        }).then(res => {
          if (res.code === 1) {
            this.loadData()
            this.$notify({
              title: '删除成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          }
        })
      })
    },
    onMenuRole(row) {
      this.drawerMenuBox = true
      this.roleId = row.roleId
      this.companyId = row.companyId
      this.getRoleMenuData()
    },
    findSysAppMenu(appId, callback) {
      request({
        url: api.sys.findSysAppMenu, data: { appId, classify: this.menuClassify, version: 1 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          callback(res.data[0].menuIds)
        }
      })
    },
    getSysAppCompany(companyId, callback) {
      request({
        url: api.sys.getSysAppCompany, data: { companyId }
      }).then(res => {
        if (res.code === 1) {
          callback(res.model.appId)
        }
      })
    },
    saveMenuCheckedKeys() {
      this.submitLoading = true
      const menuIds = this.$refs.treeMenu.getCheckedKeys()
      const layout = []
      menuIds.forEach(item => {
        const idx = this.firstLevelMenu.findIndex(items => items.menuId === item)
        if (idx !== -1) {
          if (this.firstLevelMenu[idx].layout) {
            layout.push(this.firstLevelMenu[idx].layout)
          } else {
            layout.push(1)
          }
        } else {
          layout.push(1)
        }
      })
      request({
        url: api.sys.menuRoleBatchSave,
        data: {
          roleId: this.roleId,
          menuIds: menuIds.join(','),
          layout: layout.join(','),
          appId: this.handleRoleAppId,
          classify: this.menuClassify,
          version: 1
        }
      }).then((res) => {
        this.submitLoading = false
        if (res.code === 1) {
          this.$notify({
            title: '温馨提示',
            message: '保存成功',
            type: 'success',
            duration: 2000
          })
          this.drawerMenuBox = false
        }
      })
    },
    checkChange(a, b, c) {
      this.reloadTemplate = guid()
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
        if (a.parentId === 1) {
          const idx = this.firstLevelMenu.findIndex(items => items.menuId === a.menuId)
          delete this.firstLevelMenu[idx].layout
        }
      } else {
        // 否则(为选中状态)
        // 判断父节点id是否为空
        if (a.parentId !== 0) {
          // 如果不为空则将其选中
          if (a.parentId === 1) {
            const idx = this.firstLevelMenu.findIndex(items => items.menuId === a.menuId)
            if (idx !== -1) {
              this.$set(this.firstLevelMenu[idx], 'layout', 1)
            }
          }
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
    findSysCompany() {
      request({
        url: api.company.findSysCompany, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.companyList = res.data
        }
      })
    },
    handleMenuLayout(menuId, val) {
      const idx = this.firstLevelMenu.findIndex(items => items.menuId === menuId)
      if (idx !== -1) {
        this.$set(this.firstLevelMenu[idx], 'layout', val)
      }
    },
    onScriptAuth(row) {
      this.selectData = []
      this.roleId = row.roleId
      this.showAuthDialog = true
      // this.findHyitOpsScriptWhiteList()
      this.findHyitOpsRoleScriptWhite()
    },
    handleRoleScriptSizeChange(val) {
      this.roleScriptWhiteListQuery.limit = val
    },
    handleRoleScriptCurrentChange(val) {
      this.roleScriptWhiteListQuery.page = val
      this.findHyitOpsRoleScriptWhite()
    },
    // 查询白名单脚本
    async findHyitOpsScriptWhiteList(data) {
      return new Promise(resolve => {
        request({
          url: api.automationOperations.findHyitOpsScriptWhiteList, data
        }).then(res => {
          if (res.code === 1) {
            resolve(res.data)
          }
        })
      })
    },
    // 查询角色授权脚本
    async findHyitOpsRoleScriptWhite() {
      request({
        url: api.automationOperations.findHyitOpsRoleScriptWhite, data: { ...this.roleScriptWhiteListQuery, roleId: this.roleId }
      }).then(async res => {
        this.listLoading = false
        if (res.code === 1) {
          const ids = []
          const multipleSelectionAll = []
          res.data.forEach(item => {
            ids.push(item.scriptWhiteId)
            multipleSelectionAll.push({
              id: item.scriptWhiteId
            })
          })
          this.multipleSelectionAll = multipleSelectionAll
          const findHyitOpsScriptWhiteList = await this.findHyitOpsScriptWhiteList({ page: 1, limit: -1, ids: ids.toString() })
          if (findHyitOpsScriptWhiteList) {
            res.data.forEach(item => {
              const getRoleScript = this.$tool.findDataItemByAttr(findHyitOpsScriptWhiteList, 'id', item.scriptWhiteId)
              item.scriptName = getRoleScript.name
              item.script = getRoleScript.script
            })
          }
          this.roleScriptData = res.data
          this.roleScriptWhiteListQuery.total = Number(res.count)
        }
      })
    },
    onAccreditScript(row) {
      this.$confirm('确认授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submirAccreditScript(api.automationOperations.insertHyitOpsRoleScriptWhite, {
          roleId: this.roleId,
          scriptWhiteId: row.id
        }, '授权成功', '授权失败')
      })
    },
    onCancelAccreditScript(row) {
      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submirAccreditScript(api.automationOperations.deleteHyitOpsRoleScriptWhite, {
          id: row.id
        }, '取消授权成功', '取消授权失败')
      })
    },
    onBatchCancelAccreditScript() {
      if (this.selectData.length === 0) return this.$message('请选择白名单')
      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const jsonData = []
        this.selectData.forEach(item => {
          jsonData.push({
            roleId: String(item.roleId),
            scriptWhiteId: String(item.scriptWhiteId)
          })
        })
        this.submirAccreditScript(api.automationOperations.deleteHyitOpsRoleScriptWhite2, {
          json: JSON.stringify(jsonData)
        }, '取消授权成功', '取消授权失败')
      })
    },
    // 提交授权
    submirAccreditScript(api, data, successMsg, errMsg) {
      request({
        url: api, data
      }).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: successMsg
          })
          this.findHyitOpsRoleScriptWhite()
          this.findHyitOpsScriptWhiteListUnauthByRoleId()
        } else {
          this.$message({
            type: 'error',
            message: errMsg
          })
        }
      })
    },
    // 多选要删除的脚本
    handlerSelectData(val) {
      this.selectData = val
    },
    // 多选要授权的脚本
    handlerSelectScriptData(val) {
      this.selectData = val
    },
    // 查询角色未授权的白名单
    findHyitOpsScriptWhiteListUnauthByRoleId() {
      request({
        url: api.automationOperations.findHyitOpsScriptWhiteListUnauthByRoleId, data: {
          ...this.findScriptQuery,
          roleId: this.roleId
        }
      }).then(res => {
        if (res.code === 1) {
          this.scriptData = res.data
        }
      })
    },
    // 打开新增设授权弹窗
    onAddAccreditScript() {
      this.selectData = []
      this.showAdduthDialog = true
      this.findHyitOpsScriptWhiteListUnauthByRoleId()
    },
    // 点击批量授权脚本
    onBatchAddAccreditScript() {
      if (this.selectData.length === 0) return this.$message('请选择白名单')
      this.$confirm('确认授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const jsonData = []
        this.selectData.forEach(item => {
          jsonData.push({
            roleId: String(this.roleId),
            scriptWhiteId: String(item.id)
          })
        })
        this.submirAccreditScript(api.automationOperations.insertHyitOpsRoleScriptWhite2, {
          json: JSON.stringify(jsonData)
        }, '授权成功', '授权失败')
      })
    },
    // 点击查询脚本
    onFilterScript() {
      this.findScriptQuery.page = 1
      this.findHyitOpsScriptWhiteListUnauthByRoleId()
    },
    changeMenuType() {
      this.getRoleMenuData()
    },
    onDeviceAuthorization(roleId) {
      this.$router.push({
        name: 'DeviceAuthIndex',
        query: {
          roleId,
          companyId: this.findQuery.companyId
        }
      })
    },
    getRoleMenuData() {
      this.menuCheckedData = []
      this.menuData = []
      // 重新读取当前角色对应的菜单
      const that = this
      this.getSysAppCompany(this.companyId, getCompanyAppIdRes => {
        this.handleRoleAppId = getCompanyAppIdRes
        this.findSysAppMenu(getCompanyAppIdRes, getAppMenuIdsRes => {
          this.handleRoleAppMenuIds = getAppMenuIdsRes
          this.loadMenuData(getCompanyAppIdRes, getAppMenuIdsRes)
        })
        request({
          url: api.sys.menuRoleData, data: { roleId: this.roleId, appId: getCompanyAppIdRes, classify: this.menuClassify, version: 1 }
        }).then(res => {
          const menuCheckedData = []
          const menuCheckedLayoutData = []
          res.data.forEach(item => {
            menuCheckedData.push(item.menuId)
            const idx = this.firstLevelMenu.findIndex(items => items.menuId === item.menuId)
            if (idx !== -1) {
              this.$set(this.firstLevelMenu[idx], 'layout', item.layout)
            }
          })
          that.menuCheckedData = menuCheckedData
          that.menuCheckedLayoutData = menuCheckedLayoutData
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.drawer-menu-box .el-drawer__body{overflow-y: scroll;height: 100%;}
.drawer-menu-btn {
  margin: 10px 20px;
}
.agent {
  margin: 0 10px;
}

</style>
