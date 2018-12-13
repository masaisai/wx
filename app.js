//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    var _this = this;
    var userInfo = wx.getStorageSync('userInfo');
    var openid = wx.getStorageSync('openid');
    var userid = wx.getStorageSync('userid');
    var username = wx.getStorageSync('username');
    var useraccount = wx.getStorageSync('useraccount');
    var usercode = wx.getStorageSync('usercode');
    if (userInfo && openid && useraccount && userid) {
      _this.globalData.userInfo = userInfo;
      _this.globalData.openid = openid;
      _this.globalData.useraccount = useraccount;
      _this.globalData.userid = userid;
      _this.globalData.username = username;
      _this.globalData.usercode = usercode;
      wx.request({
        url: _this.globalData.url + '/getuserlist',
        method: 'GET',
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': _this.globalData.userid },
        success(res) {
          if (res.data.errorcode == '0003'||res.data.errorcode == '0014'){
            _this.loginOut()
          }
          _this.globalData.allPeople = res.data;
         // _this.globalData.allPeople = res.data.filter((item)=>{
          //  item.head = item.head.replace(/\\/g, '/');
          //    return item.state==0;
         // });
          _this.globalData.allPeople.map((value, index, array)=>{
            value.head= value.head.replace(/\\/g,'/');
            _this.globalData[value.code] = value
          })
         
        }
      })
    }
    else {
     wx.reLaunch({
       url: 'pages/auth/auth',
     })
     
    }
  
  },
  formSubmit(e) {  //存储formid，用于微信推送
    var form_id = e.detail.formId;
    wx.request({
      url: this.globalData.smsurl + '/chat/saveformid?formid=' + form_id + '&openid=' + this.globalData.openid + '&appid=' + this.globalData.appid,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': this.globalData.userid },
      method: 'GET',
      success(res) {
      },
      fail(res) {
      }
    })
  },
  loginOut() {
    wx.setStorageSync('userid', '');
    wx.setStorageSync('username', '');
    wx.setStorageSync('usercode', '');
    wx.setStorageSync('openid', '');
    wx.setStorageSync('userInfo', '');
    wx.setStorageSync('useraccount', '');
    this.globalData.userInfo = '';
    this.globalData.openid = '';
    this.globalData.useraccount = '';
    this.globalData.userid = '';
    this.globalData.username = '';
    this.globalData.usercode = '';
    wx.reLaunch({
      url: "/pages/auth/auth"
    })
  },
  globalData: {
    userInfo: null, //微信账号信息
    accountInfo: null, //管理系统账号信息
    openid: "", //微信openid
    userid: "", //管理系统用户openid
    appid: 'wx0718325e0155c5a3',
    secret: '4bcbc8c8a29c2811d3a0476fe6990515',
    useraccount: '', //用户绑定账号
    ip: 'https://www.ruixi.cn',
    url: "https://www.ruixi.cn/mobile",
    smsurl: 'https://www.ruixi.cn/sms',
    username: '', //用户姓名
    usercode: '', //用户姓名拼音
    allPeople: [] //所有用户信息
   
  }
})
//http://36.152.37.254:6082
//https://www.ruixi.cn
//ip: 'http://10.10.10.108:8089',
//url: "http://10.10.10.108:8082/mobile",
//smsurl: 'http://10.10.10.108:8088/sms',

