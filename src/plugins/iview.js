import Vue from 'vue'
import iView from 'iview'

import '../iview-variables.less'

Vue.use(iView,{
  i18n: function(path, options) {
    let value = i18n.t(path, options)
    if (value !== null && value !== undefined) {
      return value
    }
    return ''
  }
})
