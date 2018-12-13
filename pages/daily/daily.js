// pages/daily/daily.js
const app = getApp()
Page({
  data: {
    cardHeight: '800rpx',
    skiphiddenitemlayout:false,
    circular:false,
    dailyData: [],
    loading:true,
    currentIndex:'0',
    pageNumber: '0',
    total: '0'
   
  },

  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight -80 + 'px'
    });
    this.loadData();
  },
  loadData() {
    var _this = this;
    wx.request({
      url: `${app.globalData.url}/daily/find?`, 
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
       // wx.setNavigationBarTitle({
         // title: `日报（${res.data.total}）`,
       // })
        _this.setData({
          total: res.data.total
        })
        if ( res.data.data.length>0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        var resData = res.data.data||[];
        var dailyData = [];
        resData.map((item,index)=>{
          item.name = app.globalData[item.createuser].name;
          item.head = app.globalData[item.createuser].head;
          dailyData.push(item);
        })
        _this.setData({
          dailyData: dailyData,
          loading:false
        });
       
      }, fail(){}
    });
  },

  edit(e){
    var dataset = e.currentTarget.dataset;
    setTimeout(()=>{
      wx.navigateTo({
        url: `./add-daily/add-daily?type=edit&id=${dataset.id}&proid=${dataset.proid}&proname=${dataset.proname}&content=${dataset.content}&consume=${dataset.consume}&workday=${dataset.workday}&tasktype=${dataset.tasktype}`
      })
       
    }, 100)
    
  },
  remove(e){
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确认删除此条日报？',
      confirmColor: "#3e8ef7",
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + '/daily/deletedaily?id=' + e.currentTarget.dataset.id + '&state=' + e.currentTarget.dataset.state,
            method: 'GET',
            data: {},
            header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
            success(res) {
              if (res.data&&res.data.errorcode == '0000') {
                _this.loadData();
              }else{
                wx.showToast({
                  title: '删除失败',
                  icon: 'success',
                  image: '../../images/warning.png',
                  duration: 2000
                });
              }
            },
            fail(){}
          })
        } else if (res.cancel){}
      }
    })
  },
  swiperChange(e) {
    var _this = this;
      _this.setData({
        pageNumber: e.detail.current + 1 - _this.data.total > 0 ? _this.data.total : e.detail.current + 1
      })
    
   
  },
  addDaily(){
    setTimeout(()=>{
      wx.navigateTo({
        url: '../daily/add-daily/add-daily',
      })
    },100)
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