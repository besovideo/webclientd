<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu mode="horizontal" theme="dark" active-name="1">
          <div class="layout-nav-left">
            {{$config.config_title}}
          </div>
          <div class="layout-nav">
            <MenuItem name="Home" to="/Home"  :style="{'background':this.Name=='Home'?'rgb(30, 87, 163)':''}" >
              {{$t('tab.Home')}}
            </MenuItem>
            <MenuItem name="Monitor" :to="{name:'Monitor'}" :style="{'background':this.Name=='Monitor'?'rgb(30, 87, 163)':''}">
              {{$t('tab.monitor')}}
            </MenuItem>
            <!-- <MenuItem name="3" :style="{'background':this.Name=='123'?'rgb(30, 87, 163)':''}">
              {{$t('tab.inquiry')}}
            </MenuItem> -->
            <MenuItem name="4" :to="{name:'Configuration'}"  :style="{'background':this.Name=='Configuration'?'rgb(30, 87, 163)':''}">
              {{$t('tab.Configuration')}}
            </MenuItem>
            <li style="float:left;font-size:16px;font-weight:700;color:#fff;margin-right:10px">|</li>
            
            <!-- <Dropdown style="float:left;margin-right:10px" @on-click="ChangeLanguage">             
              <span style="color:#fff">{{$t('lang')}}</span></Icon><Icon type="ios-arrow-down" size='16' style="color:#fff"></Icon>
              <DropdownMenu slot="list">
                  <DropdownItem name='zh'>{{$t('lang_zh')}}</DropdownItem>
                  <DropdownItem name='en'>{{$t('lang_en')}}</DropdownItem>
              </DropdownMenu>
            </Dropdown> -->
            <Dropdown style="float:left;margin-right: 10px"  @on-click="ChangePersonal">             
              <Icon type="md-person" size='20' style="color:#fff"></Icon><Icon type="ios-arrow-down" size='16' style="color:#fff"></Icon>
              <DropdownMenu slot="list">
                  <DropdownItem :disabled='true'>{{$store.state.user}}</DropdownItem>
                  <!-- <DropdownItem name='info'>{{$t('tab.Personal.Basic_Info')}}</DropdownItem> -->
                  <!-- <DropdownItem>{{$t('tab.Personal.change_Password')}}</DropdownItem> -->
                  <DropdownItem name='exit'>{{$t('tab.Personal.exit')}}</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown style="float:left;margin:0 10px"  @on-click="ChangePersonal">             
              <Icon type="md-settings" size='20' style="color:#fff"></Icon><Icon type="ios-arrow-down" size='16' style="color:#fff"></Icon>
              <DropdownMenu slot="list">
                  <DropdownItem name="config">{{$t('tab.Configuration')}}</DropdownItem>
              </DropdownMenu>
            </Dropdown>

          </div>
        </Menu>
      </Header>
    <router-view></router-view>
      <!-- <Footer class="layout-footer-center">2011-2016 &copy; TalkingData</Footer> -->
    </Layout>
    <!-- <login-user-info-vue v-model="ShowInfoModal"/> -->
  </div>
</template>
  
<script>
import LoginUserInfoVue from '../components/main/LoginUserInfo.vue';
// @ is an alias to /src

export default {
  name: "Home",
  // components: {
  //   HelloWorld
  // }
  components:{
    LoginUserInfoVue
  },
  data(){
    return {
      Name: '',
      ShowInfoModal:false
    }
  },
  methods:{
    ChangeLanguage(name){
      this.$i18n.locale = name
      localStorage.setItem('locale',name)
    },
    ChangePersonal(name){
      switch (name){
        case 'exit':
          let code = this.$store.state.session.swLogout()
          if(code==jSW.RcCode.RC_CODE_S_OK){
            // window.location.reload()
            window.localStorage.login_info = ""

            this.$router.push({path:'/login'})
          } else {
            window.location.reload()
          }
        break
        case 'info':
          this.ShowInfoModal = true
        break;
        case 'config':
          this.$router.push({name:'UserManage'})
        break;
      }
    }
  },
  watch: {
    $route(to, from) {
      // to表示的是你要去的那个组件，from 表示的是你从哪个组件过来的，它们是两个对象，你可以把它打印出来，它们也有一个param 属性
      // console.log(to)
      if(to.meta.Name){
        this.Name = to.meta.Name
      }
    }
  },
  created(){
    // if(this.$store.state.session==undefined)this.$router.push({name: 'login'})

    // this.Name = this.$route.meta.Name;
    // if(this.$store.state.session == undefined){
    //   this.$router.push({path:'/login'})
    // }else{
    //   this.$store.state.session.swAddCallBack('logout', (sender, event, json)=>{
    //     if ('logout' == event) {
    //       if (json.code == jSW.RcCode.RC_CODE_S_OK) {
    //          // do something
    //       } else{
    //         this.$Message.error('Fail, error code: ' + json.code)
    //       }
    //     }
    //   });
    // }
  }
};
</script>

<style lang="less">

.layout{
    height: 100%;
    // border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    // border-radius: 4px;
    overflow: hidden;
}
.ivu-layout{
  height: 100%;
}
.ivu-layout-header{
  background: rgb(43, 100, 176);
  padding: 0 0 0 50px;
  min-width: 1050px;
}

.layout-nav-left {
  float: left;
  font-size: 24px;
  color: #fff;
}
.ivu-layout-content{
  // display: flex;
  height: calc(100% - 64px);
  background: #fff;
}
.ivu-menu {
  background: rgb(43, 100, 176);
  height: 64px;
  line-height: 64px
}
.ivu-menu-dark.ivu-menu-horizontal .ivu-menu-item:hover {
  background: rgb(30, 87, 163);
}
.layout-logo{
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
}
.layout-nav{
    float: right;
    margin-right: 2px;
}
.layout-footer-center{
    text-align: center;
}
</style>

