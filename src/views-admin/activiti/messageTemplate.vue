<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="handleAdd()">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.keyword" placeholder="请输入应用名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="MessageTemplateList"
        style="width: 100%"
      >
        <el-table-column label="模板名称" prop="templateName" show-overflow-tooltip align="left" />
        <!-- <el-table-column label="类型" prop="classify" show-overflow-tooltip align="left" /> -->
        <el-table-column label="程序编码" prop="templateCode" show-overflow-tooltip align="left" />
        <el-table-column label="模板ID" prop="templateId" show-overflow-tooltip align="left" />
        <el-table-column label="类型" prop="classify" show-overflow-tooltip align="left" />

        <el-table-column label="状态" prop="status" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            <span v-if="row.status==='enable'">可用</span>
            <span v-else>不可用</span>

          </template>
        </el-table-column>

        <el-table-column width="300px" label="操作">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.tid)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findMessageTemplate()" />
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
export default {
  name: 'MessageTemplate',
  components: {
    Pagination
  },
  data() {
    return {
      listQuery: {
        limit: 10,
        pageSize: 1
      },
      listCount: 0,
      MessageTemplateList: []

    }
  },
  mounted() {
    this.findMessageTemplate()
  },
  methods: {
    handleAdd() {
      this.$router.push({ name: 'AddMessageTemplate' })
    },
    async  findMessageTemplate() {
      const messageRes = await request({
        url: api.template.findMessageTemplate, data: { ...this.listQuery }
      })
      if (messageRes.code === 1) {
        this.listCount = Number(messageRes.count)
        this.MessageTemplateList = messageRes.data
      }
    },
    handleEdit(row) {
      this.$router.push({ name: 'EditMessageTemplate', query: {
        id: row.tid
      }})
    },
    handleDelete(row) {
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.template.deleteMessageTemplate, data: { tId: row }
        }).then(res => {
          if (res.code === 1) {
            request({
              url: api.message.saveMessageTemplateVariables, data: { tId: row, json: [] }
            }).then(itemRes => {
              if (itemRes.code === 1) {
                this.findMessageTemplate()
              }
            })
            this.$message.success(res.msg)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    }

  }

}
</script>
<style scoped>
.el-form-item {
    margin-bottom: 0;
}
</style>
