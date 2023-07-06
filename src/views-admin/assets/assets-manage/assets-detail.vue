<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <div class="assets-detail-content">
          <div class="assets-detail-header flexBox align-item-center">
            <el-image class="assets-image" fit="fill" :src="assetsImg(assetsInfo.assetsImageUrl)">
              <div slot="error" class="image-slot el-image-sort">暂无图片</div>
            </el-image>
            <div class="assets-info">
              <div class="assets-header flexBox align-item-center">
                <div class="assets-header-title">{{ assetsInfo.assetsName }}</div>
                <div class="assets-header-status"><el-tag :type="assetsInfo.status === 486 ? 'success' : ''">{{ setUseStatus(assetsInfo.status) }}</el-tag></div>
              </div>
              <div class="assets-code">{{ assetsInfo.assetsSn }}</div>
              <div class="assets-use flexBox align-item-center">
                <div class="assets-use-text">使用部门：{{ setUseOrg(assetsUse.departmentCatId) }}</div>
                <div class="assets-use-text">使用期限：{{ assetsUse.useStime }} - {{ assetsUse.useEtime }}</div>
                <el-button v-permission="['ChangeAssets']" class="no-padding" type="text" @click="openAssetsChange">[变更]</el-button>
              </div>
            </div>
          </div>
          <div class="assets-detail-main">
            <el-tabs v-model="activeTabName" type="border-card" @tab-click="handleClick">
              <el-tab-pane label="概况" name="1">
                <detail-situation
                  v-if="activeTabName === '1'"
                  :assets-info="assetsInfo"
                  :assets-purchase="assetsPurchase"
                  :assets-use="assetsUse"
                />
              </el-tab-pane>
              <el-tab-pane label="关系" name="2">
                <detail-between />
              </el-tab-pane>
              <el-tab-pane label="事件" name="3">
                <detail-event />
              </el-tab-pane>
              <el-tab-pane label="记录" name="4">
                <detail-record v-if="activeTabName === '4'" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-card>
    </div>
    <el-drawer
      title="变更"
      :visible.sync="showAssetsChange"
      direction="rtl"
    >
      <div class="wrp">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="资产当前状态" prop="status">
            <el-select
              v-model="form.status"
              placeholder="请选择当前状态"
              style="width: 100%;"
            >
              <el-option
                v-for="item in assetsStatusList"
                :key="item.id"
                class="w-100"
                :label="item.dictdataName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="使用部门" prop="departmentCatId">
            <el-cascader
              v-model="form.departmentCatId"
              class="w-100"
              placeholder="使用部门"
              :options="orgTreeList"
              :props="{ value: 'hyOrgId', label: 'hyOrgName', checkStrictly: true }"
              @change="changeUseOrg"
            />
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="使用方式" prop="useTypeId">
            <el-select
              v-model="form.useTypeId"
              placeholder="请选择使用方式"
              style="width: 100%;"
            >
              <el-option
                v-for="item in assetsUseTypeList"
                :key="item.catId"
                class="w-100"
                :label="item.catName"
                :value="item.catId"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="使用负责人" prop="userId">
            <el-select
              v-model="form.userId"
              placeholder="请选择使用负责人"
              style="width: 100%;"
            >
              <el-option
                v-for="item in useOrgEmployeList"
                :key="item.id"
                class="w-100"
                :label="item.userRealName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="使用开始时间" prop="useStime">
            <el-date-picker
              v-model="form.useStime"
              class="w-100"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="使用结束时间" prop="useEtime">
            <el-date-picker
              v-model="form.useEtime"
              class="w-100"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="所在项目" prop="projectCatId">
            <el-select
              v-model="form.projectCatId"
              placeholder="请选择所在项目"
              style="width: 100%;"
            >
              <el-option
                v-for="item in assetsProjectCatList"
                :key="item.catId"
                class="w-100"
                :label="item.catName"
                :value="item.catId"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.status === '' || form.status === 486" label="所在位置" prop="location">
            <el-input v-model.trim="form.location" placeholder="请输入所在位置" />
          </el-form-item>
          <el-form-item label="备注" prop="description">
            <el-input v-model.trim="form.description" placeholder="备注" />
          </el-form-item>
        </el-form>
        <div class="drawer-footer">
          <el-button :loading="loading" type="primary" @click="saveAssetsChange">保存</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import DetailSituation from './components/detail-situation'
import DetailEvent from './components/detail-event'
import DetailRecord from './components/detail-record'
import DetailBetween from './components/detail-between'
import { listToTree } from '@/utils'

export default {
  name: 'AssetsDetail',
  components: {
    DetailSituation, DetailEvent, DetailRecord, DetailBetween
  },
  data() {
    // 自定义表单校验
    // 如果状态是使用中并且内容是空的时候会触发
    const validateDepartmentCatId = (rule, value, callback) => {
      if (this.form.status === 486 && value === '') {
        return callback(new Error('请选择使用部门'))
      }
      callback()
    }
    const validateUseTypeId = (rule, value, callback) => {
      if (this.form.status === 486 && value === '') {
        return callback(new Error('请选择使用方式'))
      }
      callback()
    }
    const validateUserId = (rule, value, callback) => {
      if (this.form.status === 486 && value === '') {
        return callback(new Error('请选择使用负责人'))
      }
      callback()
    }
    const validateUseStime = (rule, value, callback) => {
      if (this.form.status === 486 && value === '') {
        return callback(new Error('请选择使用开始时间'))
      }
      callback()
    }
    const validateUseEtime = (rule, value, callback) => {
      if (this.form.status === 486 && value === '') {
        return callback(new Error('请选择使用结束时间'))
      }
      callback()
    }
    return {
      loading: false,
      assetsInfo: {},
      assetsUse: {},
      assetsPurchase: {},
      assetsStatusList: [],
      configItemTreeList: [],
      orgList: [],
      orgTreeList: [],
      activeTabName: '1',
      showAssetsChange: false,
      form: {
        status: '',
        useTypeId: '',
        departmentCatId: '',
        userId: '',
        useStime: '',
        useEtime: '',
        description: '',
        projectCatId: '',
        location: '',
        dataUrl: ''
      },
      rules: {
        status: [
          { required: true, message: '请选择当前状态', trigger: 'blur' }
        ],
        departmentCatId: [
          { required: true, validator: validateDepartmentCatId, trigger: 'blur' }
        ],
        useTypeId: [
          { required: true, validator: validateUseTypeId, trigger: 'blur' }
        ],
        userId: [
          { required: true, validator: validateUserId, trigger: 'blur' }
        ],
        useStime: [
          { required: true, validator: validateUseStime, trigger: 'blur' }
        ],
        useEtime: [
          { required: true, validator: validateUseEtime, trigger: 'blur' }
        ]
      },
      assetsUseTypeList: [],
      findHrUserInfoQuery: {
        organizationCatId: '',
        page: 1,
        limit: -1
      },
      useOrgEmployeList: [],
      assetsProjectCatList: []
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    assetsImg() {
      return function(imgUrl) {
        return imgUrl || ''
      }
    },
    setUseStatus() {
      return function(status) {
        const idx = this.assetsStatusList.findIndex(item => item.id === status)
        if (idx !== -1) {
          return this.assetsStatusList[idx].dictdataName
        }
      }
    },
    setConfigItem() {
      return function(cmdbCatId) {
        const idx = this.configItemTreeList.findIndex(item => item.catId === cmdbCatId)
        if (idx !== -1) {
          return this.configItemTreeList[idx].catName
        }
      }
    },
    setUseOrg() {
      return function(departmentCatId) {
        const idx = this.orgList.findIndex(item => item.hyOrgId === departmentCatId)
        if (idx !== -1) {
          return this.orgList[idx].hyOrgName
        }
      }
    }
  },
  mounted() {
    if (this.$route.query.assetsId) this.getAssetsInfo()
    if (this.$route.query.purchaseId) this.getAssetsPurchase()
    if (this.$route.query.useId) this.getAssetsUse()
    this.findAssetsStatusCat()
    this.findConfigItemCat()
    this.findOrganizationCat()
    this.findAssetsUseTypeCat()
    this.findProjectCat()
  },
  methods: {
    // 获取使用状态
    findAssetsStatusCat() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'assets_use_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsStatusList = res.data
        }
      })
    },
    // 获取配置项
    findConfigItemCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_CMDB配置项', module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.configItemTreeList = res.data
        }
      })
    },
    // 获取部门
    findOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.orgList = res.data
          this.orgTreeList = listToTree(res.data, 0, 0, 'hyOrgId', 'hyPid')
        }
      })
    },
    // 获取资产信息
    getAssetsInfo() {
      request({
        url: api.assets.getAssetsInfo,
        data: { assetsId: this.$route.query.assetsId }
      }).then(res => {
        if (res.code === 1) this.assetsInfo = res.model
      })
    },
    // 获取资产使用
    getAssetsUse() {
      request({
        url: api.assets.getAssetsUse,
        data: { useId: this.$route.query.useId }
      }).then(res => {
        if (res.code === 1) this.assetsUse = res.model
      })
    },
    // 获取资产采购信息
    getAssetsPurchase() {
      request({
        url: api.assets.getAssetsPurchase,
        data: { purchaseId: this.$route.query.purchaseId }
      }).then(res => {
        if (res.code === 1) this.assetsPurchase = res.model
      })
    },
    // 获取资产变更记录
    findAssetsChangeLog() {
      request({
        url: api.assets.findAssetsChangeLog,
        data: {}
      }).then(res => {
      })
    },
    // 使用方式
    findAssetsUseTypeCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产使用方式', parentId: -1, module: 2}
      }).then(res => {
        if (res.code === 1) {
          this.assetsUseTypeList = res.data
        }
      })
    },
    // 点击tab
    handleClick(val) {
      this.activeTabName = val.name
    },
    // 打开变更
    openAssetsChange() {
      this.showAssetsChange = true
    },
    // 保存资产变更
    saveAssetsChange() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          /*
          使用中状态
          1、如果存在使用记录，则将变更资产填入的信息更改到使用记录表，并且插入一条更改日志（日志状态为出库）。
          2、如果不存在使用记录，则将变更资产填入的信息为资产新增使用记录，并且插入一条更改日志（日志状态为出库）。

          非使用状态
          1、如果存在使用记录，则删除资产的使用记录，并且插入一条更改日志（日志状态为选择的状态对应的日志类型）。
          2、如果不存在使用记录，直接插入一条更改日志（日志状态为选择的状态对应的日志类型）。
          */
          const idx = this.assetsStatusList.findIndex(item => item.id === this.form.status)
          if (this.form.status === 486) { // 使用中
            const changelog = {
              useTypeId: this.form.useTypeId,
              organizationCatId: this.form.departmentCatId[this.form.departmentCatId.length - 1],
              stime: this.form.useStime,
              etime: this.form.useEtime,
              sourceType: idx !== -1 ? this.assetsStatusList[idx].dictdataValue : '',
              status: this.form.status,
              userId: this.form.userId,
              assetsDeviceId: this.$route.query.assetsId
            }
            this.saveAssetsUse().then(res => {
              this.loading = false
              if (res) {
                const assetsUse = res.model
                if (!this.$route.query.useId) {
                  this.insertAssetsUseMap({
                    assetsDeviceId: this.$route.query.assetsId,
                    useId: assetsUse.useId
                  }).then(mapRes => {
                    if (mapRes) {
                      this.insertAssetsChangeLog(changelog)
                    }
                  })
                } else {
                  this.insertAssetsChangeLog(changelog)
                }
                this.$message({
                  type: 'success',
                  message: '变更成功'
                })
                this.$router.back()
              } else {
                this.$message.error('变更失败')
              }
            })
          } else {
            const changelog = {
              sourceType: idx !== -1 ? this.assetsStatusList[idx].dictdataValue : '',
              status: this.form.status,
              assetsDeviceId: this.$route.query.assetsId
            }
            if (!this.$route.query.useId) {
              this.insertAssetsChangeLog(changelog)
              this.$message({
                type: 'success',
                message: '变更成功'
              })
              this.$router.back()
            } else {
              this.deleteAssetsUseMap({
                useId: this.$route.query.useId,
                assetsDeviceId: this.$route.query.assetsId
              }).then(res => {
                if (res) {
                  this.insertAssetsChangeLog(changelog)
                  this.$message({
                    type: 'success',
                    message: '变更成功'
                  })
                  this.$router.back()
                } else {
                  this.$message.error('变更失败')
                }
              })
            }
          }
          // 修改资产信息
          this.saveAssetsInfo({
            assetsId: this.$route.query.assetsId,
            status: this.form.status
          })
        }
      })
    },
    // 选择变更使用部门
    changeUseOrg() {
      const organizationCatId = this.form.departmentCatId[this.form.departmentCatId.length - 1]
      this.$set(this.findHrUserInfoQuery, 'organizationCatId', organizationCatId)
      this.findHrUserInfo().then(res => {
        this.useOrgEmployeList = res
      })
    },
    // 获取人员
    async findHrUserInfo() {
      return await request({
        url: api.hr.findHrUserInfo,
        data: {...this.findHrUserInfoQuery, companyId: this.$auth.getUserSession().companyId}
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    },
    // 获取项目
    findProjectCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_项目', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsProjectCatList = res.data
        }
      })
    },
    // 保存资产使用
    async saveAssetsUse() {
      const apiName = this.$route.query.useId ? api.assets.updateAssetsUse : api.assets.insertAssetsUse
      const data = { ...this.form }
      if (this.$route.query.useId) data.useId = this.$route.query.useId
      return await request({
        url: apiName, data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 资产和使用人关联
    async insertAssetsUseMap(data) {
      return await request({
        url: api.assets.insertAssetsUseMap, data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 新增变更记录
    insertAssetsChangeLog(data) {
      request({
        url: api.assets.insertAssetsChangeLog, data
      })
    },
    // 删除资产使用
    async deleteAssetsUseMap(data) {
      return await request({
        url: api.assets.deleteAssetsUseMap,
        data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 修改资产信息
    saveAssetsInfo(data) {
      request({
        url: api.assets.updateAssetsInfo, data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.assets-detail-content {
  .assets-detail-header {
    .assets-image {
      width: 130px;
      height: 130px;
    }
    .assets-info {
      padding-left: 28px;
      .assets-header {
        padding-bottom: 14px;
        .assets-header-title {
          font-size: 24px;
          color: #333333;
        }
        .assets-header-status {
          padding-left: 14px;
        }
      }
      .assets-code {
        color: #666666;
        font-size: 14px;
        padding-bottom: 14px;
      }
      .assets-use {
        color: #666666;
        font-size: 14px;
        .assets-use-text {
          padding-right: 14px;
        }
      }
    }
  }
  .assets-detail-main {
    padding-top: 20px;
  }
}
.wrp form {
  padding-top: 0 !important;
}
</style>
