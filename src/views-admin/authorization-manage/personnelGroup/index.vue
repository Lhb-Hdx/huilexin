
<template>
  <div class="app-container flex">
    <div class="leftNav">
      <div class="title-box flex-v-between">
        <div class="title-name">运维小组</div>
        <div class="edit-box">
          <i class="el-icon-edit-outline edit pointer" @click="onEdit" />
          <div class="plus pointer" @click="onAdd">+</div>
          <div class="minus pointer" @click="deleteGroup">-</div>
        </div>
      </div>
      <div class="group-box">
        <div v-for="(item, index) in groupList" :key="item.groupId" class="group-item" :class="{'active':index===chosen}" @click="showMoreDetail(index,item)">
          <div class="groupName">{{ item.groupName || '' }}</div>
          <div class="groupmNum"> {{ setGroupCount(item.groupId) }}</div>
        </div>
      </div>
    </div>
    <div class="right-content">
      <div class="title" style="fontSize:14px;fontWeight:bold;">{{ selectGroupItem.groupName }}</div>
      <div class="describe">
        <span>描述：{{ selectGroupItem.descr }}</span>
      </div>
      <div class="tab-box">
        <el-tabs type="card">
          <el-tab-pane class="tabPaneItem">
            <span slot="label" class="tab-header">
              成员（{{ listTotal }}）
            </span>
            <div class="tab-content">
              <div class="tab-operation">
                <!-- <div style="width:300px input">
                  <el-input
                    v-model="input"
                    placeholder="请输入内容"
                    clearable
                  />
                </div>
                <el-button class="search" type="info">查询</el-button> -->
                <el-button type="primary" @click="openBrotherDialog">绑定成员</el-button>
                <div class="val">
                  <ListControl :check-list="checkList" @setLists="setLists" />
                </div>
              </div>
              <el-table
                v-loading="loading"
                :data="tableList"
                style="width: 100%"
              >
                <el-table-column label="序号" type="index" />
                <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" prop="userId" label="ID" align="left" show-overflow-tooltip />
                <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" prop="userName" label="用户名" align="left" show-overflow-tooltip />
                <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" prop="realName" label="真实姓名" align="left" />
                <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" prop="userRoleName" label="角色" align="left" show-overflow-tooltip />
                <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" prop="weixin" label="微信号" align="right" />
                <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" prop="email" label="电子邮箱" align="right" />
                <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" prop="tel" label="联系电话" align="right" />
                <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="操作" align="left">
                  <template v-slot="{row}">
                    <el-button type="primary" class="link-type" @click="onDel(row)">解除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <pagination v-show="listTotal>0" :auto-scroll="false" :total="listTotal" :page.sync="tableQuery.page" :limit.sync="tableQuery.limit" @pagination="loadHrUserGroupMapList" />
            </div>
          </el-tab-pane>
          <!-- <el-tab-pane class="tabPaneItem">
            <span slot="label">
              设备（52）
            </span>
            <div>设备</div>
          </el-tab-pane> -->
        </el-tabs>
      </div>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showAddGroupDialog" width="40%" top="25vh">
      <div class="dialog-body">
        <el-form ref="form" :model="groupForm" :rules="rules" label-width="80px">
          <el-form-item label="小组名称:" prop="groupName">
            <el-input v-model="groupForm.groupName" style="width:40%" />
          </el-form-item>
          <el-form-item label="小组描述:">
            <el-input v-model="groupForm.descr" type="textarea" :rows="4" style="width:80%" />
          </el-form-item>
          <el-form-item label="小组主管:">
            <el-select v-model="userId" clearable placeholder="请选择" style="width:40%">
              <el-option
                v-for="item in userList"
                :key="item.userId"
                :label="item.realName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddGroupDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="submitGroup">确 定</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog v-el-drag-dialog="true" class="addBrotherDialog" title="绑定成员" :visible.sync="showAddBrotherDialog" width="50%" top="20vh">
      <el-form ref="form" :model="groupForm" :rules="rules" label-width="120px">
        <el-form-item label="请选择工程师:">
          <TransferList
            ref="sysUserTransferList"
            :key="reloadKey"
            class="user-list"
            data-key="userId"
            :prop-data-source="userInBindDialog"
            data-label="realName"
            :prop-data-check="checkSysUserData"
            :titles="['人员列表', '已选择']"
          />
        </el-form-item>
        <el-form-item label="备注:">
          <el-input type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddBrotherDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="addWorker">确 定</el-button>
      </div>
    </el-dialog> -->
    <UserListTable ref="userListTable" @submitSelect="submitSelect" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
// import TransferList from '@/components/TransferList/TransferList'
import UserListTable from './components/user-list-table'
import ListControl from '@/components/ListControl'
export default {
  name: 'PersonnelGroup',
  components: {
    Pagination,
    UserListTable,
    ListControl
    // TransferList
  },
  data() {
    return {
      loading: false,
      tableList: [],
      chosen: 0,
      groupList: [],
      groupForm: {
        groupName: '',
        descr: '',
        createUserId: this.localStorageOperation('get', 'userInfo').userId
      },
      userId: '',
      managerUserId: '', // 分组主管用户id
      userForm: {
        userId: ''
      },
      tableQuery: {
        page: 1,
        limit: 10,
        groupId: ''
      },
      listTotal: 0,
      selectGroupItem: '',
      userList: [],
      showAddGroupDialog: false,
      showAddBrotherDialog: false,
      extraUserList: [],
      rules: {
        groupName: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ]
      },
      roleData: [],
      userRole: [],
      dialogTitle: '新增小组',
      formId: '',
      reloadKey: 'reloadKey',
      userInBindDialog: [],
      checkSysUserData: [],
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      managerUserData: [],
      groupCount: [],
      allSelection: [],
      // 显示控制数据 start
      checkList: ['ID', '用户名', '真实姓名', '角色', '微信号', '电子邮箱', '联系电话', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setGroupCount() {
      return function(groupId) {
        const idx = this.groupCount.findIndex(item => +item.groupId === +groupId)
        return idx !== -1 ? this.groupCount[idx].groupCount - 1 : 0
      }
    }
  },
  watch: {
    showDialog: {
      handler() {
        if (!this.showDialog) {
          this.$EventBus.$off('left-panel-body-bottom')
          this.$EventBus.$off('data-source-null')
        }
      }
    }
  },
  async mounted() {
    await this.initData()
    await this.loadUserList()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    onDel(row) {
      this.$confirm('确定要解除这个成员吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const {code} = await this.deleteHrUserGroupMap({groupId: this.selectGroupItem.groupId, userId: row.userId})
        if (code !== 1) return this.$message.error('解除失败')
        this.$message.success('解除成功')
        await this.initData()
      })
    },
    onAdd() {
      this.showAddGroupDialog = true
      this.formId = ''
      Object.keys(this.groupForm).forEach(key => {
        this.$set(this.groupForm, `${key}`, '')
      })
    },
    async onEdit() {
      this.dialogTitle = '编辑小组'
      this.showAddGroupDialog = true
      this.formId = this.selectGroupItem.groupId
      Object.keys(this.groupForm).forEach(key => {
        this.$set(this.groupForm, `${key}`, this.selectGroupItem[`${key}`])
      })
      const findHrUserGroupMap = await this.findHrUserGroupMap({ groupId: this.selectGroupItem.groupId, classify: 'manager' })
      if (findHrUserGroupMap && findHrUserGroupMap.data.length > 0) this.userId = String(findHrUserGroupMap.data[0].userId)
    },
    async initData() {
      const {code, data} = await this.findHrUserGroup()
      if (code !== -1) {
        // if (!this.selectGroupItem.groupId) {
        // 设置成员表格查询参数
        this.tableQuery.groupId = data[0].groupId
        // 默认选择第一个分组
        this.selectGroupItem = data[0]
        // }
        this.groupList = data
        await this.loadHrUserGroupMapList()
        await this.getHrUserGroupMapCount()
      } else {
        this.$message({type: 'warning', message: '获取分组失败'})
      }
    },
    async findHrUserInfo(query) {
      const { data, count, code } = await this.$request({ url: this.api.hr.findHrUserInfo, data: query })
      if (code !== 1) return
      return { data, count }
    },
    submitSelect(selectList) {
      // this.$set(this.loopInstanceForm, 'collection', selectList)
      this.allSelection = selectList
      // this.loopInstanceForm.collection = this.allSelection.map(it => it.userId).join(',')
      // this.updateLoopBase()

      this.addWorker()
    },
    // 添加人员
    async addWorker() {
      // this.checkSysUserData = []
      // const getCheck = this.$refs.sysUserTransferList.getCheck()
      const json = [{ userId: this.managerUserData[0]?.userId, classify: 'manager' }]
      // getCheck.checkIds.forEach(item => {
      //   json.push({
      //     userId: item,
      //     classify: 'enginner'
      //   })
      // })
      this.allSelection.forEach(item => {
        json.push({
          userId: item.userId,
          classify: 'enginner'
        })
      })
      const updateBatchHrUserGroupMap = await this.updateBatchHrUserGroupMap({
        groupId: this.selectGroupItem.groupId,
        // json: JSON.stringify(mapJson)
        json: JSON.stringify(json)
      })
      if (updateBatchHrUserGroupMap.code === 1) {
        this.$message.success(updateBatchHrUserGroupMap.msg)
        this.showAddBrotherDialog = false
        await this.loadHrUserGroupMapList()
        await this.getHrUserGroupMapCount()
      } else {
        this.$message.error(updateBatchHrUserGroupMap.msg)
      }
    },
    async openBrotherDialog() {
      const checkUserIds = []
      const findHrUserGroupMap = await this.findHrUserGroupMap({
        groupId: this.selectGroupItem.groupId, classify: 'enginner', limit: -1
      })
      if (findHrUserGroupMap && findHrUserGroupMap.data.length > 0) {
        findHrUserGroupMap.data.forEach(item => {
          checkUserIds.push(item.userId)
        })
        this.$set(this.findSysUserQuery, 'idsNotIn', checkUserIds.toString())
        const findSysUser = await this.findSysUser({
          ids: checkUserIds.toString(), limit: -1, companyId: this.$auth.getUserSession().companyId
        })
        if (findSysUser && findSysUser.data.length > 0) {
          this.allSelection = findSysUser.data
        }
      }

      this.$refs.userListTable.open({
        isRadio: false,
        allSelection: this.allSelection || [],
        api: this.api.sys.findSysUser,
        keyField: 'userId',
        pageChangeFindDataEvType: 'request'
      })

      // this.userInBindDialog = []
      // this.checkSysUserData = []
      // this.$set(this.findSysUserQuery, 'idsNotIn', '')
      // this.$set(this.findSysUserQuery, 'page', 1)
      // this.$EventBus.$on('left-panel-body-bottom', () => {
      //   this.$set(this.findSysUserQuery, 'page', ++this.findSysUserQuery.page)
      //   this.loadUserInBindDialog()
      // })
      // this.$EventBus.$on('data-source-null', () => {
      //   const getCheck = this.$refs.sysUserTransferList.getCheck()
      //   this.$set(this.findSysUserQuery, 'idsNotIn', getCheck.checkIds.toString())
      //   this.$set(this.findSysUserQuery, 'page', 1)
      //   this.userInBindDialog = []
      //   this.loadUserInBindDialog()
      // })
      // this.showAddBrotherDialog = true
      // this.reloadKey = this.$tool.guid()
      // this.sysUserList = []

      // await this.loadUserInBindDialog()
    },
    // 加载用户列表到绑定成员弹窗
    async loadUserInBindDialog() {
      const roleIds = []

      const findSysRole = await this.$request({ url: this.api.sys.findSysRole, data: { classify: 'engineer', limit: -1 } })
      if (findSysRole.code !== 1 && !findSysRole.data && findSysRole.data.length === 0) return
      findSysRole.data.forEach(item => roleIds.push(item.roleId))

      const findSysUserRole = await this.$request({ url: this.api.sys.findSysUserRole, data: { roleIds: this.$tool.uniqueArray(roleIds).toString(), ...this.listQuery, limit: -1 } })
      if (findSysUserRole.code !== 1 && !findSysUserRole.data && findSysUserRole.data.length === 0) return
      this.userRole = findSysUserRole.data
      const userIds = []
      findSysUserRole.data.forEach(item => userIds.push(item.userId))

      const findSysUser = await this.findSysUser({
        ...this.findSysUserQuery, companyId: this.$auth.getUserSession().companyId, ids: this.$tool.uniqueArray(userIds).toString()
      })
      if (findSysUser && findSysUser.data.length > 0) {
        this.userInBindDialog = [...this.userInBindDialog, ...findSysUser.data]
      }
    },
    // 获取用户绑定角色
    async findSysUserRole(query) {
      const { data, count, code } = await this.$request({ url: this.api.sys.findSysUserRole, data: query })
      if (code !== 1) return
      return { data, count }
    },
    // 获取角色
    async findSysRole(query) {
      const { data, count, code } = await this.$request({ url: this.api.sys.findSysRole, data: query })
      if (code !== 1) return
      return { data, count }
    },
    showMoreDetail(index, item) {
      this.tableQuery.groupId = item.groupId
      this.tableQuery.page = 1
      this.tableQuery.limit = 10
      this.chosen = index
      this.selectGroupItem = item
      this.loadHrUserGroupMapList()
    },
    // 保存
    async submitGroup() {
      if (this.userId === '') {
        this.$message.info('请选择小组主管')
        return
      }
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const api = this.formId ? this.api.sys.updateHrUserGroup : this.api.sys.insertHrUserGroup
          const query = { ...this.groupForm, userId: this.userId }
          if (this.formId) query.groupId = this.formId
          this.$request({url: api, data: query}).then(async res => {
            if (res.code === 1) {
              // const userRoleIndex = this.userRole.findIndex(items => +items.userId === +this.userId)

              if (!this.formId) {
                await this.insertHrUserGroupMap({
                  groupId: res.model.groupId,
                  userId: this.userId,
                  classify: 'manager'
                })
              } else {
                const findHrUserGroupMap = await this.findHrUserGroupMap({ groupId: this.selectGroupItem.groupId, classify: 'manager' })
                if (findHrUserGroupMap.data.length > 0) {
                  await this.deleteHrUserGroupMap({
                    userId: findHrUserGroupMap.data[0].userId,
                    groupId: this.formId
                  })
                  await this.insertHrUserGroupMap({
                    groupId: this.formId,
                    userId: this.userId,
                    classify: 'manager'
                  })
                } else {
                  await this.insertHrUserGroupMap({
                    groupId: this.formId,
                    userId: this.userId,
                    classify: 'manager'
                  })
                }
              }
              await this.initData()
              this.$message.success(res.msg)
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
      // await this.initData()
      this.showAddGroupDialog = false
    },

    async findHrUserGroup() {
      const form = { page: -1, limit: -1 }
      return await this.$request({url: this.api.sys.findHrUserGroup, data: form})
    },
    async updateBatchHrUserGroupMap(query) {
      return await this.$request({url: this.api.sys.updateBatchHrUserGroupMap, data: query})
    },
    // 插入新的分组关系
    async insertHrUserGroupMap(data) {
      return await this.$request({ url: this.api.sys.insertHrUserGroupMap, data })
    },
    // 解除分组人员关系
    async deleteHrUserGroupMap(data) {
      return await this.$request({url: this.api.sys.deleteHrUserGroupMap, data})
    },
    // 删除分组
    async deleteHrUserGroup() {
      return await this.$request({url: this.api.sys.deleteHrUserGroup, data: {groupId: this.selectGroupItem.groupId}})
    },
    // 删除小组
    deleteGroup() {
      if (!this.selectGroupItem) return
      this.$confirm(`此操作将删除运维小组 ${this.selectGroupItem.groupName}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {code} = await this.deleteHrUserGroup()
        if (code !== -1) {
          await this.initData()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 加载主管角色用户
    async loadUserList() {
      const roleIds = []
      if (this.roleData.length === 0) {
        const findSysRole = await this.$request({ url: this.api.sys.findSysRole, data: { classify: 'governor', limit: -1 } })
        if (findSysRole.code !== 1 && !findSysRole.data && findSysRole.data.length === 0) return
        findSysRole.data.forEach(item => roleIds.push(item.roleId))
        this.roleData = findSysRole.data
      } else {
        this.roleData.forEach(item => roleIds.push(item.roleId))
      }

      if (roleIds.length === 0) return
      const findSysUserRole = await this.$request({ url: this.api.sys.findSysUserRole, data: { roleIds: this.$tool.uniqueArray(roleIds).toString(), ...this.listQuery, limit: -1 } })
      if (findSysUserRole.code !== 1 && !findSysUserRole.data && findSysUserRole.data.length === 0) return
      this.userRole = findSysUserRole.data
      const userIds = []
      findSysUserRole.data.forEach(item => userIds.push(item.userId))
      if (userIds.length === 0) return

      const findSysUser = await this.$request({ url: this.api.sys.findSysUser, data: { ids: this.$tool.uniqueArray(userIds).toString(), limit: -1 } })
      if (findSysUser.code !== 1 && !findSysUser.data && findSysUser.data.length === 0) return
      this.userList = findSysUser.data
      this.total = +findSysUserRole.count
    },
    async findHrUserGroupMap(query) {
      const { code, data, count } = await this.$request({ url: this.api.sys.findHrUserGroupMap, data: query })
      if (code !== 1) return
      return { data, count }
    },
    async loadHrUserGroupMapList() {
      const getManager = await this.findHrUserGroupMap({
        groupId: this.selectGroupItem.groupId, classify: 'manager', limit: -1
      })
      if (getManager && getManager.data.length) {
        this.managerUserData = getManager.data
      }

      const findHrUserGroupMap = await this.findHrUserGroupMap({
        ...this.tableQuery, classify: 'enginner'
      })
      this.listTotal = +findHrUserGroupMap.count
      if (findHrUserGroupMap && findHrUserGroupMap.data.length > 0) {
        const userIds = []
        findHrUserGroupMap.data.forEach(item => {
          userIds.push(item.userId)
        })
        // 查询系统用户
        const findSysUser = await this.findSysUser({
          ids: this.$tool.uniqueArray(userIds).toString(),
          limit: -1,
          companyId: this.$auth.getUserSession().companyId
        })
        // 查询用户角色关联
        const findSysUserRole = await this.findSysUserRole({
          userIds: this.$tool.uniqueArray(userIds).toString(),
          limit: -1,
          companyId: this.$auth.getUserSession().companyId
        })
        // 查询用户人员信息
        const findHrUserInfo = await this.findHrUserInfo({
          ids: this.$tool.uniqueArray(userIds).toString(),
          limit: -1
        })
        const roleIds = []
        if (findSysUserRole && findSysUserRole.data.length > 0) {
          findSysUserRole.data.forEach(items => {
            roleIds.push(items.roleId)
          })
        }
        let findSysRole = {}
        if (roleIds.length > 0) {
          // 查询角色
          findSysRole = await this.findSysRole({ limit: -1, ids: this.$tool.uniqueArray(roleIds).toString() })
        }
        if (findSysUser && findSysUser.data.length > 0) {
          findSysUser.data.forEach(item => {
            const userRoleName = []
            if (findSysUserRole && findSysUserRole.data.length > 0) {
              findSysUserRole.data.forEach(items => {
                if (+items.userId === +item.userId) {
                  const roleIndex = findSysRole.data.findIndex(roleItem => +roleItem.roleId === +items.roleId)
                  if (roleIndex !== -1) userRoleName.push(findSysRole.data[roleIndex].roleName)
                }
              })
            }
            if (findHrUserInfo && findHrUserInfo.data.length > 0) {
              const hrIndex = findHrUserInfo.data.findIndex(hrItem => +hrItem.userId === +item.userId)
              if (hrIndex !== -1) item.weixin = findHrUserInfo.data[hrIndex].weixin
            }
            item.userRoleName = userRoleName.toString()
          })
          this.tableList = findSysUser.data
        } else {
          this.tableList = []
        }
      } else {
        this.tableList = []
      }
    },
    async findSysUser(query) {
      const { code, data, count } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    async getHrUserGroupMapCount() {
      const { code, map } = await this.$request({url: this.api.sys.getHrUserGroupMapCount, data: {}})
      if (code !== 1 || !map) return
      this.groupCount = map.count
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container{
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    .leftNav{
        min-height: 50%;
        width: 240px;
        background-color: #e5ecf6;
        .title-box{
            padding:8px 10px;
            font-size: 18px ;
            font-weight: bold;
            border-bottom: 3px solid rgba(1, 62, 154, 1);
            .edit-box{
                display: flex;
                .edit{
                    // width: 20px;
                    height: 20px;
                    line-height: 20px;
                    font-size: 25px;
                    text-align: center;
                }
                .plus, .minus {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: rgb(121, 121, 121) solid 1.5px;
                  font-size: 14px;
                }
                .plus{
                    width: 20px;
                    height: 20px;
                    margin: 0 7px;
                }
                .minus{
                    width: 20px;
                    height: 20px;
                }
            }
        }
        .group-box{
           width: 100%;
           cursor:pointer;
           .group-item{
            display: flex;
            height: 35px;
            line-height:35px;
            font-size: 15px;
            padding: 0 10px 0 20px;
             width: 100%;
             justify-content: space-between;
             align-items: center;
             .groupName{
                font-size: 14px;
             }
             .groupmNum{
                margin-right: 10px;
                font-weight: bold;
             }

           }
              .active{
               background-color: rgba(206, 219, 238, 1);
             }
           .group-item:hover{
              background-color: rgba(206, 219, 238, 1);
           }
        }

    }
    .right-content{
        flex: 1;
        min-height: 50%;
        padding: 10px;
        .title{
            height: 26px;
            font-size: 20px !important;
            margin: 10px 0 10px 5px;
        }
        .describe{
            font-size: 12px;
             margin: 10px 0 10px 5px;
        }
        .tab-box{
            .tabPaneItem{
                .tab-operation{
                    display: flex;
                    margin-left: 10px;
                    justify-content: flex-start;
                    .search{
                        margin-left: 10px;
                    }
                }
                .tab-header{

                }

            }

        }
    }
    .addBrotherDialog{
      .td-header{
        // width: 40%;
        margin: 0 0 10px 0;
        // background-color: rgb(242, 242, 242);
      }
    }
  /deep/ .el-table__row>td{
	border: none;
}
/deep/ .el-table::before {//去掉最下面的那一条线
	height: 0px;
}
/deep/ .el-tabs--card > .el-tabs__header .el-tabs__item.is-active{
  border-bottom-color:#409EFF
}
.val {
  position: absolute;
  right: 10px;
}
}
</style>
