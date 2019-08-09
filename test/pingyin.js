const pinyin = require('pinyin')
const request = require('request')
var fs = require('fs')
var path = require('path')
var process = require('process')

let FilePath = path.resolve('src/plugins/data.json')
let data 
eval('data = ' + fs.readFileSync(FilePath).toString())
console.log(data)

if (!data.zh.Data && !data.en.Data) {
  data.zh.Data = {} 
  data.en.Data = {} 
}

function saveData () {
  fs.writeFile(FilePath, JSON.stringify(data), function (error) {
    if (error) {
      console.log('写入失败')
    } else {
      console.log('写入成功了')
    }
  })
}


function Fangyi (str) {
  let code = pinyin(str, { style: pinyin.STYLE_NORMAL }).join('')
  console.log('code: ', code)
  GetGoogle(str).then(body => {
    body = JSON.parse(body)
    if (body.errorCode == 0) {
      let en = body.translateResult[0][0].tgt
      if (!en) {
        return
      } 
      if (data.zh.Data[code] != undefined) {
        console.log('已有数据：', code)
        console.log(`{{$t('Data.${code}')}}`)
        console.log(`$t('Data.${code}')`)
        console.log(`this.$t('Data.${code}')`)
        return
      }
      data.zh.Data[code] = str
      data.en.Data[code] = en

      // console.log(`名称: ${code}\t中文值: ${data.zh.Data[code]}`)
      // console.log(`名称: ${code}\t英文值: ${data.en.Data[code]}`)
      console.log(data)

      console.log(`{{$t('Data.${code}')}}`)
      console.log(`$t('Data.${code}')`)
      console.log(`this.$t('Data.${code}')`)
      
      saveData()
    }
  }).catch(error => {
    console.error(error)
  })
}
// let num = tool.getTk('%E6%9C%8D%E5%8A%A1%E5%99%A8')
// console.log(num)

function GetGoogle (str) {
  return new Promise((resolve, reject) => {
    let url = `http://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${encodeURIComponent(str)}`
    // let url = `http://www.baidu.com`
    console.log(url)    
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        resolve(body)
      }
    })
  })
}



Fangyi(process.argv[2])



