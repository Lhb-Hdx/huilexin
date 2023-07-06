<template>
  <div class="full-main">
    <div v-if="list.length === 0" class="none-topo-list">
      <el-alert
        class="none-topo-alert"
        title="暂无拓扑"
        type="info"
        description=""
        show-icon
        center
        :closable="false"
      />
    </div>
    <template v-else>
      <div class="full-left">
        <div class="full-left-header">
          <div class="full-left-header-title">拓扑列表</div>
          <div class="full-left-header-right-icon" />
        </div>
        <TopoList :topo-list="list" @handlerTopo="handlerTopo" />
      </div>
      <div ref="configContentMain" class="full-right">
        <div ref="topoHeader" class="topo-header">
          <div class="topo-header-left">
            <strong> {{ topoInfo.name }}</strong>
            <div class="status-item">
              <div class="status-item-title">状态：</div>
              <span :class="topoInfo.statues === 1 ? 'success' : 'danger'">{{ topoInfo.statues === 1 ? "启用" : "禁用" }}</span>
            </div>
          </div>
          <div class="topo-header-static">
            <div class="static-item">
              <div class="static-item-title">设备概况：</div>
              <div class="font-bold">
                {{ topoStatic.itemCount }} / <span class="danger">{{ topoStatic.itemOfflineCount }}</span>
              </div>
            </div>
            <div class="static-item">
              <div class="static-item-title">业务链路：</div>
              <div class="font-bold">
                {{ topoStatic.itemLinkCount }} / <span class="danger">{{ topoStatic.itemLinkOffCount }}</span>
              </div>
            </div>
          </div>
        </div>
        <TopoMap
          ref="topoMapComponent"
          mode="preview"
          :topo-info="topoInfo"
          :map-config="mapConfig"
          :map-combos="mapCombos"
          :map-edges="mapEdges"
          :map-nodes="mapNodes"
          :map-grid-bg="false"
        />
        <TopoConnectLineType
          :style="{ top: topoHeaderTop + 20 + 'px', left: 10 + 'px' }"
          :style-options="{
            border: '1px solid #e0e0e0',
            background: '#FFFFFF',
          }"
          @downloadTopoMap="monitorDownloadTopoMap"
        />
        <TopoMiniMap
          class="topo-mini-map"
          :style="{
            top: topoHeaderTop + 20 + 'px'
          }"
        />
      </div>
    </template>
  </div>
</template>

<script>
import TopoList from '../Components/TopoList'
import request from '@/utils/request'
import api from '@/api/api'
import { isJSONString } from '@/utils/utils'
import TopoMap from '@/components/Topo/Components/TopoMap'
import TopoConnectLineType from '@/components/Topo/Components/TopoConnectLineType'
import '../Styles/TopoPreview.scss'
import TopoMiniMap from '@/components/Topo/Components/TopoMiniMap'

export default {
  name: 'TopoPreview',
  components: { TopoList, TopoMap, TopoConnectLineType, TopoMiniMap },
  data() {
    return {
      containerHeight: '',
      portTooltipPosition: {},
      topoInfo: {},
      topoStatic: {
        itemLinkCount: 0,
        itemOfflineCount: 0,
        itemCount: 0,
        itemLinkOffCount: 0
      },
      topoHeaderTop: 0,
      list: [],
      mapConfig: {
        height: 0,
        width: 0
      },
      mapCombos: [],
      mapEdges: [],
      mapNodes: []
    }
  },
  computed: {
    setHostStatus() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return count === 1 ? '在线' : '离线'
      }
    },
    setHostStataTag() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return count === 1 ? 'success' : 'info'
      }
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    }
  },
  async mounted() {
    this.loadTopoList()
    this.agentGetTopStatic()
  },
  methods: {
    // 捕获子组件选择拓扑事件
    async handlerTopo(val) {
      this.$refs.topoMapComponent.closeHostDetail()
      this.topoInfo = val
      this.topoHeaderTop = this.$refs.topoHeader.scrollTop + this.$refs.topoHeader.clientHeight
      this.containerHeight = this.$refs.configContentMain.clientHeight - (30 + this.topoHeaderTop)
      this.mapConfig = {
        width: this.$refs.configContentMain.clientWidth,
        height: this.containerHeight
      }
      this.mapCombos = (await this.findHyitTopologyItemGroup(val)) || []
      this.mapNodes = (await this.findHyitTopologyItem(val)) || []
      this.mapEdges = (await this.findHyitTopologyItemLink(val)) || []
      setTimeout(async() => {
        // 调用拓扑组件生成数据
        await this.$refs.topoMapComponent.generateData()
        // 调用拓扑组件初始化拓扑图
        this.$refs.topoMapComponent.initMap()
      }, 100)
    },
    // 获取拓扑节点
    async findHyitTopologyItem(val) {
      return new Promise((resolve) => {
        request({
          url: api.itMonitor.findHyitTopologyItem,
          data: { page: 1, limit: -1, topId: val.id }
        }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 查询节点链路关系
    async findHyitTopologyItemLink(val) {
      return new Promise((resolve) => {
        request({
          url: api.itMonitor.findHyitTopologyItemLink,
          data: { page: 1, limit: -1, topId: val.id }
        }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 获取拓扑节点分组
    async findHyitTopologyItemGroup(data) {
      return new Promise((resolve) => {
        request({
          url: api.itMonitor.findHyitTopologyItemGroup,
          data: { topId: data.id }
        }).then((res) => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 导入拓扑图
    downloadTopoMap() {
      this.topoGraph.downloadFullImage(`${this.topoInfo.name}网络拓扑图`, 'image/png', { backgroundColor: '#ddd', padding: [30, 30, 30, 30] })
    },
    // 链路情况
    agentGetTopStatic() {
      request({
        url: api.itMonitor.agentGetTopStatic,
        data: { topId: this.topoInfo.id }
      }).then((res) => {
        if (res.code === 1 && res.model) {
          if (isJSONString(res.model)) this.topoStatic = JSON.parse(res.model)
        }
      })
    },
    // 获取拓扑列表
    loadTopoList() {
      request({
        url: api.itMonitor.findHyitTopologyInfo,
        data: {
          ...this.findHyitTopologyInfoQuery,
          agentGroupId: this.agentGroupId
        }
      }).then((res) => {
        this.listLoading = false
        if (res.code === 1) {
          this.list = res.data
          if (res.data.length > 0) {
            setTimeout(() => {
              this.topoHeaderTop = this.$refs.topoHeader.scrollTop + this.$refs.topoHeader.clientHeight
              this.containerHeight = this.$refs.configContentMain.clientHeight - (30 + this.topoHeaderTop)
              this.handlerTopo(res.data[0])
            }, 1000)
          }
        }
      })
    },
    // 监听点击下载
    monitorDownloadTopoMap() {
      this.$refs.topoMapComponent.downloadTopoMap()
    }
  }
}
</script>

<style lang="scss" scoped>
.topo-mini-map {
  width: 200px;
  height: 200px;
  position: absolute;
  right: 10px;
}
</style>
