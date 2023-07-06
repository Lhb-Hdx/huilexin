<template>
  <div class="related">
    <!-- <h3 v-if="bindKnowListData.length>0" class="under-line font-16 mb-10">相关知识</h3> -->

    <div v-for="item in bindKnowListData" :key="item.hyKnowId" class="related-item">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-image fit="cover" :src="item.hyTitleImageUrl" />
        </el-col>
        <el-col :span="20">
          <div class="font-18">{{ item.hyKnowName }}</div>
          <div style="color: #999" class="mt-10 mb-10">{{ item.hyCtime }}</div>
          <div class="related-item-subtitle">{{ item.knowRemark }}</div>
          <el-button class="mt-14" size="small" @click="showDetail(item)">查看全文</el-button>
        </el-col>
      </el-row>
    </div>
    <pagination
      v-show="bindKnowListTotal > 0"
      :auto-scroll="false"
      :total="bindKnowListTotal"
      :page.sync="loadBindKnowListQuery.page"
      :limit.sync="loadBindKnowListQuery.limit"
      @pagination="loadBindKnowList"
    />
    <el-empty v-if="!bindKnowListData.length" description="暂无关联知识">
      <!-- <div v-if="info.matter.statue !== 7" class="filter-container">
        <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="onBindKnow">关联知识</el-button>
      </div> -->
    </el-empty>
    <el-dialog title="关联知识点" :visible.sync="showBindKnowDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <div class="app-container">
          <div class="filter-container">
            <el-input v-model="knowQuery.keywords" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
            <el-cascader
              v-model="changeHyktId"
              clearable
              class="filter-item"
              style="width: 200px"
              placeholder="请选择知识点类型"
              :options="knowTypeTree"
              :props="{ value: 'catId', label: 'catName', checkStrictly: true }"
              @change="changeTree"
            />
            <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
          </div>
          <div class="table-wrapper">
            <el-table ref="deviceTable" :data="knowList" highlight-current-row :row-key="getRowKeys" style="width: 100%" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" :reserve-selection="false" />
              <el-table-column label="NO" prop="id" type="index" width="60" />
              <el-table-column label="知识点名称" prop="hyKnowName" />
              <el-table-column label="知识点类型">
                <template slot-scope="{ row }">{{ setKnowType(row.hyKtId) }}</template>
              </el-table-column>
            </el-table>
          </div>
          <pagination v-show="knowTotal > 0" :auto-scroll="false" :total="knowTotal" :page.sync="knowQuery.page" :limit.sync="knowQuery.limit" @pagination="setKnowData" />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBindKnowDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="saveBindKnow">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="abow_dialog" title="知识点详情" :visible.sync="showBindKnowDetailDialog" width="80%" top="5vh">
      <div class="dialog-body">
        <knowledge-Detail :item-id="onKnow" :show-header="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { listToTree } from '@/utils'
import KnowledgeDetail from '@/views/knowledge/components/knowledge-detail'

export default {
  components: {
    Pagination,
    KnowledgeDetail
  },
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      knowQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        hyktId: ''
      },
      showBindKnowDialog: false,
      knowList: [],
      knowTotal: 0,
      knowType: [],
      knowTypeTree: [],
      changeHyktId: '',
      multipleSelectionAll: [],
      multipleSelection: [],
      existGroupChnIds: [],
      loadBindKnowListQuery: {
        page: 1,
        limit: 10
      },
      bindKnowListData: [],
      bindKnowListTotal: 0,
      showBindKnowDetailDialog: false,
      onKnow: ''
    }
  },
  computed: {
    setKnowType() {
      return function(catId) {
        const idx = this.knowType.findIndex(item => Number(item.catId) === Number(catId))
        return idx !== -1 ? this.knowType[idx].catName : ''
      }
    },
    id() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.loadBindKnowList()
  },
  methods: {
    // 获取知识点
    async findHyitKnow(query) {
      let { code, data, count } = await request({
        url: api.knowledge.findHyitKnow,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 获取知识点类型
    async findSysCat() {
      let { code, data } = await request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 搜索知识点
    async onSearch() {
      this.$set(this.knowQuery, 'page', 1)
      await this.setKnowData()
    },
    // 加载事项绑定的知识点列表
    async loadBindKnowList() {
      // 先获取事项绑定的知识点数据
      const findOpsOrderKbmsData = await this.findOpsOrderKbms(this.loadBindKnowListQuery)
      if (findOpsOrderKbmsData.data.length === 0) return
      const ids = []
      findOpsOrderKbmsData.data.forEach(item => {
        ids.push(item.kbmsId)
      })
      this.bindKnowListTotal = Number(findOpsOrderKbmsData.count)
      // 去除知识点id去批量获取知识点
      const findHyitKnowData = await this.findHyitKnow({ limit: -1, ids })
      this.bindKnowListData = findHyitKnowData.data
    },
    // 设置知识点列表数据
    async setKnowData() {
      const findHyitKnow = await this.findHyitKnow(this.knowQuery)
      this.knowList = findHyitKnow.data
      this.knowTotal = Number(findHyitKnow.count)
      const that = this

      this.$refs.deviceTable.clearSelection()
      // const findOpsOrderKbmsData = await this.findOpsOrderKbms({ page: 1, limit: -1 }).data
      const { data } = await this.findOpsOrderKbms({ page: 1, limit: -1 })
      // await this.setMultipleSelectionAll(findOpsOrderKbmsData)
      this.setMultipleSelectionAll(data)

      setTimeout(() => {
        that.setSelectRow()
      }, 500)
    },
    // 获取事项绑定的知识点
    async findOpsOrderKbms(pageQuery) {
      let { code, data, count } = await request({
        url: api.opm.findOpsOrderKbms,
        data: { ...pageQuery, orderId: this.id, orderType: 1 }
      })
      if (code !== 1) return
      return { data, count }
    },
    // 选择知识类
    changeTree(value) {
      if (value && value.length > 1) {
        this.$set(this.knowQuery, 'hyktId', value[value.length - 1])
      }
    },
    // 点击关联知识点
    async onBindKnow() {
      this.showBindKnowDialog = true
      await this.setKnowData()
      const knowType = await this.findSysCat()
      this.knowType = knowType
      this.knowTypeTree = listToTree(knowType, 0, 0, 'catId', 'parentId')
    },
    // 保存绑定知识点
    async saveBindKnow() {
      // 再执行一次记忆勾选数据匹配，目的是为了在当前页操作勾选后直接获取选中数据
      this.changePageCoreRecordData()
      let json = ''
      if (this.multipleSelectionAll.length > 0) {
        json = []
        this.multipleSelectionAll.forEach(item => {
          json.push({
            orderType: 1,
            kbmsId: item.hyKnowId
          })
        })
      }
      let { code } = await request({
        url: api.opm.updateOpsOrderKbmsBatch,
        data: { orderId: this.id, json: JSON.stringify(json) }
      })
      if (code === 1) {
        this.showBindKnowDialog = false
        return this.$message({
          type: 'success',
          message: '保存成功'
        })
      }
    },
    // 打开详情
    showDetail(item) {
      this.onKnow = item.hyKnowId
      this.showBindKnowDetailDialog = true
    },
    /** TABLE SELECT 逻辑 START **/
    // 获取表格行键
    getRowKeys(row) {
      return row.hyKnowId
    },
    // 表格选择事件
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    setMultipleSelectionAll(res) {
      const cIds = []
      const multipleSelectionAll = []
      res.forEach(item => {
        cIds.push(item.kbmsId)
        multipleSelectionAll.push({
          hyKnowId: item.kbmsId
        })
      })
      this.existGroupChnIds = cIds
      this.multipleSelectionAll = multipleSelectionAll
      return true
    },
    // 表格选中
    setSelectRow() {
      if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
        return
      }
      // 标识当前行的唯一键的名称
      const idKey = 'hyKnowId'
      const selectAllIds = []
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(row[idKey])
      })
      this.$refs.deviceTable.clearSelection()
      for (let i = 0; i < this.knowList.length; i++) {
        if (selectAllIds.indexOf(this.knowList[i][idKey]) >= 0) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.deviceTable.toggleRowSelection(this.knowList[i], true)
        }
      }
    },
    // 记忆选择
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      const idKey = 'hyKnowId'
      const that = this
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.multipleSelection
        return
      }
      // 总选择里面的key集合
      const selectAllIds = []
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(row[idKey])
      })
      const selectIds = []
      // 获取当前页选中的id
      this.multipleSelection.forEach(row => {
        selectIds.push(row[idKey])
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(row[idKey]) < 0) {
          that.multipleSelectionAll.push(row)
        }
      })
      const noSelectIds = []
      // 得到当前页没有选中的id
      this.knowList.forEach(row => {
        if (selectIds.indexOf(row[idKey]) < 0) {
          noSelectIds.push(row[idKey])
        }
      })
      noSelectIds.forEach(id => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < that.multipleSelectionAll.length; i++) {
            if (that.multipleSelectionAll[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.multipleSelectionAll.splice(i, 1)
              break
            }
          }
        }
      })
    }
    /** TABLE SELECT 逻辑 END **/
  }
}
</script>

<style lang="scss" scoped>
.related-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  .related-item-subtitle {
    display: -webkit-box;
    line-height: 24px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
