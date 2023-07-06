<template>
  <div class="h-100 flexBox">
    <div class="sideMenu">
      <div class="camera-menu">
        <div class="group-items">
          <div class="active">
            <div class="chn-search">
              <el-input
                v-model="classifyTreeListQuery.name"
                v-permission="['SearchConfigItemClassify']"
                size="mini"
                placeholder="关键字查询"
                suffix-icon="el-icon-search"
                @keyup.enter.native="findCmdbItemType"
              />
            </div>
            <div ref="orgTree" class="menu-container">
              <ConfigTreeList :org-tree-list="classifyTreeList" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ref="listContent" class="list-content"><div id="container" /></div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import ConfigTreeList from './components/config-tree-list/config-tree-list'
import G6 from '@antv/g6'

export default {
  name: 'CmdbConfig',
  components: {
    ConfigTreeList
  },
  data() {
    return {
      classifyTreeList: [],
      classifyTreeListQuery: {
        page: 1,
        limit: -1,
        name: ''
      },
      handlerClickItem: {},
      cmdbGraph: null,
      containerHeight: 0, // 画布高度
      containerWidth: 0, // 画布高度
      cmdbMapData: []
    }
  },
  mounted() {
    this.containerHeight = this.$refs.listContent.clientHeight
    this.containerWidth = this.$refs.listContent.clientWidth
    this.findCmdbItemType()
    // this.initCmdb()
  },
  methods: {
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: this.classifyTreeListQuery
      }).then(res => {
        if (res.code === 1) {
          const systemDefine = []
          const userDefine = []
          const treeData = listToTree(res.data, 0, 0, 'id', 'parentId')
          treeData.forEach(item => {
            if (item.userDefine === 0) {
              systemDefine.push(item)
            } else {
              userDefine.push(item)
            }
          })
          this.classifyTreeList = systemDefine.concat(userDefine)
          this.handlerClickItem = this.classifyTreeList[0]
        }
      })
    },
    initCmdb() {
      this.graph = new G6.Graph({
        container: 'cmdbMap',
        width: this.containerWidth,
        height: this.containerHeight,
        defaultEdge: { // 线条默认配置
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: { // 节点默认配置
          size: [40, 40]
        },
        modes: { // 模式
          default: ['drag-canvas', 'drag-node'],
          altSelect: [{ type: 'brush-select', trigger: 'drag' }, 'drag-node']
        },
        animate: true
      })
      this.graph.data(this.cmdbMapData)
      this.graph.render()
      this.graph.fitView()
    }
  }
}
</script>

<style lang="scss" scoped>
$h:0px;
.sideMenu {
  width: 240px;
  background: #e9ecf3;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  overflow: auto;

  .group-items{
    padding-top: $h;z-index:99;width:100%;

    .active{
      width:100%;
      position: relative;

      .chn-search{
        top:0;
        left:0;
        right:0;
        background: #e9ecf3;
        margin: 10px;
      }

      .menu-container {
        width: 100%;
        padding-left:11px;
        padding-right:11px;
      }
    }
  }
}

.list-content {
  width: calc(100% - 240px);
  margin: 10px;
}
</style>
