<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">

    <div class="login-con">
      <h1 class="login_titile" style=""> {{$config.config_title}}
  </h1>
      <Card icon="log-in" :bordered="false">
        <p slot="title">
            {{$t('login.login_tip')}}
        </p>
        <Dropdown slot="extra" @on-click='ChangeLanguage'>
          <a href="javascript:void(0)">
              {{$t('lang')}}
              <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
              <DropdownItem v-for="(item,name) in langData.type" :name='name' :key="name">{{item}}</DropdownItem>
              <!-- <DropdownItem name='en'>{{$t('lang_en')}}</DropdownItem> -->
          </DropdownMenu>
        </Dropdown>
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
        </div>
      </Card>
    </div>
    <!-- <Spin size="large" fix v-if="spinShow"></Spin> -->
  </div>
</template>

<script>
import LoginForm from '../../components/login/login-form'

export default {
  data(){
    return {
      spinShow: false,
      Server:'',
      Server_Port:'', 
      userName:'', 
      password:'',
      langData: window.langData
    }
  },
  components: {
    LoginForm
  },
  methods: {
    ChangeLanguage(name){
      this.$i18n.locale = name
      localStorage.setItem('locale',name)
      this.$store.state.lang = name
    },
    handleSubmit ({userName, password ,Server="127.0.0.1",Server_Port="9701"}) {
      if(Server.trim() == '' || Server_Port.trim() == '') {
        this.$Message.error('Server port cannot be empty')
        return
      }

      window.localStorage.setItem("lastConnect",JSON.stringify({Server,Server_Port}))

      
      let url = window.location.origin
      // let url = 'https://115.28.79.237:9443'

      if(process.env.NODE_ENV=='development'){
        // url = 'https://115.28.79.237:9443'
        // url = 'https://112.30.114.240:9443';
        url = 'https://192.168.8.7:9443'  
        // url = 'https://61.191.27.18:9443'
        // url = 'https://192.168.0.68:9443'
        // url = 'https://127.0.0.1:9443'
        // url = 'https://192.168.0.68:9443'
      }
      this.spinShow = true
      this.userName = userName
      this.password = password
      
      let initCode = window.jSW.swInit({
        // url: window.location.origin, //bv_nginx.exe服务器地址
        url,
        calltype: window.jSW.CallProtoType.HTTP, // AUTO: IE优先使用OCX, 如果希望IE仍然使用HTTP通信, 请使用jSW.CallProtoType.HTTP
        config:{
          bManualLP:true
        },
        oninit: (code)=>{
          if(code==jSW.RcCode.RC_CODE_S_OK){
              this.$store.state.session = new window.jSW.SWSession({
              server: Server,
              port: Server_Port,
              onopen: sess => {
                sess.swLogin({
                  user: userName,
                  password: password
                })
              }
            })
            window._session = this.$store.state.session
            this.$store.state.session.swAddCallBack('login', this.sessionCallback);
            this.$store.state.session.swAddCallBack('logout', ()=>{
              if (this.$store.state.session) {
                this.$store.state.session.swLogout();
              }
            });
            this.$store.state.session.swAddCallBack('notify', this.notifyCallback);
          }else{
            this.$store.state.ErrorCode = code
            console.log(code)
            switch (parseInt(code)){
                case jSW.RcCode.RC_CODE_E_INVALIDIP:
                  this.$Message.error('Server IP Error')
                break;
                case jSW.RcCode.RC_CODE_E_INVALIDPORT:
                  this.$Message.error('Server Port Error')
                break;
                case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
                  this.$Message.error('Connect Failed')
                break;
                case jSW.RcCode.RC_CODE_E_USERNAME:
                case jSW.RcCode.RC_CODE_E_PASSWORD:
                  this.$Message.error('No User Or Password error')
                break;
                case jSW.RcCode.RC_CODE_E_BVCU_AUTHORIZE_FAILED:
                  this.$Message.error('Authorize Failed')
                break;
                case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
                  this.$Message.error('Connect Failed')
                break;
                default:
                  this.$Message.error('Fail, error code: ' + code)
                break
            }
          }
        }
      })
      console.log('initCode:',initCode);

     
    },
    notifyCallback(sender, event, json){
      console.log('notify: ',json.msg);
      
      switch(json.msg){
        case 'notify_pu_onoffline':
            console.log('notify_pu_onoffline');
            this.$store.state.notify = json.content
            this.$store.state.notify_term = json.content
          break
      }
      // console.log('notify: ',sender, event, json);
    },
    sessionCallback(sender, event, json){
        console.log("Login:",json);
        if (json.code == jSW.RcCode.RC_CODE_S_OK) {
          // window.localStorage.setItem('Server',this.Server)
          // window.localStorage.setItem('Server_Port',this.Server_Port)
          window.localStorage.setItem('userName',this.userName)
          this.$store.state.user = this.userName
          this.$router.push({path:'/Monitor'})
        } else {
          this.$store.state.ErrorCode = json.code
          switch (parseInt(json.code)){
              case jSW.RcCode.RC_CODE_E_INVALIDIP:
                this.$Message.error('Server IP Error')
              break;
              case jSW.RcCode.RC_CODE_E_INVALIDPORT:
                this.$Message.error('Server Port Error')
              break;
              case jSW.RcCode.RC_CODE_E_USERNAME:
              case jSW.RcCode.RC_CODE_E_PASSWORD:
                this.$Message.error('No User Or Password error')
              break;
              case jSW.RcCode.RC_CODE_E_BVCU_AUTHORIZE_FAILED:
                this.$Message.error('Authorize Failed');
              break;
              case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
                this.$Message.error('ConnectFailed')
              break;
              default:
                this.$Message.error('Fail, error code: ' + json.code)
              break
          }
          this.spinShow = false
        }
    },
    
  },
  created(){
    console.log(this)
    localStorage.getItem('VideoType')? '': localStorage.setItem('VideoType','auto')
    this.$store.state.VideoType = localStorage.getItem('VideoType')
    this.$store.state.lang = localStorage.getItem('locale')
    if(process.env.NODE_ENV=='development' && window.localStorage.getItem('login')=='true'){
      // this.handleSubmit({userName:'admin',password:'123456'})
      this.handleSubmit({userName:'test',password:'123'})
      // this.handleSubmit({userName:'root',password:'besovideo88'})
    }
  }
}
</script>

<style>

</style>
