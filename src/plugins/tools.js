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
