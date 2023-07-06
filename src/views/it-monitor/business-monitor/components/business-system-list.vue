<template>
  <div class="bs-system-list">
    <div class="list-header flexBox space-between">
      <el-input v-model="listQuery.keyword" placeholder="搜索关键词" class="keyword" size="mini" clearable @clear="loadTopoList" @keyup.enter.native="loadTopoList" />
      <el-button class="filter-item" type="primary" size="mini" @click="loadTopoList">查询</el-button>
    </div>
    <div class="list-main">
      <div v-for="item in topoList" :key="item.id" class="list-item pointer" :class="changeSystemId === item.id ? 'active' : ''" @click="handlerSystem(item)">
        <div class="business-image-wrapper">
          <span class="left-icon-wrapper">
            <SvgIcon icon-class="setting-l" :class="'left-icon zhuanquan a-yj a-time1'" />
          </span>
          <span class="right-icon-wrapper">
            <SvgIcon icon-class="setting-r" :class="'right-icon zhuanquan-ni a-yj a-time1'" />
          </span>
        </div>
        <div class="list-item-info">
          <div class="flexBox item-info-title align-item-center space-between">
            <div class="overflow-text-a">{{ item.name }}</div>
            <el-tooltip class="item" effect="dark" content="图表" placement="top">
              <i class="el-icon-s-data" @click.stop="openBsSystemEcharts(item)" />
            </el-tooltip>
          </div>
          <div class="item-info-bottom flexBox">
            <div class="bottom-item">
              <div class="bottom-item-main">
                <div class="item-title">健康度</div>
                <div class="item-value" :style="{ color: setSystemLogData(item.healthy) < 90 ? listItemColor.healthyDefaultColor : listItemColor.healthyErrColor }">{{ setSystemLogData(item.healthy) }}%</div>
              </div>
            </div>
            <div class="bottom-item">
              <div class="bottom-item-main">
                <div class="item-title">可用度</div>
                <div class="item-value" :style="{ color: setSystemLogData(item.available) < 90 ? listItemColor.availableDefaultColor : listItemColor.availableErrColor }">{{ setSystemLogData(item.available) }}%</div>
              </div>
            </div>
            <div class="bottom-item">
              <div class="bottom-item-main">
                <div class="item-title">繁忙度</div>
                <div class="item-value" :style="{ color: setSystemLogData(item.busy) < 90 ? listItemColor.busyDefaultColor : listItemColor.busyErrColor }">{{ setSystemLogData(item.busy) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="60%" top="5vh">
      <el-tabs v-model="activeDeviceType" @tab-click="handleDeviceTypeClick">
        <el-tab-pane v-for="item in deviceTypeTab" :key="item.value" :label="item.label" :name="item.value">
          <SystemLogEcharts :key="reloadKey" :echarts-el="item.echartsEl" :log-data="selectLogTypeData" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import SvgIcon from '@/components/SvgIcon'
import { dateFormat, guid } from '@/utils/utils'
import SystemLogEcharts from './system-log-echarts'

export default {
  name: 'BusinessSystemList',
  components: { SvgIcon, SystemLogEcharts },
  data() {
    return {
      agentGroupId: '',
      topoList: [],
      changeSystemId: '',
      keywords: '',
      listQuery: {
        keyword: '',
        page: 1,
        limit: -1
      },
      systemLog: [],
      showDialog: false,
      dialogTitle: '',
      deviceTypeTab: [
        { label: '健康度', value: '1', echartsEl: 'healthy' },
        { label: '可用度', value: '2', echartsEl: 'available' },
        { label: '繁忙度', value: '3', echartsEl: 'busy' }
      ],
      activeDeviceType: '1',
      activeLogTypeData: {},
      selectLogTypeData: {},
      reloadKey: '',
      listItemColor: {
        healthyDefaultColor: '#000', // 健康度小于 90 颜色
        healthyErrColor: '#FE4F50', // 健康度大于 90 颜色
        availableDefaultColor: '#000', // 可用度小于 90 颜色
        availableErrColor: '#FE4F50', // 可用度大于 90 颜色
        busyDefaultColor: '#000', // 繁忙度小于 90 颜色
        busyErrColor: '#FE4F50' // 繁忙度大于 90 颜色
      }
    }
  },
  computed: {
    setSystemLogData() {
      return function(value) {
        return value ? Number(value.toFixed(2)) : 0
      }
    }
  },
  mounted() {
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    this.loadTopoList()
  },
  methods: {
    // 获取业务系统列表
    async loadTopoList() {
      request({
        url: api.bsTopSystem.findBsTopSystem, data: { ...this.listQuery, agentGroupId: this.agentGroupId }
      }).then(async res => {
        if (res.code === 1) {
          this.topoList = res.data
          this.changeSystemId = res.data[0].id
          this.$emit('getSystemId', this.changeSystemId)
        }
      })
    },
    // 获取系统日志
    findBsTopSystemLog() {
      const date = new Date()
      const sTime = `${dateFormat('YYYY-mm-dd', date)} 00:00:00`
      const eTime = `${dateFormat('YYYY-mm-dd', date)} 23:59:59`
      request({ url: api.bsTopSystem.findBsTopSystemLog, data: {
        page: 1, limit: -1, sTime, eTime
      }}).then(res => {
        if (res.code === 1) {
          // 业务系统健康度、可用度、繁忙度
          // 如果三个数值超过90颜色就使用errorColor，没有超过就使用color
          const activeLogTypeData = {
            healthy: { color: '#f38f20', data: [] },
            available: { color: '#249f2f', data: [] },
            busy: { color: '#d4001a', data: [] },
            time: []
          }
          res.data.forEach(item => {
            activeLogTypeData.healthy.data.push(item.healthy.toFixed(2))
            activeLogTypeData.available.data.push(item.available.toFixed(2))
            activeLogTypeData.busy.data.push(item.busy.toFixed(2))
            activeLogTypeData.time.push(item.time.split(' ')[1])
          })
          this.activeLogTypeData = activeLogTypeData
          this.setLogInEcharts()
        }
      })
    },
    // 选择系统
    handlerSystem(item) {
      this.changeSystemId = item.id
      this.$emit('getSystemId', this.changeSystemId)
    },
    // 打开业务系统日志统计图
    openBsSystemEcharts(item) {
      this.showDialog = true
      this.dialogTitle = item.name
      this.findBsTopSystemLog()
    },
    handleDeviceTypeClick() {
      this.reloadKey = guid()
      this.setLogInEcharts()
      console.log(this.activeDeviceType)
    },
    setLogInEcharts() {
      let logData = []
      let color = ''
      if (this.activeDeviceType === '1') {
        logData = this.activeLogTypeData.healthy.data
        color = this.activeLogTypeData.healthy.color
      }
      if (this.activeDeviceType === '2') {
        logData = this.activeLogTypeData.available.data
        color = this.activeLogTypeData.available.color
      }
      if (this.activeDeviceType === '3') {
        logData = this.activeLogTypeData.busy.data
        color = this.activeLogTypeData.busy.color
      }
      this.selectLogTypeData = {
        data: logData,
        time: this.activeLogTypeData.time,
        color
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-system-list {
  width: 340px;
  height: 100%;
  background: #e9ecf3;
  .list-header {
    padding: 10px;
    .keyword {
      width: 80%;
    }
  }
  .list-main {
    .list-item {
      padding: 10px;
      .list-item-info {
        width: calc(75% - 10px);
        margin-left: 10px;
        display: inline-block;
        .item-info-title {
          font-weight: bold;
          font-size: 14px;
          padding: 5px 0 10px 0;
        }
        .item-info-bottom {
          font-size: 14px;
          .bottom-item {
            flex: 1;
            .bottom-item-main {
              .item-title {
                margin-bottom: 5px;
                color:#999999;
              }
              .item-value {}
            }
          }
        }
      }
    }
    .active {
      background: #bbcbe5;
    }
  }
}
.business-image-wrapper {
  color: #0145ab;
  text-align: center;
  width: 20%;
  display: inline-block;
  float: left;
  margin-top: 15px;
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
    font-size: 40px;
  }
  .right-icon {
    font-size: 22px;
  }
}
</style>
