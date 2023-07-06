<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入资产名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" style="width: 200px;" class="filter-item" placeholder="请选择状态">
        <el-option
          v-for="item in assetsStatusList"
          :key="item.id"
          :label="item.dictdataName"
          :value="item.id"
        />
      </el-select>
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button v-permission="['BatchAllocation']" class="filter-item" type="primary" @click="handleBatchAllocation">批量分配</el-button>
      <ExportExcel ref="OutputExcel" class="filter-item" style="display:inline-block" button-title="全部导出" file-name="资产信息" :fillter-list="fillterList" :excel-title="excelTitle" />
      <ListControl :check-list="checkList" @setLists="setLists" />
      <!-- <el-button v-permission="['BatchTransferToAssets']" class="filter-item" type="primary" @click="handleBatchAssets">批量转资产</el-button> -->
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        ref="table"
        :data="list"
        fit
        highlight-current-row
        @select="handleSelect"
        @select-all="handleSelectAll"
      >
        <el-table-column type="selection" />
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="名称" width="180" align="left" prop="assetsName" show-overflow-tooltip>
          <template v-slot="{ row }">
            <div class="pointer linear-1" style="color:#0145ab" @click="onPushDetail(row)">{{ row.assetsName }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="IP" width="130" align="right" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" width="120" label="配置项类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setConfigItem(row.cmdbItemTypeId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="状态">
          <template slot-scope="{row}">
            <el-tag v-if="row.status" :type="row.status === 486 ? 'success' : ''">{{ setUseStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="使用部门" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setUseOrg(row.departmentCatId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" width="120" label="使用开始时间" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.useStime }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="right" width="120" label="使用结束时间" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.useEtime }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="管理人" prop="manageUseName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="left" label="区域" prop="hyAreaName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" align="left" label="所在位置" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.hostObj?row.hostObj.hyAddr:'' }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[10].ispass : true" align="left" label="使用人" prop="useName" show-overflow-tooltip />

        <el-table-column v-if="lists.length > 0 ? lists[11].ispass : true" align="left" width="120" label="采购金额（￥）" prop="price" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[12].ispass : true" align="left" label="操作" class-name="small-padding fixed-width" width="400">
          <template slot-scope="{row}">
            <el-button v-if="row.status === 486" v-permission="['ReturnAssets']" type="primary" size="mini" @click="onAssetsChange(row)">归还</el-button>
            <el-button v-permission="['Get']" type="primary" size="mini" @click="onDetail(row)">查看</el-button>
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDelete(row)">删除</el-button>
            <!-- <el-button v-permission="['Delete']" type="primary" size="mini" @click="onQRCode(row)">查看二维码</el-button> -->
            <el-button v-permission="['Delete']" type="primary" size="mini" @click="showPrint(row)">打 印</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total>0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findAssetsInfo" />
    </div>
    <!-- <el-dialog title="查看二维码" :visible.sync="showQRCodeDialog" width="30%" top="5vh">
      <div ref="qrcodeDialog" class="dialog-body no-padding" />
    </el-dialog> -->

    <!-- 打印组件 -->
    <DetailPirnt ref="DetailPirntRef" />

    <el-dialog title="批量分配" :visible.sync="showBatchAllocationDialog" width="50%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="assetsUseForm" :rules="assetsUseFormRules" label-width="110px">
          <el-form-item label="状态" prop="status">
            <el-select v-model="assetsUseForm.status" placeholder="请选择">
              <el-option
                v-for="item of assetsStatusList"
                :key="item.id"
                :label="item.dictdataName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属部门" prop="organizationCatId">
            <el-cascader
              v-model="assetsUseForm.organizationCatId"
              class="w-100"
              placeholder="所属部门"
              :options="orgTreeList"
              :props="{ value: 'hyOrgId', label: 'hyOrgName', checkStrictly: true }"
              @change="changeBeOrg"
            />
          </el-form-item>
          <el-form-item label="管理负责人" prop="manageId">
            <el-select
              v-model="assetsUseForm.manageId"
              placeholder="请选择管理负责人"
              style="width: 100%;"
            >
              <el-option
                v-for="item in beOrgEmployeList"
                :key="item.id"
                class="w-100"
                :label="item.userRealName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="使用方式" prop="useTypeId">
            <el-select
              v-model="assetsUseForm.useTypeId"
              placeholder="请选择使用方式"
              style="width: 100%;"
            >
              <el-option
                v-for="item in assetsUseTypeList"
                :key="item.catId"
                class="w-100"
                :label="item.catName"
                :value="item.catId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="使用部门" prop="departmentCatId">
            <el-cascader
              v-model="assetsUseForm.departmentCatId"
              class="w-100"
              placeholder="使用部门"
              :options="orgTreeList"
              :props="{ value: 'hyOrgId', label: 'hyOrgName', checkStrictly: true }"
              @change="changeUseOrg"
            />
          </el-form-item>
          <el-form-item label="使用负责人" prop="userId">
            <el-select
              v-model="assetsUseForm.userId"
              placeholder="请选择使用负责人"
              style="width: 100%;"
            >
              <el-option
                v-for="item in useOrgEmployeList"
                :key="item.id"
                class="w-100"
                :label="item.userRealName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="使用开始时间" prop="useStime">
            <el-date-picker
              v-model="assetsUseForm.useStime"
              class="w-100"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="使用结束时间" prop="useEtime">
            <el-date-picker
              v-model="assetsUseForm.useEtime"
              class="w-100"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="所在项目" prop="projectCatId">
            <el-select
              v-model="assetsUseForm.projectCatId"
              placeholder="请选择所在项目"
              style="width: 100%;"
            >
              <el-option
                v-for="item in assetsProjectCatList"
                :key="item.catId"
                class="w-100"
                :label="item.catName"
                :value="item.catId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="附件">
            <FileUpload
              v-permission="['UseAttachmentUpload']"
              button-text="选择图片"
              upload-type="pic"
              file-type=".png,.jpg"
              file-url-list-type="picture"
              :limit="1"
              :button-disabled="false"
              :is-limit-file-size="true"
              :file-max-size="1"
              :file-url-list="dataFileList"
              @emitFileList="getEmitUseAttachmentFileList"
            />
          </el-form-item>
          <el-form-item label="位置" prop="location">
            <el-input v-model.trim="assetsUseForm.location" placeholder="请输入所在位置" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBatchAllocationDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="batchAllocationDialog">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import assetsListMixin from './mixins/assets-list-mixin'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'
import ExportExcel from '@/components/ExportExcel/export-excel.vue'
import ListControl from '@/components/ListControl'
import DetailPirnt from '@/views-admin/assets/assets-manage/components/detail-print'

export default {
  name: 'AssetsList',
  components: {
    ExportExcel, ListControl, DetailPirnt
  },
  mixins: [assetsListMixin, selectMixin],
  data() {
    return {
      keyField: 'assetsId', // 资产列表主键id
      listField: 'list', // 资产列表变量名称
      fillterList: [],
      excelTitle: [
        { title: '名称', dataIndex: 'assetsName'},
        { title: 'ip', dataIndex: 'ip'},
        { title: '类型', dataIndex: 'assetsCatName'},
        { title: '配置项类型', dataIndex: 'cmdbCatName'},
        { title: '品牌', dataIndex: 'brandCatName'},
        { title: '型号', dataIndex: 'model'},
        { title: '序列号', dataIndex: 'assetsSn'},
        { title: '状态', dataIndex: 'statueName'},
        { title: '使用部门', dataIndex: 'departmentName'},
        { title: '使用开始时间', dataIndex: 'useStime'},
        { title: '使用结束时间', dataIndex: 'useEtime'},
        { title: '管理人', dataIndex: 'manageUseName'},
        { title: '区域', dataIndex: 'hyAreaName'},
        { title: '所在位置', dataIndex: 'location'},
        { title: '使用人', dataIndex: 'useName'},
        { title: '采购金额', dataIndex: 'price'}
      ],
      // 显示控制数据 start
      checkList: ['名称', 'IP', '配置项类型', '状态', '使用部门', '使用开始时间', '使用结束时间', '管理人', '区域', '所在位置', '使用人', '采购金额（￥）', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  mounted() {
    setTimeout(this.initExcelData, 1000)
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async initExcelData() {
      if (this.cmdbItemTypeId) this.$set(this.listQuery, 'cmdbItemTypeId', this.cmdbItemTypeId)
      const res = await this.$request({
        url: this.api.assets.findAssetsInfo,
        data: {cmdbItemTypeId: this.cmdbItemTypeId, limit: -1}
      })
      if (res.code !== 1) return

      const hostIds = res.data.filter(it => +it.systemDeviceType === 2).map(it => it.systemDeviceId).filter(Boolean)
      let hostList = []
      if (hostIds.length)hostList = await this.findHyitHostIds(hostIds)
      console.log(hostList, 'hostList')
      const areaIds = hostList.map(it => it.hyOrgId).filter(Boolean)
      let areaList = []
      if (areaIds.length) areaList = await this.findHyitArea(areaIds)

      const assetsCatList = await this.findAssetsCat()
      const BrandCatList = await this.findBrandCat()
      // const devTypeList = await this.loadDevType()
      // const manufactorList = await this.findSysCat() // 获取厂家
      console.log(assetsCatList, 'assetsCatList')

      for (const it of res.data) {
        it.cmdbCatName = this.$tool.matchData(this.configItemTreeList, it, 'cmdbItemTypeId', 'name', 'id')
        it.statueName = this.$tool.matchData(this.assetsStatusList, it, 'status', 'dictdataName', 'id')
        it.brandCatName = this.$tool.matchData(BrandCatList, it, 'brandCatId', 'catName', 'catId')
        it.assetsCatName = this.$tool.matchData(assetsCatList, it, 'assetsCatId', 'catName', 'catId')

        if (hostIds.length) {
          const idx = hostList.find(item => item.hyHostId === it.systemDeviceId)
          // console.log(idx, 'idxidxidxidxidxidxidxidxidxidxidx')
          if (idx) {
            it['ip'] = idx['hyIp']
            const area = areaList.find(el => el.hyAreaId === idx.hyOrgId)
            if (area) it['hyAreaName'] = area['hyAreaName']
            it['location'] = idx['hyAddr']
            // it['brandCatName'] = this.$tool.matchData(manufactorList, idx, 'manufactorId', 'catName', 'catId')
            // it['assetsCatName'] = this.$tool.matchData(devTypeList, idx, 'hyDevTypeId', 'dictdataName', 'id')
            // it['model'] = idx['model']
          }
        }
      }
      this.fillterList = res.data
      console.log(this.fillterList, 'this.fillterList')
      const assetsIds = []
      this.fillterList.forEach(item => { assetsIds.push(item.assetsId) })

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
              this.fillterList.forEach((item, index) => {
                const idx = purchaseRes.data.findIndex(items => items.assetsId === item.assetsId)
                if (idx !== -1) {
                  // 采购金额
                  this.$set(this.fillterList[index], 'price', purchaseRes.data[idx].price / 1000)
                  this.$set(this.fillterList[index], 'purchaseId', purchaseRes.data[idx].purchaseId)
                }
              })
            }
          })
        }
      })
      // 使用人
      this.findAssetsUseMap({ assetsDeviceIds: assetsIds.join(',') }).then(async useMapRes => {
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

              this.fillterList.forEach((item, index) => {
                const idx = useRes.data.findIndex(items => items.assetsId === item.assetsId)
                console.log('idx: ', idx)
                console.log('useRes: ', useRes)
                if (idx !== -1) {
                  this.$set(this.fillterList[index], 'useId', useRes.data[idx].useId)
                  this.$set(this.fillterList[index], 'userId', useRes.data[idx].userId)
                  this.$set(this.fillterList[index], 'manageUseName', this.$tool.matchData(userList, useRes.data[idx], 'userId', 'userRealName', 'id'))
                  this.$set(this.fillterList[index], 'useName', this.$tool.matchData(userList, useRes.data[idx], 'manageId', 'userRealName', 'id'))

                  this.$set(this.fillterList[index], 'departmentName', this.$tool.matchData(this.orgTreeList, useRes.data[idx], 'departmentCatId', 'hyOrgName', 'hyOrgId'))
                  // 所在位置
                  // this.$set(this.fillterList[index], 'location', )
                  // this.$set(this.fillterList[index], 'location', useRes.data[idx].location)
                  // 使用部门
                  this.$set(this.fillterList[index], 'departmentCatId', useRes.data[idx].departmentCatId)
                  // 使用期限
                  this.$set(this.fillterList[index], 'useStime', useRes.data[idx].useStime)
                  this.$set(this.fillterList[index], 'useEtime', useRes.data[idx].useEtime)
                }
              })
            }
          })
        }
      })
    },
    // 获取资产类型
    async findAssetsCat() {
      return this.$request({
        url: this.api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产类别' }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          return res.data
          // const firstLevel = res.data.findIndex(item => item.parentId === 0)
          // this.assetsTreeList = listToTree(res.data, res.data[firstLevel].catId, res.data[firstLevel].catId, 'catId', 'parentId')
        }
      })
    },
    // 获取品牌
    async findBrandCat() {
      return this.$request({
        url: this.api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_品牌' }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          // const firstLevel = res.data.findIndex(item => item.parentId === 0)
          // this.brandTreeList = listToTree(res.data, res.data[firstLevel].catId, res.data[firstLevel].catId, 'catId', 'parentId')
          return res.data
        }
      })
    },
    // 获取类别
    async loadDevType() {
      return this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    },
    // 获取厂家类别属性列表
    async findSysCat() {
      return this.$request({
        url: this.api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: 'userDefine_厂家',
          parentId: -1,
          module: 2
        }
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    }

  }
}
</script>
