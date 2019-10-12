# encoding='utf8'
import re,os,requests,json
from pypinyin import pinyin, lazy_pinyin, Style,slug


ss = ''
with open('../src/components/Configuration/TermManage/TermInfoTable.vue','r',encoding='utf8') as f:
  ss += f.read()


Data = ''
baseUrl = 'http://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i='


def ReadConf():
  global Data
  with open('../src/plugins/data.json','r',encoding='utf8') as f:
    Data += f.read()

  Data = json.loads(Data)
  # print(Data)

def doTran(chinese):
  pingyin = slug(chinese).strip().replace(' ','').replace('-','')
  content = requests.get(baseUrl+chinese).json()
  if Data['zh']['Data'].get(pinyin) != None:
    print('已经存在: '+Data['zh'].get(pinyin))
    print('已经存在: '+Data['en'].get(pinyin))
    return
  if content['errorCode'] == 0:
    temp = {'en':{},'zh':{}}
    Englist = content['translateResult'][0][0]['tgt']
    temp['en'][pingyin] = Englist
    temp['zh'][pingyin] = chinese

    Data['en']['Data'].update(temp['en'])
    Data['zh']['Data'].update(temp['zh'])
    global ss
    ss = ss.replace("PrimaryInfoList label='"+chinese+"'","PrimaryInfoList :label='$t(\"Data."+pingyin+"\")'")
    print(temp)
    

  

def do1():
  s = re.findall(r'success\">(.+?)<.+?itemright">(.+?)</p>',ss,re.S)

  result = ''
  for temp in s:
    result +="<PrimaryInfoList label='"+temp[0]+"'>\n" 
    result += temp[1]
    result += "</PrimaryInfoList>\n"

  print(result)

def GetChinese(ss):
  s = re.findall(r'PrimaryInfoList label=\'(.+?)\'',ss,re.S)
  ReadConf()
  print(s)
  for temp in s:
    doTran(temp)
    

  with open('_data.json','w+',encoding='utf8') as f:
    f.write(json.dumps(Data,ensure_ascii=False))



if __name__ == "__main__":
  GetChinese(ss)

  with open('../src/components/Configuration/TermManage/TermInfoTable.vue','w',encoding='utf8') as f:
    f.write(ss)
  # with open('TermInfoTable.vue','w',encoding='utf8') as f:
  # doTran('你好,世界')
