
export default {
  launchIntoFullscreen: (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  },
  findErrorCode: (code) => {
    return Object.keys(jSW.RcCode).find(k => jSW.RcCode[k] == code)
  },
  checkFlash: () => {
    let hasFlash = false
    let flashVersion
    if (navigator.plugins && navigator.plugins.length > 0) {
      let swf = navigator.plugins['Shockwave Flash']
      if (swf) {
        hasFlash = true
        var codes = swf.description.split(' ')
        for (var i = 0; i < codes.length; ++i) {
          if (isNaN(parseInt(codes[i]))) continue
          flashVersion = parseInt(codes[i])
        }
      }
    }
    return { f: hasFlash, v: flashVersion }
  },
  exitFullscreen: () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  },
  randomString: (len) => {
    len = len || 31
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'   
    var maxPos = $chars.length
    var pwd = ''
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  },
  ErrorHandle: (code, cb) => {
    if (code == jSW.RcCode.RC_CODE_E_DISCONNECTED) {
      cb()
    }
  },
  // eslint-disable-next-line camelcase
  utc2beijing: (new_datetime) => {
    let timestamp
    if (isNaN(new_datetime)) {
      // 处理成为时间戳
      var _offset = new Date().getTimezoneOffset() / 60
      timestamp = new Date(Date.parse(new_datetime))
      timestamp = timestamp.getTime()
      timestamp = timestamp / 1000
      // 增加8个小时，北京时间比utc时间多八个时区
      timestamp = timestamp + (-_offset) * 60 * 60
    } else {
      timestamp = parseInt(new_datetime)
    }

    

    function formatFunc (str) {    
      return str > 9 ? str : '0' + str
    }
    // 时间戳转为时间
    let date2 = new Date(parseInt(timestamp) * 1000)
    let year = date2.getFullYear()
    let mon = formatFunc(date2.getMonth() + 1)
    let day = formatFunc(date2.getDate())
    let hour = date2.getHours()
    // let noon = hour >= 12 ? 'PM' : 'AM';
    // let noon = hour >= 12 ? 'PM' : 'AM';
    // hour = hour>=12?hour-12:hour;
    hour = formatFunc(hour)
    let min = formatFunc(date2.getMinutes())
    // let dateStr = year+'-'+mon+'-'+day+' '+noon +' '+hour+':'+min;
    let dateStr = year + '-' + mon + '-' + day + ' ' + hour + ':' + min
    return dateStr
  }
  // getCookie: (name, defaultValue) => {
  //   let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  //   var arr = document.cookie.match(reg)
  //   if (arr) {
  //     return unescape(arr[2])
  //   } else {
  //     return defaultValue
  //   }
  // }
}
