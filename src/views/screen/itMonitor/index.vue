<template>
  <dv-full-screen-container class="bg">
    <div class="monitor">
      <div class="monitor-header">
        <div class="header-title">数据中心机房监控管理</div>
        <!-- <div class="header-left flex">
          <div
            v-for="item in areaBtnList"
            :key="item.name + item.type"
            class="px-10 header-left-btn pointer flex-v-between"
            :class="{ opacity: item.type !== currentType }"
            @click="onAreaChange(item)"
          >
            <span class="flex-1 overflow-text-a">{{ item.name }}</span>
            <i class="el-icon-caret-right" />
          </div>
        </div> -->

        <div class="header-right flex-v-between">
          <div class="flex-h-center">
            <div v-for="item in rightBtnList" ref="fullScreen" :key="item.name" :class="{ active: item.type === currentRightBtn }" class="right-btn pointer flex-center" @click="onRightBtnClick(item)">
              {{ item.name }}
            </div>
          </div>
          <div class="right-date" style="margin-right:20px">
            {{ time }}
          </div>
        </div>
      </div>
      <!-- 监控主体，本来采取6+12+6 三列 -->
      <div ref="monitorContent" class="monitor-content">
        <!-- 上部分 -->
        <div ref="topoWrapper" class="topo-wrapper">
          <TopoMap
            ref="topoMapComponent"
            mode="preview"
            :topo-info="topoInfo"
            :map-config="mapConfig"
            :map-combos="mapCombos"
            :map-edges="mapEdges"
            :map-nodes="mapNodes"
            :map-preview="false"
            :map-grid-bg="false"
          />
        </div>
        <div class="column-box">
          <!-- <AlarmTrend /> -->
          <!-- <TrafficMonitor /> -->
          <TopoList @handlerTopo="handlerTopo" />
        </div>
        <div class="rightStatic">
          <topoStatic :topo-static-data="topoStatic" :topo-info="topoInfo" />
          <!-- 链路类型： -->
          <TopoConnectLineType
            style="margin: 50px 10px 0 0"
            :style-options="{
              width: '220px',
              border: '1px solid #0B3452',
              background: '#04132E',
              right: 10 + 'px'
            }"
            @downloadTopoMap="downloadTopoMap"
          />
        </div>
      </div>
      <!-- 下部分 -->
      <div class="bottomContent">
        <el-row :gutter="20">
          <el-col :span="10">
            <div class="firstColumn">
              <AlarmTrend />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="secondColumn">
              <!-- <EquipmentFailure /> -->
              <Bandwidth />
            </div>
          </el-col>
          <!-- <el-col :span="4">
            <div class="thirdColumn">
              <PortTraffic />
            </div>
          </el-col> -->

          <el-col :span="6">
            <!-- <IpManager /> -->
            <div class="forthColumn">
              <RadarChart />
            </div>
          </el-col>
        </el-row>
      </div>
      <el-col :xs="16" :sm="16" :md="14">
        <div class="column-box">
          <!-- <EquipmentTopology /> -->
          <!-- <div class="flex-v-between" style="flex:.4;overflow:hidden">
                <EquipmentFailure />
                <PortTraffic />
                <EquipmentFlow />
              </div> -->
          <!-- <EquimentTopoGraph :topo-map-data="topoMapData" /> -->
        </div>
      </el-col>
    </div>
  </dv-full-screen-container>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { isJSONString } from '@/utils/utils'
import AlarmTrend from './components/alarm-trend'
import RadarChart from './components/radar-chart'
// import TrafficMonitor from './components/traffic-monitor'
import TopoList from './components/topo-list'
import Bandwidth from './components/bandwidth-monitor'
// import EquipmentTopology from './components/equipment-topology'
// import EquimentTopoGraph from './components/equiment-topoGraph'
// import EquipmentFailure from './components/equipment-failure'
// import EquipmentFlow from './components/equipment-flow'
// import EquipmentStatus from './components/equipment-status'
import topoStatic from './components/topo-static'
// import IpManager from './components/ip-manager'
// import PortTraffic from './components/port-traffic'
import screenGlobal from '@/views/screen/mixin/screenGlobal'
import TopoMap from '@/components/Topo/Components/TopoMap'
import TopoConnectLineType from '@/components/Topo/Components/TopoConnectLineType'

export default {
  name: 'ItMonitorScreen',
  components: {
    TopoMap,
    TopoConnectLineType,
    Bandwidth,
    AlarmTrend, // 告警趋势
    RadarChart, // 雷达echart图表
    // TrafficMonitor, // 流量监控
    TopoList, // 拓扑列表
    // EquipmentTopology, // 设备拓扑
    // EquimentTopoGraph, // 设备拓扑
    // EquipmentFailure, // 设备故障
    // EquipmentFlow, // 设备流量
    topoStatic // 设备概况
    // IpManager, // ip管理
    // PortTraffic // 端口流量
  },
  mixins: [screenGlobal],
  data() {
    return {
      areaBtnList: [
        { name: '中心医院数据机房', type: 0 },
        { name: '莲花山', type: 1 }
      ],
      currentType: 0,
      rightBtnList: [
        // { name: '动环信息', type: 0 },
        { name: '数控管理', type: 0 }
        // { name: '视频监控', type: 1 },
        // { name: 'IT监控', type: 2 }
      ],
      connectLineTypeListMap: [],
      topoPortAbbreviations: [],
      topoDiyLabel: [],
      currentRightBtn: 2,
      topoStatic: {
        itemLinkCount: 0,
        itemOfflineCount: 0,
        itemCount: 0,
        itemLinkOffCount: 0
      }, // 设备概况
      topoInfo: {},
      topoItemGroup: '',
      // 进入配置的时候传入进行拓扑图渲染
      topoMapData: {
        nodes: [],
        comboItems: [],
        edges: []
      },
      // 拓扑图
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      mapConfig: {},
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
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$tool.ADCfullScreen()
      this.agentGetTopStatic()
    })
  },
  methods: {
    onAreaChange(item) {
      this.currentType = item.type
    },
    onRightBtnClick(item) {
      this.currentRightBtn = item.type
    },
    // 捕获子组件选择拓扑事件
    async handlerTopo(val) {
      this.topoInfo = val
      this.mapConfig = {
        width: this.$refs.topoWrapper.clientWidth,
        height: 2000
      }
      this.mapCombos = await this.findHyitTopologyItemGroup(val) || []
      this.mapNodes = await this.findHyitTopologyItem(val) || []
      this.mapEdges = await this.findHyitTopologyItemLink(val) || []
      setTimeout(async() => {
        // 调用拓扑组件生成数据
        await this.$refs.topoMapComponent.generateData()
        // 调用拓扑组件初始化拓扑图
        this.$refs.topoMapComponent.initMap()
      }, 100)
    },
    // 获取拓扑节点分组
    async findHyitTopologyItemGroup(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItemGroup, data: { topId: data.id }}).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 获取拓扑节点 ，节点重要数据
    async findHyitTopologyItem(val) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItem, data: { page: 1, limit: -1, topId: val.id }}).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 查询节点链路关系
    async findHyitTopologyItemLink(val) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItemLink, data: { page: 1, limit: -1, topId: val.id }}).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 取得topo设备静态信息
    agentGetTopStatic() {
      request({
        url: api.itMonitor.agentGetTopStatic,
        data: { topId: this.topoInfo.id }
      }).then(res => {
        if (res.code === 1 && res.model) {
          if (isJSONString(res.model)) this.topoStatic = JSON.parse(res.model)
        }
      })
    },
    // 导出拓扑图
    downloadTopoMap() {
      this.$refs.topoMapComponent.downloadTopoMap()
    }
  }
}
</script>

<style lang="scss" scoped>
.monitor {
  --default-color: #082949;
  background: #030d25 url(/image/dashboard/power/it_bg_head.jpg) no-repeat center -13px;
  min-height: 100%;
  padding: 16px;
  padding-left: 0;
  padding-right: 0;
  position: relative;
  transition: all 0.5s;
  color: #fff;
  font-size: 14px;
  .monitor-header {
    .header-title{
      position: absolute;
      left: 50%;
      font-size: 27px;
      height: 27px;
      line-height: 24px;
      bottom: 50%;
      background-image: linear-gradient(to bottom , #fff, #ccc,#fff);
      color:transparent;
      background-clip:text;
      transform: translate(-50%,-50%);
    }
    height: 100px;
    width: 100%;
    position: relative;
    background-size: 100%;
    padding-bottom: 20px;
    &:after {
      content: '';
      height: 100%;
      clear: both;
      zoom: 1;
      display: block;
    }
    .header-left {
      position: absolute;
      left: 0;
      top: 44%;
      transform: translateY(-50%);
      .header-left-btn {
        background-color: #071f39;
        border: 1px solid #083744;
        color: #9ee6ff;
        width: 171px;
        height: 41;
        line-height: 41px;
        font-size: 16px;
        text-align: center;
        &.opacity {
          opacity: 0.3;
        }
      }
    }
    .header-right {
      position: absolute;
      right: 0;
      top: 45%;
      width: 38%;
      transform: translateY(-50%);
      color: var(--power-srceen-text-color);
      .right-btn {

        clip-path: polygon(100% 0, 83% 100%, 0 100%, 17% 0) ;
        // background: #031333;
        // color: #9ee6ff;
        color: #9ee6ff;
        width: 153px;
        height: 24px;
        background: #082949;
        font-size: 14px;
        line-height: 24px;
        // position: relative;

        &.active {
          background: #082949;
        }
      }
      .right-date {
        position: relative;
        font-size: 14px;
        color: #ddd;
        text-align: right;
        &::before {
          content: '';
          position: absolute;
          left: -15px;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 70%;
          background: #1a728b;
        }
      }
    }
  }
   .topo-wrapper{
      position: absolute;
      z-index: 100;
      width: 100%;
      height: 100%;
      // background-color: red;
        #topoMap {
      // width: 650px;
      height: 100%;
      // overflow: hidden;
    }
    }
  .monitor-content {
    // position: absolute;
    position: relative;
    // z-index: 101;
    // width: 100%;
    // 减掉header和最大的盒子上下的padding还 占3分之2
    height: calc(100vh - 100px - 16px - 16px - 300px);
    .column-box {
      position: absolute;
      z-index: 101;
      display: flex;
      flex-direction: column;
      height: 100%;
      & > div:first-child {
        margin-bottom: 20px;
      }

    }
      .rightStatic {
        position: absolute;
        right: 0 !important;
        z-index: 101;
        display: flex;
        //width: 80px;
        flex-direction: column;
        align-items: flex-end;
        padding: 0 20px 0 0;
      }

    .tooltip-group,
    .host-tooltip {
      position: absolute;
    }
    .g6-component-tooltip {
      display: inline-block;
      visibility: visible;
      font-size: 14px;
      .host-name {
        color: #0045ab;
      }
      .host-ip {
        color: #878787;
      }
      .item-name {
        display: inline-block;
        width: 72px !important;
      }
    }
  }
  .bottomContent {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 15px 0;
    width: 100%;
    z-index: 9999;
    height: 315px;
    background:rgba(0,0,0,.3);
    // position: absolute;
    // bottom: 0;
    .firstColumn {
      height: 100%;
      // display: flex;
      // justify-content: space-between;
      // &:first-child{
      //   flex-basis: 60%;
      // }
      // &:last-child{
      //   flex-basis: 40%;
      // }
    }
    .secondColumn {
      overflow: hidden;
      height: 100%;
    }
    .thirdColumn {
      overflow: hidden;
      height: 100%;
    }
    .forthColumn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
}
.monitor ::v-deep div::-webkit-scrollbar-track-piece {
  background: #071f39;
}
.monitor ::v-deep div::-webkit-scrollbar-thumb {
  background: #78b0c9;
  border-radius: 0;
}
.monitor ::v-deep .bottom-center-box {
  display: flex;
  flex-direction: column;
  // height: 88%;
  overflow: hidden;
  .bottom-center-box-tabs {
    display: flex;
    .tabs-tab {
      flex: 1;
      height: 30px;
      line-height: 30px;
      text-align: center;
      &.active {
        background-color: #082949;
      }
    }
  }
  .bottom-center-box-box {
    // border: 1px solid var(--default-color);
    flex: 1;
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .bottom-center-box-content {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    .content-list {
      padding: 0 9px 0 0;
      .list-item .list-item-ip {
        color: #999999;
      }
    }
  }
  .top-title {
    color: #9ee5ff;
    position: relative;
    padding-left: 10px;
    line-height: 20px;
    font-size: 14px;
    &:before {
      content: '';
      width: 3px;
      height: 20px;
      font-size: 18px;
      font-weight: 400;
      background-color: #9ee7ff;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
.monitor ::v-deep .el-row {
  height: 100%;
  .el-col {
    height: 100%;
  }
}
///deep/ .g6-minimap {
//  position: absolute !important;
//  top:50%;
//  transform: translateY(-60%);
//  right: 26px !important;
//  // bottom: 13%;
//}
//  #topoMap /deep/ canvas{
//   transform: scale(.4);
//  }
</style>
