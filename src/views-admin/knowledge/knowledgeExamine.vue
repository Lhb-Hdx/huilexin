<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keywords" v-permission="['Search']" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />

      <el-cascader
        v-model="hyktId"
        v-permission="['Search']"
        clearable
        class="filter-item"
        style="width: 200px"
        placeholder="请选择知识点类型"
        :options="tree"
        :props="{ value: 'catId', label: 'catName', checkStrictly: true }"
        @change="changeTree"
      />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="searchCat">搜索</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="data"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" prop="hyKnowId" type="index" width="100" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="编号" align="left" prop="hyKnowCode" width="200" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="名称" align="left" prop="hyKnowName" width="550" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="所属类目" align="left" prop="hyKtId" width="200" show-overflow-tooltip>
          <template slot-scope="{row}">
            <p v-for="item in knowTypeCat" :key="item.hyKtId">
              <span v-if="row.hyKtId == item.catId">{{ item.catName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="更新时间" align="right" prop="hyUtime" width="180" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="用户名" align="left" prop="hyUserId" show-overflow-tooltip>
          <template slot-scope="{row}">
            <p v-for="item in userArr" :key="item.userId">
              <span v-if="row.hyUserId == item.userId">{{ item.realName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="发布状态" align="left" prop="hyStatus" width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.hyStatus"
              :active-value="1"
              :inactive-value="0"
              @change="changeHyStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="操作" align="left" width="120">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onSee(row)">
              预览
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="loadCat" />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import ListControl from '@/components/ListControl'

export default {
  components: { Pagination, ListControl },
  data() {
    return {
      page: 1,
      limit: -1,
      hyktId: '',
      data: [],
      tree: [],
      drawer: false,
      direction: 'rtl',
      catId: 0,
      catName: null,
      parentId: 0,
      catProps: { value: 'catId', label: 'catName', checkStrictly: true },
      total: 0,
      typeArr: [],
      userArr: [],
      // 查看-搜索
      listQuery: {
        keywords: null,
        hyKnowId: '',
        hyUserId: '',
        page: -1,
        limit: 10
      },
      knowTypeCat: [],
      // 显示控制数据 start
      checkList: ['编号', '名称', '所属类目', '更新时间', '用户名', '发布状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  mounted() {
    this.loadCat()
    this.getTypeArr()
    this.getSysUser()
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 预览
    onSee(row) {
      console.log(row)
      this.$router.push({
        name: 'knowledgeDetailSee',
        query: {
          hyKnowId: row.hyKnowId || 0
        }
      })
    },
    // 改变发布状态
    async changeHyStatus(row) {
      console.log(row)
      const res = await request({
        url: api.knowledge.updateHyitKnow,
        data: {hyKnowId: row.hyKnowId, hyStatus: row.hyStatus}
      })
      if (res.code !== 1) return
      // this.loadCat()
    },
    searchCat() { // 搜索
      this.listQuery.page = 1
      this.data = []
      this.loadCat()
    },
    loadCat() { // 列表
      request({
        url: api.knowledge.findHyitKnow,
        data: { page: this.listQuery.page, limit: this.listQuery.limit, keywords: this.listQuery.keywords, hyktId: this.hyktId }
      }).then(res => {
        this.data = res.data
        console.log(this.data)
        this.total = Number(res.count)
      })
    },
    // 获取父类类型select
    getTypeArr() {
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', page: 1, limit: -1 }
      }).then(res => {
        this.knowTypeCat = res.data
        this.tree = []
        if (this.listType === false) {
          this.tree = res.data
          return
        }
        this.tree = listToTree(res.data, 0, 0, 'catId', 'parentId')
      })
    },
    changeTree(value) {
      if (value && value.length > 1) {
        this.hyktId = value[value.length - 1]
      }
    },
    getSysUser() {
      request({
        url: api.knowledge.findSysUser,
        data: { page: 1, limit: -1, companyId: this.$auth.getUserSession().companyId }
      }).then(res => {
        // console.log(res)
        this.userArr = res.data
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.wrp{
    >div.el-input,>div.el-cascader{padding: 5px 20px;}
}
</style>
<style lang="scss" scoped>
.wrp{
    padding: 20px;
}
.bar{display: flex;margin-bottom: 20px;}
.keywords{width: 250px;}
</style>
