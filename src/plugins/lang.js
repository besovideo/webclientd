window.langData = {}
var xmlHttp = new XMLHttpRequest();
xmlHttp.onreadystatechange = function () {
  if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    var responseValue = xmlHttp.responseText;
    langData = JSON.parse(responseValue)
  }
}
xmlHttp.open("GET", "lang/data.json", false);
xmlHttp.send();

var xmlHttp2 = new XMLHttpRequest();
xmlHttp2.onreadystatechange = function () {
  if (xmlHttp2.readyState == 4 && xmlHttp2.status == 200) {
    var responseValue = JSON.parse(xmlHttp2.responseText);

    copyValue(responseValue,langData)
    // langData = Object.assign(langData,JSON.parse(responseValue))
  }
}
xmlHttp2.open("GET", "lang/merge.json", false);
xmlHttp2.send();


function copyValue(src, dist) {
  if (!src || typeof (src) !== 'object' || typeof (dist) !== 'object') {
    return;
  }
  let keys = Object.keys(dist)
  if (keys && keys.length > 0 && isNaN(keys[0])) {
    keys.forEach(key => {
      let value = dist[key]
      let srcVal = src[key]

      // 判断是不是对象，如果是则继续遍历，不是则开始赋值或忽略
      if (value !== undefined && typeof (value) === 'object' && srcVal && typeof (srcVal) === 'object' && srcVal[0] === undefined) {
        copyValue(srcVal, value)
      } else if (value !== undefined && srcVal && typeof (value) == typeof (srcVal)) {
        // 如果源数据存在，并且类型一致，则开始赋值
        dist[key] = src[key]
      }
    })
  }

}