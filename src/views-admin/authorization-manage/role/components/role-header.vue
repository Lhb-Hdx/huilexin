<template>
  <div class="filter-container">
    <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">
      新增
    </el-button>
    <el-input v-model="listQuery.title" placeholder="请输入组织架构名称" style="width: 200px;" class="filter-item" @keyup.enter.native="onFilter" />
    <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">
      查询
    </el-button>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
export default {
  name: 'RoleHeader',
  directives: { waves },
  props: {
    loading: {
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
    }
  },
  data() {
    return {
    }
  },
  methods: {
    onCreate() {
      this.$router.push({
        path: '/role/create'
      })
    },
    onFilter() {

    }
  }
}

</script>

<style lang="scss" scoped>
</style>
