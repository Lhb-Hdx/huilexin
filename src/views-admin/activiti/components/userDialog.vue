<template>
  <el-dialog title="" :visible="true" @close="$emit('close',false)">
    <div class="app-container">
      <div class="filter-container">
        <el-select v-model="companyId" class="filter-item" placeholder="请选择公司">
          <el-option
            v-for="item in companyList"
            :key="item.companyId"
            :label="item.companyName"
            :value="item.companyId"
          />
        </el-select>
        <el-select v-model="isLoginUser" class="filter-item" placeholder="请选择用户类型">
          <el-option label="用户" :value="true" />
          <el-option label="人员" :value="false" />
        </el-select>
        <el-input v-model="listQuery.keyword" placeholder="请输入用户名称" style="width: 200px;" class="filter-item" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onSearch">
          查询
        </el-button>
      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          ref="table"
          :data="list"
          fit
          highlight-current-row
          style="width: 100%;"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" />
          <el-table-column label="ID" prop="userId" align="center" width="80" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.userId }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isUserData" label="用户名称" prop="userName" align="center" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.userName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户姓名" prop="realName" align="center" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.realName }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isUserData" label="用户角色" align="center" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.roles.join(",") }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
    </div>
    <div slot="footer">
      <el-button type="primary" @click="$emit('close',false)">取消</el-button>
      <el-button type="primary" @click="submit()">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import userListMixin from '../../authorization-manage/users/mixins/user-list-mixin'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'

export default {
  name: 'UserDialog',
  mixins: [userListMixin, selectMixin],
  props: {
    dynamicList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyField: 'userId',
      listField: 'list'
    }
  }
}
</script>
