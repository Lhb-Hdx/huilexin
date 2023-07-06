<template>
  <div class="env-detail-find">
    <RotaingRight :id="deviceId" :show-config="false" @dhMenuListLength="dhMenuListLength" />
    <el-empty v-if="showEmpty" :image-size="200" :description="emptyDescription" />
  </div>
</template>

<script>
import RotaingRight from '@/views/ring-monitor/components/Device/components/rotaing-right.vue'

export default {
  name: 'RingMonitor',
  components: {
    RotaingRight
  },
  props: {
    deviceId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      activeName: '1',
      tabs: [
        { label: '温湿度', name: '1' },
        { label: '精密空调', name: '2' },
        { label: 'UPS', name: '3' },
        { label: '红外监控', name: '4' },
        { label: '漏水检测', name: '5' },
        { label: '蓄电池', name: '6' },
        { label: '供配电', name: '7' }
      ],
      showEmpty: true,
      emptyDescription: '请点击选择图上的动环设备'
    }
  },
  methods: {
    dhMenuListLength(val) {
      this.showEmpty = val === 0
      this.emptyDescription = '暂无数据'
    }
  }
}
</script>

<style lang="scss" scoped>
.env-detail-find {
  margin: 14px;
  .detail-find-title {
    background: #eeeeee;
    color: #646464;
    font-weight: bold;
    padding: 10px 14px;
  }
  .detail-find-content {
    width: 100%;
  }
}
</style>
