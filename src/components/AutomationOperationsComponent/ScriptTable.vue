<template>
  <div class="script-table">
    <div class="app-container">
      <div class="filter-container">
        <el-button v-permission="['Create']" class="filter-item" type="primary" @click="createScript">新增</el-button>
        <el-select v-model="listQuery.scriptType" v-permission="['Search']" class="filter-item">
          <el-option label="所有类型" value="" />
          <el-option
            v-for="item in scriptType"
            :key="item.id"
            :label="item.dictdataName"
            :value="item.id"
          />
        </el-select>
        <el-select v-if="showScriptStatue" v-model="listQuery.scriptStatue" v-permission="['Search']" class="filter-item">
          <el-option
            v-for="item in scriptStatue"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input v-model="listQuery.keywords" v-permission="['Search']" placeholder="搜索关键词" class="filter-item" style="width: 200px" />
        <el-button v-permission="['Search']" class="filter-item" type="primary" @click="search">查询</el-button>
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>
      <div class="table-wrapper">
        <el-table :data="scriptList">
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" width="250" label="脚本名称" prop="scriptName" show-overflow-tooltip>
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('script_name', 0)" />
                <i class="sort-caret descending" @click="handlerSort('script_name', 1)" />
              </span>
            </template>
            <template slot-scope="{row}">
              {{ row.scriptName }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="脚本类型" prop="scriptType" show-overflow-tooltip>
            <template slot-scope="{row}">{{ setScriptType(row.scriptType) }}</template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="版本号" prop="scriptVersion" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="适用场景" prop="sceneType" show-overflow-tooltip>
            <template slot-scope="{row}">{{ setUsageAcenarios(row.sceneType) }}</template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" width="120" label="适用设备类型" prop="applyDeviceModel" show-overflow-tooltip>
            <template slot-scope="{row}">{{ setDevType(row.applyDeviceType) }}</template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" width="120" label="适用品牌" prop="deviceTypeCatId" show-overflow-tooltip>
            <template slot-scope="{row}">{{ setBrand(row.deviceTypeCatId) }}</template>
          </el-table-column>
          <el-table-column v-if="showCTime && lists.length > 0 ? lists[6].ispass : true" width="120" align="left" label="提交人" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ $tool.matchData(users, row, 'userId', 'realName', 'userId') }}
            </template>
          </el-table-column>
          <el-table-column v-if="showCTime && lists.length > 0 ? lists[7].ispass : true" align="right" width="170" label="提交时间" prop="ctime" />
          <el-table-column v-if="showCTime && lists.length > 0 ? lists[8].ispass : true" align="left" width="100" label="最近操作人" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ $tool.matchData(users, row, 'userId', 'realName', 'userId') }}
            </template>
          </el-table-column>
          <el-table-column v-if="showCTime && lists.length > 0 ? lists[9].ispass : true" align="right" width="170" label="最近操作时间" prop="utime">
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('utime', 0)" />
                <i class="sort-caret descending" @click="handlerSort('utime', 1)" />
              </span>
            </template>
            <template slot-scope="{row}">
              {{ row.utime }}
            </template>
          </el-table-column>
          <el-table-column v-if="showCTime && lists.length > 0 ? lists[10].ispass : true" align="left" label="脚本状态" prop="verifyStatue" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div :class="setVerifyStatue(row.verifyStatue, 'type')">{{ setVerifyStatue(row.verifyStatue, 'label') }}</div>
            </template>
          </el-table-column>
          <el-table-column v-if="$auth.getVuexStoragePermission('StateSwitch') && showStateSwitch && showCTime && lists.length > 0 ? lists[11].ispass : true" align="left" label="启用状态" prop="scriptStatue">
            <template slot-scope="{row}">
              <el-switch
                v-model="row.scriptStatue"
                :active-value="1"
                :inactive-value="0"
                :disabled="row.verifyStatue !== 1"
                @change="changeScriptStatus(row)"
              />
            </template>
          </el-table-column>
          <slot />
        </el-table>
        <pagination v-show="scriptListTotal > 0" :auto-scroll="false" :total="scriptListTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitOpsScript" />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ScriptTable',
  components: {
    Pagination, ListControl
  },
  props: {
    showStateSwitch: {
      type: Boolean,
      default() {
        return true
      }
    },
    showVerifyStatue: {
      type: Boolean,
      default() {
        return true
      }
    },
    showCTime: {
      type: Boolean,
      default() {
        return true
      }
    },
    showUTime: {
      type: Boolean,
      default() {
        return false
      }
    },
    scriptStatueProp: {
      type: [String, Number],
      default() {
        return ''
      }
    },
    verifyStatueProp: {
      type: [String, Number],
      default() {
        return ''
      }
    },
    showScriptStatue: {
      type: Boolean,
      default() {
        return true
      }
    },
    routerName: {
      type: Object,
      default() {
        return {
          create: ''
        }
      }
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        keywords: '',
        scriptStatue: this.scriptStatueProp,
        scriptType: '',
        verifyStatue: this.verifyStatueProp,
        sceneType: '',
        applyDeviceType: '',
        scriptGroupId: ''
      },
      scriptListTotal: 0,
      scriptList: [],
      scriptType: [],
      scriptStatue: [
        { value: '', label: '全部' },
        { value: 1, label: '启用' },
        { value: 0, label: '未启用' }
      ],
      sceneType: this.$defineData.getOpsSceneType(),
      verifyStatue: [
        { value: 1, label: '已审核', type: 'success' },
        { value: 0, label: '未审核', type: 'danger' }
      ],
      deviceType: [],
      deviceTypeBrand: [],
      users: [],
      // 显示控制数据 start
      checkList: ['脚本名称', '脚本类型', '版本号', '适用场景', '适用设备类型', '适用品牌', '提交人', '提交时间', '最近操作人', '最近操作时间', '脚本状态', '启用状态'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setScriptType() {
      return function (key) {
        const idx = this.scriptType.findIndex(item => Number(item.id) === Number(key))
        if (idx !== -1) return this.scriptType[idx].dictdataName
      }
    },
    setUsageAcenarios() {
      return function (key) {
        const idx = this.sceneType.findIndex(item => Number(item.value) === Number(key))
        if (idx !== -1) return this.sceneType[idx].label
      }
    },
    setDevType() {
      return function (key) {
        const idx = this.deviceType.findIndex(item => Number(item.id) === Number(key))
        if (idx !== -1) return this.deviceType[idx].dictdataName
      }
    },
    setBrand() {
      return function (key) {
        const idx = this.deviceTypeBrand.findIndex(item => Number(item.id) === Number(key))
        if (idx !== -1) return this.deviceTypeBrand[idx].dictdataName
      }
    },
    setVerifyStatue() {
      return function (key, attr) {
        const idx = this.verifyStatue.findIndex(item => Number(item.value) === Number(key))
        if (idx !== -1) return this.verifyStatue[idx][attr]
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-ops-group-item,handler-ops-scene-item')
  },
  mounted() {
    this.findScriptType()
    this.findDevType()
    this.findItDeviceType()
    this.findHyitOpsScript()
    this.$EventBus.$on('handler-ops-group-item', (val) => {
      this.$set(this.listQuery, 'scriptGroupId', val.expand ? '' : val.treeItemId)
      this.search()
    })
    this.$EventBus.$on('handler-ops-scene-item', (val) => {
      this.$set(this.listQuery, 'sceneType', val.value === 0 ? '' : val.value)
      this.search()
    })
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 获取脚本类型
    findScriptType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_script_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.scriptType = res.data
        }
      })
    },
    // 查询脚本
    findHyitOpsScript() {
      this.$request({
        url: this.api.automationOperations.findHyitOpsScript,
        data: this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          this.scriptListTotal = Number(res.count)
          this.scriptList = res.data
          const userIds = []
          res.data.forEach(item => {
            userIds.push(item.userId)
          })
          this.users = await this.commonRequestFn.findSysUser({
            ids: this.$tool.uniqueArray(userIds).toString(),
            limit: -1,
            companyId: this.$auth.getUserSession().companyId
          })
        }
      })
    },
    // 加载设备品牌
    findDevType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceTypeBrand = res.data
        }
      })
    },
    // 获取设备类型
    findItDeviceType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceType = res.data
        }
      })
    },
    // 修改脚本状态
    changeScriptStatus(data) {
      const requestData = { ...data }
      delete requestData.ctime
      delete requestData.utime
      const scriptStatus = data.scriptStatue === 1 ? '启用成功!' : '禁用成功!'
      this.$request({ url: this.api.automationOperations.updateHyitOpsScript, data: { id: data.id, scriptStatue: data.scriptStatue }}).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: scriptStatus
          })
        } else {
          this.$message({
            type: 'error',
            message: '请求失败!'
          })
        }
      })
    },
    // 搜索
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.findHyitOpsScript()
    },
    // 新增
    createScript() {
      this.$tool.storagePageTableQuery('set', this.$route.name, this.listQuery)
      this.$router.push({
        name: this.routerName.create ? this.routerName.create : 'ScriptCreate'
      })
    },
    // 查看分析表达式
    async findHyitOpsResultExpression(scriptId) {
      const { code, data } = await this.$request({
        url: this.api.automationOperations.findHyitOpsResultExpression,
        data: { scriptId }
      })
      if (code !== 1) return
      return data
    },
    // 删除分析
    deleteHyitOpsResultExpression(id) {
      this.$request({
        url: this.api.automationOperations.deleteHyitOpsResultExpression,
        data: { id }
      })
    },
    handlerSort(orderBy, isDesc) {
      this.$set(this.listQuery, 'page', 1)
      this.$set(this.listQuery, 'orderBy', orderBy)
      this.$set(this.listQuery, 'isDesc', isDesc)
      this.findHyitOpsScript()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
