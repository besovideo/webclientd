import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/iview.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueVideoPlayer from 'vue-video-player'
import 'videojs-contrib-hls'
import 'video.js/dist/video-js.css' 
import 'font-awesome/css/font-awesome.css'
import tools from './plugins/tools.js' 
import VueI18n from 'vue-i18n'
import rightMenu from 'rightmenu'
// import data from './plugins/data.json'
// import messages from './plugins/messages.js'
import '@/components/Monitor/TreeList.less'
import lodash from 'lodash'
import './plugins/lang.js'

Vue.prototype.$lodash = lodash

Vue.prototype.$config = window





Vue.use(rightMenu)
Vue.use(VueI18n)

Vue.use(ElementUI)


// Object.assign(messages.zh, data.zh)
// Object.assign(messages.en, data.en)

store.state.lang = localStorage.getItem('locale') || 'zh'
const i18n = new VueI18n({
  locale: store.state.lang,
  messages: langData
})

document.title = window.config_title || langData[store.state.lang]["title"] 
Vue.prototype.$tools = tools
Vue.config.productionTip = false
Vue.use(VueVideoPlayer)

// router.beforeEach((to, from, next) => {
//   if (to.meta.title) {
//   }
//   if (!store.state.session) {
//     if (to.name !== 'login') {
//       router.push({
//         name: 'login'
//       })
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })
router.afterEach(route => {
  if (route.meta.title != 'Login')
    localStorage.setItem("lastUrl", route.path)
})



// Vue.directive('right-menu', {
//   bind: (el) => {

//   },
//   inserted: (el) => {

//   }
// })

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}
var user = getQueryVariable('user')
var pass = getQueryVariable('pass')
var Server = getQueryVariable('server')
var Server_Port = getQueryVariable('port')
// window.onload = function() {
//   console.log(jSW, user, pass)

//   if (!user || !pass) {
//     return
//   }
//   let initCode = window.jSW.swInit({
//     // url: window.location.origin, //bv_nginx.exe服务器地址
//     url,
//     calltype: window.jSW.CallProtoType.HTTP, // AUTO: IE优先使用OCX, 如果希望IE仍然使用HTTP通信, 请使用jSW.CallProtoType.HTTP
//     config:{
//       bManualLP:true
//     },
//     oninit: (code)=>{
//       if(code==jSW.RcCode.RC_CODE_S_OK){
//           store.state.session = new window.jSW.SWSession({
//             server: Server || '127.0.0.1',
//             port: Server_Port || '9701',
//             onopen: sess => {
//               sess.swLogin({
//                 user,
//                 password: pass
//               })
//             }
//           })
//           window._session = this.$store.state.session
//           store.state.session.swAddCallBack('login', this.sessionCallback);
//           store.state.session.swAddCallBack('logout', ()=>{
//             if (store.state.session) {
//               store.state.session.swLogout();
//             }
//           });
//           store.state.session.swAddCallBack('notify', this.notifyCallback);
//         }else{
//           store.state.ErrorCode = code
//           console.log(code)
//           switch (parseInt(code)){
//               case jSW.RcCode.RC_CODE_E_INVALIDIP:
//                 this.$Message.error('Server IP Error')
//               break;
//               case jSW.RcCode.RC_CODE_E_INVALIDPORT:
//                 this.$Message.error('Server Port Error')
//               break;
//               case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
//                 this.$Message.error('Connect Failed')
//               break;
//               case jSW.RcCode.RC_CODE_E_USERNAME:
//               case jSW.RcCode.RC_CODE_E_PASSWORD:
//                 this.$Message.error('No User Or Password error')
//               break;
//               case jSW.RcCode.RC_CODE_E_BVCU_AUTHORIZE_FAILED:
//                 this.$Message.error('Authorize Failed')
//               break;
//               case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
//                 this.$Message.error('Connect Failed')
//               break;
//               default:
//                 this.$Message.error('Fail, error code: ' + code)
//               break
//           }
//         }
//       }
//     })
//     console.log('initCode:',initCode);

// }

// const mix = {
//   created() {
//     console.log('create mix : ', this.$route)
//   }
// }


// Vue.mixin(mix)

var app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

console.log(app)
