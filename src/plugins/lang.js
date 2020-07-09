
var xmlHttp = new XMLHttpRequest();
xmlHttp.onreadystatechange = function () {
  if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    var responseValue = xmlHttp.responseText;
    langData = JSON.parse(responseValue)
  }
}
xmlHttp.open("GET", "lang/data.json", false);
xmlHttp.send();
