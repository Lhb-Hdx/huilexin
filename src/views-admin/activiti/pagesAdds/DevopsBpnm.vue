<template>
  <div>
    <div class="container">
      <!-- 把操作按钮写在这里面 -->
      <div class="action">
        <el-button-group>
          <el-button size="mini" icon="el-icon-folder-opened" @click="handleDialog">保存</el-button>
          <el-button size="mini" icon="el-icon-plus" @click="$refs.refFile.click()">导入</el-button>
          <el-tooltip effect="light">
            <div slot="content">
              <el-button size="mini" @click="downloadProcess('bpmn')">下载为Bpmn</el-button>
              <br>
              <el-button size="mini" class="mt-2" @click="downloadProcess('svg')">下载为svg</el-button>
            </div>
            <el-button size="mini" icon="el-icon-download">
              下载<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
          </el-tooltip>
        </el-button-group>
        <!-- 对齐 -->
        <el-button-group key="align-control" class="ml-10">
          <el-tooltip effect="light" content="向左对齐">
            <el-button size="mini" icon="el-icon-s-data" @click="elementsAlign('left')" />
          </el-tooltip>
          <el-tooltip effect="light" content="向右对齐">
            <el-button size="mini" icon="el-icon-s-data" @click="elementsAlign('right')" />
          </el-tooltip>
          <el-tooltip effect="light" content="向上对齐">
            <el-button size="mini" icon="el-icon-s-data" @click="elementsAlign('top')" />
          </el-tooltip>
          <el-tooltip effect="light" content="向下对齐">
            <el-button size="mini" icon="el-icon-s-data" @click="elementsAlign('bottom')" />
          </el-tooltip>
          <el-tooltip effect="light" content="水平居中">
            <el-button size="mini" icon="el-icon-s-data" @click="elementsAlign('center')" />
          </el-tooltip>
          <el-tooltip effect="light" content="垂直居中">
            <el-button size="mini" icon="el-icon-s-data" @click="elementsAlign('middle')" />
          </el-tooltip>
        </el-button-group>
        <!-- 缩放 -->
        <el-button-group key="scale-control" class="ml-10">
          <el-tooltip effect="light" content="缩小视图">
            <el-button size="mini" :disabled="defaultZoom < 0.2" icon="el-icon-zoom-out" @click="processZoomOut()" />
          </el-tooltip>
          <el-button size="mini" class="pb-8">{{ Math.floor(defaultZoom * 10 * 10) + "%" }}</el-button>
          <el-tooltip effect="light" content="放大视图">
            <el-button size="mini" :disabled="defaultZoom > 4" icon="el-icon-zoom-in" @click="processZoomIn()" />
          </el-tooltip>
          <el-tooltip effect="light" content="重置视图并居中">
            <el-button size="mini" icon="el-icon-c-scale-to-original" @click="processReZoom()" />
          </el-tooltip>
        </el-button-group>
        <!-- 绘制 -->
        <el-button-group key="stack-control" class="ml-10">
          <el-tooltip effect="light" content="撤销">
            <el-button size="mini" :disabled="!revocable" icon="el-icon-refresh-left" @click="processUndo()" />
          </el-tooltip>
          <el-tooltip effect="light" content="恢复">
            <el-button size="mini" :disabled="!recoverable" icon="el-icon-refresh-right" @click="processRedo()" />
          </el-tooltip>
          <el-tooltip effect="light" content="重新绘制">
            <el-button size="mini" icon="el-icon-refresh" @click="processRestart" />
          </el-tooltip>
        </el-button-group>
        <a ref="downloadLink" hidden />
        <!-- 用于打开本地文件-->
        <input id="files" ref="refFile" type="file" style="display: none" accept=".xml, .bpmn" @change="importLocalFile">
      </div>
      <!-- 创建一个canvas画布 npmn-js是通过canvas实现绘图的，并设置ref让vue获取到element -->
      <div class="bpmn-container">
        <div ref="canvas" class="bpmn-canvas" />
        <!-- 工具栏显示的地方 -->
        <div id="js-properties-panel" class="bpmn-js-properties-panel" />
      </div>
    </div>

    <!-- 保存弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="保存">
      <el-form :model="bpmnInfo">
        <el-form-item label="名称">
          <el-input v-model="bpmnInfo.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="bpmnInfo.description" placeholder="请输入" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import BpmnModeler from 'bpmn-js/lib/Modeler'
// 工具栏相关
// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
// import propertiesPanelModule from 'bpmn-js-properties-panel'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
// 汉化
import customTranslate from '../components/customTranslate'
// xmljson转化
import convert from 'xml-js'
// qs转化data提交数据
import qs from 'qs'
export default {
  data() {
    return {
      bpmnModeler: null, // npmn对象
      canvas: null, // 画布对象
      bpmnTemplate: `
          <?xml version="1.0" encoding="UTF-8"?>
          <definitions
              xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
              xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
              xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
              xmlns:xsd="http://www.w3.org/2001/XMLSchema"
              xmlns:activiti="http://activiti.org/bpmn"
              id="m1577635100724"
              name=""
              targetNamespace="http://www.activiti.org/testm1577635100724"
            >
            <process id="process" processType="None" isClosed="false" isExecutable="true">
              <extensionElements>
                <camunda:properties>
                  <camunda:property name="a" value="1" />
                </camunda:properties>
              </extensionElements>
              <startEvent id="_2" name="start" />
            </process>
            <bpmndi:BPMNDiagram id="BPMNDiagram_leave">
              <bpmndi:BPMNPlane id="BPMNPlane_leave" bpmnElement="leave">
                <bpmndi:BPMNShape id="BPMNShape__2" bpmnElement="_2">
                  <omgdc:Bounds x="144" y="368" width="32" height="32" />
                  <bpmndi:BPMNLabel>
                    <omgdc:Bounds x="149" y="400" width="23" height="14" />
                  </bpmndi:BPMNLabel>
                </bpmndi:BPMNShape>
              </bpmndi:BPMNPlane>
            </bpmndi:BPMNDiagram>
          </definitions>
      `,
      dialogVisible: false, // 弹窗控制
      bpmnInfo: { // bpmn信息
        name: '',
        description: ''
      },
      defaultZoom: 1, // 默认缩放
      recoverable: false, // 恢复
      revocable: false// 撤销
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 保存弹窗
    handleDialog() {
      this.$set(this.bpmnInfo, 'name', '')
      this.$set(this.bpmnInfo, 'description', '')
      this.dialogVisible = true
    },
    async handleSubmit() {
      if (!this.bpmnInfo['name']) {
        this.$message.error('请填写名称')
        return
      }
      let svg_xml, json_xml
      await this.bpmnModeler.saveSVG((err, svg) => {
        if (err) return
        svg_xml = svg.slice(svg.indexOf('<svg'))
      })
      await this.bpmnModeler.saveXML({ format: true }, async(err, xml) => {
        if (err) return
        json_xml = convert.xml2json(xml, { compact: true, spaces: 0 })
      })
      const data = {
        ...this.bpmnInfo,
        json_xml,
        svg_xml
      }
      await request({
        url: `${api.linkageManage.insertBpmn}/${this.id}/save`,
        method: 'put',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        data: qs.stringify(data)
      }).then(({ code }) => {
        if (code !== 1) return
        this.$message.success('保存成功')
        this.$router.back()
      })
    },
    // 下载下拉
    handleDropdown(e) {
      switch (e) {
        case 'bpmn':
          this.downloadBpmn()
          break
        case 'svg':
          this.downloadSvg()
          break
        default:
          break
      }
    },
    // 加载本地文件
    importLocalFile() {
      const that = this
      const file = this.$refs.refFile.files[0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = function() {
        let xmlStr = this.result
        that.createNewDiagram(xmlStr)
      }
    },
    // 下载流程图到本地
    async downloadProcess(type, name) {
      try {
        const _this = this
        // 按需要类型创建文件并下载
        if (type === 'xml' || type === 'bpmn') {
          await this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
            // 读取异常时抛出异常
            if (err) {
              console.error(`[Process Designer Warn ]: ${err.message || err}`)
            }
            let { href, filename } = _this.setEncoded(type.toUpperCase(), name, xml)
            downloadFunc(href, filename)
          })
        } else {
          await this.bpmnModeler.saveSVG((err, svg) => {
            // 读取异常时抛出异常
            if (err) {
              return console.error(err)
            }
            let { href, filename } = _this.setEncoded('SVG', name, svg)
            downloadFunc(href, filename)
          })
        }
      } catch (e) {
        console.error(`[Process Designer Warn ]: ${e.message || e}`)
      }
      // 文件下载方法
      function downloadFunc(href, filename) {
        if (href && filename) {
          let a = document.createElement('a')
          a.download = filename // 指定下载的文件名
          a.href = href //  URL对象
          a.click() // 模拟点击
          URL.revokeObjectURL(a.href) // 释放URL 对象
        }
      }
    },
    // 根据所需类型进行转码并返回下载地址
    setEncoded(type, filename = 'diagram', data) {
      const encodedData = encodeURIComponent(data)
      return {
        filename: `${filename}.${type}`,
        href: `data:application/${type === 'svg' ? 'text/xml' : 'bpmn20-xml'};charset=UTF-8,${encodedData}`,
        data: data
      }
    },
    // 点击导入
    openBpmn(file) {
      const reader = new FileReader()
      // 读取File对象中的文本信息，编码格式为UTF-8
      reader.readAsText(file, 'utf-8')
      reader.onload = () => {
        // 读取完毕后将文本信息导入到Bpmn建模器
        // this.createNewDiagram(reader.result)
      }
      return false
    },
    /* 创建新的流程图 */
    // async createNewDiagram(xml) {
    //   // 将字符串转换成图显示出来
    //   let newId = this.processId || `Process_${new Date().getTime()}`
    //   let newName = this.processName || `业务流程_${new Date().getTime()}`
    //   let xmlString = xml || DefaultEmptyXML(newId, newName, this.prefix)
    //   try {
    //     console.log(this.bpmnModeler.importXML)
    //     let { warnings } = await this.bpmnModeler.importXML(xmlString)
    //     if (warnings && warnings.length) {
    //       warnings.forEach(warn => console.warn(warn))
    //     }
    //   } catch (e) {
    //     console.error(`[Process Designer Warn]: ${e?.message || e}`)
    //   }
    // },
    getFilename(xml) {
      let start = xml.indexOf('process')
      let filename = xml.substr(start, xml.indexOf('>'))
      filename = filename.substr(filename.indexOf('id') + 4)
      filename = filename.substr(0, filename.indexOf('"'))
      return filename
    },
    // 下载
    download({ name = 'diagram.bpmn', data }) {
      // 这里就获取到了之前设置的隐藏链接
      const downloadLink = this.$refs.downloadLink
      // 把数据转换为URI，下载要用到的
      const encodedData = encodeURIComponent(data)
      if (data) {
        // 将数据给到链接
        downloadLink.href =
          'data:application/bpmn20-xml;charset=UTF-8,' + encodedData
        // 设置文件名
        downloadLink.download = name
        // 触发点击事件开始下载
        downloadLink.click()
      }
    },
    // 初始化
    async init() {
      // 获取画布 element
      this.canvas = this.$refs.canvas
      // 将汉化包装成一个模块
      const customTranslateModule = {
        translate: ['value', customTranslate]
      }
      // 创建Bpmn对象
      this.bpmnModeler = new BpmnModeler({
        // 设置bpmn的绘图容器为上门获取的画布 element
        container: this.canvas,
        // 加入工具栏支持
        propertiesPanel: {
          parent: '#js-properties-panel'
        },
        additionalModules: [
          // 工具栏模块
          // propertiesProviderModule,
          // propertiesPanelModule,
          // 汉化模块
          customTranslateModule
        ],
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        }
      })
      await this.createNewDiagram(this.bpmnTemplate)
      this.initModelListeners()
    },
    // 对齐
    elementsAlign(align) {
      const Align = this.bpmnModeler.get('alignElements')
      const Selection = this.bpmnModeler.get('selection')
      const SelectedElements = Selection.get()
      if (!SelectedElements || SelectedElements.length <= 1) {
        this.$message.warning('请按住 Ctrl 键选择多个元素对齐')
        return
      }
      this.$confirm('自动对齐可能造成图形变形，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => Align.trigger(SelectedElements, align))
    },
    // 会服
    processRedo() {
      this.bpmnModeler.get('commandStack').redo()
    },
    // 撤销
    processUndo() {
      this.bpmnModeler.get('commandStack').undo()
    },
    // 重新绘制
    processRestart() {
      this.recoverable = false
      this.revocable = false
      this.createNewDiagram(null)
    },
    // 放大试图
    processZoomIn(zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 + zoomStep * 100) / 100
      if (newZoom > 4) {
        throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
      }
      this.defaultZoom = newZoom
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    // 缩小视图
    processZoomOut(zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 - zoomStep * 100) / 100
      if (newZoom < 0.2) {
        throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
      }
      this.defaultZoom = newZoom
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    // 重置视图并居中
    processReZoom() {
      this.defaultZoom = 1
      this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
    },
    // 初始化监听事件
    initModelListeners() {
      const EventBus = this.bpmnModeler.get('eventBus')
      // const that = this
      // 注册需要的监听事件, 将. 替换为 - , 避免解析异常
      // const events = ['element.click']
      // events.forEach(event => {
      //   EventBus.on(event, function(eventObj) {
      //     let eventName = event.replace(/\./g, '-')
      //     let element = eventObj ? eventObj.element : null
      //     that.$emit(eventName, element, eventObj)
      //   })
      // })
      // 监听图形改变返回xml
      EventBus.on('commandStack.changed', async event => {
        try {
          this.recoverable = this.bpmnModeler.get('commandStack').canRedo()
          this.revocable = this.bpmnModeler.get('commandStack').canUndo()
          // let { xml } = await this.bpmnModeler.saveXML({ format: true })
          // this.$emit('commandStack-changed', event)
          // this.$emit('input', xml)
          // this.$emit('change', xml)
        } catch (e) {
          console.error(`[Process Designer Warn]: ${e.message || e}`)
        }
      })
      // 监听视图缩放变化
      this.bpmnModeler.on('canvas.viewbox.changed', ({ viewbox }) => {
        // this.$emit('canvas-viewbox-changed', { viewbox })
        const { scale } = viewbox
        this.defaultZoom = Math.floor(scale * 100) / 100
      })
    }
  }
}
</script>

<style scoped>
  @import '~bpmn-js/dist/assets/diagram-js.css';
  @import '~bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  @import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  @import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
  @import '~bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';
.bpmn-container {
  width: 100%;
  height: 100vh;
  display: flex;
}
.bpmn-canvas {
  width: calc(100% - 300px);
  height: 100vh;
}
.bpmn-js-properties-panel {
  width: 320px;
  height: inherit;
  overflow-y: auto;
}
.action {
  /* position: fixed;
  bottom: 10px;
  left: 10px; */
  display: flex;
  margin-left: 20px;
  margin-top: 10px;
}
.upload-demo {
  margin-right: 10px;
}
</style>
