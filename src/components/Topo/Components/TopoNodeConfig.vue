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
        <div v-if="elStyle.type !== 'rect'" class="group-main-item">
          <div class="group-main-title">背景图片：</div>
          <div class="group-main-value">
            <el-tabs v-model="activeTopoBgTypeName" @tab-click="handleTopoBgTypeClick">
              <el-tab-pane label="上传图片" name="upload" />
              <el-tab-pane label="图标库" name="icon_list" />
            </el-tabs>
            <FileUpload
              v-if="activeTopoBgTypeName === 'upload'"
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
            <el-button v-if="activeTopoBgTypeName === 'icon_list'" type="primary" size="mini" @click="handlerShowIcoList">选择图标</el-button>
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
    <el-drawer
      title="图标库"
      :visible.sync="showIconList"
      direction="rtl"
    >
      <div class="drawer-container">
        <div class="drawer-main">
          <div class="icon-list">
            <el-row :gutter="20">
              <el-col v-for="(item, index) in $defineData.getTopoDefineIcon()" :key="index" :span="4">
                <div class="icon-list-item pointer" :class="index === icoIndex ? 'active' : ''" @click="handlerIco(item, index)">
                  <img class="icon-img" :src="item.url" alt="">
                  <div class="icon-name overflow-text-a">{{ item.name }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="drawer-footer">
          <el-button type="primary" @click="drawerSave">保存</el-button>
          <el-button type="default" @click="drawerCancel">取消</el-button>
        </div>
      </div>
    </el-drawer>
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
      activeTopoBgTypeName: 'upload',
      showIconList: false,
      icoIndex: null
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
      }
      this.elStyleProp = data
    },
    changeBgColor() {
      this.$emit('updateCombo', this.elStyleProp)
    },
    changeFontColor() {
      this.$emit('updateCombo', this.elStyleProp)
    },
    handleTopoBgTypeClick(val) {
      this.activeTopoBgTypeName = val.name
    },
    drawerSave() {
      if (this.icoIndex === null) return this.$message('请选择图标')
      console.log(this.icoItem)
      this.$set(this.elStyleProp, 'imageUrl', this.icoItem.url)
      this.showIconList = false
    },
    drawerCancel() {
      this.showIconList = false
    },
    handlerIco(item, index) {
      this.icoIndex = index
      this.icoItem = item
    },
    handlerShowIcoList() {
      this.icoIndex = null
      this.showIconList = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../Styles/TopoEditor.scss';
.drawer-main {
  height: 70%;
  overflow-x: hidden;
  overflow-y: auto;
}
.icon-list {
  .icon-list-item {
    margin: 10px 0;
    border: 1px solid transparent;
    border-radius: 5px;
    text-align: center;
    padding: 5px;
    .icon-img {
      width: 50px;
      height: 50px;
    }
    .icon-name {}
  }
  .active {
    border: 1px solid #0145ab;
    color: #0145ab;
  }
}
</style>
