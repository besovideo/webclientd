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
import rightMenu from 'rightMenu'
import data from './plugins/data.json'
import messages from './plugins/messages.js'
import '@/components/Monitor/TreeList.less'
import lodash from 'lodash'

Vue.prototype.$lodash = lodash

// require('../static/layui-src/src/layui.js')
// require('../static/layui-src/src/css/layui.css')



Vue.use(rightMenu)
Vue.use(VueI18n)

Vue.use(ElementUI)


Object.assign(messages.zh, data.zh)
Object.assign(messages.en, data.en)
store.state.lang = localStorage.getItem('locale') || 'zh'
const i18n = new VueI18n({
  locale: store.state.lang,
  messages: messages
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
