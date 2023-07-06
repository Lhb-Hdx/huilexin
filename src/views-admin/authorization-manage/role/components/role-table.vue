<template>
  <div v-loading="listLoading" class="table-wrapper">
    <el-card shadow="never">

      <el-table
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" prop="roleId" align="center" width="80">
          <template slot-scope="{row}">
            <span>{{ row.roleId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName" align="center">
          <template slot-scope="{row}">
            <span>{{ row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="ctime" align="center">
          <template slot-scope="{row}">
            <span>{{ row.ctime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="cPeople" align="center">
          <template slot-scope="{row}">
            <span>{{ row.cPeople }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="roleDesc" align="center">
          <template slot-scope="{row}">
            <span>{{ row.roleDesc }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { deepClone } from '@/utils'
export default {
  name: 'RoleTable',
  components: { Pagination },
  directives: { waves },
  props: {
    listLoading: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    listQuery: {
      type: Object,
      default: () => {
        return {}
      }
    },
    list: {
      type: Array,
      default: () => {
        return []
      }
    },
    total: {
      type: Number,
      default: () => {
        return 0
      }
    }
  },
  data() {
    return {
    }
  },
  methods: {
    getList() {
      this.$emit('init')
    },
    onEdit(row) {

    },
    onDelete(row) {
      this.$emit('Delete', deepClone(row))
    }
  }
}

</script>

<style lang="scss" scoped>
</style>
