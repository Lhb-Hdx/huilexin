<template>
  <div class="asapparatus">
    <div class="asapparatus_header">
      <p>{{ gateway.name }}</p>
      <div class="asapparatus_header_info">
        <p>MAC：{{ gateway.mac }}</p>
        <p>IP：{{ gateway.ip }}</p>
        <p v-if="gateway.status == 0">状态：离线</p>
        <p v-if="gateway.status == 1">状态： <span style="color: green;">在线</span> </p>
        <p v-if="gateway.status == 2">状态：告警</p>
      </div>
    </div>
    <div class="asapparatus_table">
      <!-- 左边 -->
      <div class="asapparatus_table_left">
        <div v-permission="['DeviceListSearch']" class="asapparatus_table_left_header">
          <el-input v-model="listQueryL.title" placeholder="请输入设备名" style="width: 100px;margin-right: 5px;" class="filter-item" @keyup.enter.native="onFilterL" />
          <el-input v-model="listQueryL.ip" placeholder="请输入IP" style="width: 100px;" class="filter-item" @keyup.enter.native="onFilterL" />
          <!-- 状态 -->
          <el-select v-model="listQueryL.status" placeholder="" class="asapparatus_table_left_header-sel">
            <el-option
              v-for="item in statusArrL"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- 类型 -->
          <el-select v-model="listQueryL.devTypeId" placeholder="" class="asapparatus_table_left_header-sel">
            <el-option label="所有类型" value="" />
            <el-option
              v-for="item in typeArrL"
              :key="item.devTypeId"
              :label="item.hyDevTypeName"
              :value="item.devTypeId"
            />
          </el-select>
          <!-- 区域 -->
          <el-cascader
            v-model="listQueryL.orgIds"
            multiple="false"
            :options="areaTreeArr"
            :props="orgProps"
            @change="handleOrgChange"
          />
          <!-- <el-select v-model="listQueryL.orgId" placeholder="" class="asapparatus_table_left_header-sel">
            <el-option label="所有区域" value=""></el-option>
            <el-option
              v-for="item in areaArrL"
              :key="item.hyOrgId"
              :label="item.hyOrgName"
              :value="item.hyOrgId">
            </el-option>
          </el-select> -->
          <el-button class="filter-item asapparatus_table_left_header-sub" type="primary" @click="onFilterL">查询</el-button>
        </div>
        <div class="asapparatus_table_left_table">
          <el-table :data="tableDataLeft.list" style="width: 100%" @selection-change="handleSelectionChangeL">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="cid" label="NO" width="70" />
            <el-table-column prop="title" label="设备名称" width="100">
              <template slot-scope="{row}">
                <p v-for="item in tableDataLeft.map.dvrList" :key="item.ip">
                  <span v-if="item.dvrId == row.dvrId">{{ item.title }}</span>
                </p>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP" width="120">
              <template slot-scope="{row}">
                <p v-for="item in tableDataLeft.map.dvrList" :key="item.ip">
                  <span v-if="item.dvrId == row.dvrId">{{ item.ip }}</span>
                </p>
              </template>
            </el-table-column>
            <el-table-column prop="cname" label="通道" />
            <el-table-column prop="address" label="区域">
              <template slot-scope="{row}">
                <!-- <p v-for="item in tableDataLeft.map.hyitOrgList" :key="item.hyOrgName">
                  <span v-if="item.hyOrgId == row.orgId">{{ item.hyOrgName }}</span>
                </p> -->
                <p v-for="itemArea in areaArrL" :key="itemArea.hyAreaId">
                  <span v-if="itemArea.hyAreaId == row.orgId">{{ itemArea.hyAreaName }}</span>
                </p>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="tableDataLeft.total>0" :auto-scroll="false" :total="tableDataLeft.total" :page.sync="listQueryL.page" :limit.sync="listQueryL.limit" style="overflow: auto;" @pagination="onFilterL" />
        </div>
      </div>
      <div class="asapparatus_table_center">
        <el-button v-permission="['CancelRelevanceDevice']" type="button" class="asapparatus_table_center_lr" @click="leftShift">&lt;&lt;</el-button>
        <el-button v-permission="['RelevanceDevice']" type="button" class="asapparatus_table_center_lr" style="margin: 0 auto;" @click="rightShift">&gt;&gt;</el-button>
      </div>
      <!-- 右边 -->
      <div class="asapparatus_table_left">
        <div v-permission="['RelevanceDeviceListSearch']" class="asapparatus_table_left_header">
          <el-input v-model="listQueryR.title" placeholder="请输入设备名" style="width: 100px;margin-right: 5px;" class="filter-item" @keyup.enter.native="onFilterR" />
          <el-input v-model="listQueryR.ip" placeholder="请输入IP" style="width: 100px;" class="filter-item" @keyup.enter.native="onFilterR" />
          <!-- 状态 -->
          <el-select v-model="listQueryR.status" placeholder="" class="asapparatus_table_left_header-sel">
            <el-option
              v-for="item in statusArrR"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- 类型 -->
          <el-select v-model="listQueryR.devTypeId" placeholder="" class="asapparatus_table_left_header-sel">
            <el-option label="所有类型" value="" />
            <el-option
              v-for="item in typeArrR"
              :key="item.devTypeId"
              :label="item.hyDevTypeName"
              :value="item.devTypeId"
            />
          </el-select>
          <!-- 区域 -->
          <el-cascader
            v-model="listQueryR.orgIds"
            multiple="false"
            :options="areaTreeArr"
            :props="orgProps"
            @change="handleOrgChangeR"
          />
          <!-- <el-select v-model="listQueryR.orgId" placeholder="" class="asapparatus_table_left_header-sel">
            <el-option label="所有区域" value=""></el-option>
            <el-option
              v-for="item in areaArrR"
              :key="item.hyOrgId"
              :label="item.hyOrgName"
              :value="item.hyOrgId">
            </el-option>
          </el-select> -->
          <el-button class="filter-item asapparatus_table_left_header-sub" type="primary" @click="onFilterR">查询</el-button>
        </div>
        <div class="asapparatus_table_left_table">
          <el-table :data="tableDataRight.list" style="width: 100%" @selection-change="handleSelectionChangeR">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="cid" label="NO" width="70" />
            <el-table-column prop="title" label="设备名称" width="100">
              <template slot-scope="{row}">
                <p v-for="item in tableDataRight.map.dvrList" :key="item.ip">
                  <span v-if="item.dvrId == row.dvrId">{{ item.title }}</span>
                </p>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP" width="120">
              <template slot-scope="{row}">
                <p v-for="item in tableDataRight.map.dvrList" :key="item.ip">
                  <span v-if="item.dvrId == row.dvrId">{{ item.ip }}</span>
                </p>
              </template>
            </el-table-column>
            <el-table-column prop="cname" label="通道" />
            <el-table-column prop="address" label="区域">
              <template slot-scope="{row}">
                <!-- <p v-for="item in tableDataRight.map.hyitOrgList" :key="item.hyOrgName">
                  <span v-if="item.hyOrgId == row.orgId">{{ item.hyOrgName }}</span>
                </p> -->
                <p v-for="itemArea in areaArrL" :key="itemArea.hyAreaId">
                  <span v-if="itemArea.hyAreaId == row.orgId">{{ itemArea.hyAreaName }}</span>
                </p>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="tableDataRight.total>0" :auto-scroll="false" :total="tableDataRight.total" :page.sync="listQueryR.page" :limit.sync="listQueryR.limit" style="overflow: auto;" @pagination="onFilterR" />
        </div>
      </div>
    </div>
    <div class="asapparatus_footer">
      <!-- <el-button class="filter-item" type="primary" @click="toLead">保存</el-button> -->
      <el-button class="filter-item" @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { listToTree } from '@/utils/index'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  components: { Pagination },
  data() {
    return {
      orgProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      // total: 0,
      // listQueryL: {
      //   page: 1,
      //   limit: 10
      // },
      // 网关id
      asaId: 0,
      diskModal: false,
      // 表格数据
      tableDataLeft: {
        list: [],
        map: {},
        total: 0
      },
      tableDataRight: {
        list: [],
        map: {},
        total: 0
      },
      // 上一页info
      gateway: {

      },
      listQuery: {
        title: '',
        ip: '',
        status: 'all',
        devTypeId: '',
        orgId: '',
        orgIds: [],
        page: 1,
        limit: 10
      },
      listQueryL: {
        // total:0,
        title: '',
        ip: '',
        status: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      listQueryR: {
        // total: 0,
        title: '',
        ip: '',
        gid: 0,
        status: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      // 状态L/R
      statusArrL: [
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
      statusArrR: [
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
      // 类型L/R
      typeArrL: [],
      typeArrR: [],
      // 区域L/R
      areaArrL: [],
      areaArrR: [],
      areaArr: [], areaTreeArr: [],
      // 左边选择的
      ids: [],
      // 右边选择的
      ids2: [],
      videoDvrList: []
    }
  },
  created() {
    request({ url: api.video.getVideoGateway, data: { id: this.$route.query.id }}).then(res => {
      if (res.code === 1) {
        this.gateway = res.model
        this.listQueryL.gid = 0
        this.listQueryR.gid = this.gateway.id
        this.getTypeArr()
        this.getAreaArr()
        this.onFilterL()
        this.onFilterR()
      }
    })
  },
  methods: {
    // 回到上一页
    goBack() {
      this.$router.back(-1)
    },
    // 获取类型select
    getTypeArr() {
      const _this = this
      request({ url: api.common.findSysDictionaryDetail, data: { dictCode: 'video_dev_type', limit: -1 }}).then(res => {
        for (var i = 0; i < res.data.length; i++) {
          res.data[i].devTypeId = res.data[i].id
          res.data[i].hyDevTypeName = res.data[i].dictdataName
        }
        _this.typeArrL = res.data
        _this.typeArrR = res.data
      })
    },
    // 获取区域select
    getAreaArr() {
      const _this = this
      request({ url: api.area.findHyitArea, data: {}}).then(res => {
        if (res.code === 1) {
          // console.log(res,'区域？')
          _this.areaArrL = res.data
          _this.areaArrR = res.data
          // 设置树结构
          _this.areaTreeArr = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
        }
      })
    },
    // onFilterL
    onFilterL() {
      const _this = this
      const data = _this.listQueryL
      request({
        url: api.video.findVideoChn,
        data: data
      })
        .then(res => {
          if (res.code === 1) {
            _this.tableDataLeft.list = res.data
            _this.tableDataLeft.total = Number(res.count)
            const ids = []
            res.data.forEach(item => {
              ids.push(item.dvrId)
            })
            this.findVideoDvr(ids).then(res => {
              _this.$set(_this.tableDataLeft.map, 'dvrList', res)
            })
          }
        })
    },
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
    // onFilterR
    onFilterR() {
      const _this = this
      const data = _this.listQueryR
      request({
        url: api.video.findVideoChn,
        data: data
      })
        .then(res => {
          if (res.code === 1) {
            _this.tableDataRight.list = res.data
            _this.tableDataRight.total = Number(res.count)
            const ids = []
            res.data.forEach(item => {
              ids.push(item.dvrId)
            })
            this.findVideoDvr(ids).then(res => {
              _this.$set(_this.tableDataRight.map, 'dvrList', res)
            })
          }
        })
    },
    // 保存
    toLead() {

    },
    // 左边选择
    handleSelectionChangeL(val) {
      // console.log(val,'左边的数字');
      const _this = this
      _this.ids = []
      if (val.length > 0) {
        val.forEach(item => {
          _this.ids.push(item.cid)
        })
      }
      // console.log(_this.ids,'_this.ids_this.ids');
    },
    // 左移事件
    leftShift() {
      const _this = this
      if (_this.ids2.length > 0) {
        const data = {
          cid: 0,
          gid: 0,
          ids: _this.ids2
        }
        request({
          url: api.video.updateVideoChn,
          data: data
        })
          .then(res => {
            if (res.code === 1) {
              _this.$message({
                message: '操作成功',
                type: 'success'
              })
              _this.onFilterL()
              _this.onFilterR()
            }
          })
      } else {
        _this.$message({
          message: '请先在右边选择设备',
          type: 'warning'
        })
      }
    },
    // 右边选择
    handleSelectionChangeR(val) {
      // changeVideo
      const _this = this
      _this.ids2 = []
      if (val.length > 0) {
        val.forEach(item => {
          _this.ids2.push(item.cid)
        })
      }
      // console.log(_this.ids2,'_this.ids_this.ids2222');
    },
    // 右移事件
    rightShift() {
      const _this = this
      if (_this.ids.length > 0) {
        const data = {
          cid: 0,
          gid: _this.gateway.id,
          ids: _this.ids
        }
        request({
          url: api.video.updateVideoChn,
          data: data
        })
          .then(res => {
            if (res.code === 1) {
              _this.$message({
                message: '操作成功',
                type: 'success'
              })
              _this.onFilterL()
              _this.onFilterR()
            }
          })
      } else {
        _this.$message({
          message: '请先在左边选择设备',
          type: 'warning'
        })
      }
    },
    handleOrgChange(e) { // 区域查询使用
      this.listQueryL.orgId = e[e.length - 1]
      console.log(JSON.stringify(e), this.listQueryL.orgId)
    },
    handleOrgChangeR(e) { // 区域查询使用
      this.listQueryR.orgId = e[e.length - 1]
      console.log(JSON.stringify(e), this.listQueryR.orgId)
    }
  }
}
</script>

<style lang='scss'>
.asapparatus {
  padding: 20px;
  &_header {
    &_info {
      display: flex;
      p {
        margin-right: 20px;
      }
    }
  }
  &_table {
    display: flex;
    justify-content: space-between;
    &_left {
      width: 46%;
      border: 1px solid #e1e1e1;
      &_header {
        display: flex;
        padding: 10px;
        background-color: #eeeeee;
        margin-bottom: 15px;
        &-sel,&-sub {
          margin-left:5px;
        }
        &-sel {
          width: 120px;
        }
      }
    }
    &_center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      &_lr {
        width: 40px;
        height: 40px;
        background: #eee;
        display: flex;
        align-items: center;
        border-radius: 8px;
        margin: 10px 20px;
        justify-content: center;
        /* cursor: pointer; */
        color: #999;
      }
    }
  }
  &_footer {
    margin-top: 30px;
  }
 }
</style>
