<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="findDbBackupQuery.keyword" placeholder="关键字" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-select
        v-model="findDbBackupQuery.agent"
        class="filter-item"
        filterable
        clearable
        placeholder="网关"
      >
        <el-option
          v-for="item in agentList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select v-model="findDbBackupQuery.statue" placeholder="选择状态" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in dbBackupQueryStatue" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="dbBackup"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" align="left" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="备份类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setBackupType(row.backupType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="执行类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setType(row.type) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="IP" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="端口" prop="port" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="定时类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setExecuteTimeType(row.executeTimeType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="right" label="时间">
          <!-- <template v-if="scope.row.executeTimeType === 2" slot-scope="scope"> -->
          <template slot-scope="scope">
            {{ setHMS(scope.row.executeHour, scope.row.executeMinute, scope.row.executeSecond) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="上线状态" prop="statue">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.statue"
              :active-value="1"
              :inactive-value="0"
              @change="changeScriptStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="left" label="操作" class-name="small-padding fixed-width" fixed="right" width="250">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="onDelete(row)">删除</el-button>
            <el-button type="primary" size="mini" @click="oncopy(row)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="findDbBackupTotal > 0" :auto-scroll="false" :total="findDbBackupTotal" :page.sync="findDbBackupQuery.page" :limit.sync="findDbBackupQuery.limit" @pagination="findDbBackup" />
      <!-- 复制设备 -->
      <el-dialog title="复制" :visible.sync="showDialog" width="40%" top="5vh">
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item label="网关" label-width="80px" prop="agent">
            <el-select
              v-model="form.agent"
              placeholder="请选择网关"
              style="width: 100%;"
              clearable
            >
              <el-option
                v-for="item in agentList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="名称" label-width="80px" prop="name">
            <el-input v-model="form.name" placeholder="请输入名称" />
          </el-form-item>
          <el-form-item label="IP" label-width="80px" prop="ip">
            <el-input v-model.trim="form.ip" placeholder="请输入IP" />
          </el-form-item>
          <el-form-item label="端口" label-width="80px" prop="port">
            <el-input v-model.trim="form.port" type="number" placeholder="请输入端口" />
          </el-form-item>
          <el-form-item label="用户名" label-width="80px" prop="userName">
            <el-input v-model.trim="form.userName" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" label-width="80px" prop="pwd">
            <el-input v-model.trim="form.pwd" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="备份类型" label-width="80px" prop="backupType">
            <el-select
              v-model="form.backupType"
              placeholder="请选择备份类型"
              style="width: 100%;"
            >
              <el-option
                v-for="item in backupType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="执行类型" label-width="80px" prop="type">
            <el-select
              v-model="form.type"
              placeholder="请选择执行类型"
              style="width: 100%;"
            >
              <el-option
                v-for="item in type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.type === 2" label="执行时间" label-width="80px" prop="executeDate">
            <el-cascader
              v-model="form.executeDate"
              :options="runTimeOptions"
              @change="handleChangeDate"
            />
            <el-time-picker
              v-model="form.executeTime"
              :value="form.executeTime"
              placeholder="任意时间点"
              @change="handleChangeTime"
            />
          </el-form-item>
          <el-form-item label="数据库名" label-width="80px" prop="dbName">
            <el-input v-model.trim="form.dbName" placeholder="请输入数据库名" />
          </el-form-item>
          <el-form-item label="表名" label-width="80px" prop="tableName">
            <el-input v-model.trim="form.tableName" placeholder="请输入表名" />
          </el-form-item>
          <el-form-item label="保留天数" label-width="80px" prop="keepDays">
            <el-input v-model.trim="form.keepDays" type="number" placeholder="请输入保留天数" />
          </el-form-item>
          <el-form-item label="状态" label-width="80px" prop="statue">
            <el-select
              v-model="form.statue"
              placeholder="请选择状态"
              style="width: 100%;"
            >
              <el-option
                v-for="item in statue"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showDialog = false">取 消</el-button>
          <el-button class="filter-item" type="primary" @click="onSubmit">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'DatabaseBackupList',
  components: { Pagination, ListControl },
  data() {
    return {
      dbBackup: [],
      listLoading: false,
      showDialog: false,
      findDbBackupQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        agent: '',
        statue: ''
      },
      executeDate: '', // 执行日期内容
      executeTime: [], // 执行时间内容
      form: {
        name: '',
        ip: '',
        port: '',
        userName: '',
        pwd: '',
        backupType: '',
        type: '',
        executeTimeType: '',
        executeTime: '',
        executeDay: '',
        executeHour: '',
        executeMinute: '',
        executeSecond: '',
        dbName: '',
        tableName: '',
        agent: '',
        keepDays: '',
        statue: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入名称' }
        ],
        dbName: [
          { required: true, message: '请输入数据库名称' }
        ],
        ip: [
          { required: true, message: '请输入IP' }
        ],
        port: [
          { required: true, message: '请输入端口' }
        ],
        userName: [
          { required: true, message: '请输入用户名' }
        ],
        pwd: [
          { required: true, message: '请输入密码' }
        ],
        tableName: [
          { required: true, message: '请输入表名' }
        ],
        type: [
          { required: true, message: '请选择执行类型' }
        ],
        backupType: [
          { required: true, message: '请选择备份类型' }
        ],
        statue: [
          { required: true, message: '请选择状态' }
        ]
      },
      runTimeOptions: [ // 执行日期联动选择
        {
          value: 1,
          executeTimeType: 1,
          label: '每日'
        },
        {
          value: 2,
          executeTimeType: 2,
          label: '每周',
          children: [
            {
              value: 1,
              executeDay: 1,
              label: '星期一'
            },
            {
              value: 2,
              executeDay: 2,
              label: '星期二'
            },
            {
              value: 3,
              executeDay: 3,
              label: '星期三'
            },
            {
              value: 4,
              executeDay: 4,
              label: '星期四'
            },
            {
              value: 5,
              executeDay: 5,
              label: '星期五'
            },
            {
              value: 6,
              executeDay: 6,
              label: '星期六'
            },
            {
              value: 7,
              executeDay: 0,
              label: '星期天'
            }
          ]
        },
        {
          value: 3,
          executeTimeType: 3,
          label: '每月',
          children: [

          ]
        }
      ],
      dbBackupQueryStatue: [
        { value: 1, label: '启用' },
        { value: 2, label: '禁用' }
      ],
      findDbBackupTotal: 0,
      agentList: [],
      backupType: [
        { value: 1, label: '数据库备份' },
        { value: 2, label: '数据表备份' },
        { value: 3, label: '数据库分表' },
        { value: 4, label: '按保留天数清除数据' },
        { value: 5, label: '数据表分区' }

      ],
      type: [
        { value: 1, label: '手动备份' },
        { value: 2, label: '定时备份' }
      ],
      executeTimeType: [
        { value: 1, label: '每天' },
        { value: 2, label: '每周' },
        { value: 3, label: '每月' }
      ],
      statue: [
        { value: 1, label: '启用' },
        { value: 2, label: '禁用' }
      ],
      // 显示控制数据 start
      checkList: ['备份类型', '执行类型', '名称', 'IP', '端口', '定时类型', '时间', '上线状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setBackupType() {
      return function(backupType) {
        const idx = this.backupType.findIndex(item => item.value === backupType)
        return idx !== -1 ? this.backupType[idx].label : ''
      }
    },
    setType() {
      return function(type) {
        const idx = this.type.findIndex(item => item.value === type)
        return idx !== -1 ? this.type[idx].label : ''
      }
    },
    setExecuteTimeType() {
      return function(executeTimeType) {
        const idx = this.executeTimeType.findIndex(item => item.value === executeTimeType)
        return idx !== -1 ? this.executeTimeType[idx].label : ''
      }
    },
    setHMS() { // 设置时分秒
      return function(h, m, s) {
        console.log(`${h > 9 ? h : '0' + h}:${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}`)
        return `${h > 9 ? h : '0' + h}:${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}`
      }
    },
    setCycle() { // 设置周期
      return function(executeTimeType, executeDay) {
        let cycle = ''
        if (Number(executeTimeType) === 1) {
          cycle = '每日'
        } else if (Number(executeTimeType) === 2) {
          cycle = '每周'
          switch (Number(executeDay)) {
            case 0:
              cycle += '日'
              break
            case 1:
              cycle += '一'
              break
            case 2:
              cycle += '二'
              break
            case 3:
              cycle += '三'
              break
            case 4:
              cycle += '四'
              break
            case 5:
              cycle += '五'
              break
            default:
              cycle += '六'
          }
        } else if (executeTimeType === 3) {
          cycle = `每月${executeDay}号`
        }
        return cycle
      }
    }
  },
  mounted() {
    this.findDbBackup()
    this.findHyitAgent()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 新增
    handleCreate() {
      this.$router.push({
        name: 'CreateDatabaseBackup'
      })
    },
    // 搜索
    handleFilter() {
      this.findDbBackup()
    },
    // 查询数据库备份
    findDbBackup() {
      request({
        url: api.dbBackup.findDbBackup,
        data: this.findDbBackupQuery
      }).then(res => {
        if (res.code === 1) {
          this.dbBackup = res.data
          this.findDbBackupTotal = Number(res.count)
        }
      })
    },
    // 选择日期
    handleChangeDate(val) {
      this.$set(this.form, 'executeDate', val)
      this.$set(this.form, 'executeTimeType', val[0])
      this.$set(this.form, 'executeDay', val[1])
    },
    // 选择时间
    handleChangeTime(val) {
      const DateObj = new Date(val)
      this.$set(this.form, 'executeTime', val)
      this.$set(this.form, 'executeHour', DateObj.getHours())
      this.$set(this.form, 'executeMinute', DateObj.getMinutes())
      this.$set(this.form, 'executeSecond', DateObj.getSeconds())
    },
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
        }
      })
    },
    // 提交
    onSubmit() {
      this.$set(this.rules, 'executeDate', [{ required: true, message: '请选择执行日期' }])
      this.$set(this.rules, 'executeTime', [{ required: true, message: '请选择执行时间' }])
      const formParam = { ...this.form }
      delete formParam.executeTime // 接口不需要的参数
      delete formParam.executeDate // 接口不需要的参数
      this.confirmLoading = true
      this.$refs['form'].validate(valid => {
        if (valid) {
          request({
            url: api.dbBackup.insertDbBackup,
            data: formParam
          }).then(res => {
            this.confirmLoading = false
            this.findDbBackup()
            this.findHyitAgent()
            if (res.code === 1) {
              if (formParam.agent !== '') this.DbTaskChange({ agent: formParam.agent })
              this.showDialog = false
              this.$message({
                type: 'success',
                message: res.msg
              })
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
    // 编辑
    onEdit(val) {
      this.$router.push({
        name: 'UpdateDatabaseBackup',
        query: {
          id: val.id
        }
      })
    },
    // 删除
    onDelete(val) {
      this.$confirm('是否删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.dbBackup.deleteDbBackup,
          data: { id: val.id }
        })
          .then(res => {
            if (res.code === 1) {
              this.findDbBackup()
              if (val.agent !== '' && val.agent !== null) {
                this.changeScriptStatus({
                  agent: val.agent
                })
              }
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      })
    },
    oncopy(row) {
      this.showDialog = true
      Object.keys(this.form).forEach(key => {
        this.form[key] = row[key]
      })
      if (row['executeTimeType'] === 1) {
        row['executeDate'] = row['executeTimeType']
      } else if (row['executeTimeType'] === 2) {
        row['executeDate'] = [row['executeTimeType'], row['executeDay']]
      } else if (row['executeTimeType'] === 3) {
        row['executeDate'] = [row['executeTimeType'], row['executeDay']]
      }
      const executeHour = row['executeHour'] >= 10 ? row['executeHour'] : `0${row['executeHour']}`
      const executeMinute = row['executeMinute'] >= 10 ? row['executeMinute'] : `0${row['executeMinute']}`
      const executeSecond = row['executeSecond'] >= 10 ? row['executeSecond'] : `0${row['executeSecond']}`
      const NowDate = new Date()
      row['executeTime'] = new Date(`${NowDate.getFullYear()}-${NowDate.getMonth()}-${NowDate.getDate()} ${executeHour}:${executeMinute}:${executeSecond}`)
      delete row.id
      delete row.appId
      delete row.companyId
      this.form = row
    },
    changeScriptStatus(data) {
      request({ url: api.dbBackup.updateDbBackup, data: { id: data.id, statue: data.statue }}).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: data.statue === 1 ? '启用成功!' : '禁用成功!'
          })
        } else {
          this.$message({
            type: 'error',
            message: '请求失败!'
          })
        }
      })
    },
    // 通知网关
    DbTaskChange(query) {
      request({
        url: api.dbBackup.DbTaskChange,
        data: query
      })
    }
  }
}
</script>

<style scoped>

</style>
