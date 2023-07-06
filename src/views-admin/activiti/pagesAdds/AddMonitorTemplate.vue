<template>
  <div class="monitor-template">
    <div class="flex-h-center page-nav" @click="$router.back()">
      <i class="el-icon-back header-icon  pointer" />
      <div class="font-16 header-title">{{ title }}</div>
    </div>
    <div class="content">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="预置条件名称:" prop="name" :rules="[{required:true,trigger:'blur',message:'请输入'}]">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型:">
          <el-select v-model="form.hyActionClassId" placeholder="请选择">
            <el-option
              v-for="item in actionTypeList"
              :key="item.hyActionClassId"
              :label="item.hyActionClassName"
              :value="item.hyActionClassId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="监控时间:">
          <el-select v-model="form.hyTid" placeholder="请选择">
            <el-option
              v-for="item in hyitTimes"
              :key="item.hyTid"
              :label="item.hyTname"
              :value="item.hyTid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值模板:">
          <el-select v-model="form.actionCocietyTypeParent" placeholder="请选择">
            <el-option
              v-for="item in actionCocietyTypeParentList"
              :key="item.hyActionClassId"
              :label="item.hyActionClassName"
              :value="item.hyActionClassId"
            />
          </el-select>
          <div class="table-box mt-10">
            <el-table ref="table" :data="tableData" style="width: 60%" :header-cell-style="{height:'20px',padding:0}" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" />
              <el-table-column prop="level" label="级别" class="table" show-overflow-tooltip>
                <template v-slot="{row}">
                  {{ $tool.matchData(levelList,row,'level','hyLevelName','hyLevel') }}
                </template>
              </el-table-column>
              <el-table-column
                prop="alarmName"
                label="阈值条件名称"
                show-overflow-tooltip
              />
              <el-table-column
                prop="address"
                label="条件"
              >
                <template v-slot="{row}">
                  <span class="mr-6">{{ $tool.formatStr(row.condType,'-1:&lt;小于,0:=等于,1:&gt;大于') }}</span>
                  <span class="mr-6">{{ row.alarmValue }}</span>
                  <span>{{ row.unit }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <el-form-item label="备注:">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
        <el-form-item label="状态:" prop="status" style="width: 60%">
          <el-switch :value="!!form.status" active-color="#0145ab" inactive-color="#f5f5f5" @change="changeStatus" />
        </el-form-item>
        <el-form-item label="状态:" prop="hyStatus" style="width: 60%">
          <el-button type="primary" :loading="subloading" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'AddMonitorTemplate',
  data() {
    return {
      form: { status: 1 },
      actionClassList: [],
      subloading: false,
      hyitTimes: [],
      actionTypeList: [],
      actionCocietyTypeParent: '',
      tableData: [],
      levelList: [],
      multipleSelection: [],
      initialSelection: [
        {
          'conditionId': 5,
          'name': 'sdf',
          'alarmName': 'sdf',
          'hyActionClassId': 10,
          'level': 5,
          'alarmValue': 12313,
          'condType': -1,
          'ctime': null,
          'remark': 'sdfsf',
          'unit': '%',
          'status': null,
          'pid': null,
          'userId': null,
          'appId': null,
          'companyId': null
        }
      ],
      editList: { }
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    monitorId() {
      return this.$route.query.monitorId
    },
    actionCocietyTypeParentList() {
      return this.actionClassList.filter(it => it['pid'] === this.form.hyActionClassId)
    }
  },
  async created() {
    await this.findLinkageActionClass()
    await this.findHyitTime()
    await this.findLinkageThresholdCondition()
    await this.hyitAlarmLevel()
    if (this.monitorId) {
      await this.getLinkageMonitorTemplate()
      await this.findLinkageThresholdMonitorMap()
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.editList = this.$tool.tableAddDeleteList(this.initialSelection, val, 'conditionId')
    },
    async hyitAlarmLevel() {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLevel, data: {}})
      if (code !== 1) return
      this.levelList = data
      return data
    },
    async findHyitTime() { // 时间模板
      let { data, code } = await request({
        url: api.video.findHyitTime,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitTimes = data
    },
    async findLinkageThresholdCondition() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageThresholdCondition,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.tableData = data
    },
    changeStatus(e) {
      this.form.status = +e
    },
    async findLinkageActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageActionClass
      })
      if (code !== 1) return
      this.actionTypeList = data.filter(it => it['pid'] === null)
      this.form.hyActionClassId = this.actionTypeList[1]['hyActionClassId']
      this.actionClassList = data
    },
    async getLinkageMonitorTemplate() {
      let { model, code } = await request({
        url: api.linkageManage.getLinkageMonitorTemplate,
        data: { monitorId: this.monitorId }
      })
      if (code !== 1) return
      this.form = model
    },
    async findLinkageThresholdMonitorMap() {
      let { data, code } = await request({ url: api.linkageManage.findLinkageThresholdMonitorMap, data: { }})
      if (code !== 1) return
      for (const it of data) {
        for (const itElement of this.tableData) {
          if (it['monitorId'] === itElement['monitorId']) {
            this.$refs.table.toggleRowSelection(itElement)
          } else {
            this.$refs.table.toggleRowSelection()
          }
        }
      }
    },

    handleSubmit() {
      this.$refs['form'].validate(async(val) => {
        if (!val) return
        this.subloading = true
        let { code } = await request({
          url: api.linkageManage[this.monitorId ? 'updateLinkageMonitorTemplate' : 'insertLinkageMonitorTemplate'],
          data: this.form
        })
        if (code === 1) {
          this.$message.success(this.monitorId ? '修改成功' : '添加成功')
          // const monitorId = model.monitorId
          for (let i = 0; i < this.multipleSelection[i]; i++) {
            await request({
              url: api.linkageManage['insertLinkageThresholdMonitorMap'],
              data: { conditionId: this.multipleSelection[i]['conditionId'], monitorId: this.monitorId || 2, hyActionClassId: this.form.hyActionClassId }
            })
          }

          this.$router.back()
          return
        }
        this.subloading = false
        this.$message.error(this.monitorId ? '修改失败' : '添加失败')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.monitor-template{
  .header{
    height: 40px;
    background-color: #fff;
    .header-icon{
      font-size: 20px;
    }
    .header-title{
      color: #999;
    }
  }
  .content{
    padding: 20px 20px 100px 20px;
    margin: 30px 20px 20px;
    background-color: #fff;
  }
  .table-box{
    max-height: 400px;
    overflow: hidden;
    overflow-y: auto;
  }
}
::v-deep .content{
  .el-table__header{
    height: 20px;
  }
}
</style>
