<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" class="overview box-border margin-top-15 margin-left-15 margin-right-15">
    <div class="head head-bar">
      <div class="title">概况</div>
      <div class="chunk-opts">
        <div class="chunk-opts-select">
          <el-switch
            v-if="isConfig"
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div class="box">
      <div
        v-loading="upStatus ===''"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">运行状态</div>
        <div class="box-item-value">
          <div class="icon-flex" :class="upStatus !== 1 ? 'danger' : ''">
            <img v-if="upStatus === 1" class="monitor-icon" src="image/common/right.png" alt="">
            <img v-if="upStatus !== 1" class="monitor-icon" src="image/common/alarm.png" alt="">
            {{ upStatus === 1 ? '正在运行' : '断开' }}</div>
        </div>
      </div>
      <div
        v-loading="usability === '' || usability=== null|| usability === undefined"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">在线状态</div>
        <div class="box-item-value">
          <div class="icon-flex" :class="usability !== 1 ? 'danger' : ''">
            <img v-if="usability === 1" class="monitor-icon" src="image/common/right.png" alt="">
            <img v-if="usability !== 1" class="monitor-icon" src="image/common/alarm.png" alt="">
            {{ usability === 1 ? '在线' : '离线' }}
          </div>
        </div>
      </div>
      <div
        v-if="upTime !== ''"
        v-loading="!upTime"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">运行时间</div>
        <div class="box-item-value">
          <div class="b16">{{ upTime }}</div>
        </div>
      </div>
      <div
        v-if="dbDataFileSize !== ''"
        v-loading="!dbDataFileSize"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">所有数据文件大小</div>
        <div class="box-item-value">
          <div class="b16 overflow-text-a">{{ dbDataFileSize }}</div>
        </div>
      </div>
      <div
        v-if="dbVersion !== ''"
        v-loading="!dbVersion"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">数据库版本</div>
        <div class="box-item-value">
          <div class="b16 overflow-text-a">{{ dbVersion }}</div>
        </div>
      </div>
      <div
        v-if="deviceSN !== ''"
        v-loading="!deviceSN"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">设备SN</div>
        <div class="box-item-value">
          <div class="b16">{{ deviceSN }}</div>
        </div>
      </div>
      <div
        v-if="deviceServerRunTime !== ''"
        v-loading="!deviceServerRunTime"
        class="box-item"
        element-loading-spinner="el-icon-loading"
      >
        <div class="lbl">服务运行时长</div>
        <div class="box-item-value">
          <div class="b16">{{ deviceServerRunTime }}</div>
        </div>
      </div>
      <div v-if="dbVersion === '' || upTime === ''" class="box-item">
        <div />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonitorHostInfo',
  // eslint-disable-next-line vue/no-unused-components
  props: {
    upTime: {
      type: String,
      default() {
        return ''
      }
    },
    upStatus: {
      type: Number,
      default() {
        return ''
      }
    },
    usability: {
      type: Number,
      default() {
        return 0
      }
    },
    dbVersion: {
      type: String,
      default() {
        return ''
      }
    },
    deviceSN: {
      type: String,
      default() {
        return ''
      }
    },
    deviceServerRunTime: {
      type: String,
      default() {
        return ''
      }
    },
    dbDataFileSize: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      hostId: 0,
      sbId: 0,
      hostStatusName: '',
      hostAvailableName: '',
      stopTime: '',
      availables: [
        {
          label: 'AGENT'
        },
        {
          label: 'SNMP'
        },
        {
          label: 'JMX'
        },
        {
          label: 'IPMI'
        }
      ],
      watchItemSwitch: true,
      watchItemKey: 'hostInfo',
      watchItemShow: null
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    setTimeout(() => {
      console.log(!this.usability)
    }, 2000)
    this.hostId = this.$route.params.id
    this.sbId = this.$route.params.sbid
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
  },
  methods: {
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '概况',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.lbl{
  color: #999999;margin-bottom: 15px;
}
.g{color: #00b285;}
.b16{font-size: 16px;}

.box{
  >div{padding: 15px;}
}
</style>
