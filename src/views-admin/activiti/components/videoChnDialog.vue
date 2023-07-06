<template>
  <div class="">
    <el-dialog title="" :visible="true" width="60%" @close="$emit('close',false)">
      <div class="filter-container no-padding">
        <el-input v-model="findVideoChnQuery.title" placeholder="请输入设备名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
        <el-input v-model="findVideoChnQuery.ip" placeholder="请输入IP" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
        <el-select v-model="findVideoChnQuery.status" clearable placeholder="请选择设备状态" class="filter-item">
          <el-option
            v-for="item in statusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select v-model="findVideoChnQuery.devTypeId" clearable placeholder="请选择设备类型" class="filter-item">
          <el-option label="所有类型" value="" />
          <el-option
            v-for="item in typeArr"
            :key="item.hyDevTypeId"
            :label="item.hyDevTypeName"
            :value="item.hyDevTypeId"
          />
        </el-select>
        <el-select v-model="findVideoChnQuery.orgId" clearable placeholder="请选择区域" class="filter-item">
          <el-option label="所有区域" value="" />
          <el-option
            v-for="item in areaArr"
            :key="item.hyAreaId"
            :label="item.hyAreaName"
            :value="item.hyAreaId"
          />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="findVideoChn">查询</el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          ref="table"
          :data="videoChnList"
          style="width: 100%"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="设备名称" width="">
            <template slot-scope="{row}">
              {{ setTableField(row.dvrId, 'title') }}
            </template>
          </el-table-column>
          <el-table-column label="IP">
            <template slot-scope="{row}">
              {{ setTableField(row.dvrId, 'ip') }}
            </template>
          </el-table-column>
          <el-table-column label="区域" width="200">
            <template slot-scope="{row}">
              {{ setArea(row.orgId) }}
            </template>
          </el-table-column>
          <el-table-column label="通道名">
            <template slot-scope="{row}">
              <span>{{ row.cname }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="findVideoChnQuery.page" :limit.sync="findVideoChnQuery.limit" @pagination="findVideoChn" />
      <div slot="footer">
        <el-button type="primary" @click="$emit('close',false)">取消</el-button>
        <el-button type="primary" @click="submit()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import loadmore from '@/directive/el-select-loadmore/loadmore'
import { getUserInfo } from '@/utils/auth'
import selectMixin from '@/views-admin/activiti/mixin/selectMixin'

export default {
  name: 'Videochn',
  components: { Pagination },
  directives: { loadmore },
  mixins: [selectMixin],
  props: {
    dynamicList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: true,
      findVideoChnQuery: {
        title: '',
        ip: '',
        status: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      total: 0,
      videoChnList: [],
      chnDvrList: [],
      areaArr: [],
      showDialog: false,
      form: {
        userId: '',
        deviceType: 1
      },
      batchExtIds: '',
      batchDeviceIds: '',
      rules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'blur' }
        ]
      },
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      sysUser: [],
      handlerItem: {},
      // 状态
      statusArr: [
        {
          value: '',
          label: '全部'
        },
        {
          value: 1,
          label: '在线'
        },
        {
          value: 0,
          label: '离线'
        }
      ],
      // 类型
      typeArr: [],
      isBatch: false,
      keyField: 'cid',
      listField: 'videoChnList'
    }
  },
  computed: {
    // 区域
    setArea() {
      const that = this
      return function(orgId) {
        const idx = that.areaArr.findIndex(item => item.hyAreaId === orgId)
        if (idx !== -1) {
          return that.areaArr[idx].hyAreaName
        }
      }
    },
    // 设置表格字段内容
    setTableField() {
      return function(dvrId, field) {
        const idx = this.chnDvrList.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return this.chnDvrList[idx][`${field}`]
        }
      }
    }
  },
  mounted() {
    this.findVideoChn()
    this.getAreaArr()
    this.getTypeArr()
    this.findSysUser()
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    // 获取通道
    findVideoChn() {
      request({ url: api.video.findVideoChn, data: { gid: this.gid, ...this.findVideoChnQuery }}).then(res => {
        if (res.code === 1) {
          this.videoChnList = res.data
          this.total = Number(res.count)
          this.$nextTick(() => {
            this.initTable()
          })
          if (res.data.length > 0) {
            const ids = []
            res.data.forEach(item => {
              ids.push(item.dvrId)
            })
            this.findVideoDvr(ids).then(res => {
              this.chnDvrList = res
            })
          }
        }
      })
    },
    // 获取通道dvr
    async findVideoDvr(ids) {
      return await request({
        url: api.video.findVideoDvr,
        data: { ids: ids.toString() }
      })
        .then(res => {
          if (res.code === 1) {
            return res.data
          }
        })
    },
    // 获取类型select
    getTypeArr() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].hyDevTypeId = res.data[i].id
              res.data[i].hyDevTypeName = res.data[i].dictdataName
            }
            this.typeArr = res.data
          }
        })
    },
    // 获取区域
    getAreaArr() {
      request({ url: api.area.findHyitArea, data: {}}).then(res => {
        if (res.code === 1) {
          this.areaArr = res.data
        }
      })
    },
    // 获取用户
    findSysUser() {
      request({ url: api.sys.findSysUser, data: { ...this.findSysUserQuery, companyId: getUserInfo().companyId }})
        .then(res => {
          if (res.code === 1) {
            res.data.forEach(item => {
              this.$set(this.sysUser, this.sysUser.length, item)
            })
          }
        })
    },
    // 加载更多
    loadMore() {
      this.findSysUserQuery.page = this.findSysUserQuery.page + 1
      this.findSysUser()
    },
    // 选择设备
    handleSelectionChange(val) {
      let extIds = []
      let deviceIds = []
      if (val.length > 0) {
        val.forEach(item => {
          extIds.push(item.dvrId)
          deviceIds.push(item.cid)
        })
      } else {
        extIds = []
        deviceIds = []
      }
      this.batchDeviceIds = deviceIds.toString()
      this.batchExtIds = extIds.toString()
    },
    batchAuth() {
      this.isBatch = true
      if (this.isBatch && (this.batchDeviceIds === '' || this.batchExtIds === '')) {
        this.$message('请选择设备')
        return
      }
      this.showDialog = true
      this.$set(this.form, 'userId', '')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
