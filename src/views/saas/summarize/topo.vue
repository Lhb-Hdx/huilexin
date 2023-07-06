<template>
  <div class="wrp">
    <div class="header">
      <h3>HYiPAAS统计拓扑图</h3>
    </div>
    <div id="container" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.8)" />

    <el-drawer title="公司配置" :visible.sync="drawerCompany" size="90%" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <div id="echart-company" class="drawer-body" />
      </div>
    </el-drawer>
    <el-drawer title="应用配置" :visible.sync="drawerApplication" size="90%" :wrapper-closable="false" direction="rtl">
      <div class="drawer-wrp">
        <div id="echart-application" class="drawer-body" />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import request from '@/utils/request'
import * as echarts from 'echarts'

const colors = {
  B: '#5B8FF9',
  R: '#F46649',
  Y: '#EEBC20',
  G: '#5BD8A6',
  DI: '#A7A7A7'
}

const props = {
  config: {
    padding: [20, 50],
    defaultLevel: 3,
    defaultZoom: 0.8,
    modes: { default: ['zoom-canvas', 'drag-canvas'] }
  }
}

const defaultConfig = {
  width,
  height,
  modes: {
    default: ['zoom-canvas', 'drag-canvas']
  },
  fitView: true,
  animate: true,
  defaultNode: {
    type: 'flow-rect'
  },
  defaultEdge: {
    type: 'cubic-horizontal',
    style: {
      stroke: '#CED4D9'
    }
  },
  layout: {
    type: 'indented',
    direction: 'LR',
    dropCap: false,
    indent: 300,
    getHeight: () => {
      return 60
    }
  }
}

const registerFn = () => {
  G6.registerNode(
    'flow-rect',
    {
      shapeType: 'flow-rect',
      draw (cfg, group) {
        const {
          name = '',
          variableName,
          variableValue,
          variableUp,
          label,
          collapsed,
          currency,
          status
        } = cfg
        const grey = '#CED4D9'

        const rectConfig = {
          width: 202,
          height: 60,
          lineWidth: 1,
          fontSize: 12,
          fill: '#fff',
          radius: 4,
          stroke: grey,
          opacity: 1
        }

        const nodeOrigin = {
          x: -rectConfig.width / 2,
          y: -rectConfig.height / 2
        }

        const textConfig = {
          textAlign: 'left',
          textBaseline: 'bottom'
        }

        const rect = group.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: nodeOrigin.y,
            ...rectConfig
          }
        })

        const rectBBox = rect.getBBox()

        // label title
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: 20 + nodeOrigin.y,
            text: name.length > 28 ? name.substr(0, 28) + '...' : name,
            fontSize: 12,
            opacity: 0.85,
            fill: '#000',
            cursor: 'pointer'
          },
          name: 'name-shape'
        })

        // price
        const price = group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: rectBBox.maxY - 12,
            text: label,
            fontSize: 16,
            fill: '#000',
            opacity: 0.85
          }
        })

        // label currency
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: price.getBBox().maxX + 5,
            y: rectBBox.maxY - 12,
            text: currency,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75
          }
        })

        // percentage
        const percentText = group.addShape('text', {
          attrs: {
            ...textConfig,
            x: rectBBox.maxX - 8,
            y: rectBBox.maxY - 12,
            text: `${((variableValue || 0) * 100).toFixed(2)}%`,
            fontSize: 12,
            textAlign: 'right',
            fill: colors[status]
          }
        })

        // percentage triangle
        const symbol = variableUp ? 'triangle' : 'triangle-down'
        const triangle = group.addShape('marker', {
          attrs: {
            ...textConfig,
            x: percentText.getBBox().minX - 10,
            y: rectBBox.maxY - 12 - 6,
            symbol,
            r: 6,
            fill: colors[status]
          }
        })

        // variable name
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: triangle.getBBox().minX - 4,
            y: rectBBox.maxY - 12,
            text: variableName,
            fontSize: 12,
            textAlign: 'right',
            fill: '#000',
            opacity: 0.45
          }
        })

        // bottom line background
        // const bottomBackRect = group.addShape('rect', {
        //   attrs: {
        //     x: nodeOrigin.x,
        //     y: rectBBox.maxY - 4,
        //     width: rectConfig.width,
        //     height: 4,
        //     radius: [0, 0, rectConfig.radius, rectConfig.radius],
        //     fill: '#E0DFE3'
        //   }
        // })

        // bottom percent
        // const bottomRect = group.addShape('rect', {
        //   attrs: {
        //     x: nodeOrigin.x,
        //     y: rectBBox.maxY - 4,
        //     width: rate * rectBBox.width,
        //     height: 4,
        //     radius: [0, 0, 0, rectConfig.radius],
        //     fill: colors[status]
        //   }
        // })

        // collapse rect
        if (cfg.children && cfg.children.length) {
          group.addShape('rect', {
            attrs: {
              x: rectConfig.width / 2 - 8,
              y: -8,
              width: 16,
              height: 16,
              stroke: 'rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              fill: '#fff'
            },
            name: 'collapse-back',
            modelId: cfg.id
          })

          // collpase text
          group.addShape('text', {
            attrs: {
              x: rectConfig.width / 2,
              y: -1,
              textAlign: 'center',
              textBaseline: 'middle',
              text: collapsed ? '+' : '-',
              fontSize: 16,
              cursor: 'pointer',
              fill: 'rgba(0, 0, 0, 0.25)'
            },
            name: 'collapse-text',
            modelId: cfg.id
          })
        }

        this.drawLinkPoints(cfg, group)
        return rect
      },
      update (cfg, item) {
        const group = item.getContainer()
        this.updateLinkPoints(cfg, group)
      },
      setState (name, value, item) {
        if (name === 'collapse') {
          const group = item.getContainer()
          const collapseText = group.find((e) => e.get('name') === 'collapse-text')
          if (collapseText) {
            if (!value) {
              collapseText.attr({
                text: '-'
              })
            } else {
              collapseText.attr({
                text: '+'
              })
            }
          }
        }
      },
      getAnchorPoints () {
        return [
          [0, 0.5],
          [1, 0.5]
        ]
      }
    },
    'rect'
  )
  G6.registerEdge(
    'flow-cubic',
    {
      getControlPoints (cfg) {
        let controlPoints = cfg.controlPoints // ָ��controlPoints
        if (!controlPoints || !controlPoints.length) {
          const { startPoint, endPoint, sourceNode, targetNode } = cfg
          const { x: startX, y: startY, coefficientX, coefficientY } = sourceNode
            ? sourceNode.getModel()
            : startPoint
          const { x: endX, y: endY } = targetNode ? targetNode.getModel() : endPoint
          let curveStart = (endX - startX) * coefficientX
          let curveEnd = (endY - startY) * coefficientY
          curveStart = curveStart > 40 ? 40 : curveStart
          curveEnd = curveEnd < -30 ? curveEnd : -30
          controlPoints = [
            { x: startPoint.x + curveStart, y: startPoint.y },
            { x: endPoint.x + curveEnd, y: endPoint.y }
          ]
        }
        return controlPoints
      },
      getPath (points) {
        const path = []
        path.push(['M', points[0].x, points[0].y])
        path.push([
          'C',
          points[1].x,
          points[1].y,
          points[2].x,
          points[2].y,
          points[3].x,
          points[3].y
        ])
        return path
      }
    },
    'single-line'
  )
}

const initGraph = (data) => {
  if (!data) {
    return
  }

  const { onInit, config } = props
  const tooltip = new G6.Tooltip({
    // offsetX and offsetY include the padding of the parent container
    offsetX: 20,
    offsetY: 30,
    // the types of items that allow the tooltip show up
    itemTypes: ['node'],
    // custom the tooltip's content
    getContent: (e) => {
      const outDiv = document.createElement('div')
      // outDiv.style.padding = '0px 0px 20px 0px';
      const nodeName = e.item.getModel().name
      let formatedNodeName = ''
      for (let i = 0; i < nodeName.length; i++) {
        formatedNodeName = `${formatedNodeName}${nodeName[i]}`
        if (i !== 0 && i % 20 === 0) formatedNodeName = `${formatedNodeName}<br/>`
      }
      outDiv.innerHTML = `${formatedNodeName}`
      return outDiv
    },
    shouldBegin: (e) => {
      if (e.target.get('name') === 'name-shape') return true
      return false
    }
  })
  graph = new G6.TreeGraph({
    container: 'container',
    ...defaultConfig,
    ...config,
    plugins: [tooltip]
  })
  if (typeof onInit === 'function') {
    onInit(graph)
  }
  graph.data(data)
  graph.render()
  graph.zoom(config.defaultZoom || 1)

  const handleCollapse = (e) => {
    const target = e.target
    const id = target.get('modelId')
    const item = graph.findById(id)
    const nodeModel = item.getModel()
    nodeModel.collapsed = !nodeModel.collapsed
    graph.layout()
    graph.setItemState(item, 'collapse', nodeModel.collapsed)
  }
  graph.on('collapse-text:click', (e) => {
    handleCollapse(e)
  })
  graph.on('collapse-back:click', (e) => {
    handleCollapse(e)
  })

  graph.on('name-shape:click', function (event) {
    // const { item } = event;
    // graph.setItemState(event.item, 'selected', true);
    var model = event.item._cfg.model
    // console.log('点击的model', JSON.stringify(model))
    if (model.classify === 'company') {
      that.drawerCompany = true
      that.drawerApplication = false
      that.modelCompany = model
      setTimeout(function() { that.echartsCompany() }, 800)
    } else if (model.classify === 'application') {
      that.drawerApplication = true
      that.drawerCompany = false
      that.modelApplication = model
      setTimeout(function() { that.echartsApplication() }, 800)
    }
  })
}

var container = null
var width = 1200
var height = 0
var graph = null
var that = null
export default {
  name: 'SummarizeTopo',
  data () {
    return {
      loading: false, drawerCompany: false, drawerApplication: false, modelCompany: null, modelApplication: null, chartCompanyDom: null, chartCompanyCanvas: null, chartCompanyOption: null
    }
  },
  async mounted () {
    that = this
    container = document.getElementById('container')
    width = container.scrollWidth
    height = container.scrollHeight

    if (typeof window !== 'undefined') {
      window.onresize = () => {
        if (!graph || graph.get('destroyed')) return
        if (!container || !container.scrollWidth || !container.scrollHeight) return
        graph.changeSize(container.scrollWidth, container.scrollHeight)
      }
    }

    registerFn()

    var companyData = await this.loadCompany()
    // console.log("companyData", JSON.stringify(companyData));
    companyData.data.forEach(c => {
      c.id = 'company-id-' + c.companyId
      c.name = c.companyName
      c.count = 100//
      c.label = '100'//
      c.currency = '台'
      c.rate = 1.0
      c.status = 'B'
      c.variableName = '告警'
      c.variableValue = 0.341
      c.variableUp = false
      c.classify = 'company'
      c.children = []
    })

    var appData = await this.loadApp()
    // console.log("appData", JSON.stringify(appData));

    var applicationData = await this.loadApplicationAppCompany()
    // console.log("applicationData", JSON.stringify(applicationData));
    applicationData.data.forEach(a => {
      a.appName = null
      a.companyName = null
      a.id = 'application-id-' + a.applicationId
      a.name = a.applicationName
      a.count = 100//
      a.label = '100'//
      a.currency = '台'
      a.rate = 1.0
      a.status = 'B'
      a.variableName = '告警'
      a.variableValue = 0.341
      a.classify = 'application'
      a.variableUp = false
    })

    var g6Data = { id: 'g1', name: 'HYiPAAS平台', count: companyData.data.length, label: (companyData.data.length).toString(), currency: '家', rate: 1.0, status: 'B', variableName: '告警', variableValue: 0.341, variableUp: false, children: companyData.data }

    g6Data.children.forEach(company => {
      applicationData.data.forEach(application => {
        if (parseInt(company.companyId) === parseInt(application.companyId)) {
          appData.data.forEach(app => {
            if (parseInt(app.appId) === parseInt(application.appId)) application.appName = app.appName
          })
          application.companyName = company.companyName
          company.children.push(application)
        }
      })
      company.count = company.children.length
      company.label = (company.children.length).toString()
    })

    // console.log("g6Data", JSON.stringify(g6Data))

    initGraph(g6Data)
  }, methods: {
    async loadCompany () {
      return await request({
        url: '/admin/findSaasCompany', data: { limit: -1 }
      })
    },
    async loadApp () {
      return await request({
        url: '/admin/findSaasSysApp', data: { limit: -1 }
      })
    },
    async loadApplicationAppCompany () {
      return await request({
        url: '/admin/findApplicationAppCompany', data: { limit: -1, classify: 'hysaas' }
      })
    },
    async loadDataStatistics () {
      return await request({
        url: '/admin/findDataStatistics', data: { companyId: this.modelCompany.companyId }
      })
    },
    async echartsCompany() {
      if (!this.chartCompanyDom) {
        console.log("创建 一个this.chartCompanyDom = document.getElementById('echart-company')")
        this.chartCompanyDom = document.getElementById('echart-company')
      }
      if (!this.chartCompanyCanvas) {
        console.log('创建一个this.chartCompanyCanvas')
        this.chartCompanyCanvas = echarts.init(this.chartCompanyDom)
      }
      if (!this.chartCompanyOption) {
        console.log('创建一个this.chartCompanyOption')
        this.chartCompanyOption = {
          title: {
            text: '企业设备统计'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Email',
              type: 'line',
              stack: 'Total',
              data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
              name: 'Union Ads',
              type: 'line',
              stack: 'Total',
              data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
              name: 'Video Ads',
              type: 'line',
              stack: 'Total',
              data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
              name: 'Direct',
              type: 'line',
              stack: 'Total',
              data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
              name: 'Search Engine',
              type: 'line',
              stack: 'Total',
              data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
          ]
        }
      }

      var _res = await this.loadDataStatistics()
      // console.log('_res', JSON.stringify(_res))
      var legendData = []
      var xAxisData = []
      var seriesData = []
      if (_res.data) {
        _res.data.forEach(item => {
          if (legendData.indexOf(item.name) < 0) {
            legendData.push(item.name)
            seriesData.push({name: item.name, type: 'line', stack: 'Total', data: []})
          }
          if (xAxisData.indexOf(item.statisticsDate) < 0) {
            xAxisData.push(item.statisticsDate)
          }
          seriesData.forEach(series => {
            if (series.name === item.name)series.data.push(item.count)
          })
        })
      }
      // console.log('legendData', JSON.stringify(legendData))
      // console.log('xAxisData', JSON.stringify(xAxisData))
      // console.log('seriesData', JSON.stringify(seriesData))

      this.chartCompanyOption.legend.data = legendData
      this.chartCompanyOption.xAxis.data = xAxisData
      this.chartCompanyOption.series = seriesData

      this.chartCompanyOption && this.chartCompanyCanvas.setOption(this.chartCompanyOption)
    },
    echartsApplication() {}
  }
}
</script>

<style lang="scss" scoped>
.wrp {
  position: relative;
  background: #fff;
}
.header {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}
#container,.drawer-wrp ,.drawer-body{
  width: 100%;
  height: 100%;
}
.drawer-wrp{
  padding:20px;
}
</style>
