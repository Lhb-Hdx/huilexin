<template>
  <div ref="deviceTypeList" class="icolist">
    <TransitionGroup name="list" tag="span" appear style="display: flex;" @enter="enter">
      <div v-for="item in DevTypeList" :key="item.hyDevTypeId" class="icomain">
        <div class="icobg">
          <img id="animation" :src="item.deviceurl">
        </div>
        <div class="ico_name">{{ item.hyDevTypeName }}</div>
        <div class="ico_no text_color">{{ item.deviceList.length }}</div>

        <div v-if="item.percentageTagNull.length > 0" class="item-percentage">
          <div v-for="(itemN, indexN) in item.percentageTagNull" :key="indexN" class="item-percentage-tag" :style="{ 'width': itemPercentagTagWidth + 'px' }" />
        </div>
        <div v-else class="item-percentage">
          <div v-for="(items, indexs) in item.onlonePercentageTag" :key="indexs" class="item-percentage-tag" :class="items.statue ? 'light' : ''" :style="{ 'width': itemPercentagTagWidth + 'px' }" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'

export default {
  name: 'CenterDeviceList',
  components: {
  },
  props: {
    selectRegionObject: {
      type: Object,
      default() {
        return { }
      }
    }
  },
  data() {
    return {
      deviceUrlLsit: [
        {
          value: 0,
          hyDevTypeName: 'UPS',
          deviceurl: 'image/screen/power/ico_dh1.png',
          deviceList: []
        },
        {
          value: 1,
          hyDevTypeName: '蓄电池',
          deviceurl: 'image/screen/power/ico_dh2.png',
          deviceList: []
        },
        {
          value: 2,
          hyDevTypeName: '列头柜',
          deviceurl: 'image/screen/power/ico_dh3.png',
          deviceList: []
        },
        {
          value: 3,
          hyDevTypeName: '精密空调',
          deviceurl: 'image/screen/power/ico_dh4.png',
          deviceList: []
        },
        {
          value: 4,
          hyDevTypeName: '供配电',
          deviceurl: 'image/screen/power/ico_dh5.png',
          deviceList: []
        },
        {
          value: 6,
          hyDevTypeName: '红外监测',
          deviceurl: 'image/screen/power/ico_dh6.png',
          deviceList: []
        },
        {
          value: 7,
          hyDevTypeName: '漏水监控',
          deviceurl: 'image/screen/power/ico_dh7.png',
          deviceList: []
        },
        {
          value: 8,
          hyDevTypeName: '烟感器',
          deviceurl: 'image/screen/power/ico_dh8.png',
          deviceList: []
        },
        {
          value: 9,
          hyDevTypeName: '温湿度',
          deviceurl: 'image/screen/power/ico_dh8.png',
          deviceList: []
        },
        {
          value: 10,
          hyDevTypeName: '漏水',
          deviceurl: 'image/screen/power/ico_dh7.png',
          deviceList: []
        }
      ],
      itemPercentagTagWidth: '',
      DevTypeList: [],
      sliceDeviceList: []
    }
  },
  mounted() {
    this.setSize()
    this.findHyitDevType()
  },
  methods: {
    setSize() {
      const deviceTypeListWidth = this.$refs.deviceTypeList.clientWidth
      this.itemPercentagTagWidth = (((deviceTypeListWidth / 9) - 20) / 20) - 2
    },
    // 动画
    enter(e) {
      const animations = ['animation', 'animation1', 'animation2', 'animation3', 'animation4', 'animation5', 'animation6', 'animation7', 'animation8']
      e.children[0].children[0].id = animations[ Math.floor(Math.random() * animations.length) ]
    },
    openFind(arg) {
      this.findHyitDevType()
    },
    // 获取设备数据
    async findHyitDevType() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevType, data: { Pid: 2, limit: -1 }})
      if (code !== 1) return

      // 父类型设备
      let sum = 0
      const isShowData = data.filter(it => it.isShow === 1)
      for (const item of isShowData) {
        item.deviceList = await this.findHyitDevice(item.hyDevTypeValue)
        sum = sum + Number(item.deviceList.length)
      }

      // 设配img
      const imgUrlarr = this.deviceUrlLsit
      isShowData.map(itemRoot => {
        itemRoot.onlonePercentage = this.$tool.percentage(itemRoot.deviceList.length, sum)// (num , tolel)
        const lightCount = itemRoot.onlonePercentage / (100 / 50)
        const onlinePercentageTag = []
        for (let i = 0; i < 20; i++) {
          onlinePercentageTag.push({ i: i + 1, statue: i + 1 <= lightCount})
        }
        itemRoot.onlonePercentageTag = onlinePercentageTag
        itemRoot.percentageTagNull = []
        // 不同父类设备img
        imgUrlarr.forEach(itemIm => {
          if (itemRoot?.hyDevTypeName) {
            if (itemIm?.hyDevTypeName === itemRoot.hyDevTypeName) {
              this.$set(itemRoot, 'deviceurl', itemIm.deviceurl)
            }
            itemIm.percentageTagNull = new Array(20)
          }
        })
      })

      // 对应父类下的子类型数
      for (let i = 0; i < isShowData.length; i++) {
        const it = isShowData[i]
        if (it.deviceList.length <= 0) continue
        this.sliceDeviceList.push(...it.deviceList)
      }
      this.$EventBus.$emit('sliceDeviceList', this.sliceDeviceList)
      this.DevTypeList = isShowData.length > 0 ? isShowData : imgUrlarr
    },
    // 获取设备子类型
    async findHyitDevice(hyDevTypeValue) {
      const hyAreaId = this.selectRegionObject?.hyAreaId
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { hyAreaId, hyDevTypeValue }
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/views/screen/power/componentallstyle/center-device-list.scss';
</style>

