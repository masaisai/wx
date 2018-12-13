// pages/auth/auth.js
const app = getApp()
Page({
  data: {
  focusStyle:{
    usercodeFocus:false,
    passwordFocus:false,
    usercode:'',
    password:''
  },
  errorMes:"",
  btnDisable:false
  },
  submit(e){
    var _this = this;
    var usercode = e.detail.value.usercode.replace(/ /g, '');
    var password = e.detail.value.password.replace(/ /g, '');
    _this.setData({
      btnDisable: true,
      usercode: usercode,
      password: password
    });
  },
  getUserInfo(e) {
    //var _this = this;
    this.setData({
      userInfo: e.detail.userInfo
    });
    this.login(). //管理系统登录
      then((binduser) => { return this.getWeChatOpenId(binduser) }).  //获取微信账号openid
      then(({ binduser, openid, appid }) => { return this.getWeChatInfo(binduser, openid, appid) }).  //获取微信账号详细信息 
      then(({ binduser, openid, appid, userInfo }) => { return this.registerUser(binduser, openid, appid, userInfo) }).//微信用户注册账号
      then(() => { this.getUserlist() })
  },
  login(){
    var _this = this;
      return new Promise((resovle, reject) => {
        wx.request({
          url: app.globalData.url + '/login?usercode=' + _this.data.usercode + '&password=' + _this.data.password,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          success(res) {
            app.globalData.userid = res.data.openid;
            app.globalData.username = res.data.name;
            app.globalData.usercode = res.data.usercode;
            wx.setStorageSync('userid', res.data.openid);
            wx.setStorageSync('username', res.data.name);
            wx.setStorageSync('usercode', res.data.usercode);
            if (res.data.usercode) {
              var binduser = res.data.usercode;
              resovle(binduser)
              //_this.getWeChatOpenId(binduser, _this)
            } else {
              _this.setData({
                errorMes: '用户名或密码错误',
                btnDisable: false
              });
            }
          },
          fail(res) {
            _this.setData({
              errorMes: '网络错误',
              btnDisable: false
            });
          }
        })
      })  
  },
  getWeChatOpenId(binduser) {    //获取微信账号openid
    var _this=this;
      return new Promise((resovle, reject) => {
        wx.login({
          success(loginCode) {
            var appid = app.globalData.appid; //填写微信小程序appid  
            var secret = app.globalData.secret; //填写微信小程序secret 
            wx.request({
              url: app.globalData.url + '/jscode2session?appid=' + appid + '&secret=' + secret + '&code=' + loginCode.code + '&grant_type=authorization_code',
              method: 'POST',
              header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
              success(res) {
                if (res.statusCode == 200) {
                 // _this.getWeChatInfo(binduser, res.data.openid, appid)
                  var openid = res.data.openid;
                  resovle({ binduser, openid, appid})
                } else {
                  _this.setData({
                    errorMes: '获取用户信息失败',
                    btnDisable: false
                  });
                }
              },
              fail(res) {
                _this.setData({
                  errorMes: '获取用户信息失败',
                  btnDisable: false
                });
              }
            })


          }
        });
      })
    
   
  },
 
  getWeChatInfo(binduser, openid, appid) { //获取微信账号详细信息
    var _this=this;
      return new Promise((resovle, reject) => {
        if (_this.data.userInfo) {
         // _this.registerUser(binduser, openid, appid, _this.data.userInfo)
          var userInfo = _this.data.userInfo;
          resovle({ binduser, openid, appid, userInfo })
        } else {
          setTimeout(() => {
            if (_this.data.userInfo) {
            //  _this.registerUser(binduser, openid, appid, _this.data.userInfo)
              var userInfo = _this.data.userInfo;
              resovle({ binduser, openid, appid, userInfo})
            } else {
              _this.setData({
                errorMes: '获取用户信息失败',
                btnDisable: false
              });
            }
          }, 200)
        }
      })
  
  },
  registerUser(binduser, openid, appid, userInfo) { //微信用户注册账号
    var _this = this;
  var data={
    binduser:binduser,
    openid:openid,
    appid:appid,
    nickName:userInfo.nickName,
    gender:userInfo.gender,
    city:userInfo.city,
    country:userInfo.country,
    province:userInfo.province,
    language:userInfo.language,
    avatarUrl:userInfo.avatarUrl
  }
  data = encodeURI(JSON.stringify(data));
    return new Promise((resovle, reject) => {
      wx.request({
        url: app.globalData.smsurl + '/chat/register',
        method: 'POST',
        data: data,
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) {
          if (res.data.errorcode == "0000") {
            wx.setStorageSync('openid', openid);
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('useraccount', binduser);
            app.globalData.openid = openid;
            app.globalData.userInfo = userInfo;
            app.globalData.useraccount = binduser;
            _this.setData({
              btnDisable: false
            });
           // _this.getUserlist();
           
            resovle()
          } else {
            _this.setData({
              errorMes: '请求出错',
              btnDisable: false
            });
          }
        },
        fail(res) { }
      })
    })
  },
  getUserlist() { //获取所有员工信息
    wx.request({
      url:app.globalData.url + '/getuserlist',
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        app.globalData.allPeople = res.data;
       // app.globalData.allPeople = res.data.filter((item) => {
        //  item.head = item.head.replace(/\\/g, '/');
        //  return item.state == 0;
       // });
        app.globalData.allPeople.map((value, index, array) => {
          value.head = value.head.replace(/\\/g, '/');
          app.globalData[value.code] = value
        })
        wx.reLaunch({
          url: '../index/index'
        })
      }
    })
  },
  clearError(){
    this.setData({
      errorMes: ''
    })
  },
inputfocus(e){
  var _this=this;
  if (e.currentTarget.dataset.type=='usercode'){
    _this.setData({
      focusStyle:{
        usercodeFocus:true
      }
    })
  } else if(e.currentTarget.dataset.type == 'password'){
    _this.setData({
      focusStyle: {
        passwordFocus: true
      }
    })
  }

},
inputblur(e) {
    var _this = this;
    if (e.currentTarget.dataset.type == 'usercode') {
      _this.setData({
        focusStyle: {
          usercodeFocus:false
        }
      })
    } else if (e.currentTarget.dataset.type == 'password') {
      _this.setData({
        focusStyle: {
          passwordFocus: false
        }
      })
    }
  }
})