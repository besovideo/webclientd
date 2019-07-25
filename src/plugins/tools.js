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
  checkFlash () {
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
