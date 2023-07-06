<template>
  <div style="margin-top: 16px">
    <el-form-item label="审核人员">
      <el-select v-model="userType" @change="changeUserType">
        <el-option v-for="user in auditUserTypeList" :key="user.key" :label="user.value" :value="user.key" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="userType === 'user_'" label="处理用户">
      <!--      <el-select v-model="userTaskForm.assignee" @change="updateElementTask('assignee')">-->
      <!--        <el-option v-for="user in userList" :key="user.userId" :label="user.realName" :value="user.userId" />-->
      <!--      </el-select>-->
      <el-button type="primary" @click="openShowUserListDialog">选择用户</el-button>
      <div>
        <el-tag
          v-for="item in currehtSelectUser"
          :key="item.userId"
          size="mini"
          effect="dark"
          style="margin-right: 5px;"
          closable
          @close="handleClose(item.userId)"
        >
          {{ item.realName }}
        </el-tag>
      </div>
    </el-form-item>
    <el-form-item v-if="userType === 'role_'" label="处理角色">
      <el-select v-model="userTaskForm.assignee" @change="updateElementTask('assignee')">
        <el-option v-for="user in roleList" :key="user.roleId" :label="user.roleName" :value="user.roleId" />
      </el-select>
    </el-form-item>
    <UserListTable ref="userListTable" @submitSelect="submitSelect" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import UserListTable from '@/views-admin/opm-maintenance/process-manage/bpmn/package/dialog/user-list-table'

export default {
  name: 'UserTask',
  components: {
    UserListTable
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultTaskForm: {
        assignee: '',
        candidateUsers: [],
        candidateGroups: [],
        dueDate: '',
        followUpDate: '',
        priority: ''
      },
      userTaskForm: {},
      mockData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      userList: [],
      companyId: '',
      auditUserTypeList: [
        { key: '${userId}', value: '登录用户' },
        { key: '${leaderId}', value: '上级' },
        { key: 'user_', value: '用户' },
        { key: 'role_', value: '角色' }
      ],
      userType: '',
      roleList: [],
      currehtSelectUser: []
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement
        this.$nextTick(() => this.resetTaskForm())
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  },
  mounted() {
    this.companyId = getUserSession().companyId
    // this.findSysUser()
    this.findSysRole()
  },
  methods: {
    resetTaskForm() {
      this.userType = ''
      this.currehtSelectUser = []
      for (const key in this.defaultTaskForm) {
        let value
        if (key === 'candidateUsers' || key === 'candidateGroups') {
          value = this.bpmnElement?.businessObject[key] ? this.bpmnElement.businessObject[key].split(',') : []
        } else {
          value = this.bpmnElement?.businessObject[key] || this.defaultTaskForm[key]
        }
        this.$set(this.userTaskForm, key, value)
        if (key === 'assignee') {
          if (this.userTaskForm.assignee === '${userId}') {
            this.userType = '${userId}'
            return
          }
          if (this.userTaskForm.assignee === '${leaderId}') {
            this.userType = '${leaderId}'
            return
          }
          if (this.userTaskForm.assignee.indexOf('user') !== -1) {
            const splitArr = this.userTaskForm.assignee.split(',')
            this.userType = `user_`
            const userIds = []
            for (let index = 0; index < splitArr.length; index++) {
              userIds.push(Number(splitArr[index].split('_')[1]))
            }
            this.$set(this.userTaskForm, 'assignee', userIds)
          } else {
            const splitArr = this.userTaskForm.assignee.split('_')
            this.userType = `${splitArr[0]}_`
            this.$set(this.userTaskForm, 'assignee', Number(splitArr[1]))
          }
          if (this.userTaskForm.assignee) {
            this.getUserList({ ids: this.userTaskForm.assignee })
          } else {
            this.userType = this.auditUserTypeList[0].key
          }
        }
      }
    },
    updateElementTask(key) {
      const taskAttr = Object.create(null)

      if (key === 'candidateUsers' || key === 'candidateGroups') {
        taskAttr[key] = this.userTaskForm[key] && this.userTaskForm[key].length ? this.userTaskForm[key].join() : null
      } else {
        taskAttr[key] = this.userTaskForm[key] || null
      }
      if (key === 'assignee') {
        if (this.userType === 'user_') {
          // const idsArr = []
          // if (this.userTaskForm[key].length > 0) {
          //   this.userTaskForm[key].forEach(item => {
          //     idsArr.push(`${this.userType}${item}`)
          //   })
          // }
          // taskAttr[key] = idsArr.join(',')
        } else {
          taskAttr[key] = `${this.userType}${taskAttr[key]}`
        }
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr)
    },
    findSysUser() {
      request({
        url: api.sys.findSysUser,
        data: { departmentId: 0, educationId: 0, companyId: this.companyId, page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.userId = Number(item.userId)
          })
          this.userList = res.data
        }
      })
    },
    async changeUserType() {
      // if (this.userType === 'leave_') {
      //   const getHrUser = await this.getHrUserInfo(getUserSession().userId)
      //   if (getHrUser[0].leaderUserId === null) {
      //     this.$message({ message: '暂无上级', type: 'warning' })
      //     this.userType = ''
      //   } else {
      //     const taskAttr = Object.create(null)
      //     taskAttr['assignee'] = `leave-${getHrUser[0].leaderUserId}`
      //     window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr)
      //   }
      // }
      if (this.userType === '${userId}') {
        const taskAttr = Object.create(null)
        taskAttr['assignee'] = '${userId}'
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr)
      }
      if (this.userType === '${leaderId}') {
        const taskAttr = Object.create(null)
        taskAttr['assignee'] = '${leaderId}'
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr)
      }
      this.$set(this.userTaskForm, 'assignee', '')
    },
    findSysRole() {
      request({
        url: api.sys.findSysRole,
        data: { companyId: this.companyId, page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) this.roleList = res.data
      })
    },
    async getHrUserInfo(userId) {
      return new Promise(resolve => {
        request({
          url: api.hr.findHrUserInfo,
          data: { userId, companyId: this.$auth.getUserSession().companyId }
        }).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    openShowUserListDialog() {
      console.log(this.userTaskForm.assignee)
      const allSelection = []
      if (this.userTaskForm.assignee) {
        if (this.userTaskForm.assignee.length > 0) {
          // const assigneeArr = this.userTaskForm.assignee.split(',')
          // assigneeArr.forEach(item => allSelection.push({userId: item.split('_')[1]}))
          const type = Object.prototype.toString.call(this.userTaskForm.assignee).slice(8, -1)
          if (type === 'String') {
            const assigneeArr = this.userTaskForm.assignee.split(',')
            assigneeArr.forEach(item => allSelection.push({userId: item.split('_')[1]}))
          }
          if (type === 'Array') {
            const assigneeArr = [...this.userTaskForm.assignee]
            assigneeArr.forEach(item => allSelection.push({userId: item}))
          }
        }
      }
      console.log(allSelection)
      this.$refs.userListTable.open({
        isRadio: false,
        allSelection: this.userTaskForm.assignee ? allSelection : [],
        api: this.api.sys.findSysUser,
        keyField: 'userId',
        pageChangeFindDataEvType: 'request'
      })
    },
    submitSelect(val) {
      if (val.length > 0) {
        const ids = []
        const assignee = []
        val.forEach(item => {
          ids.push(item.userId)
          assignee.push(`user_${item.userId}_end`)
        })
        this.getUserList({ids})
        this.$set(this.userTaskForm, 'assignee', assignee.toString())
      } else {
        this.currehtSelectUser = []
        this.$set(this.userTaskForm, 'assignee', '')
      }
      this.updateElementTask('assignee')
    },
    async getUserList(query) {
      const { code, data } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code === 1) {
        this.currehtSelectUser = data
      }
    },
    handleClose(userId) {
      const currentSelectUserIndex = this.currehtSelectUser.findIndex(item => +item.userId === +userId)
      if (currentSelectUserIndex !== -1) {
        this.currehtSelectUser.splice(currentSelectUserIndex, 1)
      }
      const assignee = []
      this.currehtSelectUser.forEach(item => assignee.push(`user_${item.userId}_end`))
      this.$set(this.userTaskForm, 'assignee', assignee.toString())
      console.log(assignee)
      this.updateElementTask('assignee')
    }
  }
}
</script>
