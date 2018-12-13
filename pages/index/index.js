//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo:'',
    accountInfo:'',
    userAppData: { "licenses": 0, "projects": 0, "trate": 0, "dailys-m": 0, "trate-m": 0, "dailys-beforday": 0},
    messageNumber:'0',
    menusPower: {},
    testId:'0'
  },
  onLoad(){
    let _this = this;
    var accountInfo = wx.getStorageSync('accountInfo');
    if (accountInfo){
      _this.setData({
        accountInfo: accountInfo
      });
    }
    
  },
  powerAuth(){
    var _this=this;
    var menus = app.globalData.accountInfo.paths;
    menus.forEach((item, index)=>{
        if(item.indexOf('license/manage')>0){
          _this.data.menusPower.licensePower=true
        }
    });
    _this.setData({
      menusPower: _this.data.menusPower
    })
  },
  onShow() {
    this.wxUpdate()
    if (app.globalData.userid) {
      this.updateMes();
      this.getTestId();
      this.getMesNum()
    }
   
  },
  wxUpdate(){
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '更新提示',
              content: '新版本已经上线，请您删除当前小程序，重新搜索打开',
            })
          })
        }
      })
    }
  },
  getMesNum(){
    let _this = this;
    wx.request({
      url: app.globalData.smsurl + '/message/getnumber',
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        _this.setData({
          messageNumber: res.data.count
        })
      }
    });
  },
  getTestId(){
    let _this = this;
    wx.request({
      url: app.globalData.smsurl + '/chat/getFormidLength?appid=' + app.globalData.appid + '&openid=' + app.globalData.openid,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        _this.setData({
          testId: res.data.numbers
        })
      }
    });
  },
  reloadImg(){
    this.updateMes();
    this.getTestId()
  },
  updateMes(){
    let _this = this;
    wx.request({
      url: app.globalData.url + '/getuser',
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        res.data.head = res.data.head.replace(/\\/g, '/');
        app.globalData.accountInfo = res.data;
        _this.setData({
          userInfo: app.globalData.userInfo,
          accountInfo: app.globalData.accountInfo
        });
        wx.setStorageSync('accountInfo', app.globalData.accountInfo);
        _this.powerAuth()
      }
    });
    wx.request({
      url: app.globalData.url + '/getuserlist',
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        app.globalData.allPeople = res.data;
        // _this.globalData.allPeople = res.data.filter((item)=>{
        //  item.head = item.head.replace(/\\/g, '/');
        //    return item.state==0;
        // });
        app.globalData.allPeople.map((value, index, array) => {
          value.head = value.head.replace(/\\/g, '/');
          app.globalData[value.code] = value
        })

      }
    });
    wx.request({
      url: app.globalData.url + '/project/number',
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        _this.setData({
          userAppData: res.data
        })
      }, fail() {

      }
    });
  },
  openPage(e){
      var url=e.currentTarget.dataset.url;
      setTimeout(function(){
        wx.navigateTo({
          url: url
        })
      },200)
  },
  loginOut() {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      confirmColor: "#3e8ef7",
      success(res) {
        if (res.confirm) {
        //  wx.request({
         //   url: app.globalData.smsurl + '/chat/unUserbind?appid=' + app.globalData.appid + '&openid=' + app.globalData.openid,
         //   method: 'GET',
          //  header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
          //  success(res) {
          //    console.log(res)
           //   if (res.data.errorcode == '0000') {
           //   }
          //  },
          //  fail() {
           //   wx.showToast({
            //    title: '解绑失败',
            //    icon: 'success',
            //    image: '../../images/warning.png',
            //    duration: 2000
            //  });
          //  }

         // });
          wx.request({
            url: app.globalData.url + '/logout',
            method: 'GET',
            header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
            success(res) {
              if (res.data.errorcode == '0000') {
                wx.setStorageSync('userid', '');
                wx.setStorageSync('username', '');
                wx.setStorageSync('usercode', '');
                wx.setStorageSync('openid', '');
                wx.setStorageSync('userInfo', '');
                wx.setStorageSync('useraccount', '');
                app.globalData.userInfo = '';
                app.globalData.openid = '';
                app.globalData.useraccount = '';
                app.globalData.userid = '';
                app.globalData.username = '';
                app.globalData.usercode = '';
                wx.reLaunch({
                  url: '../auth/auth'
                })
              } else {
                wx.showToast({
                  title: res.data.errormessage,
                  icon: 'success',
                  image: '../../images/warning.png',
                  duration: 2000
                });
              }
            },
            fail() {
              wx.showToast({
                title: '解绑失败',
                icon: 'success',
                image: '../../images/warning.png',
                duration: 2000
              });
            }

          })
        } else if (res.cancel) {

        }
      }
    })
  },
  formSubmit(e) {
    var form_id = e.detail.formId;
    wx.request({
      url: app.globalData.smsurl + '/chat/saveformid?formid=' + form_id + '&openid=' + app.globalData.openid + '&appid=' + app.globalData.appid,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      method: 'GET',
      success(res) {
      },
      fail(res) {
      }
    })
  }
})
