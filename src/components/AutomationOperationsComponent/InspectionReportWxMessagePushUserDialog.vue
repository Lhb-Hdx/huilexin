<template>
  <el-dialog title="选择推送人" :visible.sync="showDialog" width="50%" top="5vh">
    <div class="app-container">
      <div class="filter-container">
        <el-input v-model="listQuery.keyword" placeholder="请输入用户名称" style="width: 200px;" class="filter-item" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onSearch">
          查询
        </el-button>
      </div>
      <div class="table-wrapper" :class="isRadio ? 'has-gutter' : ''">
        <el-table
          ref="table"
          :data="wxUserList"
          fit
          highlight-current-row
          style="width: 100%;"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" />
          <el-table-column label="用户名称" align="center" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.realName || row.realname }}</span>
            </template>
          </el-table-column>
          <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip />
          <el-table-column label="手机号" align="center" prop="mobile" show-overflow-tooltip />
        </el-table>
      </div>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="pagination" />
    </div>
    <div slot="footer">
      <el-button type="default" @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="submit()">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import pagination from '@/components/Pagination/index.vue'
import selectMixin from '@/mixins/el-table-select-mixin'

export default {
  name: 'InspectionReportWxMessagePushUserDialog',
  components: {
    pagination
  },
  mixins: [selectMixin],
  data() {
    return {
      showDialog: false,
      wxUserList: [],
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      isRadio: false,
      list: [],
      listTotal: 0,
      options: {},
      keyField: 'userId', // 列表主键id
      listField: 'wxUserList',
      allList: []
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('submitInspectionReportWxMessagePushUser')
  },
  methods: {
    // 打开
    open(options) {
      this.options = options
      this.allSelection = options.allSelection
      this.list = []
      this.showDialog = true
      this.findUserList()
    },
    // 保存
    submit() {
      this.$set(this.listQuery, 'page', 1)
      this.showDialog = false
      this.$EventBus.$emit('submitInspectionReportWxMessagePushUser', this.allSelection)
    },
    // 搜索
    onSearch() {
      this.pagination()
    },
    // 获取用户列表
    async findUserList() {
      const { code, model } = await this.$request({
        url: this.api.sys.findWinxinUser,
        data: {
          companyId: this.$auth.getUserSession().companyId,
          page: this.listQuery.page,
          limit: -1
        }
      })
      if (code === 1 && model) {
        this.allList = JSON.parse(model)
        this.wxUserList = this.allList.slice(0, 10)
        this.listTotal = +this.allList.length
      }
      this.$nextTick(() => {
        this.initTable()
      })
    },
    pagination() {
      let data = []
      if (this.listQuery.keyword) {
        data = this.allList.filter(el => el.realname.indexOf(this.listQuery.keyword) !== -1)
      } else {
        data = this.allList
      }
      const page = (this.listQuery.page - 1) * this.listQuery.limit
      const limit = this.listQuery.limit * this.listQuery.page
      this.wxUserList = data.slice(page, limit)
      this.$nextTick(() => {
        this.initTable()
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
