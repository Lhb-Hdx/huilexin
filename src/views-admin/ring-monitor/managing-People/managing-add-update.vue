<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card>
        <el-form ref="form" :inline="false" :model="form" :rules="rules" label-width="90px">
          <el-row :gutter="20">
            <el-col :offset="0" :span="8">
              <el-form-item label="姓名" prop="ownerName">
                <el-input v-model.trim="form.ownerName" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="身份证号" prop="ownerCode">
                <el-input v-model="form.ownerCode" placeholder="请输入身份证号" />
              </el-form-item>
              <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="form.sex">
                  <el-radio :label="0">女</el-radio>
                  <el-radio :label="1">男</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="人员类型" prop="ownerType">
                <el-select v-model="form.ownerType" filterable placeholder="请选择人员类型">
                  <el-option :value="0" label="业主" />
                  <el-option :value="1" label="业主家属" />
                </el-select>
              </el-form-item>
              <el-form-item label="所属房产" prop="roomId">
                <el-select v-model="form.roomId" filterable placeholder="请选择所属房产">
                  <el-option
                    v-for="(item) in roomList"
                    :key="item.hyRoomId"
                    :label="item.hyRoomNo"
                    :value="item.hyRoomId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :offset="0" :span="14">
              <div class="flex-v-center face mb-20 mt-20">
                <div class="text-center face-box">
                  <div style="width: 300px;height: 225px;border:1px solid #999">
                    <video ref="video" autoplay class="face-img  " width="300" @click="callCamera" />
                    <div v-if="videoStatus" class="prompt font-18 pointer" @click="callCamera">点击开启摄像</div>
                  </div>
                  <el-button class="mt-20" size="default" type="primary" @click="photograph">使用</el-button>
                </div>
                <div class="text-center face-box ml-30">
                  <div style="width: 300px;height: 225px;border:1px solid #999">
                    <canvas ref="canvas" class="canvas" height="225" width="300" />
                    <img :src="form.faceImgUrl" alt="" class="face-img">
                    <input style="overflow:hidden;opacity:0" type="file" @change="uploadImg($event,1)">
                    <div v-if="!form.faceImgUrl" class="prompt font-18">点击上传照片</div>
                  </div>
                  <div class="mt-20 font-16">人脸图片</div>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
          </el-form-item>
          <el-form-item size="normal">
            <el-button v-permission="['submit']" size="default" type="primary" @click="onSubmit">确定</el-button>
            <el-button size="default" @click="$refs.form.resetFields()">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
// import FileUpload from '@/components/Upload/file-upload'
import { guid } from '@/utils/utils'
import { isMobile, isIdCard } from '@/utils/validate'

export default {
  name: 'Managing',
  components: {},
  data() {
    var checkName = (rule, val, callback) => {
      if (!val) return callback(new Error('请输入姓名'))
      if (!/^[\u4e00-\u9fa5]+$/.test(val)) return callback(new Error('请输入中文姓名'))
      callback()
    }
    var checkPhone = function(rule, val, callback) {
      if (!val) return callback(new Error('请输入手机号'))
      if (!isMobile(val)) return callback(new Error('手机号格式不正确'))
      callback()
    }
    var checkIdCard = function(rule, val, callback) {
      if (!val)callback()
      if (!isIdCard(val)) return callback(new Error('身份证格式不正确'))
      callback()
    }
    return {
      id: '',
      form: {
        faceImgUrl: '',
        tel: '',
        sex: 0
      },
      rules: {
        ownerName: [{ validator: checkName, required: true, trigger: 'blur' }],
        ownerCode: [{ validator: checkIdCard, trigger: 'blur' }],
        tel: [{ validator: checkPhone, required: true, trigger: 'blur' }],
        sex: [{ required: true, message: '请输入性别', trigger: 'blur' }],
        ownerType: [{ required: true, message: '请选择人员类型', trigger: 'change' }]
      },
      roomList: [],
      videoStatus: true
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    }
  },
  created() {
    this.findEsRoom()
    if (this.$route.query.id) {
      this.id = this.$route.query.id
      this.getEsOwner()
    }
    // this.findHyitAgent()
  },
  beforeDestroy() {
    try {
      let stream = this.$refs['video'].srcObject
      let tracks = stream.getTracks()
      tracks.forEach(track => {
        track.stop()
      })
      this.$refs['video'].srcObject = null
    } catch {
      console.error('关闭摄像头错误')
    }
  },
  methods: {
    async getEsOwner() {
      let { code, model } = await request({ url: api.powerEnv.getEsOwner, data: { ownerId: this.id }})
      if (code !== 1) return
      this.form = model
    },
    async findEsRoom() {
      let { code, data } = await request({ url: api.powerEnv.findEsRoom, data: { limit: -1 }})
      if (code !== 1) return
      this.roomList = data
    },
    onSubmit() {
      this.$refs.form.validate(async(val) => {
        console.log(val)
        if (!val) return
        let { code, msg } = await request({
          url: this.id ? api.powerEnv.updateEsOwner : api.powerEnv.insertEsOwner,
          data: this.form
        })
        if (code !== 1) return this.$message.error(msg)
        this.$message.success('修改成功')
        this.$router.back()
      })
    },
    // 调用摄像头
    callCamera() {
      if (!navigator?.mediaDevices?.getUserMedia) return this.$message.error('摄像头开启失败，请检查摄像头是否可用或是否没有使用https协议')
      // H5调用电脑摄像头API
      navigator.mediaDevices.getUserMedia({ video: true }).then(success => {
        // 摄像头开启成功
        this.$refs['video'].srcObject = success
        // 实时拍照效果
        this.$refs['video'].play()

        this.videoStatus = false
      }).catch(error => {
        console.error('摄像头开启失败，请检查摄像头是否可用！', error)
      })
    },
    // 拍照
    photograph() {
      if (this.videoStatus) return this.$message.error('请开启摄像头')
      let ctx = this.$refs['canvas'].getContext('2d')
      // 把当前视频帧内容渲染到canvas上
      ctx.drawImage(this.$refs['video'], 0, 0, 300, 225)
      // 转base64格式、图片格式转换、图片质量压缩
      let imgBase64 = this.$refs['canvas'].toDataURL('image/jpeg', 1)

      this.uploadImg(this.$tool.dataURLtoFile(imgBase64, guid() + '.png'))
    },
    uploadImg(file, type) {
      console.log(file)
      file = type === 1 ? file.target.files[0] : file
      const fileData = new FormData()
      fileData.append('file', file)
      const uploadTokenData = { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      }
      request({
        url: api.file.uploadPic, data: uploadTokenData, form: fileData
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('上传成功')
          this.form.faceImgUrl = res.map.img
          this.form.website = res.map.website
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.face-img {
  width: 300px;
  height: 225px;
  border: 1px solid #999;
}

.face-box {
  position: relative;

  .prompt {
    position: absolute;
    width: 100%;
    top: 35%;
    text-align: center;
  }

  input[type=file] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    border: 1px solid #999;
  }
}

.canvas {
  position: absolute;
  border: none;
  opacity: 0;
  width: 300px;
  height: 225px;
}
</style>
