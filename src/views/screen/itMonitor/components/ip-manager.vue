<template>
  <div class="ip-manager">
    <componentBorder title="IP管理">
      <template>
        <div class="ip-manager-content">
          <div class="content-list">
            <div v-for="item in list" :key="item.id" class="content-item">
              <div class="flex-v-between">
                <div>{{ item.netSegment }}:255</div>
                <div>可用：{{ 100-setPercentage(item) }}%</div>
              </div>
              <div class="item-progress-box">
                <div class="item-progress" :style="{width:100-setPercentage(item)+'%'}" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </componentBorder>
  </div>
</template>

<script>
import componentBorder from '@/views/screen/itMonitor/components/component-border'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'IpManager',
  components: {
    componentBorder
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 30,
        keyword: ''
      },
      list: []
    }
  },
  computed: {
    setPercentage() {
      return function(val) {
        return Number((((val.ipUsedCount === null ? 0 : val.ipUsedCount) / (val.ipCount === null ? 0 : val.ipCount)) * 100).toFixed(2))
      }
    }
  },
  mounted() {
    this.findOpsIpAddress()
  },
  methods: {
    findOpsIpAddress(query) {
      request({
        url: api.ipAddressManage.findOpsIpAddressNetSegment,
        data: query || this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          const ids = []
          res.data.forEach(item => { ids.push(item.id) })
          const ipAddressDetailUsage = await this.getOpsIpAddressDetailUsage(ids.toString())
          res.data.forEach(item => {
            item.ipUsedCount = ipAddressDetailUsage[item.id][0].useCount ? Number(ipAddressDetailUsage[item.id][0].useCount) : 0
            item.ipDisableCount = ipAddressDetailUsage[item.id][0].total - item.ipUsedCount
          })
          this.list = res.data
        }
      })
    },
    // 获取网段统计
    async getOpsIpAddressDetailUsage(netSegmentIds) {
      const { code, map } = await request({ url: api.ipAddressManage.getOpsIpAddressDetailUsage, data: { netSegmentIds }})
      if (code !== 1) return
      return map
    }
  }
}
</script>

<style lang="scss" scoped>
.ip-manager{
  flex: .4;
  overflow:hidden;
  .ip-manager-content{
    overflow: hidden;
    overflow-y: auto;
    flex: 1;
    .content-list{
      .content-item{
        margin-bottom: 35px;
        padding-right: 10px;
        .item-progress-box{
          height: 7px;
          background: #888888;
          margin-top: 12px;
          position: relative;
          .item-progress{
            position: absolute;
            top: 0;
            left: 0;
            background-color: #00B285;
            height: 100%;
            width: 0;
            transition: width 2s ease-out;
          }
        }
      }
    }
  }
}
.ip-manager ::v-deep  .border-content-line{
  position: absolute;
  bottom: 20px;
  right: -35px;
  width: 17%;
  height: 1px;
  background-color: var( --default-color);
  transform: rotate(143deg);
}
</style>
