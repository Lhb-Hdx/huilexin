<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-235">
      <div class="item-content-header">
        <div class="title">待办事项</div>
        <div class="line"><div class="blo" /></div>
      </div>
      <div class="chunk-opts">
        <div class="chunk-opts-select">
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
              <el-col v-for="(item, index) in todoList" :key="index" :span="8" class="content-list-item">
                <img :src="item.icon" alt="">
                <div class="list-item-main">
                  <div class="item-main-title">{{ item.todoItem }}</div>
                  <div class="item-main-value">{{ item.todoValue }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="todo-content-tool">
            <div class="new-polling-time inline">
              最近一次巡检时间为：{{ pollingTime }}
            </div>
            <div class="link-btn inline">
              <div class="link-btn-item inline pointer">查看巡检报告</div>
              <el-divider direction="vertical" />
              <div class="link-btn-item inline pointer">手动巡检</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'ItmsTodo',
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
      modelDefine: 'todoConfigure',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      pollingTime: '2021-08-13 16:23:24',
      todoList: [
        {
          icon: 'image/dashboard/itms_todo.png',
          todoItem: '我的事项',
          todoValue: 5
        },
        {
          icon: 'image/dashboard/itms_todo2.png',
          todoItem: '待审批工单',
          todoValue: 2
        },
        {
          icon: 'image/dashboard/itms_todo3.png',
          todoItem: '待处理工单',
          todoValue: 1
        }
      ],
      loading: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    // 接口暂时没有了了，注释先
    // this.myOpmMaintenanceTaskCount()
    // this.pendOpmMaintenanceCount()
    // this.transactOpmMaintenanceCount()
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    setTimeout(() => {
      this.loading = false
    }, 500)
  },
  methods: {
    myOpmMaintenanceTaskCount() {
      request({
        url: api.opm.myOpmMaintenanceTaskCount, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.todoList[0], 'todoValue', res.model.value)
        }
      })
    },
    pendOpmMaintenanceCount() {
      request({
        url: api.opm.pendOpmMaintenanceCount, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.todoList[1], 'todoValue', res.model.value)
        }
      })
    },
    transactOpmMaintenanceCount() {
      request({
        url: api.opm.transactOpmMaintenanceCount, data: {}
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.todoList[2], 'todoValue', res.model.value)
        }
      })
    },
    // 更改显示配置
    changemodelDefine(val) {
      if (val === false) {
        console.log(1, val, Number(val), '新增', this.isShow)
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      } else {
        // 删除
        console.log(2, val, Number(val), '删除', this.isShow)
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
.chunk-opts {
  float: right;
  margin-top: -30px;
}
.item-content-body {
  .todo-content {
    .todo-content-list {
      padding: 30px 4px;
      .content-list-item {
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
      }
    }
    .todo-content-tool {
      padding-top: 14px;
      .new-polling-time {
        width: 40%;
        color: #333333;
        font-size: 14px;
      }
      .link-btn {
        width: 60%;
        color: #0045AB;
        .link-btn-item {
          text-align: center;
        }
      }
    }
  }
}
</style>
