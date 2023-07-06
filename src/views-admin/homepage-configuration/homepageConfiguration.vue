<template>
  <div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" label-width="100px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="首页跳转页面" prop="parentId">
                <AiTreeInput
                  :key="reloadKey"
                  :level-start-num="1"
                  :field="{'id':'menuId','name':'menuName','parent':'parentId'}"
                  remote="/admin/findSysMenu"
                  infoapi="/admin/getSysMenu"
                  :configuration-data="configurationData"
                  placeholder="请输入上层菜单"
                  :param="{menuType: 'menu', appId: form.appId,'classify':form.classify, version: 1}"
                  :bind-value="form.parentId"
                  @input="inputParent"
                />
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
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
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
// import { guid } from '@/utils/utils'

export default {
  name: 'HomepageConfiguration',
  components: { AiTreeInput },
  data() {
    return {
      configurationData: 0, // 历史菜单id
      configurationId: 0,
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
        classify: 'pc'
      },
      fileList: [],
      addRouterList: [],
      loading: false,
      confirmLoading: false,
      reloadParent: false,
      reloadKey: 'reloadKey',
      inputParentId: 1, // 菜单id
      apiUrls: [],
      inputVisible: false,
      inputValue: '',
      host: ''
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    setMenuType() {
      return function(key) {
        switch (key) {
          case 'menu':
            return '菜单'
          case 'button':
            return '按钮'
          default:
            return ''
        }
      }
    }
  },
  mounted() {
    this.$set(this.form, 'appId', getUserSession().appId)
  },
  created() {
    this.host = window.location.host // 获取当前域名
    this.findSysDictionaryDetail()
  },
  methods: {
    // 查询原配置
    findSysDictionaryDetail() {
      request({
        url: api.configuration.findSysDictionaryDetail,
        data: {
          dictCode: 'login_index'
        }
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          this.$set(this.form, 'parentId', Number(res.data[0].dictdataName))
          this.configurationData = Number(res.data[0].dictdataName)
          this.configurationId = Number(res.data[0].id)
        }
      })
    },
    // 保存
    onSubmit() {
      request({
        url: api.configuration.updateSysDictionaryDetail,
        data: {
          id: this.configurationId,
          dictdataName: this.configurationData
        }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 选择菜单
    inputParent(val) {
      console.log(val)
      this.configurationData = Number(val)
      this.inputParentId = val
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
</style>
