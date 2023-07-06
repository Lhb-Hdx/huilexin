<template>
  <div class="addstrategy">
    <el-form ref="ruleForm" :model="addStrategyParam" :rules="rules" class="addstrategy_form">
      <el-form-item label="存储计划名称" :label-width="formLabelWidth" prop="planName">
        <el-input v-model="addStrategyParam.planName" autocomplete="off" style="width: 60%;" />
      </el-form-item>
      <el-form-item label="选择设备" :label-width="formLabelWidth" prop="title">
        <div class="addstrategy_form_facility">
          <div class="addstrategy_form_facility-box" style="width: 60%;">
            <div v-for="item in facilityList" :key="item.cid" class="addstrategy_form_facility-box-select">
              <div class="addstrategy_form_facility-box-select-title">
                <span v-for="itemTitle in chnDvrList" :key="itemTitle.dvrId" :style="{display: item.dvrId !== itemTitle.dvrId ? 'none' : 'inline-block' }">
                  <span v-if="item.dvrId === itemTitle.dvrId">{{ itemTitle.title }}_{{ item.cname }}</span>
                </span>
                <span style="margin-left: 8px;" @click="removeSelect(item)">×</span>
              </div>
            </div>
          </div>
          <el-button type="primary" style="margin-left: 10px;height: 36px;" @click="aisleModalFun">选择设备</el-button>
        </div>
      </el-form-item>
      <el-form-item label="码流类型" :label-width="formLabelWidth" prop="flow">
        <el-select v-model="addStrategyParam.flow" placeholder="" class="" style="width: 60%;">
          <el-option
            v-for="item in mltypeArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            style="width: 60%;"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="循环录像" :label-width="formLabelWidth" prop="cycle">
        <el-select v-model="addStrategyParam.cycle" placeholder="" class="" style="width: 60%;">
          <el-option
            v-for="item in cycleArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            style="width: 60%;"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间段" :label-width="formLabelWidth" prop="tid">
        <el-select v-model="addStrategyParam.tid" placeholder="请选择时间段" class="" style="width: 60%;">
          <el-option
            v-for="item in timeList"
            :key="item.hyTid"
            :label="item.hyTname"
            :value="item.hyTid"
            style="width: 60%;"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="padding: 20px;">
        <el-button v-permission="['Submit']" :loading="loading" type="primary" @click="onSave()">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>

    <!-- 通道 -->
    <el-dialog title="选择设备" :visible.sync="aisleModal">
      <div class="grouping_table_header">
        <el-input v-model="findVideoChnQuery.title" placeholder="设备名" style="width: 150px;margin-right: 5px;" class="filter-item equipment_header_input" @keyup.enter.native="onFilter" />
        <el-input v-model="findVideoChnQuery.ip" placeholder="IP" style="width: 150px;margin-right: 5px;" class="filter-item equipment_header_input" @keyup.enter.native="onFilter" />
        <el-select v-model="findVideoChnQuery.status" placeholder="" class="grouping_table_header_select">
          <el-option
            v-for="item in statusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- 类型 -->
        <el-select v-model="findVideoChnQuery.devTypeId" placeholder="" class="grouping_table_header_select">
          <el-option label="所有类型" value="" />
          <el-option
            v-for="item in typeArr"
            :key="item.hyDevTypeId"
            :label="item.hyDevTypeName"
            :value="item.hyDevTypeId"
          />
        </el-select>
        <!-- 区域 -->
        <el-select v-model="findVideoChnQuery.orgId" placeholder="" class="grouping_table_header_select">
          <el-option label="所有区域" value="" />
          <el-option
            v-for="item in areaArr"
            :key="item.hyAreaId"
            :label="item.hyAreaName"
            :value="item.hyAreaId"
          />
        </el-select>
        <el-button class="filter-item" type="primary" @click="findVideoChn">查询</el-button>
      </div>
      <el-table ref="aisleCheck" :data="aisleTableMapPlanChn" row-key="cid" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" :reserve-selection="true" />
        <el-table-column type="index" label="NO" width="50" />
        <el-table-column property="planName" label="设备名称" width="">
          <template slot-scope="{row}">
            <p v-for="(item, index) in chnDvrList" :key="index">
              <span v-if="row.dvrId === item.dvrId">{{ item.title }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column property="" label="IP">
          <template slot-scope="{row}">
            <p v-for="(item, index) in chnDvrList" :key="index">
              <span v-if="row.dvrId === item.dvrId">{{ item.ip }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column property="" label="区域" width="200">
          <template slot-scope="{row}">
            <p v-for="item in areaArr" :key="item.hyOrgId">
              <span v-if="row.orgId === item.hyOrgId">{{ item.hyOrgName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column property="cname" label="通道名">
          <template slot-scope="{row}">
            <span>{{ row.cname }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="aisleListQuery.page" :limit.sync="aisleListQuery.limit" @pagination="onFindPlanChn" />
      <!-- <div style="text-align: center;">
        <el-button type="" @click="aisleModal = false">取消</el-button>
        <el-button type="primary" @click="aisleModal = false">确认</el-button>
      </div> -->
    </el-dialog>
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
      addStrategyModal: false,
      aisleModal: false,
      addOrEdit: 'add',
      loading: false,
      findVideoChnQuery: {
        title: '',
        ip: '',
        status: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      addStrategyParam: {
        planName: '',
        planType: 1,
        flow: 1,
        ssId: 0,
        cycle: 1,
        cidDvrids: '',
        tid: '',
        times: 60
      },
      // 码流类型
      mltypeArr: [
        {
          value: 1,
          label: '主码流'
        },
        {
          value: 2,
          label: '子码流'
        },
        {
          value: 3,
          label: '第三流'
        }
      ],
      planTypeArr: [
        {
          label: '录像',
          value: 1
        },
        {
          label: '抓图',
          value: 2
        }
      ],
      cycleArr: [
        {
          value: 0,
          label: '不循环'
        },
        {
          value: 1,
          label: '循环'
        }
      ],
      formLabelWidth: '120px',
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
      // 区域
      areaArr: [],
      aisleListQuery: {
        title: '',
        ip: '',
        status: 1,
        gid: 0,
        type: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      total: 0,
      aisleTable: [], // 计划列表
      aisleTableMapPlanChn: [], // 新增计划选择设备列表
      planData: [],
      editPlanList: [], // 编辑计划选择设备列表
      planList: [], // 选择设备列表
      aisleTableMap: {},
      // 已选设备
      facilityList: [],
      // 设备Select
      facilityListSel: [],
      // 时间段设置
      timeList: [],
      rules: {
        planName: [
          { required: true, message: '请输入存储计划名称', trigger: 'blur' }
        ],
        planType: [
          { required: true, message: '', trigger: 'blur' }
        ],
        flow: [
          { required: true, message: '', trigger: 'blur' }
        ],
        cycle: [
          { required: true, message: '', trigger: 'blur' }
        ]
      },
      // 自定义时间
      formtime: [],
      formtimeSelect: 1,
      selectchnDvrList: [],
      chnDvrList: []
    }
  },
  computed: {
    gid() { // 网关id
      return this.$route.query.gid
    },
    planId() { // 存储策略id
      return this.$route.query.planId
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  mounted() {
    this.getAreaArr()
    this.getTypeArr()
    this.getFindHyitTime()
    this.findVideoChn()
    if (this.$route.query.planId) {
      this.getVideoPlan()
      this.findVideoPlanChn()
    }
  },
  methods: {
    // 返回
    goBack() {
      this.$router.back(-1)
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
    // 获取区域select
    getAreaArr() {
      request({ url: api.area.findHyitArea, data: {}}).then(res => {
        if (res.code === 1) {
          this.areaArr = res.data
        }
      })
    },
    // 获取存储策略信息
    getVideoPlan() {
      request({ url: api.video.getVideoPlan, data: { planId: this.planId }}).then(res => {
        if (res.code === 1) {
          Object.keys(this.addStrategyParam).forEach(key => {
            this.$set(this.addStrategyParam, `${key}`, res.model[key])
          })
        }
      })
    },
    // 获取通道
    findVideoChn() {
      request({ url: api.video.findVideoChn, data: { gid: this.gid, ...this.findVideoChnQuery, bUse: 1 }}).then(res => {
        if (res.code === 1) {
          this.aisleTableMapPlanChn = res.data
          this.total = Number(res.count)
          if (res.data.length > 0) {
            const ids = []
            res.data.forEach(item => {
              ids.push(item.dvrId)
            })
            this.findVideoDvr(ids).then(res => {
              res.forEach(item => {
                this.$set(this.chnDvrList, this.chnDvrList.length, item)
              })
            })
          }
        }
      })
    },
    // 获取通道dvr
    async findVideoDvr(ids) {
      return await request({
        url: api.video.findVideoDvr,
        data: { ids: ids.toString(), limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            return res.data
          }
        })
    },
    // 获取时间模板
    getFindHyitTime() {
      request({
        url: api.video.findHyitTime,
        data: {}
      })
        .then(res => {
          if (res.code === 1) {
            this.timeList = res.data
          }
        })
    },
    // 获取存储策略绑定的设备
    findVideoPlanChn() {
      request({
        url: api.video.findVideoPlanChn,
        data: { planId: this.planId, page: 1, limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            if (res.data) {
              const that = this
              this.facilityList = [...res.data]
              const chnIds = []
              const dvrIds = []
              this.facilityList.forEach(item => { chnIds.push(item.cid) })
              request({ url: api.video.findVideoChn, data: { ids: chnIds.toString() }}).then(chnRes => {
                if (chnRes.code === 1) {
                  chnRes.data.forEach(item => {
                    const idx = that.facilityList.findIndex(items => {
                      return items.cid === item.cid
                    })
                    if (idx !== -1) {
                      that.$set(that.facilityList[idx], 'cname', item.cname)
                    }
                  })
                }
              })
              this.facilityList.forEach(item => { dvrIds.push(item.dvrId) })
              request({ url: api.video.findVideoDvr, data: { ids: dvrIds.toString(), limit: -1 }}).then(dvrRes => {
                if (dvrRes.code === 1) {
                  dvrRes.data.forEach(item => {
                    this.$set(this.chnDvrList, this.chnDvrList.length, item)
                  })
                }
              })
            }
          }
        })
    },
    // 打开选择设备
    aisleModalFun() {
      const that = this
      that.aisleModal = true
    },
    // 保存
    onSave() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const data = { ...this.addStrategyParam }
          const apiName = this.planId ? api.video.updateVideoPlan : api.video.addVideoPlan
          data.ssId = this.gid
          if (this.planId) data.planId = this.planId
          let cidDvrids = ''
          this.facilityList.forEach(item => {
            cidDvrids += item.dvrId + '_' + item.cid + ','
          })
          data.cidDvrids = cidDvrids.slice(0, cidDvrids.length - 1)
          console.log(apiName, data)
          request({
            url: apiName,
            data: data
          })
            .then(res => {
              if (res.code === 1) {
                this.$message({
                  type: 'success',
                  message: res.msg
                })
                this.$router.back()
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
              }
            })
        }
      })
    },
    onFindPlanChn() {},
    onGetAllPageByGid() {},
    // 选择框选择设备
    handleSelectionChange(val) {
      this.facilityListSel = []
      this.facilityList = val
      this.facilityList.forEach(item => {
        this.chnDvrList.forEach(itemPlan => {
          if (item.dvrId === itemPlan.dvrId) {
            this.facilityListSel.push(itemPlan.title + '_' + item.dvrId)
          }
        })
      })
    },
    removeSelect(item) {
      const idx = this.facilityList.findIndex(items => items.dvrId === item.dvrId && items.cid === item.cid)
      this.facilityList.splice(idx, 1)
    }
  }
}
</script>

<style lang='scss'>
  .addstrategy {
    margin-top: 30px;
    &_form {
      &_facility {
        display: flex;
        &-box {
          display: flex;
          flex-wrap: wrap;
          border: 1px solid #DCDFE6;
          min-height: 72px;
          width: 100%;
          &-select {
            height: 36px;
            background: #ECF5FF;
            width: fit-content;
            padding: 0 10px;
            color: #40A9FF;
            margin: 5px;
            p {

            }
            span {
              color: #40A9FF;
              display: inline-block;
              /* margin-left: 10px; */
              cursor: pointer;
            }
          }
        }
      }
      &_time {
          width: 60%;
          background-color: #F2F2F2;
        &-box {
          display: flex;
          align-items: center;
          padding: 0 20px;
          margin-top: 20px;
          &-zhou {
            display: inline-block;
            margin-right: 20px;
          }
          &-shi {
            display: inline-block;
            margin-left: 20px;
          }
        }
      }
    }
  }
  .grouping_table_header {
    display: flex;
    margin-bottom: 20px;
	&_select {
		margin-right: 5px;
	}
  }
</style>
