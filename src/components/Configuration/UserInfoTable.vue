<template>
  <div id="UserInfoCard">
    <el-card class="box-card" v-if="userinfo">
      <div slot="header" class="clearfix">
        <img :src="require('@/assets/images/userinfo.png')" alt />
        <p>{{userinfo.name}}</p>
        <div style="float:right">
          <el-button type="success" @click="handleEdit(userinfo)">修改信息</el-button>
        </div>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.zhanghao')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input v-model="userinfo.id" :disabled="true" />
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.yonghumingcheng')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input v-model="userinfo.name" :disabled="true" />
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.quanxian')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-checkbox
            v-model="userinfo.sysadmin.isGroup"
            :disabled="true"
            :label="$t('Data.zuguanli')"
            border
          ></el-checkbox>
          <el-checkbox
            v-model="userinfo.sysadmin.isUser"
            :disabled="true"
            :label="$t('Data.yonghuguanli')"
            border
          ></el-checkbox>
          <el-checkbox
            v-model="userinfo.sysadmin.isDev"
            :disabled="true"
            :label="$t('Data.shebeiguanli')"
            border
          ></el-checkbox>
          <el-checkbox
            v-model="userinfo.sysadmin.isDevAss"
            :disabled="true"
            :label="$t('Data.shebeifenpei')"
            border
          ></el-checkbox>
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.dianhua')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input v-model="userinfo.phone" :disabled="true" />
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.youxiang')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input v-model="userinfo.email" :disabled="true" />
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.fenpeizhe')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input v-model="userinfo.allocateId" :disabled="true" />
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.yuntaikongzhidengji')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input v-model="userinfo.iptz" type="number" :disabled="true" />
        </p>
      </div>
      <div class="text item">
        <p class="itemleft">
          <el-tag type="success">{{$t('Data.miaoshu')}}</el-tag>
        </p>
        <p class="itemcontent">
          <el-input type="textarea" :disabled="true" v-model="userinfo.description"></el-input>
        </p>
      </div>
      <div class="text item">
      </div>
    </el-card>

    <!-- 编辑用户 操作框 -->
    <el-dialog
      :title="$t('Data.bianji')"
      :visible.sync="EditerUserDialog"
      class="EditerDialog"
      :close-on-click-modal="false"
      width="800px"
      center
    >
      <el-form :label-width="lang=='en'?'170px':'110px'" size="medium">
        <el-form-item :label="this.$t('Data.zhanghao')">
          <el-input :disabled="true" v-model="UserEditer.data.id"></el-input>
        </el-form-item>
        <el-form-item :label="this.$t('Data.yonghuxingming')">
          <el-input v-model="UserEditer.data.name"></el-input>
        </el-form-item>
        <el-form-item label>
          <el-checkbox
            v-model="UserEditer.UpdatePasswd"
            :checked="UserEditer.UpdatePasswd"
          >{{$t('Data.xiugaimima')}}</el-checkbox>
        </el-form-item>
        <el-form-item v-if="UserEditer.UpdatePasswd && UserEditer.data.id == this.user" :label="this.$t('Data.jiumima')" >
            <el-input type="password" v-model="UserEditer.data.oldpasswd">{{$t('Data.jiumima')}}</el-input>
        </el-form-item>
        <el-form-item v-if="UserEditer.UpdatePasswd" :label="this.$t('Data.xinmima')">
          <el-input  type="password" v-model="UserEditer.data.passwd"></el-input>
        </el-form-item>
        <el-form-item v-if="UserEditer.UpdatePasswd" :label="this.$t('Data.zaicishuruxinmima')">
          <el-input  type="password" v-model="UserEditer.data.passwd_again"></el-input>
        </el-form-item>
        <el-form-item :label="this.$t('Data.yuntaikongzhidengji')">
          <el-input min="0" minlength="1" type="number" v-model="UserEditer.data.iptz"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Data.quanxian')">
          <el-checkbox
            v-model="UserEditer.data.sysadmin['isGroup']"
            :label="$t('Data.zuguanli')"
            border
          ></el-checkbox>
          <el-checkbox
            v-model="UserEditer.data.sysadmin['isUser']"
            :label="$t('Data.yonghuguanli')"
            border
          ></el-checkbox>
          <el-checkbox
            v-model="UserEditer.data.sysadmin['isDev']"
            :label="$t('Data.shebeiguanli')"
            border
          ></el-checkbox>
          <el-checkbox
            v-model="UserEditer.data.sysadmin['isDevAss']"
            :label="$t('Data.shebeifenpei')"
            border
          ></el-checkbox>
        </el-form-item>
        <el-form-item :label="this.$t('Data.lianxidianhua')">
          <el-input v-model="UserEditer.data.phone"></el-input>
        </el-form-item>
        <el-form-item :label="this.$t('Data.youxiang')">
          <el-input v-model="UserEditer.data.email"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Data.yonghumiaoshu')">
          <el-input type="textarea" v-model="UserEditer.data.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditerUserDialog = false">{{$t('Data.quxiao')}}</el-button>
        <el-button type="primary" @click="handleEdit(false,'Edit')">{{$t('Data.queren')}}</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户 操作框 -->
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  props: {
    // _userinfo: {
    //   type: Object,
    //   default: {}
    // }
  },
  data() {
    return {
      userinfo: undefined,
      userManageer: undefined,
      EditerUserDialog: false,
      UserEditer: {
        UpdatePasswd: false,
        data: {
          sysadmin: {}
        }
      }
    };
  },
  computed: {
    ...mapState({
      session: "session",
      lang:'lang',
      user: 'user'
    })
  },
  methods: {
    SetData(_userinfo) {
      this.userManageer = this.session.swGetUserManager();
      let user = this.userManageer.swGetUserById(
        _userinfo.groupid,
        _userinfo.id
      );
      this.$store.state.ErrorCode = user.swGetUserInfo({
        callback: (option, response, data) => {
          if (response.emms.code != 0) {
            this.$store.state.ErrorCode = response.emms.code;
            this.$Message.error(this.$tools.findErrorCode(response.emms.code));
            return;
          }
          this.userinfo = data;
        }
      });
    },
    // 编辑 按钮逻辑处理
    handleEdit(data, i) {
      if (i == "Edit") {
        this.userManager ||
          (this.userManager = this.session.swGetUserManager());
        let _user = this.userManager.swGetUserById(
          this.UserEditer.data.groupid,
          this.UserEditer.data.id
        );
        if (
          this.UserEditer.UpdatePasswd &&
          this.UserEditer.data.passwd != this.UserEditer.data.passwd_again
        ) {
          this.$Message.error(this.$t("Data.liangcimimabuyizhi"));
          return;
        }
        if (
          this.UserEditer.UpdatePasswd &&
          (this.UserEditer.data.passwd=='' ||this.UserEditer.data.passwd_again=='' ||this.UserEditer.data.oldpasswd=='' )
        ) {
          this.$Message.error(this.$t("Data.mimabunengweikong"));
          return;
        }
        if (this.UserEditer.data.name.trim() == "") {
          this.$Message.error(this.$t("Data.mingchengbunengweikong"));
          return;
        }
        if(!this.UserEditer.UpdatePasswd){
            this.UserEditer.data.oldpasswd = ''
            this.UserEditer.data.passwd = ''
          }
        this.$store.state.ErrorCode = _user.swModUser({
          info: this.UserEditer.data,
          callback: (sender, option, data) => {
            this.$store.state.ErrorCode = option.emms.code;
            if (option.emms.code != 0) {
              // this.$Message.error(this.$tools.findErrorCode(option.emms.code))
              this.$Message.error(this.$t("Data.xiugaishibai"));
              return;
            }
            if(this.UserEditer.UpdatePasswd){
              
              _user.swModPwd({
                data: {
                  password: this.UserEditer.data.id==this.user? this.UserEditer.data.oldpasswd:"",
                  newpassword: this.UserEditer.data.passwd
                },
                callback: (sender, option, data) => {
                  if (option.emms.code != 0) {
                    // this.$Message.error(this.$tools.findErrorCode(option.emms.code))
                    this.$Message.error(this.$t("Data.xiugaishibai"));
                    return;
                  }
                  if(this.UserEditer.UpdatePasswd && this.UserEditer.data.id==this.user){
                    // this.$Message.success(this.$t("Data.xiugaichenggong"));
                    setTimeout(() => {
                      location.reload()
                    }, 2000);
                  }
                  this.$Message.success(this.$t("Data.xiugaichenggong"));
                  Object.assign(this.UserEditer._data, this.UserEditer.data);
                  this.EditerUserDialog = false;
                }
              });
            }else{
              this.$Message.success(this.$t("Data.xiugaichenggong"));
              Object.assign(this.UserEditer._data, this.UserEditer.data);
              this.EditerUserDialog = false;
            }
          }
        });
        return;
      }
      this.$set(this.UserEditer, "UpdatePasswd", false);
      data['oldpasswd'] = ''
      data['passwd'] = ''
      data['passwd_again'] = ''
      this.$set(this.UserEditer, "data", this.$lodash.cloneDeep(data));
      this.$set(this.UserEditer, "_data", data);
      this.EditerUserDialog = true;
    }
  },
  created() {}
};
</script>
<style lang="less" >
#UserInfoCard {
  .clearfix {
    overflow: hidden;
    img {
      height: 60px;
      display: block;
      float: left;
    }
    p {
      float: left;
      height: 60px;
      line-height: 60px;
      font-size: 28px;
      font-weight: 600;
      margin-left: 20px;
    }
  }
  .item {
    margin-bottom: 18px;
    overflow: hidden;
    font-size: 16px;
    box-sizing: border-box;

    .itemleft {
      float: left;
      width: 100px;
      text-align: right;
      .el-tag {
        line-height: 40px;
        height: 40px !important;
      }
    }
    .itemcontent {
      float: left;
      width: calc(100% - 110px);
      margin-left: 10px;
      &>.el-input>input,textarea{
        cursor:initial;
      }
    }
  }
}
</style>