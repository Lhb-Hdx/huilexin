<template>
  <div>
    <div class="box">
      <div v-for="(item, index) in arr" v-show="item.show" :key="index" :style="{'order':item.priority}">
        <div class="box-item flex-center" :style="{background:+item.hyValInt===0?'rgba(0,178,133,0.1)':'rgba(245,108,108,0.1)'}">
          <div :style="{color:$tool.formatStr(item.status,'在线:#00b285,离线:#F56C6C,正常:#00b285,异常:#F56C6C,开启:#00b285,关闭:#F56C6C')}" class="font-20 font-weight mt-6" style="min-height:23px">{{ item.status }}{{ item.hyUnits || '' }}</div>
          <div class="font-16 mt-16 box-item-name linear-1"> {{ item.hyVname || item.hyDes }}</div>
          <!--          <div :style="{color:$tool.formatStr(item.status,'在线:#67c23a,离线:#F56C6C,正常:#00b285,异常:#F56C6C,开启:#00b285,关闭:#F56C6C')}" class="font-20 font-weight mt-6" style="min-height:23px">{{ item.status }}{{ item.hyUnits }}</div>-->
        </div>
      </div>
    </div>
    <el-empty v-if="!arr.length" style="margin: 0 auto;padding:10px 0" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'Groove',
  props: {
    list: {
      type: Object,
      default: () => []
    },
    type: {
      type: Number,
      default: 0
    }

  },
  data() {
    return {
      arr: [],
      showLoading: true
    }
  },
  mounted() {
    this.init(this.list.hyitDevice, this.list.hyitValueType, this.list.res, this.list.dhMenuItem)
  },
  methods: {
    async findHyitDeviceValueMappings(hyVids) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVids, limit: -1 }})
      if (code === 1) return data
    },
    async init(hyitDevice, hyitValueType, val, dhMenuItem) {
      if (!hyitDevice || !hyitValueType) {
        this.showLoading = false
        return
      }
      let arr = []
      for (let i = 0; i < hyitValueType.length; i++) {
        const hyitValueTypeEle = hyitValueType[i]
        for (let j = 0; j < hyitDevice.length; j++) {
          const hyitDeviceEle = hyitDevice[j]
          if (hyitDeviceEle['hyType'] === hyitValueTypeEle['hyTypeId']) {
            let str = this.$tool.humpStr(hyitValueTypeEle['hyFieldName'])
            const priority = val.find(
              it => it['vid'] === hyitDeviceEle['hyVid']
            )
            arr.push({
              ...hyitDeviceEle,
              status: +hyitDeviceEle[str] || 0,
              priority: priority?.priority || 0,
              show: priority?.history
            })
          }
        }
      }
      const hyVids = hyitDevice.map(it => it.hyVid).filter(Boolean).toString()
      const mappingList = await this.findHyitDeviceValueMappings(hyVids)
      for (const it of arr) {
        let hyitDeviceMappingList = mappingList.filter(item => +item.hyVid === +it.hyVid)
        console.log('hyitDeviceMappingList: ', hyitDeviceMappingList)
        let idx = hyitDeviceMappingList.find(resIt => +resIt.hyVal === +it.hyValInt)
        if (idx) it['status'] = idx['hyValName']
      }

      this.showLoading = false
      this.arr = arr
    }
  }
}
</script>

<style lang="scss" scoped>
.card{
  /* width: 22%; */
  /* flex-basis: 22%; */
  margin-bottom: 10px;
}
.box{
  width: 100%;
  display:flex;
  flex-wrap: wrap;
  .box-item{
    width: 168px;
    height: 120px;
    margin-right: 20px;
    margin-bottom: 20px;
    background: #F8FBFF;
    border-radius: 5px;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
    .box-item-name{
      color:#111;
      width: 100%;
      text-align: center;
    }
    .box-item-state{
      color:#0145AB;
    }
  }
}
</style>

