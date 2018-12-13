// pages/message/message-detail/message-detail.js
const app = getApp();
Page({
  data: {
  id:'',
  mid:'',
  messageData:{}
  },

  onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
  this.setData({
    id:options.id,
    mid:options.mid
  });
  this.loadData();
  var mids = [options.mid];
  this.loadRead(mids);
  },
  loadData() {
    var _this = this;
    console.log(app.globalData.smsurl + '/message/findById?id=' + this.data.id)
    wx.request({
      url: app.globalData.smsurl + '/message/findById?id='+ this.data.id,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        res.data.fromname = app.globalData[res.data.fromuser].name;
        _this.setData({
          messageData: res.data
        });
        wx.hideLoading()
      }, fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误'
        })
      }
    })

  },
  loadRead(mids) {
    var _this = this;
    wx.request({
      url: app.globalData.smsurl + '/message/updatetoread',
      data: mids,
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
      },
       fail(res) {
      }
    })
  },
  previewImag(e){
    wx.previewImage({
      current: '',
      urls: [e.currentTarget.dataset.url],
      success(res) { },
      fail(res) { }
    })
  },
})