<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="菜单类型" prop="menuType">
                <el-radio-group v-model="form.menuType" class="no-margin">
                  <el-radio-button class="no-border" label="menu">菜单</el-radio-button>
                  <el-radio-button class="no-border" label="button">按钮</el-radio-button>
                  <el-radio-button class="no-border" label="module">模块</el-radio-button>
                  <el-radio-button class="no-border" label="tabbar">导航栏</el-radio-button>
                  <el-radio-button class="no-border" label="unify">事件菜单</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="菜单名" prop="menuName">
                <el-input v-model="form.menuName" placeholder="请输入菜单名" />
              </el-form-item>
              <el-form-item label="上级菜单" prop="parentId">
                <AiTreeInput
                  :key="reloadKey"
                  :level-start-num="1"
                  :field="{'id':'menuId','name':'menuName','parent':'parentId'}"
                  remote="/admin/findSysMenu"
                  infoapi="/admin/getSysMenu"
                  placeholder="请输入上层菜单"
                  :param="{menuType: 'menu,module', appId: form.appId,'classify': form.classify, version: 1}"
                  :bind-value="form.parentId"
                  :mounted-require="false"
                  :data-reload-key="dataReloadKey"
                  @input="inputParent"
                />
              </el-form-item>
              <el-form-item label="显示/隐藏" prop="status">
                <el-switch v-model="form.status" />
              </el-form-item>
              <el-form-item label="类型" prop="classify">
                <el-select v-model="form.classify" class="filter-item" @change="changeMenuClassify">
                  <el-option
                    v-for="(item,index) in menuType"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item v-if="form.menuType === 'menu' || (form.menuType === 'button' && form.classify !== 'pc') || (form.menuType === 'tabbar' && form.classify !== 'pc')" label="菜单地址" prop="menuUrl">
                <el-input v-model="form.menuUrl" placeholder="请输入菜单地址" />
              </el-form-item>

              <el-form-item v-if="form.menuType === 'menu'" label="重定向" prop="redirect">
                <el-input v-model="form.redirect" placeholder="请输入重定向地址" />
              </el-form-item>
              <el-form-item v-if="form.menuType === 'unify'" label="APPKEY" prop="menuUrl">
                <el-input v-model="form.appkey" placeholder="应用appkey，来源登录方分配的信息(必填)" />
              </el-form-item>
              <el-form-item v-if="form.menuType === 'unify'" label="密钥" prop="menuUrl">
                <el-input v-model="form.secret" placeholder="应用密钥，来源登录方分配的信息(必填)" />
              </el-form-item>
              <el-form-item v-if="form.menuType === 'unify'" label="认证识别码" prop="redirect">
                <el-input v-model="form.unify_suite" placeholder="根据文档配置的值填写" />
              </el-form-item>

              <el-form-item v-if="form.menuType !== 'module'" label="菜单图标" prop="icon">
                <el-input v-model="form.icon" placeholder="请输入菜单图标" />
              </el-form-item>
              <el-form-item v-if="form.classify !== 'pc' && form.menuType !== 'module'" label="" prop="icon">
                <FileUpload
                  button-text="选择图片"
                  upload-type="pic"
                  file-type=".png,.jpg"
                  file-url-list-type="picture"
                  :limit="1"
                  :button-disabled="false"
                  :is-limit-file-size="true"
                  :file-max-size="1"
                  :file-url-list="fileList"
                  @emitFileList="getEmitFileList"
                />
              </el-form-item>

              <el-form-item v-if="form.classify !== 'pc' && form.menuType === 'tabbar'" label="菜单选中状态" prop="activeIcon">
                <el-input v-model="form.activeIcon" placeholder="请输入菜单图标" />
              </el-form-item>
              <el-form-item v-if="form.classify !== 'pc' && form.menuType === 'tabbar'" label="" prop="activeIcon">
                <FileUpload
                  button-text="选择图片"
                  upload-type="pic"
                  file-type=".png,.jpg"
                  file-url-list-type="picture"
                  :limit="1"
                  :button-disabled="false"
                  :is-limit-file-size="true"
                  :file-max-size="1"
                  :file-url-list="activeIconFileList"
                  @emitFileList="getEmitActiveIconFileList"
                />
              </el-form-item>
              <el-form-item v-if="form.classify !== 'pc' && form.menuType === 'tabbar'" label="" prop="">
                <div class="upload-icon-tip">
                  <i class="el-icon-warning" /> TabBar图标尺寸要求：81px * 81px
                </div>
              </el-form-item>
              <el-form-item v-if="form.menuType === 'menu'" label="组件" prop="component">
                <el-input v-model="form.component" placeholder="请输入组件地址" />
              </el-form-item>

              <el-form-item label="菜单标识" prop="coding">
                <el-input v-model="form.coding" placeholder="请输入菜单标识" />
              </el-form-item>
              <el-form-item label="排序" prop="sort">
                <el-input-number v-model="form.sort" placeholder="请输入排序" :min="0" />
              </el-form-item>
              <el-form-item v-if="form.menuType !== 'unify'" label="访问接口">
                <div class="api-list">
                  <div class="flexBox">
                    <el-input
                      v-model="inputValue"
                      style="width: 200px"
                      @keyup.enter.native="handleInputConfirm"
                    />
                    <el-button class="margin-left-5" type="primary" @click="handleInputConfirm">添加</el-button>
                  </div>
                  <div class="table-wrapper margin-top-5">
                    <el-table
                      :data="apiUrls"
                      style="width: 100%"
                    >
                      <el-table-column prop="api" label="API名称" />
                      <el-table-column label="操作" width="100">
                        <template slot-scope="row">
                          <el-button size="mini" type="danger" @click="handleClose(row)">
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <!-- <pagination v-show="sysLevelOneListTotal > 0" :total="sysLevelOneListTotal" :page.sync="sysMenuListQuery.page" :limit.sync="sysMenuListQuery.limit" @pagination="loadSysAppList" /> -->
                </div>
              </el-form-item>
              <el-form-item v-if="form.menuType !== 'unify'" label="参数">
                <div class="api-list">
                  <div class="flexBox">
                    <el-input
                      v-model="inputMenuQueryName"
                      style="width: 200px"
                      placeholder="参数名称"
                    />
                    <el-input
                      v-model="inputMenuQueryValue"
                      class="margin-left-5"
                      style="width: 200px"
                      placeholder="参数值"
                    />
                    <el-button class="margin-left-5" type="primary" @click="handleInputMenuQueryConfirm">添加</el-button>
                  </div>
                  <div class="table-wrapper margin-top-5">
                    <el-table
                      :data="menuQuerys"
                      style="width: 100%"
                    >
                      <el-table-column prop="queryName" label="参数名称" />
                      <el-table-column prop="queryValue" label="参数值" />
                      <el-table-column label="操作" width="100">
                        <template slot-scope="row">
                          <el-button size="mini" type="danger" @click="handleCloseMenuQuery(row)">
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
                <el-button v-if="!id" v-permission="['Submit']" @click="onSubmitAndClose">保存并关闭</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
import FileUpload from '@/components/Upload/file-upload'
import request from '@/utils/request'
import api from '@/api/api'
import { conversionSymbols, guid } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'

export default {
  name: 'SysMenuAddUpdate',
  components: { AiTreeInput, FileUpload },
  data() {
    // const validateMenuUrl = (rule, value, callback) => {
    //   if (this.form.menuType === 'menu' && value === '') {
    //     return callback(new Error('请输入菜单地址'))
    //   }
    //   callback()
    // }
    const validateComponent = (rule, value, callback) => {
      if (this.form.menuType === 'menu' && value === '') {
        return callback(new Error('请输入组件'))
      }
      callback()
    }
    return {
      form: {
        menuName: null,
        sort: 0,
        parentId: 1,
        menuUrl: null,
        menuDesc: null,
        icon: null,
        menuType: 'menu',
        coding: null,
        status: null,
        appId: '',
        component: '',
        redirect: '',
        apiUrl: '',
        classify: 'pc',
        activeIcon: '',
        appkey: null,
        secret: null,
        unify_suite: null,
        menuQuery: '',
        version: 1
      },
      fileList: [],
      addRouterList: [],
      rules: {
        menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        coding: [{ required: true, message: '请输入菜单标识', trigger: 'blur' }],
        // menuUrl: [{ required: true, validator: validateMenuUrl, trigger: 'blur' }],
        component: [{ required: true, validator: validateComponent, trigger: 'blur' }],
        // equipment: [{ required: true, message: '请选择类型', trigger: 'blur' }]
        classify: [{ required: true, message: '请选择类型', trigger: 'blur' }]
        // equipment: [{ required: true, message: '请选择类型', trigger: 'blur' }]
      },
      loading: false,
      confirmLoading: false,
      reloadParent: false,
      reloadKey: 'reloadKey',
      inputParentId: 1,
      apiUrls: [],
      inputVisible: false,
      inputValue: '',
      host: '',
      menuType: this.$defineData.getSysMenuType(),
      dataReloadKey: '',
      activeIconFileList: [],
      menuQuerys: [],
      inputMenuQueryName: '',
      inputMenuQueryValue: ''
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  mounted() {
    this.$set(this.form, 'appId', getUserSession().appId)
    if (this.id) {
      this.loadDetail()
    }
  },
  created() {
    this.host = window.location.host // 获取当前域名
  },
  methods: {
    loadDetail() {
      request({
        url: api.sysMenu.getSysMenu, data: { menuId: this.id, appId: getUserSession().appId }
      }).then(res => {
        if (res.code === 1) {
          res.model.status = Boolean(res.model.status)
          if (res.model.menuType && res.model.menuType === 'unify' && res.model.menuUrl) {
            var json = JSON.parse(res.model.menuUrl)
            res.model.appkey = json.appkey
            res.model.secret = json.secret
            res.model.unify_suite = json.unify_suite
          }
          this.form = res.model
          if (res.model.icon) {
            this.fileList = [{
              id: guid(),
              name: this.$tool.sliceFileName(res.model.icon),
              url: res.model.icon
            }]
          }
          if (res.model.activeIcon) {
            this.activeIconFileList = [{
              id: guid(),
              name: this.$tool.sliceFileName(res.model.icon),
              url: res.model.activeIcon
            }]
          }
          this.inputParentId = res.model.parentId
          if (res.model.apiUrl !== null && res.model.apiUrl !== '') {
            const apiUrls = res.model.apiUrl.split(',')
            const apiList = []
            apiUrls.forEach(item => {
              apiList.push({
                api: item
              })
            })
            this.apiUrls = apiList
          }
          if (res.model.menuQuery !== undefined && res.model.menuQuery !== null && res.model.menuQuery !== '') {
            const menuQuery = JSON.parse(res.model.menuQuery)
            const menuQueryList = []
            menuQuery.forEach(item => {
              menuQueryList.push({
                id: item.id,
                queryName: item.queryName,
                queryValue: item.queryValue
              })
            })
            this.menuQuerys = menuQueryList
          }
          this.dataReloadKey = this.$tool.guid()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 上传图片
    getEmitFileList(file) {
      if (file.emitType !== 'deleteFile') {
        this.fileList = file['fileList']
        this.form.icon = `${process.env.VUE_APP_BASE_API}${file.fileList[0]['url']}` || ''
      }
    },
    // 上传图片
    getEmitActiveIconFileList(file) {
      if (file.emitType !== 'deleteFile') {
        this.activeIconFileList = file['fileList']
        this.form.activeIcon = `${process.env.VUE_APP_BASE_API}${file.fileList[0]['url']}` || ''
      }
    },
    onReset() {
      this.reloadParent = true
    },
    onSubmitAndClose() {
      this.submitSysMenu(true)
    },
    onSubmit() {
      this.submitSysMenu(!!this.id)
    },
    submitSysMenu(close) {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiUrls = []
          const menuQuery = []
          this.apiUrls.forEach(item => apiUrls.push(item.api))
          this.menuQuerys.forEach(item => menuQuery.push(item))
          this.loading = true
          this.form.status = this.form.status ? 1 : 0
          this.form.parentId = this.inputParentId
          this.form.apiUrl = conversionSymbols(apiUrls.toString())
          this.form.menuQuery = menuQuery.length > 0 ? JSON.stringify(menuQuery) : ''
          if (this.form.menuType === 'unify') {
            this.form.menuUrl = JSON.stringify({appkey: this.form.appkey, secret: this.form.secret, unify_suite: this.form.unify_suite})
          }
          request({
            url: (this.form.menuId && this.form.menuId > 0) ? '/admin/updateSysMenu' : '/admin/insertSysMenu', data: this.form
          }).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.$set(this.form, 'parentId', 0)
              this.reloadKey = guid()
              if (close) {
                this.$router.back()
              } else {
                this.$refs['form'].resetFields()
              }
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    onContinue() {
      const formVal = { ...this.form }
      this.$set(this.addRouterList, this.addRouterList.length, formVal)
      this.$refs['form'].resetFields()
    },
    inputParent(val) {
      this.inputParentId = val
    },
    handleClose(tag) {
      const idx = this.apiUrls.findIndex(item => item.api === tag.row.api)
      if (idx !== -1) this.apiUrls.splice(idx, 1)
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.$set(this.apiUrls, this.apiUrls.length, {
          api: inputValue
        })
      }
      this.inputValue = ''
    },
    changeMenuClassify() {
      this.reloadKey = this.$tool.guid()
    },
    handleInputMenuQueryConfirm() {
      if (this.inputMenuQueryName && this.inputMenuQueryValue) {
        this.$set(this.menuQuerys, this.menuQuerys.length, {
          id: this.$tool.guid(),
          queryName: this.inputMenuQueryName,
          queryValue: this.inputMenuQueryValue
        })
      }
      this.inputMenuQueryName = ''
      this.inputMenuQueryValue = ''
    },
    handleCloseMenuQuery(tag) {
      const idx = this.menuQuerys.findIndex(item => item.id === tag.row.id)
      if (idx !== -1) this.menuQuerys.splice(idx, 1)
    }
  }
}
</script>

<style lang="scss"  scoped>
.router-list {
  border: 1px solid #ebeef5;
  .router-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  .router-list-content {
    padding: 10px;
    .list-content-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .router-menu-info {
        .router-menu-name {
          margin-left: 10px;
        }
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}

.upload-icon-tip {
  color: red;
  font-size: 16px;
}
</style>
