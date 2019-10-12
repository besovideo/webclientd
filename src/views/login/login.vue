<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" :bordered="false">
        <p slot="title">
            {{$t('login.login_tip')}}
        </p>
        <Dropdown slot="extra" @on-click='ChangeLanguage'>
          <a  href="javascript:void(0)">
              {{$t('lang')}}
              <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
              <DropdownItem name='zh'>{{$t('lang_zh')}}</DropdownItem>
              <DropdownItem name='en'>{{$t('lang_en')}}</DropdownItem>
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
      password:''
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
    handleSubmit ({userName, password }) {
      let url = window.location.origin
      // let url = 'https://115.28.79.237:9443'

      if(process.env.NODE_ENV=='development'){
        // url = 'https://115.28.79.237:8081'
        // url = 'http://192.168.0.67:9443'
        url = 'https://127.0.0.1:8081'
      }
      this.spinShow = true
      // this.Server = Server
      // this.Server_Port = Server_Port
      this.userName = userName
      this.password = password
      // console.log('-------------------------',Server ,Server_Port, userName, password )
      // window.onload = ()=>{
      let initCode = window.jSW.swInit({
        // url: window.location.origin, //bv_nginx.exe服务器地址
        url,
        // url: '',
        calltype: window.jSW.CallProtoType.HTTP, // AUTO: IE优先使用OCX, 如果希望IE仍然使用HTTP通信, 请使用jSW.CallProtoType.HTTP
        config:{
          bManualLP:true
        },
        oninit: (code)=>{
          if(code==jSW.RcCode.RC_CODE_S_OK){
              this.$store.state.session = new window.jSW.SWSession({
              // server: Server,
              // port: 9700,
              onopen: sess => {
                sess.swLogin({
                  user: userName,
                  password: password
                })
              }
            })
            window._session = this.$store.state.session
            this.$store.state.session.swAddCallBack('login', this.sessionCallback);
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
                  this.$Message.error('ConnectFailed')
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
    localStorage.getItem('VideoType')? '': localStorage.setItem('VideoType','auto')
    this.$store.state.VideoType = localStorage.getItem('VideoType')
    this.$store.state.lang = localStorage.getItem('locale')
    if(process.env.NODE_ENV=='development'){
      this.handleSubmit({userName:'admin',password:'123456'})
    }
  }
}
</script>

<style>

</style>
