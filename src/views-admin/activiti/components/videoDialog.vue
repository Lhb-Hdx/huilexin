<template>
  <div class="">
    <el-dialog title="" :visible="true" width="60%" @close="$emit('close',false)">
      <div class="filter-container">
        <el-input v-model="listQuery.title" placeholder="请输入设备名" style="width: 150px;" class="filter-item" @keyup.enter.native="onFilter" />
        <el-input v-model="listQuery.ip" placeholder="请输入IP" style="width: 150px;" class="filter-item" @keyup.enter.native="onFilter" />
        <!-- 状态 -->
        <el-select v-model="listQuery.status" clearable placeholder="" class="filter-item" @change="changeSelect('status',$event)">
          <el-option value="" label="全部" />
          <el-option
            v-for="item in addStatusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- 类型 -->
        <el-select v-model="listQuery.devTypeId" clearable placeholder="" class="filter-item" @change="changeSelect('devTypeId',$event)">
          <el-option label="所有类型" value="" />
          <el-option
            v-for="item in typeArr"
            :key="item.hyDevTypeId"
            :label="item.hyDevTypeName"
            :value="item.hyDevTypeId"
          />
        </el-select>
        <!-- 区域 -->
        <el-cascader
          v-model="listQuery.orgIds"
          v-permission="['Search']"
          clearable
          class="filter-item"
          multiple="false"
          :options="areaTreeArr"
          :props="orgProps"
          @change="handleOrgChange"
        />
        <el-button class="filter-item" type="primary" @click="onFilter">查询</el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          ref="table"
          :data="tableData"
          style="width: 100%"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="date" label="NO" type="index" width="70" />
          <el-table-column prop="title" label="设备名称" show-overflow-tooltip />
          <el-table-column prop="ip" label="IP" show-overflow-tooltip />
          <el-table-column prop="devTypeId" label="设备类型" width="150" show-overflow-tooltip>
            <template slot-scope="{row}">
              <!-- <p v-if=""></p> -->
              <p v-for="item in typeArr" :key="item.hyDevTypeValue">
                <span v-if="row.devTypeId === item.hyDevTypeId">{{ item.hyDevTypeName }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="channelCount" label="通道数" show-overflow-tooltip />
          <el-table-column prop="address" label="区域" show-overflow-tooltip>
            <template slot-scope="{row}">
              <p v-for="itemArea in areaArr" :key="itemArea.hyAreaId">
                <span v-if="itemArea.hyAreaId === row.orgId">{{ itemArea.hyAreaName }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" show-overflow-tooltip>
            <template slot-scope="{row}">
              <p :style="row.status === 1 ? 'color:green' : 'color:red'">{{ row.status === 1 ? '在线' : '离线' }}</p>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onFilter" />
      <div slot="footer">
        <el-button type="primary" @click="$emit('close',false)">取消</el-button>
        <el-button type="primary" @click="submit()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import equipmentListMixin from '../../video/mixins/equipment-list-mixin'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'
export default {
  mixins: [equipmentListMixin, selectMixin],
  props: {
    dynamicList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // allSelection: [],
      keyField: 'dvrId',
      listField: 'tableData'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.initTable()
        })
      })
    })
  },
  methods: {

  }
}
</script>

<style lang='scss'>
.equipment {
  padding: 20px;
  &_header {
    margin-bottom: 20px;
    &_input,&_select {
      margin: 0 5px;
    }
    &_select {
      width: 150px;
    }
  }

  .equipment_header {
    display: flex;
    margin-bottom: 20px;
  }
}
.el-upload {
  text-align: left !important;
}
</style>
