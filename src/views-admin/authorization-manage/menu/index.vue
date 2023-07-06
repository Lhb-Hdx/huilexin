<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>

      <el-select v-model="sysMenuListQuery.classify" clearable class="filter-item">
        <el-option
          v-for="(item,index) in menuType"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input v-model="sysMenuListQuery.keyword" v-permission="['Search']" placeholder="请输入菜单名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="sysMenuList"
        style="width: 100%"
        row-key="menuId"
        border
        lazy
        :load="loadChildren"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" prop="menuName" label="菜单名" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" prop="sort" label="排序" width="50" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" prop="menuUrl" label="菜单地址" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" prop="component" label="组件" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" prop="icon" label="菜单图标" width="120" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" prop="menuType" label="菜单类型" width="80" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ setMenuType(scope.row.menuType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" prop="coding" label="菜单标识" width="200" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" prop="classify" label="类型" width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ setType(scope.row.classify) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" prop="status" label="显示/隐藏" width="100">
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
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="操作" width="180">
          <template slot-scope="row">
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
    <pagination v-show="sysLevelOneListTotal > 0" :auto-scroll="false" :total="sysLevelOneListTotal" :page.sync="sysMenuListQuery.page" :limit.sync="sysMenuListQuery.limit" @pagination="loadSysMenuList" />
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { getUserSession } from '@/utils/auth'
import ListControl from '@/components/ListControl'

export default {
  name: 'SysMenuIndex',
  components: { Pagination, ListControl },
  data() {
    return {
      listLoading: false,
      sysMenuList: [],
      sysLevelOneListTotal: 0,
      sysMenuListQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        parentId: '',
        appId: '',
        menuType: '',
        classify: 'pc',
        version: 1
      },
      sysMenuListTotal: 10,
      menuType: this.$defineData.getSysMenuType(),
      // 显示控制数据 start
      checkList: ['菜单名', '排序', '菜单地址', '组件', '菜单图标', '菜单类型', '菜单标识', '类型', '显示/隐藏', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setType() {
      return function(classify) {
        const idx = this.menuType.findIndex(item => item.value === classify)
        return idx !== -1 ? this.menuType[idx].label : ''
      }
    },
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
          case 'unify':
            return '事件菜单'
          default:
            return ''
        }
      }
    },
    setMenuSwitchStatus() {
      return function(status) {
        return status === 1
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
    this.$set(this.sysMenuListQuery, 'appId', getUserSession().appId)
    this.loadSysMenuList()
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
        name: 'AddSysMenu'
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
        name: 'UpdateSysMenu',
        query: {
          id: val.row.menuId
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
          url: api.sysMenu.deleteSysMenu, data: { menuId: val.row.menuId }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.loadSysMenuList()
          }
        })
      })
    },
    // 搜索
    onFilter() {
      this.loadSysMenuList()
    },
    // 加载菜单
    loadSysMenuList() {
      if (this.sysMenuListQuery.keyword !== '') {
        delete this.sysMenuListQuery.parentId
      } else {
        this.$set(this.sysMenuListQuery, 'parentId', 1)
      }
      this.$set(this.sysMenuListQuery, 'menuType', 'menu,button,module,tabbar,unify')
      this.loadListRequest(this.sysMenuListQuery, res => {
        res.data.forEach(item => {
          if (item.menuType && item.menuType === 'unify' && item.menuUrl) {
            var json = JSON.parse(item.menuUrl)
            item.menuUrl = 'appkey:' + json.appkey + '|unify_suite:' + json.unify_suite
          }
          item.hasChildren = true
        })
        this.sysMenuList = res.data
        console.log(this.sysMenuList)
        this.sysLevelOneListTotal = Number(res.count)
      })
    },
    // 展开加载子级菜单
    loadChildren(tree, treeNode, resolve) {
      const query = {
        appId: getUserSession().appId,
        parentId: tree.menuId,
        menuType: 'menu,button,tabbar,module,unify',
        limit: -1
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
        url: api.sysMenu.findSysMenu, data: query
      }).then(res => {
        if (res.code === 1) {
          callback(res)
        }
      })
    },
    changeMenuStatus(val) {
      val.status = val.status === 1 ? 0 : 1
      val.appId = getUserSession().appId
      request({
        url: '/admin/updateSysMenu', data: val
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="scss"  scoped>

</style>
