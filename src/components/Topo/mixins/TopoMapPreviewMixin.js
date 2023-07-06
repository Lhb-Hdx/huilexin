import request from '@/utils/request'
import api from '@/api/api'

/**
 * @description TopoMapPreviewMixin.js
 * @author linhaojia
 * @date 2022/7/4 14:35:59
 */
export default {
  data() {
    return {
      showHostDetail: false,
      hostDetail: {},
      componentGuid: this.$tool.guid(),
      showLineDetail: false,
      subNodes: [],
      subEdges: [],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      getHostAgent: 0
    }
  },
  mounted() {
    this.$EventBus.$on('openMonitorNetListEchart', (val) => {
      this.getHostAgent = val.ReceiveAgent || val.SendAgent
      this.detailParams = [
        {
          unit: val.sendUnit,
          itemid: val.sendItemId,
          valueType: val.sendValueType,
          name: '发送',
          color: '#87DEAF',
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          data: [0],
          units: [`MB`],
          time: [this.$tool.dateFormat('HH:MM:SS', new Date())],
          isAssignUnit: true,
          assignUnit: 'MB',
          originalUnit: `${val.sendUnit.indexOf('/') !== -1 ? val.sendUnit.split('/')[0].toLocaleLowerCase() : val.sendUnit.split('ps')[0].toLocaleLowerCase()}`,
          toFixed: 2
        },
        {
          unit: val.receiveUnit,
          itemid: val.receiveItemId,
          valueType: val.receiveValueType,
          name: '接收',
          color: '#3ba9ed',
          echartType: 'value',
          unitSuffix: 'ps',
          isConversion: true,
          conversionUnitType: 'data',
          data: [0],
          units: [`MB`],
          time: [this.$tool.dateFormat('HH:MM:SS', new Date())],
          isAssignUnit: true,
          assignUnit: 'MB',
          originalUnit: `${val.receiveUnit.indexOf('/') !== -1 ? val.receiveUnit.split('/')[0].toLocaleLowerCase() : val.receiveUnit.split('ps')[0].toLocaleLowerCase()}`,
          toFixed: 2
        }
      ]
      this.tableParams = [
        {
          label: ['最高发送', '平均发送', '最低发送'],
          value: 0,
          unit: val.sendUnit,
          itemid: val.sendItemId,
          valueType: val.sendValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'avg', 'min'],
          isAssignUnit: true,
          assignUnit: 'MB',
          fixed: 2
        },
        {
          label: ['最高接收', '平均接收', '最低接收'],
          value: 0,
          unit: val.receiveUnit,
          itemid: val.receiveItemId,
          valueType: val.receiveValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'avg', 'min'],
          isAssignUnit: true,
          assignUnit: 'MB',
          fixed: 2
        }
      ]
      this.showUsedDetailDialog = true
    })
  },
  methods: {
    // 设置主机信息
    async setHostDetail(evt) {
      const host = await this.getHyitHost({ hyHostId: evt.item._cfg.model.hostId })
      if (host.model) {
        const org = this.commonRequestFn.getHyitOrg({ hyOrgId: host.model.hyOrgId })
        const { data } = await request({
          url: api.common.findSysDictionaryDetail,
          data: { dictCode: 'it_sub_dev_type', limit: -1, ids: host.model.hySubdevTypeId }
        })
        this.hostDetail = {
          agent: host.model ? host.model.agent : '',
          hyDevTypeId: host.model ? host.model.hyDevTypeId : '',
          hyHostId: host.model ? host.model.hyHostId : '',
          hyZhostId: host.model ? host.model.hyZhostId : '',
          hostName: host.model ? host.model.hyMarkName : '',
          ip: host.model ? host.model.hyIp : '',
          org: org ? org.hyOrgName : '',
          statue: host.model ? host.model.hyStatus : '',
          layerX: evt.originalEvent.layerX,
          layerY: evt.originalEvent.layerY,
          hyAvailable: host.model ? host.model.hyAvailable : '',
          hySnmpAvailable: host.model ? host.model.hySnmpAvailable : '',
          hyIpmiAvailable: host.model ? host.model.hyIpmiAvailable : '',
          hyJmxAvailable: host.model ? host.model.hyJmxAvailable : '',
          hySubdevTypeId: data && data.length > 0 ? Number(data[0].dictdataValue) : ''
        }
      } else {
        this.$message.error('查询设备信息失败')
      }
    },
    // 关闭图表
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    // 告警状态数量信息
    async getAlarmLogStatueCount(query) {
      const { code, map } = await request({ url: api.itMonitor.getAlarmLogStatueCount, data: query })
      if (code !== 1) return
      return map.num
    }
  }
}
