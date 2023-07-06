<template>
  <div class="device-port-list">
    <div class="app-container no-padding">
      <div class="filter-container">
        <el-select v-model="filterQuery.condition" size="mini" class="filter-item" style="width: 100px">
          <el-option
            v-for="item in condition"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
        <el-input v-model="filterQuery.keyword" size="mini" style="width: 200px;" class="filter-item" clearable />
        <el-select v-if="chartType === 'flow'" v-model="filterQuery.units" size="mini" class="filter-item" style="width: 100px">
          <el-option
            v-for="item in units"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
        <el-button class="filter-item" type="primary" size="mini" icon="el-icon-search" @click="handleFilter">过滤</el-button>
        <ExportExcel class="filter-item" size="mini" :fillter-list="portList" :excel-title="ExcelTitle" :file-name="exportFileName" />
      </div>
      <!-- 实时数据表格 -->
      <el-table
        v-if="timeType === null || timeType === 0"
        ref="table"
        :data="portList"
        size="mini"
        max-height="200"
      >
        <el-table-column label="时间" prop="time" />
        <el-table-column label="发送">
          <template slot-scope="{row}">
            {{ row.sendValueAndUnits = row.send.toFixed(row.fixed || 0) + row.sendUnits }}
          </template>
        </el-table-column>
        <el-table-column label="接收" prop="receive">
          <template slot-scope="{row}">
            {{ row.receiveValueAndUnits = row.receive.toFixed(row.fixed || 0) + row.receiveUnits }}
          </template>
        </el-table-column>
      </el-table>
      <!-- 历史数据表格 -->
      <el-tabs v-else v-model="historyTableType" @tab-click="handleHistoryTableType">
        <template v-if="chartType === 'flow'">
          <el-tab-pane label="发送速率" name="send" />
          <el-tab-pane label="接收速率" name="resolve" />
        </template>
        <template v-else>
          <el-tab-pane label="发送丢包数" name="send" />
          <el-tab-pane label="接收丢包数" name="resolve" />
        </template>
        <el-table
          ref="table"
          :data="portList"
          size="mini"
          max-height="250"
        >
          <el-table-column label="时间" prop="time" />
          <el-table-column label="最大值">
            <template slot-scope="{row}">
              {{ row.maxValueAndUnits = row.max.toFixed(row.fixed || 0) + row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="最小值">
            <template slot-scope="{row}">
              {{ row.minValueAndUnits = row.min.toFixed(row.fixed || 0) + row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="平均值">
            <template slot-scope="{row}">
              {{ row.avgValueAndUnits = row.avg.toFixed(row.fixed || 0) + row.unit }}
            </template>
          </el-table-column>
        </el-table>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import ExportExcel from '@/components/ExportExcel/export-excel'

export default {
  name: 'DetailPortTable',
  components: { ExportExcel },
  data() {
    return {
      allHistoryPortList: [],
      portList: [],
      filterQuery: {
        keyword: '',
        condition: 1,
        units: 1
      },
      condition: [
        { key: 1, label: '小于或等于' },
        { key: 2, label: '大于或等于' }
      ],
      units: [
        { key: 1, label: 'B/s', units: 'B' },
        { key: 2, label: 'KB/s', units: 'KB' },
        { key: 3, label: 'MB/s', units: 'MB' }
      ],
      filterConditionValue: '',
      chartType: null,
      timeType: null,
      fillerList: [],
      ExcelTitle: [
        {
          title: '时间',
          dataIndex: 'time'
        },
        {
          title: '接收',
          dataIndex: 'sendValueAndUnits'
        },
        {
          title: '发送',
          dataIndex: 'receiveValueAndUnits'
        }
      ],
      exportFileName: '',
      historyTableType: 'send',
      allTypeHistoryPortList: null
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('emit-port-item-data,select-chart-type,select-time-type,change-port')
  },
  mounted() {
    this.$EventBus.$on('emit-port-item-data', (msg) => {
      if (msg.type === 'realTime') {
        if (this.filterConditionValue !== '') {
          if (this.filterQuery.condition === 1) {
            if (Number(msg.send) <= this.filterConditionValue && Number(msg.receive) <= this.filterConditionValue) {
              this.portList.unshift(msg)
            }
          } else {
            if (Number(msg.send) >= this.filterConditionValue && Number(msg.receive) >= this.filterConditionValue) {
              this.portList.unshift(msg)
            }
          }
        } else {
          this.portList.unshift(msg)
        }
        if (this.portList.length > 1 && this.portList[this.portList.length]) {
          this.$set(this.portList[this.portList.length], 'send', this.$tool.deepCopy(this.portList[this.portList.length - 1].send))
          this.$set(this.portList[this.portList.length], 'receive', this.$tool.deepCopy(this.portList[this.portList.length - 1].receive))
        }
      } else {
        this.exportFileName = this.chartType === 'flow' ? `${msg.hostName} ${msg.portName} ${this.historyTableType === 'send' ? '发送速率' : '接收速率'}` : `${msg.hostName} ${msg.portName} ${this.historyTableType === 'send' ? '发送丢包数' : '接收丢包数'}`
        this.ExcelTitle = [
          {
            title: '主机名称',
            dataIndex: 'hostName'
          },
          {
            title: '监控项ID',
            dataIndex: 'itemId'
          },
          {
            title: '端口名称',
            dataIndex: 'portName'
          },
          {
            title: '时间',
            dataIndex: 'time'
          },
          {
            title: '汇总数量',
            dataIndex: 'num'
          },
          {
            title: '最大值',
            dataIndex: 'max'
          },
          {
            title: '最小值',
            dataIndex: 'min'
          },
          {
            title: '平均值',
            dataIndex: 'avg'
          },
          {
            title: '单位',
            dataIndex: 'unit'
          }
        ]
        this.allTypeHistoryPortList = msg.data
        this.allHistoryPortList = this.historyTableType === 'send' ? msg.data.send : msg.data.receive
        if (this.filterConditionValue !== '') {
          if (this.filterQuery.condition === 1) {
            this.allHistoryPortList.forEach(item => {
              if (Number(item.max) <= this.filterConditionValue && Number(item.min) <= this.filterConditionValue && Number(item.avg) <= this.filterConditionValue) {
                this.portList.unshift(item)
              }
            })
          } else {
            this.allHistoryPortList.forEach(item => {
              if (Number(item.max) >= this.filterConditionValue && Number(item.min) >= this.filterConditionValue && Number(item.avg) >= this.filterConditionValue) {
                this.portList.unshift(item)
              }
            })
          }
        } else {
          this.portList = this.allHistoryPortList
        }
      }
    })
    this.$EventBus.$on('select-chart-type', (msg) => {
      this.chartType = msg
      this.allHistoryPortList = []
      this.portList = []
      this.fillerList = []
    })
    this.$EventBus.$on('select-time-type', (msg) => {
      this.timeType = msg
      this.allHistoryPortList = []
      this.portList = []
      this.fillerList = []
    })
    this.$EventBus.$on('change-port', (msg) => {
      this.exportFileName = `${msg.itemName}${this.chartType === 'flow' || this.chartType === null ? '流量' : '丢包'}统计`
      this.portList = []
    })
  },
  methods: {
    handleFilter() {
      const UnitsIndex = this.units.findIndex(item => item.key === this.filterQuery.units)
      if (UnitsIndex !== -1) this.filterConditionValue = this.filterQuery.keyword === '' ? '' : this.$tool.sizeUnitsTransform(this.units[UnitsIndex].units, 'MB', this.filterQuery.keyword).size
      if (this.timeType === null || this.timeType === 0) {
        this.portList = []
      }
      if (this.filterConditionValue !== '') {
        if (this.filterQuery.condition === 1) {
          this.portList = []
          this.allHistoryPortList.forEach(item => {
            if (Number(item.send) <= this.filterConditionValue && Number(item.receive) <= this.filterConditionValue) {
              // this.$set(this.portList, this.portList.length, item)
              this.portList.unshift(item)
            }
          })
        } else {
          this.allHistoryPortList.forEach(item => {
            if (Number(item.send) >= this.filterConditionValue && Number(item.receive) >= this.filterConditionValue) {
              // this.$set(this.portList, this.portList.length, item)
              this.portList.unshift(item)
            }
          })
        }
      } else {
        this.portList = this.allHistoryPortList
      }
    },
    handleHistoryTableType(val) {
      if (Number(val.index) === 0) {
        this.allHistoryPortList = this.allTypeHistoryPortList.send
      } else {
        this.allHistoryPortList = this.allTypeHistoryPortList.receive
      }
      console.log(this.allHistoryPortList)
      if (this.filterConditionValue !== '') {
        if (this.filterQuery.condition === 1) {
          this.allHistoryPortList.forEach(item => {
            if (Number(item.max) <= this.filterConditionValue && Number(item.min) <= this.filterConditionValue && Number(item.avg) <= this.filterConditionValue) {
              // this.$set(this.portList, this.portList.length, item)
              this.portList.unshift(item)
            }
          })
        } else {
          this.allHistoryPortList.forEach(item => {
            if (Number(item.max) >= this.filterConditionValue && Number(item.min) >= this.filterConditionValue && Number(item.avg) >= this.filterConditionValue) {
              // this.$set(this.portList, this.portList.length, item)
              this.portList.unshift(item)
            }
          })
        }
      } else {
        this.portList = this.allHistoryPortList
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.device-port-list { margin-top: 10px }
</style>
