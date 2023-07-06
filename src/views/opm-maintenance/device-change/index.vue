<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="addCat">新增</el-button>
      <el-input v-model="listQuery.keywords" v-permission="['Search']" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <el-input v-model="listQuery.ip" v-permission="['Search']" placeholder="请输入IP" class="filter-item filter-item-input" />
      <el-date-picker v-model="listQuery.sTime" class="filter-item" type="datetime" placeholder="变更开始时间" value-format="yyyy-MM-dd HH:mm:ss" style="width: 200px" />
      <el-date-picker v-model="listQuery.eTime" class="filter-item" type="datetime" placeholder="变更结束时间" value-format="yyyy-MM-dd HH:mm:ss" style="width: 200px" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="searchCat">搜索</el-button>
      <el-dropdown :hide-on-click="false" class="filter-item screen">
        <i class="icon el-icon-s-operation" />
        <el-dropdown-menu slot="dropdown">
          <el-scrollbar style="height: 70vh">
            <el-checkbox-group v-model="filterChangeItems">
              <el-dropdown-item v-for="(item, index) in checkList" :key="index"><el-checkbox :key="item" :label="item" /></el-dropdown-item>
            </el-checkbox-group>
          </el-scrollbar>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="table-wrapper">
      <el-table :data="data" fit highlight-current-row border style="width: 100%">
        <el-table-column v-if="lists[0].ispass" resizable label="序号" align="left" prop="hyKnowId" type="index" show-overflow-tooltip />
        <el-table-column v-if="lists[1].ispass" resizable label="申请单位" align="left" prop="company" show-overflow-tooltip />
        <el-table-column v-if="lists[2].ispass" resizable label="姓名" align="left" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists[3].ispass" resizable label="电话" align="right" prop="tel" show-overflow-tooltip />
        <el-table-column v-if="lists[4].ispass" resizable label="类型" align="left" prop="changeType" show-overflow-tooltip />
        <el-table-column v-if="lists[5].ispass" resizable label="操作地址" align="left" prop="changeAddress" show-overflow-tooltip />
        <el-table-column v-if="lists[6].ispass" resizable label="变更开始时间" align="right" prop="changeStartTime" show-overflow-tooltip />
        <el-table-column v-if="lists[7].ispass" resizable label="变更结束时间" align="right" prop="changeEndTime" show-overflow-tooltip />
        <el-table-column v-if="lists[8].ispass" resizable label="机房" align="left" prop="room" show-overflow-tooltip />
        <el-table-column v-if="lists[9].ispass" resizable label="网络区域" align="left" prop="netAddress" show-overflow-tooltip />
        <el-table-column v-if="lists[10].ispass" resizable label="设备位置" align="left" prop="deviceAddress" show-overflow-tooltip />
        <el-table-column v-if="lists[11].ispass" resizable label="设备类型" align="left" prop="deviceType" show-overflow-tooltip />
        <el-table-column v-if="lists[12].ispass" resizable label="变更内容" align="left" prop="changeContent" show-overflow-tooltip />
        <el-table-column v-if="lists[13].ispass" resizable label="变更设备名称" align="left" prop="deviceName" show-overflow-tooltip />
        <el-table-column v-if="lists[14].ispass" resizable label="变更设备ip" align="right" prop="deviceIp" show-overflow-tooltip />
        <el-table-column v-if="lists[15].ispass" resizable label="影响设备名称" align="left" prop="influenceDeviceName" show-overflow-tooltip />
        <el-table-column v-if="lists[16].ispass" resizable label="影响设备ip" align="left" prop="influenceDeviceIp" show-overflow-tooltip />
        <el-table-column v-if="lists[17].ispass" resizable label="影响详情" align="left" prop="influence" show-overflow-tooltip />
        <el-table-column v-if="lists[18].ispass" resizable label="备注" align="left" prop="backup" show-overflow-tooltip />
        <el-table-column label="操作" align="center" resizable width="150" class-name="small-padding fixed-width">
          <template slot-scope="{ row }">
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findEsightChange" />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  components: { Pagination },
  data() {
    return {
      data: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        sTime: '',
        eTime: '',
        ip: '',
        cleared: 1
      },
      form: {
        company: '',
        name: '',
        tel: '',
        changeType: '',
        changeAddress: '',
        changeStartTime: '',
        changeEndTime: '',
        room: '',
        netAddress: '',
        deviceAddress: '',
        deviceType: '',
        changeContent: '',
        deviceName: '',
        deviceIp: '',
        influenceDeviceName: '',
        influenceDeviceIp: '',
        influence: '',
        backup: ''
      },
      allSelection: [],
      filterChangeItems: [],
      checkList: [
        '序号',
        '申请单位',
        '姓名',
        '电话',
        '类型',
        '操作地址',
        '变更开始时间',
        '变更结束时间',
        '机房',
        '网络区域',
        '设备位置',
        '设备类型',
        '变更内容',
        '变更设备名称',
        '变更设备ip',
        '影响设备名称',
        '影响设备ip',
        '影响详情',
        '备注'
      ],
      lists: [
        { label: '序号', prop: 'hyKnowId', ispass: true },
        { label: '申请单位', prop: 'company', ispass: false },
        { label: '姓名', prop: 'name', ispass: false },
        { label: '电话', prop: 'tel', ispass: false },
        { label: '类型', prop: 'changeType', ispass: false },
        { label: '操作地址', prop: 'changeAddress', ispass: false },
        { label: '变更开始时间', prop: 'changeStartTime', ispass: false },
        { label: '变更结束时间', prop: 'changeEndTime', ispass: false },
        { label: '机房', prop: 'room', ispass: false },
        { label: '网络区域', prop: 'netAddress', ispass: false },
        { label: '设备位置', prop: 'deviceAddress', ispass: false },
        { label: '设备类型', prop: 'deviceType', ispass: false },
        { label: '变更内容', prop: 'changeContent', ispass: false },
        { label: '变更设备名称', prop: 'deviceName', ispass: false },
        { label: '变更设备ip', prop: 'deviceIp', ispass: false },
        { label: '影响设备名称', prop: 'influenceDeviceName', ispass: false },
        { label: '影响设备ip', prop: 'influenceDeviceIp', ispass: false },
        { label: '影响详情', prop: 'influence', ispass: false },
        { label: '备注', prop: 'backup', ispass: false }
      ],
      total: 0
    }
  },
  watch: {
    filterChangeItems(newVal) {
      if (newVal) {
        this.localStorageOperation('set', 'filterChangeItems', newVal)
        let arr = this.checkList.filter(i => newVal.indexOf(i) < 0) // 未选中
        this.lists.map(i => {
          if (arr.indexOf(i.label) !== -1) {
            i.ispass = false
          } else {
            i.ispass = true
          }
        })
      }
    }
  },
  mounted() {
    this.findEsightChange()
  },
  methods: {
    // 列表数据
    findEsightChange() {
      this.$request({
        url: this.api.itMonitor.findEsightChange,
        data: { ...this.listQuery }
      }).then(res => {
        if (res.code === 1) {
          this.data = res.data
          this.total = Number(res.count)

          // 获取保存的显示配置
          const itemsData = this.localStorageOperation('get', 'filterChangeItems')
          // 初次进入默认访问全部字段
          itemsData
            ? (this.filterChangeItems = itemsData)
            : (this.filterChangeItems = [
              '序号',
              '申请单位',
              '姓名',
              '电话',
              '类型',
              '操作地址',
              '变更开始时间',
              '变更结束时间',
              '机房',
              '网络区域',
              '设备位置',
              '设备类型',
              '变更内容',
              '变更设备名称',
              '变更设备ip',
              '影响设备名称',
              '影响设备ip',
              '影响详情',
              '备注'
            ])
        }
      })
    },
    // 搜索
    searchCat() {
      this.listQuery.page = 1
      this.data = []
      this.findEsightChange()
    },
    // 新增
    addCat() {
      this.$router.push({
        name: 'DeviceChangeAdd'
      })
    },
    // 编辑
    onEdit(row) {
      this.$router.push({
        name: 'DeviceChangeUpadte',
        query: {
          id: row.id || 0
        }
      })
    },
    // 删除
    onDelete(row) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$request({
            url: this.api.itMonitor.deleteEsightChange,
            data: { id: row.id }
          }).then(res => {
            if (res.code === 1) {
              this.findEsightChange()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-table--border td {
  border: none;
}
::v-deep .el-table--border th {
  border-bottom: none;
  border-top: none;
}
.screen {
  float: right;
  .icon {
    border: 2px solid gray;
    font-size: 25px;
  }
}
</style>

