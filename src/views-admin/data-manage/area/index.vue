<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        v-permission="['Search']"
        placeholder="请输入区域搜索关键词"
        class="filter-item filter-item-input"
      />
      <el-button v-permission="['Search']" class="filter-item" type="primary" @click="searchCat">搜索</el-button>
      <el-button v-permission="['Add']" class="filter-item" type="primary" @click="addCat">新增</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="data"
        row-key="hyAreaId"
        default-expand-all
        fit
        highlight-current-row
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        style="width: 100%;"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="区域名称" prop="hyAreaName" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="所在地区" prop="cmdbItemTypeId" align="left">
          <template slot-scope="{row}">
            <span>{{ setcmdbItemTypeId(row.cmdbItemTypeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="详细地址" prop="addr" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="经纬度">
          <template slot-scope="{row}">
            <span>{{ row.hyLongitude }}</span>
            <span v-if="row.hyLongitude && row.hyLatitude">，</span>
            <span>{{ row.hyLatitude }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="IT" prop="isIt" align="left">
          <template slot-scope="{row}">
            <el-checkbox v-if="row.children.length < 1" v-model="row.isIt" :true-label="1" :false-label="0" @change="updateIsIt(row)" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="视频" prop="isVideo" align="left">
          <template slot-scope="{row}">
            <el-checkbox v-if="row.children.length < 1" v-model="row.isVideo" :true-label="1" :false-label="0" @change="updateIsVideo(row)" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="动环" prop="isDh" align="left">
          <template slot-scope="{row}">
            <el-checkbox v-if="row.children.length < 1" v-model="row.isDh" :true-label="1" :false-label="0" @change="updateIsDh(row)" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="操作" align="left" width="250" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['AddChildren']" size="mini" type="primary" @click="onAdd(row)">
              新增子级
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer
      title="区域信息"
      :visible.sync="drawer"
      :direction="direction"
    >
      <div class="wrp">
        <el-form ref="form" :model="form" :rules="rules">
          <el-row :gutter="12">
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="hyAreaName">
                <el-input v-model="form.hyAreaName" placeholder="区域名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="11" :xl="11">
              <el-form-item prop="hyPid">
                <el-cascader
                  ref="cascader"
                  v-model="form.hyPid"
                  :options="tree"
                  placeholder="请选择父级"
                  :props="catProps"
                  clearable
                  @change="change"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="13" :xl="13">
              <el-form-item prop="hyPid">
                <div @mouseenter="mouseenter" @mouseleave="mouseleave">
                  <el-checkbox v-model="checked">继承父级关系<span class="mark">?</span></el-checkbox>
                  <div v-if="showTips" class="explain">选择后，配置了父级区域的设备将归属到子级中</div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="cmdbItemTypeId">
                <el-cascader
                  v-model="form.cmdbItemTypeId"
                  disabled
                  placeholder="配置类目"
                  :options="classifyTreeList"
                  :props="{ value: 'id', label: 'name', checkStrictly: true }"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="addr">
                <el-input v-model="form.addr" placeholder="详细地址" />
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="">
                <el-button type="primary" @click="onShowNautice">选择位置</el-button>
                <div class="ml-10">经度：{{ form.hyLongitude }}</div>
                <div class="ml-10">纬度：{{ form.hyLatitude }}</div>
              </el-form-item>
            </el-col>
            <el-col :xs="23" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item prop="imageUrl">
                <FileUpload
                  button-text="上传图标"
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
            </el-col>
          </el-row>
        </el-form>
        <el-button :loading="loading" type="primary" @click="saveCat">保存</el-button>
      </div>
    </el-drawer>
    <ChooseNautica
      ref="nautica"
      :nautica.sync="form"
      @changeNautica="changeNautica"
    />
  </div>
</template>

<script>
import areaListMixin from './mixins/area-list-mixin'
import ChooseNautica from '@/views-admin/data-manage/area/components/chooseNautica'
import FileUpload from '@/components/Upload/file-upload.vue'
import ListControl from '@/components/ListControl'

export default {
  components: { ChooseNautica, FileUpload, ListControl },
  mixins: [areaListMixin],
  data() {
    return {
      // 显示控制数据 start
      checkList: ['区域名称', '所在地区', '详细地址', '经纬度', 'IT', '视频', '动环', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    mouseenter() {
      this.showTips = true
    },
    mouseleave() {
      this.showTips = false
    },
    onShowNautice() {
      this.$refs.nautica.open()
    },
    changeNautica(nautica) {
      this.form.hyLatitude = nautica.lat
      this.form.hyLongitude = nautica.lng
    }
  }
}
</script>

<style lang="scss" scoped>
  .mark {
    display: inline-block;
    width: 20px;
    height: 20px;
    color: #fff;
    text-align: center;
    background-color: blue;
    border-radius: 10px;
    margin-left: 10px;
  }
  .explain {
    height: 30px;
    font-size: 10px;
    position: absolute;
    padding: -5px 5px;
    line-height: 30px;
    color: rgb(131,131,131);
    border: 1px solid rgb(235,235,236);
    background-color: rgb(246,246,247);
  }

</style>
