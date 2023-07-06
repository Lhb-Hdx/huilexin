<template>
  <div class="assets-detail-component">
    <div class="assets-change-list">
      <el-empty v-if="assetsChangeLog.length === 0" description="暂无记录" />
      <div v-for="item in assetsChangeLog" :key="item.changeId" class="change-list-item">
        <div class="change-list-time">{{ item.createDate }}</div>
        <div class="change-list-main">
          <!-- 入库 -->
          <template v-if="item.sourceType === 1">
            <!-- 归还 -->
            <template v-if="!item.status && item.organizationCatId"><span class="font-bold">{{ setOrg(item.organizationCatId) }}</span> 归还资产。</template>
            <!-- 登记 -->
            <template v-if="!item.status && !item.organizationCatId">资产登记。</template>
          </template>
          <!-- 出库 -->
          <template v-if="item.sourceType === 2">
            {{ setUseType(item.useTypeId) }}给 <span class="font-bold">{{ setOrg(item.organizationCatId) }}</span> 使用，使用期限 <span class="font-bold">{{ item.stime }} - {{ item.etime }}</span>。
          </template>
          <!-- 保养 -->
          <template v-if="item.sourceType === 3">
            资产保养。
          </template>
          <!-- 报废 -->
          <template v-if="item.sourceType === 4">
            资产报废。
          </template>
        </div>
      </div>
      <el-pagination
        v-if="findAssetsChangeLogQuery.total > 0"
        background
        layout="prev, pager, next"
        :total="findAssetsChangeLogQuery.total"
        @current-change="pageChange"
      />
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'DetailRecord',
  data() {
    return {
      assetsChangeLog: [],
      assetsUseTypeList: [],
      orgTreeList: [],
      findAssetsChangeLogQuery: {
        page: 1,
        limit: 10,
        assetsDeviceId: this.$route.query.assetsId,
        total: 0
      }
    }
  },
  computed: {
    setUseType() {
      return function(useTypeId) {
        const idx = this.assetsUseTypeList.findIndex(item => item.catId === useTypeId)
        if (idx !== -1) {
          return this.assetsUseTypeList[idx].catName
        }
      }
    },
    setOrg() {
      return function(departmentCatId) {
        const idx = this.orgTreeList.findIndex(item => item.hyOrgId === departmentCatId)
        if (idx !== -1) {
          return this.orgTreeList[idx].hyOrgName
        }
      }
    }
  },
  mounted() {
    if (this.$route.query.assetsId) this.findAssetsChangeLog()
    this.findAssetsUseTypeCat()
    this.findOrganizationCat()
  },
  methods: {
    pageChange(val) {
      this.$set(this.findAssetsChangeLogQuery, 'page', val)
      this.findAssetsChangeLog()
    },
    // 获取变更记录
    findAssetsChangeLog() {
      request({
        url: api.assets.findAssetsChangeLog,
        data: this.findAssetsChangeLogQuery
      }).then(res => {
        if (res.code === 1) {
          this.assetsChangeLog = res.data
          this.$set(this.findAssetsChangeLogQuery, 'total', Number(res.count))
        }
      })
    },
    // 使用方式
    findAssetsUseTypeCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产使用方式', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsUseTypeList = res.data
        }
      })
    },
    // 部门列表
    findOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.orgTreeList = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.assets-change-list {
  .change-list-item {
    .change-list-time {
      background: #F5F7FA;
      color: #666666;
      padding: 8px 14px;
      font-size: 14px;
    }
    .change-list-main {
      padding: 8px 14px;
      font-size: 15px;
    }
  }
}
</style>
