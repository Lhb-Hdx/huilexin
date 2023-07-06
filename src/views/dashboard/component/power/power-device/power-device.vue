<template>
  <div class="power-device">
    <img src="image/dashboard/power/bg.png" style="width: 100%; height:100%">
    <div class="device-box">
      <div
        v-for="(item,index) in sliceDeviceList"
        :key="item.hyDeviceId"
        class="device"
        :style="{top:deviceLocal[index]['y']+'%', left:deviceLocal[index]['x']+'%',}"
        @mouseenter="onmouseenter($event,item)"
      >
        <img v-if="item.hyDevTypeValue!==1000 && item.hyState===0" slot="reference" src="image/dashboard/power/ico_yc.png" alt="" height="30">
        <img v-if="item.hyDevTypeValue===1000 && item.hyState===1" slot="reference" src="image/dashboard/power/uco_yj.png" alt="" height="30">
        <el-popover
          placement="top"
          width="200"
          trigger="hover"
        >
          <div>
            <div>{{ deviceInfo.deviceName }}</div>
            <div>{{ deviceInfo.humidity }}</div>
            <div>{{ deviceInfo.temperature }}</div>
          </div>
          <img v-if="item.hyDevTypeValue===1000" slot="reference" src="image/dashboard/power/_r4_dj.png" alt="" height="30">
        </el-popover>
      </div>
    </div>

    <!--    <div class="info-box" :style="{top:deviceInfo.y+'px',left:deviceInfo.x+'px'}">-->
    <!--      <div>lll</div>-->
    <!--      <div>lll</div>-->
    <!--      <div>lll</div>-->
    <!--    </div>-->
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'PowerDevice',
  props: {
    sliceDeviceList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      deviceLocal: [
        { x: 44.5, y: 33.5 },
        { x: 57, y: 33.5 },
        { x: 37.5, y: 42 },
        { x: 44.5, y: 42 },
        { x: 50.5, y: 42 },
        { x: 57.5, y: 42 },
        { x: 32.5, y: 49.5 },
        { x: 39.5, y: 49.5 },
        { x: 47.5, y: 49.5 },
        { x: 55, y: 49.5 },
        { x: 62.5, y: 49.5 },
        { x: 35, y: 61 },
        { x: 43.5, y: 61 },
        { x: 51.5, y: 61 },
        { x: 59.5, y: 61 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ],
      deviceInfo: {
        temperature: 0,
        humidity: 0,
        deviceName: ''
      }
    }
  },
  methods: {
    mathLocal(max = 60, min = 20) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    async onmouseenter(e, item) {
      if (item.hyDevTypeValue !== 1000) return
      this.deviceInfo.deviceName = item.hyAlias
      this.deviceInfo.humidity = 0
      this.deviceInfo.temperature = 0
      let deviceValuelist = await this.findHyitDeviceValue(item.hyDeviceId)
      const ValueTypes = await this.findHyitValueType(deviceValuelist.map(it => it.hyType).join(','))
      for (let k = 0; k < ValueTypes.length; k++) {
        const type = ValueTypes[k]
        for (let j = 0; j < deviceValuelist.length; j++) {
          const deviceValue = deviceValuelist[j]
          const boole = await this.init(deviceValue, type, '温度')
          if (boole) break
        }
      }
      for (let k = 0; k < ValueTypes.length; k++) {
        const type = ValueTypes[k]
        for (let j = 0; j < deviceValuelist.length; j++) {
          const deviceValue = deviceValuelist[j]
          const boole = await this.init(deviceValue, type, '湿度')
          if (boole) break
        }
      }
    },
    async init(deviceValue, type, name) {
      if (deviceValue['hyType'] === type['hyTypeId']) {
        const str = this.$tool.humpStr(type['hyFieldName'])
        if (deviceValue.hyDes.indexOf(name) !== -1) {
          console.log(12132)
          if (name === '温度') this.deviceInfo.temperature = deviceValue[str]
          if (name === '湿度') this.deviceInfo.humidity = deviceValue[str]
          return true
        }
      }
    },
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }
      })
      if (code !== 1) return
      return data
    },
    async findHyitValueType(hyTypes) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyTypes }
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style scoped>
.power-device{
  position: relative;
}
img{
  object-fit:cover;
}
.device{
  position: absolute;
}
.info-box{
  position: absolute;
  background: rgba(0,0,0,.5);
  width: 200px;
  height:100px;
}
</style>
