<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-610">
      <div class="item-content-header">
        <div class="title">资产价值TOP</div>
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
        <div class="assets-cost-list">
          <div class="cost-list-header flexBox align-item-center">
            <div class="list-header-item title">名称</div>
            <div class="list-header-item cost">价值</div>
          </div>
          <div class="cost-list-body">
            <div v-for="(item, index) in costList" :key="index" class="list-body-item flexBox align-item-center">
              <div class="body-item-left">
                <div class="body-item-title overflow-text-a">{{ item.title }}</div>
                <div class="body-item-desc">{{ item.desc }}</div>
              </div>
              <div class="body-item-right">{{ item.cost }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssetsCostTop',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'assetsCostTop',
      watchItemShow: null,
      dashboardType: 4,
      modelShow: '',
      costList: [
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        },
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        },
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        },
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        },
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        },
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        },
        {
          title: '华为(HUAWEI)视频会议MCU协作服务器',
          desc: 'ZC019012457-01',
          cost: 22222.22
        }
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
.assets-cost-list {
  margin-top: 14px;
  .cost-list-header {
    padding: 10px 0;
    background: #DDDDDD;
    .list-header-item {
      text-align: center;
      font-size: 14px;
    }
    .title {
      width: 65%;
    }
    .cost {
      width: 35%;
    }
  }
  .cost-list-body {
    font-size: 14px;
    .list-body-item {
      padding: 15px 0px;
      .body-item-left {
        width: 60%;
        padding-left: 10px;
        .body-item-title {
          color: #333333;
          padding-bottom: 10px;
        }
        .body-item-desc {
          color: #999999;
        }
      }
      .body-item-right {
        width: 35%;
        padding-right: 10px;
        text-align: right;
      }
    }
    .list-body-item:nth-child(2n) {
      background: rgba(205, 205, 205, .2);
    }
  }

}
</style>
