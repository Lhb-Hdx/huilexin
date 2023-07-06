<template>
  <div class="config-content-left-component">
    <div class="left-title">
      <div class="left-title-text">设备列表</div>
    </div>
    <div ref="leftElemnts" class="left-elements">
      <div v-for="groupItem of devTypeList" :key="groupItem.id" class="elements-group-item">
        <div class="group-item-header pointer" @click="handleDevType(groupItem)">
          <div class="item-header-left">
            <img :src="groupItem.thumb" alt="">{{ groupItem.dictdataName }}
          </div>
          <div class="item-header-right">
            <i :class="groupItem.active ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </div>
        </div>
        <div v-if="groupItem.active" class="group-item-main">
          <div
            v-for="item of groupItem.hostList"
            :key="item.hyHostId"
            class="elements-item pointer overflow-text-a"
            draggable="true"
            :class="setHostStatusColor(item)"
            @dragstart="handleDragStart($event, item)"
            @dragover.prevent="handleDragOver($event, item)"
            @dragend="handleDragEnd($event, item)"
          >
            <TextTooltip :txt-info="item.hyMarkName">{{ item.hyMarkName }}</TextTooltip>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="isShowTooltip"
      class="tip-box"
      :style="{ top: tipY + 'px', left: tipX + 'px' }"
    >
      {{ tipText }}
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { topoDiyLabel } from '@/utils/define-data'
import TextTooltip from '@/components/TextTooltip/TextTooltip'

export default {
  name: 'TopoEl',
  components: {
    TextTooltip
  },
  data() {
    return {
      devTypeList: [],
      findHyitHostQuery: { devType: '', page: 1, limit: -1, agents: this.sessionStorageOperation('get', 'agentId') }, // 主机查询参数
      dragging: null,
      isShowTooltip: false,
      tipX: 0,
      tipY: 0,
      tipText: ''
    }
  },
  computed: {
    setHostStatusColor() {
      return function(item) {
        const count = item.hyAvailable + item.hySnmpAvailable + item.hyIpmiAvailable + item.hyJmxAvailable
        if (item.isDiy) {
          return ''
        }
        return item.hyDevTypeId === 478 ? item.hyNetState === 1 ? 'success' : 'danger' : count === 1 ? 'success' : 'danger'
      }
    }
  },
  mounted() {
    this.loadItType()
  },
  methods: {
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.thumb = `image/it-monitor/it-monitor-type-icon-${item.id}.png`
            item.count = 0
            item.active = false
            item.hostList = []
          })
          // 插入自定义标签列表
          res.data.push(...topoDiyLabel())
          this.devTypeList = res.data
          this.$nextTick(() => {
            if (this.devTypeList.length > 0) {
              this.findHyitHostQuery.devType = this.devTypeList[0].id === 0 ? '' : this.devTypeList[0].id
            }
            this.$set(this.devTypeList[0], 'active', true)
            this.findHyitHost(0)
          })
        }
      })
    },
    // 获取网关主机
    findHyitHost(idx) {
      request({ url: api.itMonitor.findHyitHost, data: this.findHyitHostQuery }).then(res => {
        if (res.code === 1) {
          this.$set(this.devTypeList[idx], 'hostList', res.data)
        }
      })
    },
    // 展开设备类型
    handleDevType(item) {
      this.$set(this.findHyitHostQuery, 'devType', item.id)
      const idx = this.devTypeList.findIndex(items => items.id === item.id)
      this.$set(this.devTypeList[idx], 'active', !item.active)
      if (item.devType === 'diyLabel') return
      if (item.active === true) {
        this.findHyitHost(idx)
      }
    },
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
.tip-box {
  position: fixed;
  background: #fff;
  padding: 5px;
  color: #646464;
  border: 1px solid #ddd;
  z-index: 9;
}
</style>
