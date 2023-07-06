<template>
  <div ref="percentageRef" class="container-humitureNow" :style="{ 'height': paneHeight + 'px' }">
    <div class="thmain">
      <div class="thbox">
        <div class="thname">目前温度</div>
        <div class="percentage">
          <span v-for="(items, indexs) in onlinePercentageTag" :key="indexs" class="percentage_item" :class="items.statue ? 'indoor-light' : ''" :style="{ 'width': itemPercentageWidth + 'px' }" />
        </div>
        <div class="th_text text_color">{{ newTemperatureList }}<em>℃</em></div>
      </div>
      <div class="thbox">
        <div class="thname">目前湿度</div>
        <div class="percentage2">
          <span v-for="(items, indexs) in onlinePercentageTagTow" :key="indexs" class="percentage_item" :class="items.statue ? 'outdoor-light' : ''" :style="{ 'width': itemPercentageWidth + 'px' }" />
        </div>
        <div class="th_text text_color">{{ newHumidityList }} <em>%</em></div>
      </div>
    </div>
    <div class="kt_cs">
      <dl>
        <dt>平均温度</dt>
        <dd class="text_color">{{ getAverage( temperatureInfo,'temperatureInfo' ) }} <em>℃</em></dd>
      </dl>
      <dl>
        <dt>最高温度</dt>
        <dd class="text_color">{{ getMax( temperatureInfo,'temperatureInfo' ) }} <em>℃</em></dd>
      </dl>
      <dl>
        <dt>最低温度</dt>
        <dd class="text_color">{{ getMin( temperatureInfo,'temperatureInfo' ) }} <em>℃</em></dd>
      </dl>
      <dl>
        <dt>平均湿度</dt>
        <dd class="text_color">{{ getAverage( humidityInfo,'humidityInfo' ) }}<em>%</em></dd>
      </dl>
      <dl>
        <dt>最高湿度</dt>
        <dd class="text_color">{{ getMax( humidityInfo,'humidityInfo' ) }} <em>%</em></dd>
      </dl>
      <dl>
        <dt>最低湿度</dt>
        <dd class="text_color">{{ getMin( humidityInfo,'humidityInfo' ) }} <em>%</em></dd>
      </dl>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LeftHumitureNow',
  data() {
    return {
      paneHeight: '',
      itemPercentageWidth: '',
      onlinePercentageTag: [],
      onlinePercentageTagTow: [],
      newTemperatureList: 0,
      newHumidityList: 0,
      nowTemperature: 0,
      temperatureInfo: {// 温度
        average: null,
        max: 0,
        min: 0
      },
      nowhumidity: 0,
      humidityInfo: {// 湿度
        average: null,
        max: 0,
        min: 0
      }
    }
  },
  computed: {
    getAverage() {
      return function(objData, type) {
        if (type === 'temperatureInfo') {
          if (objData?.average) {
            return objData.average
          }
        }
        if (type === 'humidityInfo') {
          if (objData?.average) {
            return objData.average
          }
        }
        return 0
      }
    },
    getMax() {
      return function(objData, type) {
        if (type === 'temperatureInfo') {
          if (objData?.max) {
            return objData.max
          }
        }
        if (type === 'humidityInfo') {
          if (objData?.max) {
            return objData.max
          }
        }
        return 0
      }
    },
    getMin() {
      return function(objData, type) {
        if (type === 'temperatureInfo') {
          if (objData?.min) {
            return objData.min
          }
        }
        if (type === 'humidityInfo') {
          if (objData?.min) {
            return objData.min
          }
        }
        return 0
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setSize)
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.getMeanData(this.newTemperatureList, this.newHumidityList)
    this.getBroAirDeviceList()
  },
  methods: {
    setSize() {
      const percentageRefWidth = this.$refs.percentageRef.clientWidth
      this.itemPercentageWidth = ((percentageRefWidth / 2) * 0.54) - 4

      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 26
    },
    // 获取当前温湿度
    getBroAirDeviceList() {
      this.$EventBus.$on('meanParamsList', res => {
        this.temperatureInfo = res.temperatureData[0]
        this.humidityInfo = res.humidityData[0]
      })
      this.$EventBus.$on('broAirDeviceList', res => {
        this.newTemperatureList = res.nowTemperature[0]
        this.newHumidityList = res.nowhumidity[0]
        this.getMeanData(res.nowTemperature[0], res.nowhumidity[0])
      })
    },
    // 温度湿度平均值
    getMeanData(temperatureList, humidityList) {
      // 目前温度
      const onlonePercentage = this.$tool.percentage(temperatureList, 100)
      const lightCount = onlonePercentage / (100 / 20)
      const onlinePercentageTag = []
      for (let i = 0; i < 20; i++) {
        onlinePercentageTag.push({ i: i + 1, statue: i + 1 <= lightCount})
      }
      this.onlinePercentageTag = onlinePercentageTag
      // 目前湿度
      const onlonePercentage2 = this.$tool.percentage(humidityList, 100)
      const lightCount2 = onlonePercentage2 / (100 / 20)
      const onlinePercentageTagTow = []
      for (let i = 0; i < 20; i++) {
        onlinePercentageTagTow.push({ i: i + 1, statue: i + 1 <= lightCount2})
      }
      this.onlinePercentageTagTow = onlinePercentageTagTow
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/screen/power/componentallstyle/index.scss';
.container-humitureNow {
  // height: 25%;
  .percentage,.percentage2 {
    display: flex;
    width: 84%;
    justify-content: space-between;
    .percentage_item{
      background: #1b3883;
      height: 12px;
      margin: 0 1px;
    }

    .indoor-light {
      background: linear-gradient(to left,#3cc000,#9cff00);
    }
    .outdoor-light {
        background: linear-gradient(to right, blue, #0093de);
      }
  }

  .thmain {
    overflow: hidden;
    // margin: 10px auto 20px;
  }

  .thbox {
    float: left;
    width: 50%;
    padding-left: 15px;
  }

  .thbox .thname {
    float: left;
    width: 100%;
    line-height: 15px;
    padding: 15px 0 10px;
    font-size: 14px;
    font-weight: bold;
    color: #ffffff;
  }

  .thbox .th_text {
    float: left;
    width: 100%;
    padding: 5px 0 10px;
    font-size: 24px;
  }

  .thbox .th_text em {
    font-size: 12px;
  }

  .thbox .th_hl dl {
    float: left;
    width: 50%;
  }

  .thbox .th_hl dt {
    line-height: 30px;
    color: #cccccc;
  }

  .thbox .th_hl dd {
    font-size: 20px;
    color: #ffffff;
    padding: 10px 0;
  }

  .kt_cs {
    width: 100%;
  }

  .kt_cs dl {
    float: left;
    width: 33.3%;
    margin-bottom: 15px;
    text-align: center;
  }

  .kt_cs dt {
    line-height: 25px;
    background: #0A113B;
    color: #cccccc;
  }

  .kt_cs dd {
    margin: 5px auto;
    color: #ffffff;
    font-size: 20px;
  }

  .kt_cs dd em {
    font-size: 12px;
  }
}
</style>

