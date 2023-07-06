<template>
  <div class="app-container">
    <div class="filter-container no-padding">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="findVideoGroupQuery.name" v-permission="['Search']" placeholder="请输入分组名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="findVideoGroup">查询</el-button>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="videoGroup"
        fit
        highlight-current-row
        style="width: 100%;"
        @expand-change="openGroupChildren"
      >
        <el-table-column type="expand" prop="id">
          <template slot-scope="props">
            <el-table :data="props.row.children" style="width: 100%">
              <el-table-column type="index" label="NO" width="50" />
              <el-table-column label="设备名称" width="" show-overflow-tooltip>
                <template slot-scope="{row}">
                  {{ setTableField(row.dvrId, 'chnDvrListByGroup', 'title') }}
                </template>
              </el-table-column>
              <el-table-column label="设备IP" show-overflow-tooltip>
                <template slot-scope="{row}">
                  {{ setTableField(row.dvrId, 'chnDvrListByGroup', 'ip') }}
                </template>
              </el-table-column>
              <el-table-column label="通道" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.cname }}</span>
                </template>
              </el-table-column>
              <el-table-column label="所在区域" width="200" show-overflow-tooltip>
                <template slot-scope="{row}">
                  {{ setArea(row.orgId) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="200">
                <template slot-scope="{row}">
                  <div :class="row.status === 1 ? 'success' : 'danger'">
                    <i :class="row.status === 1 ? 'el-icon-success' : 'el-icon-error'" />
                    {{ row.status === 1 ? '在线' : '离线' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="250">
                <template slot-scope="{row}">
                  <el-button v-permission="['CancelBindDvr']" size="mini" type="danger" @click="onDeleteGroupChn(row)">
                    取消关联
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="分组名称" prop="name" align="left" width="150" show-overflow-tooltip />
        <el-table-column label="轮询时间" prop="pollingTime" align="right" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.pollingTime }}秒
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{row}">
            <el-button v-permission="['BindDvr']" size="mini" type="primary" @click="openBindVideo(row)">
              关联摄像头
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEditGroup(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDeleteGroup(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="videoGroupDialogTitle" :visible.sync="showVideoGroupDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="videoGroupForm" :model="videoGroupForm" :rules="videoGroupRules">
          <el-form-item label="分组名称" label-width="100px" prop="name">
            <el-input v-model="videoGroupForm.name" placeholder="请输入分组名称" />
          </el-form-item>
          <el-form-item label="轮询时长" label-width="100px" prop="pollingTime">
            <el-input v-model="videoGroupForm.pollingTime" placeholder="请输入轮询时长" type="number" :min="1">
              <template slot="append">秒</template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showVideoGroupDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="comfirmVideoGroup">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="关联摄像头" :visible.sync="showBindDeviceDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <div v-permission="['DvrSearch']" class="filter-container no-padding">
          <el-input v-model="findVideoChnQuery.title" placeholder="请输入设备名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-input v-model="findVideoChnQuery.ip" placeholder="请输入IP" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
          <el-select v-model="findVideoChnQuery.devTypeId" clearable placeholder="请选择设备类型" class="filter-item">
            <el-option label="所有类型" value="" />
            <el-option
              v-for="item in typeArr"
              :key="item.hyDevTypeId"
              :label="item.hyDevTypeName"
              :value="item.hyDevTypeId"
            />
          </el-select>
          <el-select v-model="findVideoChnQuery.orgId" clearable placeholder="请选择区域" class="filter-item">
            <el-option label="所有区域" value="" />
            <el-option
              v-for="item in areaArr"
              :key="item.hyAreaId"
              :label="item.hyAreaName"
              :value="item.hyAreaId"
            />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="findVideoChnList">查询</el-button>
        </div>
        <div class="table-wrapper">
          <el-table
            ref="deviceTable"
            highlight-current-row
            :data="videoChnList"
            :row-key="getRowKeys"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" :reserve-selection="false" />
            <el-table-column type="index" label="NO" width="50" />
            <el-table-column label="设备名称" width="">
              <template slot-scope="{row}">
                {{ setTableField(row.dvrId, 'chnDvrList', 'title') }}
              </template>
            </el-table-column>
            <el-table-column label="设备IP">
              <template slot-scope="{row}">
                {{ setTableField(row.dvrId, 'chnDvrList', 'ip') }}
              </template>
            </el-table-column>
            <el-table-column label="通道">
              <template slot-scope="{row}">
                <span>{{ row.cname }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所在区域" width="200">
              <template slot-scope="{row}">
                {{ setArea(row.orgId) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="200">
              <template slot-scope="{row}">
                <div :class="row.status === 1 ? 'success' : 'danger'">
                  <i :class="row.status === 1 ? 'el-icon-success' : 'el-icon-error'" />
                  {{ row.status === 1 ? '在线' : '离线' }}
                </div>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="videoChnListTotal > 0" :auto-scroll="false" :total="videoChnListTotal" :page.sync="findVideoChnQuery.page" :limit.sync="findVideoChnQuery.limit" @pagination="findVideoChnList" />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBindDeviceDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="comfirmBindDevice">确 定</el-button>
      </div>
    </el-dialog>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="findVideoGroupQuery.page" :limit.sync="findVideoGroupQuery.limit" @pagination="findVideoGroup()" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'
import Pagination from '@/components/Pagination'
import { arrItemExist } from '@/utils/utils'

export default {
  components: { Pagination },
  data() {
    var checkedTime = (rule, value, callback) => {
      if (!value) return callback(new Error('请输入'))
      if (value <= 0) return callback(new Error('时长不能小于0'))
      callback()
    }
    return {
      findVideoGroupQuery: {
        name: '',
        page: 1,
        limit: 10
      },
      listTotal: 1,
      videoGroup: [],
      showVideoGroupDialog: false,
      videoGroupDialogTitle: '',
      videoGroupForm: {
        userId: '',
        name: '',
        pollingTime: ''
      },
      videoGroupFormId: '',
      videoGroupRules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ],
        pollingTime: [
          { validator: checkedTime, required: true, trigger: 'blur' }
        ]
      },
      userSession: getUserSession(),
      showBindDeviceDialog: false,
      videoChnListTotal: 0,
      findVideoChnQuery: {
        title: '',
        ip: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      videoChnList: [],
      chnDvrList: [],
      chnDvrListByGroup: [],
      areaArr: [],
      typeArr: [],
      bindVideoChnIds: [],
      bindVideoDvrIds: [],
      videoGroupId: '',
      videoGroupChannel: [], // 分组关联的通道
      selectGroupChn: [], // 选择的所有通道
      existGroupChnIds: [], // 存在数据库的分组所有通道id
      checkGroupChnIds: [], // 选中的分组所有通道id
      activeActionGroupIdx: 0, // 当前操作的分组索引
      multipleSelectionAll: [],
      multipleSelection: []
    }
  },
  computed: {
    // 设置表格字段内容
    setTableField() {
      return function(dvrId, dataName, field) {
        const data = dataName === 'chnDvrListByGroup' ? this.chnDvrListByGroup : this.chnDvrList
        const idx = data.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return data[idx][`${field}`]
        }
      }
    },
    // 区域
    setArea() {
      const that = this
      return function(orgId) {
        const idx = that.areaArr.findIndex(item => item.hyAreaId === orgId)
        if (idx !== -1) {
          return that.areaArr[idx].hyAreaName
        }
      }
    }
  },
  mounted() {
    this.findVideoGroup()
    this.getAreaArr()
    this.getTypeArr()
  },
  methods: {
    // 获取分组
    findVideoGroup() {
      request({ url: api.video.findVideoGroup, data: { ...this.findVideoGroupQuery, userId: this.userSession.userId }}).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.children = []
          })
          this.videoGroup = res.data
          this.listTotal = Number(res.count)
        }
      })
    },
    // 获取分组通道
    async findVideoGroupChannel(data) {
      return await request({ url: api.video.findVideoGroupChannel, data }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 打开创建
    handleCreate() {
      this.videoGroupDialogTitle = '新增分组'
      this.showVideoGroupDialog = true
      this.videoGroupFormId = ''
      Object.keys(this.videoGroupForm).forEach(key => {
        this.$set(this.videoGroupForm, `${key}`, '')
      })
    },
    // 确定提交分组
    comfirmVideoGroup() {
      const apiName = this.videoGroupFormId !== '' ? api.video.updateVideoGroup : api.video.insertVideoGroup
      const data = this.videoGroupFormId !== '' ? { ...this.videoGroupForm, id: this.videoGroupFormId, userId: this.userSession.userId } : { ...this.videoGroupForm, userId: this.userSession.userId }
      this.$refs.videoGroupForm.validate(valid => {
        if (valid) {
          request({ url: apiName, data }).then(res => {
            if (res.code === 1) {
              this.showVideoGroupDialog = false
              this.findVideoGroup()
              this.$message({
                type: 'success',
                message: res.msg
              })
            } else {
              this.$message({
                type: 'success',
                message: res.msg
              })
            }
          })
        }
      })
    },
    // 打开编辑分组
    onEditGroup(row) {
      this.showVideoGroupDialog = true
      this.videoGroupDialogTitle = '编辑分组'
      this.videoGroupFormId = row.id
      Object.keys(this.videoGroupForm).forEach(key => {
        this.$set(this.videoGroupForm, `${key}`, row[`${key}`])
      })
    },
    // 删除分组
    onDeleteGroup(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({ url: api.video.deleteVideoGroup, data: { id: row.id }}).then(res => {
          if (res.code === 1) {
            this.showVideoGroupDialog = false
            this.findVideoGroup()
            this.$message({
              type: 'success',
              message: res.msg
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        })
      }).catch(() => {})
    },
    // 打开关联摄像头
    async openBindVideo(row) {
      this.$set(this.findVideoChnQuery, 'page', 1)
      this.showBindDeviceDialog = true
      this.videoGroupId = row.id
      this.findVideoGroupChannel({
        groupId: row.id,
        page: 1,
        limit: -1
      }).then(async res => {
        this.$refs.deviceTable.clearSelection()
        await this.setMultipleSelectionAll(res)
        this.videoGroupChannel = res.data
        this.findVideoChnList()
      })
    },
    // 确定提交关联摄像头
    comfirmBindDevice() {
      // 再执行一次记忆勾选数据匹配，目的是为了在当前页操作勾选后直接获取选中数据
      this.changePageCoreRecordData()
      const selectGroupChnIds = []
      this.multipleSelectionAll.forEach(item => {
        selectGroupChnIds.push(item.cid)
      })
      const delIds = arrItemExist(this.existGroupChnIds, selectGroupChnIds)
      const addIds = arrItemExist(selectGroupChnIds, this.existGroupChnIds)
      if (addIds.length > 0) { // 添加关联
        const dvrIds = []
        this.multipleSelectionAll.forEach(item => {
          const idx = addIds.findIndex(items => items === item.cid)
          if (idx !== -1) {
            dvrIds.push(item.dvrId)
          }
        })
        this.insertVideoGroupChannel(addIds, dvrIds)
      }
      if (delIds.length > 0) { // 删除关联
        const delGroupChannel = []
        this.videoGroupChannel.forEach(item => {
          const idx = delIds.findIndex(items => items === item.channelId)
          if (idx !== -1) {
            delGroupChannel.push(item.id)
          }
        })
        this.deleteVideoGroupChannelByIds(delGroupChannel.toString())
      }
      if (addIds.length > 0 || delIds.length > 0) {
        this.$message({
          type: 'success',
          message: '更新成功'
        })
      }
      this.showBindDeviceDialog = false
    },
    // 获取通道列表
    findVideoChnList() {
      if (this.findVideoChnQuery.page > 1) this.changePageCoreRecordData()
      this.findVideoChn(this.findVideoChnQuery).then(res => {
        this.videoChnList = res.data
        this.videoChnListTotal = Number(res.count)
        if (res.data.length > 0) {
          const ids = []
          res.data.forEach(item => {
            ids.push(item.dvrId)
          })
          this.findVideoDvr(ids).then(res => {
            this.chnDvrList = res.data
          })
        }
        const that = this
        setTimeout(() => {
          that.setSelectRow()
        }, 500)
      })
    },
    async setMultipleSelectionAll(res) {
      return new Promise(resolve => {
        const cIds = []
        const multipleSelectionAll = []
        res.data.forEach(item => {
          cIds.push(item.channelId)
          multipleSelectionAll.push({
            cid: item.channelId
          })
        })
        this.existGroupChnIds = cIds
        this.multipleSelectionAll = multipleSelectionAll
        resolve(true)
      })
    },
    // 获取通道
    async findVideoChn(data) {
      return await request({
        url: api.video.findVideoChn,
        data
      })
        .then(res => {
          if (res.code === 1) {
            return res
          }
        })
    },
    // 获取通道dvr
    async findVideoDvr(ids) {
      return await request({
        url: api.video.findVideoDvr,
        data: { ids: ids.toString(), page: 1, limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            return res
          }
        })
    },
    // 获取区域
    getAreaArr() {
      request({ url: api.area.findHyitArea, data: {}}).then(res => {
        if (res.code === 1) {
          this.areaArr = res.data
        }
      })
    },
    // 获取类型select
    getTypeArr() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].hyDevTypeId = res.data[i].id
              res.data[i].hyDevTypeName = res.data[i].dictdataName
            }
            this.typeArr = res.data
          }
        })
    },
    // 新增
    insertVideoGroupChannel(channelIds, dvrIds) {
      if (channelIds.length > 0 && dvrIds.length > 0) {
        request({
          url: api.video.insertVideoGroupChannel,
          data: {
            groupId: this.videoGroupId,
            dvrIds: dvrIds.toString(),
            channelIds: channelIds.toString()
          }
        }).then(res => {
          if (res.code === 1) {
            this.openGroupChildren({ id: this.videoGroupId })
          }
        })
      } else {
        this.$message('请选择设备')
      }
    },
    // 展开分组获取设备
    openGroupChildren(val) {
      // 查询出分组关联的设备记录
      this.findVideoGroupChannel({
        groupId: val.id,
        page: 1,
        limit: -1
      }).then(videoGroupChannelRes => {
        this.videoGroupChannel = videoGroupChannelRes.data
        if (videoGroupChannelRes) {
          // 存储分组关联dvrid和通道id
          const cIds = []
          const dvrIds = []
          videoGroupChannelRes.data.forEach(item => {
            cIds.push(item.channelId)
            dvrIds.push(item.dvrId)
          })
          // 批量获取通道
          this.findVideoChn({
            ids: cIds.toString(),
            page: 1,
            limit: -1
          }).then(videoChnRes => {
            if (videoChnRes) {
              const videoGroupIdx = this.videoGroup.findIndex(item => item.id === val.id) // 查找出当前折展开的是第几个分组
              // 获取出分组关联的通道id
              const groupChnIds = []
              videoGroupChannelRes.data.forEach(item => {
                groupChnIds.push(item.channelId)
              })
              // 用分组关联的通道id去匹配批量获取的通道信息
              const groupChnList = []
              videoChnRes.data.forEach(item => {
                const idx = groupChnIds.findIndex(items => items === item.cid)
                if (idx !== -1) {
                  groupChnList.push(item)
                }
              })
              this.$set(this.videoGroup[videoGroupIdx], 'children', groupChnList) // 将匹配完成的通道插入到分组的子表格中
            }
          })
          // 批量获取通道对应的dvr信息
          this.findVideoDvr(dvrIds).then(videoDvrRes => {
            if (videoDvrRes) {
              videoDvrRes.data.forEach(item => {
                const idx = this.chnDvrListByGroup.findIndex(items => items.dvrId === item.dvrId)
                if (idx === -1) {
                  this.$set(this.chnDvrListByGroup, this.chnDvrListByGroup.length, item)
                }
              })
            }
          })
        }
      })
    },
    // 取消关联
    onDeleteGroupChn(row) {
      this.$confirm('确认取消关联吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const idx = this.videoGroupChannel.findIndex(item => item.channelId === row.cid)
        const groupIdx = this.videoGroup.findIndex(item => item.id === this.videoGroupChannel[idx].groupId)
        this.videoGroupId = this.videoGroup[groupIdx].id
        if (idx !== -1) {
          this.deleteVideoGroupChannelByIds(this.videoGroupChannel[idx].id)
        }
      }).catch(() => {})
    },
    // 获取行键
    getRowKeys(row) {
      return row.cid
    },
    // 数组对象去重
    reduceSame: function(arr) {
      const obj = {}
      return arr.reduce(function(prev, item) {
        obj[item.cid] ? '' : (obj[item.cid] = 1 && prev.push(item))
        return prev
      }, [])
    },
    // 批量删除分组关联的通道
    deleteVideoGroupChannelByIds(ids) {
      request({ url: api.video.deleteVideoGroupChannelByIds, data: { ids }}).then(res => {
        if (res.code === 1) {
          this.openGroupChildren({ id: this.videoGroupId })
        }
      })
    },
    // 表格选中
    setSelectRow() {
      if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
        return
      }
      // 标识当前行的唯一键的名称
      const idKey = 'cid'
      const selectAllIds = []
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(row[idKey])
      })
      this.$refs.deviceTable.clearSelection()
      for (let i = 0; i < this.videoChnList.length; i++) {
        if (selectAllIds.indexOf(this.videoChnList[i][idKey]) >= 0) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.deviceTable.toggleRowSelection(this.videoChnList[i], true)
        }
      }
    },
    // 记忆选择
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      const idKey = 'cid'
      const that = this
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.multipleSelection
        return
      }
      // 总选择里面的key集合
      const selectAllIds = []
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(row[idKey])
      })
      const selectIds = []
      // 获取当前页选中的id
      this.multipleSelection.forEach(row => {
        selectIds.push(row[idKey])
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(row[idKey]) < 0) {
          that.multipleSelectionAll.push(row)
        }
      })
      const noSelectIds = []
      // 得到当前页没有选中的id
      this.videoChnList.forEach(row => {
        if (selectIds.indexOf(row[idKey]) < 0) {
          noSelectIds.push(row[idKey])
        }
      })
      noSelectIds.forEach(id => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < that.multipleSelectionAll.length; i++) {
            if (that.multipleSelectionAll[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.multipleSelectionAll.splice(i, 1)
              break
            }
          }
        }
      })
    },
    // 选择事件
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>
