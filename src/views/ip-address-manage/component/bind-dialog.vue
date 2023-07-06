<template>
  <div class="bind-dialog">
    <el-dialog v-set-dialog-main-height="dialogHeight" class="dialog-body-scroll dialog-not-footer" title="关联设备" :visible.sync="showBindDeviceDialog" width="60%" top="5vh" append-to-body style="height: 80%">
      <div class="dialog-body">
        <div class="bind-header">
          <div class="bind-header-item">
            <div class="header-item-title">使用状态</div>
            <div class="header-item-main">
              <el-select
                v-model="form.useStatue"
                placeholder="请选择使用状态"
                style="width: 200px"
              >
                <el-option
                  v-for="item in useStatue"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div v-if="form.useStatue === 1 || form.useStatue === 2" class="bind-header-item margin-left-15">
            <div class="header-item-title margin-left-7-5">选择关联设备</div>
            <div class="header-item-main">
              <el-select
                v-model="form.deviceModelType"
                class="margin-left-7-5"
                placeholder="请选择关联设备"
                style="width: 200px"
                @change="changeBindTypeNum"
              >
                <el-option
                  v-for="item in bindDeviceType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-if="form.deviceModelType === 1"
                v-model="form.deviceType"
                class="margin-left-7-5"
                placeholder="请选择设备类型"
                style="width: 200px"
                @change="findHyitHost"
              >
                <el-option
                  v-for="item in itDeviceType"
                  :key="item.id"
                  :label="item.dictdataName"
                  :value="item.id"
                />
              </el-select>
              <el-select
                v-if="form.deviceModelType === 2"
                v-model="form.deviceType"
                class="margin-left-7-5"
                placeholder="请选择设备类型"
                style="width: 200px"
                @change="findHyitHost"
              >
                <el-option
                  v-for="item in opsDeviceType"
                  :key="item.id"
                  :label="item.dictdataName"
                  :value="item.id"
                />
              </el-select>
              <el-select
                v-if="form.deviceModelType === 4"
                v-model="form.deviceType"
                class="margin-left-7-5"
                placeholder="请选择设备类型"
                style="width: 200px"
                @change="findVideoDvr"
              >
                <el-option
                  v-for="item in videoType"
                  :key="item.id"
                  :label="item.dictdataName"
                  :value="item.id"
                />
              </el-select>
            </div>
          </div>
          <div v-if="form.useStatue === 3" class="bind-header-item margin-left-15">
            <div class="header-item-title margin-left-7-5">选择关联设备</div>
            <div class="header-item-main">
              <el-select
                v-model="form.deviceModelType"
                disabled
                class="margin-left-7-5"
                placeholder="请选择关联设备"
                style="width: 200px"
                @change="changeBindTypeNum"
              >
                <el-option
                  v-for="item in bindDeviceType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </div>
        <div v-if="form.useStatue === 1 || form.useStatue === 2" class="bind-header margin-top-15">
          <!-- 选择其他设备，并且是可用状态 -->
          <div v-if="form.deviceModelType === 0" class="bind-header-item margin-right-22">
            <div class="header-item-title">设备名称</div>
            <div class="header-item-main">
              <el-input v-model="form.deviceName" style="width: 200px" placeholder="请输入设备名称" />
            </div>
          </div>
          <div class="bind-header-item margin-right-15">
            <div class="header-item-title">端口</div>
            <div class="header-item-main">
              <el-select
                v-model="form.port"
                placeholder="请选择使用状态"
                style="width: 200px"
              >
                <el-option
                  v-for="item in port"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="bind-header-item">
            <div class="header-item-title margin-left-7-5">MAC</div>
            <div class="header-item-main margin-left-7-5">
              <el-input v-model="form.mac" style="width: 200px" placeholder="请输入MAC" />
            </div>
          </div>
        </div>
        <div v-if="form.useStatue === 3" class="bind-header margin-top-15">
          <div class="bind-header-item margin-right-15">
            <div class="header-item-title">端口</div>
            <div class="header-item-main">
              <el-select
                v-model="form.port"
                disabled
                placeholder="请选择使用状态"
                style="width: 200px"
              >
                <el-option
                  v-for="item in port"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="bind-header-item">
            <div class="header-item-title margin-left-7-5">MAC</div>
            <div class="header-item-main margin-left-7-5">
              <el-input v-model="form.mac" :disabled="true" style="width: 200px" placeholder="请输入MAC" />
            </div>
          </div>
        </div>
        <div v-if="form.useStatue === 1 || form.useStatue === 2" class="bind-header margin-top-15">
          <div class="bind-header-item" style="width: 67%">
            <div class="header-item-title">备注</div>
            <div class="header-item-main">
              <el-input v-model="form.backup" type="textarea" placeholder="请输入备注" />
            </div>
          </div>
        </div>
        <!-- 设备列表 -->
        <div v-if="form.useStatue === 1 || form.useStatue === 2" class="bind-body margin-top-15">
          <!-- it设备列表 -->
          <div v-if="form.deviceModelType === 1" class="table-wrapper">
            <div class="search">
              <el-input v-model="itDeviceTypeQuery.keyword" placeholder="请输入设备名称" style="width: 200px;margin-right:10px" class="filter-item" clearable />
              <el-button class="filter-item" type="primary" icon="el-icon-search" @click="findHyitHost">查询</el-button>
            </div>

            <el-table
              v-loading="loading"
              :data="itDeviceTable"
              style="width: 100%"
            >
              <el-table-column
                prop="hyMarkName"
                label="设备名称"
                width="350"
                show-overflow-tooltip
              />
              <el-table-column
                prop="hyIp"
                label="设备IP"
                show-overflow-tooltip
              />
              <el-table-column label="操作" width="100">
                <template slot-scope="{row}">
                  <el-button type="text" size="mini" @click="handleBindDevice(row, 'hyHostId')">
                    {{ row.hyHostId === form.deviceId ? '取消关联' : '关联' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="itDeviceTotal > 0" :auto-scroll="false" :total="itDeviceTotal" :page.sync="itDeviceTypeQuery.page" :limit.sync="itDeviceTypeQuery.limit" @pagination="findHyitHost" />
          </div>
          <!-- 运维设备列表 -->
          <div v-if="form.deviceModelType === 2" class="table-wrapper">
            <el-table
              v-loading="loading"
              :data="opsTable"
              style="width: 100%"
            >
              <el-table-column
                prop="serverName"
                label="设备名称"
                width="350"
                show-overflow-tooltip
              />
              <el-table-column
                prop="ip"
                label="设备IP"
                show-overflow-tooltip
              />
              <el-table-column label="操作" width="100">
                <template slot-scope="{row}">
                  <el-button type="text" size="mini" @click="handleBindDevice(row, 'id')">关联</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="opsTotal > 0" :auto-scroll="false" :total="opsTotal" :page.sync="opsTypeQuery.page" :limit.sync="opsTypeQuery.limit" @pagination="findHyitOpsServer" />
          </div>
          <!-- 动环设备列表 -->
          <div v-if="form.deviceModelType === 3" class="table-wrapper">
            <el-table
              v-loading="loading"
              :data="ringTable"
              style="width: 100%"
            >
              <el-table-column
                prop="hyHostName"
                label="设备名称"
                width="350"
                show-overflow-tooltip
              />
              <el-table-column
                prop="hyIp"
                label="设备IP"
                show-overflow-tooltip
              />
              <el-table-column label="操作" width="100">
                <template slot-scope="{row}">
                  <el-button type="text" size="mini" @click="handleBindDevice(row, 'hyHostId')">关联</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="ringTotal > 0" :auto-scroll="false" :total="ringTotal" :page.sync="ringTypeQuery.page" :limit.sync="ringTypeQuery.limit" @pagination="findRing" />
          </div>
          <!-- 视频设备列表 -->
          <div v-if="form.deviceModelType === 4" class="table-wrapper">
            <el-table
              v-loading="loading"
              :data="videoTable"
              style="width: 100%"
            >
              <el-table-column
                prop="title"
                label="设备名称"
                width="350"
                show-overflow-tooltip
              />
              <el-table-column
                prop="ip"
                label="设备IP"
                show-overflow-tooltip
              />
              <el-table-column label="操作" width="100">
                <template slot-scope="{row}">
                  <el-button type="text" size="mini" @click="handleBindDevice(row, 'dvrId')">关联</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="videoTotal > 0" :auto-scroll="false" :total="videoTotal" :page.sync="videoTypeQuery.page" :limit.sync="videoTypeQuery.limit" @pagination="findVideoDvr" />
          </div>
        </div>
        <div slot="footer" class="dialog-footer text-right mt-10">
          <el-button class="filter-item" type="primary" @click="saveBind">确 定</el-button>
        </div>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'BindDialog',
  components: {
    Pagination
  },
  props: {
    selectIp: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      agentGroupId: '',
      showBindDeviceDialog: false,
      bindDeviceType: [
        { value: 1, label: 'IT设备' },
        { value: 2, label: '运维设备' },
        { value: 3, label: '动环设备' },
        { value: 4, label: '视频设备' },
        { value: 0, label: '其他设备' }
      ],
      form: {
        id: '',
        agent: '',
        ipAddressId: '',
        useStatue: 1, // 使用状态
        deviceModelType: 1, // 关联设备类型
        deviceName: '', // 设备名称
        mac: '', // mac地址
        port: '', // 端口
        deviceId: '', // 设备id
        backup: '', // 备注
        deviceType: '' // 设备类型id
      },
      useStatue: [
        { value: 2, label: '可用' },
        { value: 1, label: '启用' },
        { value: 3, label: '禁用' }
      ],
      rules: {},
      itDeviceType: [],
      itDeviceTypeQuery: {
        hostType: 1,
        page: 1,
        limit: 10,
        keyword: ''
      },
      videoType: [],
      videoTypeQuery: {
        page: 1,
        limit: 10
      },
      ringTypeQuery: {
        hostType: 1,
        hyDevTypeId: 2,
        page: 1,
        limit: 10
      },
      loading: false,
      itDeviceTable: [],
      itDeviceTotal: 0,
      videoTable: [],
      videoTotal: 0,
      ringTable: [],
      ringTotal: 0,
      port: [
        { value: '管理端口', label: '管理端口' },
        { value: '业务端口', label: '业务端口' }
      ],
      dialogHeight: '80%',
      opsDeviceType: [],
      opsTypeQuery: {
        page: 1,
        limit: 10
      },
      opsTable: [],
      opsTotal: 0,
      loginUser: {}
    }
  },
  watch: {
    selectIp: {
      handler() {
        Object.keys(this.form).forEach(key => {
          this.$set(this.form, `${key}`, this.selectIp[`${key}`])
          if (key === 'deviceType' && this.selectIp[`${key}`] === 0) this.$set(this.form, `${key}`, '')
          if (key === 'deviceId' && this.selectIp[`${key}`] === 0) this.$set(this.form, `${key}`, '')
          if (key === 'useStatue' && this.selectIp[`${key}`] === 2) this.$set(this.form, `${key}`, 1)
        })
        this.changeBindType()
      },
      deep: true
    }
  },
  mounted() {
    console.log(this.form.deviceId)
    console.log(this.selectIp)
    this.getDeviceType()
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    this.loginUser = this.localStorageOperation('get', 'userInfo')
  },
  methods: {
    // 打开弹窗
    open() {
      this.showBindDeviceDialog = true
    },
    // 获取设备类型
    getDeviceType() {
      // 获取运维设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.opsDeviceType = res.data
      })
      // 获取运维设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'ops_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.opsDeviceType = res.data
      })
      // 获取it监控设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.itDeviceType = res.data
      })
      // 获取视频监控设备
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) this.videoType = res.data
      })
    },
    // 获取it设备
    findHyitHost() {
      console.log('findHyitHost', this.form.deviceType)
      request({
        url: api.itMonitor.findHyitHost,
        data: {
          ...this.itDeviceTypeQuery,
          devType: this.form.deviceType,
          agents: this.sessionStorageOperation('get', 'agentId')
        }
      }).then(res => {
        if (res.code === 1) {
          this.itDeviceTable = res.data
          this.itDeviceTotal = Number(res.count)
        }
      })
    },
    // 获取视频设备
    findVideoDvr() {
      request({
        url: api.video.findVideoDvr,
        data: {
          ...this.videoTypeQuery,
          devTypeId: this.form.deviceType
        }
      }).then(res => {
        if (res.code === 1) {
          this.videoTable = res.data
          this.videoTotal = Number(res.count)
        }
      })
    },
    // 获取动环设备
    findRing() {
      request({
        url: api.powerEnv.findHyitHost,
        data: this.ringTypeQuery
      }).then(res => {
        if (res.code === 1) {
          this.ringTable = res.data
          this.ringTotal = Number(res.count)
        }
      })
    },
    findHyitOpsServer() {
      console.log('findHyitOpsServer', this.form.deviceType)
      request({
        url: api.automationOperations.findHyitOpsServer,
        data: this.opsTypeQuery
      }).then(res => {
        if (res.code === 1) {
          this.opsTable = res.data
          this.opsTotal = Number(res.count)
        }
      })
    },
    // 绑定it设备
    handleBindDevice(val, attr) {
      console.log('hahahaha', val.hyHostId === this.form.deviceId)
      this.$confirm('确定绑定/解绑该设备吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        if (val.hyHostId === this.form.deviceId) {
          this.$set(this.form, 'bindType', 0)
          this.$set(this.form, 'deviceId', 0)
          this.$set(this.form, 'deviceName', '')
          this.$set(this.form, 'deviceType', '')
          this.$set(this.form, 'useStatue', 1)
        } else {
          this.$set(this.form, 'bindType', 2)
          this.$set(this.form, 'deviceId', val[`${attr}`])
        }
        this.$set(this.form, 'id', this.selectIp.id)
        const res = await this.updateOpsIpAddressDetail(this.form)
        console.log(res)
        if (res === 1) {
          this.changeBindType()
          this.$emit('updateIpCallBack')
          this.$set(this.form, 'deviceName', val.hyMarkName)
          this.$set(this.form, 'deviceType', val.hyDevTypeId)
          this.insertOpsIpAddressLog({
            ipDetailId: this.form.id,
            deviceModelType: this.form.deviceModelType,
            ip: this.selectIp.ip,
            deviceType: this.form.deviceType,
            deviceName: this.form.deviceName,
            bindType: this.form.bindType,
            deviceId: this.form.deviceId,
            mac: this.form.mac,
            agentGroupId: this.agentGroupId,
            ipLog: `${this.loginUser.realName}修改了IP`
          })
        }
      })
    },
    // 选择绑定设备类型
    changeBindType() {
      if (this.form.deviceModelType === 1) this.findHyitHost()
      if (this.form.deviceModelType === 2) this.findHyitOpsServer()
      if (this.form.deviceModelType === 4) this.findVideoDvr()
      if (this.form.deviceModelType === 3) this.findRing()
    },
    // 切换设备类型
    changeBindTypeNum() {
      this.form.deviceType = ''
      if (this.form.deviceModelType === 1) this.findHyitHost()
      if (this.form.deviceModelType === 2) this.findHyitOpsServer()
      if (this.form.deviceModelType === 4) this.findVideoDvr()
      if (this.form.deviceModelType === 3) this.findRing()
    },
    // 保存绑定
    async saveBind() {
      // 已用
      if (this.form.useStatue === 1) {
        const data = { ...this.form }
        if (this.form.deviceModelType === 0) {
          data.deviceModelType = 0
          data.deviceType = 0
          data.deviceId = 0
        }
        data.bindType = 2
        const updateOpsIpAddressDetailResult = await this.updateOpsIpAddressDetail(data)
        if (updateOpsIpAddressDetailResult === 1) {
          this.showBindDeviceDialog = false
          this.$emit('updateIpCallBack')
          this.insertOpsIpAddressLog({
            ipDetailId: this.form.id,
            deviceModelType: data.deviceModelType,
            ip: this.selectIp.ip,
            deviceType: data.deviceType,
            deviceName: this.form.deviceName,
            bindType: data.bindType,
            deviceId: data.deviceId,
            mac: this.form.mac,
            agentGroupId: this.agentGroupId,
            ipLog: `${this.loginUser.realName}修改了IP`
          })
        }
      } else if (this.form.useStatue === 3) { // 禁用
        let data = { ...this.form }
        data.useStatue = this.form.useStatue
        data.id = this.selectIp.id
        data.agent = this.form.agent
        data.ipAddressId = this.form.ipAddressId
        data.bindType = 2
        const updateOpsIpAddressDetailResult = await this.updateOpsIpAddressDetail(data)
        if (updateOpsIpAddressDetailResult === 1) {
          this.showBindDeviceDialog = false
          this.$emit('updateIpCallBack')
          this.insertOpsIpAddressLog({
            ipDetailId: this.form.id,
            deviceModelType: data.deviceModelType,
            ip: this.selectIp.ip,
            deviceType: data.deviceType,
            deviceName: this.form.deviceName,
            bindType: data.bindType,
            deviceId: data.deviceId,
            mac: this.form.mac,
            agentGroupId: this.agentGroupId,
            ipLog: `${this.loginUser.realName}修改了IP`
          })
        }
      }
    },
    // 编辑ip
    async updateOpsIpAddressDetail(query) {
      const { code } = await request({
        url: api.ipAddressManage.updateOpsIpAddressDetail,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // ip修改日志
    insertOpsIpAddressLog(query) {
      request({
        url: api.ipAddressManage.insertOpsIpAddressLog,
        data: query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bind-header {
  display: flex;
  .bind-header-item {
    .header-item-title {
      color: #606266;
      font-weight: 700;
      margin-bottom: 10px;
    }
  }
}
.search {
  margin: 10px;
}
// .footer-position-box {
//   position: relative;
//   height: 80px;
//     // border: 1px solid black;

//   .footer-position {
//   position: absolute;
//   right: 10px;
//   bottom: 10px;
//   }
// }
</style>
