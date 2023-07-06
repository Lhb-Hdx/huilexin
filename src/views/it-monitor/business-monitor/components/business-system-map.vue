<template>
  <div ref="configContentMain" class="config-content-main">
    <div id="topoMap" />
    <div v-if="itemHostTooltip" class="g6-component-tooltip host-tooltip" :style="{ left: itemHost.left + 'px', top: itemHost.top + 'px' }">
      <div class="host-name margin-bottom-10">{{ itemHost.label }}</div>
      <div class="host-ip margin-bottom-10">{{ itemHost.ip }}</div>
      <div class="host-address margin-bottom-7"><span class="item-name">端口：</span>{{ itemHost.port }}</div>
      <div class="host-address margin-bottom-7"><span class="item-name">端口监测端口：</span>{{ itemHost.checkPort === 1 ? '是' : '否' }}</div>
      <div class="host-address margin-bottom-7"><span class="item-name">CPU使用：</span>{{ itemHost.cpu }}%</div>
      <div class="host-address"><span class="item-name">端口状态：</span><span :class="itemHost.portStatue === 1 ? 'success' : 'danger'">{{ setPortStatus(itemHost.portStatue) }}</span></div>
    </div>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'BusinessSystemMap',
  props: {
    systemId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      topoMapData: {},
      containerHeight: 0,
      topoGraph: null,
      itemHostTooltip: false,
      itemHost: {}
    }
  },
  computed: {
    setPortStatus() {
      return function(value) {
        if (value === 0) return '断开'
        if (value === 1) return '正常'
        if (value === 2) return '未检测'
      }
    }
  },
  watch: {
    systemId(oldVal, newVal) {
      if (oldVal && !newVal) {
        this.createMapData()
      }
      if (oldVal && newVal) {
        if (newVal && (oldVal !== newVal)) {
          if (this.topoGraph) this.topoGraph.destroy()
          this.createMapData()
        }
      }
    }
  },
  mounted() {
    this.containerHeight = this.$refs.configContentMain.clientHeight - 15
    if (this.systemId) this.createMapData()
  },
  methods: {
    // 获取节点
    async findBsTopItem() {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.findBsTopItem, data: { page: 1, limit: -1, systemId: this.systemId }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 查询节点连线关系
    async findBsTopItemLink() {
      return new Promise(resolve => {
        request({ url: api.bsTopSystem.findBsTopItemLink, data: { page: 1, limit: -1, systemId: this.systemId }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 创建拓扑图数据
    async createMapData() {
      // 1、获取节点
      const topoItemResult = await this.findBsTopItem() || []
      const topoItem = []
      const errorNode = []
      topoItemResult.forEach(item => {
        if (item.portStatue !== 1) {
          errorNode.push(item)
        }
        item.id = String(item.id)
        topoItem.push({
          id: item.id,
          x: item.x,
          y: item.y,
          size: [item.width, item.height],
          label: item.itemName,
          hostId: item.hostId,
          hyZhostId: item.hyZhostId,
          type: 'image',
          labelCfg: { position: 'bottom' },
          img: item.imageUrl,
          ip: item.ip,
          port: item.port,
          checkPort: item.checkPort,
          cpu: item.cpu ? item.cpu.toFixed(2) : 0,
          portStatue: item.portStatue
        })
      })
      this.$set(this.topoMapData, 'nodes', topoItem)
      // 2、获取节点链路
      this.topoLineItems = await this.findBsTopItemLink() || []
      const edges = []
      this.topoLineItems.forEach(item => {
        item.id = String(item.id)
        const topoLineGraph = {
          id: `edge-${item.id}`,
          source: String(item.sourceItemId),
          target: String(item.targetItemId)
        }
        const haveErrorNode = errorNode.findIndex(haveErrorNodeItem => Number(haveErrorNodeItem.id) === Number(item.sourceItemId) || Number(haveErrorNodeItem.id) === Number(item.targetItemId))
        if (haveErrorNode !== -1) {
          topoLineGraph.style = {
            stroke: '#ff0000',
            borderType: 'solid'
          }
        }
        edges.push(topoLineGraph)
      })
      this.$set(this.topoMapData, 'edges', edges)
      await this.initMap()
      this.topoGraph.fitView()
    },
    // 初始化topo图
    initMap() {
      const that = this
      // 实例化元素配置
      this.topoGraph = new G6.Graph({
        container: 'topoMap', // 视图区域DOM
        width: this.$refs.configContentMain.clientWidth,
        height: this.containerHeight,
        defaultEdge: { // 线条默认配置
          color: '#00b285',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: { // 节点默认配置
          size: [40, 40]
        },
        modes: { // 模式
          default: ['drag-canvas', 'zoom-canvas']
        },
        animate: true // 开启动画过渡
      })

      // 点击元素节点
      this.topoGraph.on('node:click', function(evt) {
        console.log(evt.item._cfg.model)
      })

      // 移入元素节点
      this.topoGraph.on('node:mouseenter', function(evt) {
        that.itemHostTooltip = true
        that.itemHost = { ...evt.item._cfg.model, left: evt.canvasX, top: evt.canvasY }
      })

      // 移除元素节点
      this.topoGraph.on('node:mouseout', function() {
        that.itemHostTooltip = false
      })

      // 点击画布
      this.topoGraph.on('canvas:click', function() {
        that.portTooltip = false
        that.itemHostTooltip = false
        clearInterval(that.getMonitorDataInterval)
      })

      // 拖拽画布结束
      this.topoGraph.on('canvas:dragend', function(evt) {
        that.portTooltip = false
        that.itemHostTooltip = false
      })

      this.topoGraph.data(this.topoMapData)
      G6.Util.processParallelEdges(this.topoMapData.edges) // 多边渲染
      this.topoGraph.render()
    }
  }
}
</script>
<style lang="scss" scoped>
.config-content-main {
  position: relative;
  .tooltip-group, .host-tooltip {
    position: absolute;
  }
  .g6-component-tooltip {
    display: inline-block;
    visibility: visible;
    font-size: 14px;
    .host-name {
      color: #0045AB;
    }
    .host-ip {
      color: #878787;
    }
    .item-name{
      display: inline-block;
      width: 100px !important;
  }
  }
  .topo-position-setting {
    position: absolute;
    right: 20px;
    top: 20px;
    .line-type-map {
      width: 200px;
      border: 1px solid #e0e0e0;
      background: #FFFFFF;
      .map-title {
        font-size: 14px;
        padding: 10px;
        border-bottom: 1px solid #e0e0e0;
      }
      .map-main {
        padding: 10px 10px 0 10px;
        .map-item {
          font-size: 14px;
          .item-line {
            width: 50%;
          }
        }
      }
    }
  }
}
</style>
