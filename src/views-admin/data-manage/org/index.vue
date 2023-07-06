<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入组织架构搜索关键词" class="filter-item filter-item-input" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="searchCat">搜索</el-button>
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="addCat">新增</el-button>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="data"
        row-key="hyOrgId"
        default-expand-all
        fit
        highlight-current-row
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        style="width: 100%;"
      >
        <el-table-column label="名称" prop="hyOrgName" align="left" />
        <el-table-column label="操作" align="left" width="250" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['AddChildren']" size="mini" type="primary" @click="onAdd(row)">
              新增子级
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer
      title="组织架构信息"
      :visible.sync="drawer"
      :direction="direction"
    >
      <div class="wrp">
        <el-form ref="form" :model="form" :rules="rules">
          <el-row :gutter="12">
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="hyOrgName">
                <el-input v-model="form.hyOrgName" placeholder="组织架构名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="hyPid">
                <el-cascader
                  v-model="form.hyPid"
                  :options="tree"
                  :props="catProps"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="cmdbItemTypeId">
                <el-cascader
                  v-model="form.cmdbItemTypeId"
                  disabled
                  placeholder="配置类目"
                  :options="classifyTreeList"
                  :props="{ value: 'id', label: 'name', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-button :loading="loading" type="primary" @click="saveCat">保存</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import orgListMixin from './mixins/org-list-mixin'

export default {
  mixins: [orgListMixin]
}
</script>

