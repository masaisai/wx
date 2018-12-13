// pages/book-borrowing/book-borrowing.js
var app = getApp()
Page({
  data: {
    currentIndex:'0',
    accountInfo:'',
    hasLoadData0:false,
    hasLoadData1: false,
    pageIndex0:0,
    pageSize0:10,
    pageIndex1: 0,
    pageSize1: 10,
    noBackBook:[],
    bookData:[],
    total0:'0',
    total1: '0'
  },

  onLoad(options) {
  this.setData({
    accountInfo: app.globalData.accountInfo
  });
  var params = 'pageIndex=' + this.data.pageIndex0 + '&pageSize=' + this.data.pageSize0;
  this.loadData0(params);
  var params = 'pageIndex=' + this.data.pageIndex1 + '&pageSize=' + this.data.pageSize1;
  this.loadData1(params)
  },
loadData0(params){
  var _this=this;
    wx.request({
      url: app.globalData.url + '/book/mine?' + params,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
       if(res.statusCode==200){
         if (res.data.data.length==0){
           _this.setData({
             pageIndex0:_this.data.pageIndex0--
           })
         }
         res.data.data.map((item, index) => {
           _this.data.noBackBook.push(item)
         });
         _this.setData({
           hasLoadData0: true,
           total0: res.data.total,
           noBackBook: _this.data.noBackBook
         });
       }
        
      }, fail() {

      }
    });
  
},
loadData1(params) {
  var _this = this;
    wx.request({
      url: app.globalData.url + '/book/find?' + params,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        if(res.statusCode==200){
          if (res.data.data.length == 0) {
          _this.setData({
            pageIndex1: _this.data.pageIndex1--
          })
        }
        res.data.data.map((item,index)=>{
          if (item.userid){
            item.username = app.globalData[item.userid].name;
          }
          _this.data.bookData.push(item)
        });
        _this.setData({
          hasLoadData1: true,
          total1: res.data.total,
          bookData: _this.data.bookData
        });
        }
      }, fail() {

      }
    });
},



  onReachBottom() {
var _this=this;
   // if (_this.data.currentIndex == 0) {
    //  _this.data.pageIndex0++;
    //  var params = 'pageIndex=' + _this.data.pageIndex0 + '&pageSize=' + _this.data.pageSize0;
    //  _this.loadData0(params)
    // } else
      if (_this.data.currentIndex == 1){
      _this.data.pageIndex1++;
      var params = 'pageIndex=' + _this.data.pageIndex1 + '&pageSize=' + _this.data.pageSize1;
      _this.loadData1(params)
    }
  },
  openPage(e){
    if(e.currentTarget.dataset.state==0){
      wx.navigateTo({
        url: 'book-detail/book-detail?id=' + e.currentTarget.dataset.id,
      })
   }
    
  },
  scanCode(){
    wx.scanCode({
      scanType: 'barCode',
      success(res){
        wx.navigateTo({
          url: 'book-detail/book-detail?id='+res.result,
        })
      }
    })
    
  },
  switchTab(e){
    this.setData({
      currentIndex: e.currentTarget.dataset.currentindex
    });
    
  }
})