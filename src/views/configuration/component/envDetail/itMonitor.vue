<template>
  <div class="env-detail-find">
    <div class="detail-find-title">IT监控</div>
    <div class="detail-find-content">
      <el-table :data="itMonitorList" style="width: 100%;margin-top:20px;">
        <el-table-column align="center" label="IT对象/IP">
          <template slot-scope="scope">
            <p class="no-margin it-name overflow-text-a">{{ scope.row.hyMarkName }}</p>
            <p class="no-margin it-ip">{{ scope.row.hyIp }}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" label="类型" width="100">
          <template slot-scope="scope">
            {{ setHostType(scope.row.hyDevTypeId) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="ICMP" width="80">
          <template slot-scope="scope">
            {{ scope.row.hyStatus === 0 ? '正常' : '异常' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="80">
          <template slot-scope="scope">
            <el-row type="flex" justify="center">
              <el-button type="primary" size="mini" @click="handleHost(scope)">查看</el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="IT监控详情" :visible.sync="showDialog" top="5vh" width="80%">
      <div class="dialog-wrapper" style="height: 60vh; overflow: auto;">
        <MonitorEcharts :usability="1" :prop-dev-type-id="devTypeId" :prop-agent="agent" :prop-zbx-host-id="zbxHostId" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import MonitorEcharts from '@/views/it-monitor/resources-monitor/monitor-content'

export default {
  name: 'ItMonitor',
  components: {
    MonitorEcharts
  },
  props: {
    itMonitorList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      devTypeList: [],
      showDialog: false,
      devTypeId: '',
      agent: '',
      zbxHostId: ''
    }
  },
  computed: {
    // 设置主机类型
    setHostType() {
      return function(id) {
        const devTypeIdx = this.devTypeList.findIndex(item => item.id === id)
        if (devTypeIdx !== -1) {
          return id === 0 ? '' : this.devTypeList[devTypeIdx].dictdataName
        }
      }
    },
    // 设置主机状态
    setHostStatus() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return count === 1 ? '在线' : '离线'
      }
    }
  },
  watch: {
    mapData: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal)
      },
      deep: true
    }
  },
  mounted() {
    this.loadItType()
  },
  methods: {
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    handleHost(val) {
      this.devTypeId = val.row.hyDevTypeId
      this.agent = val.row.agent
      this.zbxHostId = val.row.hyZhostId
      this.showDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.env-detail-find {
  margin: 14px;
  .detail-find-title {
    background: #EEEEEE;
    color: #646464;
    font-weight: bold;
    padding: 10px 14px;
  }
  .detail-find-content {
    .it-name {
      color: #0045AB;
    }
    .it-ip {
      color: #666666;
    }
  }
}
</style>
