<template>
  <div class="personalList_container">
    <!-- 左侧：标题导航区[运维主管权限] -->
    <div v-permission="['maintAdmin']" class="content_tabsLeft" :style="[isCollapse ? { flexRow:1,flexShrink:1,flexBasis: 64 + 'px'} : {flexRow:1,flexShrink:1,flexBasis: 14 +'%'}]">
      <el-menu default-active="1-4-1" class="el-menu-vertical-demo" :collapse="isCollapse">
        <el-menu-item index="0">
          <span slot="title" class="tabsLeft_top">人员列表</span>
          <i :class="isCollapse ?'el-icon-s-unfold':'el-icon-s-fold'" @click="changeTabShow" />
        </el-menu-item>
        <el-menu-item v-for="(item) in personalList" :key="item.userId" :index="item.userId" @click="selectPerson(item)">
          <i :class=" isCollapse ? '' : 'el-icon-s-custom'" />
          <span slot="title">{{ item.realName }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    <!-- 中部：工作信息区 -->
    <div class="content_workData">
      <div class="work_Headphoto">
        <!-- 头像 -->
        <div class="headphoto_img">
          <el-avatar :size="80" :src="circleUrl" />
        </div>
        <div class="headphoto_right">
          <span>{{ handleList.userRealName }}</span>
          <div>员工ID :{{ handleList.userId }}</div>
        </div>
      </div>
      <!-- 导航栏标签 -->
      <div class="tabsNavsTop">
        <el-tabs v-model="activeName" type="border-card" @tab-click="naviChange">
          <!-- tab_1:事项记录组件 -->
          <el-tab-pane label="事项记录" name="first">
            <personalTransactions ref="personalTransactions" :message="personalListVal" />
          </el-tab-pane>
          <!-- tab_2:作业记录组件 -->
          <el-tab-pane label="作业记录" name="second" :laze="true">
            <personalWork ref="personalWork" :message="personalListVal" />
          </el-tab-pane>
          <!-- tab_3:个人统计组件 -->
          <el-tab-pane label="个人统计" name="third">
            <personalTotal ref="personalTotal" :message="personalListVal" />
          </el-tab-pane>
        </el-tabs>
      </div>

    </div>
    <!-- 右侧：基本信息区 -->
    <div class="content_basicInfo">
      <div class="basic_Title">基本信息</div>
      <el-form ref="form" :model="userBaseInfoLsit" class="form_List">
        <el-form-item label="职位:">
          <span> {{ getPosition(userBaseInfoLsit.positionCatId) }}</span>
        </el-form-item>
        <el-form-item label="部门:">
          <span> {{ getOrganization(userBaseInfoLsit.organizationCatId) }}</span>
        </el-form-item>
        <el-form-item label="电话:">
          <span> {{ userBaseInfoLsit.mobile }}</span>
        </el-form-item>
        <el-form-item label="邮箱:">
          <span> {{ userBaseInfoLsit.email }}</span>
        </el-form-item>
        <el-form-item label="籍贯:">
          <span> {{ userBaseInfoLsit.nativePlace }}</span>
        </el-form-item>
        <el-form-item label="学历:">
          <span> {{ getEducation(userBaseInfoLsit.educationCatId) }}</span>
        </el-form-item>
        <el-form-item label="入职时间:">
          <span> {{ userBaseInfoLsit.entryDate }}</span>
        </el-form-item>

      </el-form>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import personalTransactions from './personalTransactions-log'
import personalWork from './personalWork-log'
import personalTotal from './personalTotal-log'

export default {
  name: 'PersonalList',
  components: { personalTotal, personalWork, personalTransactions },
  provide() {
    return {
      userId: this.userId,
      param: this.param
    }
  },
  data() {
    return {
      // 左侧人员列表属性
      circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 头像
      personalList: [],
      param: {},
      personalListVal: {}, // props子组件
      handleList: {
        realName: '无'
      },
      // 导航栏相关属性
      isCollapse: false,
      activeName: 'first', // 默认显示导航
      // 右侧基本信息
      organizationList: [],
      positionList: [],
      educationList: [],
      userBaseInfoLsit: {
        departmentCatId: '', // 部门
        positionCatId: '', // 职位
        educationCatId: '', // 学历
        mobile: '',
        email: '',
        entryDate: '', // 入职时间
        leaveDate: ''// 离职时间
      },
      selectPersonType: ''
    }
  },
  computed: {
    userId() {
      const userInfo = this.localStorageOperation('get', 'userInfo')
      const routerId = this.$route.query
      if (routerId?.userId) return routerId.userId
      return userInfo.userId
    },
    getPosition() { // 职位
      return function(catId) {
        let positionName = ''
        const data = this.positionList
        const pidx = data.findIndex(item => item.catId === catId)
        if (pidx !== -1) {
          positionName = data[pidx].catName
        }
        return positionName
      }
    },
    getOrganization() { // 部门
      return function(orgId) {
        let organizationName = ''
        const data = this.organizationList
        const oidx = data.findIndex(item => item.hyOrgId === orgId)
        if (oidx !== -1) {
          organizationName = data[oidx].hyOrgName
        }
        return organizationName
      }
    },
    getEducation() { // 学历
      return function(educationCatId) {
        let educationName = ''
        const data = this.educationList
        const eidx = data.findIndex(item => item.catId === educationCatId)
        if (eidx !== -1) {
          educationName = data[eidx].catName
        }
        return educationName
      }
    }
  },
  mounted() {
    this.getOrganizationCat()
    this.getPositionCat()
    this.getEducationCat()
    this.findOpsUserList()
    this.findHrUserInfo(this.userId) // 右侧默认的信息
  },
  methods: {
    // 获取部门
    getOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.organizationList = res.data
        }
      })
    },
    // 获取职位
    getPositionCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_职位', module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.positionList = res.data
        }
      })
    },
    // 获取学历
    getEducationCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_学历', module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.educationList = res.data
        }
      })
    },
    // 左测人员列表
    findOpsUserList() {
      const newDate = new Date()
      let childDate = this.$route.query

      const Year = newDate.getFullYear()
      const month = newDate.getMonth() + 1
      const day = newDate.getDate()
      const endDate = getFullDate(newDate)// 当前日期
      /* 日期格式yyy-mm-dd */
      function getFullDate(targetDate) {
        var D, y, m, d
        if (targetDate) {
          D = new Date(targetDate)
          y = D.getFullYear()
          m = D.getMonth() + 1
          d = D.getDate()
        } else {
          y = Year
          m = month
          d = day
        }
        m = m > 9 ? m : '0' + m
        d = d > 9 ? d : '0' + d
        return y + '-' + m + '-' + d
      }

      // 判断router是否传递date
      let newstartDate = ''
      if (childDate?.date) {
        let nowYear = childDate.date.slice(0, 4)
        let nowMonth = childDate.date.slice(5, 7)
        let firstDay = new Date(nowYear, nowMonth - 1, 1).getTime()
        newstartDate = getFullDate(firstDay)
      } else {
        newstartDate = getFullDate(new Date(Year, month - 1, 1))
      }
      this.param.sTime = newstartDate
      this.param.eTime = endDate

      // 选择判断\默认sdate：选择月份的第一天，edate：当前日期
      let DATE = { sdate: newstartDate, edate: endDate }
      request({ url: api.opm.findOpsUserList, data: DATE }).then(res => {
        const data = res.map.userlist
        this.personalList = data

        let result = []
        data.forEach(item => {
          result.push(item.userId)
        })
        this.personalListVal = {
          userId: this.userId,
          sdate: newstartDate,
          edate: endDate
        }
        this.findRefQuery(this.personalListVal)
      })
    },

    // 切换导航栏
    changeTabShow() {
      this.isCollapse = !this.isCollapse
    },
    // 选择列表人员
    selectPerson(val) {
      this.selectPersonType = 'select'
      this.findHrUserInfo(val.userId)
      let query = {
        userId: val.userId,
        select: this.selectPersonType,
        sdate: this.personalListVal.sdate,
        edate: this.personalListVal.edate
      }
      this.personalListVal = query
      this.findRefQuery(query)
    },
    /* 调用子组件的方法 */
    findRefQuery(query) {
      this.$refs.personalTransactions.submit(query)
      this.$refs.personalWork.initWork(query)
      this.$refs.personalTotal.initToatl(query)
    },
    // 头部导航切换
    naviChange(tab, event) {
      let query = this.personalListVal
      if (tab.index === '0') {
        this.$refs.personalTransactions.submit(query)
        this.$nextTick(() => {
          this.$refs.personalTransactions.resizeHandleOne()
        })
      } else if (tab.index === '1') {
        this.$refs.personalWork.initWork(query)
        this.$nextTick(() => {
          this.$refs.personalWork.resizeHandleTow()
        })
      } else {
        this.$refs.personalTotal.initToatl(query)
      }
    },
    // 右侧用户基本信息
    findHrUserInfo(userId) {
      request({ url: api.opm.findHrUserInfo, data: { userId, companyId: this.$auth.getUserSession().companyId }}).then(res => {
        if (res.code === 1) {
          const data = res.data
          data.forEach(item => {
            if (Number(userId) === Number(item.userId)) {
              this.userBaseInfoLsit = item
              this.handleList = item //  中部用户信息
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-menu{
  background-color: #e9ecf3;
}
.el-tabs--border-card > .el-tabs__header{
  background-color: #0c60d6;
}
/* 中间头部导航区 */
.el-tabs--border-card{
  border: none;
}
/* 右侧信息区 */
.el-form-item {
  margin-bottom: 8px;
}

.personalList_container{
  // display: flex;
  display: -webkit-box;
  margin-top: 10px;
  /* 左测人员列表 */
  .content_tabsLeft{
    // flex: 0 0 14%;
    background-color: #e9ecf3;
    .el-menu-vertical-demo:not(.el-menu--collapse) {
      // width: 180px;
      // width: 100%;
      height: 100%;
      .tabsLeft_top{
        color: #454549;
        font-weight: 600;
      }
    }
  }
  /* 中部内容信息 */
  .content_workData{
    // flex: 1 1 auto;
    flex: 1 ;
    // display: flex;
    // flex-direction: column;
    padding-bottom: 50px;
    background-color: white;
    .work_Headphoto{
      display: flex;
      padding: 10px 10px 10px 24px;
      align-items: center;
      background-color: white;
      .headphoto_img{
        width: 80px;
        height: 80px;
        line-height: 80px;
        border-radius: 50%;
        text-align: center;
        background-color: #e9ecf3;
      }
      .headphoto_right{
        flex: 1;
        height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 10px 16px;
        &>span{
          flex: 1;
          color: #606061;
          font-size: 14px;
          font-weight: 600;
        }
        &>div{
          flex: 1;
          color: #bfc1c4;
          line-height: 30px;
          font-size: 14px;
        }
      }
    }
  }
  /* 右侧基本信息 */
  .content_basicInfo{
    display: flex;
    // flex: 0 0 220px;
    flex: 0 0 14%;
    flex-direction: column;
    border-left: 1px solid #e1e1e1;
    background-color: white;
    .basic_Title{
      line-height: 16px;
      color: #333;
      margin: 10px 10px 10px 20px;
      font-weight: 600;
      font-size: 14px;
      color: rgb(37, 85, 156);
      &::after{
        content: '';
        display: block;
        width: 60px;
        height: 2px;
        margin-top: 10px;
        background-color: rgb(37, 85, 156);
      }
    }
    .form_List{
      padding-left: 50px;
      & span{
        font-size: 12px;
        color: #606061;
      }
      & label{
        font-weight: 500;
      }
    }
  }
}
</style>
