<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['AddClassify']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreateClassify">新增类别</el-button>
      <el-button v-permission="['EditClassify']" class="filter-item" type="primary" icon="el-icon-edit" @click="onEditClassify">编辑类别</el-button>
      <el-button v-permission="['DeleteClassify']" class="filter-item" type="danger" icon="el-icon-delete" @click="onDeleteClassify">删除类别</el-button>
      <el-button v-permission="['AddClassifyAttr']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreateCat(false)">新增类别属性</el-button>
    </div>

    <div v-loading="listLoading" class="table-wrapper">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4" label-width="100px">
          <div class="sideMenu">
            <div class="menu-content">
              <!-- <div
              v-for="item in classifyList"
              :key="item.catId"
              class="menu-content-item pointer"
              :class="activeDeviceType === item.catId ? 'active' : ''"
              @click="changeClassify(item.catId)"
            >{{ item.catName }}
            </div> :load="loadNode"-->
              <el-tree
                current-node-key=""
                class="right_list"
                :data="leftTreeData"
                :props="defaultProps"
                :expand-on-click-node="false"
                :default-expanded-keys="dataList"
                node-key="id"
                @node-click="handleNodeClick"
              />
            </div>
          </div>

        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="20" :xl="20" label-width="100px">
          <el-table
            class="selectRight"
            :data="treeData"
            row-key="catId"
            default-expand-all
            fit
            highlight-current-row
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            style="width: 100%;"
          >
            <el-table-column label="名称" prop="catName" align="left" />
            <el-table-column label="属性标识" prop="code" align="left" />
            <el-table-column label="操作" align="left" width="250" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-button v-permission="['AddChildren']" size="mini" type="primary" @click="onCreateCat(row)">
                  新增子级
                </el-button>
                <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEditCat(row)">
                  编辑
                </el-button>
                <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDeleteCat(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

    </div>
    <el-drawer
      title="新增类别"
      :visible.sync="showClassify"
      :direction="direction"
    >
      <div class="wrp">
        <el-input v-model="classifyForm.catName" placeholder="类别名称" />
        <!-- <div class="select-box">
          <el-select v-model="classifyForm.module" placeholder="数据类型" clearable class="filter-item" style="width: 50%">
            <el-option v-for="item in categoryData" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div> -->
        <div class="select-box">
          <!-- <el-select v-model="classifyForm.parentId" placeholder="所属类别" clearable class="filter-item" style="width: 50%">
            <el-option v-for="item in classifyList" :key="item.catId" :label="item.catName" :value="item.catId" />
          </el-select> -->
          <el-cascader
            v-model="classifyForm.parentId"
            clearable
            class="filter-item w-100"
            multiple="false"
            :options="leftTreeData"
            :props="portProps"
            :show-all-levels="false"
            filterable
          />
        </div>
        <el-button :loading="loading" type="primary" cal @click="saveClassify">保存</el-button>
      </div>
    </el-drawer>
    <el-drawer
      :title="classifyAttrTitle"
      :visible.sync="showCat"
      :direction="direction"
    >
      <div class="wrp">
        <el-input v-model="sysCatForm.catName" placeholder="类别属性名称" />
        <el-input v-model="sysCatForm.code" placeholder="类别属性标识" />
        <el-cascader
          v-model="sysCatForm.parentId"
          :options="treeData"
          :props="catProps"
        />
        <div>
          <el-button :loading="loading" type="primary" @click="saveCat">保存</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'

export default {
  name: 'BasicCat',
  data() {
    return {
      loading: false,
      selectClassifyId: '',
      direction: 'rtl',
      listLoading: false,
      classifyCatQuery: {
        page: 1,
        limit: -1,
        systemName: 'userDefine',
        classify: '',
        module: 2
      },
      showClassify: false,
      classifyForm: {
        systemName: 'userDefine',
        classify: '',
        catName: '',
        parentId: null,
        module: 1
      },
      sysCatForm: {
        systemName: 'userDefine',
        classify: '',
        catName: '',
        parentId: '',
        code: '',
        module: 2 // 基础数据类别2，分类类别1
      },
      activeDeviceType: '', // 用于点击改变颜色
      classifyStr: 'userDefine_', // 类别字符串前缀
      classifyList: [],
      showCat: false,
      treeData: [],
      catProps: {
        value: 'catId',
        label: 'catName',
        checkStrictly: true
      },
      portProps: { emitPath: false, label: 'catName', value: 'catId', checkStrictly: true },
      classifyAttrTitle: '新增类别属性',
      categoryData: [
        { label: '分类类别', value: 1 },
        { label: '基础数据类别', value: 2 }
      ],
      leftTreeData: [],
      defaultProps: { // 修改el-tree默认data数组参数
        children: 'children',
        label: 'catName',
        id: 'catId',
        parentId: 'parentId',
        isLeaf: false // 指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效
      },
      dataList: [0],
      classifydata: []
    }
  },
  mounted() {
    this.loadClassifyList(true)
    this.loadKnowTypeData()
    this.findAllCat()
  },
  methods: {
    // 加载类型数据
    loadKnowTypeData() {
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'userDefine', classify: 'userDefine_', page: 1, limit: -1, module: 1}
      }).then(res => {
        if (res.code === 1) {
          this.leftTreeData = this.$tool.listToTree(res.data, 0, 0, 'catId', 'parentId')
        }
      })
    },
    // 树形控件
    loadNode(node, resolve) { // 加载 树数据
      const that = this
      if (node.level === 0) {
        that.loadtreeData(resolve)
      }
      if (node.level >= 1) {
        this.getChildByList(node.data.id, resolve)
        return resolve([]) // 加上这个，防止在该节点没有子节点时一直转圈的问题发生。
      }
    },
    handleNodeClick(element) { // 节点被点击时的回调
      this.changeClassify(element.catId)
    },
    loadtreeData(resolve) { // 获取loadtreeData 就是父节点数据，getChildByList就是异步获取子节点数据
      // 查询知识类型
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'userDefine', classify: 'userDefine_', page: 1, limit: -1, parentId: 0 }
      }).then(res => {
        const data = res.data
        const arr = [
          {
            id: 0,
            name: '目录',
            isLeaf: true,
            parentId: '-1',
            children: []
          }
        ]
        for (var i = 0; i < data.length; i++) {
          if (data[i].parentId === 0) {
            arr[0].children.push(data[i])
          }
        }
        // 前者item.参数名称为 prop中的规定的属性名称
        arr[0].children.forEach(item => {
          item.id = item.catId
          item.name = item.catName
          item.isLeaf = true
        })
        console.log(arr)
        resolve(arr)
      })
    },
    getChildByList(_parentID, resolve) { // 获取子节点请求
      // 查询知识类型
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'userDefine', classify: 'userDefine_', page: 1, limit: -1, parentId: _parentID, module: 1 }
      }).then(res => {
        const data = res.data
        const arr = []
        for (var i = 0; i < data.length; i++) {
          if (data[i].parentId === _parentID) {
            arr.push(data[i])
          }
        }
        arr.forEach(item => {
          item.id = item.catId
          item.name = item.catName
          item.isLeaf = false
        })
        resolve(arr)
      })
    },
    // 打开添加类别
    onCreateClassify() {
      this.resetClassifyForm()
      delete this.classifyForm.catId
      this.showClassify = true
    },
    // 打开编辑类别
    onEditClassify() {
      if (this.selectClassifyId) {
        const classify = this.idFindClassify(this.selectClassifyId)
        console.log(classify)
        this.showClassify = true
        this.$set(this.classifyForm, 'catName', classify.catName)
        this.$set(this.classifyForm, 'catId', classify.catId)
        classify.parentId > 0 ? this.$set(this.classifyForm, 'parentId', Number(classify.parentId)) : this.$set(this.classifyForm, 'parentId', '')
        this.$set(this.classifyForm, 'module', Number(classify.module))
      } else {
        this.$message.warning('请选择类别')
      }
    },
    // 删除类别
    onDeleteClassify() {
      if (this.selectClassifyId) {
        if (this.treeData.length > 0) {
          this.$message('存在子级，不能删除')
        } else {
          this.$confirm('确认删除吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.deleteSysCat({
              catId: this.selectClassifyId
            }, true)
          })
        }
      } else {
        this.$message.warning('请选择类别')
      }
    },
    // 打开添加类别属性
    onCreateCat(row) {
      this.resetCatForm()
      if (this.selectClassifyId) {
        delete this.sysCatForm.catId
        if (row) {
          this.$set(this.sysCatForm, 'classify', row.classify)
          this.$set(this.sysCatForm, 'parentId', row.catId)
        } else {
          this.$set(this.sysCatForm, 'parentId', this.selectClassifyId)
        }
        this.showCat = true
      } else {
        this.$message.warning('请选择类别')
      }
    },
    // 打开编辑类别属性
    onEditCat(row) {
      this.$set(this.sysCatForm, 'catId', row.catId)
      this.$set(this.sysCatForm, 'catName', row.catName)
      this.$set(this.sysCatForm, 'classify', row.classify)
      this.$set(this.sysCatForm, 'parentId', row.parentId)
      this.$set(this.sysCatForm, 'code', row.code)
      this.showCat = true
      this.classifyAttrTitle = '编辑类别属性'
    },
    // 删除属性
    onDeleteCat(row) {
      if (row.children.length > 0) {
        this.$message('存在子级，不能删除')
      } else {
        this.$confirm('确认删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteSysCat({
            catId: row.catId
          })
        })
      }
    },
    // 保存类别
    saveClassify() {
      const data = { ...this.classifyForm, module: 1}
      data.classify = `${this.classifyStr}${data.catName}`
      this.loading = true
      if (data.catId) {
        this.updateSysCat({
          catId: data.catId,
          catName: data.catName,
          code: data.code,
          module: data.module,
          parentId: data.parentId ? data.parentId : 0
        })
      } else {
        this.insertSysCat(data)
      }
      this.loading = false
    },
    // 保存类别属性
    saveCat() {
      const data = { ...this.sysCatForm, module: 2}
      console.log(data)
      if (data.parentId.length) {
        data.parentId = data.parentId[data.parentId.length - 1]
      }
      if (data.catId) {
        this.updateSysCat(data)
      } else {
        this.insertSysCat(data)
      }
    },
    // 加载类别下拉框
    loadClassifyList(initSelect) {
      this.findSysCat({
        page: 1,
        limit: -1,
        systemName: 'userDefine',
        classify: this.classifyStr,
        parentId: 0
      }).then(res => {
        this.classifyList = res
        if (initSelect) this.activeDeviceType = this.classifyList[0].catId
        if (res.length > 0) {
          if (this.selectClassifyId === '') {
            this.selectClassifyId = res[0].catId
            this.$set(this.classifyCatQuery, 'classify', res[0].classify)
            this.$set(this.classifyCatQuery, 'parentId', -1)
            this.classifyId = res[0].catId
          }
          this.loadClassifyCatList(this.classifyCatQuery)
          console.log(this.classifyCatQuery)
        }
      })
    },
    // 选择类别
    changeClassify(val) {
      console.log(val)
      if (val) {
        this.selectClassifyId = val
        this.activeDeviceType = val
        const classify = this.idFindClassify(val)
        this.$set(this.classifyCatQuery, 'classify', classify.classify)
        this.$set(this.classifyForm, 'classify', classify.classify)
        this.$set(this.classifyCatQuery, 'parentId', -1)
        this.loadClassifyCatList(this.classifyCatQuery)
      }
    },
    // id查询分类
    idFindClassify(catId) {
      const idx = this.classifydata.findIndex(item => item.catId === catId)
      if (idx !== -1) {
        return this.classifydata[idx]
      }
    },
    // 获取分类属性
    loadClassifyCatList(data) {
      this.$set(this.sysCatForm, 'classify', data.classify)
      this.$set(this.sysCatForm, 'parentId', data.parentId)
      this.findSysCat(data).then(res => {
        this.treeData = listToTree(res, this.selectClassifyId, this.selectClassifyId, 'catId', 'parentId')
        console.log(this.treeData)
        // 数据类型==================================
        // for (let i = 0; i < this.treeData.length; i++) {
        //   this.treeData[i].category = this.idFindClassify(this.selectClassifyId).catName
        // }
      })
    },
    // 获取类别属性列表
    async findSysCat(data) {
      return await request({
        url: api.sys.findSysCat,
        data
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          return res.data
        }
      })
    },
    // 插入类别属性
    insertSysCat(data) {
      request({
        url: api.sys.insertSysCat,
        data
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.loadClassifyList()
          this.findAllCat()
          this.loadKnowTypeData()
          this.showClassify = false
          this.showCat = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 删除类别属性
    deleteSysCat(data, isDelClassify) {
      request({
        url: api.sys.deleteSysCat,
        data
      }).then(res => {
        if (res.code === 1) {
          if (isDelClassify) {
            this.selectClassifyId = ''
          }
          this.loadClassifyList()
          this.loadKnowTypeData()
          this.findAllCat()
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 编辑类别属性
    updateSysCat(data) {
      request({
        url: api.sys.updateSysCat,
        data
      }).then(res => {
        if (res.code === 1) {
          this.loadClassifyList()
          this.findAllCat()
          this.loadKnowTypeData()
          this.$message.success(res.msg)
          this.showClassify = false
          this.showCat = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    resetClassifyForm() {
      // console.log(Object.keys(this.classifyForm))
      Object.keys(this.classifyForm).forEach(key => {
        if (key !== 'systemName' && key !== 'classify') {
          this.classifyForm[key] = ''
        }
      })
    },
    resetCatForm() {
      Object.keys(this.sysCatForm).forEach(key => {
        if (key !== 'systemName' && key !== 'classify') {
          this.sysCatForm[key] = ''
        }
      })
    },
    findAllCat() {
      this.findSysCat({
        page: 1,
        limit: -1,
        systemName: 'userDefine',
        classify: this.classifyStr
      }).then(res => {
        this.classifydata = res
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrp{
  padding: 20px;
  .el-input, .el-cascader {
    padding: 0 0 10px 0;
  }
}
.selectLeft {
  float: left;
}
.selectRight {
  float: right;
}
.sideMenu {
  // width: 240px;
  background: #e9ecf3;
  height: 750px;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  overflow: auto;
  .menu-content {
    .menu-content-item {
      padding: 0 10px;
    }
    .active {
      background: #bbcbe5;
      color: #000;
      position: relative;
      &:after {
        content: "";
        width: 16px;
        height: 16px;
        position: absolute;
        top: 12px;
        right: -9px;
        background: #f5f5f5;
        transform: rotate(45deg);
        box-shadow: inset 0 1px 2px 1px #d7d6d6;
      }
    }

  }
}
.list-content {
  width: calc(100% - 240px);
  margin: 10px;
}
.select-box {
  margin-bottom: 10px;
}
</style>
