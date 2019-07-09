import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/iview.js'
import VueVideoPlayer from 'vue-video-player'
import 'videojs-contrib-hls'
import 'video.js/dist/video-js.css'
import 'font-awesome/css/font-awesome.css'
import tools from './plugins/tools.js'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'zh',
  messages: require('./plugins/messages.js')
})

Vue.prototype.$tools = tools
Vue.config.productionTip = false
Vue.use(VueVideoPlayer)

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = i18n.t(to.meta.title)
  }
  if (!store.state.session) {
    if (to.name !== 'login') {
      router.push({
        name: 'login'
      })
    } else {
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
  i18n,
  render: h => h(App)
}).$mount('#app')
