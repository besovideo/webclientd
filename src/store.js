import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ip_port: 'http://127.0.0.1:8081',
    session: undefined,
    user: '',
    lang: '',
    VideoType: '',
    ErrorCode: -1,
    notify: undefined,
    notify_term: undefined,
    notifyTip: {},
    UserManageInit: false,
    locateCheckData: {}
  },
  mutations: {
  },
  actions: {
    
  }
})
