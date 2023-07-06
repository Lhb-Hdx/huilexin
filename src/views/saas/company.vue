<template>
  <div class="wrp">
    <div class="headerBox">
      <el-input v-model="keyword" placeholder="请输入搜索内容" clearable />
      <el-button type="primary" @click="loadData({page:1})"> 搜索</el-button>
      <el-button type="primary" @click="onAdd()">新增</el-button>
    </div>
    <div class="bodyBox">
      <el-table :data="data" stripe border style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <h2>授权应用服务</h2>
            <el-table :data="props.row.children" stripe border style="width: 100%">
              <el-table-column prop="appId" label="编号" width="60"><template slot-scope="scope">
                <div>{{ scope.row.appId }}</div>
              </template>
              </el-table-column>
              <el-table-column prop="appName" label="名称"><template slot-scope="scope">
                <div>{{ scope.row.appName }}</div>
              </template></el-table-column>
              <el-table-column prop="appKey" label="APPKEY"><template slot-scope="scope">
                <div>{{ scope.row.appKey }}<i v-if="!scope.row.appKey || scope.row.appKey === 'null' || scope.row.appKey === 'NULL'" class="el-icon-refresh" @click="onResetAppSecret(scope.row)" /></div>
              </template></el-table-column>
              <el-table-column prop="secret" label="SECRET"><template slot-scope="scope">
                <div>{{ scope.row.secret }}</div>
              </template></el-table-column>
              <el-table-column prop="certificate" label="加设备授权"><template slot-scope="scope">
                <div>
                  <input :ref="'uploadFile_'+scope.row.appId+'_'+scope.row.companyId" type="file" style="opacity:0.99" @change="onChangeFile(scope.row)">
                </div>
              </template>
              </el-table-column>

            </el-table>

            <h2>授权设备</h2>
            <el-table :data="props.row.applicationyAppCompanyData" stripe border style="width: 100%">

              <el-table-column prop="appId" label="编号" width="60"><template slot-scope="scope">
                <div>{{ scope.row.appId }}</div>
              </template>
              </el-table-column>
              <el-table-column prop="applicationName" label="名称" width="160"><template slot-scope="scope">
                <div>{{ scope.row.applicationName }}</div>
              </template></el-table-column>
              <el-table-column prop="agentId" label="序列号" width="160"><template slot-scope="scope">
                <div>{{ scope.row.agentId }}</div>
              </template></el-table-column>
              <el-table-column prop="appKey" label="AppKey" width="160"><template slot-scope="scope">
                <div>{{ scope.row.appKey }}</div>
              </template></el-table-column>
              <el-table-column prop="secret" label="密钥" width="160"><template slot-scope="scope">
                <div>{{ scope.row.secret }}</div>
              </template></el-table-column>
              <el-table-column prop="avatar" label="IP" width="160"><template slot-scope="scope">
                <div>{{ scope.row.avatar }}</div>
              </template></el-table-column>
              <el-table-column prop="corpToken" label="状态"><template slot-scope="scope">
                <div>{{ scope.row.corpToken === 'authorized' ? "永久授权" : (scope.row.corpToken === 'trial' ? "试用" : "未授权") }}</div>
              </template>
              </el-table-column>
              <el-table-column prop="updateDate" label="试用日期"><template slot-scope="scope">
                <div>{{ scope.row.updateDate }}</div>
              </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template slot-scope="scope">
                  <el-dropdown size="mini" type="primary" @command="handleApplicationCommand($event,scope.row)">
                    <el-button type="primary">
                      更多<i class="el-icon-arrow-down el-icon--right" />
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="editor">编辑</el-dropdown-item>
                      <el-dropdown-item v-if="scope.row.status !== 'enable'" command="enable">启用</el-dropdown-item>
                      <el-dropdown-item v-if="scope.row.status === 'enable'" command="disable">停用</el-dropdown-item>
                      <el-dropdown-item v-if="scope.row.status === 'enable'" command="certificate">授权证书下载</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>

                </template>
              </el-table-column>

            </el-table>

            <h2>授权第三方开放平台</h2>

            <el-table :data="props.row.appCompanyData" stripe border style="width: 100%">
              <el-table-column prop="appId" label="编号" width="60"><template slot-scope="scope">
                <div>{{ scope.row.appId }}</div>
              </template>
              </el-table-column>
              <el-table-column prop="appName" label="名称" width="160"><template slot-scope="scope">
                <div>{{ scope.row.appName }}</div>
              </template></el-table-column>
              <el-table-column prop="appKey" label="微信公众号" width="200"><template slot-scope="scope">
                <div>
                  <div>
                    <div v-for="(_item,_index) in scope.row.relation['weixin']" :key="_index">{{ _item.applicationName }}</div>
                  </div>
                  <div @click="onVisibleApplicationRelationDrawer(scope.row,'weixin')">编辑</div>
                </div>
              </template></el-table-column>
              <el-table-column prop="secret" label="微信小程序" width="200"><template slot-scope="scope">
                <div>
                  <div>
                    <div v-for="(_item,_index) in scope.row.relation['wxapp']" :key="_index">{{ _item.applicationName }}</div>
                  </div>
                  <div @click="onVisibleApplicationRelationDrawer(scope.row,'wxapp')">编辑</div>
                </div>
              </template></el-table-column>
              <el-table-column prop="series" label="企业微信（自建）" width="200"><template slot-scope="scope">
                <div>
                  <div>
                    <div v-for="(_item,_index) in scope.row.relation['qywx.self']" :key="_index">{{ _item.applicationName }}【<span @click="onSynchronizationQyWx(_item)">同步用户</span>】</div>
                  </div>
                  <div @click="onVisibleApplicationRelationDrawer(scope.row,'qywx.self')">编辑</div>
                </div>
              </template></el-table-column>
              <el-table-column prop="deadline" label="企业微信（代开发）" width="200"><template slot-scope="scope">
                <div>
                  <div>
                    <div v-for="(_item,_index) in scope.row.relation['qywx.parent']" :key="_index">{{ _item.applicationName }}</div>
                  </div>
                  <div @click="onVisibleApplicationRelationDrawer(scope.row,'qywx.parent')">编辑</div>
                </div>
              </template>
              </el-table-column>
              <el-table-column prop="deadline" label="短信" width="200"><template slot-scope="scope">
                <div>
                  <div>
                    <div v-for="(_item,_index) in scope.row.relation['alisms']" :key="_index">{{ _item.applicationName }}</div>
                  </div>
                  <div @click="onVisibleApplicationRelationDrawer(scope.row,'alisms')">编辑</div>
                </div>
              </template>
              </el-table-column>
              <el-table-column prop="deadline" label="邮件" width="200"><template slot-scope="scope">
                <div>
                  <div>
                    <div v-for="(_item,_index) in scope.row.relation['email']" :key="_index">{{ _item.applicationName }}</div>
                  </div>
                  <div @click="onVisibleApplicationRelationDrawer(scope.row,'email')">编辑</div>
                </div>
              </template>
              </el-table-column>
            </el-table>

          </template>
        </el-table-column>
        <el-table-column prop="companyId" label="编号" width="80"><template slot-scope="scope">
          <div>{{ scope.row.companyId }}</div>
        </template>
        </el-table-column>
        <el-table-column prop="companyName" label="名称"><template slot-scope="scope">
          <div>{{ scope.row.companyName }}</div>
        </template></el-table-column>
        <el-table-column prop="address" label="地址"><template slot-scope="scope">
          <div>{{ scope.row.address }}</div>
        </template></el-table-column>
        <el-table-column prop="website" label="域名"><template slot-scope="scope">
          <div>{{ scope.row.website }}</div>
        </template></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <i v-if="scope.row.status !== 1" class="el-icon-remove-outline" />
            <i v-if="scope.row.status === 1" class="el-icon-circle-check" />
            <span style="margin-left: 10px">{{ scope.row.status === 1 ? "发布" : "停用" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template slot-scope="props">
            <el-dropdown size="mini" type="primary" @command="handleCommand($event,props.row)">
              <el-button type="primary">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="props.row.status !== 1" command="editor">编辑</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status !== 1" command="delete">删除</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status !== 1" command="enable">启用</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status === 1" command="disable">停用</el-dropdown-item>
                <el-dropdown-item v-if="props.row.status === 1" command="app">应用</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footerBox">
      <el-pagination background :current-page="page" :page-sizes="pageSize" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-drawer title="应用绑定" :visible.sync="appDrawer" size="650px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <div class="drawer-box">
          <el-transfer v-model="appCompanyData" :data="appData" :props="{key: 'appId',label: 'appName' }" :titles="['可用应用', '已用应用']" />
        </div>
        <div class="drawer-btn">
          <el-button class="el-icon-check" @click="onSaveRoleMenu">保存</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer title="第三方开放平台绑定" :visible.sync="applicationDrawer" size="650px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <div class="drawer-box">
          <el-transfer v-model="applicationRelationData" :data="applicationData[applicationClassify]" :props="{key: 'applicationId',label: 'applicationName' }" :titles="['可用应用', '已用应用']" />
        </div>
        <div class="drawer-btn">
          <el-button class="el-icon-check" @click="onSaveApplicationRelation">保存</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer title="授权设置" :visible.sync="certificateDrawer" size="450px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <div class="drawer-box">
          <el-form label-position="left" class="demo-table-expand">
            <el-form-item label="授权方式">
              <el-radio v-model="corpToken" label="authorized">永久授权</el-radio>
              <el-radio v-model="corpToken" label="trial">试用授权</el-radio>
            </el-form-item>
            <el-form-item v-if="corpToken === 'trial'" label="授权日期">
              <el-date-picker v-model="deadline" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" format="yyyy-MM-dd" />
            </el-form-item>

          </el-form>
          <form ref="certificateDownLoadForm" method="post" :action="action" target="_blank">
            <input type="hidden" name="status" :value="corpToken">
            <input v-if="corpToken === 'trial'" type="hidden" name="authDateTime" :value="deadline + ' 23:59:59'">
            <input type="hidden" name="appId" :value="appId">
            <input type="hidden" name="companyId" :value="companyId">
            <input type="hidden" name="appkey" :value="appkey">
            <input type="hidden" name="companyName" :value="companyName">
            <input type="hidden" name="appName" :value="appName">
            <input type="hidden" name="secret" :value="secret">
            <input type="hidden" name="series" :value="series">
          </form>
        </div>
        <div class="drawer-btn">
          <el-button class="el-icon-check" @click="onCertificateDownLoad">保存&下载</el-button>
        </div>
      </div>
    </el-drawer>

    <a ref="updateRoleHref" :href="'https://'+website+'/admin/updateRole'" target="_blank" />

    <el-drawer title="应用编辑" :visible.sync="detailDrawer" size="450px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <el-form label-position="left" class="demo-table-expand">
          <el-form-item label="名称">
            <el-input v-model="model.companyName" type="text" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="model.address" type="text" />
          </el-form-item>
          <el-form-item label="域名">
            <el-input v-model="model.website" type="text" />
          </el-form-item>
          <el-form-item label="">
            <el-button class="el-icon-check" @click="onSave">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <el-drawer title="应用编辑" :visible.sync="detailApplicationDrawer" size="450px" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <el-form label-position="left" class="demo-table-expand">
          <el-form-item label="名称">
            <el-input v-model="modelApplication.applicationName" type="text" />
          </el-form-item>
          <el-form-item label="">
            <el-button class="el-icon-check" @click="onSaveApplication">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <weixinQrcodeComponents />
  </div>
</template>

<script>
import request from '@/utils/request'
import weixinQrcodeComponents from '@/views/components/weixin-qrcode-components.vue'
export default {
  name: 'SaasCompany',
  components: { weixinQrcodeComponents },
  data () {
    return {
      keyword: null, page: 1, limit: 10, pageSize: [10, 20, 30, 50, 100, 200, 300, 500], data: [], loading: false, total: 0, model: { companyId: 0, companyName: null, address: null }, appData: [], appDrawer: false, applicationDrawer: false, applicationClassify: null, certificateDrawer: false, detailDrawer: false, appCompanyData: [], appId: null, companyId: null, appName: null, companyName: null, deadline: null, appkey: null, secret: null, series: null, status: null, website: null, action: process.env.VUE_APP_BASE_API + '/certificate.download', applicationData: {}, applicationRelationData: [], relationAppId: null, relationCompanyId: null, allApplicationRelationData: [], corpToken: null/** 授权状态 */, applicationId: null, detailApplicationDrawer: false, modelApplication: {}
    }
  },
  mounted () {
    this.loadApplication()
  },
  methods: {
    loadApplication () {
      request({
        url: '/admin/findSysMobileApplication', data: { limit: -1, status: 'enable' }
      }).then(res => {
        res.data.forEach(item => {
          if (!this.applicationData[item.classify]) this.applicationData[item.classify] = []
          this.applicationData[item.classify].push(item)
        })

        this.loadData()
      })
    },
    loadData () {
      this.allApplicationRelationData = []
      request({
        url: '/admin/allApplicationRelation', data: { limit: -1, status: 'enable' }
      }).then(res2 => {
        res2.data.forEach(item2 => {
          this.allApplicationRelationData.push(item2)
        })

        this.loadSaasSysApp()
      })
    },
    loadSaasSysApp () {
      request({
        url: '/admin/findSaasSysApp', data: { limit: -1 }
      }).then(res => {
        this.appData = res.data
        this.loadCompanyData()
      })
    },
    loadCompanyData (obj) {
      if (this.loading) return
      if (obj) {
        if (obj.page) this.page = obj.page
      }
      this.loading = true
      this.data = []
      var that = this
      request({
        url: '/admin/findSaasCompany', data: { page: this.page, limit: this.limit, keyword: this.keyword }
      }).then(res => {
        var ids = []
        res.data.forEach(item => {
          item.children = []
          item.appCompanyData = []
          item.applicationyAppCompanyData = []
          that.data.push(item)
          ids.push(item.companyId)
        })
        this.total = parseInt(res.count)
        if (ids.length > 0) {
          request({
            url: '/admin/findSaasAppCompany', data: { ids: ids.join(','), limit: -1}
          }).then(res2 => {
            if (res2.data && res2.data.length > 0) {
              this.data.forEach(item => {
                res2.data.forEach(item2 => {
                  if (item.companyId === item2.companyId) {
                    this.appData.forEach(item3 => {
                      if (item3.appId === item2.appId) {
                        item2.appName = item3.appName
                        item2.certificate = false
                      }
                    })
                    item2.companyName = item.companyName

                    item.children.push(item2)
                    var b = true
                    item.appCompanyData.forEach(acd => {
                      if (acd.companyId === item2.companyId && acd.appId === item2.appId) {
                        b = false
                      }
                    })
                    if (b) {
                      item2.relation = {}
                      item2.relation['weixin'] = []
                      item2.relation['wxapp'] = []
                      item2.relation['qywx.self'] = []
                      item2.relation['qywx.parent'] = []
                      item2.relation['alisms'] = []
                      item2.relation['email'] = []

                      this.allApplicationRelationData.forEach(r => {
                        if (parseInt(r.appId) === parseInt(item2.appId) && parseInt(r.companyId) === parseInt(item2.companyId)) {
                          item2.relation[r.classify].push(r)
                        }
                      })
                      item.appCompanyData.push(item2)
                    }
                  }
                })
              })
            }
          })

          request({
            url: '/admin/findApplicationAppCompany', data: { companyIds: ids.join(','), classify: 'hysaas', limit: -1 }
          }).then(res4 => {
            if (res4.data) {
              var app_company_ids = []
              this.data.forEach(item => {
                res4.data.forEach(item4 => {
                  if (item.companyId === item4.companyId) {
                    item4.companyName = item.companyName
                    app_company_ids.push(item4.appId + '_' + item4.companyId + '_' + item4.agentId)
                    console.log('this.allApplicationRelationData', JSON.stringify(this.allApplicationRelationData))
                    this.appData.forEach(itemApp => {
                      if (item4.appId === itemApp.appId) {
                        item4.appName = itemApp.appName
                      }
                    })
                    item.applicationyAppCompanyData.push(item4)
                  }
                })
              })

              if (app_company_ids.length > 0) {
                request({
                  url: '/certificate.exist', data: { app_company_ids: app_company_ids.join(',') }
                }).then(res3 => {
                  if (res3.data) {
                    res3.data.forEach(item4 => {
                      var ac = item4.split('_')
                      var _appId = ac[0]
                      var _companyId = ac[1]
                      var _agentId = ac[2] // 序列号
                      this.data.forEach(item => {
                        item.applicationyAppCompanyData.forEach(item2 => {
                          if (parseInt(item2.appId) === parseInt(_appId) && parseInt(item2.companyId) === parseInt(_companyId) && item2.agentId === _agentId) {
                            item2.certificate = true
                          }
                        })
                      })
                    })
                  }
                })
              }
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    onAdd () {
      this.detailDrawer = true
      this.model = { companyId: 0, companyName: null, address: null }
    },
    handleCommand (command, item) {
      if (command === 'editor') {
        this.detailDrawer = true
        this.model = item
      } else if (command === 'delete') {
        this.onDelete(item)
      } else if (command === 'enable') {
        this.onEnable(item)
      } else if (command === 'disable') {
        this.onDisable(item)
      } else if (command === 'app') {
        this.onInsertApp(item.companyId)
      }
    },
    handleApplicationCommand (command, item) {
      if (command === 'editor') {
        this.detailApplicationDrawer = true
        this.modelApplication = item
      } else if (command === 'enable') {
        this.onApplicationEnable(item)
      } else if (command === 'disable') {
        this.onApplicationDisable(item)
      } else if (command === 'certificate') {
        this.onCertificateEvent(item)
      }
    },
    onSave () {
      var that = this
      request({
        url: this.model.companyId === 0 ? '/admin/insertSysCompany' : '/admin/updateSysCompany', data: this.model
      }).then(res => {
        if (res.code === 1) {
          that.detailDrawer = false
          that.loadCompanyData()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    onSaveApplication() {
      request({
        url: '/admin/updateSysMobileApplication', data: this.modelApplication
      }).then(res => {
        if (res.code === 1) {
          this.detailApplicationDrawer = false
          this.$message({
            showClose: true,
            message: res.msg,
            type: (res.code === 1) ? 'success' : 'warning',
            onClose: function () {

            }
          })
        }
        this.loadCompanyData()
      })
    },
    onInsertApp (companyId) {
      this.companyId = companyId
      this.appDrawer = true
      this.appCompanyData = []
      // 查询已绑定的应用
      request({
        url: '/admin/findAppByCompanyId', data: { companyId: companyId }
      }).then(res => {
        res.data.forEach(item => {
          this.appCompanyData.push(item.appId)
        })
        // console.log('appCompanyData', JSON.stringify(this.appCompanyData))
      })
    },
    onEnable (item) {
      this.$confirm('确认要发布当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysCompany', data: { companyId: item.companyId, status: 1 }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadCompanyData()
        })
      })
    },
    onDisable (item) {
      this.$confirm('确认要停止当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysCompany', data: { companyId: item.companyId, status: 0 }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadCompanyData()
        })
      })
    },
    onApplicationEnable (item) {
      this.$confirm('确认要发布当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysMobileApplication', data: { applicationId: item.applicationId, status: 'enable', classify: 'hysaas' }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadCompanyData()
        })
      })
    },
    onApplicationDisable (item) {
      this.$confirm('确认要停止当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/updateSysMobileApplication', data: { applicationId: item.applicationId, status: 'disable', classify: 'hysaas' }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadCompanyData()
        })
      })
    },
    onSynchronizationQyWx (item) {
      item.applicationClassify = item.classify
      console.log('onSynchronizationQyWx', JSON.stringify(item))
      request({
        url: '/admin/synchronize.qy.user', data: item
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    onDelete (item) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/deleteSysCompany', data: { companyId: item.companyId }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadCompanyData()
        })
      })
    },
    onResetAppSecret (item) {
      this.$confirm('确认要更新当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/admin/resetAppByCompanyAppKeyAndSecret', data: { companyId: item.companyId, appId: item.appId }
        }).then(res => {
          if (res.code === 1) {
            item.appKey = res.model.appKey
            item.secret = res.model.secret
            this.$message({
              showClose: true,
              message: res.msg,
              type: (res.code === 1) ? 'success' : 'warning',
              onClose: function () {

              }
            })
          }
          this.loadData()
        })
      })
    },
    handleSizeChange (val) { // 切换页码条数，重新返回首页加载数据
      this.limit = val
      this.page = 1
      this.loadData()
    },
    handleCurrentChange (val) { // 切换当前页码，查询加载数据
      this.page = val
      this.loadData()
    },
    onSaveRoleMenu () {
      request({
        url: '/admin/saveAppByCompanyId', data: { companyId: this.companyId, appIds: this.appCompanyData.join(',') }
      }).then(res => {
        this.appDrawer = false
        this.$message({
          showClose: true,
          message: res.msg,
          type: (res.code === 1) ? 'success' : 'warning',
          onClose: function () {

          }
        })
      })
    },
    onChangeFile (item) {
      const inputFile = this.$refs['uploadFile_' + item.appId + '_' + item.companyId].files[0]
      var form = new FormData()
      form.append('file', inputFile)
      form.append('appId', item.appId)
      form.append('companyId', item.companyId)
      request({
        url: '/certificate.upload', form: form
      }).then(res => {
        console.log('res', JSON.stringify(res))
        if (res.code === 1) {
          item.certificate = true
          request({
            url: '/admin/saveApplicationAppCompany', data: { appId: res.model.appId, companyId: res.model.companyId, series: res.model.series, classify: 'hysaas', applicationName: item.companyName + '-' + item.appName }
          }).then(res2 => {
            if (res2.code === 1) this.loadData()
          })
        }
      })
    },
    onCertificateEvent (item) {
      this.applicationId = item.applicationId
      this.appId = item.appId
      this.companyId = item.companyId
      this.companyName = item.companyName
      this.appName = item.appName
      this.certificateDrawer = true
      this.corpToken = item.corpToken
      this.deadline = item.deadline
      this.appkey = item.appKey
      this.secret = item.secret
      this.series = item.agentId
    },
    async onCertificateDownLoad () {
      // await request({
      //   url: '/admin/updateSaasAppCompany', data: { appId: this.appId, companyId: this.companyId, status: this.status, deadline: this.deadline }
      // })
      await request({
        url: '/admin/editorHySaasMobileApplication', data: { applicationId: this.applicationId, appId: this.appId, companyId: this.companyId, corpToken: this.corpToken, updateDate: (this.corpToken === 'trial' ? this.deadline + ' 23:59:59' : null), classify: 'hysaas', appKey: this.appkey, secret: this.secret }
      })
      this.$refs.certificateDownLoadForm.submit()
    },
    onVisibleApplicationRelationDrawer (item, _classify) {
      this.applicationClassify = _classify
      this.applicationDrawer = true
      this.applicationRelationData = []
      this.relationAppId = item.appId
      this.relationCompanyId = item.companyId
      // console.log("visible", JSON.stringify(item))
      // 开始请求接口
      request({
        url: '/admin/findApplicationRelation', data: { appId: item.appId, companyId: item.companyId, classify: _classify, status: 'enable' }
      }).then(res => {
        res.data.forEach(v => {
          this.applicationRelationData.push(v.applicationId)
        })
      })
    },
    onSaveApplicationRelation () {
      request({
        url: '/admin/saveApplicationRelation', data: { appId: this.relationAppId, companyId: this.relationCompanyId, applicationIds: this.applicationRelationData.join(','), classify: this.applicationClassify }
      }).then(res => {
        if (res.code === 1) {
          this.applicationDrawer = false
          this.loadSaasSysApp()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/views/saas/style/css.scss";
</style>

