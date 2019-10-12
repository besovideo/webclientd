<template>
  <div id="ConfigureList" style="height:100%;width:100%">  
    <div class="left">
      <user-manage-tree-list @on-getdata="GetGroupData" @on-all-click="handleAllClick" @on-group-click="handleGroupClick" @on-user-click="handleUserClick"/>
    </div>
    <div class="body">
      <!-- 默认显示所有用户组列表 -->
      <header v-if="group_info==undefined && !User_info">
        <div class="h_left">
          <img :src="require('@/assets/images/qun.png')" alt="">
          <p>{{$t('Data.yonghuzuguanli')}}</p>
        </div>
        <div class="h_right">
          <el-button type="primary" icon="el-icon-circle-plus" @click="HandleAddGroup">{{this.$t('Data.tianjiayonghuzu')}}</el-button>
        </div>
      </header>
      <!-- 默认显示所有用户组列表 -->

      <!-- 默认某个用户组中用户 和用户组 列表 -->
      <header v-if="group_info && group_info.id">
        <div class="h_left">
          <img :src="require('@/assets/images/qun.png')" alt="">
          <p>{{group_info.name}}    <span style="color: #ccc">{{group_info.id}}</span></p>
        </div>
        <div class="h_right">
          <el-button type="primary" icon="el-icon-circle-plus" @click="HandleAddGroup">{{this.$t('Data.tianjiayonghuzu')}}</el-button>
          <el-button type="primary" icon="el-icon-circle-plus" @click="HandleAddUser">{{this.$t('Data.tianjiayonghu')}}</el-button>
        </div>
      </header>
      <!-- 默认某个用户组中用户 和用户组 列表 -->

      <!-- 默认用户信息列表 -->
      <header v-if="!group_info && User_info" class="user_header">
        <div class="h_left">
          <img :src="require('@/assets/images/userinfo.png')" alt="">
          <p>{{User_info.name}}    <span style="color: #ccc">{{User_info.id}}</span></p>
        </div>
        <div class="h_right">
          <el-button type="primary" icon="el-icon-circle-plus" @click="HandleAddGroup">{{this.$t('Data.tianjiayonghuzu')}}</el-button>
          <el-button type="primary" icon="el-icon-circle-plus" @click="HandleAddUser">{{this.$t('Data.tianjiayonghu')}}</el-button>
        </div>
      </header>
      <!-- 默认用户信息列表 -->

      <el-divider style="margin: 10px 0;" v-if="!User_info"><i class="el-icon-mobile-phone"></i></el-divider>
      <div :class="{_content:true,user_content:User_info!=undefined}">
        <user-group-table-vue v-if="group_info==undefined && !User_info" ref='userallgroup'/>
        <user-group-users-table v-if="group_info && group_info.id" ref="groupusers"/>
        <user-info-table-vue  v-if="group_info==undefined && User_info" ref="userinfo"/>
      </div>
    </div>
    <!-- 添加用户组 操作框 -->
      <el-dialog
        :title="$t('Data.tianjiayonghuzu')"
        :visible.sync="AddGroupDialog"
        class="AddGroupDialog"
        :close-on-click-modal="false"
        width="600px"
        center >
        <el-form :label-width="lang=='en'?'170px':'90px'" size="medium">
          <el-form-item :label="$t('Data.yonghuzuID')" >
            <el-input v-model="AddGroup.id"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.yonghuzumingcheng')" >
            <el-input v-model="AddGroup.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.miaoshu')" >
            <el-input type="textarea" v-model="AddGroup.desc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="AddGroupDialog = false">{{$t('Data.quxiao')}}</el-button>
          <el-button type="primary" @click="HandleAddGroup('ADD')">{{$t('Data.queren')}}</el-button>
        </span>
      </el-dialog>
    <!-- 添加用户组 操作框 -->
    <!-- 添加用户 操作框 -->
      <el-dialog
        :title="$t('Data.tianjiayonghu')"
        :visible.sync="AddUserDialog"
        class="AddUserDialog"
        :close-on-click-modal="false"
        width="800px"
        center >
        <el-form :label-width="lang=='en'?'170px':'90px'" size="medium">
          <el-form-item :label="$t('Data.zhanghao')" >
            <el-input v-model="AddUser.id"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.yonghumingcheng')" >
            <el-input v-model="AddUser.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.dianhua')" >
            <el-input type="phone" v-model="AddUser.phone"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.youxiang')" >
            <el-input type="email" v-model="AddUser.email"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.yonghumima')" >
            <el-input type="password" v-model="AddUser.passwd"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.quanxian')" >
              <el-checkbox v-model="AddUser.sysadmin.isGroup" :label="$t('Data.zuguanli')" border></el-checkbox>
              <el-checkbox v-model="AddUser.sysadmin.isUser" :label="$t('Data.yonghuguanli')" border></el-checkbox>
              <el-checkbox v-model="AddUser.sysadmin.isDev" :label="$t('Data.shebeiguanli')" border></el-checkbox>
              <el-checkbox v-model="AddUser.sysadmin.isDevAss" :label="$t('Data.shebeifenpei')" border></el-checkbox>
          </el-form-item>

          <el-form-item :label="$t('Data.miaoshu')" >
            <el-input type="textarea" v-model="AddUser.desc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="AddUserDialog = false">{{$t('Data.quxiao')}}</el-button>
          <el-button type="primary" @click="HandleAddUser('ADD')">{{$t('Data.queren')}}</el-button>
        </span>
      </el-dialog>
    <!-- 添加用户组 操作框 -->
  </div>
</template>

<script>
import UserManageTreeList from '@/components/Configuration/UserManageTreeList.vue';
import UserGroupTableVue from '../../components/Configuration/UserAllGroupTable.vue';
import {mapState} from 'vuex'
import UserGroupUsersTable from '../../components/Configuration/UserGroupUsersTable.vue';
import UserInfoTableVue from '../../components/Configuration/UserInfoTable.vue';

export default {
  components:{
    UserManageTreeList,
    UserGroupTableVue,
    UserGroupUsersTable,
    UserInfoTableVue
  },
  data(){
    return {
      GroupData:[],
      AddGroupDialog: false,
      AddGroup:{

      },
      AddUserDialog:false,
      AddUser:{
        id: '',
        name: '',
        passwd: '',
        email: '',
        phone: '',
        sysadmin: {
          isGroup:false,
          isUser:false,
          isDev:false,
          isDevAss:false
        },
        desc: ''
      },
      userManager:undefined,
      group_parentid: '',
      group_info: undefined,
      User_info: undefined,
      groupEvent:undefined
    }
  },
  computed:{
    ...mapState({
      session: 'session',
      lang: 'lang'
    })
  },
  methods:{
    //子组件传过来的群组信息list
    GetGroupData(list){
      this.GroupData = list
      this.$nextTick(()=>{
        if(this.groupEvent!=undefined){
          this.groupEvent.target.click()
        }
        if(this.group_info == undefined){
          let userallgroup = this.$refs['userallgroup']
          userallgroup.SetGroupData(this.GroupData)
        }
      })
    },
    //点击根 用户管理 后逻辑
    handleAllClick(data,node){
      this.group_info = undefined
      this.groupEvent = undefined
      this.User_info = undefined
      this.GetGroupData(this.GroupData)
      console.log('根',data,node);
    },
    //点击用户组后逻辑
    handleGroupClick(data,node,event){
      console.log('组',data,node);
      this.groupEvent = event
      this.group_info = data._group
      this.group_info._group_data = data
      this.$nextTick(()=>{
        let group_users = this.$refs['groupusers']
        group_users.SetGroupData(this.group_info._group_data)
      })
    },
    //点击用户后逻辑
    handleUserClick(data,node,event){
      this.group_info = undefined
      this.User_info = data._user      
      console.log('用户',data,node);
      this.$nextTick(()=>{
        let userinfo = this.$refs['userinfo']
        userinfo.SetData(this.User_info)
      })      
    },
    //添加用户组按钮 逻辑
    HandleAddGroup(target){
      if(target == 'ADD'){
        if(this.AddGroup.name.trim() == '' || this.AddGroup.id.trim() == ''){
          this.$Message.error(this.$t('Data.yonghuzuID,yonghuzumingchengbunengweikong'))
          return
        }
        this.userManager || (this.userManager = this.session.swGetUserManager())
        this.$store.state.ErrorCode = this.userManager.swAddGroup({
          info: {
            id: this.AddGroup.id,
            name: this.AddGroup.name,
            description: this.AddGroup.desc,
            parentid: this.group_info==undefined?'':this.group_info.id,
            resources: []
          },
          callback: (sender, option, data) => {
            this.$store.state.ErrorCode = option.emms.code
            if (option.emms.code != 0) {
              this.$Message.error(this.$t('Data.tianjiashibai'))
              return 
            }
            this.$Message.success(this.$t('Data.tianjiachenggong'))
            this.AddGroupDialog = false
          },
          tag: null
        })
        return
      }
      this.userManager || (this.userManager = this.session.swGetUserManager())
      this.userManager.swGetGroupById('Admin').swGetGroupInfo({
        callback:(sender, event, data)=>{
          let res;
          console.log(data)
        }
      })
      this.AddGroup = {
        id: this.$tools.randomString().toLowerCase(),
        name: 'Group_'+this.$tools.randomString(5).toLowerCase(),
        desc: ''
      }
      this.AddGroupDialog = true
    },
    //添加用户按钮 逻辑
    HandleAddUser(target){
      if(target == 'ADD'){
        if(
          this.AddUser.id.trim()=="" || 
          this.AddUser.name.trim()=="" || 
          this.AddUser.passwd.trim()=="" )
        {
            this.$Message.error(this.$t('Data.yonghuID,mingcheng,mimabunengweikong'))
            return
        }
        this.userManager = this.session.swGetUserManager()
        let group = this.userManager.swGetGroupById(this.group_info.id)

        group.swAddUser({
          info: {
            id: this.AddUser.id,
            name: this.AddUser.name,
            email: '',
            phone: '',
            description: this.AddUser.desc,
            groupid: this.group_info.id,
            allocateId: this.userManager.swGetCurrentUserId(),
            // sysadmin: {
            //   isGroup: this.AddUser.sysadmin.isGroup,
            //   isUser: this.AddUser.sysadmin.isUser,
            //   isDev: this.AddUser.sysadmin.isDev,
            //   isDevAss: this.AddUser.sysadmin.isDevAss
            // },
            sysadmin: this.AddUser.sysadmin,
            passwd: this.AddUser.passwd,
            email: this.AddUser.email,
            phone: this.AddUser.phone,
            resources: []
          },
          callback: (sender, option, data) =>{
            this.$store.state.ErrorCode = option.emms.code
            if(option.emms.code!=0){
              this.$Message.error(this.$t('Data.tianjiashibai'))
              return
            }
            this.$Message.success(this.$t('Data.tianjiachenggong'))
            this.AddUserDialog = false
          },
          tag: null
        })

        return
      }
      this.AddUser = {
        id: '',
        name: '',
        passwd: '',
        email: '',
        phone: '',
        sysadmin: {
          isGroup:false,
          isUser:false,
          isDev:false,
          isDevAss:false
        },
        desc: ''
      }
      this.AddUserDialog = true
    }
  },
  created(){

  }  
}
</script>
<style lang="less">
#ConfigureList{
  display: flex;
  height: 100%;
  .left{
    width: 280px!important;
    height: 100%;
  }
  .body{
    flex:1;
    margin-left: 5px;
    overflow: hidden; 
    height: 100%;
    header{
      height: 60px;
      overflow: hidden;
      &.user_header{
        display: none;
      }
      .h_left{
        img{
          width: 40px;
          height: 40px;
          float: left;
          display: block;
          margin: 10px 10px;
        }
        p{
          float: left;
          font-size: 20px;
          font-weight: 600;
          line-height: 60px;
        }
      }
      .h_right{
        float: right;
        margin-right: 10px;
        button{
          margin-top:10px
        }
        .ivu-icon {
          font-size: 16px!important;
          margin-right: 5px!important;
        }
      }
    }
    
    
    ._content{
      height: calc(100% - 81px);
      overflow: auto;
      &.user_content{
        height: 100% !important;
      }
    }
    .el-divider{
      &.el-divider--horizontal{
        margin: 10px 0;
      }
    }
  }
}
.el-checkbox.el-checkbox--medium.is-bordered{
  margin-left: 0!important
}

</style>