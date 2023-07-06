<template>
  <div class="subnet">
    <div v-for="item in subNet" :key="item.id" class="subnet-list">
      <div class="subnet-header flex align-item-center pointer" @click="expandIp(item)">
        <div class="subnet-header-icon">
          <i v-if="item.expand === false" class="el-icon-caret-bottom" />
          <i v-else class="el-icon-caret-top" />
        </div>
        <div class="subnet-header-title overflow-text-a">{{ item.netSegment }}/255</div>
        <div class="subnet-header-status">
          <div class="progress-bar">
            <div class="bar">
              <div class="value" :style="{ 'width': (85 / 100) * item.schedule.toFixed(2) + 'px' }" />
            </div>
            <div class="bar-text">{{ item.schedule.toFixed(2) }}%</div>
          </div>
        </div>
      </div>
      <div v-if="item.expand" class="subnet-main">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'SubnetTab',
  props: {
    listQuery: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      subNet: []
    }
  },
  computed: {
    setPercentage() {
      return function(val) {
        return `${((val.ipUsedCount === null ? 0 : val.ipUsedCount) / (val.ipCount === null ? 0 : val.ipCount)) * 100}%`
      }
    },
    setPercentageWidth() {
      return function(val) {
        const num = ((val.ipUsedCount === null ? 0 : val.ipUsedCount) / (val.ipCount === null ? 0 : val.ipCount)) * 100
        return (85 / 100) * num
      }
    }
  },
  watch: {
    listQuery: {
      handler() {
        if (this.listQuery.netSegment !== '') {
          this.initIpDetail()
        } else {
          this.subNet = []
        }
      },
      deep: true
    }
  },
  methods: {
    // 生成ip详情列表
    async initIpDetail(msg) {
      // 没有选择指定子网的时候，获取所有子网，展开获取子网下的ip
      const getSubNet = await this.findOpsIpAddressNetSegment()
      const ipAddressIds = []
      getSubNet.forEach(item => ipAddressIds.push(item.id))
      const getUsage = await this.getOpsIpAddressDetailUsage(this.listQuery.ipAddressId ? this.listQuery.ipAddressId : ipAddressIds.toString())
      // 选择指定子网的时候，获取子网子网下的ip
      getSubNet.forEach(item => {
        item.expand = getSubNet.length === 1
        item.ipList = []
        item.listQuery = {
          page: 1,
          limit: 10
        }
        item.schedule = (getUsage[item.id][0].useCount / getUsage[item.id][0].total || 0) * 100
      })
      this.subNet = getSubNet
    },
    // 展开子网
    async expandIp(val) {
      val.expand = !val.expand
      this.$emit('expandIp', val)
    },
    // 查询子网的网段
    async findOpsIpAddressNetSegment() {
      const { code, data } = await request({ url: api.ipAddressManage.findOpsIpAddressNetSegment, data: this.listQuery })
      if (code !== 1) return
      return data
    },
    async getOpsIpAddressDetailUsage(netSegmentIds) {
      const { code, map } = await request({ url: api.ipAddressManage.getOpsIpAddressDetailUsage, data: {
        netSegmentIds
      }})
      if (code !== 1) return
      return map
    }
  }
}
</script>

<style lang="scss" scoped>
.subnet-list {
  .subnet-header {
    padding: 5px 0;
    margin: 2px 0;
    .subnet-header-icon {
      width: 2%;
      font-size: 16px;
    }
    .subnet-header-title {
      max-width: 30%;
      font-size: 16px;
    }
    .subnet-header-status {
      width: 15%;
      margin-left: 10px;
    }
  }
}
.progress-bar {
  height: 16px;
  display: flex;
  align-items: center;
  .bar {
    width: 85px;
    height: 16px;
    background: #e9e8ea;
    .value {
      height: 16px;
      background: #00b285;
    }
  }
  .bar-text {
    margin-left: 5px;
  }
}
</style>
