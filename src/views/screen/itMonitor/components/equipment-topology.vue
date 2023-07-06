<template>
  <div class="equipment-topology flex">
    <div class="equipment-topology-total flex-v-around">
      <div v-for="item in totalList" :key="item.title" class="total-item flex-h-center">
        <img :src="item.img" :alt="item.title" class="mr-30">
        <div>
          <div class="font-18">{{ item.title }}</div>
          <div class="font-32">{{ item.num }}</div>
        </div>
      </div>
    </div>
    <div class="equipment-topology-content">
      1
    </div>
  </div>
</template>

<script>

import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'EquipmentTopology',
  data() {
    return {
      totalList: [
        { title: '设备总数', num: 0, img: 'image/screen/it-monitor/设备总数ico.png' },
        { title: '运行业务', num: 0, img: 'image/screen/it-monitor/业务ico.png' },
        { title: '运维人员', num: 0, img: 'image/screen/it-monitor/人员ico.png' }
      ]
    }
  },
  mounted() {
    this.findHyitHost()
  },
  methods: {
    async findHyitHost() {
      let { data, code } = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, hostType: 1, agents: this.sessionStorageOperation('get', 'agentId') }})
      if (code === 1) this.$set(this.totalList[0], 'num', data.length)
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-topology{
  flex: .6;
  overflow: hidden;
  flex-direction: column;
  .equipment-topology-content{
  background-color: rgba(0,0,0,0.4);
    flex: 1;
    overflow: hidden;
    margin-top:20px;
  }
  .equipment-topology-total{
  padding-top: 35px;
  box-sizing: border-box;
    .total-item{
      img{
        width: 40px;
        height: 36px;
      }
      .font-32{
        color:#FFBF00;
      }
    }
  }
}
</style>
