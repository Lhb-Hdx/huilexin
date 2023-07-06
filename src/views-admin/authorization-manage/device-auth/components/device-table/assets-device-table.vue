<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-if="listType === 'all_device' || listType === ''" v-model="findDeviceQuery.keyword" v-permission="['Search']" placeholder="请输入资产名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="onSearch" />
      <el-select v-if="listType === 'all_device' || listType === ''" v-model="findDeviceQuery.status" v-permission="['Search']" style="width: 200px;" class="filter-item" placeholder="请选择状态" clearable>
        <el-option
          v-for="item in assetsStatusList"
          :key="item.id"
          :label="item.dictdataName"
          :value="item.id"
        />
      </el-select>
      <el-input v-if="listType === 'auth_device' && validRole" v-model="findDeviceQuery.keyword" v-permission="['Search']" placeholder="请输入资产名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="onSearch" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
      <el-button v-if="listType === 'all_device' || listType === ''" v-permission="['BatchAuthorization']" class="filter-item" type="primary" @click="batchAuth">批量授权</el-button>
      <el-button v-if="listType === 'auth_device' && validRole" v-permission="['BatchCloseAuthorization']" class="filter-item" type="primary" @click="batchCloseAuth">批量取消授权</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        ref="authDeviceTable"
        :data="list"
        fit
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="名称" prop="assetsName" show-overflow-tooltip>
          <template v-slot="{ row }">
            <div class="pointer linear-1" style="color:#0145ab" @click="onPushDetail(row)">{{ row.assetsName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="IP" prop="ip" show-overflow-tooltip />
        <el-table-column label="配置项类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setConfigItem(row.cmdbItemTypeId) }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="{row}">
            <el-tag v-if="row.status" :type="row.status === 486 ? 'success' : ''">{{ setUseStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用部门" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setUseOrg(row.departmentCatId) }}
          </template>
        </el-table-column>
        <el-table-column label="使用开始时间" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.useStime }}
          </template>
        </el-table-column>
        <el-table-column label="使用结束时间" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.useEtime }}
          </template>
        </el-table-column>
        <el-table-column label="管理人" prop="manageUseName" show-overflow-tooltip />
        <el-table-column label="区域" prop="hyAreaName" show-overflow-tooltip />
        <el-table-column label="所在位置" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.hostObj?row.hostObj.hyAddr:'' }}
          </template>
        </el-table-column>
        <el-table-column label="使用人" prop="useName" show-overflow-tooltip />

        <!-- <el-table-column label="采购金额（￥）" prop="price" show-overflow-tooltip /> -->
        <el-table-column label="操作" class-name="small-padding fixed-width" width="400" align="left">
          <template slot-scope="{row}">
            <el-button v-if="listType === 'all_device' || listType === ''" v-permission="['Authorization']" size="mini" type="primary" @click="handlerAuth(row)">
              授权
            </el-button>
            <el-button v-if="listType === 'auth_device' && validRole" v-permission="['CloseAuthorization']" size="mini" type="primary" @click="onCloseAuth(row)">
              取消授权
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="findDeviceQuery.total>0" :auto-scroll="false" :total="findDeviceQuery.total" :page.sync="findDeviceQuery.page" :limit.sync="findDeviceQuery.limit" @pagination="findAssetsInfo" />
    </div>
  </div>
</template>

<script>
import assetsListMixin from '@/views-admin/assets/assets-manage/mixins/assets-list-mixin'
import deviceAuthMixins from '../../mixins/device-auth-mixins'

export default {
  name: 'AssetsDeviceTable',
  mixins: [assetsListMixin, deviceAuthMixins],
  data() {
    return {
      keyField: 'assetsId', // 资产列表主键id
      listField: 'list', // 资产列表变量名称
      columns: false,
      findDeviceQuery: {
        page: 1,
        limit: 10,
        total: 0
      },
      // listQuery: {
      //   agent: '',
      //   devType: '',
      //   keyword: '',
      //   hostType: 1,
      //   page: 1,
      //   limit: 10,
      //   agents: ''
      // },
      batchDeviceIds: '',
      batchExtIds: ''
    }
  },
  mounted() {
  },
  methods: {
    onSearch() {
      this.findDeviceQuery.page = 1
      this.loadDeviceList()
    },
    handleSelectionChange(val) {
      // let extIds = []
      let deviceIds = []
      // const hyZhostId = await this.findHyitHost(val.map(it.it.systemDeviceId).filter(Boolean).toString())
      if (val.length > 0) {
        val.forEach(item => {
          // extIds.push(item.hyZhostId)
          if (this.listType === 'all_device' || this.listType === '') {
            deviceIds.push(item.systemDeviceId)
          } else {
            deviceIds.push(item.id)
          }
        })
      } else {
        // extIds = []
        deviceIds = []
      }
      this.batchDeviceIds = deviceIds.toString()
      // this.batchExtIds = extIds.toString()
    },
    async loadDeviceList() {
      // 全部设备
      if (this.listType === 'all_device' || this.listType === '') {
        this.list = await this.initData()
      } else {
        const deviceAuth = await this.findDeviceAuth({ page: this.findDeviceQuery.page, limit: this.findDeviceQuery.limit, roleId: this.roleId, deviceType: 5 })
        if (!deviceAuth.map.data.length) return (this.list = [])
        this.findDeviceQuery.total = +deviceAuth.count
        const deviceAuthIds = deviceAuth.map.data.map(it => it.assetsId).toString()
        let list = await this.initData({ids: deviceAuthIds, limit: -1})
        list.forEach((it, index) => {
          const idx = deviceAuth.map.data.find(item => +item.assetsId === +it.assetsId)
          if (idx)list[index] = {...it, ...idx}
        })
        console.log('list: ', list)
        this.list = list
      }
    },
    // 点击授权
    handlerAuth(item) {
      this.handlerItem = item
      this.isBatch = false
      this.$confirm('确认为该角色授权设备吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const data = { ...this.insertDeviceAuthParams }
        const host = await this.getHyitHost(this.handlerItem.systemDeviceId)
        data.extId = host.hyZhostId
        data.deviceId = this.handlerItem.systemDeviceId
        data.roleId = this.roleId
        data.deviceType = 5
        this.insertDeviceAuth(data)
      })
    },
    // 点击取消授权
    onCloseAuth(item) {
      this.isBatch = false
      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteDeviceAuth(item.id)
      }).catch(() => {})
    },
    // 点击批量授权
    batchAuth() {
      this.isBatch = true
      if (this.isBatch && this.batchDeviceIds === '') {
        this.$message('请选择设备')
        return
      }
      this.$confirm('确认为该角色授权设备吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const hyZhostIds = await this.findHyitHost(this.batchDeviceIds)
        this.batchExtIds = hyZhostIds.map(it => it.hyZhostId).filter(Boolean).toString()
        const data = { ...this.insertDeviceAuthParams }
        data.extIds = this.batchExtIds
        data.deviceIds = this.batchDeviceIds
        data.roleIds = this.roleId
        this.insertDeviceAuth(data)
      })
    },
    // 点击批量取消授权
    batchCloseAuth() {
      this.isBatch = true
      if (this.isBatch && this.batchDeviceIds === '') {
        this.$message('请选择设备')
        return
      }
      this.$confirm('确认取消授权吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteDeviceAuth()
      }).catch(() => {})
    },
    async getHyitHost(hyHostId) {
      const {model, code} = await this.$request({url: this.api.itMonitor.getHyitHost, data: {hyHostId}})
      return model?.hyHostId && code === 1 ? model : {}
    },
    async findHyitHost(ids) {
      const {data, code} = await this.$request({url: this.api.itMonitor.findHyitHost, data: {ids}})
      return code === 1 ? data : []
    },
    async initData(query) {
      this.listLoading = true
      const res = await this.$request({
        url: this.api.assets.findAssetsInfo,
        data: {...this.findDeviceQuery, ...query}
      })
      if (res.code !== 1) return

      const hostIds = res.data.filter(it => +it.systemDeviceType === 2).map(it => it.systemDeviceId).filter(Boolean)
      let hostList = []
      if (hostIds.length) hostList = await this.findHyitHostIds(hostIds)
      const areaIds = hostList.map(it => it.hyOrgId).filter(Boolean)
      let areaList = []
      if (areaIds.length) areaList = await this.findHyitArea(areaIds)

      for (const it of res.data) {
        it['deviceTypeName'] = this.$tool.formatStr(it.systemDeviceType, '1:视频设备,2:it监控设备,3:动环设备')
        it['statueName'] = this.$tool.matchData(this.assetsStatusList, it, 'status', 'dictdataName', 'id')

        // 设备类型，待定
        it['assetClasses'] = this.$tool.matchData(this.assetsTreeList, it, 'assetsCatId', 'catName', 'catId')

        if (hostIds.length) {
          const idx = hostList.find(item => item.hyHostId === it.systemDeviceId)
          if (idx) {
            it['ip'] = idx['hyIp']
            it['deviceStatue'] = idx['hyNetState'] ? '在线' : '离线'
            const area = areaList.find(el => el.hyAreaId === idx.hyOrgId)
            if (area)it['hyAreaName'] = area['hyAreaName']
          }
        }
      }

      const assetsIds = []
      res.data.forEach(item => { assetsIds.push(item.assetsId) })

      // 通过关联表查询出关联信息，然后再去调用查看获取出关联的信息
      // 采购
      const purchaseMapRes = await this.findAssetsPurchaseMap({ assetsIds: assetsIds.join(',') })
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
            res.data.forEach((item, index) => {
              const idx = purchaseRes.data.findIndex(items => items.assetsId === item.assetsId)
              if (idx !== -1) {
                // 采购金额
                this.$set(res.data[index], 'price', purchaseRes.data[idx].price / 1000)
                this.$set(res.data[index], 'purchaseId', purchaseRes.data[idx].purchaseId)
                this.$set(res.data[index], 'purchaseDate', purchaseRes.data[idx].purchaseDate)
                this.$set(res.data[index], 'purchaseOutdate', purchaseRes.data[idx].purchaseDate)
              }
            })
          }
        })
      }
      // 使用人
      const useMapRes = await this.findAssetsUseMap({ assetsDeviceIds: assetsIds.join(',') })
      if (useMapRes.code === 1 && useMapRes.data.length > 0) {
        const useIds = []
        useMapRes.data.forEach(item => { useIds.push(item.useId) })
        this.findAssetsUse({ useIds: useIds.join(',') }).then(async useRes => {
          const userIds = []
          if (useRes.code === 1 && useRes.data.length > 0) {
            // 获取管理人和使用人
            for (const user of useRes.data) {
              userIds.push(user.userId)
              userIds.push(user.manageId)
            }
            const userList = await this.findSysUser(userIds.filter(Boolean).join(','))
            // end 获取管理人和使用人
            useRes.data.forEach(item => {
              const idx = useRes.map.assetsUseMapList.findIndex(items => items.useId === item.useId)
              if (idx !== -1) {
                item.assetsId = useRes.map.assetsUseMapList[idx].assetsDeviceId
                // item.assetsName = this.$tool, matchData(userList, useRes.map.assetsUseMapList[idx],)
              }
            })
            res.data.forEach((item, index) => {
              const idx = useRes.data.findIndex(items => items.assetsId === item.assetsId)

              if (idx !== -1) {
                this.$set(res.data[index], 'useId', useRes.data[idx].useId)
                this.$set(res.data[index], 'userId', useRes.data[idx].userId)
                this.$set(res.data[index], 'manageUseName', this.$tool.matchData(userList, useRes.data[idx], 'userId', 'userRealName', 'id'))
                this.$set(res.data[index], 'useName', this.$tool.matchData(userList, useRes.data[idx], 'manageId', 'userRealName', 'id'))

                this.$set(res.data[index], 'departmentName', this.$tool.matchData(this.orgTreeList, useRes.data[idx], 'departmentCatId', 'hyOrgName', 'hyOrgId'))
                // 所在位置
                this.$set(res.data[index], 'location', useRes.data[idx].location)
                // 使用部门
                this.$set(res.data[index], 'departmentCatId', useRes.data[idx].departmentCatId)
                // 使用期限
                this.$set(res.data[index], 'useStime', useRes.data[idx].useStime)
                this.$set(res.data[index], 'useEtime', useRes.data[idx].useEtime)
                item['manageDepName'] = this.$tool.matchData(this.orgTreeList, useRes.data[idx], 'organizationCatId', 'hyOrgName', 'hyOrgId')
                item['useDepName'] = this.$tool.matchData(this.orgTreeList, useRes.data[idx], 'departmentCatId', 'hyOrgName', 'hyOrgId')
                item['useStatue'] = this.$tool.matchData(this.assetsUseTypeList, useRes.data[idx], 'useTypeId', 'catName', 'catId')
              }
            })
          }
        })
      }
      this.listLoading = false
      if (this.listType === 'all_device' || this.listType === '') this.findDeviceQuery.total = +res.count
      return res.data
    }
  }
}
</script>
