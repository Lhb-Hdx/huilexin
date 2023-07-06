<template>
  <div class="env-detail-find">
    <div class="detail-find-title">告警列表</div>
    <div class="detail-find-content">
      <div v-for="(item, index) in list" :key="index" class="alarm-list-item">
        <div class="alarm-item-value">
          <span :style="{ color: setAlarmLevelColor(item.hyLevel) }" class="alarm-item-type">[{{ $tool.matchData(levellist,item,'hyLevel','hyLevelName') }}] </span>
          <span class="alarm-item-type">[{{ setname(item.hyDeviceId) }}]</span>
          <span class="alarm-item-title">{{ item.hyEventName }}：</span>
          <span class="alarm-item-text">{{ item.hyAlarmDesc }}</span>
        </div>
        <div class="alarm-item-dete">
          {{ item.hyCtime }}
        </div>
      </div>
      <pagination v-show="total>0" :auto-scroll="false" :limit.sync="findHyitAlarmLogQuery.limit" :page.sync="findHyitAlarmLogQuery.page" :total="total" layout="prev, next" @pagination="findHyitAlarmLog" />
    </div>
  </div>
</template>

<script>
import logTableMixin from '@/views/ring-monitor/mixins/log-table-mixin'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'Alarm',
  mixins: [logTableMixin],
  data() {
    return {
      devicelist: []
    }
  },
  computed: {
    setname() {
      return (id) => {
        const idx = this.devicelist.find(it => it.hyDeviceId === id)
        if (idx) return idx['hyAlias']
      }
    }
  },
  created() {
    this.findHyitDevice()
  },
  methods: {
    async findHyitDevice() {
      let { data, code } = await request({ url: api.powerEnv.findHyitDevice, data: { limit: -1 }})
      if (code === 1) this.devicelist = data
    }

  }
}
</script>

<style lang="scss" scoped>
.env-detail-find {
  margin: 14px;
  .detail-find-title {
    background: #EEEEEE;
    color: #646464;
    font-weight: bold;
    padding: 10px 14px;
  }
  .detail-find-content {
    .alarm-list-item {
      margin: 20px 10px;
      .alarm-item-value {
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
        margin-bottom: 10px;
        .alarm-item-type {
          font-size: 16px;
          font-weight: bold;
        }
        .disaster-type {
          color: #F0191F;
        }
        .serious-type {
          color: #FE830C;
        }
        .dangerous-type {
          color: #00B285;
        }
        .alarm-item-title {
          color: #333333;
          font-size: 16px;
          font-weight: bold;
        }
        .alarm-item-text {

        }
      }
      .alarm-item-dete {
        color: #999999;
        font-size: 14px;
      }
    }
  }
}
</style>
