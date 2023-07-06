<template>
  <div class="config-content-left-component">
    <div class="left-title">
      <div class="left-title-text">设备列表</div>
    </div>
    <div ref="leftElemnts" class="left-elements">
      <div v-for="groupItem of devTypeList" :key="groupItem.id" class="elements-group-item">
        <div class="group-item-header pointer" @click="handleDevType(groupItem)">
          <div class="item-header-left">
            {{ groupItem.dictdataName }}
          </div>
          <div class="item-header-right">
            <i :class="groupItem.active ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </div>
        </div>
        <div v-if="groupItem.active" class="group-item-main">
          <template v-if="groupItem.typeList">
            <div v-for="(item, index) of groupItem.typeList" :key="item.typeId">
              <div
                v-if="groupItem.anRequestData"
                :ref="item.typeId + '-parent'"
                class="elements-item pointer flexBox space-between"
                @click="handleDevice(groupItem, item, index)"
              >
                <div class="item-header-left overflow-text-a">
                  <TextTooltip :txt-info="item.typeName">{{ item.typeName }}</TextTooltip>
                </div>
                <div :ref="item.typeId + '-right'" class="item-header-right">
                  <i :class="item.active ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                </div>
              </div>
              <div
                v-else
                :ref="item.typeId + '-parent-type'"
                class="elements-item pointer flexBox space-between"
                draggable="true"
                @dragend="handleDragEnd($event, {...item.hostList[0],status:item.status,hyDevTypeValue:item.hyDevTypeValue})"
                @dragstart="handleDragStart($event, item.hostList[0])"
                @dragover.prevent="handleDragOver($event, item.hostList[0])"
              >
                <div :class="item.status === 1 ? 'success' : 'danger'" class="item-header-left overflow-text-a">
                  <TextTooltip
                    :txt-info="item.typeName + ' ' + item.hostList.length === 1 ? item.hostList[0].hostName : ''"
                  >
                    {{ item.typeName }} {{ item.hostList.length === 1 ? item.hostList[0].hostName : '' }}
                  </TextTooltip>
                </div>
              </div>
              <template v-if="item.active && item.hostList">
                <div v-for="items of item.hostList" :key="items.hostId" :ref="items.hostId + '-parent'">
                  <div
                    :class="items.status === 1 ? 'success' : 'danger'"
                    class="elements-item pointer overflow-text-a"
                    draggable="true"
                    style="text-indent: 28px;"
                    @dragend="handleDragEnd($event, items)"
                    @dragstart="handleDragStart($event, items)"
                    @dragover.prevent="handleDragOver($event, items)"
                  >
                    <TextTooltip :txt-info="items.hostName+(items.hyAddr?`(${items.hyAddr})`:'')">{{ items.hostName }}
                      {{ items.hyAddr ? `(${items.hyAddr})` : '' }}
                    </TextTooltip>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <div v-for="item of groupItem.hostList" :key="item.hostId">
              <div
                :class="item.status === 1 ? 'success' : 'danger'"
                class="elements-item pointer overflow-text-a"
                draggable="true"
                @dragend="handleDragEnd($event, item)"
                @dragstart="handleDragStart($event, item)"
                @dragover.prevent="handleDragOver($event, item)"
              >
                <TextTooltip :txt-info="item.hostName+(items.hyAddr?`(${items.hyAddr})`:'')">{{ item.hostName }}
                  {{ items.hyAddr ? `(${items.hyAddr})` : '' }}
                </TextTooltip>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div
      v-if="isShowTooltip"
      :style="{ top: tipY + 'px', left: tipX + 'px' }"
      class="tip-box"
    >
      {{ tipText }}
    </div>
    <div class="left-cabinet">
      <div class="left-title">
        <div class="left-title-text  flex-v-between" style="width: 100%;">
          <div>机柜</div>
          <div class="pointer" @click="addcabinet(),$parent.handlerItemType='cabinet'">
            <i class="el-icon-plus" />添加机柜
          </div>
        </div>
      </div>
      <div>
        <div
          v-for="item in cabinetList"
          :key="item.cabinetId"
          class="pointer font-14 py-5 px-10 cabinet-item flex"
          draggable="true"
          @dragend="handleDragEnd($event, item)"
          @dragstart="handleDragStart($event, item)"
          @dragover.prevent="handleDragOver($event, item)"
        >
          <div class="flex-1 linear-1">
            {{ item.name }}
          </div>
          <div>
            <i class="el-icon-minus mr-10" @click="onDeleteCabinetId(item)" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="showDialog" :append-to-body="true" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="机柜名称" prop="name">
            <el-input v-model.trim="form.name" placeholder="请输入机柜名称" />
          </el-form-item>
          <el-form-item label="总容量" prop="capacity">
            <el-input v-model.trim="form.capacity" type="number" placeholder="请输入总容量">
              <template slot="append">U</template>
            </el-input>
          </el-form-item>
          <el-form-item label="额定供电" prop="ratedPower">
            <el-input v-model.trim="form.ratedPower" type="number" placeholder="请输入额定供电">
              <template slot="append">KW</template>
            </el-input>
          </el-form-item>
          <el-form-item label="总重量" prop="weight">
            <el-input v-model.trim="form.weight" type="number" placeholder="请输入总容量">
              <template slot="append">KG</template>
            </el-input>
          </el-form-item>
          <el-form-item label="分组" prop="groupId">
            <AiTreeInput
              :key="reloadKey"
              :level-start-num="0"
              :field="{'id':'id','name':'groupName','parent':'parentId'}"
              :remote="api.diagram.findDiagramCabinetGroup"
              :infoapi="api.diagram.getDiagramCabinetGroup"
              placeholder="请输入上层分组"
              :param="{limit: -1}"
              :bind-value="form.groupId"
              :mounted-require="true"
              @input="inputParent"
            />
          </el-form-item>
          <el-form-item label="图标" label-width="110px" prop="imageUrl">
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
          <el-form-item label="描述" prop="des">
            <el-input v-model="form.des" placeholder="请输入描述" type="textarea" />
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
import request from '@/utils/request'
import api from '@/api/api'
import TextTooltip from '@/components/TextTooltip/TextTooltip'
import { getVuexStoragePermission } from '@/utils/auth'
import FileUpload from '@/components/Upload/file-upload.vue'
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
export default {
  name: 'TopoEl',
  components: {
    TextTooltip,
    FileUpload,
    AiTreeInput
  },
  data() {
    const checkGroupId = (val, rule, callback) => {
      if (val === 0 || val === '') return callback(new Error('请选择分组'))
      return callback()
    }
    return {
      devTypeList: [
        {
          dictdataName: 'IT监控设备',
          active: false,
          userDefineType: 2,
          fn: 'findItMonitorType',
          anRequestData: true,
          typeList: [],
          pKey: 'ConfigurationAdminItMonitor'
        },
        {
          dictdataName: '视频设备',
          active: false,
          userDefineType: 1,
          fn: 'findVideoType',
          anRequestData: false,
          typeList: [],
          pKey: 'ConfigurationAdminVideo'
        },
        {
          dictdataName: '动环设备',
          active: false,
          userDefineType: 4,
          fn: 'findRingType',
          anRequestData: true,
          typeList: [],
          pKey: 'ConfigurationAdminRing'
        },
        {
          dictdataName: '自定义',
          active: false,
          userDefineType: 8,
          hostList: [
            {
              hostId: '1',
              hostName: '自定义节点',
              elName: '自定义节点',
              diyNodeType: 1,
              userDefineType: 8,
              typeValue: 'image',
              isDiy: true
            },
            {
              hostId: '2',
              hostName: '自定义文本',
              elName: '自定义文本',
              diyNodeType: 2,
              userDefineType: 9,
              typeValue: 'rect',
              isDiy: true
            }
          ]
        }
      ],
      findHyitHostQuery: { devType: '', page: 1, limit: -1 }, // 主机查询参数
      dragging: null,
      isShowTooltip: false,
      tipX: 0,
      tipY: 0,
      tipText: '',
      getVuexStoragePermissionData: [],
      cabinetList: [],
      showDialog: false,
      form: {
        name: '',
        capacity: '',
        weight: '',
        ratedPower: '',
        des: '',
        groupId: 0
      },
      formId: '',
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        groupId: ''
      },
      lastStorage: {},
      fileList: [],
      dialogTitle: '新增机柜',
      rules: {
        name: [
          { required: true, message: '请输入机柜名称', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '请输入总容量', trigger: 'blur' }
        ],
        groupId: [
          {validator: checkGroupId, required: true, message: '请选择分组', trigger: 'change' }
        ]
      },
      reloadKey: 'reloadKey'
    }
  },
  mounted() {
    this.getVuexStoragePermissionData = getVuexStoragePermission()
    if (this.getVuexStoragePermissionData.length === 0) {
      this.slider = []
    } else {
      const getSlide = this.devTypeList
      const result = []
      getSlide.forEach(item => {
        const getPItem = this.getVuexStoragePermissionData.indexOf(item.pKey)
        if (getPItem !== -1) {
          result.push(item)
        }
      })
      this.devTypeList = result
    }
    this.findDiagramCabinet()
  },
  methods: {
    inputParent(val) {
      this.$set(this.form, 'groupId', Number(val))
    },
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'icon', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    confirm() {
      const data = { ...this.form }
      // if (data.groupId === '' || data.groupId === null) data.groupId = 0
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? this.api.diagram.updateDiagramCabinet : this.api.diagram.insertDiagramCabinet
          if (this.formId) {
            data.cabinetId = this.formId
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
              this.findDiagramCabinet()
              if (this.formId === '') {
                this.$EventBus.$emit('add-group-cabinet', { setInType: 'group', setInId: data.groupId, data: [res.model] })
              } else {
                this.$EventBus.$emit('update-group-cabinet', {
                  fromType: 'group',
                  fromPid: this.lastStorage.groupId,
                  toType: 'group',
                  toPid: data.groupId,
                  updateId: this.formId,
                  data: res.model
                })
              }
              // if (this.formId === '') {
              //   // 插入分组到分组
              //   this.$EventBus.$emit('add-group', { setInType: 'group', setInId: data.parentId, data: res.model })
              // } else {
              //   // 更新分组到分组
              //   this.$EventBus.$emit('update-group', {
              //     fromType: 'group', // 修改前分组挂在那个类型下 area：区域 group：分组
              //     fromPid: this.lastGroupStorage.parentId, // 修改前分组挂在的上层id 挂在区域下就是区域id，挂在分组就是分组id
              //     toType: 'group', // 修改后分组挂在那个类型下
              //     toPid: data.parentId, // 修改后分组挂在的上层id
              //     updateId: this.formId, // 要修改的节点
              //     data: res.model
              //   })
              // }
              this.findDiagramCabinet()
            }
          })
        }
      })
    },
    // 查询机柜
    async findDiagramCabinet() {
      this.$request({
        url: this.api.diagram.findDiagramCabinet,
        data: this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          const cabinetIds = []
          res.data.forEach(item => {
            cabinetIds.push(item.cabinetId)
          })
          const getDiagramCabinetStatistics = await this.getDiagramCabinetStatistics(cabinetIds.toString())
          if (getDiagramCabinetStatistics) {
            const cabinetStatisticsData = JSON.parse(getDiagramCabinetStatistics)
            res.data.forEach(item => {
              const idx = cabinetStatisticsData.findIndex(items => +items.cabinetId === +item.cabinetId)
              if (idx !== -1) {
                item.availability = cabinetStatisticsData[idx].availability
                item.availableCount = cabinetStatisticsData[idx].availableCount
                item.usedCount = cabinetStatisticsData[idx].usedCount
              }
            })
          }
          this.cabinetList = res.data.map(it => ({ ...it, userDefineType: 10 }))
          // this.cabinetTotal = +res.count
        }
      })
    },
    async getDiagramCabinet(cabinetId) {
      const {model, code} = await request({url: this.api.diagram.getDiagramCabinet, data: {cabinetId}})
      if (code === 1) this.form = model
    },
    // 查询机柜
    async getDiagramCabinetStatistics(cabinetIds) {
      const { code, model } = await this.$request({
        url: this.api.diagram.getDiagramCabinetStatistics,
        data: { cabinetIds }
      })
      if (code !== 1) return
      return model
    },
    async addcabinet(id) {
      if (id) {
        this.formId = id
        await this.getDiagramCabinet(id)
      }
      this.showDialog = true
    },
    async onDeleteCabinetId(item) {
      this.$confirm('确认删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let { msg } = await request({ url: api.diagram.deleteDiagramCabinet, data: { cabinetId: item.cabinetId }})
        this.$message.success(msg)
        await this.findDiagramCabinet()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // async findDiagramCabinet() {
    //   let { data, code } = await request({
    //     url: api.diagram.findDiagramCabinet,
    //     data: { diagramId: this.$route.query.id }
    //   })
    //   if (code === 1) this.cabinetList = data.map(it => ({ ...it, userDefineType: 10 }))
    // },

    // 开始拖拽主机
    handleDragStart(e, item) {
      this.dragging = item
    },
    // 首先把div变成可以放置的元素，即重写dragenter/dragover
    handleDragOver(e) {
      e.dataTransfer.dropEffect = 'move'// e.dataTransfer.dropEffect="move";//在dragenter中针对放置目标来设置!
    },
    // 结束拖拽
    handleDragEnd(e, item) {
      this.dragging = null
      this.$emit('handleDragHostEnd', { e, item })
    },
    // 展开设备类型
    handleDevType(item) {
      const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'userDefineType', item.userDefineType)
      this.$set(this.devTypeList[getItem.index], 'active', !item.active)
      if (item.active === true) {
        if (item.fn === 'findItMonitorType') this.findItMonitorType('findItMonitorType', item)
        if (item.fn === 'findVideoType') this.findVideoType('findVideoType', item)
        if (item.fn === 'findRingType') this.findRingType('findRingType', item)
      }
    },
    // 展开设备
    handleDevice(groupItem, item, index) {
      const deviceTitleIndex = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', groupItem.fn)
      this.$set(this.devTypeList[deviceTitleIndex.index].typeList[index], 'active', !item.active)
      if (item.fn === 'findItMonitorDevice') this.findItMonitorDevice(groupItem, index, item.typeId)
      if (item.fn === 'findVideoChn') this.findVideoChn(groupItem, index, item.typeId)
      if (item.fn === 'findRingDevice') this.findRingDevice(groupItem, index, item.typeId)
    },
    // 获取it监控设备类型
    findItMonitorType(type) {
      request({
        url: api.common.findSysDictionaryDetail, data: {
          page: 1,
          limit: -1,
          dictCode: 'it_dev_type'
        }
      }).then(res => {
        if (res.code === 1) {
          const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', type)
          const typeData = []
          res.data.forEach(item => {
            typeData.push({
              typeId: item.id,
              typeName: item.dictdataName,
              active: false,
              userDefineType: getItem.userDefineType,
              fn: 'findItMonitorDevice'
            })
          })
          this.$set(this.devTypeList[getItem.index], 'typeList', typeData)
        }
      })
    },
    // it监控设备
    findItMonitorDevice(groupItem, index, devType) {
      request({
        url: api.itMonitor.findHyitHost, data: {
          page: 1,
          limit: -1,
          keyword: '',
          hostType: 1,
          devType,
          agents: this.sessionStorageOperation('get', 'agentId')
        }
      }).then(res => {
        if (res.code === 1) {
          const deviceTitleIndex = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', groupItem.fn)
          const hostList = []
          res.data.forEach(item => {
            const count = item.hyAvailable + item.hySnmpAvailable + item.hyIpmiAvailable + item.hyJmxAvailable
            hostList.push({
              hostId: item.hyHostId,
              hostName: item.hyMarkName,
              hyZhostId: item.hyZhostId,
              agent: item.agent,
              userDefineType: groupItem.userDefineType,
              ip: item.hyIp,
              port: item.hyPort,
              devTypeId: devType,
              elName: item.hyMarkName,
              status: item.hyDevTypeId === 478 ? item.hyNetState === 1 ? 1 : 0 : count === 1 ? 1 : 0
            })
          })
          this.$set(this.devTypeList[deviceTitleIndex.index].typeList[index], 'hostList', hostList)
        }
      })
    },
    // 获取视频设备类型
    async findVideoType(type) {
      request({
        url: api.video.findVideoDvr, data: {
          page: 1,
          limit: -1
        }
      }).then(async res => {
        if (res.code === 1) {
          const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', type)
          const typeData = []
          res.data.forEach(item => {
            typeData.push({
              typeId: item.dvrId,
              typeName: item.title,
              active: false,
              userDefineType: getItem.userDefineType,
              fn: 'findVideoChn',
              anRequestData: getItem.anRequestData,
              hostList: [],
              ip: item.ip,
              port: item.port,
              status: item.status
            })
          })
          this.$set(this.devTypeList[getItem.index], 'typeList', typeData)
          const getVideoChn = await this.findVideoChn()
          this.devTypeList[getItem.index].typeList.forEach((titem, tindex) => {
            getVideoChn.forEach(citem => {
              if (titem.typeId === citem.dvrId) {
                this.$set(this.devTypeList[getItem.index].typeList[tindex].hostList, this.devTypeList[getItem.index].typeList[tindex].hostList.length, {
                  hostId: citem.cid,
                  hostName: citem.cname,
                  userDefineType: getItem.userDefineType,
                  ip: titem.ip,
                  port: titem.port,
                  devTypeId: 0,
                  elName: titem.typeName + citem.cname
                })
              }
            })
          })
        }
      })
    },
    // 获取视频通道
    async findVideoChn() {
      return new Promise(resolve => {
        request({ url: api.video.findVideoChn, data: { page: 1, limit: -1 }}).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 获取动环主机
    findRingType(type) {
      request({ url: api.powerEnv.findHyitHost, data: { page: 1, limit: -1, hyDevTypeId: 2 }}).then(res => {
        if (res.code === 1) {
          const getItem = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', type)
          const typeData = []
          res.data.forEach(item => {
            typeData.push({
              typeId: item.hyHostId,
              typeName: item.hyHostName,
              active: false,
              userDefineType: getItem.userDefineType,
              fn: 'findRingDevice',
              hyDevTypeValue: item.hyDevTypeValue,
              status: item.status
            })
          })
          this.$set(this.devTypeList[getItem.index], 'typeList', typeData)
        }
      })
    },
    // 动环设备
    findRingDevice(groupItem, index, hyHostId) {
      request({ url: api.powerEnv.findHyitDevice, data: { page: 1, limit: -1, hyHostId }}).then(res => {
        if (res.code === 1) {
          const deviceTitleIndex = this.$tool.findDataItemByAttr(this.devTypeList, 'fn', groupItem.fn)
          const hostList = []
          res.data.forEach(item => {
            hostList.push({
              hostId: item.hyDeviceId,
              hostName: item.hyAlias || '',
              userDefineType: groupItem.userDefineType,
              elName: item.hyAlias || '',
              devTypeId: 0,
              status: item.hyState === 1 ? 1 : 0,
              hyAddr: item.hyAddr,
              hyDevTypeValue: item.hyDevTypeValue
            })
            // console.log(item.hyState)
          })
          this.$set(this.devTypeList[deviceTitleIndex.index].typeList[index], 'hostList', hostList)
        }
      })
    },
    onMouseOver(e, key, value) {
      this.tipX = e.x + 15
      this.tipY = e.y
      const tag = this.$refs[key][0]
      const right = this.$refs[`${key}-right`] ? this.$refs[`${key}-right`][0].clientWidth : 0
      const parentWidth = this.$refs[`${key}-parent`][0].clientWidth // 获取元素父级可视宽度
      const contentWidth = tag.clientWidth + right // 获取元素可视宽度
      this.isShowTooltip = contentWidth >= parentWidth
      this.tipText = value
    },
    onMouseLeave() {
      this.isShowTooltip = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';

.tip-box {
  position: fixed;
  background: #fff;
  padding: 5px;
  color: #646464;
  border: 1px solid #ddd;
  z-index: 9;
}

.cabinet-item {
  user-select: none;
}
</style>
