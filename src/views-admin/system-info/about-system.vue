<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div class="item-content-header">
        <div class="title">系统信息</div>
        <div class="line"><div class="blo" /></div>
      </div>
      <div class="item-content-main">
        <el-form ref="form" :model="sysCatForm" :rules="rules" label-width="120px">
          <el-form-item label="系统版本号" prop="dictdataName">
            <el-input v-model="sysCatForm.dictdataName" :disabled="sysCatDisabled" style="width:25%" />
          </el-form-item>
          <el-form-item label="系统名称" prop="dictdataName">
            <el-input v-model="sysNameForm.dictdataName" style="width:25%" />
          </el-form-item>
          <div v-permission="['EditVersion']" class="fiter-container">
            <el-form-item label="系统LOGO">
              <FileUpload
                :button-disabled="false"
                :file-max-size="1"
                :file-url-list="fileList"
                :is-limit-file-size="true"
                :limit="1"
                button-text="选择图片"
                file-type=".png,.jpg"
                file-url-list-type="picture"
                upload-type="pic"
                @emitFileList="getEmitFileList"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onEdit()">修改</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>
    <el-card class="mt-10">
      <div class="item-content-header">
        <div class="title">授权信息</div>
        <div class="line"><div class="blo" /></div>
      </div>
      <div class="item-content-main">
        <el-form :model="sysCatForm" label-width="120px">
          <el-form-item class="authorization-text" label="系统序列号">{{ series }}</el-form-item>
          <el-form-item class="authorization-text" label="授权信息">{{ status === 1 ? '永久授权' : '有效授权' }}</el-form-item>
          <el-form-item v-if="status === 0" class="authorization-text" label="到期时间">{{ authDate }}</el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import FileUpload from '@/components/Upload/file-upload'
import { getVuexStoragePermission } from '@/utils/auth'

export default {
  name: 'AboutSystem',
  components: {
    FileUpload
  },
  data() {
    return {
      sysCatForm: {
        id: '',
        dictdataName: ''
      },
      sysNameForm: {
        id: '',
        dictdataName: ''
      },
      sysCatDisabled: true,
      classifyCatQuery: {
        page: 1,
        limit: -1,
        systemName: 'systemInfo',
        dictCode: 'system_version'
      },
      classifyNameQuery: {
        page: 1,
        limit: -1,
        systemName: 'systemInfo',
        dictCode: 'system_name'
      },
      classifyLogoQuery: {
        page: 1,
        limit: -1,
        systemName: 'systemInfo',
        dictCode: 'system_logo'
      },
      loading: false,
      fileList: [],
      sycLogo: {
        id: '',
        remark: ''
      },
      rules: {
        dictdataName: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      isUpdateImage: false,
      series: '',
      model: '',
      status: '',
      authDate: ''
    }
  },
  mounted() {
    this.findSysCat(this.classifyCatQuery)
    this.findSysLogo(this.classifyLogoQuery)
    this.findSysName(this.classifyNameQuery)
    this.authorizationDevice()
    // 判断是否能够修改
    if (getVuexStoragePermission('EditVersion') === 0) {
      this.sysCatDisabled = false
    }
  },
  methods: {
    // 图片插件获取图片信息
    getEmitFileList(file) {
      console.log(file)
      this.fileList = file['map']
      this.sycLogo.remark = file['map'][0]['original'] || ''
      this.isUpdateImage = true
    },
    // 获取系统版本信息
    findSysCat(data) {
      request({
        url: api.common.findSysDictionaryDetail,
        data
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.sysCatForm = res.data[0]
        }
      })
    },
    // 获取系统版本信息
    findSysName(data) {
      request({
        url: api.common.findSysDictionaryDetail,
        data
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.sysNameForm = res.data[0]
        }
      })
    },
    // 获取系统LOGO
    findSysLogo(data) {
      request({
        url: api.common.findSysDictionaryDetail,
        data
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.sycLogo = res.data[0]
          this.fileList.push({ url: res.data[0].remark })
        }
      })
    },
    // 获取是否授权
    authorizationDevice() {
      request({
        url: '/authorization.device',
        notNeedToken: true
      }).then(res => {
        if (res.code === 1 && res.model) {
          this.series = res.model.series
          this.model = res.model.model
          this.status = Number(res.model.status)
          this.authDate = res.model.authDate
        }
      })
    },
    // 新增系统类型和图片
    async instanceSysCat(data) {
      return new Promise(resolve => {
        request({
          url: api.common.updateSysDictionaryDetail,
          data
        }).then(res => {
          if (res.code === 1) {
            resolve(res)
          }
        })
      })
    },
    // 修改系统类型
    async updateSysCat(data) {
      return new Promise(resolve => {
        const params = { ...data }
        if (params.id === '') delete params.id
        request({
          url: params.id ? api.common.updateSysDictionaryDetail : api.common.insertSysDictionaryDetail,
          data: params
        }).then(res => {
          if (res.code === 1) {
            resolve(res)
          }
        })
      })
    },
    // 修改系统LOGO
    async updateLogo(data) {
      const params = { ...data }
      if (params.id === '') delete params.id
      return await request({
        url: params.id ? api.common.updateSysDictionaryDetail : api.common.insertSysDictionaryDetail,
        data: params
      })
    },
    // 修改系统类型
    async updateSysName(data) {
      return new Promise(resolve => {
        const params = { ...data }
        if (params.id === '') delete params.id
        request({
          url: params.id ? api.common.updateSysDictionaryDetail : api.common.insertSysDictionaryDetail,
          data: params
        }).then(res => {
          if (res.code === 1) {
            resolve(res)
          }
        })
      })
    },
    // 确认按钮函数
    onEdit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$confirm('是否确定更改?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
            await this.updateSysCat({
              id: this.sysCatForm.id,
              dictCode: 'system_version',
              dictdataName: this.sysCatForm.dictdataName
            })
            // 修改系统名称
            await this.updateSysCat({
              id: this.sysNameForm.id,
              dictCode: 'system_name',
              dictdataName: this.sysNameForm.dictdataName
            })
            this.localStorageOperation('set', 'sysName', this.sysNameForm.dictdataName)
            this.$tool.setBrowserTitle()
            // 判断是否有进行更改
            if (this.isUpdateImage) {
              const updateLogo = await this.updateLogo({
                id: this.sycLogo.id,
                dictCode: 'system_logo',
                remark: this.sycLogo.remark
              })
              if (updateLogo.code === 1) {
                this.localStorageOperation('set', 'logoUrl', this.sycLogo.remark) // 存储logo地址
              }
            }
            this.$message({
              type: 'success',
              message: '修改成功！'
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消修改'
            })
          })
        } else {
          this.$message.error('请输入系统版本号！！！')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card{
  width: 100%;
}
.item-content-header{
  .title{
    margin-top: 10px;
    font-size: 16px;
    color: #333;
  }
  .line{
    margin: 10px 0 0;
    .blo{
      width: 30px;
      height: 3px;
      background: #0145AB;
      border-radius: 1px 1px 1px 1px;
    }
  }
}
.item-content-main{
  margin: 20px 0 0 0 ;
  // width: 30%;
}
.authorization-text{
  color: #656565;
}
.el-card ::v-deep .el-card__body {
      padding: 10px;
    }
</style>
