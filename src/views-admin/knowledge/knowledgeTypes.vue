<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="addCat">新增</el-button>
      <el-input v-model="typeName" v-permission="['Search']" placeholder="请输入分类搜索关键词" class="filter-item-input filter-item" clearable @clear="searchCat" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="searchCat">搜索</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        ref="multipleTable"
        :data="tree"
        style="width: 100%;"
        row-key="catName"
        lazy
        :load="loadChildren"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="类目" prop="catName" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="备注" prop="catDesc" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="更新时间" prop="updateDate" align="right" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="操作" align="left" width="250" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['AddChildren']" size="mini" type="primary" @click="onAdd(row)">
              新增子级
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
    <el-drawer
      title="分类信息"
      :visible.sync="drawer"
      :direction="direction"
    >
      <div class="wrp">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="分类名称" prop="hyKtName">
            <el-input v-model="form.hyKtName" placeholder="分类名称" />
          </el-form-item>
          <el-form-item label="备注" prop="hyIcon">
            <el-input v-model="form.hyIcon" placeholder="备注" />
          </el-form-item>
          <el-form-item label="上级类目" prop="parentId">
            <AiTreeInput
              :key="reloadKey"
              :level-start-num="0"
              :field="{'id':'catId','name':'catName','parent':'parentId'}"
              remote="/admin/findSysCat"
              infoapi="/admin/getSysCat"
              :configuration-data="configurationData"
              placeholder="请输入上层菜单"
              :param="{systemName: 'kbms', 'classify': 'kbms_know_type', limit: -1}"
              :bind-value="form.parentId"
              @input="inputParent"
            />
          </el-form-item>
        </el-form>
        <el-button :loading="loading" type="primary" @click="saveCat">保存</el-button>
      </div>
    </el-drawer>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="query.page" :limit.sync="query.limit" @pagination="loadCat()" />
  </div>
</template>

<script>
import { listToTree } from '@/utils'
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
import ListControl from '@/components/ListControl'

export default {
  components: { Pagination, AiTreeInput, ListControl },
  data() {
    return {
      typeName: null,
      listTotal: 1,
      query: {
        page: 1,
        limit: 10
      },
      data: [],
      tree: [],
      loading: false,
      drawer: false,
      direction: 'rtl',
      catProps: {
        value: 'catId',
        label: 'catName',
        checkStrictly: true
      },
      form: {
        catId: 0,
        hyKtName: null,
        hyIcon: null,
        parentId: 0 // 自身id/名字/内容/父级id
      },
      rules: {
        hyKtName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        parentId: [{ required: true, message: '请选择上级类目', trigger: 'blur' }]
      },
      listType: true, // true树形false扁平
      reloadKey: 'reloadKey',
      configurationData: 0,
      // 显示控制数据 start
      checkList: ['类目', '备注', '更新时间', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
  },
  mounted() {
    this.loadCat(0)
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    addCat() { // 新增
      this.drawer = true
      this.form.parentId = 0
      this.form.catId = 0
      setTimeout(() => {
        this.$refs['form'].resetFields()
      }, 300)
    },
    onAdd(item) { // 新增子集
      this.drawer = true
      this.form.catId = 0
      setTimeout(() => {
        this.$refs['form'].resetFields()
        this.form.parentId = item.catId
      }, 300)
    },
    onEdit(item) { // 编辑
      this.drawer = true
      this.form.parentId = item.parentId
      this.form.catId = item.catId
      this.form.hyKtName = item.catName
      this.form.hyIcon = item.catDesc
    },
    onDelete(item) { // 删除
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', parentId: item.catId }
      }).then(res => {
        if (res.data && res.data.length > 0) return this.$message('存在子级，不能删除')
        const arr = []
        const arr1 = this.data
        for (var i = 0; i < arr1.length; i++) { arr[i] = arr1[i].hyPktId }
        const result = arr.find(ele => ele === item.hyKtId)
        if (result) return this.$message('存在子级，不能删除')
        this.$confirm('是否删除该类目？', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request({
            url: api.sys.deleteSysCat,
            data: { catId: item.catId }
          }).then(async res => {
            if (res.code === 1) {
              if (item.parentId !== 0 && item.parentId !== '') {
                const getCat = await this.getSysCat({ catId: item.parentId })
                const childrenStates = this.$refs.multipleTable.store.states.lazyTreeNodeMap[getCat.catName]
                const childrenStatesIndex = childrenStates.findIndex(childrenStatesItem => Number(childrenStatesItem.catId) === Number(item.catId))
                this.$refs.multipleTable.store.states.lazyTreeNodeMap[getCat.catName].splice(childrenStatesIndex, 1)
              } else {
                this.loadCat(0)
              }
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      })
    },
    saveCat() { // 新增、编辑判断
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          let url = null
          const data = { systemName: 'kbms', classify: 'kbms_know_type', catName: this.form.hyKtName, parentId: this.form.parentId, catDesc: this.form.hyIcon }
          if (this.form.catId === 0) {
            url = api.sys.insertSysCat
          } else if (this.form.catId >= 0) {
            url = api.sys.updateSysCat
            data.catId = this.form.catId
          }
          if (this.form.parentId !== 0 && this.form.parentId.length > 0) {
            data.parentId = this.form.parentId[this.form.parentId.length - 1]
          }
          if (url) {
            request({
              url: url,
              data: { systemName: 'kbms', classify: 'kbms_know_type', ...data }
            }).then(async res => {
              if (res.code === 1) {
                this.loading = false
                this.drawer = false
                this.query.page = 1
                this.data = []
                if (data.parentId !== 0 && data.parentId !== '') {
                  const getCat = await this.getSysCat({ catId: data.parentId })
                  console.log(data.parentId, getCat)
                  if (this.$refs.multipleTable.store.states.lazyTreeNodeMap[getCat.catName]) {
                    this.$refs.multipleTable.store.states.lazyTreeNodeMap[getCat.catName].push({...res.model, hasChildren: true})
                  } else {
                    window.location.reload()
                  }
                } else {
                  this.searchCat(0)
                }
                this.$notify({
                  title: '温馨提示',
                  message: res.msg,
                  type: 'success',
                  duration: 2000
                })
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
              }
            })
          }
        }
      })
    },
    searchCat() { // 搜索
      this.listType = !this.typeName
      this.query.page = 1
      this.data = []
      this.loadCat(this.typeName ? '' : 0)
    },
    loadCat(parentId) { // 列表
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', page: this.query.page, limit: this.query.limit, catName: this.typeName, parentId: parentId }
      }).then(res => {
        res.data.forEach(item => {
          item.hasChildren = true
        })
        this.listTotal = Number(res.count)
        console.log(this.listType)
        if (this.listType === false) {
          this.tree = res.data
          return
        }
        this.tree = listToTree(res.data, 0, 0, 'catId', 'parentId')
        console.log(this.tree, res.data)
      })
    },
    // 展开加载子级菜单
    loadChildren(tree, treeNode, resolve) {
      console.log(tree, treeNode, resolve)
      request({
        url: api.sys.findSysCat,
        data: {
          systemName: 'kbms',
          classify: 'kbms_know_type',
          page: this.query.page,
          limit: this.query.limit,
          catName: this.typeName,
          parentId: tree.catId
        }
      }).then(res => {
        res.data.forEach(item => {
          item.hasChildren = true
        })
        resolve(res.data)
      })
    },
    inputParent(val) {
      this.$set(this.form, 'parentId', val)
    },
    async getSysCat(query) {
      const { code, model } = await request({
        url: api.sys.getSysCat,
        data: query
      })
      if (code !== 1) return
      return model
    }
  }
}
</script>
<style lang="scss" scoped>
.wrp{
    padding: 20px;
    >div.el-input,>div.el-cascader{padding: 5px 20px;}
}
.bar{display: flex;margin-bottom: 20px;}
.typeName{width: 250px;}
</style>
