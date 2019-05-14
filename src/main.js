import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/iview.js'
import VueVideoPlayer from 'vue-video-player'
import 'videojs-contrib-hls'
import 'video.js/dist/video-js.css'

Vue.config.productionTip = false
Vue.use(VueVideoPlayer)

window.jSW.swInit({
  url: store.state.ip_port, // bv_nginx.exe服务器地址
  calltype: window.jSW.CallProtoType.AUTO // AUTO: IE优先使用OCX, 如果希望IE仍然使用HTTP通信, 请使用jSW.CallProtoType.HTTP
})

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title
  }
  if (!store.state.session) {
    window.onload = () => {
      store.state.session = new window.jSW.SWSession({
        onopen: sess => {
          sess.swLogin({
            user: 'admin',
            password: '123456'
          })
        }
      })
      next()
    }
  } else {
    next()
  }
})
router.afterEach(route => {
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
