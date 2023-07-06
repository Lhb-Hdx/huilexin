import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import ListControl from '@/components/ListControl'

export default {
  name: 'ContentUnionHostList',
  props: {
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  components: { Pagination, ListControl },
  data() {
    return {
      listLoading: false,
      contentUnionHostListQuery: {
        page: 1,
        limit: 10,
        groupid: '',
        keyword: '',
        hyDevTypeId: 2
      },
      allSelection: [],
      systemDeviceType: 3,
      listTotal: 0,
      contentUnionHostList: [],
      multipleSelection: [],
      subSystemList: [],
      devTypeList: [],
      // 显示控制数据 start
      checkList: ['主机名称', '类型', '所属子系统', '编码', 'IP', '端口', '创建时间', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setDevType() {
      return function(hyDevTypeValue) {
        const idx = this.devTypeList.findIndex(item => item.hyDevTypeValue === hyDevTypeValue)
        if (idx !== -1) {
          return this.devTypeList[idx].hyDevTypeName
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.contentUnionHostListQuery = pageQuery
    }
  },
  async mounted() {
    await this.findHyitHost()
    await this.findHyitSubSystem()
    await this.findHyitDevType()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    onCreate() {
      const data = { ...this.contentUnionHostListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'ContentUnionHostAdd' })
    },
    onEdit(row) {
      const data = { ...this.contentUnionHostListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'ContentUnionHostUpdate',
        query: {
          id: row.hyHostId || 0
        }
      })
    },
    findHyitSubSystem() {
      request({
        url: api.powerEnv.findHyitSubSystem,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          this.subSystemList = res.data
        }
      })
    },
    findHyitHost() {
      if (this.cmdbItemTypeId) this.$set(this.contentUnionHostListQuery, 'cmdbItemTypeId', this.cmdbItemTypeId)
      request({
        url: api.powerEnv.findHyitHost, data: { ...this.contentUnionHostListQuery }
      }).then(res => {
        let { data } = res
        // for (let i = 0; i < data.length; i++) {
        //   let elei = data[i]
        //   elei.attrList = []
        //   for (let j = 0; j < this.subSystemList.length; j++) {
        //     let elej = this.subSystemList[j]
        //     if (elej.hySbId === elei.hySbId) {
        //       elei.hySbName = elej.hySbName
        //     }
        //   }
        // }
        this.contentUnionHostList = data
        this.listTotal = Number(res.count)
        this.listLoading = false
      })
    },
    findHyitDevType() {
      request({
        url: api.powerEnv.findHyitDevType,
        data: { Pid: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    onFilter() {
      this.contentUnionHostListQuery.page = 1
      this.findHyitHost()
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.powerEnv.deleteHyitHost, data: { hyHostId: row.hyHostId }}).then(res => {
          if (res.code === 1) {
            this.contentUnionHostListQuery.page = 1
            this.$message.success('删除成功')
            this.findHyitHost()
          }
        })
      })
    },
    onPushConfig(row) {
      this.$confirm('确认推送配置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.getHyitSubSystem(row.hySbId).then(res => {
          console.log(res)
          request({ url: api.powerEnv.getServerPushConfig, data: { agentId: res.agentId, sbId: row.hySbId }}).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
            }
          })
        })
      })
    },
    onReStart(row) {
      this.$confirm('确认关机重启吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.getHyitSubSystem(row.hySbId).then(res => {
          request({ url: api.powerEnv.restartSystem, data: { agentId: res.agentId, sbId: row.hySbId }}).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
            }
          })
        })
      })
    },
    async getHyitSubSystem(hySbId) {
      return await request({ url: api.powerEnv.getHyitAgentSubsystem, data: { sbId: hySbId }}).then(res => {
        if (res.code === 1) {
          return res.data[0]
        }
      })
    },
    handleSelectionChange(val) {
      console.log(val)
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map((it) => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) =>
        JSON.parse(item)
      )
      this.allSelection = setPagingSelection
      console.log(this.allSelection)
    },
    handleSelect(rows, row) {
      console.log(row)
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(
          (it) => it[this.ideField] !== row[this.ideField]
        )
      }
    },
    // 批量转资产
    onBatchTransferAssets() {
      if (this.allSelection.length < 1) {
        this.$message('请选择设备')
        return
      }
      const jsonData = []
      this.allSelection.forEach(item => {
        const valList = {}
        valList.assetsName = item.hyHostName
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = item.hyHostId
        valList.systemDeviceType = this.systemDeviceType
        jsonData.push(valList)
      })
      const jsonList = JSON.stringify(jsonData)
      this.$confirm('确认将所选设备转为资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.insertAssetsInfos(jsonList)
      })
    },
    // 批量新增资产
    insertAssetsInfos(data) {
      request({
        url: api.assets.insertAssetsInfos,
        data: { json: data }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$refs.table.clearSelection()
          this.findHyitHost()
          this.allSelection = []
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
