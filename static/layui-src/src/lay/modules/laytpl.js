/**

 @Name : layui.laytpl 模板引擎
 @Author：贤心
 @License：MIT

 */

layui.define(function(exports){

  "use strict";

  var config = {
    open: '{{',
    close: '}}'
  };

  var tool = {
    exp: function(str){
      return new RegExp(str, 'g');
    },
    //匹配满足规则内容
    query: function(type, _, __){
      var types = [
        '#([\\s\\S])+?',   //js语句
        '([^{#}])*?' //普通字段
      ][type || 0];
      return exp((_||'') + config.open + types + config.close + (__||''));
    },
    escape: function(html){
      // console.log("escape: ", html);
      const res = String(html||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      // console.log("after escape", res);
      return res;
    },
    error: function(e, tplog){
      var error = 'Laytpl Error：';
      typeof console === 'object' && console.error(error + e + '\n'+ (tplog || ''));
      return error + e;
    }
  };

  var exp = tool.exp, Tpl = function(tpl){
    this.tpl = tpl;
  };

  Tpl.pt = Tpl.prototype;

  window.errors = 0;

  //编译模版
  Tpl.pt.parse = function(tpl, data){
    var that = this, tplog = tpl;
    var jss = exp('^'+config.open+'#', ''), jsse = exp(config.close+'$', '');

    tpl = tpl.replace(/\s+|\r|\t|\n/g, ' ')
    .replace(exp(config.open+'#'), config.open+'# ')
    .replace(exp(config.close+'}'), '} '+config.close).replace(/\\/g, '\\\\')

    //不匹配指定区域的内容
    .replace(exp(config.open + '!(.+?)!' + config.close), function(str){
      str = str.replace(exp('^'+ config.open + '!'), '')
      .replace(exp('!'+ config.close), '')
      .replace(exp(config.open + '|' + config.close), function(tag){
        return tag.replace(/(.)/g, '\\$1')
      });
      return str
    })

    //匹配JS规则内容
    .replace(/(?="|')/g, '\\').replace(tool.query(), function(str){
      str = str.replace(jss, '').replace(jsse, '');
      return '";' + str.replace(/\\/g, '') + ';view+="';
    })

    //匹配普通字段
    .replace(tool.query(1), function(str){
      var start = '"+(';
      if(str.replace(/\s/g, '') === config.open+config.close){
        return '';
      }
      str = str.replace(exp(config.open+'|'+config.close), '');
      // console.log("str",str);
      /**
       *  FIXME: 2021/8/25 Shirtiny
       *  修改使用layim（那个聊天框和面板）导致的xss注入问题 待观察有无其他影响
       * 正则： /data\.[a-z]+/i.test(str) 用于匹配data.properties形式的字段
       * 对其字段值 中的 < / >等html敏感字符进行转义  layui作者写的escape在上面30行
       * 如果遇到其他问题 可在render返回处使用DOMPurify进行过滤，不过要注意保留必要的属性值 如下面115行所示， DOMPurify在public/index.html:34
       */
      if(/^=/.test(str) || /data\.[a-z]+/i.test(str)){
        // console.log("_escape_",str);
        str = str.replace(/^=/, '');
        start = '"+_escape_(';
      }
      return start + str.replace(/\\/g, '') + ')+"';
    });

    tpl = '"use strict";var view = "' + tpl + '";return view;';

    try{
      that.cache = tpl = new Function('d, _escape_', tpl);
      return tpl(data, tool.escape);
    } catch(e){
      delete that.cache;
      return tool.error(e, tplog);
    }
  };

  Tpl.pt.render = function(data, callback){
    var that = this, tpl;
    if(!data) return tool.error('no data');
    tpl = that.cache ? that.cache(data, tool.escape) : that.parse(that.tpl, data);
    // console.log("laytpl 103", tpl);
    // DOMPurify： https://github.com/cure53/DOMPurify
    // const filteredTpl = window.DOMPurify.sanitize( tpl, {
    //   ADD_ATTR: ['layim-event', 'lay-type'],
    //   ALLOW_DATA_ATTR: true
    //  });
    // console.log("cleaned", filteredTpl);
    if(!callback) return tpl;
    callback(tpl);
  };

  var laytpl = function(tpl){
    if(typeof tpl !== 'string') return tool.error('Template not found');
    return new Tpl(tpl);
  };

  laytpl.config = function(options){
    options = options || {};
    for(var i in options){
      config[i] = options[i];
    }
  };

  laytpl.v = '1.2.0';

  exports('laytpl', laytpl);

});
