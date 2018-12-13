// pages/book-borrowing/book-detail/book-detail.js
var app = getApp()
Page({
  data: {
  id:'',
  bookData:{},
  disabled: false
  },
  onLoad(options) {
    var _this=this;
    _this.setData({
      id: options.id
    })
    wx.request({
      url: app.globalData.url + '/book/findById?id=' + options.id,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.statusCode == 200 && res.data) {
            res.data.borrowers=[];
            res.data.users.forEach((item,index)=>{
              res.data.borrowers.push(app.globalData[item].head);
            })
          
          _this.setData({
            bookData:res.data
          })
        
        }else{
          _this.setData({
            noData:true
          })
        }
      }, fail() {

      }
    });
  },
  borrowing(){
    var _this = this;
    wx.request({
      url: app.globalData.url + '/book/borrowing?id=' + this.data.id,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
       if(res.data.errorcode=='0000'){
         wx.showToast({
           title: '借阅成功',
           icon: 'success',
           duration: 2000
         });
         var pages = getCurrentPages();
         var currPage = pages[pages.length - 1];   //当前页面
         var prevPage = pages[pages.length - 2];  //上一个页面
         prevPage.data.pageIndex0=0;
         prevPage.data.pageIndex1 = 0;
         prevPage.data.noBackBook=[];
         prevPage.data.bookData = [];
         var params = 'pageIndex=' + prevPage.data.pageIndex0 + '&pageSize=' + prevPage.data.pageSize0;
         prevPage.loadData0(params);
         var params = 'pageIndex=' + prevPage.data.pageIndex1 + '&pageSize=' + prevPage.data.pageSize1;
         prevPage.loadData1(params)
         wx:wx.navigateBack();
       }else{
         wx.showToast({
           title:res.data.errormessage,
           icon: 'none',
           duration: 2000
         });
         _this.setData({
           disabled: true
         })
       }
      }, fail() {

      }
    });
  }
})