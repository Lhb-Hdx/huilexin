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
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <div class="card-form-group">
                <div class="form-group-header">基础信息</div>
                <div class="form-group-body">
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="配置项名称" prop="name">
                      <el-input v-model.trim="form.name" placeholder="请输入配置项名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="配置项类别" prop="itemTypeId">
                      <el-cascader v-model="form.itemTypeId" class="w-100" placeholder="配置项" :options="configItemTreeList" :props="{ value: 'id', label: 'name', checkStrictly: true }" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="配置项图片">
                      <el-upload
                        v-permission="['ConfigItemImgUpload']"
                        action
                        accept=".png,.jpg"
                        :http-request="urlUpload"
                        :on-change="urlChange"
                        :on-remove="urlRemove"
                        :file-list="fileList"
                        :limit="1"
                      >
                        <el-button type="primary">选择图片</el-button>
                      </el-upload>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                    <el-form-item label="备注" prop="remark">
                      <el-input v-model.trim="form.remark" placeholder="请输入备注" />
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
                <el-button @click="onReset">重置</el-button>
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

export default {
  name: 'ConfigItemAddUpdate',
  data() {
    return {
      loading: false,
      form: {
        name: '',
        itemTypeId: '',
        itemImageUrl: '',
        remark: '',
        itemDefineType: 1
      },
      configItemTreeList: [],
      confirmLoading: false,
      uploadToken: {
        // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      fileList: [],
      rules: {
        name: [{ required: true, message: '请输入配置项名称', trigger: 'blur' }],
        itemTypeId: [{ required: true, message: '请选择配置项类别', trigger: 'blur' }]
      }
    }
  },
  computed: {
    id() {
      // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() {
      // title
      return this.$route.meta.title
    }
  },
  mounted() {
    this.findConfigItemCat()
    if (this.id) {
      this.getCmdbItem()
    }
  },
  methods: {
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.form.id ? api.cmdb.updateCmdbItem : api.cmdb.insertCmdbItem
          const data = { ...this.form }
          data.itemTypeId = data.itemTypeId[data.itemTypeId.length - 1] || data.itemTypeId
          request({
            url: apiName,
            data
          }).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.$router.back()
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    onReset() {},
    urlUpload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic,
        data: this.uploadToken,
        form: fdata
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.form, 'itemImageUrl', res.map.original)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    urlChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    urlRemove() {
      this.$set(this.form, 'itemImageUrl', '')
    },
    findConfigItemCat() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          const data = []
          res.data.forEach(item => {
            if (item.userDefine !== 0) {
              data.push(item)
            }
          })
          this.configItemTreeList = listToTree(data, 0, 0, 'id', 'parentId')
        }
      })
    },
    getCmdbItem() {
      request({
        url: api.cmdb.getCmdbItem,
        data: { id: this.id }
      }).then(res => {
        if (res.code === 1) {
          Object.keys(this.form).forEach(key => {
            this.form[key] = res.model[key]
          })
          this.form.id = res.model.id
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
