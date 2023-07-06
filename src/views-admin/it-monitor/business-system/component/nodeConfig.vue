<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        节点样式
        <i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div class="group-main-item">
          <div class="group-main-title">节点名称：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.itemName" type="text" class="input">
          </div>
        </div>
        <!--        <div class="group-main-item">-->
        <!--          <div class="group-main-title">X坐标：</div>-->
        <!--          <div class="group-main-value" style="display: flex">-->
        <!--            <input v-model.lazy="elStyleProp.x" type="text" class="input">-->
        <!--            <div class="input-group-tag">px</div>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--        <div class="group-main-item">-->
        <!--          <div class="group-main-title">Y坐标：</div>-->
        <!--          <div class="group-main-value" style="display: flex">-->
        <!--            <input v-model.lazy="elStyleProp.y" type="text" class="input">-->
        <!--            <div class="input-group-tag">px</div>-->
        <!--          </div>-->
        <!--        </div>-->
        <div class="group-main-item">
          <div class="group-main-title">宽度：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.width" type="text" class="input">
            <div class="input-group-tag">px</div>
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title">高度：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.height" type="text" class="input">
            <div class="input-group-tag">px</div>
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title"><span class="danger">*</span>IP：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.ip" type="text" class="input">
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title"><span class="danger">*</span>端口：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.port" type="text" class="input">
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title">是否检测端口：</div>
          <div class="group-main-value">
            <el-select v-model.lazy="elStyleProp.checkPort" size="mini" placeholder="请选择">
              <el-option
                v-for="item in checkPort"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div v-if="elStyle.type !== 'rect'" class="group-main-item">
          <div class="group-main-title">背景图片：</div>
          <div class="group-main-value">
            <FileUpload
              v-permission="['TopoItemBgUpload']"
              button-text="上传"
              upload-type="pic"
              file-type=".png,.jpg"
              :limit="1"
              :button-disabled="false"
              :is-limit-file-size="true"
              :file-max-size="1"
              :file-url-list="fileList"
              button-size="mini"
              button-type="primary"
              @emitFileList="getEmitFileList"
            />
          </div>
        </div>
        <div v-if="elStyle.type === 'rect'" class="group-main-item">
          <div class="group-main-title">背景颜色：</div>
          <div class="group-main-value">
            <el-color-picker v-model="elStyleProp.fontBackColor" size="mini" @change="changeBgColor" />
          </div>
        </div>
        <div v-if="elStyle.type === 'rect'" class="group-main-item">
          <div class="group-main-title">字体大小：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.fontSize" type="text" class="input">
            <div class="input-group-tag">px</div>
          </div>
        </div>
        <div v-if="elStyle.type === 'rect'" class="group-main-item">
          <div class="group-main-title">字体宽度：</div>
          <div class="group-main-value" style="display: flex">
            <el-select v-model.lazy="elStyleProp.fontWeight" size="mini" placeholder="请选择字体宽度">
              <el-option
                v-for="item in fontWeight"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div v-if="elStyle.type === 'rect'" class="group-main-item">
          <div class="group-main-title">字体颜色：</div>
          <div class="group-main-value">
            <el-color-picker v-model="elStyleProp.fontColor" size="mini" @change="changeFontColor" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload'

export default {
  name: 'NodeConfig',
  components: { FileUpload },
  props: {
    elStyle: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isMenuDown: true,
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      elStyleProp: {},
      fileList: [],
      fontWeight: [],
      checkPort: [
        { label: '是', value: 1 },
        { label: '否', value: 2 }
      ]
    }
  },
  watch: {
    elStyle: {
      handler(newVal, oldVal) {
        let isHaveNewValue = false
        Object.keys(newVal).forEach(key => {
          if (newVal[`${key}`] !== oldVal[`${key}`]) isHaveNewValue = true
        })
        if (!isHaveNewValue) return
        if (newVal.type !== 'rect') this.setFileList(newVal.img)
        this.initStyle(newVal)
      },
      deep: true
    },
    elStyleProp: {
      handler(newVal, oldVal) {
        if (Object.keys(oldVal).length > 0 && oldVal.id === newVal.id) {
          if (newVal.checkPort === 1 && newVal.ip === '') return this.$message({ type: 'error', message: 'IP不能为空' })
          if (newVal.checkPort === 1 && newVal.port === '') return this.$message({ type: 'error', message: '端口号不能为空' })
          newVal.x = parseInt(newVal.x)
          newVal.y = parseInt(newVal.y)
          this.$emit('updateElStyle', newVal)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initStyle(this.elStyle)
    if (this.elStyle.type !== 'rect') this.setFileList(this.elStyle.img)
    this.initFontWeight()
  },
  methods: {
    // 选择图片
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    // 上传图片
    upload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic, data: this.uploadToken, form: fdata
      }).then(res => {
        this.$set(this.elStyleProp, 'imageUrl', res.map.original)
      })
    },
    // 菜单收缩
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    },
    // 设置文件列表
    setFileList(img) {
      if (!img) return
      const splitImgName = img.split('/')
      this.$set(this.fileList, 0, { name: splitImgName[splitImgName.length - 1], url: img })
    },
    // 监听图片上传结束
    getEmitFileList(val) {
      this.$set(this.elStyleProp, 'imageUrl', val.emitType === 'addFile' ? val.fileList[0].url : '')
    },
    initFontWeight() {
      this.fontWeight = []
      for (let i = 0; i < 9; i++) {
        this.$set(this.fontWeight, this.fontWeight.length, {
          label: (i + 1) * 100,
          value: (i + 1) * 100
        })
      }
    },
    initStyle(val) {
      const data = {
        id: val.id,
        itemName: val.label,
        x: val.x,
        y: val.y,
        width: val.size[0],
        height: val.size[1],
        type: val.type
      }
      if (val.type === 'rect') { // 文本节点
        data.fontBackColor = val.style.fill
        data.fontSize = val.labelCfg.style.fontSize
        data.fontWeight = val.labelCfg.style.fontWeight
        data.fontColor = val.labelCfg.style.fill
      } else {
        data.imageUrl = val.img
        data.ip = val.ip
        data.port = val.port
        data.checkPort = val.checkPort
      }
      this.elStyleProp = data
    },
    changeBgColor() {
      // this.$emit('updateCombo', this.elStyleProp)
    },
    changeFontColor() {
      // this.$emit('updateCombo', this.elStyleProp)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';
</style>
