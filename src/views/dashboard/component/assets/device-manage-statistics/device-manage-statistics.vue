<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-300">
      <div class="item-content-header">
        <div class="title">设备管理统计</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-body">
        <div class="percentage-list">
          <div v-for="(item, index) in cpuList" :key="index" class="percentage-list-item flexBox">
            <div class="list-item-title">{{ item.user }}</div>
            <el-progress style="width: 100%" :percentage="item.percentage" :color="item.color" :stroke-width="9" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceManageStatistics',
  components: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'assetsDeviceManageStatistics',
      watchItemShow: null,
      dashboardType: 4,
      modelShow: '',
      cpuList: [
        { user: 'Admin', percentage: 70, color: '#00B285' },
        { user: 'Admin', percentage: 60, color: '#00B285' },
        { user: 'Admin', percentage: 50, color: '#00B285' },
        { user: 'Admin', percentage: 40, color: '#00B285' },
        { user: 'Admin', percentage: 30, color: '#00B285' }
      ]
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      console.log(val)
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.item-content-body {
  .percentage-list {
    .percentage-list-item {
      margin: 26px 0;
      .list-item-title {
        color: #333333;
        font-size: 14px;
        margin-bottom: 5px;
        margin-right: 10px;
      }
    }
  }
}
</style>
