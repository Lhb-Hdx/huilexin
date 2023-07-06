<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="addCat">新增</el-button>
      <el-input v-model="listQuery.keywords" v-permission="['Search']" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <!--      <el-select v-model="hyktId"  placeholder="请选择知识点类型" clearable class="filter-item" style="width: 200px">-->
      <!--        &lt;!&ndash;        <el-option v-for="item in typeArr" :key="item.catId" :label="item.catName" :value="item.catId" />&ndash;&gt;-->
      <!--      </el-select>-->
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
        <el-table-column label="序号" prop="hyKnowId" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="编号" prop="hyKnowCode" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="名称" prop="hyKnowName" width="550" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="所属类目" prop="hyKtId" show-overflow-tooltip>
          <template slot-scope="{row}">
            <p v-for="item in knowTypeCat" :key="item.hyKtId">
              <span v-if="row.hyKtId == item.catId">{{ item.catName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="更新时间" prop="hyUtime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="用户名" prop="hyUserId" show-overflow-tooltip>
          <template slot-scope="{row}">
            <p v-for="item in userArr" :key="item.userId">
              <span v-if="row.hyUserId == item.userId">{{ item.realName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="发布状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-switch
              v-model="row.hyStatus"
              :active-value="1"
              :inactive-value="0"
              @change="changeHyStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="操作" align="left" width="280" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <!-- <el-button v-permission="['See']" size="mini" type="primary" @click="onSee(row)"> -->
            <el-button size="mini" type="primary" @click="onSee(row)">
              查看
            </el-button>
            <el-button v-if="row.hyStatus === 0" v-permission="['Attachment']" size="mini" type="primary" @click="onEnclosure(row)">
              附件
            </el-button>
            <el-button v-if="row.hyStatus === 0" v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-if="row.hyStatus === 0" v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
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
      HyStatusList: [
        {id: 1, value: '已发布'},
        {id: 0, value: '未发布'}
      ],
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
    // 查看
    onSee(row) {
      this.$router.push({
        name: 'knowledgeDetailSee',
        query: {
          hyKnowId: row.hyKnowId || 0
        }
      })
    },
    addCat() { // 新增
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'KnowledgePointsCreate'
      })
    },
    onEdit(row) { // 编辑
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'KnowledgePointsUpdate',
        query: {
          hyKnowId: row.hyKnowId || 0
        }
      })
    },
    onEnclosure(row) { // 跳转附件页面
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'knowledgeEnclosure',
        query: {
          hyKnowId: row.hyKnowId || 0
        }
      })
    },
    onDelete(row) { // 删除
      this.$confirm('是否删除该知识点？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.knowledge.deleteHyitKnow,
          data: { hyKnowId: row.hyKnowId }
        })
          .then(res => {
            if (res.code === 1) {
              this.loadCat()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
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
        this.userArr = res.data
      })
    },
    // 改变发布状态
    async changeHyStatus(row) {
      const res = await request({
        url: api.knowledge.updateHyitKnow,
        data: {hyKnowId: row.hyKnowId, hyStatus: row.hyStatus}
      })
      if (res.code === 1) {
        this.$message({
          type: 'success',
          message: '更新成功!'
        })
      } else {
        this.loadCat()
        this.$message({
          type: 'success',
          message: '更新失败，请重试!'
        })
      }
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
