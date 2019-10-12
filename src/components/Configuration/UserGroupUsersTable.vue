
<template>
  <div>
    <el-table :data="GroupData" :loading="loading" wdith>
      <el-table-column :label="$t('Data.leixing')" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.type=='user'?'success':'primary'"
            size="medium"
          >{{ scope.row.type=="user"? $t('Data.yonghu'):$t('Data.qunzu')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="ID" width="270">
        <template slot-scope="scope">
          <span>{{ scope.row.data.id }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        :label="$t('Data.suoshuyonghuzuID')"
        width="260">
        <template slot-scope="scope">
          <span >{{ scope.row.id }}</span>
        </template>
      </el-table-column>-->
      <el-table-column :label="$t('Data.mingcheng')" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.data.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Data.miaoshu')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.data.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Data.caozuo')" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">{{$t('Data.bianji')}}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >{{$t('Data.shanchu')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑用户组 操作框 -->
    <el-dialog
      :title="$t('Data.bianji')"
      :visible.sync="EditerDialog"
      class="EditerDialog"
      :close-on-click-modal="false"
      width="600px"
      center
    >
      <el-form :label-width="lang=='en'?'170px':'90px'" size="medium">
        <el-form-item :label="$t('Data.yonghuzumingcheng')">
          <el-input v-model="Editer.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Data.yonghuzumiaoshu')">
          <el-input type="textarea" v-model="Editer.desc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditerDialog = false">{{$t('Data.quxiao')}}</el-button>
        <el-button type="primary" @click="handleEdit('Edit','group')">{{$t('Data.queren')}}</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户组 操作框 -->

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
        <!-- <el-form-item v-if="Hidden" label="" >
            <el-checkbox v-model="UserEditer.data.groupid">{{$t('Data.xiugaimima')}}</el-checkbox>
        </el-form-item>-->
        <el-form-item v-if="UserEditer.UpdatePasswd" :label="this.$t('Data.xinmima')">
          <el-input v-model="UserEditer.data.passwd"></el-input>
        </el-form-item>
        <el-form-item v-if="UserEditer.UpdatePasswd" :label="this.$t('Data.zaicishuruxinmima')">
          <el-input v-model="UserEditer.data.passwd_again"></el-input>
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
        <el-button type="primary" @click="handleEdit('Edit','user')">{{$t('Data.queren')}}</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户 操作框 -->
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      m_data: {},
      GetData: undefined,
      GroupData: [],
      userManager: undefined,
      EditerDialog: false,
      EditerUserDialog: false,
      Hidden: false,
      Editer: {
        name: "",
        desc: ""
      },
      UserEditer: {
        UpdatePasswd: false,
        data: {
          sysadmin: {}
        }
      },
      loading: true
    };
  },
  computed: {
    ...mapState({
      session: "session",
      lang: "lang"
    })
  },
  watch: {
    "UserEditer.data.iptz"(val) {
      if (val == "") {
        this.UserEditer.data.iptz = 0;
      }
    }
  },
  methods: {
    // 被父组件调用，设置表格信息
    SetGroupData(data) {
      this.loading = true;
      let temp = [];
      // this.data = data
      // console.log('SetData',this.m_data);

      // Object.assign(this.m_data,this.$lodash.cloneDeep(data))
      // this._data = this.$lodash.cloneDeep(data)
      data.children.forEach(children => {
        if (children.target == "user") {
          this.getUserInfo(
            [children._group._group.id, children._user.id],
            _data => {
              temp.push({
                type: "user",
                data: _data
              });
            }
          );
        } else if (children.target == "group") {
          this.getGroupInfo(children._group.id, _data => {
            temp.push({
              type: "group",
              data: _data
            });
          });
        }
      });
      this.GroupData = temp;
      this.loading = false;
    },
    // 根据用户ID 获取详细信息
    getUserInfo(data, cb) {
      this.userManager || (this.userManager = this.session.swGetUserManager());
      let group = this.userManager.swGetGroupById(data[0]);
      let user = group.swGetUserById(data[1]);
      user.swGetUserInfo({
        callback: (sender, event, data) => {
          cb(data);
        },
        tag: null
      });
    },
    getGroupInfo(id, cb) {
      this.userManager || (this.userManager = this.session.swGetUserManager());
      let group = this.userManager.swGetGroupById(id);
      group.swGetGroupInfo({
        callback: (sender, event, data) => {
          cb(data);
        },
        tag: null
      });
    },
    // 编辑 按钮逻辑处理
    handleEdit(i, data) {
      if (i == "Edit") {
        this.userManager ||
          (this.userManager = this.session.swGetUserManager());
        if (data == "group") {
          if (this.Editer.name.trim() == "") {
            this.$Message.error(this.$t("Data.mingchengbunengweikong"));
            return;
          }
          let group = this.userManager.swGetGroupById(this.Editer.data.id);
          this.$store.state.ErrorCode = group.swModGroup({
            info: {
              id: this.Editer.data.id,
              name: this.Editer.name,
              description: this.Editer.desc,
              parentid: this.Editer.data.parentid,
              resources: this.Editer.data.resources
            },
            callback: (sender, option, data) => {
              this.$store.state.ErrorCode = option.emms.code;
              if (option.emms.code != 0) {
                // this.$Message.error(this.$tools.findErrorCode(option.emms.code))
                this.$Message.error(this.$t("Data.xiugaishibai"));
                return;
              }
              this.$Message.success(this.$t("Data.xiugaichenggong"));
              this.Editer.data.name = this.Editer.name;
              this.Editer.data.description = this.Editer.desc;
              this.EditerDialog = false;
            }
          });
        } else if (data == "user") {
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
          if (this.UserEditer.data.name.trim() == "") {
            this.$Message.error(this.$t("Data.mingchengbunengweikong"));
            return;
          }

          if (!this.UserEditer.UpdatePasswd) {
            this.UserEditer.data.passwd = "";
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
              if (this.UserEditer.UpdatePasswd) {
                _user.swModPwd({
                  data: {
                    password: "",
                    newpassword: this.UserEditer.data.passwd
                  },
                  callback: (sender, option, data) => {
                    if (option.emms.code != 0) {
                      // this.$Message.error(this.$tools.findErrorCode(option.emms.code))
                      this.$Message.error(this.$t("Data.xiugaishibai"));
                      return;
                    }
                    this.$Message.success(this.$t("Data.xiugaichenggong"));
                    Object.assign(this.UserEditer._data, this.UserEditer.data);
                    this.EditerUserDialog = false;
                  }
                });
              } else {
                this.$Message.success(this.$t("Data.xiugaichenggong"));
                Object.assign(this.UserEditer._data, this.UserEditer.data);
                this.EditerUserDialog = false;
              }
            }
          });
        }

        return;
      }

      console.log("data", data);

      if (data.type == "group") {
        this.EditerDialog = true;
        this.Editer = {
          name: data.data.name,
          desc: data.data.description,
          data: data.data
        };
      } else if (data.type == "user") {
        this.$set(this.UserEditer, "UpdatePasswd", false);
        this.$set(this.UserEditer, "data", this.$lodash.cloneDeep(data.data));
        this.$set(this.UserEditer, "_data", data.data);
        this.EditerUserDialog = true;
      }
    },
    // 删除 按钮逻辑处理
    handleDelete(i, data) {
      this.$confirm(
        `${this.$t("Data.cicaozuojiangshanchu")} ${data.data.name} (${
          data.data.id
        }) ${
          data.type == "group" ? this.$t("Data.qunzu") : this.$t("Data.yonghu")
        }`,
        this.$t("Data.jinggao"),
        {
          confirmButtonText: this.$t("Data.queren"),
          cancelButtonText: this.$t("Data.quxiao"),
          type: "warning",
          center: true
        }
      )
        .then(() => {
          this.userManager = this.session.swGetUserManager();

          if (data.type == "user") {
            console.log(data.data);
            let user = this.userManager.swGetUserById(
              data.data.groupid,
              data.data.id
            );
            this.$store.state.ErrorCode = user.swDelUser({
              callback: (sender, option, data) => {
                this.$store.state.ErrorCode = option.emms.code;
                if (option.emms.code != 0) {
                  this.$Message.error(this.$t("Data.shanchushibai"));
                  return;
                }
                this.$Message.success(this.$t("Data.shanchuchenggong"));
              },
              tag: null
            });
            return;
          }
          let group = this.userManager.swGetGroupById(data.data.id);
          this.$store.state.ErrorCode = group.swDelGroup({
            callback: (sender, option, data) => {
              this.$store.state.ErrorCode = option.emms.code;
              if (option.emms.code != 0) {
                this.$Message.error(this.$t("Data.shanchushibai"));
                return;
              }
              this.$Message.success(this.$t("Data.shanchuchenggong"));
            },
            tag: data.data.id
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="less">
</style>