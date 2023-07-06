<template>
  <div class="cabinet-item-config">
    <div class="title">配置设备图片</div>
    <div class="config-main">
      <div class="config-main-item">
        <div class="main-item-label">设备类型：</div>
        <div class="main-item-value">
          <el-select v-model="configForm.devType" class="filter-item width-60" size="mini" @change="handlerDevType">
            <el-option
              v-for="item in devType"
              :key="item.id"
              :label="item.dictdataName"
              :value="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="config-main-item">
        <div class="main-item-label main-item-label-btn">
          设备图片
          <el-button size="mini" type="primary" @click="addPic">添加设备图片</el-button>
        </div>
        <div class="main-item-list">
          <div v-for="item in cabinetPic" :key="item.picId" class="item pointer" :class="String(item.picId) === String(configForm.picId) ? 'active' : ''" @click="handlerPic(item)">
            <img :src="item.url" alt="">
            <div class="footer">
              <div class="name">{{ item.name }} {{ item.capacity }}U</div>
              <div v-if="item.dataType !== 'define'" class="btns">
                <el-button size="mini" type="primary" @click="edit(item)">编辑</el-button>
                <el-button size="mini" type="danger" @click.stop="del(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" :append-to-body="true" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="设备名称" prop="name">
            <el-input v-model.trim="form.name" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="设备U位" prop="capacity">
            <el-input v-model.trim="form.capacity" type="number" placeholder="请输入设备U位" />
          </el-form-item>
          <el-form-item label="设备类型" prop="modelId">
            <el-select v-model="form.modelId">
              <el-option
                v-for="item in devType"
                :key="item.id"
                :label="item.dictdataName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="图片" label-width="110px" prop="url">
            <FileUpload
              button-text="上传"
              upload-type="pic"
              file-type=".png,.jpg"
              :limit="1"
              :button-disabled="false"
              :is-limit-file-size="true"
              :file-max-size="1"
              :file-url-list="fileList"
              file-url-list-type="picture"
              button-type="primary"
              @emitFileList="getEmitFileList"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FileUpload from '@/components/Upload/file-upload.vue'

export default {
  name: 'CabinetItemConfig',
  components: {
    FileUpload
  },
  data() {
    return {
      configForm: {
        picId: '',
        devType: '',
        itemSize: 1
      },
      devType: [],
      cabinetPic: [],
      showDialog: false,
      dialogTitle: '新增设备图片',
      form: {
        name: '',
        modelId: '',
        url: '',
        type: 0,
        capacity: 1
      },
      formId: '',
      fileList: [],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        modelId: [
          { required: true, message: '请选择设备类型', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请上传图片', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '请输入设备U位', trigger: 'blur' }
        ]
      },
      cabinetItem: {}
    }
  },
  watch: {
    configForm: {
      handler() {
        this.emitData()
      },
      deep: true
    }
  },
  mounted() {
    // 获取设备类型
    this.loadItType()
    // 监听选择机柜设备
    this.$EventBus.$on('handler-cabinet-item', (res) => {
      this.cabinetItem = this.$tool.deepCopy(res)
    })
  },
  methods: {
    // 获取设备类型
    loadItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devType = res.data
          if (res.data.length > 0) {
            this.$set(this.configForm, 'devType', res.data[0].id)
            this.setPicList(res.data[0].id)
          }
        }
      })
    },
    // 选择设备类型
    handlerDevType() {
      this.setPicList(this.configForm.devType)
    },
    // 设置图片列表
    async setPicList(modelId) {
      // 前端定义的图片
      const definePic = this.$defineData.getCabinetDefaultPic({ type: 0, deviceClassifyId: modelId })
      const dbPic = await this.findDiagramDevicePicture({ limit: -1, modelId })
      this.cabinetPic = [...definePic, ...dbPic]
      if (this.cabinetPic.length > 0) {
        this.$set(this.configForm, 'picId', this.cabinetPic[0].picId)
        this.$set(this.configForm, 'itemSize', this.cabinetPic[0].capacity)
      }
      this.emitData()
    },
    // 点击图片
    handlerPic(item) {
      this.$set(this.configForm, 'picId', item.picId)
      this.$set(this.configForm, 'itemSize', item.capacity)
      if (this.cabinetItem.id) {
        this.$EventBus.$emit('update-cabinet-pic', item)
      }
    },
    // 点击添加图片
    addPic() {
      this.dialogTitle = '添加设备图片'
      this.formId = ''
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
      this.$set(this.form, 'type', 0)
      this.$set(this.form, 'capacity', 1)
      this.fileList = []
      this.showDialog = true
    },
    // 监听文件上传
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'url', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    // 确定保存
    confirm() {
      const data = { ...this.form }
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? this.api.diagram.updateDiagramDevicePicture : this.api.diagram.insertDiagramDevicePicture
          if (this.formId) {
            data.picId = this.formId
          }
          this.$request({
            url: requestTopologyInfoApi, data
          }).then(async res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.showDialog = false
              if (data.modelId === this.configForm.devType) this.setPicList(data.modelId)
            }
          })
        }
      })
    },
    // 查询设备图片
    async findDiagramDevicePicture(query) {
      const { code, data } = await this.$request({
        url: this.api.diagram.findDiagramDevicePicture,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 删除图片
    del(item) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await this.$request({
          url: this.api.diagram.deleteDiagramDevicePicture,
          data: { picId: item.picId }
        })
        if (code !== 1) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.setPicList(item.modelId)
        })
      })
    },
    // 编辑图片
    edit(item) {
      this.showDialog = true
      this.dialogTitle = '编辑设备图片'
      this.formId = item.picId
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, item[`${key}`])
      })
    },
    // 派发数据
    emitData() {
      this.$EventBus.$emit('emit-data', this.$tool.deepCopy(this.configForm))
    }
  }
}
</script>

<style lang="scss" scoped>
.cabinet-item-config {
    padding: 10px;
    background: #fff;
    height: 100%;
    .title {
        font-size: 16px;
        font-weight: bold;
    }
    .config-main {
        margin-top: 20px;
        .config-main-item {
            padding-bottom: 10px;
            .main-item-label {
                font-size: 14px;
                padding-bottom: 10px;
                display: inline-block;
                width: 20%;
            }
            .main-item-label-btn {
                width: 100% !important;
                display: flex !important;
                align-items: center;
                justify-content: space-between;
            }
            .main-item-value {
                display: inline-block;
                width: 80%;
            }
            .main-item-list {
              .item {
                margin: 10px 0;
                border: 1px solid transparent;
                border-radius: 5px;
                padding: 10px;
                img {
                  width: 100%;
                }
                .footer {
                  padding: 10px 0 0 0;
                  display: flex;
                  align-items: center;
                  .name {
                    width: 60%;
                  }
                  .btns {
                    width: 40%;
                    text-align: right;
                  }
                }
              }
              .active {
                border: 1px solid #0145ab;
                color: #0145ab;
              }
            }
        }
    }
}
</style>
