<template>
  <div class="map">

    <!-- <div class="map_header">
   <el-button class="filter-item" type="primary" @click="openAddModal">新增</el-button>
   <el-input v-model="listQuery.ip" placeholder="请输入映射名称" style="width: 200px;margin: 0 20px;" class="filter-item" @keyup.enter.native="onFilter" />
   <el-button class="filter-item" type="primary" @click="onFilter">查询</el-button>
 </div> -->
    <div class="map_table">
      <el-table v-loading="mapListLoading" :data="tableData" style="width: 100%">
        <el-table-column label="NO" type="index" width="50" />
        <!-- <el-table-column prop="title" label="名称" width="100">
     </el-table-column> -->
        <el-table-column prop="name" align="left" label="名称" width="200" />
        <el-table-column prop="ip" align="right" label="ip" width="120" />
        <el-table-column prop="port" align="right" label="端口" />
        <el-table-column label="在线状态" align="left">
          <template slot-scope="{row}">
            <!-- <p>{{ row.port }}</p> -->
            <p :style="{color : row.status === 1 ? '#3CA170' : '#EB4C4C'} ">{{ row.status === 1 ? '在线' : '离线' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="映射IP" align="left" width="200">
          <template slot-scope="{row}">
            <!-- <p v-for="item in tableMap.VideoPortMap" :key="item.agree">
          <p v-if="item.agree == row.clientid">{{item.mappingIp}}</p>
        </p> -->
            <p v-for="item in tableMap.VideoPortMap" :key="item.agree">
              {{ row.clientId == item.agree ? item.mappingIp : '' }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="映射端口" align="right">
          <template slot-scope="{row}">
            <!-- <p v-for="item in tableMap" :key="item.agree">
          <p v-if="item.agree == row.clientid">{{item.mappingPort}}</p>
        </p> -->
            <p v-for="item in tableMap.VideoPortMap" :key="item.agree">
              {{ row.clientId == item.agree ? item.mappingPort : '' }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="是否启用" align="left">
          <template slot-scope="{row}">
            <!-- <div v-for="item in tableMap" :key="item.agree">
          <el-switch
            v-if="item.agree == row.clientid"
            :value="row.status == 1"
            @change="changeStatusSwitch($event,row)"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </div> -->
            <div v-for="item in tableMap.VideoPortMap" :key="item.agree">
              <!-- {{row.clientid == item.agree ? item.mappingPort : ''}} -->
              <el-switch
                v-if="item.agree == row.clientId"
                v-permission="['StatusSwitch']"
                :value="item.status === 1"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="changeStatusSwitch($event,row)"
              />
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="agree" label="协议">
       <template slot-scope={row}>
         <p v-if="row.agree == 1">推流客户端</p>
         <p v-else-if="row.agree == 3">web客户端</p>
         <p v-else-if="row.agree == 4">录像客户端</p>
         <p v-else>存储服务</p>
       </template>
     </el-table-column> -->
        <!-- <el-table-column prop="devTypeId" label="制定人">
     </el-table-column> -->
        <!-- <el-table-column prop="status" label="启用/禁用">
       <template slot-scope="{row}">
         <el-switch
           :value="row.status == 1"
           @change="changeStatusSwitch($event,row)"
           active-color="#13ce66"
           inactive-color="#ff4949">
         </el-switch>
       </template>
     </el-table-column> -->
        <el-table-column label="操作" align="left" width="280" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <!-- <el-button size="mini" type="primary" @click="remove(row)">
             删除
           </el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onFilter" />
    </div>
    <!-- 新增设备 -->
    <el-dialog :title="addOrEdit === 'add' ? '新增映射' : '编辑映射'" :visible.sync="addMapModal">
      <el-form ref="ruleForm" :model="addMapParam" :rules="rules">
        <!-- <el-form-item label="名称" :label-width="formLabelWidth" prop="title">
         <el-input v-model="addMapParam.title" autocomplete="off"></el-input>
       </el-form-item> -->
        <el-form-item label="映射ip" :label-width="formLabelWidth" prop="mappingIp">
          <el-input v-model="addMapParam.mappingIp" autocomplete="off" />
        </el-form-item>
        <el-form-item label="映射端口" :label-width="formLabelWidth" prop="mappingPort">
          <el-input v-model="addMapParam.mappingPort" autocomplete="off" />
        </el-form-item>
        <!-- <el-form-item label="内网IP" :label-width="formLabelWidth" prop="ip">
           <el-input v-model="addMapParam.ip" autocomplete="off"></el-input>
         </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addMapModal = false">取 消</el-button>
        <el-button type="primary" @click="onCreate('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  components: { Pagination },
  data() {
    return {
      addMapModal: false,
      mapListLoading: false,
      addOrEdit: '',
      listQuery: {
        ip: '',
        page: 1,
        limit: 10
      },
      // map中的数据
      tableMap: {},
      total: 0,
      // 编辑的id
      id: 0,
      tableData: [],
      addMapParam: {
        mappingIp: '', // 映射ip
        mappingPort: '', // 映射端口
        status: 0 // 状态
      },
      statusArr: [
        {
          value: 0,
          label: '禁用'
        },
        {
          value: 1,
          label: '启用'
        }
      ],
      typeArr: [
        {
          value: 1,
          label: '推流客户端'
        },
        {
          value: 3,
          label: 'web客户端'
        },
        {
          value: 4,
          label: 'nvr报警客户端'
        },
        {
          value: 5,
          label: '存储服务'
        }
      ],
      rules: {
        title: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入设备内部IP', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入通道数', trigger: 'blur' }
        ],
        mappingIp: [
          { required: true, message: '请输入映射IP', trigger: 'blur' }
        ],
        mappingPort: [
          { required: true, message: '请输入映射端口', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '', trigger: 'blur' }
        ],
        agree: [
          { required: true, message: '请选择协议', trigger: 'blur' }
        ]
      },
      formLabelWidth: '120px'
    }
  },
  created() {
    this.onFilter()
  },
  methods: {
    openAddModal() {
      const _this = this
      _this.addOrEdit = 'add'
      _this.addMapModal = true
      _this.addMapParam = {
        mappingIp: '', // 映射ip
        mappingPort: '', // 映射端口
        status: 0,
        agree: 0 // id
      }
    },
    onEdit(val) {
      const _this = this
      _this.addOrEdit = 'edit'
      _this.addMapModal = true
      _this.id = val.id
      // _this.addMapParam = JSON.parse(JSON.stringify(val))
      // _this.addMapParam.agree = Number(_this.addMapParam.clientid)
      // console.log(val,'---')
      try {
        _this.tableMap.VideoPortMap.length > 0 && _this.tableMap.VideoPortMap.forEach(item => {
          // console.log(item,'----')
          if (Number(item.agree) === Number(val.clientId)) {
            const { mappingIp, mappingPort, status, agree } = item
            _this.addMapParam = { mappingIp, mappingPort, status, agree }
            throw new Error()
          } else {
            _this.addMapParam = {
              mappingIp: '', // 映射ip
              mappingPort: '', // 映射端口
              status: 0,
              agree: val.clientid // id
            }
          }
        })
      } catch {
        // console.log('不报错就好了',_this.addMapParam)
      }

      // _this.tableMap.VideoPortMap.length > 0 && _this.tableMap.VideoPortMap.forEach(item=>{
      //   console.log(item.agree,'7890',_this.addMapParam)
      //   if(item.agree == val.clientid) {
      //      let {mappingIp,mappingPort,status,agree} = item
      //      _this.addMapParam = {mappingIp,mappingPort,status,agree}
      //   }
      // })
      // console.log(_this.addMapParam,'编辑的');
    },
    // 查询
    onFilter() {
      const _this = this
      _this.mapListLoading = true
      request({
        url: api.video.findVideoPortMap,
        data: { ...this.listQuery }
      })
        .then(res => {
          if (res.code === 1) {
            _this.tableData = res.data
            _this.$set(_this.tableMap, 'VideoPortMap', res.map.VideoPortMap)
            _this.total = Number(res.count)
          }
          _this.mapListLoading = false
        })
    },
    changeStatus(val) {
      this.addMapParam.status = val
    },
    changeAgree(val) {
      this.addMapParam.agree = val
    },
    // 新增还是修改
    onCreate(formName) {
      const _this = this
      _this.$refs[formName].validate((valid) => {
        if (valid) {
          _this.onAddOrEditFun(_this.addOrEdit, _this.addMapParam, _this.id)
        } else {
          _this.$message.error('请正确填写必要参数')
        }
      })
    },
    onAddOrEditFun(addOrEdit, data, id) {
      const _this = this
      const apiName = addOrEdit === 'add' ? api.video.insertVideoPortMap : api.video.updateVideoPortMap
      if (id) {
        data.agree = id
      }
      request({
        url: apiName,
        data: data
      })
        .then(res => {
          if (res.code === 1) {
            _this.$message({
              message: res.msg,
              type: 'success'
            })
            _this.addMapModal = false
            _this.onFilter()
          }
        })
    },
    // 启用还是关闭
    changeStatusSwitch(e, val) {
      const _this = this
      // console.log(e,val,'启用还是关闭',_this.addMapParam)
      try {
        _this.tableMap.VideoPortMap.length > 0 && _this.tableMap.VideoPortMap.forEach(item => {
          // console.log(item,'----')
          if (item.agree === val.clientid) {
            const { status, agree } = item
            _this.addMapParam = { status, agree }
            throw new Error()
          } else {
            _this.addMapParam = {
              status: 0,
              agree: val.clientid // id
            }
          }
        })
      } catch {
        // console.log('不报错就好了',_this.addMapParam)
      }
      _this.id = val.id
      _this.addMapParam.status = e ? 1 : 0
      // _this.
      _this.onAddOrEditFun('edit', _this.addMapParam, _this.id)
    },
    // 删除
    remove(val) {
      // console.log(val,'-------');
      const _this = this
      _this.$confirm('是否删除该映射？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoPortMap,
          data: { id: val.id }
        })
          .then(res => {
            if (res.code === 1) {
              _this.onFilter()
              _this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      }).catch(() => {
        _this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style  lang='scss'>
.map {
  padding: 10px;
  &_header {
    margin-bottom: 20px;
  }
}
</style>
