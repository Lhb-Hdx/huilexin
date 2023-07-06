<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-300">
      <div class="item-content-header">
        <div class="title">系统概况</div>
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
        <div class="todo-content">
          <div class="todo-content-list">
            <el-row>
              <el-col v-for="(item, index) in todoList" :key="index" :span="12" class="content-list-item">
                <img :src="item.img" alt="">
                <div class="list-item-main">
                  <div class="item-main-title">{{ item.todoItem }}</div>
                  <div class="item-main-value">{{ item.todoValue }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { callbackDay, dateFormat } from '@/utils/utils'

export default {
  name: 'SystemSituation',
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
      modelDefine: 'assetsSystemSituation',
      watchItemShow: null,
      dashboardType: 4,
      modelShow: '',
      todoList: [
        {
          todoItem: '资产总数',
          todoValue: 23,
          img: 'image/dashboard/assets_1.png'
        },
        {
          todoItem: '资产总额',
          todoValue: 42,
          img: 'image/dashboard/assets_2.png'
        },
        {
          todoItem: '闲置的资产',
          todoValue: 23,
          img: 'image/dashboard/assets_3.png'
        },
        {
          todoItem: '资产已报废的资产',
          todoValue: 42,
          img: 'image/dashboard/assets_4.png'
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
    // this.getVideoDvrDetail()
    // this.getVideoAlarmLogCount()
  },
  methods: {
    // 查询录像告警日志统计数量
    getVideoAlarmLogCount() {
      const date = new Date()
      const callbackDayList = callbackDay(30) // 倒推30天
      const sTime = `${callbackDayList[callbackDayList.length - 1]} 00:00:00`
      const eTime = `${dateFormat('YYYY-mm-dd', date)} 23:59:59`
      request({
        url: api.video.getVideoAlarmLogCount, data: { sTime, eTime }
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.todoList[2], 'todoValue', res.count) // 离线设备
        }
      })
    },
    // 获取在线离线设备
    getVideoDvrDetail() {
      return request({
        url: api.video.getVideoDvrDetail, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.todoList[0], 'todoValue', res.model.onlineCount) // 在线设备
          this.$set(this.todoList[1], 'todoValue', res.model.offlineCount) // 离线设备
        }
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
  .todo-content {
    .todo-content-list {
      padding: 20px 14px;
      .content-list-item {
        position: relative;
        padding: 20px 0;
        img {
          display: inline-block;
        }
        .list-item-main {
          display: inline-block;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 14px;
          .item-main-title {
            color: #666666;
            font-size: 14px;
            margin-bottom: 14px;
          }
          .item-main-value {
            color: #0145AB;
            font-size: 24px;
          }
        }
        .status-tags {
          display: inline-block;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 0;
          width: 28%;
          .status-tag-item {
            margin: 5px;
            color: #666666;
            padding: 8px 0;
            text-align: center;
            font-size: 14px;
          }
          .normal {
            background: rgba(0,178,133,.4);
            font-weight: bold;
            .value {
              color: #00B285;
            }
          }
          .error {
            background: rgba(240,25,32,.4);
            font-weight: bold;
            .value {
              color: #F01920;
            }
          }
        }
      }
    }
  }
}
</style>
