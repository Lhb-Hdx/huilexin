<template>
  <div class="env-detail">
    <div class="slider">
      <div ref="slider" class="slider-btn">
        <div
          v-for="(item, index) of slider"
          :key="index"
          class="slider-item"
          :class="{ 'active-slider-item': index === sliderIndex }"
          @click="changeSlider(index)"
        >
          {{ item.label }}
        </div>
      </div>
      <div class="slider-pane" :style="{'width': 'calc(100% - '+ sliderWidth + 'px' +')'}">
        <alarm v-if="sliderIndex === 0 && rightDevice.hostId" :id="rightDevice.hostId" />
        <ring-monitor v-if="sliderIndex === 1" :device-id="rightDevice.hostId" />
        <it-monitor v-if="sliderIndex === 2" :it-monitor-list="itMonitorDevice" />
      </div>
    </div>
  </div>
</template>

<script>
import Alarm from './alarm'
import ItMonitor from './itMonitor'
import RingMonitor from './ringMonitor'
import { getVuexStoragePermission } from '@/utils/auth'

export default {
  name: 'EnvDetailIndex',
  components: {
    Alarm, ItMonitor, RingMonitor
  },
  props: {
    mapData: {
      type: Object,
      default: function() {
        return {}
      }
    },
    rightDevice: {
      type: Object,
      default: function() {
        return {}
      }
    },
    itMonitorDevice: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      sliderWidth: 0,
      sliderIndex: 1,
      slider: [
        {
          label: '告警信息',
          pKey: 'ConfigurationAlarmLog'
        },
        {
          label: '动环监控',
          pKey: 'ConfigurationRing'
        },
        {
          label: 'IT监控',
          pKey: 'ConfigurationItMonitor'
        }
      ],
      getVuexStoragePermissionData: []
    }
  },
  mounted() {
    this.sliderWidth = this.$refs.slider.clientWidth
    this.getVuexStoragePermissionData = getVuexStoragePermission()
    console.log(this.getVuexStoragePermissionData)
    if (this.getVuexStoragePermissionData.length === 0) {
      this.slider = []
    } else {
      const getSlide = this.slider
      const result = []
      getSlide.forEach(item => {
        const getPItem = this.getVuexStoragePermissionData.indexOf(item.pKey)
        if (getPItem !== -1) {
          result.push(item)
        }
      })
      this.slider = result
    }
  },
  methods: {
    changeSlider(i) {
      this.sliderIndex = i
    }
  }
}
</script>

<style lang="scss" scoped>
.env-detail {
  height: 100%;
  margin-left: 10px;

  .slider {
    display: flex;
    height: 100%;

    .slider-btn {
      .active-slider-item {
        color: #0145AB !important;
        background: #FFFFFF !important;
      }

      .slider-item {
        font-weight: bold;
        cursor: pointer;
        width: min-content;
        text-align: center;
        color: #999999;
        padding: 20px 12px;
        background: #EEEEEE;
      }
    }

    .slider-pane {
      width: 100%;
      height: 100%;
      background: #FFFFFF;
      overflow-y: scroll;
    }
  }
}
</style>
