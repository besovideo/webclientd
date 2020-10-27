# 修改语言包方法

1. 按照data.json 里面的格式, 复制到merge.json 中进行修改

2. merge.json ```没有的话需要新建``` 里面的修改的内容会替换语言包中的翻译


# 新增语言包方法

1.  在type 中，新增一项英文标识字段
 ```type:json
   
    "type": { 
      ...
      "korean": "한국인"  
    }

```

2. 在type 同级下 增加字段 
```type:json

  "type": {...},
  "zh": {...},
  "en":{...},
  "Korean": {  // 在type中新增的英文字段
    ...        // 根据 zh en 中的内容进行翻译
  }

```
