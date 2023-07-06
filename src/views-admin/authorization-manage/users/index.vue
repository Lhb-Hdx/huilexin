<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">
        新增
      </el-button>
      <el-select v-model="companyId" v-permission="['SelectSysCompany']" class="filter-item" placeholder="请选择公司">
        <el-option v-for="item in companyList" :key="item.companyId" :label="item.companyName" :value="item.companyId" />
      </el-select>
      <el-select v-model="isLoginUser" class="filter-item" placeholder="请选择用户类型">
        <el-option label="用户" :value="true" />
        <el-option label="人员" :value="false" />
      </el-select>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入用户名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onSearch">
        查询
      </el-button>
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onSynchronization">
        同步用户
      </el-button>
      <el-button v-permission="['uploadExcel']" class="filter-item" type="primary" icon="el-icon-s-operation" @click="handleImprotExcel">
        批量导入
      </el-button>
      <el-button v-permission="['downloadExcel']" class="filter-item" type="primary" icon="el-icon-download"><el-link class="unset" target="_blank" href="/manage/用户信息导入表.xlsx" :underline="false">模板下载</el-link></el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table :data="list" fit highlight-current-row style="width: 100%;">
        <el-table-column label="ID" prop="userId" align="left" width="80" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.userId }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isUserData && lists.length > 0 ? lists[0].ispass : true" label="用户名称" prop="userName" align="left" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="用户姓名" prop="realName" align="left" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.realName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isUserData && lists.length > 0 ? lists[2].ispass : true" label="用户角色" align="left" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.roles.join(",") }}</span>
          </template>
        </el-table-column>

        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="操作" align="left" width="400" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-if="isUserData" v-permission="['ResetPassword']" size="mini" type="primary" @click="onResetPassword(row)">
              重置密码
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
    <el-dialog title="授权设备" :visible.sync="showAuthDialog" width="60%" top="5vh">
      <el-tabs v-model="activeDeviceType" @tab-click="handleClick">
        <el-tab-pane v-for="item in deviceTypeTab" :key="item.value" :label="item.label" :name="item.value">
          <video-device-table v-if="activeDeviceType === '1' && item.value === '1'" :key="updateKey" :user-id="handlerUserAuth" />
          <el-empty v-else description="暂无数据" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <weixin-qrcode-components />
    <!-- 导入Excel -->
    <el-dialog title="文件导入" :visible.sync="showImportExcelDialog" width="36%" top="5vh">
      <el-upload
        action
        accept=".xls,.xlsx"
        :http-request="upload"
        :file-list="fileList"
      >
        <el-button size="small" type="primary">选择导入文件</el-button>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportExcelDialog = false">取 消</el-button>
        <el-button type="primary" @click="onImprotExcel">导 入</el-button>
      </div>
    </el-dialog>
    <el-dialog title="重置密码" :visible.sync="showResetPwdDialog" width="30%" top="5vh">
      <el-form ref="form" :model="resetPwdForm" :rules="resetPwdFormRules">
        <el-form-item label="输入新密码" prop="newPwd" label-width="100px">
          <el-input v-model.trim="resetPwdForm.newPwd" :type="newPasswordType" placeholder="请输入新密码" />
          <span class="show-pwd" @click="showPwd('newPasswordType')">
            <svg-icon :icon-class="newPasswordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPwd" label-width="100px">
          <el-input v-model.trim="resetPwdForm.confirmPwd" :type="confirmPasswordType" placeholder="请确认新密码" />
          <span class="show-pwd" @click="showPwd('confirmPasswordType')">
            <svg-icon :icon-class="confirmPasswordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button size="mini" @click="closeResetPwdDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveResetPwd">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import userListMixin from './mixins/user-list-mixin'
import weixinQrcodeComponents from '@/views/components/weixin-qrcode-components.vue'
export default {
  name: 'Users',
  components: { weixinQrcodeComponents },
  mixins: [userListMixin]
}
</script>
