// pages/score/score.js
const app = getApp();
Page({

  data: {
  score:'0',
  difference:'0',
  raise:true
  },
  onLoad(options) {
    this.loadData()
  },
  loadData(){
  var _this = this;
  wx.request({
    url: app.globalData.url + '/integral/query',
    method: 'GET',
    data: {},
    header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
    success(res) {
      var raise = res.data.difference>=0?true:false
      _this.setData({
        difference: Math.abs(res.data.difference),
        score: res.data.number,
        raise: raise
      })

    }, fail() {

    }
  });
}
})