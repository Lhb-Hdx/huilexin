<template>
  <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
    <div class="dialog-body">
      <TransferList
        ref="sysUserTransferList"
        :key="reloadKey"
        class="user-list"
        data-key="userId"
        :prop-data-source="sysUserList"
        data-label="realName"
        :prop-data-check="checkSysUserData"
        :titles="['人员列表', '已选择']"
        :dictionary="dictionary"
      />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import TransferList from '@/components/TransferList/TransferList'
import { getUserSession } from '@/utils/auth'

export default {
  name: 'SchedulingUserDialog',
  components: {
    TransferList
  },
  data() {
    return {
      showDialog: false,
      reloadKey: 'reloadKey',
      sysUserList: [],
      checkSysUserData: [],
      dictionary: {
        leftPanelDevTypeId: '',
        notInIds: []
      },
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      dialogTitle: '值班人员'
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
  methods: {
    // 打开弹窗
    open(options) {
      this.$EventBus.$on('left-panel-body-bottom', () => {
        this.$set(this.findSysUserQuery, 'page', ++this.findSysUserQuery.page)
        this.findSysUser()
      })
      this.$EventBus.$on('data-source-null', () => {
        const getCheck = this.$refs.sysUserTransferList.getCheck()
        this.$set(this.findSysUserQuery, 'idsNotIn', getCheck.checkIds.toString())
        this.$set(this.findSysUserQuery, 'page', 1)
        this.sysUserList = []
        this.findSysUser()
      })

      if (options.dialogTitle) this.dialogTitle = options.dialogTitle || '值班人员'
      if (options.users) {
        this.checkSysUserData = options.users
        const idsNotIn = []
        options.users.forEach(item => idsNotIn.push(item.userId))
        this.$set(this.findSysUserQuery, 'idsNotIn', idsNotIn.toString())
      }
      this.showDialog = true
      this.reloadKey = this.$tool.guid()
      this.sysUserList = []
      this.findSysUser()
    },
    // 保存
    confirmDialog() {
      this.showDialog = false
      const getCheck = this.$refs.sysUserTransferList.getCheck()
      this.$EventBus.$emit('getCheckUser', this.$tool.deepCopy(getCheck))
    },
    // 查询用户
    findSysUser() {
      this.$request({
        url: this.api.sys.findSysUser,
        data: { ...this.findSysUserQuery, companyId: getUserSession().companyId }
      }).then(res => {
        if (res.code === 1) {
          this.sysUserList = [...this.sysUserList, ...res.data]
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list {
  width: fit-content;
  margin: 0 auto;
}
</style>
