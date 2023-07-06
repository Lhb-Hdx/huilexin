<template>
  <el-dialog title="选择设备" :visible.sync="showDialog" width="60%" top="5vh" append-to-body>
    <div class="dialog-body">
      <div class="filter-container">
        <el-select v-model="listQuery.devType" class="filter-item" placeholder="请选择设备类型" clearable>
          <el-option
            v-for="item in devTypeList"
            :key="item.id"
            :label="item.dictdataName"
            :value="item.id"
          />
        </el-select>
        <el-input v-model="listQuery.keyword" placeholder="请输入主机名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="search" />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onSearch">
          查询
        </el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          :data="list"
          row-key="assetsDeviceId"
          default-expand-all
          fit
          highlight-current-row
          style="width: 100%;"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="设备名称" prop="hyMarkName" width="180" show-overflow-tooltip />
          <el-table-column label="类型" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setHostType(item.row.hyDevTypeId) }}
            </template>
          </el-table-column>
          <el-table-column label="子类型" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setSubType(item.row.hySubdevTypeId) }}
            </template>
          </el-table-column>
          <el-table-column label="IP" prop="hyIp" show-overflow-tooltip />
          <el-table-column label="可用性" width="230" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-tag
                v-for="(item, index) in availables"
                :key="item.label"
                size="mini"
                :type="setAvailables(row, index)"
                effect="dark"
                style="margin-right: 1px;"
              >
                {{ item.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="监控项" prop="hyItemCount" show-overflow-tooltip />
          <el-table-column label="在线状态" prop="status" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-tag :type="setHostStataTag(row)">
                {{ setHostStatus(row) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitHost" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button type="primary" @click="confirmDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import selectMixin from '@/mixins/el-table-select-mixin'

export default {
  name: 'FlowDeviceDialog',
  components: {
    Pagination
  },
  mixins: [selectMixin],
  data() {
    return {
      showDialog: false,
      listQuery: {
        page: 1,
        limit: 10,
        hostType: 1,
        devType: '',
        agents: ''
      },
      list: [],
      availables: [
        {
          label: 'AGENT'
        },
        {
          label: 'SNMP'
        },
        {
          label: 'JMX'
        },
        {
          label: 'IPMI'
        }
      ],
      devTypeList: [],
      subDevType: [],
      total: 0,
      keyField: 'hyHostId', // 列表主键id
      listField: 'list' // 列表变量名称
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
        return row.hyNetState === 1 ? '在线' : '离线'
      }
    },
    // 设置主机可用性标签
    setHostStataTag() {
      return function(row) {
        return row.hyNetState === 1 ? 'success' : 'info'
      }
    },
    setSubType() {
      return function(hySubdevTypeId) {
        const idx = this.subDevType.findIndex(item => Number(item.id) === Number(hySubdevTypeId))
        if (idx !== -1) return this.subDevType[idx].dictdataName
      }
    }
  },
  mounted() {
    this.findDevTypeList()
  },
  methods: {
    async open(options) {
      if (options.allSelection) this.allSelection = options.allSelections
      this.$set(this.listQuery, 'agents', options.agents.toString())
      this.findHyitHost()
      this.showDialog = true
    },
    findHyitHost() {
      this.$request({ url: this.api.itMonitor.findHyitHost, data: this.listQuery }).then(res => {
        if (res.code === 1) {
          this.total = +res.count
          this.list = res.data
          const subDevType = []
          res.data.forEach(item => subDevType.push(item.hySubdevTypeId))
          this.findSysDictionaryDetail(this.$tool.uniqueArray(subDevType).toString())
        }
        this.$nextTick(() => {
          this.initTable()
        })
      })
    },
    confirmDialog() {
      if (this.allSelection.length > 10) {
        this.$message('最多只能选择10个设备')
        return
      }
      this.showDialog = false
      this.$EventBus.$emit('user-select-flow-device', this.allSelection)
    },
    // 设置可用性
    setAvailables(row, index) {
      let key = 'info'
      if (row.hyAvailable === 1 && index === 0 || row.hySnmpAvailable === 1 && index === 1 || row.hyJmxAvailable === 1 && index === 2 || row.hyIpmiAvailable === 1 && index === 3) {
        key = 'success'
      }
      if (row.hyAvailable === 2 && index === 0 || row.hySnmpAvailable === 2 && index === 1 || row.hyJmxAvailable === 2 && index === 2 || row.hyIpmiAvailable === 2 && index === 3) {
        key = 'danger'
      }
      return key
    },
    findDevTypeList() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = [
            { id: '', dictdataName: '全部' },
            ...res.data
          ]
        }
      })
    },
    findSysDictionaryDetail(ids) {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids }
      }).then(res => {
        if (res.code === 1) {
          this.subDevType = res.data
        }
      })
    },
    onSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitHost()
    }
  }
}
</script>

<style scoped>

</style>
