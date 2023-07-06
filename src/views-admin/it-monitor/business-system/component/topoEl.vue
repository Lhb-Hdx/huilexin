<template>
  <div class="config-content-left-component">
    <div class="left-title">
      <div class="left-title-text">设备列表</div>
    </div>
    <div ref="leftElemnts" class="left-elements">
      <div v-for="groupItem of devTypeList" :key="groupItem.id" class="elements-group-item">
        <div class="group-item-header pointer" @click="handleDevType(groupItem)">
          <div class="item-header-left">
            {{ groupItem.dictdataName }}
          </div>
          <div class="item-header-right">
            <i :class="groupItem.active ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </div>
        </div>
        <div v-if="groupItem.active" class="group-item-main">
          <template v-if="groupItem.typeList">
            <div v-for="(item, index) of groupItem.typeList" :key="item.typeId">
              <div class="elements-item pointer flexBox space-between" @click="handleDevice(groupItem, item, index)">
                <div class="item-header-left overflow-text-a">
                  <TextTooltip :txt-info="item.typeName">{{ item.typeName }}</TextTooltip>
                </div>
                <div class="item-header-right">
                  <i :class="item.active ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                </div>
              </div>
              <template v-if="item.active">
                <div v-for="items of item.hostList" :key="items.hostId">
                  <div
                    style="text-indent: 28px;"
                    class="elements-item pointer overflow-text-a"
                    draggable="true"
                    @dragstart="handleDragStart($event, items)"
                    @dragover.prevent="handleDragOver($event, items)"
                    @dragend="handleDragEnd($event, items)"
                  >
                    <TextTooltip :txt-info="items.hostName">{{ items.hostName }}</TextTooltip>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template v-if="!groupItem.typeList">
            <div v-for="item of groupItem.hostList" :key="item.hostId">
              <div
                class="elements-item pointer overflow-text-a"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragover.prevent="handleDragOver($event, item)"
                @dragend="handleDragEnd($event, item)"
              >
                <TextTooltip :txt-info="item.hostName">{{ item.hostName }}</TextTooltip>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import TextTooltip from '@/components/TextTooltip/TextTooltip'

export default {
  name: 'TopoEl',
  components: {
    TextTooltip
  },
  data() {
    return {
      devTypeList: [
        {
          dictdataName: 'IT监控设备',
          active: false,
          userDefineType: 2,
          fn: 'findItMonitorType',
          typeList: []
        },
        {
          dictdataName: '运维设备',
          active: false,
          userDefineType: 3,
          fn: 'findOpmType',
          typeList: []
        },
        {
          dictdataName: '自定义',
          active: false,
          userDefineType: 8,
          hostList: [
            {
              hostId: 'divItem',
              hostName: '自定义节点',
              userDefineType: 8
            }
          ]
        }
      ],
      findHyitHostQuery: { devType: '', page: 1, limit: -1 }, // 主机查询参数
      dragging: null,
      isShowTooltip: false,
      tipX: 0,
      tipY: 0,
      tipText: ''
    }
  },
  methods: {
    // 开始拖拽主机
    handleDragStart(e, item) {
      this.dragging = item
    },
    // 首先把div变成可以放置的元素，即重写dragenter/dragover
    handleDragOver(e) {
      e.dataTransfer.dropEffect = 'move'// e.dataTransfer.dropEffect="move";//在dragenter中针对放置目标来设置!
    },
    // 结束拖拽
    handleDragEnd(e, item) {
      this.dragging = null
      this.$emit('handleDragHostEnd', { e, item })
    },
    // 展开设备类型
    handleDevType(item) {
      const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'userDefineType', item.userDefineType)
      this.$set(this.devTypeList[getItem.index], 'active', !item.active)
      if (item.active === true) {
        if (item.fn === 'findItMonitorType') this.findItMonitorType('findItMonitorType')
        if (item.fn === 'findOpmType') this.findOpmType('findOpmType')
      }
    },
    // 展开设备
    handleDevice(groupItem, item, index) {
      const deviceTitleIndex = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', groupItem.fn)
      this.$set(this.devTypeList[deviceTitleIndex.index].typeList[index], 'active', !item.active)
      if (item.fn === 'findItMonitorDevice') this.findItMonitorDevice(groupItem, index, item.typeId)
      if (item.fn === 'findOpmDevice') this.findOpmDevice(groupItem, index, item.typeId)
    },
    // 获取it监控设备类型
    findItMonitorType(type) {
      request({ url: api.common.findSysDictionaryDetail, data: {
        page: 1,
        limit: -1,
        dictCode: 'it_dev_type'
      }}).then(res => {
        if (res.code === 1) {
          const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', type)
          const typeData = []
          res.data.forEach(item => {
            typeData.push({
              typeId: item.id,
              typeName: item.dictdataName,
              active: false,
              userDefineType: getItem.userDefineType,
              fn: 'findItMonitorDevice'
            })
          })
          this.$set(this.devTypeList[getItem.index], 'typeList', typeData)
        }
      })
    },
    // it监控设备
    findItMonitorDevice(groupItem, index, devType) {
      request({ url: api.itMonitor.findHyitHost, data: {
        page: 1,
        limit: -1,
        keyword: '',
        hostType: 1,
        devType,
        agents: this.sessionStorageOperation('get', 'agentId')
      }}).then(res => {
        if (res.code === 1) {
          const deviceTitleIndex = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', groupItem.fn)
          const hostList = []
          res.data.forEach(item => {
            hostList.push({
              hostId: item.hyHostId,
              hostName: item.hyMarkName,
              hyZhostId: item.hyZhostId,
              agent: item.agent,
              userDefineType: groupItem.userDefineType,
              ip: item.hyIp,
              port: item.hyPort
            })
          })
          this.$set(this.devTypeList[deviceTitleIndex.index].typeList[index], 'hostList', hostList)
        }
      })
    },
    // 获取运维设备类型
    findOpmType(type) {
      request({ url: api.common.findSysDictionaryDetail, data: {
        page: 1,
        limit: -1,
        dictCode: 'ops_dev_type'
      }}).then(res => {
        if (res.code === 1) {
          const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', type)
          const typeData = []
          res.data.forEach(item => {
            typeData.push({
              typeId: item.id,
              typeName: item.dictdataName,
              active: false,
              userDefineType: getItem.userDefineType,
              fn: 'findOpmDevice'
            })
          })
          this.$set(this.devTypeList[getItem.index], 'typeList', typeData)
        }
      })
    },
    // 运维设备
    findOpmDevice(groupItem, index, deviceTypeCatId) {
      request({ url: api.automationOperations.findHyitOpsServer, data: { page: 1, limit: -1, deviceTypeCatId }}).then(res => {
        if (res.code === 1) {
          const deviceTitleIndex = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', groupItem.fn)
          const hostList = []
          res.data.forEach(item => {
            hostList.push({
              hostId: item.id,
              hostName: item.serverName,
              userDefineType: groupItem.userDefineType,
              ip: item.ip,
              port: item.port
            })
          })
          this.$set(this.devTypeList[deviceTitleIndex.index].typeList[index], 'hostList', hostList)
        }
      })
    },
    onMouseOver(e, key, value) {
      this.tipX = e.x + 15
      this.tipY = e.y
      const tag = this.$refs[key][0]
      const parentWidth = this.$refs[`${key}-parent`][0].clientWidth // 获取元素父级可视宽度
      const contentWidth = tag.clientWidth // 获取元素可视宽度
      this.isShowTooltip = contentWidth >= parentWidth
      this.tipText = value
    },
    onMouseLeave() {
      this.isShowTooltip = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';
</style>
