<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="请输入资产名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="名称" prop="assetsName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="配置项类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setConfigItem(row.cmdbItemTypeId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-tag :type="row.status === 486 ? 'success' : ''">{{ setUseStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="使用部门" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setUseOrg(row.departmentCatId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="使用期限" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.useStime }} - {{ row.useEtime }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="所在位置" prop="location" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="right" label="采购金额（￥）" prop="price" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="操作" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-if="row.status === 486" v-permission="['ReturnAssets']" type="primary" size="mini" @click="assetsChange(row)">归还</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listQuery.total>0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findAssetsInfo" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'CapitalTable',
  components: { Pagination, ListControl },
  data() {
    return {
      listLoading: true,
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      list: [],
      assetsStatusList: [],
      configItemTreeList: [],
      orgTreeList: [],
      // 显示控制数据 start
      checkList: ['名称', '配置项类型', '状态', '使用部门', '使用期限', '所在位置', '采购金额（￥）', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setUseStatus() {
      return function(status) {
        const idx = this.assetsStatusList.findIndex(item => item.id === status)
        if (idx !== -1) {
          return this.assetsStatusList[idx].dictdataName
        }
      }
    },
    setConfigItem() {
      return function(cmdbCatId) {
        const idx = this.configItemTreeList.findIndex(item => item.id === cmdbCatId)
        if (idx !== -1) {
          return this.configItemTreeList[idx].name
        }
      }
    },
    setUseOrg() {
      return function(departmentCatId) {
        const idx = this.orgTreeList.findIndex(item => item.hyOrgId === departmentCatId)
        if (idx !== -1) {
          return this.orgTreeList[idx].hyOrgName
        }
      }
    }
  },
  mounted() {
    this.findAssetsUseTypeCat()
    this.findConfigItemCat()
    this.findOrganizationCat()
    this.findAssetsInfo()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async onDetail(row) {
      const query = { assetsId: row.assetsId }
      if (row.purchaseId) query.purchaseId = row.purchaseId
      if (row.useId) query.useId = row.useId
      this.$router.push({
        name: 'AssetsDetail',
        query
      })
    },
    handleCreate() {
      this.$router.push({
        name: 'AssetsCreate'
      })
    },
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findAssetsInfo()
    },
    findAssetsInfo() {
      const userInfo = this.localStorageOperation('get', 'userInfo')
      this.findHrUserInfo({ userId: userInfo.userId, companyId: this.$auth.getUserSession().companyId }).then(res => {
        console.log(res)
        if (res.length > 0) {
          request({
            url: api.assets.findAssetsInfo,
            data: {
              ...this.listQuery,
              userId: res[0].id
            }
          }).then(res => {
            this.listLoading = false
            if (res.code === 1 && res.data) {
              this.list = res.data
              console.log(this.list)
              const assetsIds = []
              this.list.forEach(item => { assetsIds.push(item.assetsId) })
              // 通过关联表查询出关联信息，然后再去调用查看获取出关联的信息
              // 采购
              this.findAssetsPurchaseMap({ assetsIds: assetsIds.join(',') }).then(purchaseMapRes => {
                if (purchaseMapRes.code === 1 && purchaseMapRes.data.length > 0) {
                  const purchaseIds = []
                  purchaseMapRes.data.forEach(item => { purchaseIds.push(item.purchaseId) })
                  this.findAssetsPurchase({ purchaseIds: purchaseIds.join(',') }).then(purchaseRes => {
                    if (purchaseRes.code === 1 && purchaseRes.data.length > 0) {
                      purchaseRes.data.forEach(item => {
                        const idx = purchaseRes.map.assetsPurchaseMapList.findIndex(items => items.purchaseId === item.purchaseId)
                        if (idx !== -1) {
                          item.assetsId = purchaseRes.map.assetsPurchaseMapList[idx].assetsId
                        }
                      })
                      this.list.forEach((item, index) => {
                        const idx = purchaseRes.data.findIndex(items => items.assetsId === item.assetsId)
                        if (idx !== -1) {
                          // 采购金额
                          this.$set(this.list[index], 'price', purchaseRes.data[idx].price / 1000)
                          this.$set(this.list[index], 'purchaseId', purchaseRes.data[idx].purchaseId)
                        }
                      })
                    }
                  })
                }
              })
              // 使用人
              this.findAssetsUseMap({ assetsDeviceIds: assetsIds.join(',') }).then(useMapRes => {
                if (useMapRes.code === 1 && useMapRes.data.length > 0) {
                  const useIds = []
                  useMapRes.data.forEach(item => { useIds.push(item.useId) })
                  this.findAssetsUse({ useIds: useIds.join(',') }).then(useRes => {
                    if (useRes.code === 1 && useRes.data.length > 0) {
                      useRes.data.forEach(item => {
                        const idx = useRes.map.assetsUseMapList.findIndex(items => items.useId === item.useId)
                        if (idx !== -1) {
                          item.assetsId = useRes.map.assetsUseMapList[idx].assetsDeviceId
                        }
                      })
                      this.list.forEach((item, index) => {
                        const idx = useRes.data.findIndex(items => items.assetsId === item.assetsId)
                        if (idx !== -1) {
                          this.$set(this.list[index], 'useId', useRes.data[idx].useId)
                          // 所在位置
                          this.$set(this.list[index], 'location', useRes.data[idx].location)
                          // 使用部门
                          this.$set(this.list[index], 'departmentCatId', useRes.data[idx].departmentCatId)
                          // 使用期限
                          this.$set(this.list[index], 'useStime', useRes.data[idx].useStime)
                          this.$set(this.list[index], 'useEtime', useRes.data[idx].useEtime)
                        }
                      })
                    }
                  })
                }
              })
            } else {
              this.listLoading = false
              this.list = []
            }
          })
        } else {
          this.listLoading = false
          this.list = []
        }
      })
    },
    // 查询与资产关联的采购单
    async findAssetsPurchaseMap(data) {
      return await request({
        url: api.assets.findAssetsPurchaseMap,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    // 查询与资产关联的使用人
    async findAssetsUseMap(data) {
      return await request({
        url: api.assets.findAssetsUseMap,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    // 查询采购单
    async findAssetsPurchase(data) {
      return await request({
        url: api.assets.findAssetsPurchase,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    // 查询使用
    async findAssetsUse(data) {
      return await request({
        url: api.assets.findAssetsUse,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    onDelete(row) {
      // 删除资产同时要查询有没有关联采购单和使用人信息，有的话要删除采购单和使用人信息
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.assets.deleteAssetsInfo,
          data: { assetsId: row.assetsId }
        }).then(res => {
          if (res.code === 1) {
            this.findAssetsInfo()
            // 删除采购单
            request({
              url: api.assets.deleteAssetsPurchase,
              data: { purchaseId: row.purchaseId }
            })

            // 删除使用人
            request({
              url: api.assets.deleteAssetsUse,
              data: { useId: row.useId }
            })
          }
        })
      })
    },
    // 获取使用状态
    findAssetsStatusCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产使用状态', parentId: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsStatusList = res.data
        }
      })
    },
    // 获取配置项
    findConfigItemCat() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.configItemTreeList = res.data
        }
      })
    },
    // 获取部门
    findOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.orgTreeList = res.data
        }
      })
    },
    assetsChange(row) {
      this.$confirm('确认归还吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteAssetsUseMap({
          useId: row.useId,
          assetsDeviceId: row.assetsId
        }).then(res => {
          if (res) {
            this.findAssetsInfo()
            // 插入变更日志
            this.insertAssetsChangeLog({
              organizationCatId: row.departmentCatId,
              sourceType: 1,
              assetsDeviceId: row.assetsId
            })
            // 修改资产信息
            this.saveAssetsInfo({
              assetsId: row.assetsId,
              assetsName: row.assetsName,
              status: 485
            })
            this.$message({
              type: 'success',
              message: '归还成功'
            })
          } else {
            this.$message.error('归还失败')
          }
        })
      })
    },
    // 删除资产使用
    async deleteAssetsUseMap(data) {
      return await request({
        url: api.assets.deleteAssetsUseMap,
        data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 新增变更记录
    insertAssetsChangeLog(data) {
      request({
        url: api.assets.insertAssetsChangeLog, data
      })
    },
    // 获取人员
    async findHrUserInfo(data) {
      return await request({
        url: api.hr.findHrUserInfo,
        data
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    },
    // 获取使用类型
    findAssetsUseTypeCat() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'assets_use_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsStatusList = res.data
        }
      })
    },
    // 修改资产信息
    saveAssetsInfo(data) {
      request({
        url: api.assets.updateAssetsInfo, data
      })
    }
  }
}
</script>
