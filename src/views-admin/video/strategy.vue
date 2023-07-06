<template>
  <div class="app-container">
    <el-page-header :content="navTitle" @back="goBack" />
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="openAddModal">新增</el-button>
      <el-input v-model="listQuery.planName" v-permission="['Search']" placeholder="请输入存储策略名称" style="width: 200px;" class="filter-item" @keyup.enter.native="onFilter" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="onFilter">查询</el-button>
    </div>
    <div class="table-wrapper">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="NO" type="index" width="50" />
        <el-table-column prop="planName" label="存储计划名称" width="260" />
        <el-table-column prop="cycle" label="循环录像">
          <template slot-scope="{row}">
            <p>{{ row.cycle === 0 ? '否' : '是' }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="ctime" label="制定时间" />
        <el-table-column prop="status" label="启动状态">
          <template slot-scope="{row}">
            <el-switch
              v-permission="['StatusSwitch']"
              :value="row.status === 1"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="changeStatus($event,row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="primary" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onFilter" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  components: { Pagination },
  data() {
    return {
      id: 0,
      total: 0,
      listQuery: {
        planName: '',
        ssid: 0,
        page: 1,
        limit: 10
      },
      tableData: []
    }
  },
  computed: {
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  created() {
    if (this.$route.params.id) {
      this.id = this.$route.params.id
      this.listQuery.ssid = this.id
      localStorage.setItem('id', this.id)
    }
    if (localStorage.getItem('id')) {
      this.listQuery.ssid = localStorage.getItem('id')
    }
    // console.log(this.listQuery.gid,'--------SaaS-');
    // if(this.id) {
    //   this.listQuery.gid = this.id
    //   this.$message({
    //     type: 'success',
    //     message: '已查询'+this.id+'网关的存储策略'
    //   });
    // }
    this.onFilter()
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    // 编辑
    openAddModal() {
      const _this = this
      _this.$router.push({
        name: 'CreateStrategy',
        query: {
          gid: _this.listQuery.ssid
        }
      })
    },
    // 查询
    onFilter() {
      const _this = this
      const data = _this.listQuery
      request({
        url: api.video.findVideoPlan,
        data: data
      })
        .then(res => {
          // console.log(res,'------都是掉到所------');
          if (res.code === 1) {
            _this.tableData = res.data
            // console.log(_this.tableData,'_this.tableData');
            _this.total = Number(res.count)
          }
        })
    },
    refresh() {
      const _this = this
      _this.listQuery.gid = 0
      _this.onFilter()
    },
    // 删除
    onDelete(val) {
      const _this = this
      // console.log(val,'点的是什么')
      _this.$confirm('是否删除该存储策略？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoPlan,
          data: { planId: val.planId }
        })
          .then(res => {
            if (res.code === 1) {
              request({
                url: api.video.delPlan,
                data: { planId: val.planId }
              })
                .then(ress => {
                  if (ress.code === 1) {
                    _this.onFilter()
                    _this.$message({
                      type: 'success',
                      message: '删除成功!'
                    })
                  } else {
                    _this.$message.error(res.msg)
                  }
                })
            }
          })
      }).catch(() => {
        _this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 编辑
    onEdit(val) {
      console.log(val)
      this.$router.push({
        name: 'UpdateStrategy',
        query: {
          gid: this.listQuery.ssid,
          planId: val.planId
        }
      })
    },
    // 更新状态
    changeStatus(e, row) {
      // console.log(e,row,'000')
      const _this = this
      request({
        url: api.video.activeOrDisable,
        data: { planId: row.planId, status: e === true ? 1 : '0' }
      })
        .then(res => {
          if (res.code === 1) {
            // console.log(res,'----=更新了？');
            _this.$message({
              type: 'success',
              message: res.msg
            })
            _this.onFilter()
          }
        })
      // if(e){
      //   updateVideoPlan({planId: row.planId,status:1}).then(res=>{
      //     if(res.code == 1){
      //       // addHyitplan({planId: row.planId}).then(ress=>{
      //       //   if(ress.code == 1){
      //       //     _this.$message({
      //       //       type: 'success',
      //       //       message: '更新成功!'
      //       //     });
      //       //     // _this.onFilter()
      //       //   }
      //       // })
      //     } else {
      //       _this.$message.error(res.msg)
      //     }
      //   })
      // } else {
      //   updateVideoPlan({planId: row.planId,status:0}).then(res=>{
      //     if(res.code == 1){
      //       // delPlan({planId: row.planId}).then(ress=>{
      //       //   if(ress.code == 1){
      //       //     _this.$message({
      //       //       type: 'success',
      //       //       message: '更新成功!'
      //       //     });
      //       //     // _this.onFilter()
      //       //   }
      //       // })
      //     } else {
      //       _this.$message.error(res.msg)
      //     }
      //   })
      // }
    }
  }
}
</script>

<style lang='scss' scoped>
.filter-container {padding-top: 14px}
</style>
