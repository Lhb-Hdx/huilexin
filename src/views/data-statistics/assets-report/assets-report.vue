<template>
  <div>
    <div class="echarts-box flex-v-between p-20">
      <div class="echarts-box-item"><div id="one" ref="echart1" :style="echartStyle" /></div>
      <div class="echarts-box-item"><div id="two" ref="echart2" :style="echartStyle" /></div>
      <div class="echarts-box-item"><div id="three" ref="echart3" :style="echartStyle" /></div>
    </div>

    <div class="px-20">
      <el-tabs v-model="activeName" @tab-click="onTabChange">
        <el-tab-pane v-for="(item) in tabs" :key="item.id" :label="item.name" :name="item.id" />
      </el-tabs>
    </div>

    <div class="px-20  pb-20">
      <div class="flex-v-between">
        <div class="filter-container">
          <el-input v-model="listQuery.keyword" style="width:auto" class="filter-item" placeholder="请输入设备名称" clearable />

          <el-select v-model="listQuery.systemDeviceType" style="width: 200px;" class="filter-item" placeholder="请选择类型" clearable>
            <el-option label="视频设备" :value="1" />
            <el-option label="it监控设备" :value="2" />
            <el-option label="动环设备" :value="3" />
          </el-select>
          <el-select v-model="listQuery.hyOrgId" style="width: 200px;" class="filter-item" placeholder="请选择区域" clearable>
            <el-option
              v-for="item in areaList"
              :key="item.hyAreaId"
              :label="item.hyAreaName"
              :value="item.hyAreaId"
            />
          </el-select>
          <!-- <el-select v-model="listQuery.status" style="width: 200px;" class="filter-item" placeholder="请选择管理人员">
            <el-option
              v-for="item in assetsStatusList"
              :key="item.id"
              :label="item.dictdataName"
              :value="item.id"
            />
          </el-select> -->
          <el-select v-model="listQuery.status" style="width: 200px;" class="filter-item" placeholder="请选择状态" clearable>
            <el-option
              v-for="item in assetsStatusList"
              :key="item.id"
              :label="item.dictdataName"
              :value="item.id"
            />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
          <ExportExcelWithStyle
            class="filter-item"
            :base64="base64"
            :merge-num="mergeNum"
            :content="content"
            :row-height="rowHeight"
            button-title="汇总导出"
            :loading="exportLoading"
            :title="exportFileName"
            :fillter-list="filterList"
            :excel-title="ExcelTitle"
            :file-name="exportFileName"
            @sendRequest="initExcelData"
          />
        </div>
        <div class="mb-10 pointer ">
          <el-popover
            placement="bottom-start"
            width="200"
            trigger="hover"
          >
            <i slot="reference" class="el-icon-s-operation font-22 mr-20" />
            <div v-for="item in columns" :key="item.prop">
              <el-checkbox v-model="item.show" :label="item.label" :indeterminate="false" />
            </div>
          </el-popover>
        </div>
      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          ref="table"
          :data="list"
          fit
          highlight-current-row
        >
          <el-table-column label="序号" width="80" type="index" />
          <!-- <el-table-column label="设备名称/IP" prop="assetsName" show-overflow-tooltip>
            <template v-slot="{row}">
              <div style="color:#0145ab" class="font-16">{{ row.assetsName }}</div>
              <div>{{ row.ip }}</div>
            </template>
          </el-table-column>
          <el-table-column label="设备类型" show-overflow-tooltip prop="deviceTypeName" />
          <el-table-column label="采购时间" prop="purchaseDate" show-overflow-tooltip />
          <el-table-column label="采购价格" prop="price" show-overflow-tooltip />
          <el-table-column label="管理人" prop="manageUseName" show-overflow-tooltip />
          <el-table-column label="使用信息" prop="useStatue" show-overflow-tooltip />
          <el-table-column label="使用人" prop="useName" show-overflow-tooltip />

          <el-table-column label="使用到期时间" show-overflow-tooltip prop="useEtime" />
          <el-table-column label="所在区域" prop="hyAreaName" show-overflow-tooltip />
          <el-table-column label="所在位置" prop="location" show-overflow-tooltip />
          <el-table-column label="状态">
            <template slot-scope="{row}">
              <el-tag :type="row.status === 486 ? 'success' : ''">{{ row.statueName }}</el-tag>
            </template>
          </el-table-column> -->
          <template v-for="(item) in columns">
            <el-table-column v-if="columns.find(it=>it.prop===item.prop).show && item.prop!=='statueName'" :key="item.prop" v-bind="item">
              <template v-slot="{row}">
                <div v-if="item.prop==='assetsName'">
                  <div style="color:#0145ab" class="font-16 linear-1 pointer" @click="onPushDetail(row)">{{ row.assetsName }}</div>
                  <div>{{ row.ip }}</div>
                </div>

                <div v-else-if="item.prop==='location'">
                  <div>
                    {{ row.hostObj.hyAddr }}
                  </div>
                </div>
                <div v-else>
                  {{ row[item.prop] }}
                </div>
              </template>

              <!-- <template v-if="item.prop==='assetsName'" v-slot="{row}">
                <div style="color:#0145ab" class="font-16 linear-1 pointer" @click="onPushDetail(row)">{{ row.assetsName }}</div>
                <div>{{ row.ip }}</div>
              </template></el-table-column> -->
            </el-table-column></template>

          <el-table-column v-if="columns.find(it=>it.prop==='statueName').show" label="状态" prop="statueName">
            <template slot-scope="{row}">
              <el-tag v-if="row.status" :type="row.status === 486 ? 'success' : ''">{{ row.statueName }}</el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column label="使用部门" show-overflow-tooltip>
            <template slot-scope="{row}">
              {{ setUseOrg(row.departmentCatId) }}
            </template>
          </el-table-column> -->
          <!-- <el-table-column label="使用开始时间" show-overflow-tooltip>
            <template slot-scope="{row}">
              {{ row.useStime }}
            </template>
          </el-table-column> -->

        </el-table>
        <pagination v-show="listQuery.total>0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findAssetsInfo" />
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import assetsListMixin from '@/views-admin/assets/assets-manage/mixins/assets-list-mixin.js'
import ExportExcelWithStyle from '@/components/ExportExcelWithStyle/export-excel-with-style'
export default {
  name: 'AssetsReport',
  components: {
    ExportExcelWithStyle
  },
  mixins: [assetsListMixin],
  data() {
    return {
      echartStyle: {
        height: '250px',
        width: '100%',
        flex: 1
      },
      activeName: '',
      filterList: [],
      ExcelTitle: [
        // { title: '设备编号', dataIndex: 'deviceTypeName', width: '20'},
        { title: '设备名称', dataIndex: 'assetsName', width: '50'},
        { title: 'IP', dataIndex: 'ip', width: '20'},
        { title: '设备类型', dataIndex: 'deviceTypeName', width: '20'},
        // { title: '子类型', dataIndex: 'deviceTypeName', width: '20'},
        { title: '设备状态', dataIndex: 'deviceStatue', width: '20'},
        { title: '采购时间', dataIndex: 'purchaseDate', width: '25'},
        { title: '采购价格', dataIndex: 'price', width: '30'},
        { title: '使用周期', dataIndex: 'useEtime', width: '25'},
        { title: '使用状态', dataIndex: 'statueName', width: '10'},
        { title: '管理部门', dataIndex: 'manageDepName', width: '15'},
        { title: '管理人', dataIndex: 'manageUseName', width: '20'},
        { title: '使用部门', dataIndex: 'useDepName', width: '15'},
        { title: '使用人', dataIndex: 'useName', width: '20'},
        { title: '所在区域', dataIndex: 'hyAreaName', width: '30'},
        { title: '所在位置', dataIndex: 'location', width: '30'},
        // { title: '所属客户', dataIndex: 'location', width: '30'},
        { title: '所属项目', dataIndex: 'projectName', width: '30'}
      ],
      mergeNum: 3, // 需合并的行数
      content: 4, // 第四行开始为内容
      exportFileName: '资产报表',
      base64: [], // echarts的base64
      rowHeight: [ // excel各行行高
        { num: 1, height: 100},
        { num: 2, height: 40},
        { num: 3, height: 200},
        { num: 4, height: 40}
      ],
      exportLoading: false,
      columns: [
        {label: '设备名称 / IP', prop: 'assetsName', 'show-overflow-tooltip': true, show: true},
        {label: '设备类型', prop: 'deviceTypeName', 'show-overflow-tooltip': true, show: true},
        {label: '采购时间', prop: 'purchaseDate', 'show-overflow-tooltip': true, show: true},
        {label: '采购价格', prop: 'price', 'show-overflow-tooltip': true, show: true},
        {label: '管理人', prop: 'manageUseName', 'show-overflow-tooltip': true, show: true},
        {label: '使用信息', prop: 'useStatue', 'show-overflow-tooltip': true, show: true},
        {label: '使用人', prop: 'useName', 'show-overflow-tooltip': true, show: true},
        {label: '使用到期时间', prop: 'useEtime', 'show-overflow-tooltip': true, show: true},
        {label: '所在区域', prop: 'hyAreaName', 'show-overflow-tooltip': true, show: true},
        {label: '所在位置', prop: 'location', 'show-overflow-tooltip': true, show: true},
        {label: '状态', prop: 'statueName', 'show-overflow-tooltip': true, show: true}
      ],
      tabs: [],
      areaList: []
    }
  },
  created() {
  },
  async mounted() {
    this.areaList = await this.findHyitArea()
    await this.findTabsData()
    await this.initEchart(this.$refs.echart1, [])
    // this.initEchart(this.$refs.echart2)
    await this.initEchart(this.$refs.echart3, [])
    await this.countAssetByDeviceType()
    await this.countAssetByHyAreaId()
    await this.countAssetByUseStatus()
  },
  methods: {
    // 统计设备类别
    async countAssetByDeviceType() {
      const {data, code} = await this.$request({url: this.api.assets.countAssetByDeviceType, data: {limit: -1}})
      if (code !== 1) return data
      let echartData = []
      for (const it of data) {
        const idx = this.$tool.formatStr(it.systemDeviceType, '1:视频设备,2:it监控设备,3:动环设备')
        if (idx) echartData.push({name: idx, value: +it.count})
        else echartData.push({name: '空', value: +it.count})
      }
      console.log('echartData: ', echartData)
      this.initEchart(this.$refs.echart1, echartData)
    },
    // 根据区域统计资产
    async countAssetByHyAreaId() {
      const {data, code} = await this.$request({url: this.api.assets.countAssetByHyAreaId, data: {limit: -1}})
      if (code !== 1) return
      const areaList = await this.findHyitArea(data.map(it => it.hyOrgId).filter(Boolean))
      let echartData = []
      for (const it of data) {
        const idx = areaList.find(item => +item.hyAreaId === +it.hyOrgId)
        if (idx) echartData.push({name: idx.hyAreaName, value: +it.count})
      }
      this.initEchart(this.$refs.echart2, echartData)
    },
    // 根据使用状态统计资产
    async countAssetByUseStatus() {
      const {data, code} = await this.$request({url: this.api.assets.countAssetByUseStatus, data: {limit: -1, projectId: this.listQuery.projectId}})
      if (code !== 1) return data
      let echartData = []
      for (const it of data) {
        const idx = this.assetsStatusList.find(item => +item.id === +it.status)
        if (idx)echartData.push({name: idx.dictdataName, value: +it.count})
      }

      this.initEchart(this.$refs.echart3, echartData)
    },
    onTabChange(item) {
      this.listQuery.page = 1
      this.listQuery.projectId = item.name
      this.findAssetsInfo()
    },

    async findTabsData() {
      const {data, code} = await this.$request({url: this.api.itAgentGroup.findHyitAgentGroup, data: {limit: -1}})
      if (code !== 1) return
      this.tabs = data.map(it => ({...it, id: String(it.id)}))
      this.listQuery.projectId = data[0]['id']
      this.activeName = '' + data[0]['id']
      this.findAssetsInfo()
    },
    initEchart(el, data) {
      let len = Math.floor(data.length / 3)
      let newLegends = []
      for (let i = 0; i <= len; i++) {
        newLegends.push({
          data: data.slice(i * 3, (i + 1) * 3).map((it) => it.name),
          top: (50 + (i + 1) * 22) + '%',
          left: 'center',
          orient: 'horizontal'
        })
      }
      newLegends = newLegends.sort((a, b) => b.data.length - a.data.length)
      var myChart = echarts.init(el)
      var option

      option = {
        tooltip: {
          trigger: 'item'
        },
        legend: newLegends,
        grid: {
          top: '15%'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '35%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      }

      option && myChart.setOption(option)
    },
    createBase64(ele, num) {
      let baseCanvas = document.getElementById(ele).getElementsByTagName('canvas')[num]
      if (!baseCanvas) return false
      let width = baseCanvas.width
      let height = baseCanvas.height
      let ctx = baseCanvas.getContext('2d')
      ctx.drawImage(baseCanvas, 0, 0, width, height)
      let base64 = baseCanvas.toDataURL()
      return base64
    },
    async initExcelData() {
      this.exportLoading = true
      let b1 = this.createBase64('one', 0)
      let b2 = this.createBase64('two', 0)
      let b3 = this.createBase64('three', 0)
      this.base64 = [
        {base: b1, length: 0.9},
        {base: b2, length: 5},
        {base: b3, length: 10}
      ]

      if (this.cmdbItemTypeId) this.$set(this.listQuery, 'cmdbItemTypeId', this.cmdbItemTypeId)
      const res = await this.$request({
        url: this.api.assets.findAssetsInfo,
        data: {cmdbItemTypeId: this.cmdbItemTypeId, limit: -1, projectId: this.listQuery.projectId}
      })
      if (res.code !== 1) return

      const hostIds = res.data.filter(it => +it.systemDeviceType === 2).map(it => it.systemDeviceId).filter(Boolean)
      let hostList = []
      if (hostIds.length) hostList = await this.findHyitHostIds(hostIds)
      const areaIds = hostList.map(it => it.hyOrgId).filter(Boolean)
      let areaList = []
      if (areaIds.length) areaList = await this.findHyitArea(areaIds)

      const project = this.tabs.find(it => +it.id === +this.listQuery.projectId)
      for (const it of res.data) {
        it['deviceTypeName'] = this.$tool.formatStr(it.systemDeviceType, '1:视频设备,2:it监控设备,3:动环设备')
        it['statueName'] = this.$tool.matchData(this.assetsStatusList, it, 'status', 'dictdataName', 'id')

        // 设备类型，待定
        it['assetClasses'] = this.$tool.matchData(this.assetsTreeList, it, 'assetsCatId', 'catName', 'catId')

        it['projectName'] = project?.name
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

      setTimeout(() => {
        this.filterList = res.data
        this.exportLoading = false
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts-box-item{
  flex: 1;
  width: 100%;
  padding-left:7%;
  padding-right:7%;
}
</style>
