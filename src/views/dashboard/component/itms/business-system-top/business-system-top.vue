<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-353">
      <div class="item-content-header">
        <div class="title">业务系统运行TOP</div>
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
        <div class="content-body-btn">
          <el-button-group>
            <el-button v-for="item in valueBtns" :key="item.valueKey" :type="systemActiveSelectValue === item.valueKey ? 'primary' : 'default'" @click="handleValue(item.valueKey)">
              {{ item.name }}</el-button>
          </el-button-group>
        </div>
        <div class="content-body-list">
          <el-row>
            <el-col v-for="(item, index) in systemList" :key="index" :span="8" class="body-list-item">
              <div class="business-image-wrapper">
                <span class="left-icon-wrapper">
                  <SvgIcon icon-class="setting-l" :class="'left-icon zhuanquan a-yj a-time1'" />
                </span>
                <span class="right-icon-wrapper">
                  <SvgIcon icon-class="setting-r" :class="'right-icon zhuanquan-ni a-yj a-time1'" />
                </span>
              </div>
              <div class="business-info">
                <div class="info-item-name overflow-text-a">{{ item.name }}</div>
                <el-row class="row">
                  <el-col :span="8">
                    <div class="info-item-title">健康度</div>
                    <div class="info-item-value" :class="systemActiveSelectValue === 1 ? 'active' : ''">{{ setSystemLogData(item.healthy) }}%</div>
                  </el-col>
                  <el-col :span="8">
                    <div class="info-item-title">繁忙度</div>
                    <div class="info-item-value" :class="systemActiveSelectValue === 2 ? 'active' : ''">{{ setSystemLogData(item.busy) }}%</div>
                  </el-col>
                  <el-col :span="8">
                    <div class="info-item-title">可用度</div>
                    <div class="info-item-value" :class="systemActiveSelectValue === 3 ? 'active' : ''">{{ setSystemLogData(item.available) }} %</div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'BusinessSystemTop',
  components: {
    SvgIcon
  },
  props: {
    agentGroupId: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'businessSystemTop',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      systemActiveSelectValue: 1,
      valueBtns: [
        {
          name: '健康度',
          valueKey: 1
        },
        {
          name: '繁忙度',
          valueKey: 2
        },
        {
          name: '可用度',
          valueKey: 3
        }
      ],
      systemList: [],
      loading: false
    }
  },
  computed: {
    setSystemLogData() {
      return function(value) {
        return value ? value.toFixed(2) : 0
      }
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
    this.loadTopoList()
  },
  methods: {
    handleValue(vk) {
      this.systemActiveSelectValue = vk
      this.loadTopoList()
    },
    loadTopoList() {
      this.loading = true
      request({
        url: api.bsTopSystem.findBsTopSystem, data: { page: 1, limit: 3, orderby: this.systemActiveSelectValue, agentGroupId: this.agentGroupId }
      }).then(async res => {
        if (res.code === 1) {
          this.systemList = res.data
        }
        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    },
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
          dashboardType: 1
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
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
  .content-body-btn {
    padding-top: 14px;
  }
  .content-body-list {
    .body-list-item {
      padding-top: 30px;
      .business-image-wrapper {
        color: #0145ab;
        text-align: center;
        & > span {
          display: inline-block;
        }
        .left-icon-wrapper {
          transform: translate(5px, -5px);
        }
        .right-icon-wrapper {
          transform: translate(-5px, 5px);
        }
        .left-icon {
          font-size: 100px;
        }
        .right-icon {
          font-size: 50px;
        }
      }
      .business-info {
        text-align: center;
        .info-item-name {
          text-align: center;
          padding: 14px 0;
          font-size: 14px;
        }
        .info-item-title {
          font-size: 14px;
          padding-bottom: 10px;
          color: #999999;
        }
        .active {
          color: red;
        }
        .info-item-value {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
