<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="openAddModal">新增</el-button>
      <el-button v-permission="['BatchImport']" class="filter-item" type="primary" @click="onBulkImportModal">批量导入</el-button>
      <el-button v-permission="['TemplateDownload']" class="filter-item" type="primary"><el-link class="unset" target="_blank" href="/manage/摄像头设备导入模板.xlsx" :underline="false">模板下载</el-link></el-button>
      <el-input v-model="listQuery.title" v-permission="['Search']" placeholder="请输入设备名" style="width: 150px;" class="filter-item" @keyup.enter.native="onFilter" />
      <el-input v-model="listQuery.ip" v-permission="['Search']" placeholder="请输入IP" style="width: 150px;" class="filter-item" @keyup.enter.native="onFilter" />
      <!-- 状态 -->
      <el-select v-model="listQuery.status" v-permission="['Search']" clearable placeholder="" class="filter-item" @change="changeSelect('status',$event)">
        <el-option value="" label="全部" />
        <el-option
          v-for="item in addStatusArr"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <!-- 类型 -->
      <el-select v-model="listQuery.devTypeId" v-permission="['Search']" clearable placeholder="" class="filter-item" @change="changeSelect('devTypeId',$event)">
        <el-option label="所有类型" value="" />
        <el-option
          v-for="item in typeArr"
          :key="item.hyDevTypeId"
          :label="item.hyDevTypeName"
          :value="item.hyDevTypeId"
        />
      </el-select>
      <!-- 区域 -->
      <el-cascader
        v-model="listQuery.orgIds"
        v-permission="['Search']"
        clearable
        class="filter-item"
        multiple="false"
        :options="areaTreeArr"
        :props="orgProps"
        @change="handleOrgChange"
      />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="onFilter">查询</el-button>
      <el-button v-permission="['BatchDelete']" class="filter-item" type="primary" @click="onMover">批量删除</el-button>
      <!-- <el-button v-permission="['onBatchTransferAssets']" size="mini" type="danger" @click="onBatchTransferAssets(row)"> -->
      <el-button class="filter-item" type="primary" @click="onBatchTransferAssets">批量转资产</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table ref="authDeviceTable" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="date" label="NO" type="index" width="70" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" prop="title" label="设备名称" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" prop="ip" label="IP" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" prop="devTypeId" label="设备类型" width="150" show-overflow-tooltip>
          <template slot-scope="{row}">
            <!-- <p v-if=""></p> -->
            <p v-for="item in typeArr" :key="item.hyDevTypeValue">
              <span v-if="row.devTypeId === item.hyDevTypeId">{{ item.hyDevTypeName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" prop="channelCount" label="通道数" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" prop="address" label="区域" show-overflow-tooltip>
          <template slot-scope="{row}">
            <p v-for="itemArea in areaArr" :key="itemArea.hyAreaId">
              <span v-if="itemArea.hyAreaId === row.orgId">{{ itemArea.hyAreaName }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" prop="status" label="状态" show-overflow-tooltip>
          <template slot-scope="{row}">
            <p :style="row.status === 1 ? 'color:green' : 'color:red'">{{ row.status === 1 ? '在线' : '离线' }}</p>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" label="操作" width="280" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['CopyDevice']" size="mini" type="primary" @click="onCopy(row)">
              复制
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Channel']" size="mini" type="primary" @click="onAisle(row)">
              通道
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onFilter" />
    <!-- 批量导入 -->
    <el-dialog title="批量导入" :visible.sync="bulkImportModal">
      <el-form ref="rulesBulk" :model="bulkImport" :rules="rulesBulk">
        <el-form-item label="选择文件" :label-width="formLabelWidth">
          <el-upload
            class="upload-demo text-left"
            action
            accept=".xls,.xlsx"
            :http-request="upload"
            :on-change="changeUpload"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="区域" :label-width="formLabelWidth" prop="orgId">
          <el-cascader
            v-model="bulkImport.orgId"
            clearable
            class="filter-item"
            multiple="false"
            :options="areaTreeArr"
            :props="orgProps"
            @change="handleImportOrgChange"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bulkImportModal = false">取 消</el-button>
        <el-button type="primary" @click="toLead('rulesBulk')">导 入</el-button>
      </div>
    </el-dialog>
    <!-- 新增设备 -->
    <el-dialog :title="addOrEdit === 'add' ? '新增设备' : '编辑设备'" :visible.sync="addVideoDvrModal" top="5vh">
      <el-form ref="ruleForm" :model="addVideoDvrParam" :rules="rules">
        <el-form-item label="设备名称" :label-width="formLabelWidth" prop="title">
          <el-input v-model="addVideoDvrParam.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="对应配置类目" :label-width="formLabelWidth" prop="cmdbItemTypeId">
          <el-cascader
            v-model="addVideoDvrParam.cmdbItemTypeId"
            class="w-100"
            placeholder="请选择配置类目"
            disabled
            :options="classifyTreeList"
            :props="{ value: 'id', label: 'name', checkStrictly: true }"
          />
        </el-form-item>
        <el-form-item label="设备类型" :label-width="formLabelWidth" prop="title">
          <!-- <el-input v-model="addVideoDvrParam.title" autocomplete="off"></el-input> -->
          <el-select v-model="addVideoDvrParam.devTypeId" placeholder="" class="" style="width: 100%;" @change="changeDevType">
            <!-- <el-option label="所有类型" value="all"></el-option> -->
            <el-option
              v-for="item in typeArr"
              :key="item.hyDevTypeId"
              :label="item.hyDevTypeName"
              :value="item.hyDevTypeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备IP" :label-width="formLabelWidth" prop="ip">
          <el-input v-model="addVideoDvrParam.ip" autocomplete="off" />
        </el-form-item>
        <el-form-item label="通道数" :label-width="formLabelWidth" prop="channelCount">
          <el-input-number v-model="addVideoDvrParam.channelCount" autocomplete="off" :disabled="isDisabled" :step="1" :min="0" />
        </el-form-item>
        <!-- <el-form-item label="状态" :label-width="formLabelWidth">
        <el-select v-model="addVideoDvrParam.status" placeholder="" class="" style="width: 100%;" :disabled="addStatusDis" @change="changeAddStatus">
          <el-option
            v-for="item in addStatusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item> -->
        <el-form-item label="区域" :label-width="formLabelWidth">
          <el-select v-model="addVideoDvrParam.catId" placeholder="请选择区域" class="" style="width: 100%;">
            <!-- <el-option label="所有区域" value="all"></el-option> -->
            <el-option
              v-for="item in areaArr"
              :key="item.hyAreaId"
              :label="item.hyAreaName"
              :value="item.hyAreaId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="userName">
          <el-input v-model="addVideoDvrParam.userName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="passWord">
          <el-input v-model="addVideoDvrParam.passWord" :type="passwordType" autocomplete="off" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-form-item label="拉流端口" :label-width="formLabelWidth">
          <el-input v-model="addVideoDvrParam.port" autocomplete="off" />
        </el-form-item>
        <el-form-item label="登录端口" :label-width="formLabelWidth" prop="loginPort">
          <el-input v-model="addVideoDvrParam.loginPort" autocomplete="off" />
        </el-form-item>
        <el-form-item label="网关类型" :label-width="formLabelWidth">
          <el-select v-model="addVideoDvrParam.gId" placeholder="请选择网关" style="width: 100%;" @change="selectGateway">
            <el-option v-for="item in gatewayArr" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVideoDvrModal = false">取 消</el-button>
        <el-button type="primary" @click="onCreate('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 通道 -->
    <el-dialog title="通道" :visible.sync="aisleModal">
      <div class="table-wrapper">
        <el-table :data="aisleTable">
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column property="cname" label="通道名称" width="150" show-overflow-tooltip />
          <el-table-column property="gId" label="存储网关" width="200" show-overflow-tooltip />
          <el-table-column property="cno" label="通道号" show-overflow-tooltip />
          <el-table-column property="status" label="状态" show-overflow-tooltip>
            <template slot-scope="{row}">
              <p :style="row.status === 1 ? 'color:green' : 'red'">{{ row.status === 1 ? '在线' : '离线' }}</p>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <div style="display: flex;align-items: center;justify-content:center;">
                <el-button v-permission="['EditChannel']" size="mini" type="text" style="border:none;" @click="editAisle(row)">
                  编辑
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="aisletotal>0" :auto-scroll="false" :total="aisletotal" :page.sync="aisleParam.page" :limit.sync="aisleParam.limit" @pagination="onAisle(aisleParam)" />
    </el-dialog>
    <!-- 编辑通道 -->
    <el-dialog
      title="更新通道"
      :visible.sync="aisleEditModal"
      width="30%"
    >
      <el-input v-model="editAisleInfoName" placeholder="请输入内容" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="aisleEditModal = false">取 消</el-button>
        <el-button type="primary" @click="aisleEditFun">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import equipmentListMixin from './mixins/equipment-list-mixin'

export default {
  mixins: [equipmentListMixin]
}
</script>

<style lang='scss'>
.equipment {
  padding: 20px;
  &_header {
    margin-bottom: 20px;
    &_input,&_select {
      margin: 0 5px;
    }
    &_select {
      width: 150px;
    }
  }

  .equipment_header {
    display: flex;
    margin-bottom: 20px;
  }
}
.el-upload {
  text-align: left !important;
}
.show-pwd {
  position: absolute;
  right: 10px;
  top: 50%;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transform: translateY(-50%);
}
</style>
