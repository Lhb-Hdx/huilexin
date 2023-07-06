<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-191">
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
              <el-col v-for="(item, index) in todoList" :key="index" :span="11" :offset="item.offset" class="content-list-item">
                <img :src="item.img" alt="">
                <div class="list-item-main">
                  <div class="item-main-title">{{ item.todoItem }}</div>
                  <div class="item-main-value">{{ item.todoValue }}</div>
                </div>
                <div class="status-tags">
                  <div class="status-tag-item normal">正常项：<span class="value">{{ item.normalValue }}</span></div>
                  <div class="status-tag-item error">异常项：<span class="value">{{ item.errorValue }}</span></div>
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
// import { callbackDay, dateFormat } from '@/utils/utils'

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
      modelDefine: 'powerSystemSituation',
      watchItemShow: null,
      dashboardType: 3,
      modelShow: '',
      todoList: [
        {
          todoItem: '设备数量',
          todoValue: 23,
          img: 'image/dashboard/power_survey_1.png',
          normalValue: 23,
          errorValue: 0,
          offset: 0
        },
        {
          todoItem: '主机数量',
          todoValue: 42,
          img: 'image/dashboard/power_survey_2.png',
          normalValue: 23,
          errorValue: 0,
          offset: 2
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
    this.findDeviceNumAndState()
    this.findHostNumAndState()
  },
  methods: {
    async  findDeviceNumAndState() {
      let { code, data } = await request({ url: api.powerEnv.findDeviceNumAndState, data: {}})
      if (code !== 1) return
      const todoValue = data.reduce((pre, next) => pre + +next.count, 0)
      const errorValue = data.reduce((pre, it) => {
        if (+it.hyState === 0) return pre + +it.count
        return pre
      }, 0)
      const normalValue = data.reduce((pre, it) => {
        if (+it.hyState === 1) return pre + +it.count
        return pre
      }, 0)
      this.$set(this.todoList, 0, {
        ...this.todoList[0],
        todoValue,
        normalValue,
        errorValue
      })
    },
    async findHostNumAndState() {
      let { code, data } = await request({ url: api.powerEnv.findHostNumAndState, data: {}})
      if (code !== 1) return
      const todoValue = data.reduce((pre, next) => pre + +next.count, 0)
      const errorValue = data.reduce((pre, it) => {
        if (+it.hyLinkState === 0) return pre + +it.count
        return pre
      }, 0)
      const normalValue = data.reduce((pre, it) => {
        if (+it.hyLinkState !== 0) return pre + +it.count
        return pre
      }, 0)
      this.$set(this.todoList, 1, {
        ...this.todoList[1],
        todoValue,
        normalValue,
        errorValue
      })
      return data
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
          width: 35%;
          .status-tag-item {
            margin-bottom: 5px;
            color: #666666;
            padding: 8px 8px;
            text-align: left;
            font-size: 14px;
          }
          .status-tag-item:last-child {
            margin-bottom: 0;
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
            /*font-weight: bold;*/
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
