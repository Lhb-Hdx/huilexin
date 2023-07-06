<template>
  <div>
    <ElDialog title="关联微信" :visible.sync="diavisible" width="60%">
      <div class="dialog-body">
        <div>
          <el-input v-model="listQuery.nickname" v-permission="['search']" placeholder="请输入昵称" style="width:200px" clearable @change="handleSearch" />
          <el-select v-model="listQuery.wxcid" placeholder="请选择公众号" class="ml-10" clearable @clear="handleSearch">
            <el-option v-for="item in wxconfigs" :key="item.configId" :label="item.configName" :value="item.configId" />
          </el-select>
          <el-button v-permission="['search']" type="primary" class="ml-10" @click="handleSearch">查询</el-button>
          <el-button v-permission="['sync']" type="primary" @click="handleSyncList()">同步</el-button>
        </div>
        <div class="mt-20 table-wrapper">
          <ElTable ref="table" :data="tableData" class="table" @select="handleCurrentChang">
            <ElTableColumn type="selection" align="center" />
            <ElTableColumn label="序号" width="55px" type="index" align="center" />
            <ElTableColumn label="关注的公众号" prop="" show-overflow-tooltip align="center">
              <template slot-scope="{row}">   {{ $tool.matchData(wxconfigs,row,'wxcid','configName','configId') }}     </template>
            </ElTableColumn>
            <ElTableColumn label="昵称" prop="nickname" show-overflow-tooltip align="center" />
            <ElTableColumn label="头像" prop="headimgurl">
              <template slot-scope="{row}">
                <el-image
                  style="width: 40px; height: 40px"
                  :src="row.headimgurl"
                  fit="cover"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作">
              <template slot-scope="{row}">
                <el-button v-if="row.bookid===bookid" type="primary" @click="removeBind(row)">解除绑定</el-button>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
        <pagination v-show="listQuery.count > 0" :auto-scroll="false" :total="listQuery.count" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findWeixinbook" />
      </div>
      <template #footer>
        <el-button @click="diavisible=false">关闭</el-button>
        <el-button v-permission="['bindwxSubmit']" type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </ElDialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  components: {
    Pagination
  },
  props: {
    // bookid: {
    //   type: [Number, String],
    //   require: true,
    //   default: ''
    // },
  },
  data() {
    return {
      bookid: '',
      diavisible: false,
      components: {
        Pagination
      },
      tableData: [],
      listQuery: {
        wxcid: '',
        nickname: '',
        count: 1,
        page: 1,
        limit: 10
      },
      wxconfigs: [],
      currentSection: {},
      multipleSelection: [], // 当前页面选择的
      ideField: 'wid', // 匹配的字段，用id
      allSelection: [], // 所有页面选择的
      name: ''
    }
  },
  methods: {
    async open(id, name) {
      console.log(id)
      this.bookid = id
      this.name = name
      this.$set(this.listQuery, 'nickname', name)
      this.multipleSelection = []
      this.allSelection = []
      await this.findWeixinbook()
      await this.findWeixinConfig()
      if (this.name) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.$refs['table'].toggleRowSelection(this.tableData[0], true)
            this.allSelection.push(this.tableData[0])
          })
        })
      }
      this.diavisible = true
    },
    handleSearch() {
      this.listQuery['page'] = 1
      this.findWeixinbook()
    },
    handleSubmit() {
      const that = this
      if (!this.allSelection.length) {
        this.$message.error('至少选择一项')
        return
      }
      this.allSelection.forEach(async(it) => {
        let { code, msg } = await request({
          url: api.linkageManage.bookBindWechat,
          data: { wid: it.wid, bookid: that.bookid, status: 1 }
        })
        if (code === 1) {
          that.$message.success('绑定成功')
          this.$emit('updateList')
          this.diavisible = false
          return
        }
        if (code !== 1) that.$message.error(msg)
      })
    },
    async handleSyncList() {
      const that = this
      if (!this.listQuery.wxcid) {
        this.$message.error('请选择公众号')
        return
      }
      let { code, msg } = await request({
        url: api.linkageManage.syncWeixinLRbook,
        data: { wxcid: this.listQuery.wxcid }
      })
      if (code === 1) { that.$message.success('同步成功') }
      if (code !== 1) that.$message.error(msg)
    },
    async removeBind(row) {
      let { ...data } = row
      let { code } = await request({ url: api.linkageManage.updateWeixinbook, data: { ...data, bookid: 0, status: 0 }})
      if (code !== 1) return
      this.$message.success('解除绑定成功')
      this.$emit('updateList')
    },
    handleCurrentChang(currentRow) {
      this.$nextTick(() => {
        const it = currentRow.pop()
        this.$refs['table'].clearSelection()
        this.$refs['table'].toggleRowSelection(it, true)
        this.allSelection = it ? [it] : []
      })
    },
    // handleSelectionChange(val) {
    //   this.multipleSelection = val
    //   let setPagingSelection = [...this.allSelection, ...val]
    //   setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
    //   setPagingSelection = [...new Set(setPagingSelection)].map((item) => JSON.parse(item))
    //   this.allSelection = setPagingSelection
    // },
    // handleSelect(rows, row) {
    //   let selected = rows.length && rows.indexOf(row) !== -1
    //   if (!selected) this.allSelection = this.allSelection.filter(it => it[this.ideField] !== row[this.ideField])
    // },
    // initTableSelection() {
    //   this.$nextTick(() => {
    //     for (let i = 0; i < this.tableData.length; i++) {
    //       const tableEle = this.tableData[i]
    //       for (let j = 0; j < this.allSelection.length; j++) {
    //         const ele = this.allSelection[j]
    //         if (tableEle[this.ideField] === ele[this.ideField]) {
    //           this.$refs['table'].toggleRowSelection(tableEle, true)
    //         }
    //       }
    //     }
    //   })
    // },
    async findWeixinbook() {
      let { data, code, count } = await request({
        url: api.linkageManage.findWeixinbook,
        data: this.listQuery
      })
      if (code !== 1) return
      this.$set(this.listQuery, 'count', +count)
      this.tableData = data

      // this.initTableSelection()
    },
    async findWeixinConfig() {
      let { data, code } = await request({
        url: api.linkageManage.findWeixinConfig
      })
      if (code !== 1) return
      this.wxconfigs = data
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .table{
  .el-table__header-wrapper{
  .el-checkbox{
    display: none;
  }
}
}
</style>
