<template>
  <div ref="deviceTypeList" class="device-type-list">
    <div v-for="(item, itemIndex) in itDeviceType" :key="item.id" class="list-item">
      <div class="item-icon">
        <img :src="'image/screen/it-monitor/' + item.id + '.png'" alt="" :class="itemIndex % 2 === 0 ? 'fs' : ''">
      </div>
      <div class="item-text">{{ item.dictdataName }}</div>
      <div class="item-count">{{ item.count }}</div>
      <div class="item-percentage">
        <div v-for="(items, index) in item.onlonePercentageTag" :key="index" class="item-percentage-tag" :class="items.statue ? 'light' : ''" :style="{ 'width': itemPercentagTagWidth + 'px' }" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceTypeView',
  data() {
    return {
      paneHeight: '',
      agents: [],
      itDeviceType: [],
      itemPercentagTagWidth: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('handler-top-project', async (val) => {
      this.agents = val.agents
      await this.init()
    })
    this.$EventBus.$on('start-up-date', async () => {

    })
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-top-project,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 25

      const deviceTypeListWidth = this.$refs.deviceTypeList.clientWidth
      this.itemPercentagTagWidth = (((deviceTypeListWidth / 8) - 20) / 20) - 2
    },
    // 初始化
    async init() {
      const itDeviceType = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type', limit: -1 }
      })
      const getHyitHostTypeStatictics = await this.$request({
        url: this.api.itMonitor.getHyitHostTypeStatictics,
        data: { agents: this.$tool.uniqueArray(this.agents).toString() }
      })
      if (itDeviceType.code === 1 && itDeviceType.data) {
        itDeviceType.data.forEach(item => {
          const idx = getHyitHostTypeStatictics.data.findIndex(el => +el.devType === +item.id)
          if (idx !== -1) {
            item.count = getHyitHostTypeStatictics.data[idx].count
            item.onlonePercentage = this.$tool.percentage(getHyitHostTypeStatictics.data[idx].online, getHyitHostTypeStatictics.data[idx].count).toFixed(0)
            const lightCount = item.onlonePercentage / (100 / 20)
            const onlinePercentageTag = []
            for (let i = 0; i < 20; i++) {
              onlinePercentageTag.push({ i: i + 1, statue: i + 1 <= lightCount })
            }
            item.onlonePercentageTag = onlinePercentageTag
          }
        })
      }
      this.itDeviceType = itDeviceType.data.filter(el => +el.dictdataValue !== 9)
    }
  }
}
</script>

<style lang="scss" scoped>
.device-type-list {
  width: 100%;
  display: flex;
  padding-bottom: 35px;
  text-align: center;
  background: url(/image/screen/icobox_bg.png) no-repeat 50% bottom;
  height: 216px;
  .list-item {
    flex: 1;
    margin: 0 10px;
    text-align: center;
    .item-icon {
      height: 85px;
      margin: 0 auto;
      background: url(/image/screen/ico_bg.png) no-repeat;
      background-size: 100%;
      img {
        animation: float 1s infinite ease-in-out alternate;
      }
    }
    .item-text {
      width: 100%;
      height: 25px;
      line-height: 25px;
      background: rgba(10,17,59,80);
      color: #99E5FF;
      font-size: 14px;
      margin-top: 10px;
    }
    .item-count {
      font-size: 24px;
      margin: 10px auto;
      font-weight: bold;
      background-image: -webkit-linear-gradient(bottom,#00BFFF,#08F2F5,#ffffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      height: 30px;
      line-height: 30px;
    }
    .item-percentage {
      display: flex;
      width: 100%;
      justify-content: space-between;
      .item-percentage-tag {
        background: #1b3883;
        height: 11px;
        margin: 0 1px;
        //&:first-of-type {
        //  margin-left: 0 !important;
        //}
        //&:last-of-type {
        //  margin-right: 0 !important;
        //}
      }
      .light {
        background: #a9e3fc;
      }
    }
  }
  @keyframes float {
    100% {
      transform:translateY(50px);
    }
  }
}
.fs {
  animation-delay:.3s !important
}
</style>
