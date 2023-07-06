import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'

/**
 * @description TopoMapApiRequireMixin.js
 * @author linhaojia
 * @date 2022/7/4 14:36:23
 */
export default {
  methods: {
    /* 数据请求 START */
    // 保存画布尺寸
    async saveTopoGraph() {
      await this.updateHyitTopologyItemXY({
        topId: this.id,
        x: this.nowPointValues.x,
        y: this.nowPointValues.y
      })
    },
    // 添加节点
    async insertHyitTopologyItem(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.insertHyitTopologyItem, data }).then(res => { if (res.code === 1) resolve(res) })
      })
    },
    // 获取节点
    findHyitTopologyItem() {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItem, data: { page: 1, limit: -1, topId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    /**
     * @description 修改节点
     * @param requestData 请求修改节点元素接口的参数
     * @param itemUpData 修改实例上节点的参数
     */
    async updateHyitTopologyItem(requestData, itemUpData) {
      return await request({ url: api.itMonitor.updateHyitTopologyItem, data: requestData }).then(res => {
        if (res.code === 1) {
          if (itemUpData !== null) {
            // 请求修改数据成功后修改拓扑图上的节点数据
            this.handlerNode.update(itemUpData)
            this.topoGraph.refresh() // 修改样式需要刷新视图
            return ''
          }
        }
      })
    },
    // 删除节点
    async deleteTopoNode(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.deleteHyitTopologyItem, data }).then(res => { resolve(res) })
      })
    },
    // 批量修改拓扑节点数据
    async updateHyitTopologyItemGroupValue(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.updateHyitTopologyItemGroupValue, data }).then(res => { if (res.code === 1) resolve(res) })
      })
    },
    // 插入节点链路关系
    async insertHyitTopologyItemLink(topoLine) {
      return await request({ url: api.itMonitor.insertHyitTopologyItemLink, data: topoLine }).then(res => {
        if (res.code === 1) {
          return res
        } else {
          this.$message({ type: 'error', message: res.msg })
        }
      })
    },
    // 查询节点链路关系
    async findHyitTopologyItemLink() {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItemLink, data: { page: 1, limit: -1, topId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 删除链路
    async deleteTopoLine(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.deleteHyitTopologyItemLink, data }).then(res => { resolve(res) })
      })
    },
    // 删除多个链路
    async deleteTopoLines(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.deleteHyitTopologyItemLinkByIds, data }).then(res => { resolve(res) })
      })
    },
    // 新增拓扑节点分组
    async insertHyitTopologyItemGroup(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.insertHyitTopologyItemGroup, data }).then(res => { if (res.code === 1) resolve(res) })
      })
    },
    // 删除分组
    async deleteGroup(data) {
      return new Promise(resolve => {
        request({ url: api.itMonitor.deleteHyitTopologyItemGroup, data }).then(res => { if (res.code === 1) resolve(res) })
      })
    },
    // 查询节点分组
    async findHyitTopologyItemGroup() {
      return new Promise(resolve => {
        request({ url: api.itMonitor.findHyitTopologyItemGroup, data: { topId: this.id }}).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    /**
     * @description 获取主机设置端口
     * @param hostId 主机id
     * @param itemId 监控项id
     * @param postListName 端口列表名称（起始端口、目标端口）
     * @param linkId 链路id
     */
    async getHostSetPortList(hostId, itemId, postListName, linkId) {
      const res = await this.getHyitHost({ hyHostId: hostId })
      if (res.code === 1 && res.model) {
        const getItem = this.$tool.findDataItemByAttr(this.itMonitorDeviceInGetPortFn, 'devTypeId', Number(res.model.hyDevTypeId))
        if (getItem) {
          await this[getItem.fn](res, hostId, itemId, postListName)
        }
        // 传入的itemid不为空
        const getActicePortList = [...this[`${postListName}`]]
        if (itemId !== null) {
          getActicePortList.forEach((portItem, portIdx) => {
            const sourceItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'sourceZbxItemId', portItem.itemid)
            const targetItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'targetZbxItemId', portItem.itemid)
            if (sourceItemIdx !== null || targetItemIdx !== null) {
              const linkSourceItemIdx = this.topoLineItems.findIndex(tlitem => tlitem.id === linkId && tlitem.sourceZbxItemId === portItem.itemid)
              const linkTargetItemIdx = this.topoLineItems.findIndex(tlitem => tlitem.id === linkId && tlitem.targetZbxItemId === portItem.itemid)
              if (linkSourceItemIdx !== -1) return
              if (linkTargetItemIdx !== -1) return
              getActicePortList.splice(portIdx, 1)
            }
          })
        } else {
          getActicePortList.forEach((portItem, portIdx) => {
            const sourceItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'sourceZbxItemId', portItem.itemid)
            const targetItemIdx = this.$tool.findDataItemByAttr(this.topoLineItems, 'targetZbxItemId', portItem.itemid)
            if (sourceItemIdx !== null || targetItemIdx !== null) {
              getActicePortList.splice(portIdx, 1)
            }
          })
        }
        this[`${postListName}`] = getActicePortList
      }
    },
    // 获取主机
    async getHyitHost(query) {
      return await request({ url: api.itMonitor.getHyitHost, data: query })
    },
    // 获取主机端口
    async agentGetHostPort(query, wsQuery, agreement) {
      if (this.itMonitorRequireAgreement !== 'WS' || agreement === 'HTTP') {
        return new Promise(resolve => {
          request({
            url: api.itMonitor.agentGetHostPort, data: query
          }).then(res => {
            if (res.code === 1 && res.map) {
              Object.keys(res.map).forEach(key => {
                if (res[key] !== '') {
                  res.map[key] = this.$tool.isJSONString(res.map[key]) ? JSON.parse(res.map[key]) : []
                }
              })
              resolve(res.map)
            }
          })
        })
      } else {
        return new Promise(resolve => {
          const wsToken = this.sessionStorageOperation('get', 'wsToken')
          if (!wsToken) return
          const getUserSessionResult = getUserSession()
          sendWebsocket(socketCmd.host.default, {
            cmd: socketCmd.itMonitor.itAgentGetHostPort,
            data: {
              token: wsToken,
              companyId: getUserSessionResult.companyId,
              appId: getUserSessionResult.appId,
              ...query,
              ...wsQuery,
              fromAgent: this.localStorageOperation('get', 'fromAgent'),
              fromHostId: this.localStorageOperation('get', 'fromHostId')
            }
          })
        })
      }
    }
    /* 数据请求 END */
  }
}
