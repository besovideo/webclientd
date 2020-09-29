import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ip_port: 'http://127.0.0.1:8081',
    session: undefined,
    AutoLogin: undefined,
    ConfigSetDialog: false,
    user: '',
    MapType: 'tian',
    lang: '',
    VideoType: '',
    ErrorCode: -1,
    notify: undefined,
    notify_term: undefined,
    notifyTip: {},
    UserManageInit: false,
    fullscreenLoading: false,
    locateCheckData: {}
  },
  mutations: {
  },
  actions: {
    
  }
})
