<template>
  <div class="assets-detail-component">
    <el-descriptions class="margin-top" :column="2" size="medium">
      <el-descriptions-item label="配置项类型">{{ setConfigItem(assetsInfo.cmdbItemTypeId) }}</el-descriptions-item>
      <el-descriptions-item label="品牌">{{ setBrand(assetsInfo.brandCatId) }}</el-descriptions-item>
      <el-descriptions-item label="型号">{{ assetsInfo.model }}</el-descriptions-item>
      <el-descriptions-item label="序列号（SN码）">{{ assetsInfo.assetsSn }}</el-descriptions-item>
      <el-descriptions-item label="配置">{{ assetsInfo.assetsDesc }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions class="margin-top" :column="2" size="medium">
      <el-descriptions-item label="采购时间">{{ assetsPurchase.purchaseDate }}</el-descriptions-item>
      <el-descriptions-item label="采购金额（￥）">{{ assetsPurchase.price / 1000 ||'' }}</el-descriptions-item>
      <el-descriptions-item label="净残值（￥）">{{ assetsPurchase.purchasePrice / 1000 ||'' }}</el-descriptions-item>
      <el-descriptions-item label="保修期限">{{ assetsPurchase.purchaseOutdate }}</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ setSupplier(assetsPurchase.supplierId) }}</el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ setOrg(assetsUse.organizationCatId) }}</el-descriptions-item>
      <el-descriptions-item label="管理负责人">{{ assetsManageUserName }}</el-descriptions-item>
      <el-descriptions-item label="使用方式">{{ setUseType(assetsUse.useTypeId) }}</el-descriptions-item>
      <el-descriptions-item label="使用部门">{{ setOrg(assetsUse.departmentCatId) }}</el-descriptions-item>
      <el-descriptions-item label="使用负责人">{{ assetsUseUserName }}</el-descriptions-item>
      <el-descriptions-item label="所在位置">{{ assetsUse.location }}</el-descriptions-item>
      <el-descriptions-item label="所在项目">{{ setProject(assetsUse.projectCatId) }}</el-descriptions-item>
      <el-descriptions-item label="附件">
        <el-button type="text" class="no-padding" @click="onLookDataImg">查看附件</el-button>
      </el-descriptions-item>
      <el-descriptions-item label="使用时间">{{ assetsUse.useStime }} - {{ assetsUse.useEtime }}</el-descriptions-item>
    </el-descriptions>
    <viewer ref="viewer" :images="imageSwiperList" :index="3" @inited="inited">
      <img v-for="(src,index) in imageSwiperList" :key="index" :src="src" alt="" style="display: none">
    </viewer>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'DetailSituation',
  props: {
    assetsInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    assetsUse: {
      type: Object,
      default() {
        return {}
      }
    },
    assetsPurchase: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      configItemTreeList: [],
      brandTreeList: [],
      supplierList: [],
      orgTreeList: [],
      assetsProjectCatList: [],
      assetsUseTypeList: [],
      assetsUseUserName: '',
      assetsManageUserName: '',
      imageSwiperList: []
    }
  },
  computed: {
    setConfigItem() {
      return function(cmdbCatId) {
        const idx = this.configItemTreeList.findIndex(item => item.catId === cmdbCatId)
        if (idx !== -1) {
          return this.configItemTreeList[idx].catName
        }
      }
    },
    setOrg() {
      return function(departmentCatId) {
        const idx = this.orgTreeList.findIndex(item => item.hyOrgId === departmentCatId)
        if (idx !== -1) {
          return this.orgTreeList[idx].hyOrgName
        }
      }
    },
    setProject() {
      return function(projectCatId) {
        const idx = this.assetsProjectCatList.findIndex(item => item.catId === projectCatId)
        if (idx !== -1) {
          return this.assetsProjectCatList[idx].catName
        }
      }
    },
    setBrand() {
      return function(brandCatId) {
        const idx = this.brandTreeList.findIndex(item => item.catId === brandCatId)
        if (idx !== -1) {
          return this.brandTreeList[idx].catName
        }
      }
    },
    setSupplier() {
      return function(supplierId) {
        const idx = this.supplierList.findIndex(item => item.supplierId === supplierId)
        if (idx !== -1) {
          return this.supplierList[idx].supplierName
        }
      }
    },
    setUseType() {
      return function(useTypeId) {
        const idx = this.assetsUseTypeList.findIndex(item => item.catId === useTypeId)
        if (idx !== -1) {
          return this.assetsUseTypeList[idx].catName
        }
      }
    }
  },
  watch: {
    assetsUse: {
      handler(newVal) {
        this.getHrUserInfo(newVal.manageId).then(res => {
          console.log(res)
          if (res) {
            this.assetsUseUserName = res.userRealName
          }
        })
        this.getHrUserInfo(newVal.userId).then(res => {
          console.log(res)
          if (res) {
            this.assetsManageUserName = res.userRealName
          }
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.findConfigItemCat()
    this.findBrandCat()
    this.findAssetsSupplier()
    this.findOrganizationCat()
    this.findProjectCat()
    this.findAssetsUseTypeCat()
  },
  methods: {
    // 配置项列表
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
    // 品牌列表
    findBrandCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_品牌', module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.brandTreeList = res.data
        }
      })
    },
    // 供应商列表
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
    // 部门列表
    findOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.orgTreeList = res.data
        }
      })
    },
    // 项目列表
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
    // 使用方式
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
    // 获取人员
    async getHrUserInfo(id) {
      return await request({
        url: api.hr.getHrUserInfo,
        data: { id }
      }).then(res => {
        if (res.code === 1) return res.model
      })
    },
    inited(viewer) {
      this.$viewer = viewer
      this.$viewer.index = this.activeIndex
      // 不要他的按钮
      this.$viewer.options.button = false
      // 不要他的底部缩略图
      this.$viewer.options.navbar = false
      // 不要他的底部标题
      this.$viewer.options.title = false
      // 不要他的底部工具栏
      this.$viewer.options.toolbar = false
    },
    show() {
      this.$viewer.show()
    },
    onLookDataImg() {
      this.imageSwiperList = [
        this.assetsUse.dataUrl
      ]
      this.show()
    }
  }
}
</script>
