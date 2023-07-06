<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <el-input v-model="findSysCompanyQuery.keyword" v-permission="['Search']" placeholder="请输入公司名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="companyList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" prop="companyId" label="公司ID" width="100" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" prop="companyName" label="公司名称" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" prop="linkMan" label="联系人" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" prop="mobile" label="联系电话" />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" prop="address" label="地址" />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" prop="status" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-permission="['StatusSwitch']"
              :value="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="changeMenuStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="操作" width="380">
          <template slot-scope="row">
            <el-button v-permission="['AccreditApp']" size="mini" type="primary" @click="onAppCompany(row)">
              APP授权
            </el-button>
            <el-button v-permission="['AccreditLoginIndex']" size="mini" type="primary" @click="onLoginIndexDialog(row)">
              登录首页配置
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
    <pagination v-show="companyTotal > 0" :auto-scroll="false" :total="companyTotal" :page.sync="findSysCompanyQuery.page" :limit.sync="findSysCompanyQuery.limit" @pagination="findSysCompany" />
    <el-dialog title="授权APP" :visible.sync="showDialog" width="40%" top="5vh">
      <div class="equipment_table">
        <el-form ref="companyBindAppIdForm" :model="companyBindAppIdQuery" :rules="companyBindAppIdFormRules" label-width="100px" class="select-width-fill">
          <el-form-item label="APP" prop="appId">
            <el-select
              v-model="companyBindAppIdQuery.appId"
              filterable
              placeholder="请选择APP"
            >
              <el-option
                v-for="item in appList"
                :key="item.appId"
                :label="item.appName"
                :value="item.appId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="companyBindAppIdQuery.status"
              filterable
              placeholder="请选择状态"
              @change="changeStatus"
            >
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item v-if="companyBindAppIdQuery.status === 2" label="结束时间" prop="deadline">
            <el-date-picker
              v-model="companyBindAppIdQuery.deadline"
              type="datetime"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="数据拷贝" prop="copyCompanyId">
            <el-select
              v-model="copySysAppCompanyDataVal.copyCompanyId"
              filterable
              placeholder="请选择拷贝对象"
              clearable
            >
              <el-option
                v-for="item in findSysCompanyList"
                :key="item.companyId"
                :label="item.companyName"
                :value="item.companyId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button v-permission="['DeleteCompanyApp']" class="filter-item" type="danger" @click="deleteBind">删 除</el-button>
        <el-button class="filter-item" type="primary" @click="comfirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="登录首页配置" :visible.sync="showLoginIndexDialog" width="40%" top="5vh">
      <div class="equipment_table">
        <el-form ref="companyBindAppIdForm" :model="companyBindAppIdQuery" :rules="companyBindAppIdFormRules" label-width="100px" class="select-width-fill">
          <el-form-item label="首页类型" prop="indexMenuId">
            <el-select v-model="indexMenu.indexType" class="filter-item" @change="changeItemType">
              <el-option
                v-for="item in indexType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="首页跳转页面" prop="indexMenuId">
            <AiTreeInput
              :data-reload-key="reloadKey"
              :level-start-num="1"
              :field="{'id':'menuId','name':'menuName','parent':'parentId'}"
              remote="/admin/findSysMenu"
              infoapi="/admin/getSysMenu"
              :configuration-data="configurationData"
              placeholder="请输入上层菜单"
              :param="{menuType: 'menu,module', appId, 'classify': indexMenu.indexType === 1 ? 'pc' : 'wxapp', version: 1}"
              :bind-value="indexMenu.indexMenuId"
              @input="inputParent"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showLoginIndexDialog = false">取 消</el-button>
        <el-button v-permission="['DeleteAccreditLoginIndex']" class="filter-item" type="danger" @click="deleteLoginIndex">删 除</el-button>
        <el-button class="filter-item" type="primary" @click="comfirmLoginIndex">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { formatTime } from '@/utils/utils'
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
import ListControl from '@/components/ListControl'

export default {
  name: 'CompanyIndex',
  components: { Pagination, AiTreeInput, ListControl },
  data() {
    const validateDeadline = (rule, value, callback) => {
      if (this.companyBindAppIdQuery.status === 2 && value === '') {
        callback(new Error('请选择授权结束时间'))
      } else {
        callback()
      }
    }
    return {
      listLoading: false,
      findSysCompanyQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      findSysCompanyVal: {
        page: 1,
        limit: 10
      },
      findSysCompanyList: [],
      companyList: [],
      companyTotal: 0,
      showDialog: false,
      appList: [],
      companyBindAppIdQuery: {
        appId: '',
        status: '',
        deadline: '',
        companyId: ''
      },
      copySysAppCompanyDataVal: {
        // page: 1,
        // limit: -1,
        copyCompanyId: '', // 要复制的公司id
        saveCompanyId: '', // 保存的公司id
        saveAppId: '' // 保存appid
        // keyword: ''
      },
      statusList: [
        {
          label: '无效',
          value: 0
        },
        {
          label: '永久有效',
          value: 1
        },
        {
          label: '有效',
          value: 2
        }
      ],
      isEdit: false,
      companyBindAppIdFormRules: {
        appId: [{ required: true, message: '请选择App', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
        deadline: [{ required: false, trigger: 'blur', validator: validateDeadline }]
      },
      showLoginIndexDialog: false,
      reloadKey: 'reloadKey',
      configurationData: 0, // 历史菜单id
      configurationId: 0,
      appId: '',
      inputParentId: '',
      indexMenu: {
        appId: '',
        companyId: '',
        indexMenuId: 1,
        indexType: 1
      },
      indexMenuId: '',
      indexType: [
        { value: 1, label: 'PC' },
        { value: 2, label: '小程序' }
      ],
      // 显示控制数据 start
      checkList: ['公司ID', '公司名称MAC', '联系人', '联系电话', '地址', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.findSysCompanyQuery = pageQuery
    }
  },
  mounted() {
    this.findSysCompany()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 进入创建
    onCreate() {
      const data = { ...this.findSysCompanyQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'AddCompany'
      })
    },
    // 进入编辑
    onEdit(val) {
      const data = { ...this.findSysCompanyQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'UpdateCompany',
        query: {
          id: val.row.companyId
        }
      })
    },
    // 搜索
    onFilter() {
      this.findSysCompany()
    },
    // 删除
    onDelete(val) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.company.deleteSysCompany, data: { companyId: val.row.companyId }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.findSysCompany()
          }
        })
      })
    },
    findSysCompany() {
      request({
        url: api.company.findSysCompany, data: this.findSysCompanyQuery
      }).then(res => {
        if (res.code === 1) {
          this.companyList = res.data
          this.companyTotal = Number(res.count)
        }
      })
    },
    // 修改状态
    changeMenuStatus(val) {
      val.status = val.status === 1 ? 0 : 1
      request({
        url: api.company.updateSysCompany, data: val
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        }
      })
    },
    onAppCompany(val) {
      this.copySysAppCompanyDataVal.copyCompanyId = ''
      this.$set(this.companyBindAppIdQuery, 'companyId', val.row.companyId)
      this.showDialog = true
      this.findSysAppCompany()
      this.findSysApp()
      this.findSysCompanyNum(val)
    },
    findSysCompanyNum(val) {
      this.findSysCompanyList = []
      request({
        url: api.company.findSysCompany, data: { ...this.findSysCompanyVal }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            if (item.companyId !== val.row.companyId) {
              this.findSysCompanyList.push(item)
            }
          })
        }
      })
    },
    async comfirm() {
      this.$refs['companyBindAppIdForm'].validate(async(valid) => {
        if (valid) {
          const data = { ...this.companyBindAppIdQuery }
          this.$set(this.copySysAppCompanyDataVal, 'saveAppId', this.companyBindAppIdQuery.appId)
          this.$set(this.copySysAppCompanyDataVal, 'saveCompanyId', this.companyBindAppIdQuery.companyId)
          if (this.copySysAppCompanyDataVal.copyCompanyId !== '') {
            request({
              url: api.sys.copySysAppCompanyData,
              data: { ...this.copySysAppCompanyDataVal }
            }).then(async res => {
              if (res.code === 1) {
                this.$message.success('数据拷贝成功')
                await request({
                  url: api.sys.copyCmdbItemType,
                  data: { ...this.copySysAppCompanyDataVal }
                })
              } else {
                this.$message.error('数据拷贝失败')
              }
            })
          }
          if (this.companyBindAppIdQuery.status !== 2) {
            delete data.deadline
          } else {
            if (typeof data.deadline !== 'string') data.deadline = formatTime(data.deadline)
          }
          const requestApi = this.isEdit ? api.sys.updateSysAppCompany : api.sys.insertSysAppCompany
          let res = await request({
            url: requestApi, data: data
          })
          if (res.code === 1) {
            this.showDialog = false
            this.$message.success(res.msg)
          } else {
            this.$message.error(res.msg)
          }
        }
      })
    },
    changeStatus(val) {
      if (val !== 2) {
        this.$set(this.companyBindAppIdQuery, 'deadline', '')
      }
    },
    findSysAppCompany() {
      request({
        url: api.sys.findSysAppCompany, data: { companyId: this.companyBindAppIdQuery.companyId }
      }).then(res => {
        if (res.code === 1) {
          this.isEdit = res.data.length > 0
          if (res.data.length > 0) {
            const form = {}
            Object.keys(this.companyBindAppIdQuery).forEach(key => {
              form[key] = res.data[0][key]
            })
            form['deadline'] = `${res.data[0]['deadline']} 8:00:00` // 没有返回到具体钟点，默认添加为8点
            this.companyBindAppIdQuery = form
          } else {
            this.$refs['companyBindAppIdForm'].resetFields()
          }
        }
      })
    },
    findSysApp() {
      request({
        url: api.sysApp.findSysApp, data: {
          parentId: 0
        }
      }).then(res => {
        if (res.code === 1) {
          this.appList = res.data
        }
      })
    },
    deleteBind() {
      this.$confirm('确认要取消公司授权App吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.sys.deleteSysAppCompany, data: {
            companyId: this.companyBindAppIdQuery.companyId
          }
        }).then(res => {
          if (res.code === 1) {
            this.showDialog = false
            this.findSysCompany()
            this.$message.success(res.msg)
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    async onLoginIndexDialog(val) {
      this.reloadKey = this.$tool.guid()
      this.$set(this.companyBindAppIdQuery, 'companyId', val.row.companyId)
      Object.keys(this.indexMenu).forEach(key => {
        if (key === 'indexMenuId' || key === 'indexType') {
          this.$set(this.indexMenu, `${key}`, 1)
        } else {
          this.$set(this.indexMenu, `${key}`, '')
        }
      })
      request({
        url: api.sys.findSysAppCompany, data: { companyId: this.companyBindAppIdQuery.companyId }
      }).then(async res => {
        if (res.code === 1 && res.data && res.data.length > 0) {
          this.$set(this.indexMenu, 'appId', res.data[0].appId)
          this.$set(this.indexMenu, 'companyId', this.companyBindAppIdQuery.companyId)
          await this.getIndexConfigData()
          this.showLoginIndexDialog = true
        } else {
          this.$message({
            type: 'info',
            message: '请先关联APP'
          })
        }
      })
    },
    // 选择菜单
    inputParent(val) {
      this.configurationData = Number(val)
      this.$set(this.indexMenu, 'indexMenuId', val)
    },
    async findHyitIndex(query) {
      return await request({
        url: api.hyitIndex.findHyitIndex,
        data: query
      })
    },
    comfirmLoginIndex() {
      if (this.indexMenu.indexMenuId === 1) return this.$message('请选择菜单')
      request({
        url: this.indexMenuId ? api.hyitIndex.updateHyitIndex : api.hyitIndex.insertHyitIndex,
        data: this.indexMenuId ? { id: this.indexMenuId, ...this.indexMenu } : this.indexMenu
      }).then(res => {
        if (res.code === 1) {
          this.showLoginIndexDialog = false
          this.$message({
            type: 'success',
            message: '配置成功'
          })
        }
      })
    },
    deleteLoginIndex() {
      this.$confirm('确认要取消公司登录首页配置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.hyitIndex.deleteHyitIndex,
          data: { id: this.indexMenuId }
        }).then(res => {
          if (res.code === 1) {
            this.showLoginIndexDialog = false
            this.$message({
              type: 'success',
              message: '删除成功'
            })
          }
        })
      })
    },
    async changeItemType() {
      this.reloadKey = this.$tool.guid()
      await this.getIndexConfigData()
    },
    // 获取首页配置数据
    async getIndexConfigData() {
      const loginIndex = await this.findHyitIndex({
        appId: this.indexMenu.appId,
        companyId: this.indexMenu.companyId,
        indexType: this.indexMenu.indexType
      })
      if (loginIndex.code === 1 && loginIndex.data && loginIndex.data.length > 0) {
        this.indexMenu = loginIndex.data[0]
        this.indexMenuId = loginIndex.data[0].id
      } else {
        delete this.indexMenu.id
        this.$set(this.indexMenu, 'indexMenuId', 1)
        this.configurationData = 0
        this.indexMenuId = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
