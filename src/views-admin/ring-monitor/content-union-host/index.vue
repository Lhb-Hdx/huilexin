<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <div v-permission="['search']" style="display:inline-block">
        <el-select v-model="contentUnionHostListQuery.hySbId" placeholder="请选择子系统" clearable class="filter-item" style="width: 200px" @clear="onFilter">
          <el-option v-for="item in subSystemList" :key="item.hySbId" :label="item.hySbName" :value="item.hySbId" />
        </el-select>
        <el-input v-model="contentUnionHostListQuery.hyHostName" placeholder="请输入物联主机名称" clearable style="width: 200px;" class="filter-item" @clear="onFilter" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
        <el-button class="filter-item" type="primary" @click="onBatchTransferAssets">批量转资产</el-button>
      </div>
      <ListControl :check-list="checkList" @setLists="setLists" />

    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        ref="table"
        :data="contentUnionHostList"
        fit
        highlight-current-row
        style="width: 100%;"
        @select="handleSelect"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="主机名称" align="left" prop="hyHostName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="类型" align="left" prop="name" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setDevType(item.row.hyDevTypeValue) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="所属子系统" align="left" prop="hySbName" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.matchData(subSystemList,row,'hySbId','hySbName') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="编码" align="right" prop="hyCoding" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="IP" align="right" prop="hyIp" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="端口" align="right" prop="hyPort" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="创建时间" align="right" prop="hyCtime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="状态" align="left">
          <template slot-scope="item">
            <div :class="item.row.hyLinkState === 1 ? 'success' : 'danger'">
              <i :class="item.row.hyLinkState === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.hyLinkState === 1 ? '在线' : '离线' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="操作" align="left" width="400" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['push']" size="mini" type="primary" @click="onPushConfig(row)">
              推送配置
            </el-button>
            <el-button v-permission="['poweroff']" size="mini" type="primary" @click="onReStart(row)">
              关机重启
            </el-button>
            <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="contentUnionHostListQuery.page" :limit.sync="contentUnionHostListQuery.limit" @pagination="findHyitHost" />
  </div>
</template>

<script>
import hostListMixin from './mixins/host-list-mixin'

export default {
  name: 'ContentUnionHostList',
  mixins: [hostListMixin]
}
</script>

<style lang="scss" scoped>

</style>
