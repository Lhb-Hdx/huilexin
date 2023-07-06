<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        节点样式<i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div class="group-main-item">
          <div class="group-main-title">节点名称：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.itemName" type="text" class="input">
          </div>
          <!--          <el-form :model="elStyleProp" inline label-position="right" label-width="80px">-->
          <!--            <el-form-item label="名称" prop="itemName">-->
          <!--              <input v-model.lazy="elStyleProp.itemName" type="text" class="input">-->
          <!--            </el-form-item>-->
          <!--            <el-form-item label="编号" prop="itemName">-->
          <!--              <input v-model.lazy="elStyleProp.itemName" type="text" class="input">-->
          <!--            </el-form-item>-->
          <!--            <el-form-item label="设备类型" prop="itemName">-->
          <!--              <input v-model.lazy="elStyleProp.itemName" type="text" class="input">-->
          <!--            </el-form-item>-->
          <!--            <el-form-item label="显示信息" prop="itemName">-->
          <!--              <el-radio-group>-->
          <!--                <el-radio>显示</el-radio>-->
          <!--                <el-radio>不显示</el-radio>-->
          <!--              </el-radio-group>-->
          <!--            </el-form-item>-->
          <!--            <el-form-item label="描述" prop="itemName">-->
          <!--             <el-input v-model="elStyleProp.itemName" type="textarea"></el-input>-->
          <!--            </el-form-item>-->
          <!--            <div class="flex-v-end">-->
          <!--              <el-button type="primary">保存</el-button>-->
          <!--            </div>-->
          <!--          </el-form>-->
        </div>
        <!--        <div v-if="elStyle.type !== 'map'" class="group-main-item">-->
        <!--          <div class="group-main-title">X坐标：</div>-->
        <!--          <div class="group-main-value" style="display: flex">-->
        <!--            <input v-model.lazy="elStyleProp.x" type="text" class="input">-->
        <!--            <div class="input-group-tag">px</div>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--        <div v-if="elStyle.type !== 'map'" class="group-main-item">-->
        <!--          <div class="group-main-title">Y坐标：</div>-->
        <!--          <div class="group-main-value" style="display: flex">-->
        <!--            <input v-model.lazy="elStyleProp.y" type="text" class="input">-->
        <!--            <div class="input-group-tag">px</div>-->
        <!--          </div>-->
        <!--        </div>-->
        <div v-if="elStyle.type !== 'node-template' && elStyle.type !== 'map'" class="group-main-item">
          <div class="group-main-title">宽度：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.width" type="text" class="input">
            <div class="input-group-tag">px</div>
          </div>
        </div>
        <div v-if="elStyle.type !== 'node-template' && elStyle.type !== 'map'" class="group-main-item">
          <div class="group-main-title">高度：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="elStyleProp.height" type="text" class="input">
            <div class="input-group-tag">px</div>
          </div>
        </div>
        <div v-if="elStyle.type !== 'rect'" class="group-main-item">
          <div class="group-main-title">背景图片：</div>
          <div class="group-main-value">
            <FileUpload
              v-permission="['ItemBgImgUpload']"
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
      elStyleProp: {},
      fileList: [],
      fontWeight: []
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
        console.log(newVal.type, newVal)
        if (newVal.type !== 'rect') this.setFileList(newVal.img)
        this.initStyle(newVal)
      },
      deep: true
    },
    elStyleProp: {
      handler(newVal, oldVal) {
        if (Object.keys(oldVal).length > 0 && oldVal.id === newVal.id) {
          const activeNewVal = { ...newVal }
          if (activeNewVal.type !== 'map') {
            activeNewVal.x = parseInt(activeNewVal.x)
            activeNewVal.y = parseInt(activeNewVal.y)
          }
          this.$emit('updateElStyle', activeNewVal)
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
      if (val.type !== 'map') {
        data.x = val.x
        data.y = val.y
      }
      this.elStyleProp = data
    },
    changeFontColor() {
      this.$emit('changeFontColor', this.elStyleProp)
    },
    changeBgColor() {
      this.$emit('changeBgColor', this.elStyleProp)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';
</style>
