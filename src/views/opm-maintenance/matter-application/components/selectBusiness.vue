<template>
  <div>
    <el-dialog
      title="选择业务系统"
      :visible="true"
      width="30%"
      :modal="true"
      :lock-scroll="true"
      :show-close="true"
      :destroy-on-close="true"
      :center="true"
      @close="$emit('close')"
    >
      <el-table
        ref="table"
        :data="topoList"
        @select="handleSelect"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column label="NO" prop="hyHostName" show-overflow-tooltip />
        <el-table-column
          label="业务系统名称"
          prop="name"
          show-overflow-tooltip
        />
        <el-table-column label="健康度">
          <template slot-scope="item">
            {{ setSystemLogData(item.row.healthy) }}%
          </template>
        </el-table-column>

        <el-table-column label="可用度">
          <template slot-scope="item">
            {{ setSystemLogData(item.row.available) }}%
          </template>
        </el-table-column>
        <el-table-column label="繁忙度">
          <template slot-scope="item">
            {{ setSystemLogData(item.row.busy) }}%
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="statues">
          <template slot-scope="item">
            <div :class="item.row.statue == 1 ? 'success' : 'danger'">
              <i :class="item.row.statue == 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.statue == 1 ? "正常" : "异常" }}
            </div>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-show="findHyitTopologyInfoQuery.total > 0"
        :total="findHyitTopologyInfoQuery.total"
        :page.sync="findHyitTopologyInfoQuery.page"
        :limit.sync="findHyitTopologyInfoQuery.limit"
        @pagination="findHyitHost"
      />

      <span slot="footer" class="dialog-footer">
        <el-button @click="$emit('close')">取 消</el-button>
        <el-button type="primary" @click="handleComfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'Choicebusiness',
  components: {
    Pagination
  },
  props: {
    bsIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      listQuery: {
        hyHostName: '',
        hyIp: '',
        hyLinkState: '',
        hyOrgId: '',
        count: 1,
        page: 1,
        limit: 10
      },
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      tableData: [],
      topoList: [],
      facilityList: [], // 设备列表
      devTypeList: [],
      hyitOrg: [],
      subSystems: [],
      // ideField: 'hyHostId', // 匹配的字段，用id
      ideField: 'id', // 匹配的字段，用id
      allSelection: [] // 所有页面选择的
    }
  },
  computed: {
    setSystemLogData() {
      return function(value) {
        return value ? value.toFixed(2) : 0
      }
    },
    setDevType() {
      return function(hyDevTypeId) {
        const idx = this.devTypeList.findIndex(
          (item) => item.hyDevTypeId === hyDevTypeId
        )
        if (idx !== -1) {
          return this.devTypeList[idx].hyDevTypeName
        }
      }
    },
    setSubsystem() {
      return function(hySbId) {
        const idx = this.subSystems.findIndex((item) => item.hySbId === hySbId)
        if (idx !== -1) {
          return this.subSystems[idx].hySbName
        }
      }
    }
  },
  async mounted() {
    this.allSelection = this.bsIds
    await this.loadTopoList()
    await this.findHyitDevType()
    await this.getHyitSubSystem()
    await this.findHyitOrg()
    await this.findHyitHost()
  },
  methods: {
    loadTopoList() {
      request({
        url: api.bsTopSystem.findBsTopSystem,
        data: { ...this.findHyitTopologyInfoQuery }
      }).then((res) => {
        this.listLoading = false
        if (res.code === 1) {
          this.topoList = res.data
          this.findHyitTopologyInfoQuery.total = Number(res.count)
          this.$nextTick(() => {
            console.log(22)
            this.initTableSelection()
          })
        }
      })
    },
    async open() {

    },
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitHost()
    },
    handleComfirm() {
      if (!this.allSelection.length) {
        this.$message.error('请选择')
      }
      this.$emit('change', this.allSelection)
      // this.dialogVisible = false
      this.$emit('close')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map((it) => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) =>
        JSON.parse(item)
      )
      this.allSelection = setPagingSelection
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(
          (it) => it[this.ideField] !== row[this.ideField]
        )
      }
    },
    initTableSelection() {
      console.log(this.topoList)
      console.log(this.allSelection)
      this.$nextTick(() => {
        for (let i = 0; i < this.topoList.length; i++) {
          const tableEle = this.topoList[i]
          for (let j = 0; j < this.allSelection.length; j++) {
            const ele = this.allSelection[j]
            // console.log(tableEle[this.ideField])
            // console.log(ele[this.ideField])
            if (tableEle[this.ideField] === ele[this.ideField]) {
              this.$refs['table'].toggleRowSelection(tableEle, true)
            }
          }
        }
      })
    },
    async findHyitHost() {
      let { code, data, count } = await request({
        url: api.itMonitor.findHyitHost,
        data: this.listQuery
      })
      if (code !== 1) return
      this.tableData = data
      this.$set(this.listQuery, 'count', +count)
      this.$nextTick(() => {
        console.log(1)
        this.initTableSelection()
      })
    },
    async findHyitDevType() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevType,
        data: { hyDevTypeId: 2 }
      })
      if (code === 1) {
        this.devTypeList = data
      }
    },
    async getHyitSubSystem() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitSubSystem
      })
      if (code !== 1) return
      this.subSystems = data
    },
    async findHyitOrg() {
      // 部门区域
      let { data, code } = await request({
        url: api.org.findHyitOrg,
        limit: -1
      })
      if (code !== 1) return
      this.hyitOrg = data
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__wrapper {
  .el-dialog--center {
    width: 60% !important;
  }
}
</style>
