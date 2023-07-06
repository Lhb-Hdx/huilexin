<template>
  <div class="grid-content bg-purple-light">
    <div class="box">
      <div v-for="(item, index) in arr" v-show="item.show" :key="index" :style="{'order':item.priority}">
        <el-card :body-style="{'padding':'10px 20px'}" class="card ml-10" shadow="never">
          <div class="font-14 linear-1"> {{ item.hyVname || item.hyDes }}</div>
          <div :style="{color:$tool.formatStr(item.status,'在线:#00b285,离线:#F56C6C,正常:#00b285,异常:#F56C6C,开启:#00b285,关闭:#F56C6C')}" class="font-20 font-weight mt-6" style="min-height:23px">{{ item.status }}{{ item.hyUnits || '' }}</div>
          <!--          <div :style="{color:$tool.formatStr(+item.hyValInt,'0:#00b285,1:#F56C6C')}" class="font-20 font-weight mt-6" style="min-height:23px">{{ item.status }}{{ item.hyUnits }}</div>-->
        </el-card>
      </div>
    </div>
    <el-empty v-show="!arr.length" style="margin: 0 auto;padding:10px 0" />
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
      arr: []
    }
  },
  mounted() {
    this.init(this.list.hyitDevice, this.list.hyitValueType, this.list.res, this.list.dhMenuItem)
  },
  methods: {
    async findHyitDeviceValueMappings(vid) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid }})
      if (code === 1) return data
    },
    async init(hyitDevice, hyitValueType, val, dhMenuItem) {
      if (!hyitDevice || !hyitValueType) return
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
            await this.findHyitDeviceValueMappings(hyitDeviceEle.hyVid).then(res => {
              console.log(res)
              let idx = res.find(resIt => +resIt.hyVal === +hyitDeviceEle.hyValInt)
              console.log(idx)
              if (idx) arr[arr.length - 1]['status'] = idx['hyValName']
            })
          }
        }
      }
      // arr.forEach((it, index) => {
      //     this.findHyitDeviceValueMappings(it.hyVid).then(res => {
      //     let idx = res.find(resIt => +resIt.hyVal === +it.val)
      //     console.log(idx)
      //     if (idx) arr[index]['val'] = idx['hyValName']
      //   })
      // })
      this.arr = arr
    }
  }
}
</script>

<style scoped>
.card{
  /* width: 22%; */
  /* flex-basis: 22%; */
  margin-bottom: 10px;
}
.box{
  display: grid;
  grid-template-columns:repeat(4,1fr)
}
</style>
