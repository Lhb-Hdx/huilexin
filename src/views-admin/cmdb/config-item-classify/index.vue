<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入配置项类目名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        row-key="id"
        default-expand-all
        fit
        highlight-current-row
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        style="width: 100%;"
      >
        <el-table-column label="栏目名称" prop="name" align="left" width="160" />
        <el-table-column label="图标">
          <template slot-scope="{row}">
            <el-image fit="fill" :src="setIcon(row.imageUrl)" style="width: 20px;height: 20px">
              <div slot="error" class="image-slot el-image-sort no-background" />
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" :disabled="row.userDefine === 0" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'

export default {
  name: 'ConfigItemClassifyIndex',
  data() {
    return {
      listLoading: true,
      list: [],
      listQuery: {
        page: 1,
        limit: -1,
        keyword: ''
      }
    }
  },
  computed: {
    setIcon() {
      return function(imgUrl) {
        return imgUrl || ''
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
  },
  mounted() {
    this.findCmdbItemType()
  },
  methods: {
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: this.listQuery
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.list = listToTree(res.data, 0, 0, 'id', 'parentId')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 打开新增
    handleCreate() {
      console.log('@点击新增按钮row')
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'ClassifyCreate'
      })
    },
    // 打开编辑
    onEdit(row) {
      console.log('@点击编辑按钮row', row)
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'ClassifyUpdate',
        query: {
          id: row.id || 0
        }
      })
    },
    // 搜索
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findCmdbItemType()
    },
    // 删除
    onDelete(row) {
      if (row.userDefine === 0) return this.$message('不可删除系统定义的类目')
      if (row.children.length > 0) {
        this.$message('存在子级，不能删除')
      } else {
        this.$confirm('确认删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request({
            url: api.cmdb.deleteCmdbItemType,
            data: {
              id: row.id
            }
          }).then(res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.findCmdbItemType()
            } else {
              this.$message.error(res.msg)
            }
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
