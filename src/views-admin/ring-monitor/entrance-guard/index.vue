<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" icon="el-icon-plus" type="primary" @click="onCreate">新增</el-button>
      <el-button v-permission="['sync']" class="filter-item" icon="el-icon-refresh" type="primary" @click="onSync">同步门禁用户</el-button>
      <el-input v-model="findPowerEnvUserQuery.keyword" v-permission="['search']" class="filter-item" placeholder="请输入用户名称" style="width: 200px" />
      <el-button v-permission="['search']" class="filter-item" icon="el-icon-search" type="primary" @click="onFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table :data="powerEnvUser" fit highlight-current-row style="width: 100%" @selection-change="tableSelectChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" prop="id" show-overflow-tooltip type="index" width="120" />
        <el-table-column label="用户名称" prop="userName" show-overflow-tooltip />
        <el-table-column label="所属子系统" prop="sbId" show-overflow-tooltip>
          <template slot-scope="item">{{ setSubSystem(item.row.sbId) }}</template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="item">
            <div :class="item.row.userState === 1 ? 'success' : 'danger'">
              <i :class="item.row.userState === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.userState === 1 ? '有效' : '无效' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="卡号数量" prop="cardNum" show-overflow-tooltip>
          <template slot-scope="item">
            <el-tag class="pointer" effect="dark" type="primary" @click="toGuardCardList(item.row)">{{ setCountPeUserCardNum(item.row.userId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="ctime" show-overflow-tooltip />
        <el-table-column label="更新时间" prop="utime" show-overflow-tooltip />
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="280">
          <template slot-scope="{ row }">
            <el-button v-permission="['permission']" size="mini" type="primary" @click="openSubumitGuardRole(row)">权限管理</el-button>
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination
      v-show="findPowerEnvUserQuery.total > 0"
      :limit.sync="findPowerEnvUserQuery.limit"
      :page.sync="findPowerEnvUserQuery.page"
      :auto-scroll="false"
      :total="findPowerEnvUserQuery.total"
      @pagination="findPowerEnvUser"
    />
    <el-dialog :title="subumitGuardTitle" :visible.sync="showSubumitGuardInfo" top="5vh" width="40%">
      <div class="equipment_table">
        <el-form ref="form" :model="form" :rules="rules" class="select-width-fill" label-width="80px">
          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="form.userName" placeholder="请输入用户名称" />
          </el-form-item>
          <el-form-item label="状态" prop="userState">
            <el-select v-model="form.userState" filterable placeholder="请选择用户状态">
              <el-option v-for="item in userStateList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="子系统" prop="sbId">
            <el-select v-model="form.sbId" placeholder="请选择子系统" @change="getSubGateways">
              <el-option v-for="item in subSystems" :key="item.hySbId" :label="item.hySbName" :value="item.hySbId" />
            </el-select>
          </el-form-item>
          <el-form-item label="网关" prop="agentId">
            <el-select v-model="form.agentId" placeholder="请选择网关">
              <el-option v-for="item in subGateways" :key="item.id" :label="item.ip" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSubumitGuardInfo = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="comfirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="showSubumitGuardRole" :visible.sync="showSubumitGuardRole" title="门卡权限控制" top="5vh" width="50%">
      <div class="equipment_table">
        <el-table :data="guardRole" border fit highlight-current-row style="width: 100%" @close="onClose">
          <el-table-column label="门禁控制器" prop="hyAlias" />
          <el-table-column label="门">
            <template v-slot="{ row, $index }">
              <el-checkbox v-for="items of row.attrList" :key="items.hyVid + $index" :checked="Boolean(items.hyState)" :label="items.hyDes" @change="changeGuardRoleCheck($event, items)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSubumitGuardRole = false">关闭</el-button>
        <!-- <el-button class="filter-item" type="primary" @click="comfirmPermission">确 定</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'EntranceGuardList',
  components: { Pagination },
  data() {
    return {
      findPowerEnvUserQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      powerEnvUser: [],
      listLoading: false,
      showSubumitGuardInfo: false, // 新增编辑用户
      subumitGuardTitle: '新增门禁用户',
      userStateList: [
        {
          id: 1,
          name: '有效'
        },
        {
          id: 0,
          name: '无效'
        }
      ],
      form: {
        userName: '',
        userState: '',
        sbId: '',
        agentId: ''
      },
      rules: {
        userName: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
        userState: [{ required: true, message: '请选择用户状态', trigger: 'blur' }],
        sbId: [{ required: true, message: '请选择子系统', trigger: 'blur' }],
        agentId: [{ required: true, message: '请选择网关', trigger: 'blur' }]
      },
      showSubumitGuardRole: false, // 门卡权限控制
      tableSelectList: [], // 表格选择
      guardRole: [],
      cardNum: [],
      subSystems: [],
      subGateways: [],
      peUserid: ''
    }
  },
  computed: {
    setSubSystem() {
      return function (hySbId) {
        const idx = this.subSystems.findIndex((item) => item.hySbId === hySbId)
        console.log(idx)
        if (idx !== -1) {
          return this.subSystems[idx].hySbName
        }
      }
    },
    setCountPeUserCardNum() {
      return function (userId) {
        const idx = this.cardNum.findIndex((item) => item.userId === userId)
        return idx === -1 ? 0 : this.cardNum[idx].num
      }
    }
  },
  mounted() {
    this.findPowerEnvUserList()
    this.getSubSystems()
  },
  methods: {
    onClose() {
      this.showSubumitGuardRole = false
    },
    async onCreate() {
      this.resetForm(this.form)
      this.subumitGuardTitle = '新增门禁用户'
      await this.getSubSystems()
      this.showSubumitGuardInfo = true
    },
    tableSelectChange(val) {
      // 表格选择
      this.tableSelectList = val
    },
    onSync() {
      // 同步门禁
      if (this.tableSelectList.length === 0) {
        this.$message.error('请勾选用户')
        return
      }
      if (this.tableSelectList.length > 1) {
        this.$message.error('只能选择一个用户进行同步')
        return
      }
      let sbId = []
      let agentId = []
      this.tableSelectList.forEach((it) => {
        sbId.push(it.sbId)
        agentId.push(it.agentId)
      })
      sbId = sbId.join()
      agentId = agentId.join()
      request({
        url: api.powerEnv.syncDHUser,
        data: {
          sbId,
          agentId
        }
      })
    },
    getSubSystems() {
      // 获取子系统
      request({
        url: api.powerEnv.findHyitSubSystem
      }).then((res) => {
        if (res.code === 1) {
          this.subSystems = res.data
        }
      })
    },
    async getSubGateways() {
      // 获取网关
      this.$set(this.form, 'agentId', '')

      let { code, data } = await request({
        url: api.powerEnv.findHyitAgentSubsystem,
        data: { hySbId: this.form.sbId }
      })
      let ids = code === 1 ? data.map((it) => it.agentId).join() : []

      let res = await request({
        url: api.itMonitor.findHyitAgent,
        data: { ids: String(ids) }
      })
      this.subGateways = res.data || []
    },
    async onEdit(row) {
      this.resetForm(this.form)
      this.$set(this.form, 'userState', row.userState)
      this.$set(this.form, 'userName', row.userName)
      this.$set(this.form, 'userId', row.userId)
      this.$set(this.form, 'sbId', row.sbId)

      await this.getSubSystems()
      await this.getSubGateways()
      this.$set(this.form, 'agentId', row.agentId)
      this.subumitGuardTitle = '编辑门禁用户'
      this.showSubumitGuardInfo = true
    },
    onFilter() {
      this.findPowerEnvUserQuery.page = 1
      this.findPowerEnvUserList()
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({
          url: api.powerEnv.deletePowerEnvUser,
          data: { userId: row.userId }
        }).then((res) => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findPowerEnvUserQuery.page = 1
            this.findPowerEnvUserList()
          }
        })
      })
    },
    handleSizeChange() {},
    handleCurrentChange() {},
    toGuardCardList(row) {
      this.$router.push({
        name: 'GuardCardList',
        query: {
          id: row.userId || 0
        }
      })
    },
    resetForm(form) {
      Object.keys(form).forEach((key) => {
        form[key] = ''
      })
    },
    comfirm() {
      if (this.showSubumitGuardInfo) {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            request({
              url: this.form.userId && this.form.userId !== '' ? api.powerEnv.updatePowerEnvUser : api.powerEnv.insertPowerEnvUser,
              data: this.form
            }).then((res) => {
              if (res.code === 1) {
                this.findPowerEnvUserList()
                this.showSubumitGuardInfo = false
                // this.showSubumitGuardRole = false
              }
            })
          }
        })
      }
      // if (this.showSubumitGuardRole) {

      // }
    },
    comfirmPermission() {},
    changeGuardRoleCheck(bool, item) {
      console.log(bool, item, item.hySbId)
      request({
        url: bool ? api.powerEnv.addDHUserPower : api.powerEnv.deleteDHUserPower,
        data: {
          dhUserId: this.form.userId,
          sbId: this.form.sbId,
          agentId: this.form.agentId,
          ids: String(item.hyVid)
        }
      }).then((res) => {
        if (res.code === 1) {
          this.$message.success('修改成功')
          this.getAllCradController(this.peUserid)
        }
      })
    },
    openSubumitGuardRole(row) {
      if (!row.sbId || !row.agentId) {
        return this.$message.error('请先配置子系统')
      }
      this.resetForm(this.form)
      this.$set(this.form, 'userState', row.userState)
      this.$set(this.form, 'userName', row.userName)
      this.$set(this.form, 'userId', row.userId)
      this.$set(this.form, 'sbId', row.sbId)
      this.$set(this.form, 'agentId', row.agentId)

      this.getAllCradController(row.peUserid)
      this.showSubumitGuardRole = true
      this.peUserid = row.peUserid
    },
    findPowerEnvUserList() {
      this.findPowerEnvUser().then((res) => {
        this.powerEnvUser = res.data
        this.findPowerEnvUserQuery.total = Number(res.count)
        const ids = []
        res.data.forEach((item) => {
          ids.push(item.userId)
        })
        this.countPeUserCardNum(ids.toString())
      })
    },
    async findPowerEnvUser() {
      return await request({
        url: api.powerEnv.findPowerEnvUser,
        data: this.findPowerEnvUserQuery
      }).then((res) => {
        if (res.code === 1) {
          return res
        }
      })
    },
    countPeUserCardNum(ids) {
      request({
        url: api.powerEnv.countPeUserCardNum,
        data: {
          ids
        }
      }).then((res) => {
        if (res.code === 1) {
          this.cardNum = res.data
        }
      })
    },
    async getAllCradController(peUserId) {
      const res = await request({
        url: api.powerEnv.getAllCradController,
        data: {
          peUserId: peUserId
        }
      })
      if (res.code === 1) {
        let {
          data,
          map: { attrList }
        } = res
        for (let i = 0; i < data.length; i++) {
          let elei = data[i]
          elei.attrList = []
          for (let j = 0; j < attrList.length; j++) {
            let elej = attrList[j]
            if (elej.hyDeviceId === elei.hyDeviceId) {
              elei.attrList.push(elej)
            }
          }
        }
        this.guardRole = data
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
