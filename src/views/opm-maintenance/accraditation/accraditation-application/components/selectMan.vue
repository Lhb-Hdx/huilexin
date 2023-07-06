<template>
  <div>
    <el-card header="反馈联系人" shadow="never">
      <div class="p-20">
        <div class="d-flex linkman align-item-center">
          <!-- <div class="font-14 mr-2" style="width:100px">选择联系人:</div> -->
          <el-select v-model="chooseHyitOrg" placeholder="请选择部门机构">
            <el-option v-for="item in hyitOrg" :key="item.hyOrgId" :label="item.hyOrgName" :value="item.hyOrgId" />
          </el-select>
          <el-select v-model="chooseUsers" placeholder="请选择人员" multiple collapse-tags value-key="id">
            <el-option v-for="item in filtersUsers" :key="item.id" :label="item.userRealName" :value="item" />
          </el-select>
        </div>
        <div class="linkman-select d-flex">
          <div v-for="(item) in selectMan" :key="item.id" class="linkman-select-item">
            <div class="item-name">{{ item.userRealName }}</div>
            <i class="el-icon-close font-16 pointer" @click="handleDele(item)" />
          </div>
        </div>
      </div>
      <div class="flex-v-between pt-6 pb-6 pl-20 pr-20 footer">
        <div>
          <el-checkbox :value="emailNotice" :true-label="1" :false-label="0" @change="changeEmailNotice">允许邮件通知</el-checkbox>
        </div>
        <div>
          <el-checkbox :value="wechatNotice" :true-label="1" :false-label="0" @change="changeWechartCheck">允许微信通知</el-checkbox>
        </div>
        <div>
          <el-button type="primary">查看工作簿</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'SelectMan',
  props: {
    selectMan: {
      type: Array,
      default: () => []
    },
    emailNotice: {
      type: [String, Number],
      default: 0
    },
    wechatNotice: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      hyitOrg: [], // 部门区域
      users: [], // 联系人列表
      filtersUsers: [], // 筛选后联系人列表
      chooseHyitOrg: '', // 选择部门机构
      chooseUsers: [] // 选择人员
    }
  },
  watch: {
    chooseHyitOrg(n) { // 部门修改更新对应的部门人员列表
      this.filtersUsers = this.users.filter(it => it.organizationCatId === n)
    },
    chooseUsers(n) {
      this.$emit('update:selectMan', n)
    }
  },
  created() {
    this.findHrUserInfo()
    this.findHyitOrg()
    this.chooseUsers = this.selectMan
    this.filtersUsers = this.selectMan
  },
  methods: {
    changeEmailNotice(num) {
      this.$emit('update:emailNotice', num)
    },
    changeWechartCheck(num) {
      this.$emit('update:wechatNotice', num)
    },
    handleDele(item) {
      this.chooseUsers = this.chooseUsers.filter(it => it.id !== item.id)
    },
    async findHrUserInfo() { // 联系人列表
      let { code, data } = await request({ url: api.opm.findHrUserInfo, data: { limit: -1, companyId: this.$auth.getUserSession().companyId }})
      if (code !== 1) return
      this.users = data
    },
    async findHyitOrg() { // 部门区域
      let { data, code } = await request({ url: api.org.findHyitOrg, data: { limit: -1 }})
      if (code !== 1) return
      this.hyitOrg = data
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-card__body{
    padding: 0px !important;
}
 .linkman-select{
        flex-wrap: wrap;
        align-items: center;
        .linkman-select-item{
            position: relative;
            padding: 7px 30px 7px 10px;
            background-color: #F0F0F0;
            border: 1px solid #d8d7d7;
            margin-right: 10px;
            margin-top: 10px;
            i{
              position: absolute;
                top: -50%;
                bottom: 0;
                right: 5px;
                transform: translateY(48%);
            }
            .item-name{
              max-width: 90px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            }
        }
    }
    .footer{
        background-color: #F6F6F6;
    }
</style>
