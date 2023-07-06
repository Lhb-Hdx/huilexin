<template>
  <div class="Knowledge-screen">
    <!-- 搜索知识 -->
    <div v-permission="['Search']" class="bar">
      <div class="bar-input">
        <el-input v-model="searchWords" class="search" clearable placeholder="输入搜索内容" />
      </div>
      <div class="bar-search-btn">
        <el-button type="primary" @click="searchCat">查询</el-button>
      </div>
    </div>
    <div v-permission="['KeyWord']" class="search_term">
      <div class="search_title">关键字：</div>
      <div class="search_keyword">
        <div v-for="(element,index) in keywordArr.slice(0,5)" :key="index" @click="searchKey(element)">
          <div class="key">{{ element.hyKeyword }}</div>
        </div>
      </div>
      <el-divider />
      <div class="aaa">
        <el-tree
          current-node-key=""
          class="right_list"
          :data="treeData"
          :props="defaultProps"
          :expand-on-click-node="false"
          :default-expanded-keys="dataList"
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
        />
      </div>

    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'KnowledgeScreen',
  props: {
    jumpJudgment: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      searchWords: '', // 输入的关键字
      keywordArr: [], // 热门关键字列表
      hyktId: '', // 知识库类型id
      // 树形控件
      treeData: [],
      // 树节点
      defaultProps: { // 修改el-tree默认data数组参数
        children: 'children',
        label: 'catName',
        id: 'catId',
        parentId: 'parentId',
        isLeaf: false // 指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效
      },
      dataList: [0]
    }
  },
  created() {
    this.getKeyWord()
    this.loadKnowTypeData()
  },
  methods: {
    // 加载类型数据
    loadKnowTypeData() {
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.treeData = this.$tool.listToTree(res.data, 0, 0, 'catId', 'parentId')
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
    loadtreeData(resolve) { // 获取loadtreeData 就是父节点数据，getChildByList就是异步获取子节点数据
      // 查询知识类型
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', page: 1, limit: -1 }
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
        resolve(arr)
      })
    },
    getChildByList(_parentID, resolve) { // 获取子节点请求
      // 查询知识类型
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', page: this.page, limit: this.limit }
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

    handleNodeClick(element) { // 节点被点击时的回调
      if (this.jumpJudgment === 1) {
        this.$router.push({
          name: 'KnowledgeIndex',
          query: {
            hyktId: element.catId,
            searchWords: element.hyKeyword
          }
        })
      } else {
        this.hyktId = element.catId
        this.$emit('getScreenData', {
          hyktId: this.hyktId,
          searchWords: this.searchWords
        })
      }
    },

    searchKey(element) { // 关键词快捷搜索
      if (this.jumpJudgment === 1) {
        this.$router.push({
          name: 'KnowledgeIndex',
          query: {
            hyktId: this.hyktId,
            searchWords: element.hyKeyword
          }
        })
      } else {
        this.searchWords = element.hyKeyword
        this.$emit('getScreenData', {
          hyktId: this.hyktId,
          searchWords: this.searchWords
        })
      }
    },
    searchCat() { // 搜索框搜索
      if (this.jumpJudgment === 1 && this.searchWords) {
        this.$router.push({
          name: 'KnowledgeIndex',
          query: {
            hyktId: this.hyktId,
            searchWords: this.searchWords
          }
        })
      } else {
        this.getKeyWord()
        this.$emit('getScreenData', {
          hyktId: this.hyktId,
          searchWords: this.searchWords
        })
      }
    },
    getKeyWord() { // 获取热门搜索关键词
      request({
        url: api.knowledge.findHyitKeyword,
        data: { pate: this.page, limit: this.limit }
      }).then(res => {
        res.data.forEach(element => {
          this.keywordArr.push(element)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  html,body,.Knowledge-screen {
    height: 100%;
  }
.bar{
  display: flex;
  padding: 15px;
  justify-content: space-between;
  div{
    padding: 0 10px 0 0;
  }
  .bar-input {
    width: 80%;
    input {
      width: 100%;
    }
    .search {
      margin-right: 0;
      padding-right: 0;
    }
  }
  .bar-search-btn {
    width: 20%;
    padding-right: 0;
    button {
      margin-right: 0;
      width: 100%;
    }
  }
}
.search_term {
  width: 100%;
  height: 100%;
  .search_title{
    font-size: 16px;
    color: #0045AB;
    padding:10px 15px 15px;
  }
  .search_keyword{
    display: flex;
    padding: 0 0 10px 20px;
    .key{
      margin-right: 10px;
      font-size: 14px;
      //color: #0045AB;
      float: left;
      width: auto;
      cursor:pointer;
    }
  }
  .divider{
    height: 2px;
    border-top: 1px solid #ddd;
    width: 100%;
  }
  .aaa {
    height: 78%;
    overflow: auto;
  }
  .right_list{
    padding: 10px 15px;
    background-color: #e9ecf3;
    height: 100%;
    .el-tree-node {
      color: #000000;
      .el-icon-caret-right {
        padding-left: 0;
        color: #000;
      }
    }
  }
  .el-divider--horizontal {
    margin: 0 !important;
  }
}
.table{
  padding: 10px 20px;
  font-size: 16px;
  color: #000;
}
</style>
