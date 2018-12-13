// pages/message/message-img-list/message-img-list.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longTapBtn:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  removeItem: function (e) {
    var _this = this;
    if (!_this.data.longTapBtn) {
      _this.data.longTapBtn = true;
      //var data = [e.currentTarget.dataset.mid];

      wx.showModal({
        title: '提示',
        content: '确认删除此条信息？',
        confirmColor: "#3e8ef7",
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.smsurl + '/message/delete',
              method: 'POST',
              data: data,
              header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
              success: function (res) {
                if (res.data.errorcode == '0000') {
                  _this.loadData("refresh", true)
                }
                _this.data.longTapBtn = false;
              },
              fail: function () {
                _this.data.longTapBtn = false;
                wx.showToast({
                  title: '解绑失败',
                  icon: 'none',
                  duration: 2000
                });
              }

            })
          } else if (res.cancel) {
            _this.data.longTapBtn = false;
          }
        }
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  openPage(e) {
    if (this.data.longTapBtn) return;
    var url = e.currentTarget.dataset.url;
    setTimeout(()=>{
      wx.navigateTo({
        url: url
      })
    }, 200)
  },

  formSubmit(e) {
    app.formSubmit(e)
  }
})