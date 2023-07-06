<template>
  <div class="device-list">
    <div v-for="(item, index) in devTypeList" :key="item.id" class="device-list-item">
      <div class="list-item-header pointer" @click="handlerDevType(item, index)">
        <div class="header-title overflow-text-a">{{ item.dictdataName }}</div>
        <div class="item-header-right">
          <i :class="item.active ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        </div>
      </div>
      <div v-if="item.active" class="list-item-main" @scroll="handleScroll($event, item, index)">
        <div
          v-for="mainItem in item.hostList"
          :key="mainItem.hyZhostId"
          class="main-item pointer"
          :draggable="true"
          @dragend="ondragEnd(mainItem)"
          @dragstart="ondragStart"
        >
          <div class="item-name overflow-text-a">
            {{ mainItem.hyMarkName }}
          </div>
          <div class="item-statue">
            <el-tag :type="mainItem.hyNetState === 1 ? 'success' : 'info'">
              {{ mainItem.hyNetState === 1 ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      devTypeList: [],
      findHyitHostQuery: { devType: '', page: 1, limit: 10, agents: this.sessionStorageOperation('get', 'agentId') }, // 主机查询参数
      dragging: null,
      isShowTooltip: false,
      tipX: 0,
      tipY: 0,
      tipText: ''
    }
  },
  mounted() {
    this.loadItType()
  },
  methods: {
    // 获取设备类型
    loadItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.active = false
            item.hostList = []
            item.query = {
              page: 1,
              limit: 10,
              agents: this.sessionStorageOperation('get', 'agentId'),
              devType: item.id
            }
          })
          this.devTypeList = res.data
          this.$nextTick(() => {
            this.$set(this.devTypeList[0], 'active', true)
            this.findHyitHost(0, this.devTypeList[0].query)
          })
        }
      })
    },
    // 获取网关主机
    findHyitHost(idx, query) {
      this.$request({ url: this.api.itMonitor.findHyitHost, data: query }).then(res => {
        if (res.code === 1) {
          this.$set(this.devTypeList[idx], 'hostList', [...this.devTypeList[idx].hostList, ...res.data])
        }
      })
    },
    // 点击设备类型
    handlerDevType(item, index) {
      item.active = !item.active
      if (item.active) {
        console.log(item)
        item.hostList = []
        item.query.page = 1
        this.findHyitHost(index, item.query)
      }
    },
    // 滚动触底
    handleScroll(e, item, index) {
      let el = e.target
      // 判断是否到达div容器底部
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
        ++item.query.page
        this.findHyitHost(index, item.query)
      }
    },
    ondragStart(e) {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
    },
    async ondragEnd(item) {
      this.$EventBus.$emit('drag-end-device', { ...item })
    }
  }
}
</script>

<style lang="scss" scoped>
.device-list {
  padding-right: 5px;
    .device-list-item {
        .list-item-header {
            padding: 10px;
            font-size: 14px;
            .header-title {
                font-weight: bold;
                display: inline-block;
                width: 70%;
            }
            .item-header-right {
                width: 30%;
                display: inline-block;
                text-align: right;
            }
        }
        .list-item-main {
          max-height: 300px;
          overflow-y: auto;
          .main-item {
              padding: 10px;
              font-size: 14px;
              .item-name {
                  display: inline-block;
                  width: 70%;
              }
              .item-statue {
                  width: 30%;
                  display: inline-block;
                  text-align: right;
              }
          }
        }
    }
}
</style>
