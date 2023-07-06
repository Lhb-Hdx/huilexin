<template>
  <div>
    <el-dialog
      title="报警规则"
      :visible.sync="alarmShow"
      width="70%"
    >
      <el-button type="primary" size="mini" class="mb-10" @click="openShowAttributeList">新建报警规则</el-button>

      <el-table :data="deviceValueAlarmRule" fit highlight-current-row style="width: 100%;">
        <el-table-column label="NO" prop="id" type="index" show-overflow-tooltip />
        <el-table-column label="报警描述" prop="hyDes" show-overflow-tooltip />
        <el-table-column label="报警级别" prop="hyLevel" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setAlarmLevelName(item.row.hyLevel) }}
          </template>
        </el-table-column>
        <el-table-column label="条件" prop="hyCondType" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setCondName(item.row.hyCondType) }}
          </template>
        </el-table-column>
        <el-table-column label="报警值" prop="hyAlarmValue" show-overflow-tooltip />
        <el-table-column label="关联事件" prop="hyEventId" show-overflow-tooltip>
          <template slot-scope="item">
            {{ setEventName(item.row.hyEventId) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="当前值" prop="valueType" show-overflow-tooltip /> -->
        <el-table-column label="状态" prop="hyState" show-overflow-tooltip>
          <template slot-scope="item">
            <div :class="item.row.hyState === 1 ? 'success' : 'danger'">
              <i :class="item.row.hyState === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.hyState === 1 ? '正常' : '异常' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{row}">
            <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="新增报警规则" :visible.sync="showAttributeList" width="50%" top="5vh" append-to-body>
        <div class="equipment_table">
          <el-form ref="form" label-width="80px" :model="alarmRuleForm" :rules="alarmRuleFormRules" class="select-width-fill">
            <el-form-item label="事件类型" prop="hyEventId" :rules="[{required:true,trigger:'change',message:'请选择'}]">
              <el-select
                v-model="alarmRuleForm.hyEventId"
                filterable
                placeholder="请选事件类型"
              >
                <el-option
                  v-for="item in eventList"
                  :key="item.hyEventId"
                  :label="item.hyEventName"
                  :value="item.hyEventId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="报警级别" prop="hyLevel" :rules="[{required:true,trigger:'change',message:'请选择'}]">
              <el-select
                v-model="alarmRuleForm.hyLevel"
                filterable
                placeholder="请选事件类型"
              >
                <el-option
                  v-for="item in alarmLevelList"
                  :key="item.hyLevel"
                  :label="item.hyLevelName"
                  :value="item.hyLevel"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="报警条件" prop="hyCondType" :rules="[{required:true,trigger:'change',message:'请选择'}]">
              <el-select
                v-model="alarmRuleForm.hyCondType"
                filterable
                placeholder="请选报警条件"
              >
                <el-option
                  v-for="item in condTypeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="报警值" prop="hyAlarmValue" :rules="[{required:true,trigger:'blur',message:'请填写'}]">
              <el-input-number v-model="alarmRuleForm.hyAlarmValue" :min="0" :step="0.1" :controls="true" controls-position="both" />
            </el-form-item>
            <el-form-item label="报警描述" prop="hyDes" :rules="[{required:true,trigger:'blur',message:'请填写'}]">
              <el-input v-model="alarmRuleForm.hyDes" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showAttributeList = false">取 消</el-button>
          <el-button class="filter-item" type="primary" @click="comfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-dialog>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'Alarmrule',
  data() {
    return {
      showAttributeList: false,
      alarmShow: false,
      deviceValueAlarmRule: [],
      alarmRuleForm: {
        hyEventId: '',
        hyLevel: '',
        hyCondType: '',
        hyAlarmValue: 0,
        hyDes: '',
        hyState: 1
      },
      alarmRuleFormRules: {
        eventType: [
          { required: true, message: '请选择事件类型', trigger: 'blur' }
        ],
        alarmLevel: [
          { required: true, message: '请选择报警级别', trigger: 'blur' }
        ],
        alarmConditions: [
          { required: true, message: '请输入报警条件', trigger: 'blur' }
        ],
        alarmValue: [
          { required: true, message: '请输入报警值', trigger: 'blur' }
        ],
        alarmDescribe: [
          { required: true, message: '请输入描述', trigger: 'blur' }
        ]
      },
      eventList: [],
      alarmLevelList: [],
      condTypeList: [
        {
          id: -1,
          name: '小于'
        },
        {
          id: 0,
          name: '等于'
        },
        {
          id: 1,
          name: '大于'
        }
      ],
      hyVid: ''
    }
  },
  computed: {
    setAlarmLevelName() {
      return function(hyLevel) {
        const idx = this.alarmLevelList.findIndex(item => item.hyLevel === hyLevel)
        if (idx !== -1) {
          return this.alarmLevelList[idx].hyLevelName
        }
      }
    },
    setEventName() {
      return function(hyEventId) {
        const idx = this.eventList.findIndex(item => item.hyEventId === hyEventId)
        if (idx !== -1) {
          return this.eventList[idx].hyEventName
        }
      }
    },
    setCondName() {
      return function(hyCondType) {
        const idx = this.condTypeList.findIndex(item => item.id === hyCondType)
        if (idx !== -1) {
          return this.condTypeList[idx].name
        }
      }
    }
  },
  created() {
  },
  methods: {
    openShowAttributeList() {
      this.showAttributeList = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },
    open(hyVid) {
      this.alarmShow = true
      this.hyVid = hyVid
      this.findHyitDeviceValueAlarmRule(hyVid)
      this.findHyitEvent()
      this.findHyitAlarmLevel()
    },
    comfirm() {
      this.$refs.form.validate(val => {
        if (!val) return
        request({
          url: api.powerEnv.insertHyitDeviceValueAlarmRule,
          data: { ...this.alarmRuleForm, hyVid: this.hyVid }
        }).then(res => {
          if (res.code === 1) {
            this.showAttributeList = false
            this.findHyitDeviceValueAlarmRule(this.hyVid)
          }
        })
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.powerEnv.deleteHyitDeviceValueAlarmRule,
          data: { hyId: row.hyId }
        }).then(res => {
          if (res.code === 1) {
            this.findHyitDeviceValueAlarmRule(this.hyVid)
          }
        })
      })
    },
    findHyitEvent() {
      request({
        url: api.powerEnv.findHyitEvent,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.eventList = res.data
        }
      })
    },
    findHyitAlarmLevel() {
      request({
        url: api.powerEnv.findHyitAlarmLevel,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.alarmLevelList = res.data
        }
      })
    },
    findHyitDeviceValueAlarmRule(hyVid) {
      request({
        url: api.powerEnv.findHyitDeviceValueAlarmRule,
        data: { hyVid }
      }).then(res => {
        if (res.code === 1) {
          this.deviceValueAlarmRule = res.data
        }
      })
    }
  }
}
</script>

<style>

</style>
