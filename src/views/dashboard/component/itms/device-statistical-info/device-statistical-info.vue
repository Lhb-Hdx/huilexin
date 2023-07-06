<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
    <div class="box-item-content no-background no-padding content-height-130">
      <div class="item-content-header">
        <el-switch
          v-if="isShow"
          v-model="modelDefineSwitch"
          @change="changemodelDefine"
        />
      </div>

      <div class="item-content-body">
        <el-row>
          <el-col
            v-for="(item, index) in deviceList"
            :key="item.refKey"
            :span="8"
            class="statistical-list-item pointer"
            :style="setNotPadding(index)"
          >
            <div
              class="list-item-content background-while"
              @click="toPage(item)"
            >
              <div class="list-item-left width-40 inline">
                <div class="item-left-title">{{ item.title }}</div>
                <div class="item-left-value">{{ item.value }}</div>
              </div>
              <div class="list-item-right width-60 inline">
                <ring-echart label-title="在线率" :num="item.online" :ref-key="item.refKey" />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import RingEchart from './ring-echart'
import { guid } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'DeviceStatisticalInfo',
  components: {
    RingEchart
  },
  props: {
    agentId: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'deviceStatisticalInfo',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      deviceList: [],
      loading: false
    }
  },
  computed: {
    setNotPadding() {
      return function (index) {
        const notMarginOpt = [
          { i: 0, style: { 'padding-left': '0px', 'padding-top': '0px' } },
          { i: 1, style: { 'padding-top': '0px' } },
          { i: 2, style: { 'padding-right': '0px', 'padding-top': '0px' } },
          { i: 3, style: { 'padding-left': '0px' } },
          { i: 6, style: { 'padding-left': '0px' } },
          { i: 5, style: { 'padding-right': '0px' } },
          { i: 6, style: { 'padding-right': '0px', 'padding-bottom': '0px' } },
          { i: 7, style: { 'padding-bottom': '0px' } },
          { i: 8, style: { 'padding-right': '0px', 'padding-bottom': '0px' } }
        ]
        const notMarginOptIndex = notMarginOpt.findIndex(el => el.i === index)
        if (notMarginOptIndex !== -1) return notMarginOpt[notMarginOptIndex].style
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.findSysCat()
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
  },
  methods: {
    findSysCat() {
      this.loading = true
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            this.$set(this.deviceList, this.deviceList.length, {
              catId: item.id,
              title: item.dictdataName,
              value: 0,
              online: 0,
              refKey: guid()
            })
          })
          this.getHyitHostTypeStatictics()
        }
      })
    },
    getHyitHostTypeStatictics() {
      request({
        url: api.itMonitor.getHyitHostTypeStatictics,
        data: { agents: this.agentId }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(resItem => {
            const idx = this.deviceList.findIndex(item => item.catId === resItem.devType)
            if (idx !== -1) {
              const onlinePercent = Number((resItem.onlinePercent.toFixed(3)) * 1000) === 0 ? 0 : String((resItem.onlinePercent.toFixed(3)) * 1000).slice(0, -1)
              this.$set(this.deviceList[idx], 'value', resItem.count)
              this.$set(this.deviceList[idx], 'online', Number(onlinePercent))
            }
          })
          setTimeout(() => {
            this.loading = false
          }, 500)
        }
      })
    },
    // 更改显示配置
    changemodelDefine(val) {
      if (val === false) {
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      } else {
        // 删除
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      }
    },
    // 跳转
    toPage(item) {
      this.$router.push({
        name: 'ResourceMonitorIndex',
        query: {
          deviceTypeId: item.catId
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box-item-content {
  position: relative;
  .item-content-body {
    //padding-top: 30px;
  }
  .item-content-header {
    position: absolute;
    top: 5px;
    right: 20px;
    z-index: 1000;
  }
}

.statistical-list-item {
  height: 130px;
  position: relative;
  padding: 5px;
  .list-item-content {
    height: 100%;
  }
  .list-item-left {
    position: absolute;
    top: 50%;
    left: 8%;
    transform: translateY(-50%);
    .item-left-title {
      color: #333333;
      font-size: 14px;
      padding-bottom: 10px;
    }
    .item-left-value {
      color: #333333;
      font-size: 20px;
    }
  }
  .list-item-right {
    height: 100%;
    position: absolute;
    right: 0;
  }
}
</style>
