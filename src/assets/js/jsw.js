window.jSW = window.jSW || {};

(function (jSW) {
  var jSWInit = function () {
    var jSWProtocol = jSW.DependencyMgr.CreateModule("jSWProtocol"); /**通信协议*/
    var jSWUtils = jSW.DependencyMgr.CreateModule("jSWUtils"); /**工具*/
    var jSWOptions = jSWOptions || { /**全局配置*/
      http: 'http://127.0.0.1',
      ip: '192.168.6.32',
      port: 8181,
      url: '/jswapi',
      appkey: 'FE04553E-B6D8-4CCB-AAAB-FF7F6B64E006',
      version: '1.0.1',
      calltype: 0, //jSW.CallProtoType.AUTO
      ocxWebsocketPort: 0,
      session_list: [], // Array(jSW.SWSession)
      init_options: null,
      CheckOcx: function () {
        return jSW.CallProtoType.CheckOcx(this.calltype);
      },
      CheckNotOcx: function () {
        return !this.CheckOcx();
      },
      CheckHttp: function () {
        return jSW.CallProtoType.HTTP == this.calltype;
      }
    };
    jSW.DependencyMgr.RegModule("jSWOptions", jSWOptions, true);

    jSW.CallProtoType = {
      AUTO: 0,
      OCX: 1,
      HTTP: 2,
      CheckOcx: function (protoType) {
        return protoType == this.OCX;
      }
    };

    jSW.SW_CHANEL_STATUS = {
      OPENED: 0,      //打开成功
      OPENING: 1,     //正在打开
      CLOSED: 2,      //关闭
      HLS_OPEN: 3,    //打开HLS
      HLS_M3U8: 4     //产生m3u8文件
    };

    jSW.MessageType = null;

    jSW.RotateType = null;

    jSW.EventActions = null;

    jSW.StorageRecordType = {
      NONE: 0,
      MANUAL: (1 << 0),
      ONTIME: (1 << 1),
      ONALARM: (1 << 2)
    };

    jSW.OpenDebug = function (isOpen) {
      jSWUtils._IsDebug = isOpen;
    }

    jSW.StorageFileType = {
      ALL: 0,      // 不限定文件类型
      RECORD: 1 << 0,   // 录像文件
      CAPTURE: 1 << 1,  // 图片文件
      GPS: 1 << 2, // 固件文件
      AUDIO: 1 << 3,// 音频文件
      FIRMWARE: 1 << 8      // GPS文件
    };

    /**ocx事件回调函数*/
    jSW._swOcxOnEvent = function (rc, data) {
      console.log('ocx on event rc:' + rc + ' websocket port: ' + data);
      var port = parseInt(data);
      if (rc != jSW.RcCode.RC_CODE_S_OK || port <= 0) {
        console.error('ocx init fail ' + rc + ' ' + port);
      }

      if (port <= 0) {
        rc = jSW.RcCode.RC_CODE_E_INVALIDARG;
      }

      jSWOptions.ocxWebsocketPort = port;

      if (jSWOptions.init_options.oninit && (typeof jSWOptions.init_options.oninit) === 'function') {
        if (jSW._mMgr.bUseOcx()) {
          setTimeout(jSWOptions.init_options.oninit, 50, rc);
        } else {
          jSWOptions.init_options.oninit(rc);
        }

      }
    };

    function OcxPlayWndDispatchUiEvent(divid, type) {
      var divParent = document.getElementById(divid);
      if (divParent) {
        divParent = divParent.parentNode;
        var params = params || { bubbles: false, cancelable: false };
        var mouseEvent = document.createEvent('MouseEvent');
        mouseEvent.initMouseEvent(type, params.bubbles, params.cancelable, window, 0, params.screenX || 0, params.screenY || 0, params.clientX || 0, params.clientY || 0, false, false, false, false, 0, null);
        divParent.dispatchEvent(mouseEvent);
      }
    }

    jSW._swOcxPlayerOnEvent = function (iEvent, chanel) {
      try {
        if (iEvent == 0 && chanel) {
          chanel._swOnDivSizeChange(-1);
        }
      } catch (e) {
        // console.log(e);
      }
    }

    jSW._lastOptions = null;
    /**options: {
        url: 'http://192.168.6.100:8080',
        calltype: 0,//jSW.CallProtoType.AUTO,
        oninit: function(rc) { },
        config: {
                bocxws: false,
                bNEGP: false
            }
        }*/
    jSW.swInit = function (options) {
      // 初始化，交换密钥等
      SetInitConfigParams(options);
      jSW.DependencyMgr.LoadProDepends(function (options) {
        console.log("Start Jsw Init");
        var dft_options = {
          url: null,
          calltype: jSW.CallProtoType.AUTO,
          oninit: null,
          home: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        if (jSW.MessageType == null) {
          jSW.MessageType = jSWProtocol.RequestHeader.notifys;
        }
        if (jSW.RotateType == null) {
          jSW.RotateType = jSWProtocol.RotateType;
        }
        if (jSW.EventActions == null) {
          jSW.EventActions = jSWProtocol.EVENTACTIONS;
        }


        // 检测浏览器是否支持websocket
        if (false == ("WebSocket" in window)) {
          alert('not support websocket');
          if (options.oninit && (typeof options.oninit) === 'function') {
            options.oninit(jSW.RcCode.RC_CODE_E_INVALIDARG);
          }
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        jSWOptions.init_options = options;

        var curWWWPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var pos = curWWWPath.lastIndexOf(pathName);
        var url = curWWWPath.substring(0, pos);

        if (options.url != null && options.url.length > 0) {
          url = options.url;
        }

        if (options.home == null) {
          options.home = url;
        }

        var httpsProto = (url.indexOf("https") == 0) ? "https://" : "http://";

        jSWOptions.http = url;
        jSWOptions.url = url.replace(httpsProto, "") + '/jswapi';

        var szInfo = url.replace(httpsProto, "").replace('/', "").split(':');

        jSWOptions.ip = szInfo[0];
        jSWOptions.port = szInfo[1];

        jSWOptions.calltype = options.calltype;
        if (jSW.CallProtoType.AUTO == jSWOptions.calltype) {
          if (jSWUtils.isIE()) {
            jSWOptions.calltype = jSW.CallProtoType.OCX;
          } else {
            jSWOptions.calltype = jSW.CallProtoType.HTTP;
          }
        }

        if (false == jSWUtils.isIE()) {
          if (jSW.CallProtoType.OCX == jSWOptions.calltype) {
            console.error('only ie support ocx!');
            if (options.oninit && (typeof options.oninit) === 'function') {
              options.oninit(jSW.RcCode.RC_CODE_E_INVALIDARG);
            }
            return jSW.RcCode.RC_CODE_E_INVALIDARG;
          }
        }

        if (jSW.CallProtoType.OCX == jSWOptions.calltype) {
          var jsw_ocx = document.getElementById('jsw_ocx');
          if (jsw_ocx == null) {
            try {
              jsw_ocx = document.createElement('object');
              jsw_ocx.id = 'jsw_ocx';
              jsw_ocx.classid = "clsid:51DF1D91-DA4E-47DA-A5BE-84A96ADD2425";
              jsw_ocx.width = 1;
              jsw_ocx.height = 1;
              jsw_ocx.style.position = "absolute";
              jsw_ocx.style.top = "0px";
              jsw_ocx.style.left = "0px";
              document.body.appendChild(jsw_ocx);
            } catch (e) {
              console.error('ocx attach exception ' + e);
              var temp = document.getElementById('jsw_ocx')
              if (temp) {
                document.body.removeChild(temp);
              }
              if (jSW.CallProtoType.OCX == jSWOptions.calltype) {
                if (options.oninit && (typeof options.oninit) === 'function') {
                  options.oninit(jSW.RcCode.RC_CODE_E_INVALIDARG);
                }
                return jSW.RcCode.RC_CODE_E_INVALIDARG;
              }
              jSWOptions.calltype = jSW.CallProtoType.HTTP;
            }

            if (null != jsw_ocx) {
              try {
                // 注册事件
                var iintervaltimes = 0;
                var ihandle = setInterval(function () {
                  document.innerHTML -= "0";
                  var idesPort = jsw_ocx.oxGetWebSocketPort();
                  if (idesPort > 0 || iintervaltimes > 10) {
                    clearInterval(ihandle);
                    jSW._swOcxOnEvent(0, idesPort);
                  } else {
                    iintervaltimes++;
                  }
                }, 200);
              } catch (e) {

                var temp = document.getElementById('jsw_ocx')
                if (temp) {
                  document.body.removeChild(temp);
                }
                document.body.removeChild(oScript);
                console.error('ocx add event exception ' + e);
                if (jSW.CallProtoType.OCX == jSWOptions.calltype) {
                  if (options.oninit && (typeof options.oninit) === 'function') {
                    options.oninit(jSW.RcCode.RC_CODE_E_INVALIDARG);
                  }
                  return jSW.RcCode.RC_CODE_E_INVALIDARG;
                }
                jSWOptions.calltype = jSW.CallProtoType.HTTP;
              }

              jSW._mMgr.RegOcxHandle(jsw_ocx);
            }
          } else {
            if (options.oninit && (typeof options.oninit) === 'function') {
              options.oninit(jSW.RcCode.RC_CODE_S_OK);
            }
          }

          jSW.DependencyMgr.LoadOcxDepends();
        }
        else if (jSWOptions.calltype == jSW.CallProtoType.HTTP) {
          jSW.DependencyMgr.LoadHttpDepends(function (options) {
            if (options.oninit && (typeof options.oninit) === 'function') {
              options.oninit(jSW.RcCode.RC_CODE_S_OK);
              jSWUtils.debugLogInfo("load video.js ok!");
            }
          }, options);
        }
      }, options);
      return 0;//jSW.RcCode.RC_CODE_S_OK;定义jSW.RcCode的库还没加载
    };

    /**
     * options : { config: {}}
     */
    function SetInitConfigParams(options) {
      var config = {
        bocxws: false,
        bNEGP: false
      };
      if (options && options.config) {
        config.bocxws = options.config.bocxws ? true : false;
        config.bNEGP = options.config.bNEGP ? true : false;
      }
      jSW._mMgr.setBUseOcxWs(config.bocxws);
      PulistLoadMgr.Config.SetMultiNotifyDft(config.bNEGP);
    }

    jSW.swDeInit = function () {
      if (jSWOptions.session_list.length > 0) {
        for (var i = 0; i < jSWOptions.session_list.length; i++) {
          jSWOptions.session_list[i].swDispose();
          delete jSWOptions.session_list[i];
        }
        jSWOptions.session_list = [];
      }
      if (jSW.RcCode) {
        return jSW.RcCode.RC_CODE_S_OK;
      }
    };

    jSW.swGetOption = function () {
      var opt = {
        http: jSWOptions.http,
        version: jSWOptions.version,
        calltype: jSWOptions.calltype,
      };

      return opt;
    }

    // ---- SWSession ----
    /**options: {
        server: '127.0.0.1',
        port: 9701,
        onopen: null, // function(sess) { }
        onclose: null, // function(sess, evt) { }
       } */
    jSW.SWSession = function (options) {

      jSW.swDeInit();

      var dft_options = {
        server: '127.0.0.1',
        port: 9701,
        onopen: null,
        onclose: null
      };

      options = jSWUtils.extend({}, dft_options, options || {});

      jSW.SWSession._init(this, options);

      jSW.SWSession._CreateWs(this, options);

      this._pulistLoadMgr = new PulistLoadMgr(this);
    };

    jSW.SWSession._init = function (session, options) {
      session._server = jSWUtils.isIE() ? options.server : "127.0.0.1";
      session._port = Number(options.port);

      session._arr_pu = [];
      session._arr_pu_index = [];
      session._arr_pu_offline = [],
        session._arr_pu_online = [],
        session._arr_dialog = [];
      session._arr_record_play = [];
      session._p_emms = new proto.WEBBVCU.EmmsHeader();
      session._p_emms.setKey(jSWOptions.appkey);
      session._p_emms.setVer(jSWOptions.version);
      session._emms = new jSWProtocol.EmmsHeader(jSWOptions.appkey, jSWOptions.version);
      session._bLogout = false;

      session._callbackManager = new jSW.SWCallbackManager(session, [
        jSWProtocol.RequestHeader.notifys.notify.cmd,
        jSWProtocol.RequestHeader.login.cmd,
        jSWProtocol.RequestHeader.keeplive.cmd,
        jSWProtocol.RequestHeader.logout.cmd,
        jSWProtocol.RequestHeader.pulist.cmd,
        jSWProtocol.RequestHeader.openchanle.cmd,
        jSWProtocol.RequestHeader.keeplivechanle.cmd,
        jSWProtocol.RequestHeader.closechanle.cmd,
        jSWProtocol.RequestHeader.pugpsdata.cmd,
      ]);

      session._confManager = null;
      session._immodule = null;
      session._pusModule = null;
      if (jSWOptions.calltype == jSW.CallProtoType.OCX) {
        session._pusModule = new jSW.SWSession._SwPuModule(session);
      }

      session._confManager = new jSW.SwConfManager(session);
      session._immodule = new jSW.SWSession.SwImModule(session, session._confManager, session._pusModule);

      session._userManager = new jSW.SwUserManager(session);
      session._commDlgMgr = new jSW.CommonDlgMgr(session);
    }

    jSW.SWSession._CreateWs = function (session, options) {
      try {
        jSW._mMgr.loadWebSocket(function (session, options, MyWs) {
          try {
            var url = session._getWsDesUrl(options);
            session._ws = new MyWs(url);
            session._checkWsCreateResult(options);

            var audio = jSW.DependencyMgr.GetModule("Audio");
            audio.CreateWs(MyWs, url);
          }
          catch (e) {
            session._onWsError(options, e);
          }
        }, session, options);

      } catch (e) {
        this._onWsError(options, e);
        return;
      }
    }

    // --pu list load multi pages
    function PulistLoadMgr(session) {
      //Current Middleware Pulist Info
      this._lastCPI = {
        bCanGet: false,
        iAlready: -1,
        iTotal: -1
      };
      this._session = session;
      this._bLoading = false;
      this._iAlreadLoadCount = 0;
      this.bMutilNotify = PulistLoadMgr.Config.bMutilNotifyDft;
    }

    PulistLoadMgr.Config = {
      bMutilNotifyDft: false,
      SetMultiNotifyDft: function (bNEGP) {
        this.bMutilNotifyDft = bNEGP ? true : false;
      }
    }

    PulistLoadMgr.prototype = {
      LOAD_PU_COUNT_PER_REQ: 100,
      onGetCPI: function (bCanGet, iTotal, iAlready) {
        this._lastCPI.bCanGet = bCanGet;
        this._lastCPI.iAlready = iAlready;
        this._lastCPI.iTotal = iTotal;
        if (bCanGet) {
          this._checkDispatch();
        }
      },
      _checkDispatch: function () {
        if (!this._bLoading) {
          if (this._iAlreadLoadCount < this._lastCPI.iAlready) {
            this._bLoading = true;
            this._GetPulist();
          }
        }
      },
      _GetPulist: function () {
        var loadIndex = this._iAlreadLoadCount;
        var loadCount = this._lastCPI.iAlready - this._iAlreadLoadCount;
        if (loadCount > this.LOAD_PU_COUNT_PER_REQ) {
          loadCount = this.LOAD_PU_COUNT_PER_REQ;
        }

        var tag = {
          reqParams: null,
          pLM: this
        };

        var reqParams = {
          sIndex: loadIndex,
          iCount: loadCount,
          callback: this._onGetHasResult,
          tag: tag
        }
        reqParams.tag.reqParams = reqParams;

        this._session._onShouldGetPulist(reqParams);
      },
      _onGetPulistHasResult: function (bResult, reqParam) {
        if (bResult) {
          this._iAlreadLoadCount = reqParam.sIndex + reqParam.iCount;
          if (this._bLoading) {
            this._bLoading = false;
            this._checkDispatch();
          }
        }
      },
      _onGetHasResult: function (options, response) {
        var pLM = options.tag.pLM;
        pLM._onGetPulistHasResult(response.emms.code == 0, options.tag.reqParams);
      },
      _checkBNotiCaller: function () {
        if (this.bMutilNotify || this._iAlreadLoadCount == this._lastCPI.iTotal) {
          return true;
        }
        return false;
      }
    };

    jSW.SWSession._SwPuModule = function (session) {
      this._session = session;
    }

    jSW.SWSession._SwPuModule.prototype = {
      _onNotifyImMsg: function (imInfo, response) {
        var cmd = jSWProtocol.RequestHeader.confnotify.notifyimmsg.cmd;
        var sender = { "szSourceId": imInfo.szSourceId, "iSourceId": imInfo.iSourceId };
        data = {
          sender: sender,
          szmsgs: imInfo.szmsg
        }
        this._notifytouser(response, cmd, data);
      },
      _notifytouser: function (response, cmd, data) {
        this._session._callbackManager.dispatchCallback("notify", {
          code: response.getCode(),
          response: response,
          msg: cmd,
          content: data
        });
      }
    };

    jSW.SWSession.prototype = {
      _getWsDesUrl: function (options) {
        var protocolWs = window.location.protocol == "https:" ? "wss" : "ws";
        var desurl = "";
        if (jSWOptions.CheckHttp()) {
          desurl = protocolWs + "://" + jSWOptions.ip + ":" + jSWOptions.port + "/jswapi";
        } else if (jSWOptions.CheckOcx()) {
          if (jSWOptions.ocxWebsocketPort <= 0) {
            // 尝试使用ocx获取websocket端口号(有可能注册的ocx事件未被调用)
            try {
              var jsw_ocx = document.getElementById('jsw_ocx');
              if (jsw_ocx != null) {
                jSWOptions.ocxWebsocketPort = jsw_ocx.oxGetWebSocketPort();
              } else {
                console.error('not found jsw_ocx');
              }
            } catch (e) {
              console.error('oxGetWebSocketPort fail ' + e);
            }
          }

          if (jSWOptions.ocxWebsocketPort <= 0) {
            this._onWsError(options, 'ocx not init or init fail');
            return;
          }

          desurl = 'ws://127.0.0.1:' + jSWOptions.ocxWebsocketPort;
          if (jSW._mMgr.bWsTest()) {
            desurl = 'ws://127.0.0.1:8888';
          }
        }

        console.log('ws url: ' + desurl);
        return desurl;
      },

      _checkWsCreateResult: function (options) {
        if (null == this._ws) {
          console.error('http websoket error null');
          this._onWsError(options, e);
          return;
        } else {
          this._onWsCreateOk(options);
          jSW._mMgr.oWsOpen(this._ws);
        }
      },

      _onWsCreateOk: function (options) {
        jSWOptions.session_list.push(this);
        var __session = this;
        var __options = options;
        console.log('websoket connect ...');
        this._ws.onopen = function () {
          console.log('http websoket connect success!');
          if (__options.onopen && (typeof __options.onopen) === 'function') {
            __options.onopen(__session);
          }
        };
        this._ws.onerror = function (e) {
          __session._ws = null;
          __session._onWsError(__options, e);
        };

        this._ws.onmessage = function (msg) {
          jSWProtocol.txOnResponse(-1, msg.data);
        };

        this._ws.onclose = function (e) {
          __session._ws = null;
          console.log("http websoket connect closed:" + e.code + ' reason: ' + e.reason);

          __session.swLogout();
          if (__options.onclose && (typeof __options.onclose) === 'function') {
            __options.onclose(__session, e);
          }
        };
      },

      _onWsError: function (options, e) {
        console.error('http websoket error' + e);
        if (options.onclose && (typeof options.onclose) === 'function') {
          options.onclose(this, e);
        }
      },

      swSetGlobalControlParam: function (options) {
        var rc = jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        if (jSWOptions.CheckOcx()) {
          if (typeof options["Idelayvssmooth"] == undefined) {
            return jSW.RcCode.RC_CODE_E_INVALIDARG;
          }
          var payload = new proto.WEBBVCU.ParamsDialogControl();
          payload.setIdelayvssmooth(options["Idelayvssmooth"]);

          var rc = jSWProtocol.SendRequest({
            session: this,
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_GLOBAL_DIALOG_PARAM,
            payload: payload,
            callback: options.callback,
            tag: options.tag
          });

          return rc;
        }
        return rc;
      },

      swImSend: function (options) {
        if (options.msgitems) {

        }
        else if (options.filepath) {
          if (!options.targetid || options.targetid.indexOf("PU") == -1) {
            console.log("target id invalidarg");
            return jSW.RcCode.RC_CODE_E_BVCU_INVALIDARG;
          }

          options.msgitems = [{
            nruid: "NRU_",
            iType: jSWProtocol.IMMSGTypes.FILE,
            data: options.filepath
          }];
        } else {
          return jSW.RcCode.RC_CODE_E_BVCU_INVALIDARG;
        }

        var rc = this._immodule._swIMSend(options);
        return rc;
      },

      swImRecv: function (options) {
        if (!options.targetid || options.targetid.indexOf("PU") == -1) {
          console.log("target id invalidarg");
          return jSW.RcCode.RC_CODE_E_BVCU_INVALIDARG;
        }
        options.msgitems = [{
          nruid: options.nruid,
          iType: jSWProtocol.IMMSGTypes.FILE,
          data: options.remotepath
        }];
        var rc = this._immodule._SwConfFileRecv(options);
        return rc;
      },

      /**
       * options: {
       *  szFilePath: 文件路径
       * }
       */
      swOpenFileInDir: function (options) {
        if (jSWOptions.calltype != jSW.CallProtoType.OCX) {
          return jSW.RcCode.RC_CODE_E_BVCU_UNSUPPORTED;
        }

        if (jSW.CallProtoType.OCX != jSWOptions.calltype) {
          return jSW.RcCode.RC_CODE_E_FAIL;
        }
        var payload = options.szFilePath;
        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_UTILS_OPEN_FILE_IN_DIR,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      _send: function (data) {
        var ws = this._ws;

        if (ws == null) {
          console.error('websocket is null, current calltype ' + ((jSWOptions.CheckOcx()) ? 'ocx' : 'http'));
          return jSW.RcCode.RC_CODE_E_DISCONNECTED;
        }

        if (!this._ws.OPEN) {
          this._ws.OPEN = 1;
        }
        if (ws.readyState != this._ws.OPEN) {
          console.warn('websocket not connection');
          return jSW.RcCode.RC_CODE_E_DISCONNECTED;
        }

        if (this._bLogout) {
          return jSW.RcCode.RC_CODE_E_BVCU_DISCONNECTED;
        }

        try {
          ws.send(data);
          return jSW.RcCode.RC_CODE_S_OK;
        } catch (e) {
          return jSW.RcCode.RC_CODE_E_DISCONNECTED;
        }
      },

      /** 注册回调
      swAddCallBack('login', function (sender, event, json) {
          json.code、 json.request、json.response、json.msg
      })*/
      swAddCallBack: function (event, callback) {
        this._callbackManager.addCallback(event, callback);

        return jSW.RcCode.RC_CODE_S_OK;
      },

      /*
      options = {
          callback: function(option, response, data){
          },
          tag: {
          }
      }
      */
      swGetVersion: function (options) {
        var request = new proto.WEBBVCU.Request();
        request.setMsgtype(proto.WEBBVCU.MSGType.WEB_GET_VERSION_INFO);
        request.setEmms(this._p_emms);

        var rc = jSWProtocol._internalSend({
          session: this,
          request: request,
          callback: options.callback,
          enforce: true
        });
        return rc;
      },

      /**登录*/
      /**options: {
          user: 'admin',
          password: '123456'
         } */
      swLogin: function (poptions) {
        var dft_poptions = {
          user: 'admin',
          password: '123456'
        };

        poptions = jSWUtils.extend({}, dft_poptions, poptions || {});
        this._user = poptions.user;

        var pubkeyCallback = function (options, response) {
          var tag = options.tag;
          var url = response.url;
          var request = options.request;
          {
            var session = options.session;
            session.p_options = options;
            session.p_response = response;
          }
          if (response.getCode() == jSW.RcCode.RC_CODE_S_OK) {
            var payload = response.getPayload();
            var pubkey = proto.WEBBVCU.PublicKey.deserializeBinary(payload);

            this.pubkey_d = pubkey.getD();
            this.pubkey_n = pubkey.getN();

            var session = options.session;

            // 登录
            var request = new proto.WEBBVCU.Request();
            request.setMsgtype(proto.WEBBVCU.MSGType.WEB_BVCU_LOGIN);
            request.setEmms(session._p_emms);

            var loginParam = new proto.WEBBVCU.BVCU_LOGIN();
            loginParam.setServer(session._server);
            loginParam.setPort(Number(session._port));
            loginParam.setUser(session._user);
            loginParam.setPassword(poptions.password);
            request.setPayload(loginParam.serializeBinary());

            jSWProtocol._internalSend({
              cmd: jSWProtocol.RequestHeader.login.cmd,
              session: session,
              request: request
            });

            console.log("login info:" + session._server + ":" + (session._port) + "user" + session._user);
          }
        };

        // 公钥

        var request = new proto.WEBBVCU.Request();
        request.setMsgtype(proto.WEBBVCU.MSGType.WEB_BVCU_GET_PUBKEY);
        request.setEmms(this._p_emms);

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.pubkey.cmd,
          session: this,
          request: request,
          callback: pubkeyCallback
        });

        return rc;
      },

      /**退出*/
      swLogout: function () {
        // 关闭已经打开的视频通道
        for (var i = 0; i < this._arr_dialog.length; i++) {
          this._arr_dialog[i].swClose();
        }
        // 关闭PU需要关闭的资源
        for (var i = 0; i < this._arr_pu.length; i++) {
          //this._arr_pu[i]._clear();
        }

        this._arr_pu_index = [];
        this._arr_pu.splice(0, this._arr_pu.length);
        this._arr_dialog.splice(0, this._arr_dialog.length);

        // 取消session、dialog保活
        if (this._timer_keeplive) {
          clearInterval(this._timer_keeplive);
          this._timer_keeplive = null;
        }

        var param = new jSWProtocol.JsonParamNoAttach(this._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_LOGOUT);


        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.logout.cmd,
          session: this,
          request: param
        });

        var sessionList = jSWOptions.session_list;
        var session = null;
        var i = 0;
        for (i = 0; i < sessionList.length; i++) {
          session = sessionList[i];
          if (session == this) {
            jSWOptions.session_list.splice(i, 1);
            this._bLogout = true;
            break;
          }
        }

        if (this._confManager != null) {
          this._confManager._clear();
        }
        clearInterval(this._timer_keeplive);

        return rc;
      },

      /**保活*/
      swKeepLive: function () {
        var keepliveCmd = jSWProtocol.RequestHeader.keeplive;

        var param = new jSWProtocol.JsonParamNoAttach(this._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_KEEPALIVE);

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.keeplive.cmd,
          session: this,
          request: param
        });

        console.log('keeplive session: ' + this._server + ' ' + this._port);
        return rc;
      },

      _SendRegDataWs: function () {
        if (jSWOptions.CheckNotOcx()) {
          var request = new jSWProtocol.JsonParamNoAttach(this._p_emms,
            proto.WEBBVCU.MSGType.WEB_REG_WEBSOCKET_DATA);
          var data = request.serializeBinary();
          var audio = jSW.DependencyMgr.GetModule("Audio");
          audio.SendRegDataWs(data.buffer);
        }
      },

      /**获取设备列表*/
      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'pulist',
                  request: param,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  pulist: BVCU_PUCFG_PUChannelInfo[]
              }
          },
          tag: userdata,
          status: 1, // 1: 在线; 2:离线; 3:全部
          pagesize: 0, //每页的数量(0表示全部)
          page: 0 //获取第几页, 从0开始
      };*/
      swGetPuList: function (options) {
        var dft_options = {
          status: 3,
          pagesize: 0,
          page: 0
        };

        var rc = this._AutoReqSendProxy(options, dft_options, function (opts) {
          var payload = jSWProtocol.ParamPuList(opts.status, opts.pagesize, opts.page);
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_PULIST,
            target: 'CMS_',
            payload: payload,
            cmd: jSWProtocol.RequestHeader.pulist.cmd
          };
        });
        return rc;
      },

      _onShouldGetPulist: function (options) {
        var dft_options = {
          status: 3,
          pagesize: 0,
          page: 0,
          sIndex: -1,
          iCount: -1
        };

        var rc = this._AutoReqSendProxy(options, dft_options, function (opts) {
          var payload = jSWProtocol.ParamPuList(opts.status, opts.pagesize, opts.page, options.sIndex, options.iCount);
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_PULIST,
            target: 'CMS_',
            payload: payload,
            cmd: jSWProtocol.RequestHeader.pulist.cmd
          };
        });
        return rc;
      },

      _innerNotifyIGotLoginInfo: function () {
        var rc = this._AutoReqSendProxy({}, {}, function (opts) {
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_SESSION_GETPULIST
          };
        });
        return rc;
      },

      _innerOnGetCPI: function (notifycpi, bFirstLogin) {
        var pulistStatus = {
          bCanGet: notifycpi.getBcanget(),
          iAlready: notifycpi.getIalreadycount(),
          iTotal: notifycpi.getItotalcount()
        };
        this._pulistLoadMgr.onGetCPI(pulistStatus.bCanGet, pulistStatus.iTotal, pulistStatus.iAlready);
        if (bFirstLogin) {
          this._innerNotifyIGotLoginInfo();
        }
      },

      /**
       * szpuid: String 设备ID
       */
      _swAsyncGetPu: function (options) {
        if (!options.szpuid || options.szpuid.length == 0) {
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }
        var rc = this._AutoReqSendProxy(options, dft_options, function (opts) {
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_PUINFO_BY_PUID,
            target: opts.szpuid
          };
        });
        console.log('async get pu list');
        return rc;
      },

      /**
       * pGA promise get args
       */
      _AutoReqSendProxy: function (options, dft_opts, pGA) {
        if (!dft_opts) { dft_opts = {}; }
        var rc = jSW.RcCode.RC_CODE_E_FAIL;
        options = jSWUtils.extend({}, dft_opts, options || {});
        var dft_args = {
          session: this,
          msgtype: -1,
          target: "",
          targetIndex: -1,
          payload: null,
          cmd: "",
          callback: options.callback ? options.callback : null,
          tag: options.tag ? options.tag : null
        };
        var des_args = pGA.bind(this)(options);
        des_args = jSWUtils.extend({}, dft_args, des_args || {});
        rc = jSWProtocol.SendRequest(des_args);
        return rc;
      },

      /**查询NRU上的文件*/
      swSearch: function (options) {
        return this._searchFile(options, "NRU_");
      },

      /*
       *   options = {
              szNRUID: NRUID,
              remoteFilePath: 远程文件路径,
              localFilePath: 本地路径,
              callback: function(options, response){
              },
              tag: Object
          }
       */
      swDownFileFromNru: function (options) {
        if (jSWOptions.calltype != jSW.CallProtoType.OCX) {
          alert('Just OCX support!!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var dft_options = {
          pcallback: null
        }

        options = jSWUtils.extend({}, dft_options, options || {});

        var rc = this._swDownFileSearch({
          szRFP: options.remoteFilePath,
          szLFD: options.localFileDir,
          szTargetId: options.szNRUID,
          msgType: proto.WEBBVCU.MSGType.WEB_BVCU_DOWN_FILE_ONNRU,
          callback: options.callback,
          callbackrelay: options.pcallback,
          tag: options.tag
        });
        return rc;
      },

      /**
      var options = {
          stSearchInfo: {
              iType: 1(BVCU_SEARCH_TYPE_FILE),
              iPostition: 0,
              iCount: 50
          },
          stFilter: {
              szPUID: 'PU_00002710',
              iChannelIndex: -1,
              iFileSizeMin: 0,
              iFileSizeMax: 0,
              iRecordType: 0,
              iFileType: 0,   BVCU_STORAGE_FILE_TYPE_ALL = 0(不限定文件类型),
                              BVCU_STORAGE_FILE_TYPE_RECORD = 1 << 0(录像文件)
                              BVCU_STORAGE_FILE_TYPE_CAPTURE = 1 << 1(图片文件)
                              BVCU_STORAGE_FILE_TYPE_GPS = 1 << 2(固件文件)
                              BVCU_STORAGE_FILE_TYPE_AUDIO = 1 << 3(音频文件)
                              BVCU_STORAGE_FILE_TYPE_FIRMWARE = 1 << 8(GPS文件, 暂时不支持)
              iTimeBegin: 0,
              iTimeEnd: 0
          },
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'login',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  pulist: BVCU_PUCFG_PUChannelInfo[]
              }
          },
          tag: userdata,
      };*/
      _searchFile: function (options, szTarget) {
        var dft_options = {
          stSearchInfo: {
            iType: 1,
            iPostition: 0,
            iCount: 50
          },
          stFilter: {
            szPUID: '',
            iChannelIndex: -1,
            iFileType: 0,
            iTimeCondition: 0,
            iTimeBegin: 0,
            iTimeEnd: 0,
            iFileSizeMin: 0,
            iFileSizeMax: 0,
            iRecordType: 0,
            szDesc1: "",
            szDesc2: ""
          },
          callback: null,
          tag: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});
        options.stSearchInfo = jSWUtils.extend({}, dft_options.stSearchInfo, options.stSearchInfo || {});
        options.stFilter = jSWUtils.extend({}, dft_options.stFilter, options.stFilter || {});

        var payload = jSWProtocol.ParamSearchList(options.stSearchInfo, options.stFilter);

        var rc = jSWProtocol.SendRequest({
          cmd: jSWProtocol.RequestHeader.searchlist.cmd,
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_SEARCH_LIST,
          target: szTarget,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },


      swDelRecordFileFilter: function (options) {
        var dft_options = {
          stFilter: {
            szPUID: '',
            iChannelIndex: -1,
            iFileType: 0,
            iTimeCondition: 0,
            iTimeBegin: 0,
            iTimeEnd: 0,
            iFileSizeMin: 0,
            iFileSizeMax: 0,
            iRecordType: 0,
            szDesc1: "",
            szDesc2: ""
          },
          callback: null,
          tag: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});
        options.stFilter = jSWUtils.extend({}, dft_options.stFilter, options.stFilter || {});

        var fun = function (pstFilter) {
          var search = new proto.BVCU.NRUConfig.DeleteFileReq();
          var filefilter = new proto.BVCU.Search.Search_FileFilter();

          filefilter.setSzpuid(pstFilter.szPUID);
          filefilter.setIchannelindex(pstFilter.iChannelindex);
          filefilter.setIfiletype(pstFilter.iFileType);
          filefilter.setItimebegin(pstFilter.iTimeBegin);
          filefilter.setItimeend(pstFilter.iTimeEnd);
          filefilter.setIfilesizemin(pstFilter.iFileSizeMin);
          filefilter.setIfilesizemax(pstFilter.iFileSizeMax);
          filefilter.setIrecordtype(pstFilter.iRecordType);
          filefilter.setSzdesc1(pstFilter.szDesc1);
          filefilter.setSzdesc2(pstFilter.szDesc2);
          filefilter.setItimecondition(pstFilter.iTimeCondition);

          search.setItype(1); /** 1: BVCU_NRU_DELFILE_TYPE_FILES 2: BVCU_NRU_DELFILE_TYPE_FILEIDS */
          search.setIcount(1)
          search.addStfilefilters(filefilter);
          return search;
        }

        var payload = fun(options.stFilter);

        var rc = jSWProtocol.SendRequest({
          cmd: jSWProtocol.RequestHeader.recordfile_del.cmd,
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_RECORDFILE_DELETE,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swDelRecordFileFilterId: function (options) {
        var dft_options = {
          stFileIds: [], /** [{'nruid': 'xxx', 'recordid': 123}, {'nruid': 'xxx', 'recordid': 124}] */
          callback: null,
          tag: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});
        if (!options.stFileIds) {
          options.stFileIds = [];
        }

        var fun = function (fileIds) {
          var search = new proto.BVCU.NRUConfig.DeleteFileReq();
          search.setItype(2); /** 1: BVCU_NRU_DELFILE_TYPE_FILES 2: BVCU_NRU_DELFILE_TYPE_FILEIDS */

          for (var i = 0; i < fileIds.length; i++) {
            var fileid = new proto.BVCU.NRUConfig.FileID();
            fileid.setSzsourceid(fileIds[i].nruid)
            fileid.addIrecordid(fileIds[i].recordid);

            search.addStfileidfilters(fileid);
          }

          return search;
        };

        var payload = fun(options.stFileIds);

        var rc = jSWProtocol.SendRequest({
          cmd: jSWProtocol.RequestHeader.recordfile_del.cmd,
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_RECORDFILE_DELETE,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },


      /** 检索设备上的文件*/
      swSearchFileOnPu: function (options) {
        if (options == null || options.stFilter == null || options.stFilter.szPUID == null || options.stFilter.szPUID.length == 0) {
          console.warn('bad args, please check!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }
        var rc = this._searchFile(options, options.stFilter.szPUID);
        return rc;
      },

      /** 从设备上下载文件
          options = {
              szPUID: 设备ID,
              remoteFilePath: 远程文件路径,
              localFilePath: 本地路径,
              callback: function(){},
              pcallback: function(){}
              tag: Object
          }
      */
      swDownFileFromPu: function (options) {
        if (jSWOptions.calltype != jSW.CallProtoType.OCX) {
          alert('Just OCX support!!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var dft_options = {
          pcallback: null
        }

        options = jSWUtils.extend({}, dft_options, options || {});

        var rc = this._swDownFileSearch({
          szRFP: options.remoteFilePath,
          szLFD: options.localFileDir,
          szTargetId: options.szPUID,
          msgType: proto.WEBBVCU.MSGType.WEB_BVCU_DOWN_FILE_ONPU,
          callback: options.callback,
          callbackrelay: options.pcallback,
          tag: options.tag
        });
        return rc;
      },

      /**
       * ocx下载文件 
       * options: {
       *      szRFP, 
       *      szLFD, 
       *      szTargetId, 
       *      callback,
       *      msgType, 
       *      tag
       * }
       */
      _swDownFileSearch: function (options) {
        if (jSWOptions.calltype != jSW.CallProtoType.OCX) {
          alert('Just OCX support!!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        if (options == null || options.szTargetId == null || options.szTargetId.length == 0
          || options.szRFP == null || options.szRFP.length == 0 || options.szLFD == null || options.szLFD.length == 0) {
          console.warn('bad args, please check!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var payload = new proto.WEBBVCU.DownFileFromPu();

        var rfp = options.szRFP;
        if (options.szTargetId.indexOf("NRU") == 0) {
          rfp = options.szRFP.replace(/\//g, "\\");
        }
        payload.setSzremotefilepathname(rfp);
        payload.setSzlocalfilepathname(options.szLFD);
        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: options.msgType,
          target: options.szTargetId,
          payload: payload,
          callback: options.callback,
          callbackrelay: options.callbackrelay,
          tag: options.tag
        });
        return rc;
      },


      /**
       * options: {
       *  stSearchInfo: BVCU_SearchInfo,
       *  iTimeBegin: 录像文件开始时刻，从1970-01-01 00:00:00 +0000 (UTC)开始的秒数,
       *  iTimeEnd:   录像文件结束时刻，从1970-01-01 00:00:00 +0000 (utc)开始的秒数,
       *  szPuid: 设备名称,
       *  callback: functions(options, response, data){
       *      data: OptionsSearchResult
       *  }
       *  tag: Object
       * }
       */
      swSearchGpsV2: function (options) {
        var stFilter = new jSWProtocol.BVCU_Search_FileFilter(options.szPuid, -1, options.iTimeBegin, options.iTimeEnd, 4, 0, 0, 0);
        var rc = this.swSearch({
          stSearchInfo: options.stSearchInfo,
          stFilter: stFilter,
          callback: options.callback,
          tag: options.tag
        });
        return rc;
      },

      /*
          options=
          {
              szNruId: nruid,
              szFilePath: swSearchGps2获取的Gps文件路径,
              callback: function(options, response, data){
                  data:{
                      fileinfo:{
                          szFilePath: String,
                          szFileName: String,
                          iTime: Number,
                          iFileSize: Number 
                      },
                      data: String GPS文件
                  }
              },
              tag: Object
          }
      */
      swGetGpsRecordDataV2: function (options) {
        var rc = this._swGetGpsRecordData(options, proto.WEBBVCU.MSGType.WEB_BVCU_DOWNLOAD_GPS_RECORD_SERVERC);
        return rc;
      },

      /*
          options=
          {
              szNruId: nruid,
              iTimeBegin: 录像文件开始时刻，从1970-01-01 00:00:00 +0000 (UTC)开始的微秒数,
              iTimeEnd:   录像文件结束时刻，从1970-01-01 00:00:00 +0000 (utc)开始的微秒数
              szPuid: 设备名称,
              callback: function(options, response, data)
              {
                  data:[
                      {
                          szFilePath: String,
                          szFileName: String,
                          iTime: Number,
                          iFileSize: Number 
                      },.....
                  ]
              },
              tag: Object
          }
      */
      swSearchGps: function (options) {

        if (jSWOptions.calltype != jSW.CallProtoType.OCX) {
          alert('Just OCX support!!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        if (options.szNruId == null || options.szNruId.length == 0) {
          console.warn('nruid should be invalid!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        if (options.iTimeBegin == null || options.iTimeEnd == null) {
          console.warn('time slice should be invalid!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var _pu = this._swGetPu(options.szPuid);
        if (_pu == null || options.szPuid == null || options.szPuid.length == 0) {
          console.warn('puid should be invalid!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        options.iTimeBegin = (Number)(options.iTimeBegin);
        options.iTimeEnd = (Number)(options.iTimeEnd);

        if (options.iTimeBegin >= options.iTimeEnd) {
          console.warn('time slice should be invalid!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var payload = new proto.WEBBVCU.RecordFileFilter();
        payload.setSzpuid(options.szPuid);
        payload.setItimebegin(options.iTimeBegin);
        payload.setItimeend(options.iTimeEnd);

        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_GPS_RECORD,
          target: options.szNruId,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      /*
          options=
          {
              szNruId: nruid,
              szFilePath: swSearchGps获取的Gps文件路径,
              callback: function(options, response, data){
                  data:{
                      fileinfo:{
                          szFilePath: String,
                          szFileName: String,
                          iTime: Number,
                          iFileSize: Number 
                      },
                      data: String GPS文件
                  }
              },
              tag: Object
          }
      */
      swGetGpsRecordData: function (options) {
        var rc = this._swGetGpsRecordData(options, proto.WEBBVCU.MSGType.WEB_BVCU_DOWNLOAD_GPS_RECORD);
        return rc;
      },

      _swGetGpsRecordData: function (options, iMsgType) {
        if (jSWOptions.CheckNotOcx()) {
          alert('Just OCX support!!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }


        if (options.szNruId == null || options.szNruId.length == 0) {
          console.warn('nruid should be invalid!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        if (options.szFilePath == null || options.szFilePath.length == 0) {
          console.warn('file path should be invalid!');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var payload = new proto.WEBBVCU.FTPFileInfo();
        var rgpsPath = options.szFilePath.replace(/\//g, "\\");
        payload.setSzfilepath(jSWUtils.string2Uint8Array(rgpsPath));

        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: iMsgType,
          target: options.szNruId,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      /*
          options = {
              callback: function(sender, response, data){
                  data:{
                      szid: nString,
                      szname: String,
                      istoragemedia: Number,
                      ionlinestatus: Number
                  }
              },
              tag: Object
          }
      */
      swGetNruList: function (options) {
        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_NRU_LIST,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      /** 查询录像回放 */
      swGetRecordPlayer: function (dialogId) {

        for (var i = 0; i < this._arr_record_play.length; i++) {
          player = this._arr_record_play[i];
          if (player && player._dialog_id == dialogId) {
            return player;
          }
        }

        console.log('swGetRecordPlayer not found, dialogId: ' + dialogId)
        return null;
      },

      /** 查询录像回放 */
      _swGetRecordPlayer: function (playerId) {

        for (var i = 0; i < this._arr_record_play.length; i++) {
          player = this._arr_record_play[i];
          if (player && player._player_id == playerId) {
            return player;
          }
        }

        console.log('_swGetRecordPlayer not found, playerId: ' + playerId)
        return null;
      },

      /** 删除 */
      _swDelRecordPlayer: function (dialogId) {
        for (var i = 0; i < this._arr_record_play.length; i++) {
          player = this._arr_record_play[i];
          if (player && player._dialog_id == dialogId) {
            this._arr_record_play[i] = null;
            return true;
          }
        }

        return false;
      },

      /**
       * 录像回放控制*/
      swRecordPlayCtrl: function (options) {
        var dft_options = {
          cmdtype: 'PLAY', // "PLAY"、"PAUSE"、"TEARDOWN"、"STEP"
          dialogId: 0,
          ntp_begin: -1,
          ntp_end: -1,
          scale: -1,
          callback: null,
          tag: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var payload = new proto.WEBBVCU.MSG_WEB_BVCU_RECORD_PLAY_CRTL();
        {
          payload.setCmdtype(options.cmdtype);
          payload.setDialogid(options.dialogId);
          payload.setNtpBegin(options.ntp_begin);
          payload.setNtpEnd(options.ntp_end);
          payload.setScale(options.scale);
        }


        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_RECORD_PLAY_CRTL,
          cmd: jSWProtocol.RequestHeader.recordplay.play.cmd,
          target: options.dialogId,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;

      },

      /* 录像回放
          options = {
              url: null,
              nru: null,
              video: true, // 是否播放video
              audio: true, // 是否播放audio
              callback: null,
              tag: null,
          };
      */
      swRecordPlay: function (options) {
        var dft_options = {
          url: null,
          nru: null,
          video: true,
          audio: true,
          callback: null,
          div: null,
          time_begin: -1,
          time_end: -1,
          bWindowless: false
        };

        if (jSWOptions.calltype != jSW.CallProtoType.OCX) {
          alert('Just support ocx Video!!');
          return jSW.RcCode.RC_CODE_E_BVCU_BADSTATE;
        }

        options = jSWUtils.extend({}, dft_options, options || {});
        if (options.url == null || options.url.length == 0) {
          console.error('url error: ' + options.url);
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var player_bar = null;
        if (typeof options.div === "string") {
          options.div = document.getElementById(options.div);
        }
        var div = options.div;
        if (null == div) {
          console.error('no have div');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        if (typeof (div.bv_uuid) == "undefined") {
          div.bv_uuid = jSWUtils.generateUUID();
        }

        // 创建 ocx播放 实例
        var playObject = null;
        {
          var playObjectId = div.bv_uuid + '_0077554';
          /**ID附属*/
          var myTempDivId = playObjectId + "tempdiv";
          playObject = document.getElementById(playObjectId);
          if (playObject == null) {
            var mydiv = document.getElementById(myTempDivId);
            var bardiv = null;
            if (mydiv == null) {
              mydiv = document.createElement("div");
              mydiv.id = playObjectId + "tempdiv";
              mydiv.style.width = '100%';
              mydiv.style.height = 'calc(100% - 20px)';

              bardiv = document.createElement('div');
              bardiv.id = playObjectId + "tempdiv_playbar";
              bardiv.style.width = '100%';
              bardiv.style.height = '20px'
              bardiv.style.backgroundColor = '#555';
              mydiv.databardiv = bardiv;
            }
            mydiv.style.display = 'block';
            bardiv = mydiv.databardiv;
            div.appendChild(mydiv);
            div.appendChild(bardiv);
            {
              player_bar = new jQuery.TigerPlayer();
              player_bar.addBar($('#' + bardiv.id), 1000 * 60, function (player) {
                player.swPlay();
              }, function (player) {
                player.swPause();
              }, function (player) {
                player.swClose();
              }, function (player, offset_ms) {
                player.swJump({
                  ntp_begin: offset_ms
                });
              });
            }

            playObject = document.createElement('object');
            playObject.id = playObjectId;
            //playObject.classid = "clsid:51DF1D91-DA4E-47DA-A5BE-84A96ADD2425";
            if (options.bWindowless) {
              playObject.classid = 'clsid:0c85b239-904a-4adf-8424-f1928b38f12f';
            } else {
              playObject.classid = "clsid:CDE6C639-4BA8-4A09-81EB-DCE76A61FE98";
            }
            playObject.style.width = '100%';
            playObject.style.height = '100%';
            playObject.style.display = 'block';
            playObject.tag = this;
            mydiv.appendChild(playObject);
            isNeedDelay = true;

            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.setAttribute('for', playObjectId);
            oScript.setAttribute('event', 'OnHwndEvent(hwnd, ieventtype, pParam)');
            oScript.text = 'jSW._swOcxPlayerOnEvent(ieventtype, this.tag);';
            document.body.appendChild(oScript);
            playObject.data_player_bar = player_bar;
          } else {
            player_bar = playObject.data_player_bar;
            console.warn('have element : ' + playObjectId)
          }
        }

        function sendCmd(p_session, p_options, p_playObject, parentDiv, p_player_bar) {
          var player_id = jSWUtils.generateUUID();

          var payload = new proto.WEBBVCU.MSG_WEB_BVCU_RECORD_PLAY();
          payload.setFilepath(p_options.url);
          payload.setNruid(p_options.nru);
          payload.setVideo(p_options.video ? 1 : 0);
          payload.setAudio(p_options.audio ? 1 : 0);
          payload.setBwindowless(p_options.bWindowless);
          payload.setStarttime(0);
          payload.setEndtime(-1);
          payload.setHwnd(0);
          payload.setAutoplay(0);
          payload.setPlayerId(player_id);

          if (p_playObject != null) {
            payload.setHwnd(p_playObject.GetWMHwnd());
            p_playObject.style.display = 'block';
          } else {
            console.error('p_playObject is null')
          }

          var rc = jSWProtocol.SendRequest({
            session: p_session,
            payload: payload,
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_RECORD_PLAY,
            callback: p_options.callback,
            tag: p_options.tag
          });

          if (rc == jSW.RcCode.RC_CODE_S_OK) {
            var player = new jSW.SWPlayer(p_session, {
              playerId: player_id,
              nruId: p_options.nru,
              file: p_options.url,
              dialogId: -1,
              parentDiv: parentDiv,
              time_begin: p_options.time_begin,
              time_end: p_options.time_end,
              bar: p_player_bar,
              callback: p_options.closecallback,
              tag: p_options.closetag
            });

            p_session._arr_record_play.push(player)
          }
        }

        var session = this;
        // ocx创建实例后，要稍等，不然没有句柄
        setTimeout(function () { sendCmd(session, options, playObject, div, player_bar); }, 500);

        return jSW.RcCode.RC_CODE_S_OK;
      },

      /**点播视频*/
      /**
      var options = {
          url: 'video url',
          tag: userdata,
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'login',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  pulist: BVCU_PUCFG_PUChannelInfo[]
              }
          },
      };*/
      swVodVideo: function (options) {
        var dft_options = {
          url: null,
          callback: null,
          tag: null,
        };

        if (jSWOptions.calltype == jSW.CallProtoType.OCX) {
          alert('Just Http support Vod Video!!');
          return jSW.RcCode.RC_CODE_E_BVCU_BADSTATE;
        }

        options = jSWUtils.extend({}, dft_options, options || {});
        if (options.url == null || options.url.length == 0) {
          console.error('url error: ' + options.url);
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var div = options.tag;
        if (null == div) {
          console.error('no have div');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        if (typeof (div.bv_uuid) == "undefined") { div.bv_uuid = jSWUtils.generateUUID(); }

        var playObjectId = div.bv_uuid + '_0077553'; /**ID附属*/
        playObject = document.getElementById(playObjectId);
        if (playObject == null) {
          playObject = document.createElement('VIDEO');
          playObject.setAttribute('id', playObjectId);
          playObject.setAttribute('class', 'video-js vjs-default-skin vjs-big-play-centered');
          // playObject.setAttribute('poster', '/js/my_video_poster.png');
          playObject.style.width = '100%';
          playObject.style.height = '100%';
          playObject.style.display = 'block';

          div.appendChild(playObject);
        }

        var index = options.url.indexOf(jSWOptions.http);
        if (-1 != index) {
          options.url = options.url.substr(jSWOptions.http.length + 1); /** +1 是去除'/' */
        }

        var vodCmd = jSWProtocol.RequestHeader.vod;

        var param = new jSWProtocol.JsonParamCommand(this._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_SET_VOD,
          new jSWProtocol.BVCU_Command('', -1, null));

        param.setPayload(jSWUtils.string2Uint8Array(options.url));

        var rc = jSWProtocol._internalSend({
          session: this,
          cmd: vodCmd.cmd,
          request: param,
          callback: options.callback,
          opt: options,
          tag: options.tag
        });

        return rc;
      },

      /**var options = {
          div: 'div_id', // div or div id
          url: 'video url',
          callback: function(options, response) {
              options = options;
              response = {
                  emms: emms,
                  request: request
              }
          }
      };*/
      swVodVideoEx: function (options) {

        var dft_options = {
          callback: null,
          div: '',
          url: null
        };

        var uoptions = jSWUtils.extend({}, dft_options, options || {});

        if (uoptions.url == null || uoptions.url.length == 0) {
          console.error('url error: ' + uoptions.url);
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        if (typeof uoptions.div === "string") {
          uoptions.div = document.getElementById(uoptions.div);
          if (uoptions.div == null) {
            console.error('no have div');
            return jSW.RcCode.RC_CODE_E_INVALIDARG;
          }
        }

        var rc = this.swVodVideo({
          url: uoptions.url,
          tag: uoptions.div,
          useoptions: uoptions,
          callback: function (options, response) {
            var tag = options.tag;
            var url = response.url;
            var request = options.request;

            if (jSW.RcCode.RC_CODE_S_OK == response.getCode()) {

              var div = tag;
              var playObjectId = div.bv_uuid + '_0077553'; /**ID附属*/
              if (document.getElementById(playObjectId) == null) {
                console.error('not have player');
                return;
              }

              var player = videojs(playObjectId, { controlBar: true, controls: true }, function () {
                strArr = url.split('.')
                if (strArr.length == 2) {
                  strUrlFileType = strArr[1];
                  if (strUrlFileType == 'mp4') {
                    this.src({ type: 'video/mp4', src: jSWOptions.http + "/" + url });
                  } else if (strUrlFileType == 'm3u8') {
                    this.src({ type: 'application/vnd.apple.mpegurl', src: jSWOptions.http + "/" + url });
                  }
                }

                this.play();
              });
            }

            var orgopt = options.opt;
            if (orgopt && orgopt.useoptions) {
              if (typeof orgopt.useoptions.callback === 'function') {
                orgopt.useoptions.callback(orgopt.useoptions, response);
              }
            }
          }
        });

        return rc;
      },

      swGetConfManager: function () {
        return this._confManager;
      },

      swGetUserManager: function () {
        return this._userManager;
      },

      /**查询PU*/
      swGetPu: function (puid) {
        var despu = this._swGetPu(puid);
        if (!despu) {
          this._swAsyncGetPu({ szpuid: puid });
        }
        return despu;
      },

      _swGetPu: function (puid) {
        var index = this._swGetPuFromArr(puid, this._arr_pu);
        if (index == -1) {
          return null;
        }
        return this._arr_pu[index];
      },

      _swGetPuFromArr: function (puid, arr) {
        var i = 0;
        for (; i < arr.length; i++) {
          if (arr[i]._id_pu == puid) {
            return i;
          }
        }
        return -1;
      },
      _swCheckPuArr: function (pu) {
        var ioffline = this._swGetPuFromArr(pu._info_pu.id, this._arr_pu_offline);
        var ionline = this._swGetPuFromArr(pu._info_pu.id, this._arr_pu_online);
        if (0 == pu._info_pu.onlinestatus) {
          if (-1 == ioffline && -1 != ionline) {
            this._arr_pu_online.splice(ionline, 1);
            this._arr_pu_offline.push(pu);
          }
        } else if (1 == pu._info_pu.onlinestatus) {
          if (-1 != ioffline && -1 == ionline) {
            this._arr_pu_offline.splice(ionline, 1);
            this._arr_pu_online.push(pu);
          }
        }
      },

      /**查询通道*/
      swGetPuChanel: function (puid, chanelid) {
        var pu = this._swGetPu(puid);
        if (pu) {
          return pu.swGetChanel(chanelid);
        }

        return null;
      },

      /*
          options = {
              puid: puid,
              callback: function(sender, response, data){
                  data = {
                      szID: 设备ID,
                      szManufacturer: 制造商名字,
                      szProductName: 产品名,
                      szSoftwareVersion: 软件版本,
                      szHardwareVersion: 硬件版本,
                      iPUType: BVCU_PUTYPE_*,
                      languages: 支持的语言列表,
                      languageSelected: 当前使用的语言索引,
                      Ilanguageindex: deviceinfo.getIlanguageindex(),
                      szName: 名字。可写,
                      iWIFICount: WIFI数目,
                      iRadioCount: 无线模块数目,
                      iChannelCount: 音视频通道数,
                      iVideoInCount: 视频输入数,
                      iAudioInCount: 音频输入数,
                      iAudioOutCount: 音频输出数,
                      iPTZCount: PTZ数,
                      iSerialPortCount: 串口数,
                      iAlertInCount:   报警输入数,
                      iAlertOutCount:  报警输出数,
                      iStorageCount:   存储设备数,
                      iGPSCount:       GPS设备数,
                      bSupportSMS:     是否支持手机短信功能。0-不支持，1-支持,
                      iPresetCount: 支持的PTZ预置点数目,
                      iCruiseCount: 支持的PTZ巡航点数目,
                      iAlarmLinkActionCount: 支持的报警联动数目,
                      iLongitude: 经度,东经是正值，西经负值，单位1/10000000度。大于180度或小于-180度表示无效值
                      iLatitude: 纬度,纬度，北纬是正值，南纬是负值，单位1/10000000度。大于180度或小于-180度表示无效值
                      szBluetoothAddr: 设备蓝牙地址，空字符表示设备没有蓝牙模块（不支持蓝牙），格式：ff:ff:ff:ff:ff:ff
                  };
              },
              tag: Object
          }
      */
      swGetPuDeviceInfo: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_DEVICEINFO,
          jSWProtocol.RequestHeader.pucfg.getpudeviceinfo.cmd, this, null);
      },

      /*
          options = {
              puid: puid,
              ilanguage: language index,
              name: pu name,
              callback: function(sender, response, data){
              },
              tag: Object
          }
      */
      swSetPuDeviceInfo: function (option) {

        dft_poptions = {
          ilanguage: 1,
          name: "default name"
        };

        option = jSWUtils.extend({}, dft_poptions, option || {});

        var payload = new proto.BVCU.PUConfig.DeviceInfo();

        payload.setSzid(option.puid);
        payload.setIlanguageindex(option.ilanguage);
        payload.setSzname(option.name);
        payload.setIputype(0);

        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_DEVICEINFO,
          cmd: jSWProtocol.RequestHeader.pucfg.getpudeviceinfo.cmd,
          target: option.puid,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      swGetPuDeviceTime: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_DEVICETIME,
          jSWProtocol.RequestHeader.pucfg.getpudevicetime.cmd, this, null);
      },

      swGetPuEthernet: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_ETHERNET,
          jSWProtocol.RequestHeader.pucfg.getpuethernet.cmd, this, null);
      },

      swGetPuRadioNetwork: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_RADIONETWORK,
          jSWProtocol.RequestHeader.pucfg.getpuradionetwork.cmd, this, null);
      },

      swGetPuWifi: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_WIFI,
          jSWProtocol.RequestHeader.pucfg.getpuwifi.cmd, this, null);
      },

      swGetPuPower: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_POWER,
          jSWProtocol.RequestHeader.pucfg.getPuPower.cmd, this, null);
      },

      swGetPuOnlineControl: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_ONLINECONTROL,
          jSWProtocol.RequestHeader.pucfg.getPuOnlineControl.cmd, this, null);
      },

      swGetPuUpdateStatus: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_UPDATESTATUS,
          jSWProtocol.RequestHeader.pucfg.getPuUpdateStatus.cmd, this, null);
      },

      swGetPuLinkactionList: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_LINKACTION_LIST,
          jSWProtocol.RequestHeader.pucfg.getPuLinkactionList.cmd, this, null);
      },

      swGetLinkActionInfo: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_LINKACTION_LIST,
          jSWProtocol.RequestHeader.pucfg.getPuLinkactionList.cmd, this, options.linkactionbaseinfo);
      },

      swGetPuCarInfo: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_CARINFO,
          jSWProtocol.RequestHeader.pucfg.getPuCarInfo.cmd, this, null);
      },

      /*
          options = {
              puid: pu.puid,
              callback: function(sender, response, data){
                  data = {
                      szDevModel: 设备型号.  只读,
                      szIMEI_MEID: 设备IMEI/MEID号.  只读,
                      szSerial: 产品序号，不可为空. 可写,
                      szUserNo: 使用者警号，不可为空。可写,
                      szUserName: 使用者姓名。可写,
                      szUserDescribe: 使用者描述（可用于备注职位）。 可写,
                      szUnitNo: 使用者单位编号。 可写,
                      szUnitName: 使用者单位名称。 可写,
                      szDefaultConference: 默认发言会议ID。注意可以通过会议管理对象命令获取会议名称，并显示选择会议列表。 可写,
                      szCurrentConference: 当前发言会议ID。 只读
                  };
              },
              tag: Object
          }
      */
      swGetPuZfyInfo: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_ZFYINFO,
          jSWProtocol.RequestHeader.pucfg.getPuZfyInfo.cmd, this, null);
      },

      /*
          options = {
              puid:                 pu.puid,
              serial:              "default",
              userno:             "default",
              userame:             "default",
              description:           "default",
              unitno:             "default",
              unitname:            "default",
              defaultconference: "",
              callback: function(sender, response, data){
                  response.emms.code == jSW.Rc
              },
              tag: Object
          }
      */
      swSetPuZfyInfo: function (options) {

        dft_poptions = {
          serial: "default",
          userno: "default",
          userame: "default",
          description: "default",
          unitno: "default",
          unitname: "default",
          defaultconference: ""
        };

        options = jSWUtils.extend({}, dft_poptions, options || {});

        var payload = new proto.BVCU.PUConfig.ZFYInfo();

        payload.setSzserial(options.serial);
        payload.setSzuserno(options.userno);
        payload.setSzusername(options.userame);
        payload.setSzuserdescribe(options.description);
        payload.setSzunitno(options.unitno);
        payload.setSzunitname(options.unitname);
        payload.setSzdefaultconference(options.defaultconference);

        var rc = jSWProtocol.SendRequest({
          session: this,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_ZFYINFO,
          cmd: jSWProtocol.RequestHeader.pucfg.setPuZfyInfo.cmd,
          target: options.puid,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swGetPuServers: function (options) {
        return this._swGetPuOperation(options, proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_SERVERS,
          jSWProtocol.RequestHeader.pucfg.getPuServers.cmd, this, null);
      },

      _swGetPuOperation: function (options, msgType, cmd, session, data) {
        var param = jSWProtocol.JsonParamCommand(this._p_emms,
          msgType,
          jSWProtocol.BVCU_Command(options.puid, -1, data));

        var rc = jSWProtocol._internalSend({
          cmd: cmd,
          session: session,
          request: param,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swLogQuery: function (options) {
        var rc = jSW.DependencyMgr.cmdParseInJect(function () {
          this._swLogQuery(options);
        }, this);
        return rc;
      },
      /*
          options={
              ipostition: Number,
              icount: Number,
              itimebegin: Number(UTC秒数),
              itimeend: Number(UTC秒数),
              username: String,
              targetid: String,
              itargetindex: Number,
              callback: function(sender, response, data){
                  
              },
              tag: tag
          }
      */
      _swLogQuery: function (options) {
        var dft_poptions = {
          ipostition: 0,
          icount: 120,
          itimebegin: 0,
          itimeend: 0,
          username: '',
          targetid: '',
          itargetindex: -1,
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_poptions, options || {});

        var payload = new proto.BVCU.Search.Search_Request();
        var searchinfo = new proto.BVCU.Search.SearchInfo();
        payload.setStsearchinfo(searchinfo);
        searchinfo.setItype(jSWProtocol.SearchType.OPERATE);
        searchinfo.setIcount(Number(options.icount));
        searchinfo.setIpostition(Number(options.ipostition));

        var operatelog = new proto.BVCU.Search.Search_OperateLog();
        payload.setStoperatefilter(operatelog);
        operatelog.setSzusername(options.username);
        operatelog.setSztargetid(options.targetid);

        if (options.itimebegin != 0 && options.itimeend != 0 && options.itimeend < options.itimebegin) {
          console.error("get operate log utc time error please check!");
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        operatelog.setIoperatetime(options.itimebegin);
        operatelog.setItimeend(options.itimeend);

        var targetindex = Number(options.itargetindex);
        if (targetindex != null && targetindex >= 0) {
          operatelog.setItargetindex(targetindex);
        }
        operatelog.serializeBinary();

        var rc = jSWProtocol.SendRequest({
          session: this,
          targetIndex: targetindex,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_SEARCH_OPERATE,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swDispose: function () {
        if (this._arr_pu_online.length > 0) {
          this._arr_pu_online.every(function (puitem, index, array) {
            puitem._clear();
          });
          this._arr_pu_online = [];
        }
        if (this._timer_keeplive) {
          clearInterval(this._timer_keeplive);
        }
        if (this._ws) {
          this._ws.onclose = null;
          this._ws.close();
          console.log("close ws");
        }
      },

      compare: function (objSession) {
        return (this._server == objSession._server &&
          this._port == objSession._port &&
          this._user == objSession._user);
      },

      /**内部函数， OnResponse Fail*/
      _internalOnResponseFail: function (options, responseText, errMsg) {
        var cmd = options.cmd;
        var param = options.param;

        console.error('internal error: ' + cmd + (errMsg));
        if (cmd == jSWProtocol.RequestHeader.pubkey.cmd) {
          cmd = jSWProtocol.RequestHeader.login.cmd;
        }

        /**调用命令的回调函数
        if (options && ((typeof options.callback) == 'function')) {
            options.callback(options, response);
        }*/

        /**通知调用者*/
        //this._callbackManager.dispatchCallback(cmd, {
        //    code: jSW.RcCode.RC_CODE_E_FAIL,
        //    request: param,
        //    response: responseText,
        //    msg: errMsg
        //});
      },

      /**内部函数， OnResponse Success*/
      _internalOnResponseSuccess: function (options, response, status) {
        jSW.DependencyMgr.HandleResponseInJect(function (handleResponse) {
          handleResponse.internalOnResponseSuccess(this, options, response, status);
        }, this);
      },

      _internalNotify: function (options, response) {
        jSW.DependencyMgr.HandleResponseInJect(function (handleResponse) {
          handleResponse.handleNotify(this, options, response);
        }, this);
      },

      /**OnResponse 设备列表*/
      _internalOnResponsePulist: function (response) {
        var payload = response.getPayload();
        var getPulistResponse = proto.WEBBVCU.BVCU_GetPulist_Response.deserializeBinary(payload);
        var pulist = getPulistResponse.getPulistList();
        var pulistNotify = [];
        var i = 0;
        for (; i < pulist.length; i++) {

          var puid = pulist[i].getPubaseinfo().getSzid();
          var pu = this._arr_pu_index[puid];

          //console.log(puid + ' ' + pulist[i].getPubaseinfo().getIonlinestatus());
          if (null == pu) {
            // 添加
            pu = new jSW.SWPu(this, pulist[i])
            if (pu._info_pu.onlinestatus == 1) {
              this._arr_pu_online.push(pu);
            } else if (0 == pu._info_pu.onlinestatus) {
              this._arr_pu_offline.push(pu);
            }
            this._arr_pu.push(pu);
            this._arr_pu_index[puid] = pu;
          }
          else {
            // 更新
            pu._internalUpdate(pulist[i]);
            this._swCheckPuArr(pu);
          }

          pulistNotify.push(pu);
        }
        return pulistNotify;
      },

      _internalOnResponseConfList: function (conflist) {
        if (this._confManager != null && this._confManager._swFreshConflist) {
          this._confManager._swFreshConflist(conflist);
        }
      },

      _internalOnConfResponse: function (msgType, data) {
        //console.log(jSWUtils.getJsonString(data));
        switch (msgType) {
          case proto.WEBBVCU.MSGType.WEB_BVCU_GET_CONF_LIST:
            if (this._confManager != null && this._confManager._swFreshConflist) {
              this._confManager._swFreshConflist(data);
            }
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_GET_CONF_INFO:
            return this._confManager._swFreshConfInfo(data);
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_SET_CONF_CREATE:
            var desconf = this._confManager._swFreshConfInfo(data);
            this._confManager._dispatchCallback(desconf, jSWProtocol.RequestHeader.confnotify.notifyconfcreate.cmd, desconf.swGetConfInfo().id);
            return desconf;
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_ONLINE:
            this._confManager._swFreshUserOnlielist(data);
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_SET_CONF_DELETE:
            this._confManager._onConfDeletedOk(data);
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_PARTICIPATOR_ADD:
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_PARTICIPATOR_REMOVE:
            this._confManager._onParticularAddResult(data);
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_START:
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_STOP:
            this._confManager._onConfOpertaion(data);
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_PARTICIPATOR_APPLYFOR_STARTSPEAK:
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_PARTICIPATOR_APPLYFOR_ENDSPEAK:
            this._confManager._onApplyForSpeak(data);
            break;
        }
      }
    };

    jSW.SwUserManager = function (session) {
      this._session = session;
    }

    jSW.SwUserManager.SYSADMIN = {
      NONE: 0,  // 没有系统管理权
      GROUP: 1, // 对用户组拥有管理权
      USER: 4, // 对用户拥有管理权
      DEV: 16, // 对设备拥有管理权
      DEVASS: 64, // 对设备拥有分配权
      ALL: 85
    };

    jSW.SwUserManager.PERMISSIONS = {
      OFF: 0,
      ON: 1
    }

    jSW.SwUserManager.DEFAULT = {
      GROUP_GOD: "Admin",
      USER: "admin"
    }

    jSW.SwUserManager.Buffer = function () {
      this._Buffer_Strack = [];
    };
    jSW.SwUserManager.Buffer.prototype = {
      _Buffer_Size: 1024,
      _push: function (item) {
        var isExist = this._is_id_exist(item.id);
        if (!isExist) {
          while (this._Buffer_Strack.length > this._Buffer_Size) {
            var item = this._Buffer_Strack.pop();
            item.tag._clearinfo(item.tag);
          }

          this._Buffer_Strack.unshift(item);
        }
      },
      _is_id_exist: function (id) {
        var item = null;
        for (itemIndex in this._Buffer_Strack) {
          item = this._Buffer_Strack[itemIndex];
          if (item.id == id) {
            return true;
          }
        }
        return false;
      }
    };

    jSW.SwUserManager.SwUser = function (session, user, group) {
      this._session = session;
      this._user = user;
      this._group = group;
      this._userinfo = null;
    }

    jSW.SwUserManager.SwUser.prototype = {
      _static_buffer: new jSW.SwUserManager.Buffer(),

      _clearinfo: function (user) {
        user._userinfo = null;
      },

      swGetUserInfo: function (options) {
        if (this._static_buffer._is_id_exist(this._user.id)) {
          setTimeout(options.callback, 5, { tag: options.tag }, { emms: { code: 0 } }, this._userinfo);
          return jSW.RcCode.RC_CODE_S_OK;
        }
        return this._innerGetUserInfo(options);
      },

      swGetGroup: function () {
        return this._group;
      },

      /*
          options = {
              info:{
                  isGroupManager: Boolean,
                  isUserManager: Boolean,
                  isDevManager: Boolean,
                  isDevAssManager: Boolean,
                  name: String,
                  email: String,
                  phone: String,
                  groupid: String,
                  description: String,
                  resources: [
                      {
                          puid: String,
                          permission: {
                              config: false,
                              channels: [
                                  {channelindex: channel._id_chanel,
                                  iscansee: false}
                              ]
                          }
                      }
                  ]
              },
              callback: funciton,
              tag: Object
          }
      */
      swModUser: function (options) {
        var dft_poptions = {
          info: {
            name: this._user.name,
            email: this._userinfo.email,
            phone: this._userinfo.phone,
            description: this._userinfo.description,
            groupid: this._group._group.id,
            sysadmin: {
              isGroup: this._userinfo.isGroup,
              isUser: this._userinfo.isUser,
              isDev: this._userinfo.isDev,
              isDevAss: this._userinfo.isDevAss
            },
            resources: this._userinfo.resources,
            iptz: this._userinfo.iptz
          },
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_poptions, options || {});
        options.info.sysadmin = jSWUtils.extend({}, dft_poptions.info.sysadmin, options.info.sysadmin || {});
        var rc = this._mod_user(options);
        return rc;
      },

      _mod_user: function (option) {

        var payload = new proto.BVCU.UserConfig.UserInfo();

        var systemvalue = 0;

        systemvalue += (option.info.sysadmin.isGroup ? jSW.SwUserManager.SYSADMIN.GROUP : jSW.SwUserManager.SYSADMIN.NONE);
        systemvalue += (option.info.sysadmin.isUser ? jSW.SwUserManager.SYSADMIN.USER : jSW.SwUserManager.SYSADMIN.NONE);
        systemvalue += (option.info.sysadmin.isDev ? jSW.SwUserManager.SYSADMIN.DEV : jSW.SwUserManager.SYSADMIN.NONE);
        systemvalue += (option.info.sysadmin.isDevAss ? jSW.SwUserManager.SYSADMIN.DEVASS : jSW.SwUserManager.SYSADMIN.NONE);

        payload.setSname(option.info.name);
        payload.setSemail(option.info.email);
        payload.setSphone(option.info.phone);
        payload.setSdescription(option.info.description);
        payload.setIsysadmin(systemvalue);
        payload.setIptz(option.info.iptz);

        payload.setSid(this._userinfo.id);
        payload.setSallocateid(this._userinfo.allocateId);
        payload.setSgroupid(option.info.groupid);
        jSWProtocol._LocalResource_2Pb(option.info.resources, payload);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_MODUSER,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },


      /*
          options={
              data:{
                  password:  用户的原密码,修改他人密码时不用填充此值，但需要管理权限 
                  newpassword: 用户的新密码
              },
              callback: function(sender, response, data){
              },
              tag: 
          }
      */
      swModPwd: function (options) {
        var dft_poptions = {
          data: {
            password: '',
            newpassword: ''
          },
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_poptions, options || {});

        var rc = this._mod_pwd(options);
        return rc;
      },

      _mod_pwd: function (options) {
        var payload = new proto.BVCU.UserConfig.ModPassword();

        payload.setSid(this._user.id);
        payload.setSpassword(jSWUtils.string2Uint8Array(options.data.password));
        payload.setSnewpassword(jSWUtils.string2Uint8Array(options.data.newpassword));

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_MODPASSWD,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      /*
          options = {
              callback:function(sender, options, data){
                  
              }
          },
          tag: Object
      */
      swDelUser: function (options) {
        return this._del_user(options);
      },

      _del_user: function (option) {

        var payload = new proto.BVCU.UserConfig.User();

        payload.setSid(this._user.id);
        payload.setSgroupid(this._user.groupid);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_DELUSER,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _fresh_user_info: function (userinfo) {
        this._userinfo = {
          id: userinfo.sId,
          passwd: userinfo.sPasswd,
          bsetpasswd: userinfo.bSetPasswd,
          sysadmin: {
            isGroup: userinfo.sysadmin.isGroup,
            isUser: userinfo.sysadmin.isUser,
            isDev: userinfo.sysadmin.isDev,
            isDevAss: userinfo.sysadmin.isDevAss
          },
          iptz: userinfo.iPtz,
          serverid: userinfo.sServerId,
          groupid: userinfo.sGroupId,
          imaxsession: userinfo.iMaxSession,
          allocateId: userinfo.sAllocateId,
          name: userinfo.sName,
          phone: userinfo.sPhone,
          email: userinfo.sEmail,
          description: userinfo.sDescription,
          resources: userinfo.Resource.concat()
        }

        //if (this._group._group.id != jSW.SwUserManager.DEFAULT.GROUP_GOD) {
        //    this._userinfo.allresources = jSWProtocol._GetAllRescources(this._session, this._userinfo.resources);
        //}

      },

      _getUserInfo: function (option) {
        var payload = new proto.BVCU.UserConfig.User();
        payload.setSid(option.userid);
        payload.setSgroupid(option.groupid);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_USERINFO,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _innerGetUserInfo: function (options) {
        var rc = this._getUserInfo({
          userid: this._user.id,
          groupid: this._user.groupid,
          callback: this._innerOnGetUserInfo,
          tag: {
            user: this,
            option: options
          }
        });
        return rc;
      },

      _innerOnGetUserInfo: function (sender, response, data) {
        var tag = sender.tag;
        var user = tag.user;
        var options = tag.option;

        var rc = user._getGroupInfo({
          callback: user._innerhelpOnGetUserInfo,
          tag: {
            option: options,
            data: data,
            user: user
          }
        });
      },

      _innerhelpOnGetUserInfo: function (sender, response, data) {
        var tag = sender.tag;
        var user = tag.user;
        var options = tag.option;
        var userdata = tag.data;

        user._fresh_user_info(userdata);

        jSW.SwUserManager._InitIUserHelp.iCount -= 1;

        if (jSW.SwUserManager._InitIUserHelp.iCount <= 0) {
          var userManager = user._session.swGetUserManager();
          userManager._onInitOver();
        }

        if (options.callback != null && (typeof options.callback === "function")) {
          options.callback({ tag: options.tag }, { emms: { code: 0 } }, user._userinfo);
        }
        user._static_buffer._push({ id: user._userinfo.id, tag: user });
      },

      _getGroupInfo: function (options) {
        this._group.swGetGroupInfo(options);
      }
    };

    jSW.SwUserManager._InitIUserHelp = {
      iCount: 0
    };

    jSW.SwUserManager.SwGroup = function (session, group, groupinfo) {
      this._session = session;
      this._group = group;
      this._userlist = [];
      this.groupinfo = null;
      this._groupinfo = null;
      if (groupinfo != null) {
        this._groupinfo = groupinfo;
        this.groupinfo = groupinfo;
      }
    }

    jSW.SwUserManager.SwGroup.prototype = {
      _static_groupinfo_buffer: new jSW.SwUserManager.Buffer(),

      _clearinfo: function (group) {
        group._groupinfo = null;
        group.groupinfo = null;
      },

      _getGroupInfo: function (options) {

        var payload = new proto.BVCU.UserConfig.UserGroup();
        payload.setSid(this._group.id);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_GROUPINFO,
          payload: payload,
          callback: this._onGetGroupInfo,
          tag: { group: this, option: options }
        });

        return rc;
      },

      _resolve: function () {
        this.groupinfo = {
          id: this._group.id,
          name: this._groupinfo.name,
          parentid: this._groupinfo.parentid,
          description: this._groupinfo.description,
          resources: this._groupinfo.resources.concat(),
          allresources: []
        }

        if (this.groupinfo.id != jSW.SwUserManager.DEFAULT.GROUP_GOD) {
          this.groupinfo.allresources = jSWProtocol._GetAllRescources(this._session, this.groupinfo.resources);
        }
      },

      _onGetGroupInfo: function (sender, response, data) {
        var tag = sender.tag;
        var group = tag.group;
        group._groupinfo = data;
        group._resolve();

        var option = tag.option;
        if (option.callback != null && (typeof option.callback === "function")) {
          option.callback({ tag: option.tag }, { emms: { code: 0 } }, data);
        }

        group._static_groupinfo_buffer._push({ id: group._group.id, tag: group });
      },

      _groupSetFilter: function () {
        this.groupinfo.id = this._group.id;
        this.groupinfo.parentid = this._group.parentid;
      },

      _mod_group: function (option) {

        var payload = new proto.BVCU.UserConfig.UserGroupInfo();

        payload.setSid(this._group.id);
        payload.setSname(option.info.name);
        payload.setSdescription(option.info.description);
        payload.setSparentid(option.info.parentid);
        jSWProtocol._LocalResource_2Pb(option.info.resources, payload);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_MODGROUP,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _del_group: function (option) {

        var payload = new proto.BVCU.UserConfig.UserGroup();

        if (this._userlist == null) {
          console.warn("please get group info before delete it!");
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        if (this._userlist != null && this._userlist.length > 0) {
          console.warn("we can't delete the group because it contains more than 1 user!");
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        payload.setSid(this._group.id);
        payload.setSparentid(this._group.parentid);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_DELGROUP,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _add_user: function (option) {

        var payload = new proto.BVCU.UserConfig.UserInfo();

        var systemvalue = 0;

        systemvalue += (option.info.sysadmin.isGroup ? jSW.SwUserManager.SYSADMIN.GROUP : jSW.SwUserManager.SYSADMIN.NONE);
        systemvalue += (option.info.sysadmin.isUser ? jSW.SwUserManager.SYSADMIN.USER : jSW.SwUserManager.SYSADMIN.NONE);
        systemvalue += (option.info.sysadmin.isDev ? jSW.SwUserManager.SYSADMIN.DEV : jSW.SwUserManager.SYSADMIN.NONE);
        systemvalue += (option.info.sysadmin.isDevAss ? jSW.SwUserManager.SYSADMIN.DEVASS : jSW.SwUserManager.SYSADMIN.NONE);


        payload.setSid(option.info.id);
        if (option.info.passwd.length > 0 && option.info.passwd.length < 64) {
          payload.setSpasswd(jSWUtils.string2Uint8Array(option.info.passwd));
        } else if (option.info.passwd.length > 64) {
          console.log("the passwd you seted is out of range");
        }
        payload.setSname(option.info.name);
        payload.setSemail(option.info.email);
        payload.setSphone(option.info.phone);
        payload.setSdescription(option.info.description);
        payload.setIsysadmin(systemvalue);
        payload.setIptz(option.info.iptz);
        payload.setSallocateid(option.info.allocateId);

        payload.setSgroupid(this._group.id);
        jSWProtocol._LocalResource_2Pb(option.info.resources, payload);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_ADDUSER,
          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _onGetUser: function (user) {
        var localuser = null;
        var isContains = false;
        for (userIndex in this._userlist) {
          localuser = this._userlist[userIndex];
          if (localuser._user.id == user.id) {
            localuser._user = user;
            isContains = true;
            break;
          }
        }
        if (!isContains) {
          localuser = this._local_add_user(user);
        }
        var userManager = this._session.swGetUserManager();
        return localuser;
      },

      _local_add_user: function (user) {
        var localuser = new jSW.SwUserManager.SwUser(this._session, user, this);
        this._userlist.push(localuser);
        return localuser;
      },

      _on_notify_mod_user: function (userinfo) {
        var user = null;
        var isExist = false;
        for (userindex in this._userlist) {
          user = this._userlist[userindex];
          if (user._user.id == userinfo.sId) {
            isExist = true;
          }
          break;
        }

        if (isExist) {
          user._fresh_user_info(userinfo);
        }
        else {
          var userbaseinfo = {
            id: userinfo.sId,
            groupid: userinfo.sGroupId,
            name: userinfo.Sname
          };
          user = new jSW.SwUserManager.SwUser(this._session, userbaseinfo, this);
          user._fresh_user_info(userinfo);
          this._userlist.push(user);
        }

        return user;
      },

      _on_notify_del_user: function (user) {
        var userlocal = null;
        for (userindex in this._userlist) {
          userlocal = this._userlist[userindex];
          if (userlocal._user.id == user._user.id) {
            this._userlist.splice(userindex, 1);
            break;
          }
        }
        return userlocal;
      },

      /*
          options = {
              info:{
                  isGroupManager: Boolean,
                  isUserManager: Boolean,
                  isDevManager: Boolean,
                  isDevAssManager: Boolean,
                  name: String,
                  email: String,
                  phone: String,
                  groupid: String,
                  description: String,
                  password: String,
                  resources: [
                      {
                          puid: String,
                          permission: {
                              config: false,
                              channels: [
                                  {channelindex: channel._id_chanel,
                                  iscansee: false}
                              ]
                          }
                      }
                  ]
              },
              callback: function(sender, options, data){
              },
              tag: Object
          }
      */
      swAddUser: function (options) {
        var dft_poptions = {
          info: {
            id: '',
            passwd: '',
            name: '',
            email: '',
            phone: '',
            description: '',
            groupid: this._group.id,
            sysadmin: {
              isGroup: false,
              isUser: false,
              isDev: false,
              isDevAss: false
            },
            resources: []
          },
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_poptions, options || {});
        options.info = jSWUtils.extend({}, dft_poptions.info, options.info || {});
        var rc = this._add_user(options);
        return rc;
      },

      swGetUserList: function (options) {
        setTimeout(options.callback, 5, { tag: options.tag }, { emms: { code: jSW.RcCode.RC_CODE_S_OK } }, this._userlist);
        return jSW.RcCode.RC_CODE_S_OK;
      },

      swGetUserById: function (id) {
        var user = null;
        for (userIndex in this._userlist) {
          user = this._userlist[userIndex];
          if (user._user.id == id) {
            return user;
          }
        }
        return null;
      },

      swGetGroupInfo: function (options) {
        var isBufferExist = this._static_groupinfo_buffer._is_id_exist(this._group.id);
        if (isBufferExist) {
          setTimeout(options.callback, 5, { tag: options.tag }, { emms: { code: 0 } }, this.groupinfo);
          return jSW.RcCode.RC_CODE_S_OK;
        }
        else {
          return this._getGroupInfo(options);
        }
      },

      /*
          option= {
              info: {
                  name: String,
                  descriptioin: String,
                  parentid: String,
                  resources: [
                      {
                          puid: String,
                          permission: {
                              config: false,
                              channels: [
                                  {channelindex: channel._id_chanel,
                                  iscansee: false}
                              ]
                          }
                      }
                  ]
              },
              callback: function(sender, options, data){
              },
              tag: Object
          }
      */
      swModGroup: function (option) {
        var dft_poptions = {
          info: {
            name: this._group.name,
            description: this._groupinfo.description,
            parentid: this._groupinfo.parentid,
            resources: this._groupinfo.resources
          },
          callback: null,
          tag: null
        };

        option = jSWUtils.extend({}, dft_poptions, option || {});
        option.info = jSWUtils.extend({}, dft_poptions.info, option.info || {});
        var rc = this._mod_group(option);
        return rc;
      },

      swDelGroup: function (options) {
        return this._del_group(options);
      }
    };

    jSW.SwUserManager.prototype = {
      _session: null,
      _grouplist: [],
      _ondatachangedcallback: null,
      _initCallback: null,
      _usertag: null,
      _isInitOver: false,
      _currentUser: null,
      _currentuserid: "",

      _getUserGroupList: function (option) {
        var param = jSWProtocol.JsonParamCommand(this._session._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_GROUPLIST,
          jSWProtocol.BVCU_Command('', -1, null));

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.usercfg.getgrouplist.cmd,
          session: this._session,
          request: param,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _getUserList: function (option) {
        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_USERLIST,

          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _innerGetUserList: function () {
        this._getUserList({
          callback: this._onGetUserList,
          tag: this
        });
      },

      _onGetUserList: function (sender, response, data) {
        var userManager = sender.tag;
        var user = null;
        var group = null;
        var localuser = null;
        jSW.SwUserManager._InitIUserHelp.iCount = data.length;
        for (userindex in data) {
          user = data[userindex];
          group = userManager._getGroupById(user.groupid);
          if (group != null) {
            localuser = group._onGetUser(user);
            if (localuser._user.id == userManager._currentuserid) {
              userManager._currentUser = localuser;
            }
          }
        }

        userManager._onInitOver();
      },

      _getGroupById: function (id) {
        var group = null;
        for (groupindex in this._grouplist) {
          group = this._grouplist[groupindex];
          if (group._group.id == id) {
            return group;
          }
        }
        return null;
      },

      _getOnlineUsers: function (option) {
        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_ONLINE,

          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _getOnlineUserInfo: function (option) {

        var payload = new proto.BVCU.UserConfig.UserOnline();

        payload.setSzdevid(option.devid);
        payload.setSuserid(option.userid);
        payload.setIapplierid(option.applierid);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_USER_ONLINEINFO,

          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _add_group: function (option) {

        var payload = new proto.BVCU.UserConfig.UserGroupInfo();

        payload.setSid(option.info.id);
        payload.setSname(option.info.name);
        payload.setSdescription(option.info.description);
        payload.setSparentid(option.info.parentid);
        jSWProtocol._LocalResource_2Pb(option.info.resources, payload);

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_ADDGROUP,

          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _kickout_user: function (option) {

        var payload = new proto.BVCU.UserConfig.Kickout();

        var rc = jSWProtocol.SendRequest({
          session: this._session,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_USER_KICKOUT,

          payload: payload,
          callback: option.callback,
          tag: option.tag
        });

        return rc;
      },

      _onInitOver: function (bEnforce) {
        if (!this._isInitOver || bEnforce) {
          this._isInitOver = true;
          this._initCallback({ tag: this._usertag }, {
            emms: { code: 0 }
          },
            null);
        }
      },

      _add_group_to_local: function (session, group) {
        var groupitem = new jSW.SwUserManager.SwGroup(session, group);
        this._grouplist.push(groupitem);
        //groupitem._getGroupInfo();
      },
      _on_notify_mod_group: function (groupinfo) {
        var isExist = false;
        var group = null;
        for (groupIndex in this._grouplist) {
          group = this._grouplist[groupIndex];
          if (group._group.id == groupinfo.id) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          group._groupinfo = groupinfo;
          group.groupinfo = groupinfo;
        }
        else {
          var groupbaseinfo = {
            id: groupinfo.id,
            name: groupinfo.name,
            parentid: groupinfo.parentid
          };
          group = new jSW.SwUserManager.SwGroup(this._session, groupbaseinfo, groupinfo);
          this._grouplist.push(group);
        }

        return group;
      },

      _on_notify_del_group: function (usergroup) {
        var group = null;
        var isContain = false;
        for (groupindex in this._grouplist) {
          group = this._grouplist[groupindex];
          if (group._group.id == usergroup.id) {
            this._grouplist.splice(groupindex, 1);
            isContain = true;
            break;
          }
        }

        if (isContain) {
          return group;
        }

        return null;
      },

      _on_notify_mod_user: function (userinfo) {
        var group = null;
        var user = null;
        for (groupIndex in this._grouplist) {
          group = this._grouplist[groupIndex];
          if (group._group.id == userinfo.sGroupId) {
            user = group._on_notify_mod_user(userinfo);
            break;
          }
        }
        return user;
      },

      _on_notify_del_user: function (userinfo) {
        var user = null;
        user = this._getUserById(userinfo.id);
        if (user != null) {
          user = user._group._on_notify_del_user(user);
        }
        return user;
      },

      onGetGroupList: function (sender, response, data) {
        var tag = sender.tag;
        var userManager = tag.userManager;

        var groupgeted = null;
        var grouplocal = null;
        var isContains = false;

        for (groupindex in data) {
          groupgeted = data[groupindex];
          for (localgroupindex in userManager._grouplist) {
            grouplocal = userManager._grouplist[localgroupindex];
            if (groupgeted.id == grouplocal._group.id) {
              grouplocal._group = groupgeted;
              isContains = true;
              break;
            }
          }

          if (!isContains) {
            userManager._add_group_to_local(this.session, groupgeted);
          }

          isContains = false;
        }


        userManager._innerGetUserList();
      },

      _onNotify: function (msgType, response, payload) {
        if (!this._isInitOver) {
          return;
        }

        var data = null;
        var cmd = "";
        var target = null;
        switch (msgType) {
          case proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_USER_ADDGROUP:
            data = proto.BVCU.UserConfig.UserGroupInfo.deserializeBinary(payload);
            data = jSWProtocol.GroupInfoPb_2Json(data, this._session);
            target = this._on_notify_mod_group(data);
            cmd = jSWProtocol.RequestHeader.usercfg.addgroup.cmd;
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_USER_MODGROUP:
            data = proto.BVCU.UserConfig.UserGroupInfo.deserializeBinary(payload);
            data = jSWProtocol.GroupInfoPb_2Json(data, this._session);
            target = this._on_notify_mod_group(data);
            cmd = jSWProtocol.RequestHeader.usercfg.modgroupinfo.cmd;
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_USER_DELGROUP:
            data = proto.BVCU.UserConfig.UserGroup.deserializeBinary(payload);
            data = jSWProtocol.GroupPb_2Json(data);
            target = this._on_notify_del_group(data);
            cmd = jSWProtocol.RequestHeader.usercfg.delgroup.cmd;
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_USER_ADDUSER:
            data = proto.BVCU.UserConfig.UserInfo.deserializeBinary(payload);
            data = jSWProtocol.USER_USERINFO_Pb2Json(data, this._session);
            target = this._on_notify_mod_user(data);
            cmd = jSWProtocol.RequestHeader.usercfg.adduser.cmd;
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_USER_MODUSER:
            data = proto.BVCU.UserConfig.UserInfo.deserializeBinary(payload);
            data = jSWProtocol.USER_USERINFO_Pb2Json(data, this._session);
            target = this._on_notify_mod_user(data);
            cmd = jSWProtocol.RequestHeader.usercfg.moduserinfo.cmd;
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_NOTIFY_USER_DELUSER:
            data = proto.BVCU.UserConfig.User.deserializeBinary(payload);
            data = jSWProtocol.USER_USERPb_2Json(data);
            target = this._on_notify_del_user(data);
            cmd = jSWProtocol.RequestHeader.usercfg.deluser.cmd;
            break;
          default:
            break;
        }

        if (cmd != "") {
          this._ondatachangedcallback(this, {
          }, {
              cmd: cmd,
              target: target
            });
        }
      },

      swGetCurrentUser: function () {
        if (!this._isInitOver) {
          console.log('please call get info function after init over!!!!!');
          return null;
        }

        return this._currentUser;
      },

      /*
      options:{
          callback:function(sender, response, data){
              
          },
 
          ondatachanged: function(sender, response, data){
              data:{
                  cmd: string,
                  target: object
              }
          },
          tag: 
      }
      */
      swInit: function (options) {
        if (options == null || options.ondatachanged == null || options.callback == null) {
          console.log("options must be fill correctly! please try again");
          return;
        }

        this._ondatachangedcallback = options.ondatachanged;
        this._initCallback = options.callback;
        if (this._isInitOver) {
          this._onInitOver(true);
          return jSW.RcCode.RC_CODE_S_OK;
        }

        this._currentuserid = this._session._user;
        this._isInitOver = false;
        this._usertag = options.tag;

        return this._getUserGroupList({
          callback: this.onGetGroupList,
          tag: {
            userManager: this,
            isInit: true
          }
        });
      },

      swGetCurrentUserId: function () {
        return this._currentuserid;
      },

      swGetGroupList: function (options) {
        if (!this._isInitOver) {
          console.log('please call get info function after init over!!!!!');
          return null;
        }
        setTimeout(options.callback, 5, { tag: options.tag }, { emms: { code: jSW.RcCode.RC_CODE_S_OK } }, this._grouplist);
        return jSW.RcCode.RC_CODE_S_OK;
      },

      swGetGroupById: function (id) {
        var group = this._getGroupById(id);
        return group;
      },

      swGetUserById: function (groupid, userid) {
        var group = this.swGetGroupById(groupid);
        if (group == null)
          return null;
        var user = group.swGetUserById(userid);
        return user;
      },


      _getUserById: function (userid) {
        var user = null;
        for (groupindex in this._grouplist) {
          group = this._grouplist[groupindex];
          if (group != null) {
            user = group.swGetUserById(userid);
            if (user != null) {
              break;
            }
          }
        }
        return user;
      },

      /*
          option= {
              info: {
                  name: String,
                  description: String,
                  parentid: String,
                  resources: [
                      {
                          puid: String,
                          permission: {
                              config: false,
                              channels: [
                                  {channelindex: channel._id_chanel,
                                  iscansee: false}
                              ]
                          }
                      }
                  ]
              },
              callback: function(sender, options, data){
              },
              tag: Object
          }
      */
      swAddGroup: function (option) {
        var dft_poptions = {
          info: {
            name: '',
            description: '',
            parentid: '',
            resources: []
          },
          callback: null,
          tag: null
        };

        var poptions = jSWUtils.extend({}, dft_poptions, option || {});
        var rc = this._add_group(poptions);
        return rc;
      }
    }


    // ---- SWPu ----
    jSW.SWPu = function (parent, options) {
      var chanellist = options.getChannellistList();
      var baseInfo = options.getPubaseinfo();
      this._parent = parent;
      this._innerCommUpdata(options);
      jSWUtils.debugLogInfo(this._info_pu.id + "" + "v:" + this._arr_channel.length + ",g" + this._arr_gps.length);
    };

    jSW.SWPu.SATELLITE = {
      GPS: (1 << 0), //美国GPS卫星
      BDS: (1 << 1), //中国北斗卫星
      GLONASS: (1 << 2), //俄罗斯格洛纳斯卫星
      GALILEO: (1 << 3), //欧洲伽利略卫星
      QZSS: (1 << 4) //日本准天顶卫星
    };

    jSW.SWPu.prototype = {
      _parent: null,
      _id_pu: null,
      _name_pu: null,
      _info_pu: null,
      _arr_channel: null,
      _arr_gps: null,
      _arr_tsp: null,
      _gps_attr: null,

      swReboot: function () {
        return jSW.RcCode.RC_CODE_E_UNSUPPORTED;
      },

      /*
          options = {
              istart: Boolean,
              ilength: Number(存储时间长度，单位秒， -1表示一直录像),
              callback: function(sender, response, data){
              },
              tag: tag
          }
      */
      swSetPuManualrecord: function (options) {
        var payload = new proto.BVCU.PUConfig.ManualRecord();

        var dft_options = {
          istart: 1,
          ilength: -1,
          callback: null
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        payload.setBstart(options.istart);
        payload.setIlength(jSWProtocol.Int2Uint(options.ilength));

        var rc = jSWProtocol.SendRequest({
          session: this._parent,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_MANUALRECORD,
          target: this._id_pu,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },


      swPuControl: function (options) {
        var rc = jSWProtocol.CheckOptions(proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_REBOOT_OR_SHUTDOWN, options);
        if (rc != jSW.RcCode.RC_CODE_S_OK) {
          return rc;
        }

        var payload = new proto.WEBBVCU.PU_CONTROL();
        payload.setIoption(options.ioption);

        rc = jSWProtocol.SendRequest({
          session: this._parent,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_REBOOT_OR_SHUTDOWN,
          target: this._id_pu,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });
        return rc;
      },

      /*
          options = {
              istart: 1-开始抓拍，0-停止抓拍 2-按指定周期数抓拍,
              icyclecount: // 指定的抓拍周期数，当iStart==2 时有意义,
              szftpid: // 抓拍图片上传服务器ID，如果ID为空，表示不需要上传。,
              callback: function(sender, response, data){
              },
              tag: Object
          };
      */
      swSetPuSnapshot: function (options) {
        var payload = new proto.BVCU.PUConfig.Snapshot();

        var dft_options = {
          istart: 0,
          icyclecount: 0,
          szftpid: null,
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        payload.setBstart(options.istart);
        payload.setIcyclecount(options.icyclecount);
        payload.setSzftpid(options.szftpid);

        var rc = jSWProtocol.SendRequest({
          session: this._parent,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_SNAPSHOT,
          target: this._id_pu,
          payload: payload,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swGetChanel: function (chanelId) {
        for (var i = 0; i < this._arr_channel.length; i++) {
          if (this._arr_channel[i]._id_chanel == chanelId) {
            return this._arr_channel[i];
          }
        }

        for (var i = 0; i < this._arr_gps.length; i++) {
          if (this._arr_gps[i]._id_chanel == chanelId) {
            return this._arr_gps[i];
          }
        }

        for (var i = 0; i < this._arr_tsp.length; i++) {
          if (this._arr_tsp[i]._id_chanel == chanelId) {
            return this._arr_tsp[i];
          }
        }

        return null;
      },

      _innerCommUpdata: function (options) {
        var baseInfo = options.getPubaseinfo();
        var chanellist = options.getChannellistList();
        this._info_pu = {
          bootduration: baseInfo.getIbootduration(),
          boottime:
          {
            year: baseInfo.getStboottime().getIyear(),
            month: baseInfo.getStboottime().getImonth(),
            day: baseInfo.getStboottime().getIday(),
            hour: baseInfo.getStboottime().getIhour(),
            minute: baseInfo.getStboottime().getIminute(),
            second: baseInfo.getStboottime().getIsecond()
          },
          chanelcount: chanellist.length,
          chanellist: [],
          id: baseInfo.getSzid(),
          lat: baseInfo.getIlatitude(),
          long: baseInfo.getIlongitude(),
          name: baseInfo.getSzpuname(),
          onlinestatus: baseInfo.getIonlinestatus(),
          onlinethrough: baseInfo.getIonlinethrough(),
          onlinetime:
          {
            year: baseInfo.getStonlinetime().getIyear(),
            month: baseInfo.getStonlinetime().getImonth(),
            day: baseInfo.getStonlinetime().getIday(),
            hour: baseInfo.getStonlinetime().getIhour(),
            minute: baseInfo.getStonlinetime().getIminute(),
            second: baseInfo.getStonlinetime().getIsecond()
          }
        };
        this._id_pu = this._info_pu.id;
        this._name_pu = this._info_pu.name;

        this._arr_channel = [];
        this._arr_gps = [];
        this._arr_tsp = [];

        for (var i = 0; i < chanellist.length; i++) {
          var chanelType = jSWProtocol.ChanelType.getType(chanellist[i].getIchannelindex());
          var chanelRecord = null;
          if (chanelType == jSWProtocol.ChanelType.chanel) {
            var chanel = new jSW.SWVideoChanel(this, chanellist[i]);
            this._arr_channel.push(chanel);
            chanelRecord = chanel;
          } else if (chanelType == jSWProtocol.ChanelType.gps) {
            var gps = new jSW.SWGPSChanel(this, chanellist[i]);
            this._arr_gps.push(gps);
            chanelRecord = gps;
          } else if (chanelType == jSWProtocol.ChanelType.tsp) {
            var tsp = new jSW.SWTSPChanel(this, chanellist[i]);
            this._arr_tsp.push(tsp);
            chanelRecord = tsp;
          }

          this._info_pu.chanellist.push(chanelRecord);
        }

        jSWUtils.debugLogInfo(this._info_pu.id + "" + "v:" + this._arr_channel.length + ",g" + this._arr_gps.length);
      },

      _internalUpdate: function (options) {

        this._innerCommUpdata(options);

        if (this._info_pu.onlinestatus == 0) {
          this._clear();
        }
      },

      compare: function (objPu) {
        if (this._parent.compare(objPu._parent)) {
          return (this._id_pu == objPu._id_pu);
        }

        return false;
      },

      _clear: function () {

        for (var i = 0; i < this._arr_channel.length; i++) {
          this._arr_channel[i]._clear();
        }

        for (var i = 0; i < this._arr_gps.length; i++) {
          if (this._arr_gps[i]._info_chanel.status == 0) {
            this._arr_gps[i].swClose();
          }
        }

        for (var i = 0; i < this._arr_tsp.length; i++) {
          if (this._arr_tsp[i]._info_chanel.status == 0) {
            this._arr_tsp[i].swClose();
          }
        }
      },
    };

    jSW.CommonDlgMgr = function (session) {
      this._session = session;
      this._arraydlg = [];
    }

    jSW.CommonDlgMgr.prototype = {
      push: function (commdlg) {
        var deskey = this.buildKey(commdlg.getHDlg());
        this._arraydlg[deskey] = commdlg;
      },
      createAndSave: function (chanel, hDlg) {
        var aimDlg = new jSW.CommonDlg(chanel);
        this.push(aimDlg, hDlg);
        return aimDlg;
      },
      get: function (key) {
        return this._arraydlg[this.buildKey(key)];
      },
      getSession: function () {
        return this._session;
      },
      each: function (dlgHandle, scope, tag) {
        for (iindex in this._arraydlg) {
          if (this._arraydlg[iindex]) {
            if (scope) {
              if (dlgHandle.bind(scope)(this._arraydlg[iindex], tag)) {
                break;
              }
            } else {
              if (dlgHandle(this._arraydlg[iindex], tag)) {
                break;
              }
            }
          }
        }
      },
      free: function (hdlg) {
        this._arraydlg[this.buildKey(hdlg)] = null;
      },
      buildKey: function (hdlg) {
        return "dlg" + hdlg;
      },
      getDefault: function () {
        var rcCommDlg = null;
        this.each(function (commDlg) {
          if (rcCommDlg == null) {
            rcCommDlg = commDlg; return true;
          }
        });
        return rcCommDlg;
      }
    }

    jSW.CommonDlg = function (channel, hDlg) {
      this._channel = channel;
      this._hDlg = hDlg;
      this._mdiv = null;
      this._dlgParams = null;
      this._media = 0;
      this._rotate = 0;
      this._prototype = -1;
      this._info = "";
    }

    jSW.CommonDlg.prototype = {
      getkey: function () {
        return this._hDlg;
      },
      compare: function (dlg) {
        if (this.getkey() == dlg.getkey()) {
          return true;
        }
        return false;
      },
      getHDlg: function () {
        return this._hDlg;
      },
      getDlgParams: function () {
        if (this._dlgParams == null) {
          this._dlgParams = jSWProtocol.BVCU_DialogParam(this._channel._parent._id_pu, this._channel._id_chanel, 0, this._prototype, 0, 0, this._hDlg);
        }
        return this._dlgParams;
      },
      getPlayDiv: function () {
        return this._mdiv;
      },
      setParams: function (div, hdlg, media, prototype) {
        this._mdiv = div;
        this._hDlg = hdlg;
        this._media = media;
        this._prototype = prototype;
      },
      getMedia: function () {
        return this._media;
      },
      getRotate: function () {
        return this._rotate;
      },
      setRotate: function (val) {
        this._rotate = val;
      },
      getProteType: function () {
        return this._prototype;
      },
      getOpts: function (opts) {
        if (!opts) {
          opts = {
            hdl: -1
          };
        }
        opts.hdlg = this._hDlg;
        return opts;
      },
      getInfo: function () {
        if (this._info == "") {
          this._info = this._channel._parent._id_pu + ' ' + this._channel._id_chanel + ' ' + this._hDlg;
        }
        return this._info;
      },
      onMediaChange: function (imedia) {
        this._media = imedia;
      },
      _reset: function () {
        this._media = 0;
      },
      setHdlg: function (hDlg) {
        this._hDlg = hDlg;
      }
    }

    // ---- SWVideoChanel  视频通道----
    jSW.SWVideoChanel = function (parent, options) {
      this._parent = parent;
      this._info_chanel = {
        id: options.getIchannelindex(),
        name: options.getSzname(),
        ptz: options.getIptz(),
        media: options.getImediadir() >> 10,
        status: options.getImediadir() & 0x000003ff
      };
      this._id_chanel = this._info_chanel.id;
      this._name_chanle = this._info_chanel.name;
      this._meida_chanel = this._info_chanel.media;
      this._ptz_chanel = this._info_chanel.ptz;
      this._url_channel = null;
      this.m_live_hls = null;
      this.m_live_rtmp = null;
      this._session = this._parent._parent;
      this._commDlgMgr = new jSW.CommonDlgMgr(this._session);
      this.ismuti = false;
      this._open_status = jSW.SWVideoChanel._OpenStatus.NOT_OPEND;
      this._intercom = new jSW.SWVideoChanel.InterCom(this);
    };

    jSW.SWVideoChanel._OpenStatus = {
      NOT_OPEND: 0,
      OPENING: 1,
      OPENED: 2
    };

    jSW.SWVideoChanel._OcxFullScreen = {
      _lastVideoChanel: null,
      _hDlg: -1,
      beforeFullScreen: function (m_chanel, hdlg) {
        this._lastVideoChanel = m_chanel;
        this._hDlg = hdlg;
      },
      onClickEsc: function () {
        if (jSWOptions.CheckOcx()) {
          if (document.msFullscreenElement) {
            document.msExitFullscreen();
          }
        }
      },
      upDateDialog: function () {
        if (this._lastVideoChanel) {
          this._lastVideoChanel._updateDialog(this._hDlg);
        }
        if (!document.msFullscreenElement) {
          this._lastVideoChanel = null;
        }
      },

      onFullScreenChange: function () {
        setTimeout(jSW.SWVideoChanel._OcxFullScreen.upDateDialog.bind(jSW.SWVideoChanel._OcxFullScreen), 200);
      }
    };

    ///key id 27 esc
    (function () {
      document.addEventListener("keydown", function () {
        var event = window.event || arguments[0];
        if (event.keyCode == 27) {
          jSW.SWVideoChanel._OcxFullScreen.onClickEsc();
        }
      });
    })();

    jSW.SWVideoChanel.prototype = {
      m_prototype: 4,

      /*
       * options : {
       *    Idelayvssmooth : Number
       * }
       */
      swSetControlParam: function (options) {
        var rc = jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        if (jSWOptions.CheckOcx()) {
          if (typeof options["Idelayvssmooth"] == undefined) {
            return jSW.RcCode.RC_CODE_E_INVALIDARG;
          }
          var payload = new proto.WEBBVCU.ParamsDialogControl();
          payload.setIdelayvssmooth(options["Idelayvssmooth"]);
          var rc = this._autoDlgSendProxy(options, function (data) {
            return {
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_DIALOG_PARAM,
              payload: payload
            };
          });
          return rc;
        }
        return rc;
      },

      /**video source type*/
      swSrcType: function () {
        if (this.m_prototype == jSWProtocol.ProtoType.HLS) {
          return 'hls';
        } else if (this.m_prototype == jSWProtocol.ProtoType.OCX) {
          return 'ocx';
        } else if (this.m_prototype == jSWProtocol.ProtoType.RTMP) {
          return 'rtmp';
        }

        return 'unknown';
      },

      localRecords: [],

      _notifyDialogEventStorage: function (msgType, eventStorage) {
        var localRecord = null;
        var isContains = false;
        for (iIndex in this.localRecords) {
          localRecord = this.localRecords[iIndex];
          if (localRecord.szfilename == eventStorage.szfilename) {
            isContains = true;
            break;
          }
        }

        if (!isContains) {
          localRecord = {
            iresult: jSW.RcCode.RC_CODE_S_OK,
            szfilename: eventStorage.szfilename,
            itimestampbegin: 0,
            itimestampend: 0
          };
          this.localRecords.push(localRecord);
        }

        switch (msgType) {
          case proto.WEBBVCU.MSGType.WEB_NOTIFY_BVCU_EVENT_STORAGE_FILE_OPEN:
            localRecord.itimestampbegin = eventStorage.itimestamp;
            localRecord.iresult = eventStorage.iresult;
            break;
          case proto.WEBBVCU.MSGType.WEB_NOTIFY_BVCU_EVENT_STORAGE_FILE_CLOSE:
            localRecord.itimestampend = eventStorage.itimestamp;
            localRecord.iresult = eventStorage.iresult;
            break;
          case proto.WEBBVCU.MSGType.WEB_NOTIFY_BVCU_EVENT_STORAGE_ERROR:
            localRecord.iresult = eventStorage.iresult;
            break;
          default:
            break;
        }

        if (msgType == proto.WEBBVCU.MSGType.WEB_NOTIFY_BVCU_EVENT_STORAGE_FILE_CLOSE ||
          msgType == proto.WEBBVCU.MSGType.WEB_NOTIFY_BVCU_EVENT_STORAGE_ERROR) {
          if (this._callbackAfterRecordHasResult != null) {
            var data = {
              channel: this,
              storage: localRecord
            };
            this._callbackAfterRecordHasResult(data)
          }
        }
      },

      _callbackAfterRecordHasResult: null,
      _videoPlayer: null,
      _iVideoPlayerRotate: 0,
      _OnNeedSaveVideoPlayer: function (videoplayer) {
        this._videoPlayer = videoplayer;
        this._iVideoPlayerRotate = 0;
      },

      /**fullscreen: full screen, Esc key exit*/
      swFullScreen: function (opts) {
        var rc = this._autoDlgProxy(opts, function (commDlg, session, targetid, targetindex, hdlg) {
          if (jSWOptions.CheckOcx()) {
            var myDivId = commDlg.getPlayDiv().bv_uuid + '_0077554' + "tempdiv";
            var myDiv = document.getElementById(myDivId);
            if (!document.onmsfullscreenchange) {
              document.onmsfullscreenchange = jSW.SWVideoChanel._OcxFullScreen.onFullScreenChange;
            }
            if (document.msFullscreenElement) {
              document.msExitFullscreen();
            } else {
              jSW.SWVideoChanel._OcxFullScreen.beforeFullScreen(this, hdlg);
              myDiv.msRequestFullscreen();
            }
          }
          else if (jSWOptions.calltype == jSW.CallProtoType.HTTP) {
            if (!this._videoPlayer.isFullscreen()) {
              this._videoPlayer.requestFullscreen();
            } else {
              this._videoPlayer.exitFullscreen();
            }
          }
          return jSW.RcCode.RC_CODE_S_OK;
        });
        return rc;
      },

      swGetDialogInfo: function (options) {
        var payload = new proto.BVCU.CMSConfig.CMSCFG_DialogInfo();
        var pbStTarget = new proto.BVCU.CMSConfig.CMSCFG_ChannelInfo();
        pbStTarget.setSzid(this._parent._id_pu);
        payload.setSttarget(pbStTarget);
        payload.setIchannelindex(this._id_chanel);
        var rc = jSWProtocol.SendRequest({
          session: this._parent._parent,
          payload: payload,
          msgtype: proto.WEBBVCU.MSGType.WEB_GET_CMS_DIALOGINFO,
          callback: options.callback,
          tag: options.tag
        });
        return jSW.RcCode.RC_CODE_S_OK;
      },

      /*
          opitons = {
              irotate: jSWProtocol.RotateType ,
              callback: function(Options, Response){
              }
              tag: Object
          }
      */
      swVideoRotate: function (options) {
        var rc = this._autoDlgProxy(options, function (commDlg, session, targetid, targetindex, hdlg) {
          var iRotate = commDlg.getRotate();
          iRotate += options.irotate;
          if (jSWOptions.CheckOcx()) {
            var rc = this._swOnDivSizeChange(iRotate, hdlg, options);
            return rc;
          }
          else if (jSWOptions.CheckHttp()) {
            if (this._videoPlayer == null) {
              jSWUtils.debugLogInfo(targetid + " " + targetindex + " video rotate faild, due not playing");
              return jSW.RcCode.RC_CODE_E_FAIL;
            }
            this._videoPlayer.zoomrotate({
              rotate: this._iVideoPlayerRotate,
              debug: false
            });
            setTimeout(options.callback, 50, { tag: options.tag }, { emms: { code: jSW.RcCode.RC_CODE_S_OK } });
            return jSW.RcCode.RC_CODE_S_OK;
          }
        });
        return rc;
      },


      /**
       * options: {
       *  bStretch: Boolean,
       *  callback: function(){},
       *  tag: object
       * }
       */
      swVideoStretch: function (options) {
        var rc = this._autoDlgSendProxy(options, function (data) {
          var payload = new proto.WEBBVCU.CommonData();
          payload.setIdata1(options.bStretch ? 1 : 0);
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_VIDEO_DIALOG_STRETCH,
            payload: payload
          };
        });
        return rc;
      },

      /**
       * options: {
       *  iQuality: Number Default(100),
       *  szFileName: String
       *  callback: function(){},
       *  tag: object,
       *  hdlg: Number
       * }
       */
      swLocalSnapshot: function (options) {
        if (!options.szFileName || options.szFileName.length == 0) {
          console.log("swLocalSnapshot SzFilePath Is Invalid");
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }
        var rc = this._autoDlgSendProxy(options, function (data) {
          var payload = new proto.WEBBVCU.CommonData();
          payload.setIdata1(options.iQuality ? options.iQuality : 100);
          payload.setSzdata(jSWUtils.string2Uint8Array(options.szFileName));
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_LOCAL_SNAPSHOT,
            payload: payload
          };
        });
        return rc;
      },

      _updateDialog: function (hDlg) {
        var rc = jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        if (jSWOptions.CheckOcx()) {
          var rc = this._commSendProxy(options, function () {
            return {
              msgtype: proto.WEBBVCU.MSGType.WEB_VIDEO_DIALOG_UPDATE,
              hdlg: hDlg,
            };
          });
          return rc;
        }
        return rc;
      },

      _swOnDivSizeChange: function (irotate, hdlg, options) {
        var payload = new proto.WEBBVCU.VideoDialogRotate();
        payload.setSzpuid(jSWUtils.string2Uint8Array(this._parent._id_pu));
        payload.setIchannelindex(this._id_chanel);
        payload.setIrotate(irotate);
        var rc = jSWProtocol.SendRequest({
          session: this._parent._parent,
          payload: payload,
          msgtype: proto.WEBBVCU.MSGType.WEB_VIDEO_DIALOG_ROTATE,
          hdlg: hdlg,
          callback: options.callback,
          tag: options.tag
        });
        return jSW.RcCode.RC_CODE_S_OK;
      },

      _onOcxChanelChange: function (isVideo, isOpen, iMedir) {
        if (jSW.CallProtoType.OCX != jSWOptions.calltype) {
          return;
        }
      },

      //one chanel muti open
      _pushCommDlg: function (commDlg) {
        this._commDlgMgr.push(commDlg);
      },

      _beginOpen: function () {
        if (!this.ismuti) {
          this._open_status = jSW.SWVideoChanel._OpenStatus.OPENING;
        }
      },

      _endOpenHasResult: function (bresult) {
        if (!this.ismuti) {
          if (bresult) {
            this._open_status = jSW.SWVideoChanel._OpenStatus.OPENED;
          } else {
            this._open_status = jSW.SWVideoChanel._OpenStatus.NOT_OPEND;
          }
        }
      },

      _closeHasResult: function (bresult) {
        if (!this.ismuti) {
          if (bresult) {
            this._open_status = jSW.SWVideoChanel._OpenStatus.NOT_OPEND;
          }
        }
      },

      _checkCanOpen: function (bmuti) {
        this.ismuti = bmuti;
        if (this.ismuti) {
          return true;
        }
        return this._open_status == jSW.SWVideoChanel._OpenStatus.NOT_OPEND;
      },

      _fillOpenParam: function (bismuti) {
        this.ismuti = bismuti;
      },

      _autoDlgProxy: function (opts, handle, tag) {
        var hdlg = this._getOptsHdlg(opts);
        if (this.ismuti && (typeof hdlg == "undefined" || hdlg == -1)) {
          console.log("can't find the dialog from you hdlg");
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }
        var tCommDlg = this.ismuti ? this._commDlgMgr.get(hdlg) : this._commDlgMgr.getDefault();

        if (tCommDlg == null) {
          console.log("can't find the dialog from you hdlg, maybe it's been closed");
          return jSW.RcCode.RC_CODE_E_NOTFOUND;
        }

        hdlg = tCommDlg.getHDlg();
        var rc = this._commProxy(function (session, targetId, targetIndex) {
          return handle.bind(this)(tCommDlg, session, targetId, targetIndex, hdlg, tag);
        });
        return rc;
      },

      _getOptsHdlg: function (opts) {
        if (opts && typeof opts.hdlg != "undefined") {
          return opts.hdlg;
        }
        return -1;
      },

      _getDesDiv: function (div) {
        if (typeof div == "string") {
          return document.getElementById(div);
        }
        return div;
      },
      //
      _commProxy: function (handle) {
        if (null == this._parent || null == this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_FAIL;
        }
        return handle.bind(this)(this._parent._parent, this._parent._id_pu, this._id_chanel);
      },

      _commSendProxy: function (opts, handleGetData) {
        var rc = this._commProxy(function (session, targetId, targetIndex) {
          var dftData = {
            payload: null,
            msgtype: -1,
            cmd: "",
            hdlg: -1,
            callback: opts ? opts.callback : null,
            tag: opts ? opts.tag : null
          };
          var desData = handleGetData.bind(this)();

          desData = jSWUtils.extend({}, dftData, desData || {});

          var rc = jSWProtocol.SendRequest({
            session: session,
            target: targetId,
            targetIndex: targetIndex,
            msgtype: desData.msgtype,
            callback: desData.callback,
            payload: desData.payload,
            hdlg: desData.hdlg,
            tag: desData.tag,
            cmd: desData.cmd
          });

          return rc;
        });
        return rc;
      },

      _autoDlgSendProxy: function (opts, handleGetData, afterhandle) {
        var rc = this._autoDlgProxy(opts, function (commDlg, session, targetId, targetIndex, hdlg) {
          var dftData = {
            payload: null,
            msgtype: -1,
            cmd: "",
            hdlg: -1,
            callback: null,
            tag: null
          };
          var desData = handleGetData.bind(this)(commDlg);

          desData = jSWUtils.extend({}, dftData, desData || {});

          var rc = jSWProtocol.SendRequest({
            session: session,
            target: targetId,
            targetIndex: targetIndex,
            msgtype: desData.msgtype,
            callback: opts.callback,
            payload: desData.payload,
            hdlg: hdlg,
            tag: opts.tag,
            cmd: desData.cmd
          });
          if (afterhandle) {
            afterhandle.bind(this)(commDlg);
          }
          return rc;
        });
        return rc;
      },

      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  bovertcp: ,
                  cmd: 'login',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  url: url
              }
          },
          tag: userdata
      };*/
      swOpen: function (options) {
        var rc = this._commProxy(function (session, targetId, targetIndex) {
          var dft_options = {
            callback: null,
            tag: null,
            prototype: 'auto',
            media: jSW.MEDIADIR.VIDEORECV
          };
          options = jSWUtils.extend({}, dft_options, options || {});

          var ptRet = this._eventHandle.getProtoType(options.prototype, options.useoptions.bHttpFlv);
          if (jSW.RcCode.bFaild(ptRet.rc)) {
            return ptRet.rc;
          }
          var prototype = ptRet.prototype;
          var div = options.tag.div;
          var playObj = null;
          var isNeedDelay = false;

          var bWindowless = options.useoptions.bwindowless;
          var bHttpFlv = options.useoptions.bHttpFlv;

          if (null == div) {
            console.warn('no have div ,we will not display the video stream, just throw stream url');
          } else {


            var opendivparam = this._eventHandle.beforeOpenPreparePlayDiv(prototype, div, bWindowless, bHttpFlv);
            playObj = opendivparam.playObj;
            isNeedDelay = opendivparam.isNeedDelay;
          }

          var boverTcp = options.useoptions.bovertcp ? true : false;
          var sendCmd = this._eventHandle.sendOpenChanel;

          var dialog_param = jSWProtocol.BVCU_DialogParam(targetId, targetIndex, 0, prototype, options.media, 0, 0, boverTcp);
          var bstretch = options.useoptions.bstretch ? true : false;
          if (bstretch) {
            dialog_param.setBstretch(true);
          }
          if (bWindowless) {
            dialog_param.setBwindowless(true);
          }

          if (isNeedDelay) {
            setTimeout(function () { sendCmd(session, options, playObj, dialog_param); }, 500);
          } else {
            return sendCmd(session, options, playObj, dialog_param);
          }
          return jSW.RcCode.RC_CODE_S_OK;
        });
        return rc;
      },
      /**var options = {
          div: 'div_id', // div or div id
          prototype: 'auto', //rtmp > hls
          callback: function(options, response) {
              options = options;
              response = {
                  emms: emms,
                  request: request
              }
          },
          tag: Object,
          ismuti: false,
          bstretch: false,
          bwindowless: false
      };*/
      swOpenEx: function (options) {
        var dft_options = {
          callback: null,
          div: '',
          prototype: 'auto',
          media: jSW.MEDIADIR.VIDEORECV,
          bovertcp: false,
          tag: null,
          ismuti: false,
          bstretch: false,
          bwindowless: false,
          bHttpFlv: false
        };

        var uoptions = jSWUtils.extend({}, dft_options, options || {});

        if (uoptions.prototype == "httpflv") {
          uoptions.prototype = "rtmp";
          uoptions.bHttpFlv = true;
        }

        if (!this._eventHandle.checkMedia(uoptions.media)) {
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        if (!this._checkCanOpen(uoptions.ismuti)) {
          if (!options.ismuti) {
            console.log("current open chanel model is mutil open!");
          }
          var rc = jSW.RcCode.RC_CODE_E_ALREADYEXIST;
          console.log(jSW.RcCode.trans(rc));
          return jSW.RcCode.RC_CODE_E_ALREADYEXIST;
        }

        this._beginOpen();

        uoptions.div = this._getDesDiv(uoptions.div);
        if (uoptions.div == null) {
          console.warn('no have div ,we will not display the video stream, just throw stream url');
        }

        var result = this.swOpen({
          prototype: uoptions.prototype,
          tag: { div: uoptions.div, channel: this, userdata: uoptions.tag },
          useoptions: uoptions,
          media: uoptions.media,
          callback: this._eventHandle.onSwOpenExHasResult
        });

        if (jSW.RcCode.bFaild(result)) {
          this._endOpenHasResult(false);
        }
        return result;
      },

      _eventHandle: {
        getProtoType: function (optionsPT, bHttpFlv) {
          var ret = {
            rc: jSW.RcCode.RC_CODE_S_OK,
            prototype: -1
          };
          var prototype = -1;
          if (jSWOptions.calltype == jSW.CallProtoType.OCX) {
            prototype = jSWProtocol.ProtoType.OCX;
          }
          else {
            if ('hls' == optionsPT) {
              prototype = jSWProtocol.ProtoType.HLS;
            }
            else if ('rtmp' == optionsPT) {
              if (bHttpFlv || jSWUtils.supportFlash()) {
                prototype = jSWProtocol.ProtoType.RTMP;
              } else {
                console.error('not supported flash (rtmp)');
                ret.rc = jSW.RcCode.RC_CODE_E_UNSUPPORTED;
              }
            }
            else {
              if (bHttpFlv || jSWUtils.supportFlash()) {
                prototype = jSWProtocol.ProtoType.RTMP;
              } else {
                prototype = jSWProtocol.ProtoType.HLS;
              }
            }
          }

          ret.prototype = prototype;
          return ret;
        },
        sendOpenChanel: function (p_session, p_options, p_playObject, p_dialog_param) {
          if (p_playObject != null) {
            if (jSWProtocol.ProtoType.OCX == p_dialog_param.getProto()) {
              p_dialog_param.setHwnd(p_playObject.GetWMHwnd());
            }
            p_playObject.style.display = 'block';
            if (p_dialog_param.getBwindowless()) {
              p_dialog_param.setHplayhandle(p_playObject.GetWMHwnd());
            }
          }

          var open_param = jSWProtocol.JsonParamDialog(p_session._p_emms,
            proto.WEBBVCU.MSGType.WEB_BVCU_OPEN_CHANLE,
            p_dialog_param);

          var rc = jSWProtocol._internalSend({
            cmd: jSWProtocol.RequestHeader.openchanle.cmd,
            session: p_session,
            request: open_param,
            callback: p_options.callback,
            opt: p_options,
            tag: p_options.tag
          });
          return rc;
        },
        beforeOpenPreparePlayDiv: function (prototype, parentdiv, bWindowless, bHttpFlv) {
          var playObject = null;
          var isNeedDelay = false;

          /**隐藏播放器div, 防止重叠*/
          {
            if (typeof (parentdiv.bv_uuid) == "undefined") {
              parentdiv.bv_uuid = jSWUtils.generateUUID();
            }

            var objDivId = parentdiv.bv_uuid + '_0077553'; /**ID附属*/
            var objDiv = document.getElementById(objDivId);
            if (objDiv != null) {
              objDiv.style.display = 'none';
            }

            objDivId = parentdiv.bv_uuid + '_0077554'; /**ID附属*/
            objDiv = document.getElementById(objDivId);
            if (objDiv != null) {
              objDiv.style.display = 'none';
            }
          }

          if (jSWProtocol.ProtoType.HLS == prototype || jSWProtocol.ProtoType.RTMP == prototype) {
            var playObjectId = parentdiv.bv_uuid + '_0077553'; /**ID附属*/
            playObject = document.getElementById(playObjectId);
            if (playObject == null) {
              playObject = document.createElement('VIDEO');
              playObject.setAttribute('id', playObjectId);
              playObject.setAttribute('class', 'video-js vjs-default-skin vjs-big-play-centered');
              // playObject.setAttribute('poster', '/js/my_video_poster.png');
              playObject.style.width = '100%';
              playObject.style.height = '100%';
              playObject.style.display = 'block';
              parentdiv.appendChild(playObject);
            }
          }
          else if (jSWProtocol.ProtoType.OCX == prototype) {
            var playObjectId = parentdiv.bv_uuid + '_0077554'; /**ID附属*/
            var myTempDivId = playObjectId + "tempdiv";
            playObject = document.getElementById(playObjectId);
            if (playObject == null) {
              var mydiv = document.getElementById(myTempDivId);
              if (mydiv == null) {
                mydiv = document.createElement("div");
                mydiv.id = playObjectId + "tempdiv";
                mydiv.style.width = '100%';
                mydiv.style.height = '100%';
              }
              mydiv.style.display = 'block';
              parentdiv.appendChild(mydiv);
              playObject = document.createElement('object');
              playObject.id = playObjectId;
              if (bWindowless) {
                playObject.classid = 'clsid:0c85b239-904a-4adf-8424-f1928b38f12f';
              } else {
                playObject.classid = "clsid:CDE6C639-4BA8-4A09-81EB-DCE76A61FE98";
              }

              playObject.style.width = '100%';
              playObject.style.height = '100%';
              playObject.style.display = 'block';
              playObject.tag = this;
              mydiv.appendChild(playObject);
              isNeedDelay = true;

              var playeventid = playObjectId + "ocxeventid"
              var oScript = document.getElementById(playeventid);
              if (oScript == null) {
                oScript = document.createElement("script");
                oScript.id = playObjectId + "ocxeventid";
                oScript.type = "text/javascript";
                oScript.setAttribute('for', playObjectId);
                oScript.setAttribute('event', 'OnHwndEvent(hwnd, ieventtype, pParam)');
                oScript.text = 'jSW._swOcxPlayerOnEvent(ieventtype, this.tag);';
                document.body.appendChild(oScript);
              }
            }
          }
          return {
            playObj: playObject,
            isNeedDelay: isNeedDelay
          };
        },
        onSwOpenExHasResult: function (options, response, dlgparam) {
          var payload = response.getPayload();
          var openDialogResponse = proto.WEBBVCU.Open_Dialog_Response.deserializeBinary(payload);

          var videoChannel = options.tag.channel;
          var userdata = options.tag.userdata;
          var url = '';
          var payloadRequest = options.request.getPayload();
          var requestParam = proto.WEBBVCU.BVCU_DialogParam.deserializeBinary(payloadRequest);
          var hdlg = -1;
          var bSuccess = jSW.RcCode.bSuccess(response.getCode());
          var tprototype = requestParam.getProto();
          var bHttpFlv = options.opt.useoptions.bHttpFlv;
          if (bHttpFlv) {
            var httpFlvHandle = jSW.DependencyMgr.GetModule("HttpFlv");
          }

          if (openDialogResponse.hasUrl()) {
            url = openDialogResponse.getUrl();
          }

          var dialogparams = null;

          if (bSuccess) {
            if (openDialogResponse.hasHdlg()) {
              hdlg = openDialogResponse.getHdlg();
              dlgparam.setParams(options.tag.div, hdlg, requestParam.getMedia(), tprototype);
              videoChannel._pushCommDlg(dlgparam);
            }

            if (options.session != null) {
              var puid = requestParam.getId();
              var major = requestParam.getMajor();
              var chanel = videoChannel;
              if (chanel != null) {
                var urlCurrent;
                if (tprototype == jSWProtocol.ProtoType.HLS) {
                  urlCurrent = jSWOptions.http + url;
                } else if (tprototype == jSWProtocol.ProtoType.RTMP) {
                  if (bHttpFlv) {
                    urlCurrent = httpFlvHandle.buildUrlFromRtmpUrl(jSWOptions.ip + ":" + jSWOptions.port, url);
                  } else {
                    urlCurrent = "rtmp://" + jSWOptions.ip + url;
                  }
                }
                chanel._url_chanel = {
                  proto: chanel.swSrcType(),
                  url: urlCurrent
                }
              }
            }

            if (options.tag.div != null && !bHttpFlv &&
              (tprototype == jSWProtocol.ProtoType.HLS ||
                tprototype == jSWProtocol.ProtoType.RTMP)) {

              // rtmp、hls 在给定的div中添加播放器div
              var div = options.tag.div;
              var playObjectId = div.bv_uuid + '_0077553'; /**ID附属*/
              if (document.getElementById(playObjectId) == null) {
                console.error('not have player');
                return;
              }

              var live_hls = null;
              var live_rtmp = null;

              if (tprototype == jSWProtocol.ProtoType.HLS) {
                live_hls = jSWOptions.http + url;
              } else if (tprototype == jSWProtocol.ProtoType.RTMP) {
                live_rtmp = "rtmp://" + jSWOptions.ip + url;
              }

              var player = videojs(playObjectId, {
                controlBar: false, controls: false
              }, function () {
                if (tprototype == jSWProtocol.ProtoType.HLS) {
                  this.src({ type: 'application/vnd.apple.mpegurl', src: live_hls });
                } else if (tprototype == jSWProtocol.ProtoType.RTMP) {
                  this.src({ type: "rtmp/flv", src: live_rtmp });
                }

                this.play();
              });

              if (videoChannel != null) {
                videoChannel._OnNeedSaveVideoPlayer(player);
              }
            }
            else if (bHttpFlv) {
              httpFlvHandle.CreatePlayer(options.tag.div, urlCurrent, dlgparam);
            }
            else if (tprototype == jSWProtocol.ProtoType.OCX) {
              dialogparams = {
                hdlg: dlgparam._hDlg
              };
            }
          } else {
          }

          var orgopt = options.opt;
          if (orgopt && orgopt.useoptions) {
            if (typeof orgopt.useoptions.callback === 'function') {
              orgopt.useoptions.tag = userdata;
              orgopt.useoptions.callback(orgopt.useoptions, response, dialogparams);
            }
          }

          if (orgopt && orgopt.useoptions && orgopt.useoptions.chanel) {
            orgopt.useoptions.chanel.m_live_hls = live_hls;
            orgopt.useoptions.chanel.m_live_rtmp = live_rtmp;
            orgopt.useoptions.chanel.m_live_httpflv = urlCurrent;
          }

          if (videoChannel) {
            videoChannel._endOpenHasResult(bSuccess);
          }
        },
        afterCloseDlgClearResource: function (parentdiv) {
          if (parentdiv) {
            var playObjectId = parentdiv.bv_uuid + '_0077553'; /**ID附属*/
            var myTempDiv = document.getElementById(playObjectId + "tempdiv");
            var playObject = document.getElementById(playObjectId);
            if (playObject != null) {
              playObject.parentNode.removeChild(playObject);
              if (myTempDiv != null) {
                myTempDiv.parentNode.removeChild(myTempDiv);
              }
            }

            if (typeof videojs != "undefined") {
              try {
                var player = videojs(playObjectId);
                if (player) {
                  player.dispose();
                  this._videoPlayer = null;
                }
              } catch (e) {
                //console.warn(e.message);
              }
            }

            playObjectId = parentdiv.bv_uuid + '_0077554'; /**ID附属*/
            playObject = document.getElementById(playObjectId);
            myTempDiv = document.getElementById(playObjectId + "tempdiv");
            if (playObject != null) {
              playObject.parentNode.removeChild(playObject);
            }

            if (myTempDiv != null) {
              myTempDiv.parentNode.removeChild(myTempDiv);
            }

            var ocxeventid = playObjectId + "ocxeventid";
            var eleocxevent = document.getElementById(ocxeventid);
            if (eleocxevent) {
              eleocxevent.parentNode.removeChild(eleocxevent);
            }
          }
        },
        _checkMedia: function (srcMedia, szMedia) {
          var iMaskMedia = 0;
          for (var iindex in szMedia) {
            iMaskMedia |= szMedia[iindex];
          }
          if (srcMedia | iMaskMedia == iMaskMedia) {
            return true;
          }
          return false;
        },
        checkMedia: function (srcMedia) {
          var bresult = false;
          if (jSWOptions.CheckOcx()) {
            bresult = this._checkMedia(srcMedia, [jSW.MEDIADIR.VIDEORECV, jSW.MEDIADIR.AUDIORECV]);
          } else {
            bresult = this._checkMedia(srcMedia, [jSW.MEDIADIR.VIDEORECV]);
          }
          if (!bresult) {
            console.log("the media dir you want to view is not support");
          }
          return bresult;
        }
      },

      /*
          var options = {
              volume: {
                  icapture: ,
                  iplay: 
              },
              callback: function(options, response){
              },
              tag: tag
          }
      */
      swAlterVolume: function (options) {
        var rc = this._intercom._volumeProxy(function (volume, hdlg) {
          if (options.volume === undefined) {
            return jSW.RcCode.RC_CODE_E_BVCU_INVALIDARG;
          }

          if (options.volume.icapture < 0 || options.volume.icapture > 100 ||
            options.volume.iplay < 0 || options.volume.iplay > 100) {
            return jSW.RcCode.RC_CODE_E_BVCU_INVALIDARG;
          }

          var payload = new proto.WEBBVCU.BVCU_DialogControlParam_Render();
          payload.setIplackbackvolume(options.volume.iplay);
          payload.setIcapturevolume(options.volume.icapture);


          var rc = this._commSendProxy(options, function () {
            return {
              payload: payload,
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_ALTER_VIDEO_VOLUME,
              cmd: "swAlterVolume",
              hdlg: hdlg,
            };
          });

          return rc;
        }, this);

        return rc;
      },


      onAlterVolumeOk: function (volume) {
        this._intercom.setVolume(volume);
      },

      /*
          options: {
              callback: function(options, response, data){
                  data:{
                      icapture: 0,
                      iplay: 0
                  }
              },
              tag: tag
          }
      */
      swGetVolume: function (options) {
        var _valume = null;

        var rc = this._intercom._volumeProxy(function (volume, hdlg) {
          _valume = volume;
          return jSW.RcCode.RC_CODE_S_OK;
        }, this);

        if (jSW.RcCode.bSuccess(rc)) {
          var opts = {
            tag: options.tag
          };
          var response = {
            emms: {
              code: jSW.RcCode.RC_CODE_S_OK
            }
          };
          setTimeout(options.callback, 50, opts, response, _valume);
        }
        console.log("on get volume ok");
        return rc;
      },

      onIntercomOpenOk: function (bresult, imedir, hDlg) {
        this._intercom.onOpenHasResult(bresult, imedir, hDlg);
      },
      onIntercomCloseOK: function (bresult) {
        this._intercom.onCloseHasResult(bresult);
      },
      onAlterMedirDirOk: function (isvideo, imedir, hdlg) {
        if (isvideo) {
          var commDlg = this._commDlgMgr.get(hdlg);
          if (commDlg) {
            commDlg.onMediaChange(imedir);
          }
        } else {
          this._intercom.onAlterHasResult(imedir);
        }
      },

      /*
          打开音频对讲
          options:
          {
              callback: funtion(options, response)
              {
                  
              },
              tag: Object
          }
      */
      swOpenIntercom: function (options) {
        var rc = this._intercom._openProxy(function (imedia) {
          var dft_options = {
            isSendAudio: true,
            isRecvAudio: true,
            callback: null,
            tag: null
          };
          options = jSWUtils.extend({}, dft_options, options || {});

          var medir = (options.isSendAudio ? jSW.MEDIADIR.AUDIOSEND : jSW.MEDIADIR.ALLNULL)
            + (options.isRecvAudio ? jSW.MEDIADIR.AUDIORECV : jSW.MEDIADIR.ALLNULL);

          var payload = new proto.WEBBVCU.CommonData();
          payload.setIdata1(medir);

          return this._commSendProxy(options, function () {
            var dftData = {
              payload: payload,
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_OPEN_INTERCOM,
              cmd: "",
              hdlg: -1
            };
            return dftData;
          });

          return rc;
        }, this);
        return rc;
      },

      swCloseIntercom: function (options) {
        var rc = this._intercom._closeProxy(function (hdlg) {
          return this._commSendProxy(options, function () {
            var dftData = {
              payload: null,
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_CLOSE_INTERCOM,
              cmd: "",
              hdlg: hdlg
            };
            return dftData;
          });
        }, this);
        return rc;
      },

      //修改音媒体流方向
      swAlterAudioDir: function (options) {
        var rc = this._intercom._alterProxy(function (imedia, hdlg) {

          var dftRecvAudio = (imedia & jSW.MEDIADIR.AUDIORECV) == jSW.MEDIADIR.AUDIORECV;
          var dftSendAudio = (imedia & jSW.MEDIADIR.AUDIOSEND) == jSW.MEDIADIR.AUDIOSEND;

          var dft_options = {
            isSendAudio: dftSendAudio,
            isRecvAudio: dftRecvAudio,
            callback: null,
            tag: null
          };

          options = jSWUtils.extend({}, dft_options, options || {});

          if (options.isRecvAudio == dftRecvAudio && options.isSendAudio == dftSendAudio) {
            console.log("i dont't think you should alter video dir, current status is you wished!");
            return jSW.RcCode.RC_CODE_S_OK;
          }

          var imedir = (options.isRecvAudio ? jSW.MEDIADIR.AUDIORECV : jSW.MEDIADIR.ALLNULL)
            + (options.isSendAudio ? jSW.MEDIADIR.AUDIOSEND : jSW.MEDIADIR.ALLNULL);
          var payload = new proto.WEBBVCU.CommonData();
          payload.setIdata1(imedir);

          return this._commSendProxy(options, function () {
            var dftData = {
              payload: payload,
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_ALTER_AUDIO_DIALOG_DIR,
              cmd: "",
              hdlg: hdlg
            };
            return dftData;
          });

        }, this);

        return rc;
      },

      swBIsIntercomOpened: function () {
        return this._intercom.bIsOpen();
      },

      //修改视频媒体流方向
      //hdlg  
      swAlterVideoDir: function (options) {
        if (jSW.CallProtoType.OCX != jSWOptions.calltype) {
          console.error("only ocx support Alert, right now!");
          return jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        }

        var rc = this._autoDlgProxy(options, function (commDlg) {
          if (commDlg == null) {
            return jSW.RcCode.RC_CODE_E_NOTFOUND;
          }
          var curMedia = commDlg.getMedia();

          var dftRecvVideo = (curMedia & jSW.MEDIADIR.VIDEORECV) == jSW.MEDIADIR.VIDEORECV;
          var dftRecvAudio = (curMedia & jSW.MEDIADIR.AUDIORECV) == jSW.MEDIADIR.AUDIORECV;
          var dft_options = {
            isRecvAudio: dftRecvAudio,
            isRecvVideo: dftRecvVideo,
            div: null,
            callback: null,
            tag: null,
            hDlg: -1
          };

          options = jSWUtils.extend({}, dft_options, options || {});

          if (options.isRecvAudio == dftRecvAudio && options.isRecvVideo == dftRecvVideo) {
            console.log("i dont't think you should alter video dir, current status is your wished!");
            return jSW.RcCode.RC_CODE_S_OK;
          }

          var medir = (options.isRecvAudio ? jSW.MEDIADIR.AUDIORECV : jSW.MEDIADIR.ALLNULL)
            + (options.isRecvVideo ? jSW.MEDIADIR.VIDEORECV : jSW.MEDIADIR.ALLNULL);

          var payload = new proto.WEBBVCU.CommonData();
          payload.setIdata1(medir);

          options = jSWUtils.extend({}, dft_options, options || {});

          var rc = this._autoDlgSendProxy(options, function (data) {
            return {
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_ALTER_VIDEO_DIALOG_DIR,
              payload: payload,
              cmd: jSWProtocol.RequestHeader.altervideodir.cmd
            };
          });

          return rc;
        });
        return rc;
      },

      /*
         options={
             hdlg: hdlg,
             callbakc: function(sender, response, data){
             },
             tag: Object
         }
 
         data: {
              szpath:String,
              ifileleninseconds:Number(秒)
         }
     */
      swGetLocalRecord: function (options) {
        if (jSWOptions.CheckNotOcx()) {
          console.error("only ocx support local record");
          return jSW.RcCode.RC_CODE_E_FAIL;
        }

        var rc = this._autoDlgSendProxy(options, function () {
          var dftData = {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_LOCAL_RECORD,
          };
          return dftData;
        });

        return rc;
      },

      /*
          options={
              hdlg: hdlg
              szpath:String,
              ifileleninseconds:Number(秒),
              callbak: function(sender, response, data){
              },
              recordCallback: null,
              tag: Object
          }
      */
      swSetLocalRecord: function (options) {
        if (jSWOptions.CheckNotOcx()) {
          console.error("only ocx support local record");
          return RC_CODE_E_FAIL;
        }

        var dft_options = {
          szpath: "",
          ifileleninseconds: -1,
          callbak: null,
          recordCallback: null,
          tag: null
        };
        options = jSWUtils.extend({}, dft_options, options || {});

        var payload = new proto.WEBBVCU.LocalStorage();
        payload.setDir(jSWUtils.string2Uint8Array(options.szpath));
        payload.setIfileleninseconds((Number)(options.ifileleninseconds));
        this._callbackAfterRecordHasResult = options.recordCallback;

        var rc = this._autoDlgSendProxy(options, function () {
          var dftData = {
            payload: payload,
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_LOCAL_RECORD,
          };
          return dftData;
        });

        return rc;
      },

      /*
          options={
              istart:Number,
              ilength:Number(秒),
              callback: function(sender, response){
              },
              tag: Object
          }
      */
      swSetNruRecord: function (options) {

        var dft_options = {
          istart: 0,
          ilength: -1,
          imediadir: 0,
          callbak: null,
          recordCallback: null,
          tag: null
        };
        options = jSWUtils.extend({}, dft_options, options || {});

        var payload = new proto.BVCU.NRUConfig.ManualRecord();
        payload.setSzid(this._parent._id_pu);
        payload.setIchannelindex(this._id_chanel);
        payload.setBstart(options.istart);
        payload.setIlength(options.ilength);
        payload.setImediadir(options.imediadir);
        //this._callbackAfterRecordHasResult = options.recordCallback;

        var rc = jSWProtocol.SendRequest({
          session: this._parent._parent,
          payload: payload,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_SUBMETHOD_NRU_MANUALRECORD,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swGetUrl: function () {
        return this._url_chanel;
      },

      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'snapshot',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  url: url
              }
          },
          tag: userdata
      };*/
      swSnapshot: function (options) {
        var dft_options = {
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var rc = this._autoDlgSendProxy(options, function () {
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_SNAPSHOT
          };
        });

        return rc;
      },

      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'getptzattr',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  url: url
              }
          },
          tag: userdata
      };*/
      swGetPtzAttr: function (options) {
        if (null == this._parent && this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var dft_options = {
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var session = this._parent._parent;

        var bvcuCmd = new jSWProtocol.BVCU_Command(this._parent._id_pu, this._id_chanel);

        var getPtzAttrCmd = jSWProtocol.RequestHeader.getptzattr;
        var getptzattr_param = new jSWProtocol.JsonParamCommand(session._p_emms, getPtzAttrCmd.requestHeader, bvcuCmd);

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.getptzattr.cmd,
          session: session,
          cmd: getPtzAttrCmd.cmd,
          request: getptzattr_param,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },


      swSetPtzAttr: function (options) {

      },

      /**var options = {
          ptzCtrl:{
              iPTZCommand: 0,
              bStop: 0,
              iParam1: 0,
              iParam2: 0,
              iParam3: 0
          },
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'ptzctrl',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request
              }
          },
          tag: userdata
      };*/
      swPtzCtrl: function (options) {
        if (null == this._parent && this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }



        var dft_options = {
          ptzCtrl: {
            iPTZCommand: 0,
            bStop: 1,
            iParam1: 0,
            iParam2: 0,
            iParam3: 0
          },
          callback: null,
          tag: null
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var session = this._parent._parent;

        var ptz = new proto.BVCU.PUConfig.PTZControl();

        ptz.setIptzcommand(options.ptzCtrl.iPTZCommand);
        ptz.setBstop(options.ptzCtrl.bstop);
        ptz.setIparam1(options.ptzCtrl.iparam1);
        ptz.setIparam2(options.ptzCtrl.iparam2);
        ptz.setIparam3(options.ptzCtrl.iparam3);

        var bvcuCmd = new jSWProtocol.BVCU_Command(this._parent._id_pu, this._id_chanel, ptz);

        var ptzCtrl_param = new jSWProtocol.JsonParamCommand(session._p_emms, proto.WEBBVCU.MSGType.WEB_BVCU_SET_PTZ, bvcuCmd);

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.ptzctrl.cmd,
          session: session,
          request: ptzCtrl_param,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      _swKeepLiveDlg: function (commDlg) {
        var opts = commDlg.getOpts();
        var rc = this._autoDlgSendProxy(opts, function () {
          return {
            msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_KEEPALIVE,
            payload: null,
            cmd: jSWProtocol.RequestHeader.keeplive.cmd
          };
        });
        console.log('keeplive chanel: ' + commDlg.getInfo());
        return rc;
      },

      swKeepLive: function () {
        this._commDlgMgr.each(this._swKeepLiveDlg, this);

        this._intercom._keep_alive(function (hdlg) {
          var opts = { hdlg: hdlg };
          this._commSendProxy(opts, function () {
            return {
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_KEEPALIVE,
              payload: null,
              cmd: jSWProtocol.RequestHeader.keeplive.cmd
            };
          });
        }, this);
      },

      swHide: function (opts) {
        this._autoDlgProxy(opts, function (commDlg, session, targetid, targetindex) {
          var mdiv = commDlg.getPlayDiv();
          var playObjectId = mdiv + '_0077553'; /**ID附属*/

          try {
            if (videojs && typeof videojs != "undefined") {
              var player = videojs(playObjectId);
              if (player) {
                player.dispose();
              }
            }
          } catch (e) {
            //console.warn(e.message);
          }

          var playObject = document.getElementById(playObjectId);
          if (playObject != null) {
            playObject.style.display = 'none';
          }

          // ocx
          playObjectId = mdiv.bv_uuid + '_0077554'; /**ID附属*/
          playObject = document.getElementById(playObjectId);
          if (playObject != null) {
            playObject.style.display = 'none';
          }
          return jSW.RcCode.RC_CODE_S_OK;
        });
        return jSW.RcCode.RC_CODE_S_OK;
      },

      swShow: function (opts) {
        this._autoDlgProxy(opts, function (commDlg, session, targetid, targetindex, hdlg) {
          var mdiv = commDlg.getPlayDiv();
          var prototype = commDlg.getProteType();
          if (prototype == jSWProtocol.ProtoType.HLS || prototype == jSWProtocol.ProtoType.RTMP) {
            var playObjectId = mdiv.bv_uuid + '_0077553'; /**ID附属*/
            var playObject = document.getElementById(playObjectId);
            if (playObject != null) {
              playObject.style.display = 'block';
            } else {
              playObject = document.createElement('VIDEO');
              playObject.setAttribute('id', playObjectId);
              playObject.setAttribute('class', 'video-js vjs-default-skin vjs-big-play-centered');
              // playObject.setAttribute('poster', '/js/my_video_poster.png');
              playObject.style.width = '100%';
              playObject.style.height = '100%';
              playObject.style.display = 'block';

              mdiv.appendChild(playObject);
            }


            try {
              var chanel = this;
              var player = videojs(playObjectId, {
                controlBar: false, controls: false
              }, function () {
                if (prototype == jSWProtocol.ProtoType.HLS) {
                  this.src({ type: 'application/vnd.apple.mpegurl', src: chanel.m_live_hls });
                } else if (prototype == jSWProtocol.ProtoType.RTMP) {
                  this.src({ type: "rtmp/flv", src: chanel.m_live_rtmp });
                }
                this.play();
              });
            } catch (e) {
              console.warn(e.message);
            }
          } else if (prototype == jSWProtocol.ProtoType.OCX) {
            // ocx
            playObjectId = mdiv.bv_uuid + '_0077554'; /**ID附属*/
            playObject = document.getElementById(playObjectId);
            if (playObject != null) {
              playObject.style.display = 'block';
            }
            setTimeout(this._updateDialog.bind(this), 500, hdlg);
          }
        });
      },

      _clear: function () {
        this._commDlgMgr.each(function (commdlg, chanel) {
          chanel.swClose(commdlg.getHDlg());
        }, this);
      },

      swClose: function (hdlg) {
        var opts = { hdlg: hdlg };
        var rc = this._autoDlgSendProxy(opts,
          function (commDlg) {
            var dlgparma = commDlg.getDlgParams();
            var httpflvHandle = jSW.DependencyMgr.GetModule("HttpFlv");
            httpflvHandle.ClosePlayer(commDlg);
            return {
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_CLOSE_CHANLE,
              payload: dlgparma,
              cmd: jSWProtocol.RequestHeader.closechanle.cmd
            };
          },
          function (commDlg) {
            var desplaydiv = commDlg.getPlayDiv();
            this._eventHandle.afterCloseDlgClearResource(desplaydiv);
            this._commDlgMgr.free(commDlg.getHDlg());
            this._closeHasResult(true);
            console.log('close chanel: ' + commDlg.getInfo());
          }
        );
        return rc;
      },

      compare: function (objChanel) {
        if (this._parent.compare(objChanel._parent)) {
          return (this._id_chanel == objChanel._id_chanel);
        }
        return false;
      }
    };

    jSW.SWVideoChanel.InterComStatus = function () {
      this._status = jSW.SWVideoChanel.InterComStatus.Types.INIT;
    }

    jSW.SWVideoChanel.InterComStatus.Types = {
      INIT: 0,
      DOING: 1,
      DONE: 2
    };

    jSW.SWVideoChanel.InterComStatus.prototype = {
      reset: function () {
        this._status = jSW.SWVideoChanel.InterComStatus.Types.INIT;
      },
      setDoing: function () {
        this._status = jSW.SWVideoChanel.InterComStatus.Types.DOING;
      },
      setDone: function () {
        this._status = jSW.SWVideoChanel.InterComStatus.Types.DONE;
      },
      bInit: function () {
        return jSW.SWVideoChanel.InterComStatus.Types.INIT == this._status;
      },
      bDoing: function () {
        return jSW.SWVideoChanel.InterComStatus.Types.DOING == this._status;
      },
      bDone: function () {
        return jSW.SWVideoChanel.InterComStatus.Types.DONE == this._status;
      }
    }

    jSW.SWVideoChanel.InterCom = function (channel) {
      this.status = new jSW.SWVideoChanel.InterComStatus();
      this._commDlg = new jSW.CommonDlg(channel);
      this._channel = channel;
      this._volume = {
        icapture: 50,
        iplay: 50
      };
    }

    jSW.SWVideoChanel.InterCom.prototype = {
      _getCurMedia: function () {
        return this._commDlg.getMedia();
      },
      _getHdlg: function () {
        return this._commDlg.getHDlg();
      },
      _openProxy: function (handle, scope) {
        if (!jSWOptions.CheckOcx()) {
          console.log("only ocx support intercom");
          return jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        }
        var rc = jSW.RcCode.RC_CODE_E_FAIL;
        if (this.status.bDone()) {
          console.log("intercom has opened, can not be open twice! you can call swAlterAudioDir to change medir dir or close it try again!");
          return jSW.RcCode.RC_CODE_E_ALREADYEXIST;
        } else if (this.status.bDoing()) {
          return jSW.RcCode.RC_CODE_E_BUSY;
        } else {
          this.status.setDoing();
          rc = handle.bind(scope)(this._getCurMedia());
          if (jSW.RcCode.bFaild(rc)) {
            this.status.reset();
          }
          return rc;
        }
      },

      _closeProxy: function (handle, scope) {
        if (!jSWOptions.CheckOcx()) {
          console.log("only ocx support intercom");
          return jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        }

        var rc = jSW.RcCode.RC_CODE_E_FAIL;
        if (this.status.bInit()) {
          return jSW.RcCode.RC_CODE_E_NOTFOUND;
        } else if (this.status.bDoing()) {
          return jSW.RcCode.RC_CODE_E_BUSY;
        } else {
          this.status.setDoing();
          rc = handle.bind(scope)(this._getHdlg());
          if (jSW.RcCode.bFaild(rc)) {
            this.status.setDone();
          }
          return rc;
        }
      },
      _alterProxy: function (handle, scope) {
        if (!jSWOptions.CheckOcx()) {
          console.log("only ocx support intercom");
          return jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        }

        var rc = jSW.RcCode.RC_CODE_E_FAIL;
        if (this.status.bInit()) {
          return jSW.RcCode.RC_CODE_E_NOTFOUND;
        } else if (this.status.bDoing()) {
          return jSW.RcCode.RC_CODE_E_BUSY;
        } else {
          rc = handle.bind(scope)(this._getCurMedia(), this._getHdlg());
          if (jSW.RcCode.bFaild(rc)) {
          }
          return rc;
        }
      },
      _volumeProxy: function (handle, scope) {
        if (!jSWOptions.CheckOcx()) {
          console.log("only ocx support intercom");
          return jSW.RcCode.RC_CODE_E_UNSUPPORTED;
        }
        var rc = jSW.RcCode.RC_CODE_E_FAIL;
        if (this.status.bInit()) {
          return jSW.RcCode.RC_CODE_E_NOTFOUND;
        } else if (this.status.bDoing()) {
          return jSW.RcCode.RC_CODE_E_BUSY;
        } else {
          rc = handle.bind(scope)(this.__getVolume(), this._getHdlg());
          if (jSW.RcCode.bFaild(rc)) {
          }
          return rc;
        }
      },

      __getVolume: function () {
        var volume = {
          icapture: this._volume.icapture,
          iplay: this._volume.iplay
        };
        return volume;
      },

      setVolume: function (volume) {
        this._volume = {
          icapture: volume.icapture,
          iplay: volume.iplay
        };
      },

      _clear: function (handle, scope) {
        if (this.status.bDone()) {
          handle.bind(scope)(this._getHdlg());
          this._reset();
        }
      },
      _keep_alive: function (handle, scope) {
        if (this.status.bDone()) {
          handle.bind(scope)(this._getHdlg());
        }
      },
      _reset: function () {
        this.status.reset();
        this._commDlg._reset();
      },
      onAlterHasResult: function (imedia) {
        this._commDlg.onMediaChange(imedia);
        this.status.setDone();
      },
      onOpenHasResult: function (bresult, iMedia, hDlg) {
        if (bresult) {
          this._commDlg.onMediaChange(iMedia);
          this._commDlg.setHdlg(hDlg);
          this.status.setDone();
        } else {
          this._reset();
        }
      },
      onCloseHasResult: function (bresult) {
        this._reset();
      },
      bIsOpen: function () {
        return this.status.bDone();
      }
    };



    // ---- SWGPSChanel  GPS通道 ----
    jSW.SWGPSChanel = function (parent, options) {
      this._parent = parent;
      this._info_chanel = {
        id: options.getIchannelindex(),
        name: options.getSzname(),
        ptz: options.getIptz(),
        media: options.getImediadir() >> 10,
        status: options.getImediadir() & 0x000003ff
      };
      this._id_chanel = this._info_chanel.id;
      this._name_chanle = this._info_chanel.name;
    };

    jSW.SWGPSChanel.prototype = {
      _parent: null,
      _id_chanel: null,
      _name_chanel: null,
      _info_chanel: null,
      m_is_open: false,

      swClose: function () {
        this.m_is_open = false;
        return jSW.RcCode.RC_CODE_S_OK;
      },

      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'login',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  gps: BVCU_PUCFG_GPSData
              }
          },
          tag: userdata,
          repeat: 3, // 重复次数， -1表示无限
          interval: 5000 // 间隔， 单位毫秒
      };*/
      swOpen: function (options) {
        if (null == this._parent || null == this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        this.m_is_open = true;

        var session = this._parent._parent;

        var pugpsdataCmd = jSWProtocol.RequestHeader.pugpsdata;

        var open_param = new jSWProtocol.JsonParamCommand(session._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_GET_PUGPSDATA,
          jSWProtocol.BVCU_Command(this._parent._id_pu, this._id_chanel, null));

        var dft_options = {
          callback: null,
          tag: null,
          repeat: 1,
          interval: 5000
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var callback_send = function (pPptions, pThis) {
          var isSend = false;
          if (pPptions.repeat == -1) {
            isSend = true;
          } else {
            if (pPptions.repeat > 0) {
              pPptions.repeat = pPptions.repeat - 1;
              isSend = true;
            }
          }


          if (isSend && pThis._parent._arr_gps[0].m_is_open) {
            jSWProtocol._internalSend({
              cmd: jSWProtocol.RequestHeader.openchanletsp.cmd,
              session: session,
              cmd: pugpsdataCmd.cmd,
              request: open_param,
              callback: pPptions.callback,
              tag: pPptions.tag
            });

            setTimeout(function () { callback_send(pPptions, pThis) }, pPptions.interval);
          }
        };

        callback_send(options, this);

        return jSW.RcCode.RC_CODE_S_OK;
      },

      /*
          options = {
              callback: function(options, response, data){
                  data = {
                      
                  }
              },
              tag: Object
          }
      */
      swGetGpsAttr: function (options) {
        var rc = jSWProtocol.SendRequest({
          session: this._parent._parent,
          msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_GET_PU_GPS,
          target: this._parent._id_pu,
          targetIndex: this._id_chanel,
          callback: options.callback,
          tag: options.tag
        });
        return rc;
      },

      /*
          options = {
              isenable: Number(0 关闭/ 1 开启),
              callback: function(sender, response, data){
              },
              tag: Object
          }
      */
      swSetPuGpsAttr: function (options) {
        return this.swGetGpsAttr({
          chanelid: options.chanelid,
          callback: function (sender, response, data) {
            var payload = new proto.BVCU.PUConfig.GPSParam();
            var tag = sender.tag;
            var option = tag.options;
            payload.setBenable(option.isenable);
            payload.setIsetupsatellitesignal(data.isetupsatellitesignal);
            payload.setIreportinterval(data.ireportinterval);
            payload.setIreportdistance(data.ireportdistance);

            var rc = jSWProtocol.SendRequest({
              session: tag.session,
              msgtype: proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_GPS,
              target: tag.puid,
              targetIndex: this._id_chanel,
              payload: payload,
              callback: options.callback,
              tag: tag.options.tag
            });

            return rc;
          },
          tag: {
            session: this._parent._parent,
            options: options,
            puid: this._parent._id_pu
          }
        });
      }
    };




    // ---- SWTSPChanel  串口通道----
    jSW.SWTSPChanel = function (parent, options) {
      this._parent = parent;
      this._info_chanel = {
        id: options.getIchannelindex(),
        name: options.getSzname(),
        ptz: options.getIptz(),
        media: options.getImediadir() >> 10,
        status: options.getImediadir() & 0x000003ff
      };
      this._id_chanel = this._info_chanel.id;
      this._name_chanle = this._info_chanel.name;
    };

    jSW.SWTSPChanel.prototype = {
      _parent: null,
      _id_chanel: null,
      _name_chanel: null,
      _info_chanel: null,

      swClose: function () {
        if (null == this._parent || null == this._parent._parent) {
          console.warn('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var session = this._parent._parent;

        var dialog_param = jSWProtocol.BVCU_DialogParam(this._parent._id_pu, this._id_chanel, 0, jSWProtocol.ProtoType.OTHER, 0);
        var closechanle_param = jSWProtocol.JsonParamDialog(session._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_CLOSE_CHANLE,
          dialog_param);

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.closechanle.cmd,
          session: session,
          request: closechanle_param
        });

        console.log('close chanel: ' + this._parent._id_pu + ' ' + this._id_chanel);
        return rc;
      },

      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'login',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  gps: BVCU_PUCFG_GPSData
              }
          },
          tag: userdata,
      };*/
      swOpen: function (options) {
        if (null == this._parent || null == this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var session = this._parent._parent;

        var dialog_param = jSWProtocol.BVCU_DialogParam(this._parent._id_pu, this._id_chanel, 0, jSWProtocol.ProtoType.OTHER, 0);
        var open_param = jSWProtocol.JsonParamDialog(session._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_OPEN_CHANLE_TSP,
          dialog_param);

        var dft_options = {
          callback: null,
          tag: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.openchanletsp.cmd,
          session: session,
          request: open_param,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      /**var options = {
          callback: function(options, response) {
              options = {
                  session: session,
                  cmd: 'login',
                  request: param,
                  callback: callback,
                  tag: tag
              }
              response = {
                  emms: emms,
                  request: request,
                  gps: BVCU_PUCFG_GPSData
              }
          },
          data: write data,
          tag: user data,
      };*/
      swWrite: function (options) {
        if (null == this._parent || null == this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }
        if (options.data == null) {
          console.error('write data is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var session = this._parent._parent;

        var dialog_param = new proto.WEBBVCU.Notify_TSP_Data();
        dialog_param.setTargetid(this._parent._id_pu);
        dialog_param.setTargetindex(this._id_chanel);

        if (options.data instanceof Uint8Array) {
        }
        else if (options.data instanceof Array) {
          var desszdata = new Uint8Array(options.data.length);
          var datatemp = null;
          var idatatemp = 0;
          for (iiteindex in options.data) {
            datatemp = options.data[iiteindex];
            datatemp = datatemp.replace("0x", "");
            desszdata[iiteindex] += Number(datatemp.charAt(0)) * 16;
            desszdata[iiteindex] += Number(datatemp.charAt(1));
          }
          options.data = desszdata;
        }
        else {
          options.data = jSWUtils.string2Uint8Array(options.data);
        }

        dialog_param.setData(options.data);

        var write_param = jSWProtocol.JsonParamTSPDialog(session._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_WRITE_CHANLE_TSP,
          dialog_param);

        var dft_options = {
          callback: null,
          data: null,
          tag: null,
        };

        options = jSWUtils.extend({}, dft_options, options || {});

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.writechanletsp.cmd,
          session: session,
          request: write_param,
          callback: options.callback,
          tag: options.tag
        });

        return rc;
      },

      swKeepLive: function () {
        if (null == this._parent && this._parent._parent) {
          console.error('internal error, this._parent is null');
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }

        var session = this._parent._parent;

        var dialog_param = new jSWProtocol.BVCU_DialogParam(this._parent._id_pu, this._id_chanel, 0, jSWProtocol.ProtoType.OTHER, 0);
        var keeplive_param = new jSWProtocol.JsonParamDialog(session._p_emms,
          proto.WEBBVCU.MSGType.WEB_BVCU_KEEPALIVE,
          dialog_param);

        var rc = jSWProtocol._internalSend({
          cmd: jSWProtocol.RequestHeader.keeplivechanle.cmd,
          session: session,
          request: keeplive_param
        });

        console.log('keeplive tsp chanel: ' + dialog_param.getId() + ' ' + dialog_param.getMajor());
        return rc;
      },

      compare: function (objChanel) {
        if (this._parent.compare(objChanel._parent)) {
          return (this._id_chanel == objChanel._id_chanel);
        }

        return false;
      },
    };


    // ---- SWPlayer  播放器, 录像回放----
    jSW.SWPlayer = function (parent, options) {
      this._parent = parent;

      this._nru_id = options.nruId;
      this._file = options.file;
      this._dialog_id = options.dialogId;
      this._parent_div = options.parentDiv;
      this._player_id = options.playerId;
      this._time_begin = options.time_begin;
      this._time_end = options.time_end;
      this._bar = options.bar;

      this._bar.restTime(this.swGetDuration() * 1000);
      this._bar.setUserData(this);
      this._closecallback = options.callback;
      this._tag = options.tag;
    };

    jSW.SWPlayer.prototype = {
      _parent: null, /** session */
      _file: null, /** 文件 */
      _nru_id: null, /** nru id*/
      _dialog_id: -1, /** 会话ID, 唯一标识 */
      _player_id: null, /** 播放器ID */
      _parent_div: null, /** 父div */
      _current_pts: -1,
      _time_begin: -1,
      _time_end: -1,
      _bar: null,

      _on_update_pts: function (pts) {
        this._current_pts = pts;

        // var date = new Date(pts)
        // console.log('pts: ' + pts + ' date: ' + date)
        this._bar.changeBar(this.swGetCurrentTime() * 1000);
      },

      /** 视频时长 */
      swGetDuration: function () {
        return this._time_end - this._time_begin;
      },

      /** 当前播放进度 */
      swGetCurrentTime: function () {
        if (this._current_pts == -1) {
          return 0;
        }
        return Math.round(this._current_pts / 1000) - this._time_begin - 8 * 60 * 60; //8时区, pts是北京时间, time_begin是utc时间
      },

      /** 单帧步进 */
      swStep: function (options) {

        options = jSWUtils.extend({}, {}, options || {});

        options.cmdtype = 'STEP'
        options.dialogId = this._dialog_id;

        return this._parent.swRecordPlayCtrl(options);
      },

      /** 跳转 */
      swJump: function (options) {

        options = jSWUtils.extend({}, {}, options || {});
        options.cmdtype = 'PLAY';
        options.dialogId = this._dialog_id;

        return this._parent.swRecordPlayCtrl(options);
      },

      /** 播放 */
      swPlay: function (options) {

        options = jSWUtils.extend({}, {}, options || {});
        options.cmdtype = 'PLAY';
        options.dialogId = this._dialog_id;

        return this._parent.swRecordPlayCtrl(options);
      },

      /** 暂停 */
      swPause: function (options) {

        options = jSWUtils.extend({}, {}, options || {});
        options.cmdtype = 'PAUSE';
        options.dialogId = this._dialog_id;

        return this._parent.swRecordPlayCtrl(options);
      },

      /** 关闭 */
      swClose: function (options) {

        options = jSWUtils.extend({}, {}, options || {});
        options.cmdtype = 'TEARDOWN';
        options.dialogId = this._dialog_id;

        var rc = this._parent.swRecordPlayCtrl(options);
        this._parent_div.innerHTML = '';
        this._parent_div.bv_uuid = '';

        this._parent._swDelRecordPlayer(options.dialogId)
        if (this._closecallback) {
          this._closecallback(this._tag);
        }
        return rc;
      },
    };


    // ---- jSWUtils ----
    (function (jSWUtils) {
      jSWUtils.string2Uint8Array = function (str) {
        var bytes = new Array();
        var len, c;
        len = str.length;
        for (var i = 0; i < len; i++) {
          c = str.charCodeAt(i);
          if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
          } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
          } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
          } else {
            bytes.push(c & 0xFF);
          }
        }
        return bytes;
      };

      jSWUtils.getJsonString = function (jsonObj) {
        return JSON.stringify(jsonObj);
      };

      jSWUtils.getJsonObject = function (jsonStr) {
        return jQuery.parseJSON(jsonStr);
      };

      jSWUtils.isIE = function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
          return true;
        else
          return false;
      };

      jSWUtils.supportFlash = function () {
        if (jSWUtils.isIE()) {
          try {
            var swf1 = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            return true;
          }
          catch (e) {
          }
        }
        else {
          try {
            var swf2 = navigator.plugins['Shockwave Flash'];
            if (swf2 != undefined) {
              return true;
            }
          }
          catch (e) {
          }
        }

        return false;
      }

      jSWUtils.ManEmitCallback = function (options, rc, data) {
        var opts = { tag: options.tag };
        var resp = { emms: rc };
        var callback = options.callback;
        setTimeout(function () {
          callback(opts, resp, data);
        }, 50);
      }

      jSWUtils.CheckAsyncOption = function (options, afterCheck) {
        var rc = jSW.RcCode.RC_CODE_E_INVALIDARG;
        if (options && options.callback) {
          rc = afterCheck();
        }
        return rc;
      }

      jSWUtils.consoleLog = function (str, rc) {
        console.log(str + (rc == jSW.RcCode.RC_CODE_S_OK ? 'Ok' : 'Failed'));
      }

      jSWUtils.debugLog = function (str, rc) {
        if (jSWUtils._IsDebug) {
          this.consoleLog(str, rc);
        }
      }

      jSWUtils.debugLogInfo = function (str) {
        if (jSWUtils._IsDebug) {
          console.log(str);
        }
      }

      jSWUtils._IsDebug = false;

      jSWUtils.ManualAsyncReply = function (callback, rcCode, data, tag) {
        setTimeout(function () {
          callback({ tag: tag }, { emms: { code: rcCode } }, data);
        }, 100);
      }

      /**
      swAjax ( {
          data: {age: 20, name: 'tony'},
          type: 'post',
          cache: false,
          dataType: 'json',
          success: function (data, status) { },
          error: function (xhr, errMsg, errorThrown) { } // errMsg: null, "timeout", "error", "notmodified"、"parsererror"
      } );*/
      jSWUtils.ajax = function (url, options) {
        jQuery.ajax(url, options);
      };

      jSWUtils.extend = function (dst, dft, src) {
        return jQuery.extend(dst, dft, src);
      };

      jSWUtils._getSessionById = function (sessionId) {
        var sessionList = jSWOptions.session_list;
        var session = null;
        var i = 0;
        for (i = 0; i < sessionList.length; i++) {
          session = sessionList[i];
          if (session && session._p_emms.getSession()) {
            if (sessionId == session._p_emms.getSession()) {
              return session;
            }
          }
        }

        return null;
      };

      jSWUtils.generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
      };

      jSWUtils.FilterPath = function (path) {
        var srcPath = path;
        srcPath = srcPath.replace("\:", "");
        srcPath = srcPath.replace(/\\\\/g, "/");
        srcPath = srcPath.replace(/\\/g, "/");
        var aa = srcPath.split("/");
        var desPath = "";
        for (var iIndex = 0; iIndex < aa.length; iIndex++) {
          if (iIndex != 1) {
            desPath += aa[iIndex];
            if (iIndex != aa.length - 1) {
              desPath += "/";
            }
          }
        }
        return desPath;
      }

      jSWUtils.PathParse = function (path) {
        var srcPath = path;
        srcPath = srcPath.replace("\:", "");
        srcPath = srcPath.replace(/\\\\/g, "/");
        srcPath = srcPath.replace(/\\/g, "/");
        var aa = srcPath.split("/");
        var fileName = aa[aa.length - 1];
        var bb = fileName.split("_");
        return {
          szpuid: bb[0] + "_" + bb[1],
          ichannelindex: bb[2]
        };
      }
    })(jSWUtils);


    // ---- 通信协议jSWProtocol ----
    (function (jSWProtocol) {

      jSWProtocol.JudgeIdType = function (id) {
        var judgeResult = {
          bPu: false,
          bCu: false,
          bUa: false,
          bUx: false
        };

        if (id.indexOf("PU_") == 0) {
          judgeResult.bPu = true;
        } else if (id.indexOf("CU_") == 0) {
          judgeResult.bCu = true;
        } else if (id.indexOf("UA_") == 0) {
          judgeResult.bUa = true;
        } else if (id.indexOf("UX_") == 0) {
          judgeResult.bUx = true;
        }
        return judgeResult;
      }

      jSWProtocol.BuildEventOptions = function (cmd, request, session, tag) {
        var eventOptions = {
          cmd: cmd,
          request: request,
          session: session,
          tag: tag
        };
        return eventOptions;
      }

      jSWProtocol.BuildResponse = function (iResult, request) {
        var response = {
          emms: {
            code: iResult
          },
          request: request
        };
        return response;
      }

      /**通道类型*/
      jSWProtocol.ChanelType = {
        unknow: 'type_unknow',
        chanel: 'type_chanel',
        gps: 'type_gps',
        tsp: 'type_tsp',
        custom: 'type_custom',

        getType: function (major) {
          //DialogTarget.iIndexMajor取值范围与通道类型
          var BVCU_SUBDEV_INDEXMAJOR_MIN_CHANNEL = 0;  //音视频通道
          var BVCU_SUBDEV_INDEXMAJOR_MAX_CHANNEL = 0x00FFFF;
          var BVCU_SUBDEV_INDEXMAJOR_MIN_GPS = 0x010000; //GPS设备数据
          var BVCU_SUBDEV_INDEXMAJOR_MAX_GPS = 0x0100FF;
          var BVCU_SUBDEV_INDEXMAJOR_MIN_TSP = 0x010100;//透明串口设备数据
          var BVCU_SUBDEV_INDEXMAJOR_MAX_TSP = 0x0101FF;
          var BVCU_SUBDEV_INDEXMAJOR_MIN_CUSTOM = 0xF00000;//自定义设备数据
          var BVCU_SUBDEV_INDEXMAJOR_MAX_CUSTOM = 0xF000FF;

          if (major >= BVCU_SUBDEV_INDEXMAJOR_MIN_CHANNEL &&
            major <= BVCU_SUBDEV_INDEXMAJOR_MAX_CHANNEL) {
            return jSWProtocol.ChanelType.chanel;
          } else if (major >= BVCU_SUBDEV_INDEXMAJOR_MIN_GPS &&
            major <= BVCU_SUBDEV_INDEXMAJOR_MAX_GPS) {
            return jSWProtocol.ChanelType.gps;
          } else if (major >= BVCU_SUBDEV_INDEXMAJOR_MIN_TSP &&
            major <= BVCU_SUBDEV_INDEXMAJOR_MAX_TSP) {
            return jSWProtocol.ChanelType.tsp;
          }
          else if (major >= BVCU_SUBDEV_INDEXMAJOR_MIN_CUSTOM &&
            major <= BVCU_SUBDEV_INDEXMAJOR_MAX_CUSTOM) {
            return jSWProtocol.ChanelType.custom;
          } else {
            return jSWProtocol.ChanelType.unknow;
          }
        },
      };

      /**请求命令*/
      jSWProtocol.RequestHeader = {
        notifys: {
          notify: { cmd: 'notify' },
          notify_pu_onoffline: { cmd: 'notify_pu_onoffline' },
          notify_event_source: { cmd: 'notify_event_source' },
          notify_tsp_data: { cmd: 'notify_tsp_data' },
          notify_down_from_pu: { cmd: 'notify_down_from_pu' },
          notify_pu_apply_for_opening_dialog: { cmd: 'notify_pu_apply_for_opening_dialog' },
          notifyimmsg: { cmd: 'notifyimmsg' },
          notify_down_from_nru: { cmd: 'notify_down_from_nru' }
        },
        confnotify: {
          notifyconfcreate: { cmd: 'notifyconfcreate' },
          notifyconfstart: { cmd: 'notifyconfstart' },
          notifyconfdelete: { cmd: 'notifyconfdelete' },
          notifyconfstop: { cmd: 'notifyconfstop' },
          notifyparticipartoradd: { cmd: 'notifyparticipartoradd' },
          notifyparticipartorjoin: { cmd: 'notifyparticipartorjoin' },
          notifyparticipartorremove: { cmd: 'notifyparticipartorremove' },
          notifyparticipartorexit: { cmd: 'notifyparticipartorexit' },
          notifyapplyforstartspeak: { cmd: 'notifyapplyforstartspeak' },
          notifyapplyforendspeak: { cmd: 'notifyapplyforendspeak' },
          notifyinvitespeak: { cmd: 'notifyinvitespeak' },
          notifyterminatespeak: { cmd: 'notifyterminatespeak' },
          notifyparticipartorleave: { cmd: 'notifyparticipartorleave' },
          notifyparticipartorreturn: { cmd: 'notifyparticipartorreturn' },
          notifyparticipatormodify: { cmd: 'notifyparticipatormodify' },
          notifyimmsg: { cmd: 'notifyimmsg' },
          notifyaacoperate: { cmd: 'notifyaacoperate' },
          notifybaseinfo: { cmd: 'notifybaseinfo' }
        },
        pubkey: { cmd: 'pubkey' },
        login: { cmd: 'login' },
        logout: { cmd: 'logout' },
        keeplive: { cmd: 'keeplive' },
        pulist: { cmd: 'pulist' },
        openchanle: { cmd: 'openchanle' },
        altervideodir: { cmd: 'altervideodir' },
        keeplivechanle: { cmd: 'keeplivechanle' },
        openchanletsp: { cmd: 'openchanletsp' },
        writechanletsp: { cmd: 'writechanletsp' },
        closechanle: { cmd: 'closechanle' },
        pugpsdata: { cmd: 'pugpsdata' },
        searchlist: { cmd: 'searchlist' },
        recordfile_del: { cmd: 'recordfile_del' },
        vod: { cmd: 'vod' },
        snapshot: { cmd: 'snapshot' },
        getptzattr: { cmd: 'getptzattr' },
        setptzattr: { cmd: 'setptzattr' },
        ptzctrl: { cmd: 'ptzctrl' },
        getconflist: { cmd: 'getconflist' },
        getconfinfo: { cmd: 'getconfinfo' },
        confaudiorecord: { cmd: 'confaudiorecord' },
        confimsend: { cmd: 'confimsend' },
        getonuserlist: { cmd: 'getonuserlist' },
        createconf: { cmd: 'createconf' },
        deleteconf: { cmd: 'deleteconf' },
        particularadd: { cmd: 'particularadd' },
        particularremove: { cmd: 'particularremove' },
        applyforspeak: { cmd: 'applyforspeak' },
        applyforendspeak: { cmd: 'applyforendspeak' },
        confstart: { cmd: 'confstart' },
        confend: { cmd: 'confend' },
        invitespeak: { cmd: 'invitespeak' },
        terminalspeak: { cmd: 'terminalspeak' },
        confleave: { cmd: 'confleave' },
        confreturn: { cmd: 'confreturn' },
        pucfg: {
          getpudeviceinfo: { cmd: "getpudeviceinfo" },
          getpuethernet: { cmd: "getpuethernet" },
          getpuradionetwork: { cmd: "getpuradionetwork" },
          getpuwifi: { cmd: "getpuwifi" },
          getPuPower: { cmd: "getPuPower" },
          getPuOnlineControl: { cmd: "getPuOnlineControl" },
          getPuUpdateStatus: { cmd: "getPuUpdateStatus" },
          getPuLinkactionList: { cmd: "getPuLinkactionList" },
          getPuCarInfo: { cmd: "getPuCarInfo" },
          getPuZfyInfo: { cmd: "getPuZfyInfo" },
          setPuZfyInfo: { cmd: "setPuZfyInfo" },
          getPuServers: { cmd: "getPuServers" }
        },

        usercfg: {
          modgroupinfo: { cmd: "modgroupinfo" },
          moduserinfo: { cmd: "moduserinfo" },
          moduserpwd: { cmd: "moduserpwd" },
          addgroup: { cmd: "addgroup" },
          adduser: { cmd: "adduser" },
          delgroup: { cmd: "delgroup" },
          deluser: { cmd: "deluser" },
          getgrouplist: { cmd: "getgrouplist" }
        },

        recordplay: {
          play: { cmd: 'recordplay_play' },
          pause: { cmd: 'recordplay_pause' },
          teardown: { cmd: 'recordplay_teardown' }
        },

        compare: function (src, des) {
          if (src.req == des.req && src.subreq == des.subreq)
            return true;
          else
            return false;
        }
      };

      /**打开视频使用的协议*/
      jSWProtocol.ProtoType = {
        HLS: 1,
        RTMP: 2,
        OCX: 4,
        HTTP_FLV: 6,
        OTHER: 5, /*串口等*/
      };

      jSWProtocol.RotateType = {
        RIGHT90: 90,
        LEFT90: -90
      };
      /**
       * dft_options = {
       *     session: null,
       *     msgtype: -1,
       *     target: "",
       *     targetIndex: -1,
       *     payload: null,
       *     cmd: "",
       *     callback: null,
       *     tag: null
       * }
       */
      jSWProtocol.SendRequest = function (options) {

        dft_options = {
          session: null,
          msgtype: -1,
          target: "",
          targetIndex: -1,
          payload: null,
          cmd: "",
          hdlg: -1,
          callback: null,
          callbackrelay: null,
          tag: null,
          _dhcb: null,
          _dhcbtag: null
        }

        options = jSWUtils.extend({}, dft_options, options || {});

        var param = this.JsonParamCommand(options.session._p_emms,
          options.msgtype,
          jSWProtocol.BVCU_Command(options.target, options.targetIndex, options.payload, options.hdlg));

        var attchdata = null;

        if (options.callbackrelay != null) {
          attchdata = {
            callback: options.callbackrelay,
            options: {
              tag: options.tag
            },
            _dhcbtag: options._dhcbtag
          };
        }

        var rc = jSWProtocol._internalSend({
          cmd: options.cmd,
          session: options.session,
          request: param,
          callback: options.callback,
          attchdata: attchdata,
          tag: options.tag
        });

        return rc;
      }

      /**控制协议, 为用户登录、鉴权提供支持，其数据的输入输出都在EmmsHeader中。*/
      jSWProtocol.EmmsHeader = function (appkey, version) {
        this.key = appkey;/**GUID	分配给应用用于访问API的Key，请求消息中必需。	M/O*/
        this.ver = version;/**[1-9][0-9]?\.[0-9]	API协议版本，请求消息中¬必需。当前版本1.0.	M/O*/
        this.session = '';/**GUID	会话ID，请求用户特定信息必需。	M/O*/
        this.id = 0; /**命令唯一ID*/
        this.code = 0;/**int	错误编码，响应消息中必需。	M/O*/
      }

      jSWProtocol.GetPuLanguageByIndex = function (iLanguageIndex) {
        if (iLanguageIndex == 0)
          return "INVALID";
        else if (iLanguageIndex == 1) {
          return 'ENGLISH';
        }
        else if (iLanguageIndex == 2) {
          return 'CHINESE_SIMPLIFIED';
        }
        else if (iLanguageIndex == 3) {
          return 'CHINESE_TRADITIONAL';
        }
      };

      jSWProtocol.BVCU_ServerParam = function (serverIP, serverPort, userName, password) {
        this.server = serverIP;
        this.port = serverPort;
        this.user = userName;
        this.password = password;
      }

      /**jSWProtocol.ProtoType*/
      jSWProtocol.BVCU_DialogParam = function (pId, pMajor, pMinor, pProto, pMedia, pHwnd, hDlg, bOverTcp) {
        var param = new proto.WEBBVCU.BVCU_DialogParam();
        param.setId(pId);
        param.setMajor(pMajor);
        param.setMinor(pMinor);
        param.setProto(pProto);
        param.setMedia(pMedia);
        param.setHdlg(hDlg);
        if (bOverTcp) {
          param.setBovertcp(1);
        }
        if (pHwnd != "undefined") {
          param.setHwnd(pHwnd);
        }
        return param;
      }

      jSWProtocol.BVCU_Command = function (pTargetId, pTargetIndex, pContent, hdlg) {
        var request = new proto.WEBBVCU.Request();
        request.setTargetid(pTargetId);
        request.setTargetindex(pTargetIndex);
        request.setHdlg(hdlg);
        if (null != pContent) {
          try {
            request.setPayload(pContent.serializeBinary().buffer);
          }
          catch (e) {
            request.setPayload(jSWUtils.string2Uint8Array(pContent));
          }
        }
        return request;
      };

      jSWProtocol.ParamPuList = function (pStatus, pPagesize, pPage, iIndex, iCount) {
        var getpulist = new proto.WEBBVCU.BVCU_GetPulist();

        getpulist.setStatus(pStatus);
        getpulist.setPagesize(pPagesize);
        getpulist.setPage(pPage);
        getpulist.setIndex(iIndex);
        getpulist.setIcount(iCount);

        return getpulist;
      }

      jSWProtocol.BVCU_SearchInfo = function (piType, piPostition, piCount) {
        this.iType = piType;
        this.iPostition = piPostition;
        this.iCount = piCount;
        this.iTotalCount = -1;
      }

      jSWProtocol.SearchType = {
        UNKNOWN: 0,
        FILE: 1,  // 文件
        CU_LOGIN: 2,
        PU_LOGIN: 3,
        OPERATE: 4,
        DIALOG: 5,
        PULIST: 6,
        EVENT: 7
      };

      jSWProtocol.BVCU_Search_FileFilter = function (pszPUID, piChannelIndex, piTimeBegin, piTimeEnd, piFileType,
        piRecordType, piFileSizeMin, piFileSizeMax) {
        this.szPUID = pszPUID;
        this.iChannelIndex = piChannelIndex;
        this.iTimeBegin = piTimeBegin;
        this.iTimeEnd = piTimeEnd;
        this.iFileType = piFileType;

        this.iRecordType = piRecordType;
        this.iFileSizeMin = piFileSizeMin;
        this.iFileSizeMax = piFileSizeMax;
      }

      jSWProtocol.CheckOptions = function (msgtype, srcoptions) {
        var def_options = null;
        var argsErrorDes = null;
        var createErrorfun = function (MSGType, errDes, desErr) {
          desErr += msgtype + errDes;
        }

        switch (msgtype) {
          case proto.WEBBVCU.MSGType.WEB_BVCU_CONF_IM_MSG:
            if (undefined == srcoptions.szTextMsg || null == srcoptions.szTextMsg) {
              createErrorfun(msgtype, "szTextMsg: set error!", argsErrorDes);
            }
            if (undefined == srcoptions.callback || null == srcoptions.callback) {
              createErrorfun(msgtype, "callback: set error!", argsErrorDes);
            }
            break;
          case proto.WEBBVCU.MSGType.WEB_BVCU_SET_PU_REBOOT_OR_SHUTDOWN:
            if (undefined == srcoptions.ioption || null == srcoptions.ioption || srcoptions.ioption != 0 || srcoptions.ioption != 1) {
              createErrorfun(msgtype, "ioption: set error!", argsErrorDes);
            }
            if (undefined == srcoptions.callback || null == srcoptions.callback) {
              createErrorfun(msgtype, "callback: set error!", argsErrorDes);
            }
            break;
        }

        if (argsErrorDes == null) {
          return jSW.RcCode.RC_CODE_S_OK;
        } else {
          console.log(argsErrorDes);
          return jSW.RcCode.RC_CODE_E_INVALIDARG;
        }
      }

      jSWProtocol.uint8ArrayToHexArray = function (uint8array) {
        var szHexTemp = [];
        var temphex = "";
        for (var iindex = 0; iindex < uint8array.length; iindex += 2) {
          temphex = "";
          temphex += String.fromCharCode(uint8array[iindex]);
          temphex += String.fromCharCode(uint8array[iindex + 1]);
          szHexTemp.push(temphex);
        }
        return szHexTemp;
      }

      jSWProtocol.uint8ArrayToHex = function (uint8array) {
        var sSzHex = "";
        var iTemp = 0;
        for (var iIndex = 0; iIndex < uint8array.length; iIndex++) {
          sSzHex += (uint8array[iIndex] >> 4).toString(16);
          sSzHex += (uint8array[iIndex] & 0x0f).toString(16);
        }
        return sSzHex;
      }

      jSWProtocol.HexToString = function (uint8array) {
        return String.fromCharCode.apply(null, uint8array);
      }

      jSWProtocol.LargeHexToString = function (arr) {
        var out = "";
        for (var i = 0; i < arr.length / 2; i++) {
          var tmp = [arr[i * 2], arr[i * 2 + 1]];
          var charValue = String.fromCharCode.apply(null, tmp);
          out += charValue
        }
        return out;
      }

      jSWProtocol.EventSourcePb2_Json = function (eventSourcePb) {
        eventSourcePb = proto.BVCU.Event_Source.deserializeBinary(eventSourcePb);
        var eventSourceJson = {
          iEventType: eventSourcePb.getIeventtype(),
          stTime: this.Walltime2Json(eventSourcePb.getSttime()),
          szID: eventSourcePb.getSzid(),
          iSubDevIdx: eventSourcePb.getIsubdevidx(),
          iValue: eventSourcePb.getIvalue()
        };
        return eventSourceJson;
      }

      jSWProtocol.SWFileTransInfoPb2_Json = function (transInfoPb) {
        transInfoPb = proto.WEBBVCU.FileTransInfo.deserializeBinary(transInfoPb);
        var transInfo = {
          iCreateTime: transInfoPb.getIcreatetime(),
          iOnlineTime: transInfoPb.getIonlinetime(),
          iTransferBytes: transInfoPb.getItransferbytes(),
          iTotalBytes: transInfoPb.getItotalbytes(),
          iSpeedKBpsLongTerm: transInfoPb.getIspeedkbpslongterm(),
          iSpeedKBpsShortTerm: transInfoPb.getIspeedkbpsshortterm(),
        };
        return transInfo;
      }
      jSWProtocol.SWFileTransEventPb2_Json = function (transInfoPb) {
        transInfoPb = proto.WEBBVCU.FileTransInfo.deserializeBinary(transInfoPb);
        var downloadPath = transInfoPb.getDownfilefrompu();
        var szbase64 = downloadPath && downloadPath["getImgbase64"] ? downloadPath.getImgbase64() : "";
        var event = {
          iEvent: transInfoPb.getIevent(),
          iResult: transInfoPb.getIresult(),
          szRemoteFilePath: downloadPath ? downloadPath.getSzremotefilepathname() : "",
          szLocalFilePath: downloadPath ? downloadPath.getSzlocalfilepathname() : "",
          imgbase64: szbase64.length > 0 ? this.LargeHexToString(downloadPath.getImgbase64()) : "",
          nruid: transInfoPb.getSznruid()
        }
        return event;
      }

      jSWProtocol.SWOpenDialogPb2_Json = function (openDialog) {
        openDialog = proto.BVCU.PUConfig.OpenDialog.deserializeBinary(openDialog);
        var desdata = {
          szID: openDialog.getSzid(),
          iChannelIndex: openDialog.getIchannelindex(),
          iStreamIndex: openDialog.getIstreamindex(),
          iAVStreamDir: openDialog.getIavstreamdir(),
          bRecord: openDialog.getBrecord(),
          iApplierID: openDialog.getIapplierid()
        };
        return desdata;
      }

      jSWProtocol.IMFilePb2json = function (imfilepb) {
        var imfile = {
          szID: imfilepb.getSzid(),
          szFile: imfilepb.getSzfilepath(),
          iFileSize: imfilepb.getIfilesize(),
          iDuration: imfilepb.getIduration()
        }
        return imfile;
      }

      jSWProtocol.IMMsgPb2_Json = function (szmsgdata) {
        var szmsgs = [];
        szmsgdata = szmsgdata.getSzmsgsList();
        var szmsgdataitem = null;
        var tempmsgdata;
        var imsgtype = 0;
        for (var ii = 0; ii < szmsgdata.length; ii++) {
          szmsgdataitem = szmsgdata[ii];
          imsgtype = szmsgdataitem.getItype();
          tempmsgdata = {
            iType: imsgtype,
            szTextMsg: (imsgtype == this.IMMSGTypes.TEXT || imsgtype == this.IMMSGTypes.FACE) ? szmsgdataitem.getSztextmsg() : null,
            stGpsData: imsgtype == this.IMMSGTypes.GPS ? this.GPSDatapb2Json(szmsgdataitem.getStgpsdata()) : null,
            stFile: (imsgtype == this.IMMSGTypes.FILE || imsgtype == this.IMMSGTypes.PICTURE || imsgtype == this.IMMSGTypes.AUDIO || imsgtype == this.IMMSGTypes.CONF_AUDIO) ? this.IMFilePb2json(szmsgdataitem.getStfile()) : null
          };

          if (imsgtype == this.IMMSGTypes.FACE) {
            var ImEmtion = jSW.DependencyMgr.GetEmotionSync();
            tempmsgdata.szTextMsg = ImEmtion.GetGifEmotion(tempmsgdata.szTextMsg);
            console.log(tempmsgdata.szTextMsg);
          }
          szmsgs.push(tempmsgdata);
        }
        return szmsgs;
      }

      jSWProtocol.AUDIO_OP_CODES = {
        CAPTURE_BEGIN: 0,
        CAPTURE_END: 1,
        RENDER_BEGIN: 2,
        RENDER_END: 3,
        RENDER_NOTIFY: 4
      };

      jSWProtocol.AUDIO_OP_PLAYSTATUS = {
        PLAY_EVENT_PLAY: 1,
        PLAY_EVENT_CLOSE: 2,
        PLAY_EVENT_EOF: 3
      };

      jSWProtocol.AACOperatePb2_Json = function (audioOperatePb) {
        var audioOperate = {
          iOpCode: audioOperatePb.getIoperatecode()
        };

        if (audioOperate.iOpCode == jSWProtocol.AUDIO_OP_CODES.CAPTURE_END) {
          audioOperate["audioFilePath"] = jSWProtocol.HexToString(audioOperatePb.getSzlocalpath());
          audioOperate["iDuration"] = audioOperatePb.getIduration();
        }

        if (audioOperate.iOpCode == jSWProtocol.AUDIO_OP_CODES.RENDER_NOTIFY) {
          audioOperate["iPlayStatu"] = audioOperatePb.getIplaystatu();
        }
        return audioOperate;
      }

      jSWProtocol.IMMsgPksPb2_Json = function (imMsgPks) {
        var immsg = {
          iSourceId: imMsgPks.getIsourceid(),
          szSourceId: imMsgPks.getSzsourceid(),
          iTargetId: imMsgPks.getItargetid(),
          szTargetId: imMsgPks.getSztargetid(),
          szmsg: [],
          isPic: imMsgPks.getBispic(),
          isDownload: imMsgPks.getBisdownload(),
          imsgtype: imMsgPks.getImsgtype()
        }

        var szmsgdatas = proto.BVCU.IM_Msgs.deserializeBinary(imMsgPks.getPayload());
        immsg.szmsg = jSWProtocol.IMMsgPb2_Json(szmsgdatas);
        return immsg;
      }

      jSWProtocol.IMMSGTypes = {
        UNKNOWN: 0,
        TEXT: 1,
        FACE: 2,
        GPS: 3,
        FILE: 4,
        PICTURE: 5,
        AUDIO: 6,
        VIDEO: 7,
        CONF_AUDIO: 8,
        CALL_AUDIO: 9,
        CALL_VIDEO: 10,
        CUSTOM: 31,
        onlyOcx: function (imMsgType) {
          return (imMsgType == this.FILE || imMsgType == this.AUDIO);
        }
      }

      jSWProtocol.EVENTACTIONS = {
        NONE: 0,            //无效值
        DISKERROR: 0x0001,  //磁盘错误。源：PU/NRU的Storage
        OUTOFDISKSPACE: 0x0002, //磁盘空间不足。源：PU/NRU的Storage
        VIDEOLOST: 0x1000,    //视频丢失。源：PU 的 VideoIn
        VIDEOMD: 0x1001,               //运动检测。源：PU 的 VideoIn
        VIDEOOCCLUSION: 0x1002,        //视频遮挡。源：PU 的 VideoIn
        ALERTIN: 0x1003,               //报警输入。源：PU 的 AlertIn
        PERIOD: 0x1004,                //周期报警。源：PU 的 周期报警    
        PUONLINE: 0x1005,              //PU上线。源：PU
        PUOFFLINE: 0x1006,             //PU下线。源：PU
        LOWTEMPERATURE: 0x1007,        //低温报警。源：PU 的 TemperatureIn
        HIGHTEMPERATURE: 0x1008,       //高温报警。源：PU 的 TemperatureIn
        SLOWSPEED: 0x1009,             //低速报警。源：PU 的 GPS
        OVERSPEED: 0x100a,             //超速报警。源：PU 的 GPS
        INTOREGION: 0x100b,            //进入区域报警。源：PU 的 GPS
        OUTREGION: 0x100c,             //出区域报警。源：PU 的 GPS
        LOWVOLTAGE: 0x100d,            //低电压报警。源：PU 的 VoltageIn
        HIGHVOLTAGE: 0x100e,           //高电压报警。源：PU 的 VoltageIn

        //NRU相关
        NRUONLINE: 0x2000,   //NRU上线
        NRUOFFLINE: 0x2001,           //NRU下线

        //VTDU相关
        VTDUONLINE: 0x3000,
        VTDUOFFLINE: 0x3001,

        //CMS相关
        CMSONLINE: 0x4000,
        CMSOFFLINE: 0x4001,

        //用户(User)相关
        USERLOGIN: 0x5000,   //用户登录
        USERLOGOUT: 0x5001,           //用户注销

        //decorder(解码器）相关
        DECONLINE: 0x6000,
        DECOFFLINE: 0x6001,

        //该值及往后的值为自定义类型
        CUSTOM: 0x10000000,
      };

      jSWProtocol.BVCU_EventStoragePb2_Json = function (eventStoragePb) {
        eventStoragePb = proto.WEBBVCU.EventStorage.deserializeBinary(eventStoragePb);
        var eventStorage = {
          iresult: eventStoragePb.getIresult(),
          szfilename: this.HexToString(eventStoragePb.getSzfilename()),
          itimestamp: eventStoragePb.getItimestamp()
        };
        return eventStorage;
      }

      jSWProtocol.Int2Uint = function (int32) {
        var rcuint32 = Number(int32);
        var rc = new Uint32Array(1);
        rc[0] = rcuint32;
        return rc[0];
      }

      jSWProtocol._CmdParse = function (iMethod, iSubMethod) {
        var sResult = jSW.DependencyMgr.cmdParseInJect(function (cmdParse) {
          return cmdParse.parseCmd(iMethod, iSubMethod);
        });
        return sResult;
      };

      jSWProtocol.OperateSearchLogs2_Json = function (payload) {
        var searchResponse = proto.BVCU.Search.Search_Response.deserializeBinary(payload);
        var searchinfopb = searchResponse.getStsearchinfo();
        var operationLogs = searchResponse.getPoperatelogList();
        var searchResultJson = {
          info: null,
          result: []
        };
        var searchinfo = {
          ipostition: searchinfopb.getIpostition(),
          icount: searchinfopb.getIcount(),
          itotalcount: searchinfopb.getItotalcount()
        };

        searchResultJson.info = searchinfo;

        var oplog = null;
        var oplogjon = null;
        for (operationindex in operationLogs) {
          oplog = operationLogs[operationindex];
          //oplog = new proto.BVCU.Search.Search_OperateLog();
          oplogjon = {
            szsourceid: oplog.getSzsourceid(),
            szusername: oplog.getSzusername(),
            sztargetid: oplog.getSztargetid(),
            imethod: oplog.getImethod(),
            isubmethod: oplog.getIsubmethod(),
            iapplierid: oplog.getIapplierid(),
            itargetindex: oplog.getItargetindex(), //目
            ioperatetime: oplog.getIoperatetime(),
            bresult: oplog.getIresult(),
            szdescription: oplog.getSzdescription(),
            smethod: null
          };
          oplogjon.smethod = jSWProtocol._CmdParse(oplogjon.imethod, oplogjon.isubmethod);
          searchResultJson.result.push(oplogjon);
        }

        return searchResultJson;
      }

      jSWProtocol._GetAllRescources = function (session, rescources) {
        var allRescources = [];
        var pu = null;
        var channel = null;
        var channelrec = null;
        var res = null;
        var restemp = null;
        try {
          for (puindex in session._arr_pu) {
            pu = session._arr_pu[puindex];
            res = null;
            for (recindex in rescources) {
              restemp = rescources[recindex];
              if (pu._id_pu == restemp.puid) {
                res = restemp;
                break;
              }
            }
            if (res == null) {
              res = {
                puid: pu._id_pu,
                puname: pu._info_pu.name.length > 0 ? pu._info_pu.name : pu._id_pu,
                config: false,
                channels: [
                ]
              };
              for (channelindex in pu._arr_channel) {
                channel = pu._arr_channel[channelindex];
                channelrec = {
                  channelindex: channel._id_chanel,
                  iscansee: false
                };
                res.channels.push(channelrec);
              }
            }
            allRescources.push(res);
          }
        } catch (e) {
        }
        return allRescources;
      }

      jSWProtocol._LocalResource_2Pb = function (localresources, payload) {
        var recsourcepb = null;
        var recsource = null;
        var puPerPb = null;
        var channelUint8Array = null;
        var channeltemp = null;
        for (recindex in localresources) {
          recsource = localresources[recindex];
          recsourcepb = new proto.BVCU.UserConfig.Resource();
          puPerPb = new proto.BVCU.UserConfig.PUPermissions();
          recsourcepb.setSpuid(recsource.puid);
          recsourcepb.setSzpermissions(puPerPb);
          puPerPb.setConfig((recsource.config ? jSW.SwUserManager.PERMISSIONS.ON : jSW.SwUserManager.PERMISSIONS.OFF));
          channelUint8Array = new Uint8Array(recsource.channels.length);

          for (channelindex in recsource.channels) {
            channeltemp = recsource.channels[channelindex];
            channelUint8Array[channeltemp.channelindex] = (channeltemp.iscansee ? jSW.SwUserManager.PERMISSIONS.ON : jSW.SwUserManager.PERMISSIONS.OFF);
          }
          puPerPb.setChannel(channelUint8Array);
          payload.addPresource(recsourcepb, recindex);
        }
      }

      jSWProtocol._BVCU_UCFG_Resource_Pb2Json = function (resource_pb, sessionhelper) {
        var puPermission = resource_pb.getSzpermissions();
        var channelPermission = [];
        var channelPermissionlistpb = puPermission.getChannel();
        var channelPermissionTemp = null;
        var channelPermissionpb = null;
        var pujson = null;
        for (channelIndex in channelPermissionlistpb) {
          channelPermissionpb = channelPermissionlistpb[channelIndex];
          channelPermissionTemp = {
            channelindex: Number(channelIndex),
            iscansee: channelPermissionlistpb[channelIndex] == jSW.SwUserManager.PERMISSIONS.ON
          };
          channelPermission.push(channelPermissionTemp);
        }

        pujson = sessionhelper._swGetPu(resource_pb.getSpuid());
        var json = {
          puid: resource_pb.getSpuid(),
          puname: (pujson != null && pujson._info_pu.name.length > 0) ? pujson._info_pu.name : resource_pb.getSpuid(),
          config: puPermission.getConfig() == 1,
          channels: channelPermission
        };
        return json;
      }

      jSWProtocol.Walltime2Json = function (walltimepb) {
        var sttime =
        {
          year: walltimepb.getIyear(),
          month: walltimepb.getImonth(),
          day: walltimepb.getIday(),
          hour: walltimepb.getIhour(),
          minute: walltimepb.getIminute(),
          second: walltimepb.getIsecond()
        }
        return sttime;
      }

      jSWProtocol.SetGpsData = function (gpsData, options) {
        var paramName = null;
        var desData = 0;
        for (var iIndex in options) {
          if (iIndex) {
            paramName = "setI";
            if (iIndex == "lat") {
              paramName += "latitude";
            } else if (iIndex == "long") {
              paramName += "longitude";
            } else {
              paramName += iIndex;
            }
            if (gpsData[paramName]) {
              desData = jSWProtocol.TransNumberInt2Uint(options[iIndex]);
              gpsData[paramName](desData);
            }
          }
        }
      }

      var TransNumberInt2UintHelper = Math.pow(2, 32);
      jSWProtocol.TransNumberInt2Uint = function (uint32Data) {
        var result = uint32Data;
        if (uint32Data < 0) {
          result += TransNumberInt2UintHelper;
        }
        return result;
      }

      var ParseNumberUint2IntHelper = TransNumberInt2UintHelper / 2;
      jSWProtocol.ParseNumberUint2Int = function (int32Data) {
        var result = int32Data;
        if (int32Data > ParseNumberUint2IntHelper) {
          result -= TransNumberInt2UintHelper;
        }
        return result;
      }

      jSWProtocol.GetWalltime = function () {
        var wallTime = new proto.BVCU.PUConfig.WallTime();
        var myData = new Date();
        var info = {
          year: myData.getUTCFullYear(),
          month: myData.getUTCMonth(),
          day: myData.getUTCDay(),
          hour: myData.getUTCHours(),
          minute: myData.getUTCMinutes(),
          second: myData.getUTCSeconds()
        };
        var infoSetF = null;
        for (var iIndex in info) {
          infoSetF = wallTime["setI" + iIndex];
          infoSetF(info[iIndex]);
        }
        return wallTime;
      }


      jSWProtocol.GPSDatapb2Json = function (gpsdatapb) {
        var gpsdatajson = {};
        jSWProtocol.BasePbToJson(gpsdatapb, gpsdatajson);
        gpsdatajson.long = gpsdatajson.longitude;
        gpsdatajson.lat = gpsdatajson.latitude;
        return gpsdatajson;
      }

      function GetPbGetName(mysrcpb, handle, bToInt) {
        var myvalue = null;
        var myPbProName = "";
        for (var pbproName in mysrcpb.__proto__) {
          if (pbproName.indexOf("get") == 0) {
            if (pbproName.indexOf("JsPbMessageId") >= 0 || pbproName.indexOf("Extension") >= 0) {
              continue;
            }
            myvalue = mysrcpb[pbproName]();
            if (typeof myvalue == "number") {
              if (bToInt) {
                myvalue = jSWProtocol.ParseNumberUint2Int(myvalue);
              } else {
                myvalue = jSWProtocol.TransNumberInt2Uint(myvalue);
              }
            }
            myPbProName = pbproName.slice(3);
            myPbProName = myPbProName.indexOf("St") == 0 ? myPbProName.slice(2) : myPbProName.slice(1);
            handle(myPbProName, myvalue);
          }
        }
      }

      jSWProtocol.BasePbToJson = function (srcpb, desData) {
        GetPbGetName(srcpb, function (pbProName, proValue) {
          desData[pbProName] = proValue;
          if (typeof proValue == "object") {
            desData[pbProName] = {};
            jSWProtocol.BasePbToJson(proValue, desData[pbProName]);
          }
        }, true);
      }


      jSWProtocol.FTPFileInfoGPSInfo2Json = function (fTPFileInfoGPSInfopb) {
        var ftpFileInfopb = fTPFileInfoGPSInfopb.getFileinfo();
        var fileInfoJson = this.FTPFileInfo2Json(ftpFileInfopb);
        var szpuid = this.HexToString(fTPFileInfoGPSInfopb.getSzpuid());
        var szpuname = this.HexToString(fTPFileInfoGPSInfopb.getSzpuname());
        var szgpsdata = fTPFileInfoGPSInfopb.getSzgpsdataList();
        var data = {
          fileinfo: fileInfoJson,
          gpsdata:
          {
            szpuid: szpuid,
            szpuname: szpuname,
            szgpspoint: []
          }
        };

        var gpsdata = null;
        var gpsdatapb = null;
        for (gpsindex in szgpsdata) {
          gpsdatapb = szgpsdata[gpsindex];
          gpsdata = jSWProtocol.GPSDatapb2Json(gpsdatapb);
          data.gpsdata.szgpspoint.push(gpsdata);
        }

        return data;
      }

      jSWProtocol.FTPFileInfo2Json = function (fTPFileInfopb) {
        var fileinfo = {
          szFilePath: jSWProtocol.HexToString(fTPFileInfopb.getSzfilepath()),
          szFileName: jSWProtocol.HexToString(fTPFileInfopb.getSzfilename()),
          iTimeBegin: fTPFileInfopb.getItimebegin(),
          iTimeEnd: fTPFileInfopb.getItimeend(),
          iFileSize: fTPFileInfopb.getIfilesize()
        };
        return fileinfo;
      }

      jSWProtocol.CmsChannelInfo2Json = function (cmsChannelInfopb) {
        var json = {
          szID: null,
          iApplierID: 0,
          iMediaDir: 0,
          bOverTCP: 0
        };
        json.szID = cmsChannelInfopb.getSzid();
        json.iApplierID = cmsChannelInfopb.getIapplierid();
        json.iMediaDir = cmsChannelInfopb.getImediadir();
        json.bOverTCP = cmsChannelInfopb.getBovertcp();
        return json;
      }

      jSWProtocol.CmsDialogInfos2Json = function (CmsDialogInfospb) {
        var sz = [];
        var list = CmsDialogInfospb.getCmsdialoginfosList();
        list.forEach(function (item) {
          var cmsDialogInfo = {
            stRequestor: null,
            stTarget: null,
            szVTDUID: null,
            iChannelIndex: -1,
            iPathWay: 0
          };
          cmsDialogInfo.stRequestor = jSWProtocol.CmsChannelInfo2Json(item.getStrequestor());
          cmsDialogInfo.stTarget = jSWProtocol.CmsChannelInfo2Json(item.getSttarget());
          cmsDialogInfo.szVTDUID = item.getSzvtduid();
          cmsDialogInfo.iChannelIndex = item.getIchannelindex();
          cmsDialogInfo.iPathWay = item.getIpathway();
          sz.push(cmsDialogInfo);
        });
        return sz;
      }


      /*
      json = {
          puid: puid,
          permission: {
              config: puPermission.getConfig() == 1,
              channels: [
                  {
                      channelindex:
                      iscansee:
                  }
              ]
          }
      };
      */

      jSWProtocol.GroupPb_2Json = function (group_pb) {
        var userGroupJson = {
          id: group_pb.getSid(),
          name: group_pb.getSname(),
          parentid: group_pb.getSparentid()
        };

        return userGroupJson;
      }

      jSWProtocol.GroupInfoPb_2Json = function (groupinfo_pb, sessionHelper) {
        var resourcelist = groupinfo_pb.getPresourceList();
        var resources = this.BVCU_UCFG_Resource_Pb2Json(resourcelist, sessionHelper);

        var data = {
          id: groupinfo_pb.getSid(),
          name: groupinfo_pb.getSname(),
          parentid: groupinfo_pb.getSparentid(),
          description: groupinfo_pb.getSdescription(),
          resources: resources,
          allresources: jSWProtocol._GetAllRescources(sessionHelper, [])
        };
        return data;
      }

      jSWProtocol.USER_USERPb_2Json = function (user_pb) {
        var user = {
          id: user_pb.getSid(),
          groupid: user_pb.getSgroupid(),
          name: user_pb.getSname()
        };
        return user;
      }

      jSWProtocol.USER_USERINFO_Pb2Json = function (userinfo_pb, sessionHelper) {
        var resources = userinfo_pb.getPresourceList();
        resources = this.BVCU_UCFG_Resource_Pb2Json(resources, sessionHelper);
        var iSysadmin = userinfo_pb.getIsysadmin();
        var data = null;
        data = {
          sId: userinfo_pb.getSid(),
          sPasswd: userinfo_pb.getSpasswd(),
          bSetPasswd: userinfo_pb.getSpasswd().length > 0,
          sysadmin: {
            isGroup: ((iSysadmin & jSW.SwUserManager.SYSADMIN.GROUP) == jSW.SwUserManager.SYSADMIN.GROUP),
            isUser: ((iSysadmin & jSW.SwUserManager.SYSADMIN.USER) == jSW.SwUserManager.SYSADMIN.USER),
            isDev: ((iSysadmin & jSW.SwUserManager.SYSADMIN.DEV) == jSW.SwUserManager.SYSADMIN.DEV),
            isDevAss: ((iSysadmin & jSW.SwUserManager.SYSADMIN.DEVASS) == jSW.SwUserManager.SYSADMIN.DEVASS),
          },
          iPtz: userinfo_pb.getIptz(),
          sServerId: userinfo_pb.getSserverid(),
          sGroupId: userinfo_pb.getSgroupid(),
          iMaxSession: userinfo_pb.getImaxsession(),
          sAllocateId: userinfo_pb.getSallocateid(),
          sName: userinfo_pb.getSname(),
          sPhone: userinfo_pb.getSphone(),
          sEmail: userinfo_pb.getSemail(),
          sDescription: userinfo_pb.getSdescription(),
          Resource: resources
        };
        return data;
      }

      jSWProtocol.JsIMMSG2Pb = function (msgitems, pcallback) {
        var pbPaylod = new proto.BVCU.IM_Msgs();
        pbPaylod.rcallback = null;
        var msgitem = null;
        var msgitempb = null;
        var ImEmtion = jSW.DependencyMgr.GetEmotionSync();
        for (var iindex = 0; iindex < msgitems.length; iindex++) {
          msgitem = msgitems[iindex];
          msgitempb = pbPaylod.addSzmsgs();
          msgitempb.setItype(msgitem.iType);
          pbPaylod.iitemmsgtype = msgitem.iType;
          switch (msgitem.iType) {
            case jSWProtocol.IMMSGTypes.TEXT:
              msgitempb.setSztextmsg(msgitem.data);
              break;
            case jSWProtocol.IMMSGTypes.FACE:
              var eCId = ImEmtion.GetEmotionCode(msgitem.data);
              msgitempb.setSztextmsg(eCId);
              break;
            case jSWProtocol.IMMSGTypes.PICTURE:
            case jSWProtocol.IMMSGTypes.FILE:
              var imfile = new proto.BVCU.IM_File();
              imfile.setSzid(msgitem.nruid);
              imfile.setSzfilepath(msgitem.data);
              msgitempb.setStfile(imfile);
              pbPaylod.rcallback = pcallback;
              break;
            case jSWProtocol.IMMSGTypes.AUDIO:
              var imfile = new proto.BVCU.IM_File();
              imfile.setSzid(msgitem.nruid);
              imfile.setSzfilepath(msgitem.data);
              imfile.setIduration(msgitem.iduration);
              msgitempb.setStfile(imfile);
              pbPaylod.rcallback = pcallback;
              break;
            case jSWProtocol.IMMSGTypes.GPS:
              var gpsData = new proto.BVCU.PUConfig.GPSData();
              var curWTime = jSWProtocol.GetWalltime();
              gpsData.setSttime(curWTime);
              jSWProtocol.SetGpsData(gpsData, msgitem.data);
              msgitempb.setStgpsdata(gpsData);
              break;
            default:
              break;
          }
        }
        return pbPaylod;
      }

      jSWProtocol.BVCU_UCFG_Resource_Pb2Json = function (resource_pbs, sessionhelper) {
        var resource_pb = null;
        var resources = [];
        var resource = null;

        for (resourceindex in resource_pbs) {
          resource_pb = resource_pbs[resourceindex];
          resource = this._BVCU_UCFG_Resource_Pb2Json(resource_pb, sessionhelper);
          resources.push(resource);
        }
        return resources;
      }

      jSWProtocol._BVCU_DayTimeSlice_Pb2Json = function (bvcu_daytimeslice_pb) {
        var json = {
          iHourBegin: bvcu_daytimeslice_pb.getChourbegin(),
          iMinuteBegin: bvcu_daytimeslice_pb.getCminutebegin(),
          iSecondBegin: bvcu_daytimeslice_pb.getCsecondbegin(),
          iHourEnd: bvcu_daytimeslice_pb.getChourend(),
          iMinuteEnd: bvcu_daytimeslice_pb.getCminuteend(),
          iSecondEnd: bvcu_daytimeslice_pb.getCsecondend()
        }
        return json;
      }

      jSWProtocol.BVCU_DayTimeSlice_Pb2Json = function (bvcu_daytimeslice_pb) {
        var stday = bvcu_daytimeslice_pb.getStdayList();
        var json = {
          period0: {
            time: this._BVCU_DayTimeSlice_Pb2Json(stday[0].getSttime()),
            rco: this._OnlineControlOne_Pb2Json(stday[0].getStrco())
          },
          period1: {
            time: this._BVCU_DayTimeSlice_Pb2Json(stday[1].getSttime()),
            rco: this._OnlineControlOne_Pb2Json(stday[1].getStrco())
          },
          period2: {
            time: this._BVCU_DayTimeSlice_Pb2Json(stday[2].getSttime()),
            rco: this._OnlineControlOne_Pb2Json(stday[2].getStrco())
          },
          period3: {
            time: this._BVCU_DayTimeSlice_Pb2Json(stday[3].getSttime()),
            rco: this._OnlineControlOne_Pb2Json(stday[3].getStrco())
          },
          period4: {
            time: this._BVCU_DayTimeSlice_Pb2Json(stday[4].getSttime()),
            rco: this._OnlineControlOne_Pb2Json(stday[4].getStrco())
          },
          period5: {
            time: this._BVCU_DayTimeSlice_Pb2Json(stday[5].getSttime()),
            rco: this._OnlineControlOne_Pb2Json(stday[5].getStrco())
          },
        }
        return json;
      }

      jSWProtocol.BVCU_DayTimeSlice_Pb2JsonOnly = function (bvcu_daytimeslice_pb) {
        var stday = bvcu_daytimeslice_pb.getStdayList();
        var json = {
          period0: this._BVCU_DayTimeSlice_Pb2Json(stday[0]),
          period1: this._BVCU_DayTimeSlice_Pb2Json(stday[1]),
          period2: this._BVCU_DayTimeSlice_Pb2Json(stday[2]),
          period3: this._BVCU_DayTimeSlice_Pb2Json(stday[3]),
          period4: this._BVCU_DayTimeSlice_Pb2Json(stday[4]),
          period5: this._BVCU_DayTimeSlice_Pb2Json(stday[5])
        }
        return json;
      }

      jSWProtocol._OnlineControlOne_Pb2Json = function (onlinecontrolone_pb) {
        var json = {
          iTrigger: onlinecontrolone_pb.getItrigger(),
          iEvent: onlinecontrolone_pb.getIevent(),
          iOnlineTime: onlinecontrolone_pb.getIonlinetime(),
          iThrough: onlinecontrolone_pb.getIthrough()
        };
        return json;
      }

      jSWProtocol.Drivers2Json = function (drivers) {
        var driverPb = null;
        var PersonInfopb = null;
        var driverJson = null;
        var driverJsonArray = [];
        for (driverindex in drivers) {
          driverPb = drivers[driverindex];
          PersonInfopb = driverPb.getStpersoninfo();
          driverJson = {
            stPersonInfo: {
              szName: PersonInfopb.getSzname(),
              cGender: PersonInfopb.getCgender(),
              sAge: PersonInfopb.getSage()
            },
            szCardID: driverPb.getSzcardid(),
            szCertificateID: driverPb.getSzcertificateid(),
            szIssuingAgency: driverPb.getSzissuingagency()
          };
          driverJsonArray.push(driverJson);
        }
        return driverJsonArray;
      }

      jSWProtocol.ParamSearchList = function (pstSearchInfo, pstFilter) {
        var search = new proto.BVCU.Search.Search_Request();
        var searchInfo = new proto.BVCU.Search.SearchInfo();
        var filefilter = new proto.BVCU.Search.Search_FileFilter();
        var ichannelindex = pstFilter.iChannelIndex;

        searchInfo.setIcount(pstSearchInfo.iCount);
        searchInfo.setIpostition(pstSearchInfo.iPostition);
        searchInfo.setItype(pstSearchInfo.iType);

        filefilter.setSzpuid(pstFilter.szPUID);
        if (pstFilter.iChannelIndex == -1) {
          ichannelindex = 0xffffffff;
        }
        filefilter.setIchannelindex(ichannelindex);
        filefilter.setIfiletype(pstFilter.iFileType);
        filefilter.setItimebegin(pstFilter.iTimeBegin);
        filefilter.setItimeend(pstFilter.iTimeEnd);
        filefilter.setIfilesizemin(pstFilter.iFileSizeMin);
        filefilter.setIfilesizemax(pstFilter.iFileSizeMax);
        filefilter.setIrecordtype(pstFilter.iRecordType);
        filefilter.setSzdesc1(pstFilter.szDesc1);
        filefilter.setSzdesc2(pstFilter.szDesc2);
        filefilter.setItimecondition(pstFilter.iTimeCondition);

        search.setStsearchinfo(searchInfo);
        search.setStfilefilter(filefilter);

        return search;
      }

      jSWProtocol.JsonParamLogin = function (EmmsHeader, RequestHeader, BVCU_ServerParam) {
        this.emms = EmmsHeader;/**EmmsHeader API协议头。	M*/
        this.request = RequestHeader;
        this.param = BVCU_ServerParam;
      }

      jSWProtocol.JsonParamNoAttach = function (EmmsHeader, MSGType) {
        var request = new proto.WEBBVCU.Request();
        request.setEmms(EmmsHeader);
        request.setMsgtype(MSGType);
        return request;
      }

      jSWProtocol.JsonParamDialog = function (EmmsHeader, MsgType, dialogParam) {
        var request = new proto.WEBBVCU.Request();
        request.setEmms(EmmsHeader);
        request.setMsgtype(MsgType);
        request.setPayload(dialogParam.serializeBinary().buffer);
        request.setTargetid(dialogParam.getId());
        request.setTargetindex(dialogParam.getMajor());
        request.setHdlg(dialogParam.getHdlg());
        return request;
      }

      jSWProtocol.JsonParamTSPDialog = function (EmmsHeader, MsgType, Param) {
        var request = new proto.WEBBVCU.Request();
        request.setEmms(EmmsHeader);/**EmmsHeader API协议头。	M*/
        request.setMsgtype(MsgType);
        request.setPayload(Param.serializeBinary().buffer);
        return request;
      }

      jSWProtocol.JsonParamCommand = function (EmmsHeader, MsgType, request) {
        request.setEmms(EmmsHeader);
        request.setMsgtype(MsgType);
        return request;
      }

      jSWProtocol.txRequest = new Array(); // 记录已经发送的命令, 响应时调用响应的回调函数通知
      jSWProtocol.txRequestHelp = new Array();
      jSWProtocol.txGetRequestId = function () {
        var cmdId = -1, i = 0;
        for (; i < jSWProtocol.txRequest.length; i++) {
          if (jSWProtocol.txRequest[i] == null) {
            cmdId = i;
          }
        }
        if (-1 == cmdId) {
          cmdId = i;
          jSWProtocol.txRequest[i] = 1;
        }

        return cmdId;
      }

      jSWProtocol.txGetRequestRelayId = function () {
        var cmdId = -1, i = 0;
        for (; i < jSWProtocol.txRequestHelp.length; i++) {
          if (jSWProtocol.txRequestHelp[i] == null) {
            cmdId = i;
          }
        }
        if (-1 == cmdId) {
          cmdId = i;
          jSWProtocol.txRequestHelp[i] = 1;
        }

        return cmdId;
      }

      jSWProtocol.txSetRequestOption = function (requestId, option) {
        jSWProtocol.txRequest[requestId] = option;
      }

      jSWProtocol.txSetRequestHelperOption = function (requestId, option) {
        jSWProtocol.txRequestHelp[requestId] = option;
      }

      jSWProtocol.txGetRequestOption = function (requestId) {
        if (requestId >= 0 && requestId < jSWProtocol.txRequest.length) {
          return jSWProtocol.txRequest[requestId];
        }
        return null;
      }

      jSWProtocol.txGetRequestHelperOption = function (requestId) {
        if (requestId >= 0 && requestId < jSWProtocol.txRequestHelp.length) {
          return jSWProtocol.txRequestHelp[requestId];
        }
        return null;
      }

      jSWProtocol.txOnResponseUint8Array = function (requestId, szUint8) {
        var cmdId = requestId;
        var response = null;

        try {
          response = proto.WEBBVCU.Response.deserializeBinary(szUint8);
        }
        catch (e) {
          var err = jSWProtocol.HexToString(szUint8);
          jSWUtils.debugLog("deserialize protobuf error:" + err);
          jSWUtils.debugLog(e);
        }

        if (response) {
          cmdId = response.getId();

          // 根据Id找到对应的option
          options = jSWProtocol.txGetRequestOption(cmdId);

          if (-2017 == cmdId) {
            // -2017 是服务器通知Notify
            var emmsHeader = response.getEmms();
            var session = jSWUtils._getSessionById(emmsHeader.getSession());

            if (session) {
              if (options == null) {
                options = {
                  cmd: null,
                  callback: null
                }
              }
              session._internalNotify(options, response);
            } else {
              var msgType = response.getMsgtype();
              console.warn(msgType + 'session not found ' + emmsHeader.getSession());
            }
          }
          else {
            if (options) {
              jSWProtocol.txSetRequestOption(cmdId, null);

              // 回调
              if (options.success && typeof (options.success) == 'function') {
                options.success(response, 0);
              }
            }
          }
        }
      }

      jSWProtocol.txOnResponse = function (requestId, data) {
        var cmdId = requestId;
        var options = null;

        try {
          if (jSW._mMgr.bUseOcx()) {
            jSWProtocol.txOnResponseUint8Array(cmdId, data);
          } else {
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
              var result = reader.result;
              var arr = new Uint8Array(result);
              jSWProtocol.txOnResponseUint8Array(cmdId, arr);
            });
            reader.readAsArrayBuffer(data);
          }
        } catch (e) {
          console.error('error: ' + e);
          options = jSWProtocol.txGetRequestOption(cmdId);
          if (options) {
            jSWProtocol.txSetRequestOption(cmdId, null);

            // 回调
            if (options.error && typeof (options.error) == 'function') {
              options.error(options.option, data, 'get json object fail');
            }
          }
        }
      }


      jSWProtocol.testSend = "";
      /**发送请求, ajax post, options {
              session: this,
              cmd: 'login',
              request: request,
              tag: null,
              enforce: boolean,
              attchdata: ,
              callback: function(options, response) { }
          }*/
      jSWProtocol._internalSend = function (options) {
        var session = options.session;
        var request = options.request;

        var requestId = jSWProtocol.txGetRequestId();
        request.setId(Number(requestId));
        request.setRelayid(-1);
        if (options.attchdata != null) {
          var requestRelayId = jSWProtocol.txGetRequestRelayId();
          request.setRelayid(requestRelayId);
        }

        var src_data = null;
        var crypto_data = null;


        if (request.getMsgtype() == proto.WEBBVCU.MSGType.WEB_BVCU_GET_PUBKEY) {
          /**获取密钥, 暂时不加密*/
          console.log('获取公钥');
          crypto_data = request.serializeBinary();
        }
        else if (request.getMsgtype() == proto.WEBBVCU.MSGType.WEB_BVCU_LOGIN) {
          /**登录使用rsa密钥加密*/
          src_data = request.getPayload();
          crypto_data = jnRSA.RSA_Encrypt_32UIntTo8Array(session.pubkey_d, session.pubkey_n, src_data);
          request.setPayload(crypto_data);
          crypto_data = request.serializeBinary();

          console.log('登录:公钥 d:' + session.pubkey_d + ', n:' + session.pubkey_n);
        } else {
          if (session._serverConfig || (options.enforce != null && options.enforce)) {
            crypto_data = request.serializeBinary();
          } else {
            session._internalOnResponseFail(options, '', 'not login');
            return jSW.RcCode.RC_CODE_E_DISCONNECTED;
          }
        }

        if (crypto_data) {
          if (!jSW._mMgr.bUseOcx()) {
            crypto_data = crypto_data.buffer;
          }

          var ajax_options = {
            data: crypto_data,
            option: options,
            requestID: requestId,
            success: function (jsonObject, status) {
              session._internalOnResponseSuccess(options, jsonObject, status);
            },
            error: function (opt, responseText, errMsg) {
              session._internalOnResponseFail(options, responseText, errMsg);
            }
          };

          jSWProtocol.txSetRequestOption(requestId, ajax_options);
          if (options.attchdata != null) {
            jSWProtocol.txSetRequestHelperOption(requestRelayId, options.attchdata);
          }

          jSWProtocol.testSend = ajax_options.data;
          return session._send(ajax_options.data);
        }

        return jSW.RcCode.RC_CODE_E_FAIL;
      }



    })(jSWProtocol);



    // ---- SWCallbackManager ----
    jSW.SWCallbackManager = function (owner, events) {
      this.owner = owner;
      this.callbacks = {};
      for (var i = 0; i < events.length; i++) {
        this.callbacks[events[i]] = [];
      }
    };

    jSW.SWCallbackManager.prototype = {
      // The element on which callbacks will be triggered.
      owner: null,

      // An object of callbacks in the form
      //
      //     { event: function }
      callbacks: null,

      // Add a callback to this object - where the `event` is a string of
      // the event name and `callback` is a function.
      addCallback: function (event, callback) {
        if (typeof (callback) == 'function' && this.callbacks[event]) {
          this.callbacks[event].push(callback);
        }
      },

      // Remove a callback. The given function needs to be equal (`===`) to
      // the callback added in `addCallback`, so named functions should be
      // used as callbacks.
      removeCallback: function (event, callback) {
        if (typeof (callback) == 'function' && this.callbacks[event]) {
          var cbs = this.callbacks[event],
            len = cbs.length;
          for (var i = 0; i < len; i++) {
            if (cbs[i] === callback) {
              cbs.splice(i, 1);
              break;
            }
          }
        }
      },

      // Trigger a callback, passing it an object or string from the second
      // argument.
      dispatchCallback: function (event, message) {
        if (this.callbacks[event]) {
          for (var i = 0; i < this.callbacks[event].length; i += 1) {
            try {
              this.callbacks[event][i](this.owner, event, message);
            } catch (e) {
              console.error(e);
              // meh
            }
          }
        }
      }
    };

    (function (mMgr) {
      var bOcxWs = false;
      mMgr.bUseOcx = function () {
        return (bOcxWs) && jSWOptions.CheckOcx();
      }
      mMgr.bWsTest = function () {
        return false;
      }

      var bSeted = false;
      mMgr.setBUseOcxWs = function (bUse) {
        if (!bSeted) {
          bSeted = true;
          bOcxWs = bUse;
        } else {
          if (bOcxWs != bUse) {
            console.log("You Cann't Change The Ws Mode Right Now");
          }
        }
      }

      var bLoaded = false, bLoading = false;
      var swfobjectDir = "modules/oxWebSocket.js";
      mMgr.loadWebSocket = function (onLoadWsHasResult, session, tag) {
        if (mMgr.bUseOcx()) {
          if (!bLoaded && !bLoading) {
            bLoading = true;
            var brc = jSW.DependencyMgr.loadDependsProxy([swfobjectDir], null, function () {
              console.log("using ocx websocket");
              onLoadWsHasResult(session, tag, ocxWebSocketClass);
              bLoaded = true;
            }, null);
            if (!brc) {
              console.error("bad ocxWebsocketLoad");
            }
          } else if (bLoaded) {
            onLoadWsHasResult(session, tag, ocxWebSocketClass);
          }
        } else {
          console.log("using broswer websocket");
          onLoadWsHasResult(session, tag, WebSocket);
        }
      }

      mMgr.oWsOpen = function (ws) {
        if (this.bUseOcx()) {
          ws.open();
        }
      }

      var _ocxWsModuleTag = null, ocxWebSocketClass = null;
      mMgr.regOcxWebSocket = function (cWS, tag) {
        ocxWebSocketClass = cWS;
        ocxWebSocketClass.SetOcxHandle(_ocxHandle);
        _ocxWsModuleTag = tag;
      }

      mMgr.GetOcxWsTag = function () {
        return _ocxWsModuleTag;
      }

      var _ocxHandle = null;
      mMgr.RegOcxHandle = function (ocxHanlde) {
        _ocxHandle = ocxHanlde;
      }
    })(jSW._mMgr = jSW._mMgr || {});
  }

  jSW.DependencyMgr = new (function () {
    var _that = this,
      DependencyModuleName = "DependCollection",
      AfterAsyncLoadHasResult = function (tag) {
        var path = tag.getPath()
        if (path == null) {
          tag.emit();
        }
        else {
          AsyncLoadJsCss(path, AfterAsyncLoadHasResult, tag);
        }
      },

      AsyncLoadJsCss = function (desUrl, callback, tag) {
        var oEle = null, parentEle = null;
        if (desUrl.indexOf(".js") > 0) {
          oEle = document.createElement("script");
          oEle.src = desUrl;
          parentEle = jSW.DependencyMgr.GetJsEleContainer();
        } else if (desUrl.indexOf(".css") > 0) {
          oEle = document.createElement("link");
          oEle.type = "text/css";
          oEle.rel = "stylesheet";
          oEle.href = desUrl;
          parentEle = document.head;
        }
        if (oEle) {
          oEle.onload = function () {
            callback(tag);
            oEle.parentElement.removeChild(oEle);
          }
          parentEle.appendChild(oEle);
        }
      },
      LoadJsOrScript = function (depUrls, onLoadHasResult, userTag) {
        var desDUrls = depUrls;
        if (window.XMLHttpRequest) {
          var tag = {
            szPaths: desDUrls,
            index: 0,
            lastIndex: 0,
            getPath: function () {
              if (this.index < this.szPaths.length) {
                this.lastIndex = this.index;
                this.index++;
                return this.szPaths[this.lastIndex];
              }
              return null;
            },
            onResult: onLoadHasResult,
            emit: function () {
              if (this.onResult) {
                this.onResult(this.tag);
              }
            },
            tag: userTag
          };
          AfterAsyncLoadHasResult(tag);
          return true;
        }
        return false;
      },
      ModuleInfo = function (names, checkPromise) {
        this.names = names;
        this.promise = checkPromise;
        this.szNames = null;
      },
      loadGetPaths = function (szDpds, szPromise) {
        var proInfo = new ModuleInfo(szDpds, szPromise);
        return proInfo.GetAbsPath();
      },
      loadDependsProxy = function (szDpds, szPromise, onLoadHasResult, tag) {
        var szDesPath = loadGetPaths(szDpds, szPromise);
        var bResult = LoadJsOrScript(szDesPath, onLoadHasResult, tag);
        return bResult;
      },
      RegModule = function (moduleName, moduleEntity, bNotLog) {
        if (typeof _that[DependencyModuleName] == "undefined") {
          _that[DependencyModuleName] = {};
        };
        if (_that[DependencyModuleName][moduleName] == null) {
          if (!bNotLog) {
            console.log("[D] RegModule " + moduleName);
          }
          _that[DependencyModuleName][moduleName] = moduleEntity;
        }
        else { console.error("load dependency error"); }
      },
      InjectModule = function (module, afterInjectHandler) {
        return afterInjectHandler(module);
      },
      SyncGetModule = function (MN) {
        var desModules = _that[DependencyModuleName][MN];
        return desModules;
      },
      GetModuleEntiey = function (DMN, MN) {
        if (typeof _that[DependencyModuleName] == "undefined") {
          _that[DependencyModuleName] = {};
        };
        var desModules = _that[DependencyModuleName][MN];
        return desModules;
      },
      GetRegedModule = function (modeluName, modulePath, afterInjectHandler) {
        var desModules = GetModuleEntiey(DependencyModuleName, modeluName);
        if (desModules) {
          return InjectModule(desModules, afterInjectHandler);
        } else {
          loadDependsProxy([modulePath], null, function () {
            var desModules = GetModuleEntiey(DependencyModuleName, modeluName);
            InjectModule(desModules, afterInjectHandler);
          }, null);
        }
      };

    //videojs 中依赖这个 
    jSW.jswGetDependUrl = function (filename) {
      filename = "thlib/" + filename;
      var szPath = loadGetPaths([filename]);
      return szPath[0];
    }

    function onLoadResultProxy(onLoadHasResult, dMgr) {
      var szLoadFuncs = [
        dMgr.HandleResponseInJect,
        dMgr.ImEmotionInJect,
        dMgr.ConferenceInJect,
        dMgr.JswConstInJect,
        dMgr.JswImModuleInJect,
        dMgr.JswHttpFlvInJect,
        dMgr.AudioInJect,
        dMgr.AudioCaptureInJect,
        dMgr.HandleConfSpeakInJect
      ];
      var currentIndex = 0;
      var LoadFuncs = szLoadFuncs[currentIndex];

      var loadFunciont;

      return function (tag) {
        loadFunciont = function () {
          currentIndex++;
          if (currentIndex < szLoadFuncs.length) {
            LoadFuncs = szLoadFuncs[currentIndex];
            LoadFuncs.bind(dMgr)(loadFunciont);
          } else {
            onLoadHasResult(tag);
          }
        }
        LoadFuncs.bind(dMgr)(loadFunciont);
      }
    }

    this.GetJsEleContainer = function () {
      return document.body;
    }

    this.LoadProDepends = function (onLoadHasResult, tag) {
      var ProDepends = ["thlib/jquery-1.8.2.min.js", "bv.js", "utils/Base64.js", "utils/BigInt.js", "utils/jn_rsa.js"];
      var ProDependsPromise = ["jQuery", "proto", "Base64", "biFromNumber", "jnRSA"];
      return loadDependsProxy(ProDepends, ProDependsPromise, onLoadResultProxy(onLoadHasResult, this), tag);
    }

    this.LoadHttpDepends = function (onLoadHasResult, tag) {
      var HttpDepends = [
        "thlib/video.js",
        "thlib/videojs-contrib-hls.min.js",
        "thlib/videojs.zoomrotate.js",
        "thlib/video-js.min.css",
        "thlib/HttpFlv/flv.min.js",
        "thlib/pcm/pcm-player.min.js",
      ];
      return loadDependsProxy(HttpDepends, "videojs", onLoadHasResult, tag);
    }

    this.LoadOcxDepends = function (onLoadHasResult, tag) {
      var OcxDepends = ["thlib/jquery-playbar.js", "thlib/barstyle.css"];
      return loadDependsProxy(OcxDepends, null, onLoadHasResult, tag);
    }

    this.loadDependsProxy = loadDependsProxy;

    this.cmdParseInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "CmdParse");
    }

    this.ImEmotionInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "ImEmotion");
    }

    this.HandleResponseInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "HandleResponse");
    }

    this.ConferenceInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "Conference", "Conference/");
    }

    this.JswConstInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "jswConst");
    }

    this.JswImModuleInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "ImModule");
    }

    this.JswHttpFlvInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "HttpFlv");
    }

    this.AudioInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "Audio", "Audio/");
    }

    this.AudioCaptureInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "AudioCapture", "Audio/");
    }

    this.HandleConfSpeakInJect = function (afterInjectHandler, scope) {
      return this.moduleInjectUtil(afterInjectHandler, scope, "HandleConfSpeak", "Conference/");
    }



    this.GetEmotionSync = function () {
      return SyncGetModule("ImEmotion");
    }

    this.moduleInjectUtil = function (afterInjectHandler, scope, moduleName, prePath, bLoaded) {
      if (bLoaded) {
        (scope ? afterInjectHandler.bind(scope) : afterInjectHandler)();
        return result;
      }
      var modulePath = "modules/" + (prePath ? prePath : "") + moduleName + ".js";
      var result = GetRegedModule(moduleName, modulePath, scope ? afterInjectHandler.bind(scope) : afterInjectHandler);
      return result;
    }


    var _jSWHostSaved = null;
    this.jSWGetHost = function jswGetHost() {
      if (_jSWHostSaved) {
        return _jSWHostSaved;
      }
      var list = document.getElementsByTagName('script');
      var jsScript = null;
      for (var iIndex = 0; iIndex < list.length; iIndex++) {
        if (list[iIndex].src.indexOf("jsw.js") >= 0) {
          jsScript = list[iIndex];
          break;
        }
      }
      if (!jsScript) {
        console.error("you can not modify the name of jsw.js, please check");
        return null;
      }
      _jSWHostSaved = jsScript.src.split("jsw.js")[0];
      return _jSWHostSaved;
    };

    ModuleInfo.prototype = {
      dependencyRelativePath: "jswlib/",
      proJswPath: null,
      GetAbsPath: function () {
        if (this.szNames == null) {
          this.szNames = [];
          if (this.proJswPath == null) {
            this.proJswPath = this._getJswProPath();
          }
          var tempPath = "";
          for (var iIndex = 0; iIndex < this.names.length; iIndex++) {
            if (!this.checkAllPromise(iIndex)) {
              tempPath = this.proJswPath + this.dependencyRelativePath + this.names[iIndex];
              this.szNames.push(tempPath);
            }
          }
        }
        return this.szNames;
      },
      _getJswProPath: this.jSWGetHost,
      checkAllPromise: function (iIndex) {
        var proExp = "((typeof (pl) != 'undefined'))";
        if (!this.promise) {
          return false;
        }
        if (this.promise instanceof Array) {
          proExp = proExp.replace("pl", this.promise[iIndex]);
        } else {
          proExp = proExp.replace("pl", this.promise);
        }
        return eval(proExp);
      }
    }

    //外部依赖
    this.RegModule = RegModule;
    this.CreateModule = function (name) {
      var module = {};
      this.RegModule(name, module, true);
      return module;
    }

    this.GetModule = function (name) {
      return GetModuleEntiey("", name)
    }
  })();

  jSWInit();
})(jSW);


String.prototype.startsWith = function (str) {
  return this.indexOf(str) == 0;
};