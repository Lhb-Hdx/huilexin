<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="assetsInfoForm" :model="assetsInfoForm" :rules="assetsInfoRules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <div class="card-form-group">
                <div class="form-group-header">
                  基础信息
                </div>
                <div class="form-group-body">
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="名称" prop="assetsName">
                      <el-input v-model.trim="assetsInfoForm.assetsName" placeholder="请输入资产名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="品牌" prop="brandCatId">
                      <el-cascader
                        v-model="assetsInfoForm.brandCatId"
                        class="w-100"
                        placeholder="品牌"
                        :options="brandTreeList"
                        :props="{ value: 'catId', label: 'catName', checkStrictly: true }"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="资产类别" prop="assetsCatId">
                      <el-cascader
                        v-model="assetsInfoForm.assetsCatId"
                        class="w-100"
                        placeholder="资产类别"
                        :options="assetsTreeList"
                        :props="{ value: 'catId', label: 'catName', checkStrictly: true }"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="对应配置类目" prop="cmdbItemTypeId">
                      <el-cascader
                        v-model="assetsInfoForm.cmdbItemTypeId"
                        class="w-100"
                        placeholder="请选择配置类目"
                        disabled
                        :options="configItemTreeList"
                        :props="{ value: 'id', label: 'name', checkStrictly: true }"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="序列号" prop="assetsSn">
                      <el-input v-model.trim="assetsInfoForm.assetsSn" placeholder="请输入序列号" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="型号" prop="model">
                      <el-input v-model.trim="assetsInfoForm.model" placeholder="请输入型号" />
                    </el-form-item>
                  </el-col>
                  <el-col>
                    <el-form-item label="配置项图片">
                      <FileUpload
                        v-permission="['ConfigItemImgUpload']"
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
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="配置" prop="assetsDesc">
                      <el-input v-model.trim="assetsInfoForm.assetsDesc" placeholder="请输入配置" />
                    </el-form-item>
                  </el-col>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
        <el-form ref="assetsPurchaseForm" :model="assetsPurchaseForm" :rules="assetsPurchaseRules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <div class="card-form-group">
                <div class="form-group-header">
                  采购管理
                </div>
                <div class="form-group-body">
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="供应商" prop="supplierId">
                      <el-select
                        v-model="assetsPurchaseForm.supplierId"
                        placeholder="请选择供应商"
                        style="width: 100%;"
                        @change="findAssetsSupplierEmploye"
                      >
                        <el-option
                          v-for="item in supplierList"
                          :key="item.supplierId"
                          class="w-100"
                          :label="item.supplierName"
                          :value="item.supplierId"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="供应商联系人">
                      <el-select
                        v-model="assetsPurchaseForm.userId"
                        placeholder="请选择供应商联系人"
                        style="width: 100%;"
                      >
                        <el-option
                          v-for="item in supplierEmployeList"
                          :key="item.id"
                          class="w-100"
                          :label="item.employeName"
                          :value="item.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="净残值（￥）" prop="purchasePrice">
                      <el-input v-model.trim="assetsPurchaseForm.purchasePrice" type="number" :min="0" placeholder="请输入净残值" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="采购金额（￥）" prop="price">
                      <el-input v-model.trim="assetsPurchaseForm.price" type="number" :min="0" placeholder="请输入金额" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="采购时间" prop="purchaseDate">
                      <el-date-picker
                        v-model="assetsPurchaseForm.purchaseDate"
                        class="w-100"
                        type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="保修期限" prop="purchaseOutdate">
                      <el-date-picker
                        v-model="assetsPurchaseForm.purchaseOutdate"
                        class="w-100"
                        type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                      />
                    </el-form-item>
                  </el-col>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
        <el-form ref="assetsUseForm" :model="assetsUseForm" :rules="assetsUseFormRules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <div class="card-form-group">
                <div class="form-group-header">
                  使用管理
                </div>
                <div class="form-group-body">
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="状态" prop="status">
                      <el-select
                        v-model="assetsUseForm.status"
                        placeholder="请选择使用状态"
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
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="所属部门" prop="organizationCatId">
                      <el-cascader
                        v-model="assetsUseForm.organizationCatId"
                        class="w-100"
                        placeholder="所属部门"
                        :options="orgTreeList"
                        :props="{ value: 'hyOrgId', label: 'hyOrgName', checkStrictly: true }"
                        @change="changeBeOrg"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="使用方式" prop="useTypeId">
                      <el-select
                        v-model="assetsUseForm.useTypeId"
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
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="使用部门" prop="departmentCatId">
                      <el-cascader
                        v-model="assetsUseForm.departmentCatId"
                        class="w-100"
                        placeholder="使用部门"
                        :options="orgTreeList"
                        :props="{ value: 'hyOrgId', label: 'hyOrgName', checkStrictly: true }"
                        @change="changeUseOrg"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="使用负责人" prop="userId">
                      <el-select
                        v-model="assetsUseForm.userId"
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
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="使用开始时间" prop="useStime">
                      <el-date-picker
                        v-model="assetsUseForm.useStime"
                        class="w-100"
                        type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="使用结束时间" prop="useEtime">
                      <el-date-picker
                        v-model="assetsUseForm.useEtime"
                        class="w-100"
                        type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="所在项目" prop="projectCatId">
                      <el-select
                        v-model="assetsUseForm.projectCatId"
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
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="所在位置" prop="location">
                      <el-input v-model.trim="assetsUseForm.location" placeholder="请输入所在位置" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="管理负责人" prop="manageId">
                      <el-select
                        v-model="assetsUseForm.manageId"
                        placeholder="请选择管理负责人"
                        style="width: 100%;"
                      >
                        <el-option
                          v-for="item in beOrgEmployeList"
                          :key="item.id"
                          class="w-100"
                          :label="item.userRealName"
                          :value="item.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="区域" prop="orgId">
                      <el-cascader
                        v-model="hyOrgId"
                        clearable
                        class="filter-item"
                        multiple="false"
                        :options="areaTreeArr"
                        :props="orgProps"
                      />

                    </el-form-item>
                  </el-col>
                  <!-- <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="管理人" prop="location">
                      <el-select
                        v-model="manageId"
                        placeholder="请输入管理人"
                        clearable
                        style="width: 100%;"
                      >
                        <el-option
                          v-for="item in sysUserList"
                          :key="Number(item.userId)"
                          class="w-100"
                          :label="item.realName"
                          :value="Number(item.userId)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col> -->

                  <el-col>
                    <el-form-item label="附件">
                      <FileUpload
                        v-permission="['UseAttachmentUpload']"
                        button-text="选择图片"
                        upload-type="pic"
                        file-type=".png,.jpg"
                        file-url-list-type="picture"
                        :limit="1"
                        :button-disabled="false"
                        :is-limit-file-size="true"
                        :file-max-size="1"
                        :file-url-list="dataFileList"
                        @emitFileList="getEmitUseAttachmentFileList"
                      />
                    </el-form-item>
                  </el-col>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-form label-width="120px">
            <el-row :gutter="12">
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
              </el-form-item>
            </el-row>
          </el-form>
        </el-col>
      </el-card>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import FileUpload from '@/components/Upload/file-upload'

export default {
  name: 'AssetsAddUpdate',
  components: {
    FileUpload
  },
  data() {
    // 自定义表单校验
    // 如果状态是使用中并且内容是空的时候会触发
    const validateDepartmentCatId = (rule, value, callback) => {
      if (this.assetsUseForm.status === 486 && value === '') {
        return callback(new Error('请选择使用部门'))
      }
      callback()
    }
    const validateUseTypeId = (rule, value, callback) => {
      if (this.assetsUseForm.status === 486 && value === '') {
        return callback(new Error('请选择使用方式'))
      }
      callback()
    }
    const validateUserId = (rule, value, callback) => {
      if (this.assetsUseForm.status === 486 && value === '') {
        return callback(new Error('请选择使用负责人'))
      }
      callback()
    }
    const validateUseStime = (rule, value, callback) => {
      if (this.assetsUseForm.status === 486 && value === '') {
        return callback(new Error('请选择使用开始时间'))
      }
      callback()
    }
    const validateUseEtime = (rule, value, callback) => {
      if (this.assetsUseForm.status === 486 && value === '') {
        return callback(new Error('请选择使用结束时间'))
      }
      callback()
    }
    return {
      assetsInfoForm: {
        assetsName: '',
        brandCatId: '',
        assetsCatId: '',
        assetsSn: '',
        model: '',
        assetsDesc: '',
        assetsImageUrl: '',
        cmdbItemTypeId: 12
      },
      // custodianId: '',
      manageId: '',
      assetsPurchaseForm: {
        supplierId: '',
        userId: '',
        purchasePrice: '',
        purchaseDate: '',
        purchaseOutdate: '',
        price: ''
      },
      assetsUseForm: {
        status: '',
        organizationCatId: '',
        manageId: '',
        useTypeId: '',
        departmentCatId: '',
        userId: '',
        useStime: '',
        useEtime: '',
        projectCatId: '',
        location: '',
        dataUrl: ''
      },
      orgProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      areaTreeArr: [],
      assetsInfoId: '', // 资产信息主键
      assetsPurchaseId: '', // 资产采购主键
      assetsInfoRules: {
        assetsName: [
          { required: true, message: '请输入资产名称', trigger: 'blur' }
        ],
        // brandCatId: [
        //   { required: true, message: '请选择品牌', trigger: 'blur' }
        // ],
        assetsCatId: [
          { required: true, message: '请选择资产类别', trigger: 'blur' }
        ],
        cmdbItemTypeId: [
          { required: true, message: '请选择配置项', trigger: 'blur' }
        ]
        // assetsSn: [
        //   { required: true, message: '请输入序列号', trigger: 'blur' }
        // ],
        // model: [
        //   { required: true, message: '请输入型号', trigger: 'blur' }
        // ]
      },
      assetsPurchaseRules: {},
      assetsUseFormRules: {
        departmentCatId: [
          { validator: validateDepartmentCatId, trigger: 'blur' }
        ],
        useTypeId: [
          { validator: validateUseTypeId, trigger: 'blur' }
        ],
        userId: [
          { validator: validateUserId, trigger: 'blur' }
        ],
        useStime: [
          { validator: validateUseStime, trigger: 'blur' }
        ],
        useEtime: [
          { validator: validateUseEtime, trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择资产使用状态', trigger: 'blur' }
        ]
      },
      loading: false,
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      fileList: [],
      dataFileList: [],
      findAssetsSupplierEmployeQuery: {
        supplierId: '',
        page: 1,
        limit: -1
      },
      findHrUserInfoQuery: {
        organizationCatId: '',
        page: 1,
        limit: -1
      },
      // 资产类型列表
      assetsTreeList: [],
      // 配置项列表
      configItemTreeList: [],
      // 匹配列表
      brandTreeList: [],
      // 供应商列表
      supplierList: [],
      // 供应商人员列表
      supplierEmployeList: [],
      // 资产状态列表
      assetsStatusList: [],
      // 资产使用方式列表
      assetsUseTypeList: [],
      // 部门列表
      orgTreeList: [],
      // 管理部门人员列表
      beOrgEmployeList: [],
      // 使用部门人员列表
      useOrgEmployeList: [],
      // 项目
      assetsProjectCatList: [],
      confirmLoading: false,
      // 原始使用信息 在编辑的时候把当前的资产的使用信息填到这里  保存的时候对比一下这个对象里面的信息跟填入的信息有没有不同有的话需要新增一条变更记录
      originalUse: {
        organizationCatId: '',
        manageId: '',
        useTypeId: '',
        departmentCatId: '',
        userId: '',
        useStime: '',
        useEtime: ''
      },
      isChangeUse: false,
      cmdbItemSourceType: 8,
      sysUserList: [],
      hyOrgId: ''
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    hyHostId() {
      return this.$route.query.hyHostId
    }

  },
  mounted() {
    if (this.$route.query.assetsId) this.getAssetsInfo()
    if (this.$route.query.purchaseId) this.getAssetsPurchase()
    if (this.$route.query.useId) this.getAssetsUse()
    this.loadOrgList() // 获取区域列表
    this.findBrandCat()
    this.findAssetsCat()
    this.findConfigItemCat()
    this.findAssetsSupplier()
    this.findAssetsStatusCat()
    this.findAssetsUseTypeCat()
    this.findOrganizationCat()
    this.findProjectCat()
    // this.findSysUser()
  },
  methods: {
    // 获取品牌
    findBrandCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_品牌' }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          // const firstLevel = res.data.findIndex(item => item.parentId === 0)
          // this.brandTreeList = listToTree(res.data, res.data[firstLevel].catId, res.data[firstLevel].catId, 'catId', 'parentId')
          const firstLevel = res.data.findIndex(item => item.catName === '品牌')
          this.brandTreeList = listToTree(res.data, res.data[firstLevel].catId, 0, 'catId', 'parentId')
          console.log(this.brandTreeList, 'this.brandTreeList')
        }
      })
    },
    // 获取资产类型
    findAssetsCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产类别' }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          // const firstLevel = res.data.findIndex(item => item.parentId === 0)
          // this.assetsTreeList = listToTree(res.data, res.data[firstLevel].catId, res.data[firstLevel].catId, 'catId', 'parentId')
          const firstLevel = res.data.findIndex(item => item.catName === '资产类别')
          this.assetsTreeList = listToTree(res.data, res.data[firstLevel].catId, 0, 'catId', 'parentId')
        }
      })
    },
    // 获取配置项
    findConfigItemCat() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.configItemTreeList = listToTree(res.data, 0, 0, 'id', 'parentId')
        }
      })
    },
    async findSysUser() {
      if (this.sysUserList.length > 0) return
      const data = await this.commonRequestFn.findSysUser({
        limit: -1,
        companyId: this.$auth.getUserSession().companyId
      })
      this.manageId = +this.$route.query.hyRelation || ''
      this.sysUserList = data
    },
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
    // 获取使用类型
    findAssetsUseTypeCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产使用方式', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsUseTypeList = res.data
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
          this.orgTreeList = listToTree(res.data, 0, 0, 'hyOrgId', 'hyPid')
        }
      })
    },
    // 获取供应商
    findAssetsSupplier() {
      request({
        url: api.assets.findAssetsSupplier,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.supplierList = res.data
        }
      })
    },
    // 获取区域列表
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: {limit: -1}})
        .then(res => {
          this.listLoading = false
          if (res.code === 1) {
            const data = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
            this.areaTreeArr = this.mapTree(data)
            console.log(this.areaTreeArr, 'this.areaTreeArr')
            this.hyOrgId = this.$route.query.hyOrgId
          }
        })
    },
    // 筛选已选择的地址包括父级
    mapTree(arr) {
      let newarr = []
      arr.forEach(item => {
        if (item.isIt === 1) {
          newarr.push(item)
        } else {
          if (item.children && item.children.length > 0) {
            let redata = this.mapTree(item.children)
            if (redata && redata.length > 0) {
              let obj = {
                ...item,
                children: redata
              }
              newarr.push(obj)
            }
          }
        }
      })
      return newarr
    },
    // 获取供应商人员
    findAssetsSupplierEmploye() {
      this.$set(this.findAssetsSupplierEmployeQuery, 'supplierId', this.assetsPurchaseForm.supplierId)
      request({
        url: api.assets.findAssetsSupplierEmploye,
        data: this.findAssetsSupplierEmployeQuery
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          if (res.data.length > 0) {
            this.$set(this.assetsPurchaseForm, 'userId', res.data[0].id)
          }
          this.supplierEmployeList = res.data
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
    // 获取人员
    async findHrUserInfo(organizationCatId) {
      const data = { ...this.findHrUserInfoQuery, companyId: this.$auth.getUserSession().companyId }
      if (organizationCatId) data.organizationCatId = organizationCatId
      return await request({
        url: api.hr.findHrUserInfo,
        data
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    },
    // 选择所属部门
    changeBeOrg() {
      const organizationCatId = this.assetsUseForm.organizationCatId[this.assetsUseForm.organizationCatId.length - 1]
      this.$set(this.findHrUserInfoQuery, 'organizationCatId', organizationCatId)
      this.findHrUserInfo().then(res => {
        this.beOrgEmployeList = res
      })
    },
    // 选择使用部门
    changeUseOrg() {
      const organizationCatId = this.assetsUseForm.departmentCatId[this.assetsUseForm.departmentCatId.length - 1]
      this.$set(this.findHrUserInfoQuery, 'organizationCatId', organizationCatId)
      this.findHrUserInfo().then(res => {
        this.useOrgEmployeList = res
      })
    },
    // 上传资产图片
    assetsImageUrlUpload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic, data: this.uploadToken, form: fdata
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.assetsInfoForm, 'assetsImageUrl', res.map.img)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleAssetsImageUrlChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    handleAssetsImageUrlRemove() {
      this.$set(this.assetsInfoForm, 'assetsImageUrl', '')
    },
    // 上传使用附件
    dataUrlUpload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic, data: this.uploadToken, form: fdata
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.assetsUseForm, 'dataUrl', res.map.img)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleDataUrlChange(file, fileList) {
      this.dataFileList = fileList.slice(-3)
    },
    handleDataUrlRemove() {
      this.$set(this.assetsUseForm, 'dataUrl', '')
    },
    // 保存
    onSubmit() {
      const that = this
      const assetsInfoForm = { ...this.assetsInfoForm }
      const assetsPurchaseForm = { ...this.assetsPurchaseForm }
      const assetsUseForm = { ...this.assetsUseForm }
      console.log(assetsUseForm)
      console.log(assetsPurchaseForm)
      console.log(assetsInfoForm)
      this.$refs['assetsInfoForm'].validate(valid => {
        if (valid) {
          that.$refs['assetsUseForm'].validate(useValid => {
            if (useValid) {
              /* 资产信息 */
              assetsInfoForm.assetsCatId = assetsInfoForm.assetsCatId.length ? assetsInfoForm.assetsCatId[assetsInfoForm.assetsCatId.length - 1] : assetsInfoForm.assetsCatId
              assetsInfoForm.brandCatId = assetsInfoForm.brandCatId.length ? assetsInfoForm.brandCatId[assetsInfoForm.brandCatId.length - 1] : assetsInfoForm.brandCatId
              assetsInfoForm.cmdbItemTypeId = assetsInfoForm.cmdbItemTypeId.length ? assetsInfoForm.cmdbItemTypeId[assetsInfoForm.cmdbItemTypeId.length - 1] : assetsInfoForm.cmdbItemTypeId
              assetsInfoForm.cmdbItemSourceType = this.cmdbItemSourceType
              assetsInfoForm.status = assetsUseForm.status || 485
              console.log(assetsInfoForm)
              /* 资产信息 */

              /* 采购管理 */
              let assetsPurchaseFormIsNull = true
              Object.keys(assetsPurchaseForm).forEach(key => {
                if (assetsPurchaseFormIsNull && assetsPurchaseForm[key] && assetsPurchaseForm[key] !== '') assetsPurchaseFormIsNull = false
              })
              assetsPurchaseForm.price = assetsPurchaseForm.price ? assetsPurchaseForm.price * 1000 : 0
              assetsPurchaseForm.purchasePrice = assetsPurchaseForm.purchasePrice ? assetsPurchaseForm.purchasePrice * 1000 : 0
              console.log(assetsPurchaseForm, assetsPurchaseFormIsNull)
              /* 采购管理 */

              /* 使用管理 */
              let assetsUseFormIsNull = true
              Object.keys(assetsUseForm).forEach(key => {
                if (assetsUseFormIsNull && assetsUseForm[key] && assetsUseForm[key] !== '') assetsUseFormIsNull = false
              })
              assetsUseForm.organizationCatId = assetsUseForm.organizationCatId ? assetsUseForm.organizationCatId[assetsUseForm.organizationCatId.length - 1] : assetsUseForm.organizationCatId
              assetsUseForm.departmentCatId = assetsUseForm.departmentCatId ? assetsUseForm.departmentCatId[assetsUseForm.departmentCatId.length - 1] : assetsUseForm.departmentCatId
              console.log(assetsUseForm, assetsUseFormIsNull)
              console.log(this.hostObjFlag, assetsUseForm.location, ' assetsUseForm.location')
              if (this.hyHostId && assetsUseForm.location) {
                this.updateHyItMessage(assetsUseForm.location)
                assetsUseForm.manageId = this.manageId
              }
              /* 使用管理 */

              // 保存资产先
              this.saveAssetsInfo(assetsInfoForm).then(res => {
                if (res) {
                  const assetsInfo = res.model
                  console.log(assetsInfo)

                  if (!this.assetsInfoForm.assetsId) { // 新增资产插入变更记录
                    this.insertAssetsChangeLog({
                      sourceType: 1,
                      assetsDeviceId: assetsInfo.assetsId
                    })
                  }

                  if (!assetsPurchaseFormIsNull) { // 如果采购记录表单不为空 则请求保存资产采购
                    this.saveAssetsPurchase(assetsPurchaseForm).then(purchaseRes => {
                      if (purchaseRes) {
                        const assetsPurchase = purchaseRes.model
                        console.log(assetsPurchase)

                        if (!this.assetsPurchaseForm.purchaseId) { // 如果是新增需要与资产绑定采购关系
                          this.insertAssetsPurchaseMap({
                            assetsId: assetsInfo.assetsId,
                            purchaseId: assetsPurchase.purchaseId
                          })
                        }
                      } else {
                        this.$message.error('保存采购记录失败')
                      }
                    })
                  }

                  if (!assetsUseFormIsNull) { // 如果使用记录不为空则请求保存资产使用记录
                    const idx = this.assetsStatusList.findIndex(item => item.id === assetsUseForm.status)
                    if (assetsUseForm.status === 486) {
                      const changelog = {
                        useTypeId: assetsUseForm.useTypeId,
                        organizationCatId: assetsUseForm.departmentCatId,
                        stime: assetsUseForm.useStime,
                        etime: assetsUseForm.useEtime,
                        sourceType: idx !== -1 ? this.assetsStatusList[idx].dictdataValue : '',
                        status: assetsUseForm.status,
                        userId: assetsUseForm.userId,
                        assetsDeviceId: assetsInfo.assetsId
                      }
                      this.saveAssetsUse(assetsUseForm).then(useRes => {
                        if (useRes) {
                          const assetsUse = useRes.model
                          console.log(this.$route.query.useId)
                          if (!this.assetsUseForm.useId) {
                            this.insertAssetsUseMap({
                              assetsDeviceId: assetsInfo.assetsId,
                              useId: assetsUse.useId
                            }).then(mapRes => {
                              if (mapRes) {
                                this.insertAssetsChangeLog(changelog)
                              }
                            })
                          } else {
                            Object.keys(this.originalUse).forEach(key => {
                              console.log(this.originalUse[key], assetsUseForm[key])
                              if (this.originalUse[key] !== assetsUseForm[key]) this.isChangeUse = true
                            })
                            if (this.isChangeUse) {
                              this.insertAssetsChangeLog(changelog)
                            }
                          }
                        } else {
                          this.$message.error('保存使用记录失败')
                        }
                      })
                    } else {
                      const changelog = {
                        sourceType: idx !== -1 ? this.assetsStatusList[idx].dictdataValue : '',
                        status: assetsUseForm.status,
                        assetsDeviceId: assetsInfo.assetsId
                      }
                      if (!this.assetsUseForm.useId) {
                        this.insertAssetsChangeLog(changelog)
                      } else {
                        this.deleteAssetsUseMap({
                          useId: this.$route.query.useId,
                          assetsDeviceId: assetsInfo.assetsId
                        }).then(delMapRes => {
                          if (delMapRes) {
                            this.insertAssetsChangeLog(changelog)
                          } else {
                            this.$message.error('保存使用记录失败')
                          }
                        })
                      }
                    }
                  }

                  this.$message({
                    type: 'success',
                    message: res.msg
                  })
                  this.$router.back()
                } else {
                  this.$message.error('保存资产失败')
                }
              })
            }
          })
        }
      })
    },
    async updateHyItMessage(location) {
      const params = {
        address: location,
        id: this.hyHostId
      }
      console.log(this.hyHostId)
      console.log(location, 'location')
      const { code, model } = await this.$request({
        url: this.api.itMonitor.agentUpdateHost,
        data: params
      })
      console.log(code, model)
    },
    // 保存资产
    async saveAssetsInfo(data) {
      const apiName = this.assetsInfoForm.assetsId ? api.assets.updateAssetsInfo : api.assets.insertAssetsInfo
      return await request({
        url: apiName, data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 保存资产采购
    async saveAssetsPurchase(data) {
      const apiName = this.assetsPurchaseForm.purchaseId ? api.assets.updateAssetsPurchase : api.assets.insertAssetsPurchase
      return await request({
        url: apiName, data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 保存资产使用
    async saveAssetsUse(data) {
      console.log(this.assetsUseForm)
      const apiName = this.assetsUseForm.useId ? api.assets.updateAssetsUse : api.assets.insertAssetsUse
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
    // 资产和采购关联
    insertAssetsPurchaseMap(data) {
      request({
        url: api.assets.insertAssetsPurchaseMap, data
      })
    },
    // 获取资产信息
    getAssetsInfo() {
      request({
        url: api.assets.getAssetsInfo,
        data: { assetsId: this.$route.query.assetsId }
      }).then(res => {
        if (res.code === 1) {
          Object.keys(this.assetsInfoForm).forEach(key => {
            this.$set(this.assetsInfoForm, `${key}`, res.model[key])
          })
          this.$set(this.assetsInfoForm, 'assetsId', res.model.assetsId)
          this.$set(this.assetsInfoForm, 'cmdbItemTypeId', 12)
          if (res.model.assetsImageUrl) {
            this.fileList = [{
              id: res.model.assetsId,
              url: res.model.assetsImageUrl,
              name: res.model.assetsImageUrl
            }]
          }
        }
      })
    },
    // 获取资产使用
    getAssetsUse() {
      request({
        url: api.assets.getAssetsUse,
        data: { useId: this.$route.query.useId }
      }).then(res => {
        if (res.code === 1) {
          Object.keys(this.assetsUseForm).forEach(key => {
            this.$set(this.assetsUseForm, `${key}`, res.model[key])
          })
          console.log(this.assetsUseForm)
          console.log(res.model)
          Object.keys(this.originalUse).forEach(key => {
            this.$set(this.originalUse, `${key}`, res.model[key])
            if (this.$route.query.hyAddr) { this.$set(this.assetsUseForm, 'location', this.$route.query.hyAddr || '') }
          })
          this.$set(this.assetsUseForm, 'useId', res.model.useId)
          if (res.model.manageId) {
            this.$set(this.findHrUserInfoQuery, 'organizationCatId', res.model.organizationCatId)
            this.findHrUserInfo().then(res => {
              this.beOrgEmployeList = res
            })
          }
          if (res.model.userId) {
            this.$set(this.findHrUserInfoQuery, 'organizationCatId', res.model.departmentCatId)
            this.findHrUserInfo().then(res => {
              this.useOrgEmployeList = res
            })
          }
        }
      })
    },
    // 获取资产采购信息
    getAssetsPurchase() {
      request({
        url: api.assets.getAssetsPurchase,
        data: { purchaseId: this.$route.query.purchaseId }
      }).then(res => {
        if (res.code === 1) {
          Object.keys(this.assetsPurchaseForm).forEach(key => {
            this.$set(this.assetsPurchaseForm, `${key}`, res.model[key])
          })
          if (res.model.purchaseDate) {
            this.$set(this.assetsPurchaseForm, 'purchaseDate', res.model.purchaseDate.split(' ')[0])
          }
          if (res.model.purchaseOutdate) {
            this.$set(this.assetsPurchaseForm, 'purchaseOutdate', res.model.purchaseOutdate.split(' ')[0])
          }
          this.$set(this.assetsPurchaseForm, 'purchaseId', res.model.purchaseId)
          this.$set(this.assetsPurchaseForm, 'price', res.model.price ? res.model.price / 1000 : '')
          this.$set(this.assetsPurchaseForm, 'purchasePrice', res.model.purchasePrice ? res.model.purchasePrice / 1000 : '')
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
    // 图片插件获取图片信息
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.assetsInfoForm, 'assetsImageUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    getEmitUseAttachmentFileList(file) {
      this.dataFileList = file['fileList']
      this.$set(this.assetsUseForm, 'dataUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    }
  }
}
</script>
