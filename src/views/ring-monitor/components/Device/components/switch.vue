<template>
  <div
    v-loading="showLoading"

    element-loading-spinner="el-icon-loading"
    class="ring-switch flex-h-center flex-wrap"
  >
    <div v-for="(item,index) in arr" :key="index" :style="{order:item.priority}">
      <div v-if="item.show" :key="item.hyVid" class="switch-item flex-center">
        <div class="mb-10 font-22" :style="{color:$tool.formatStr(item.hyValInt,'0:#F35252,1:#2BCC9A')}">{{ item.hyValInt===0?'关闭':'开启' }}</div>
        <div class="mb-16">{{ item.hyVname || item.hyDes }}</div>
        <div class="switch-btn-box">
          <div class="switch-btn flex-center pointer" :style="{backgroundColor:$tool.formatStr(item.hyValInt,'0:#2BCC9A,1:#F35252')}" @click="setVal(item,index)">{{ $tool.formatStr(item.hyValInt, '0:开启,1:关闭') }}</div>
          <el-progress :percentage="item.progress" :stroke-width="4" :text-inside="true" color="rgb(43, 204, 154)" :width="80" status="exception" type="circle" />
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
  name: 'SwitchOc',
  props: {
    list: {
      type: Object,
      default: () => []
    }

  },
  data() {
    return {
      arr: [],
      showLoading: true
    }
  },
  computed: {
  },
  mounted() {
    this.init(this.list.hyitDevice, this.list.hyitValueType, this.list.res)
  },
  methods: {
    async findHyitDeviceValueMappings(vid) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid: vid, limit: -1 }})
      if (code === 1) return data
    },
    async init(hyitDevice, hyitValueType, val) {
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
            this.$tool.humpStr(hyitValueTypeEle['hyFieldName'])
            const priority = val.find(it => it['vid'] === hyitDeviceEle['hyVid'])
            arr.push({
              ...hyitDeviceEle,
              // status: +hyitDeviceEle[str] || 0,
              // status: hyitDeviceEle['hyState'] || 0,
              priority: priority?.priority || 0,
              show: priority?.history,
              hyValInt: +hyitDeviceEle.hyValInt,
              progress: +hyitDeviceEle.hyValInt === 0 ? 0 : 100
            })
            await this.findHyitDeviceValueMappings(hyitDeviceEle.hyVid).then(res => {
              console.log(res)

              let idx = res.find(resIt => +resIt.hyVal === +hyitDeviceEle.hyVal)
              console.log(idx)
              if (idx) arr[arr.length - 1]['status'] = idx['hyValName']
            })
          }
        }
      }
      this.showLoading = false
      this.arr = arr
    },
    async setVal(item, index) {
      if (item.uptime && +new Date() - item.uptime < 10000) return this.$message.error('距离上次点击不到10秒')
      let agentId = ''
      let { code, data } = await request({ url: api.powerEnv.findHyitAgentSubsystem, data: { sbId: item.hySbId }})
      if (code !== 1) return this.$message.error('操作失败')
      agentId = data[0]['agentId']
      let { code: setCode } = await request({ url: api.powerEnv.setVal, data: { sbId: item.hySbId, agentId, deviceId: item.hyDeviceId, dhVid: item.hyZitemid, value: item.hyValInt === 1 ? 0 : 1 }})
      if (setCode !== 1) return this.$message.error('操作失败')
      this.$message.success('操作成功')
      let initHyValInt = item.hyValInt
      // eslint-disable-next-line require-atomic-updates
      item.uptime = +new Date()
      // eslint-disable-next-line require-atomic-updates
      item.hyValInt = +item.hyValInt === 0 ? 1 : 0
      if (initHyValInt === 0) {
        let num = 0
        let timer = null
        timer = setInterval(() => {
          if (num === 100) return clearInterval(timer)
          this.$set(this.arr[index], 'progress', ++num)
        }, 100)
      } else {
        let num = 100
        let timer = null
        timer = setInterval(() => {
          if (num === 0) return clearInterval(timer)
          this.$set(this.arr[index], 'progress', --num)
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ring-switch{
  .switch-item{
    width: 120px;
    height: 180px;
    background-color: #F6F6F6;
    margin-right: 20px;
    margin-bottom: 20px;
    flex-direction: column;
    .switch-btn-box{
      height:80px;
      width: 80px;
      position: relative;
      .switch-btn{
        position: absolute;
        left: 0;
        top: 0;
        bottom:0;
        right: 0;
        z-index: 1000;
        margin: auto;
        width: 70%;
        height:70%;
        border-radius: 50%;
        color: #fff;
      }
    }

  }
}
</style>
