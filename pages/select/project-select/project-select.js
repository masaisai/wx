const app = getApp()
Page({
  data: {
    proid: '',
    currentIndex: null,
    projectData: [],
    showBottom: false,
    showNoData: false,
    pageIndex: 0,
    pageSize: 30,
    loadBtn: false,
    key: ''
  },
  onLoad(options) {
    var _this = this;
    wx.showLoading({
      title: '加载中'
    })
    this.setData({
      proid: options.proid
    })
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
    _this.loadData(params, 'load', _this.data.proid)
  },
  loadData(params, type, proid,data) {
    var _this = this;
    if (type == "refresh") {
      wx.showNavigationBarLoading() //在标题栏中显示加载
    }
    
    wx.request({
      url: app.globalData.url + '/project/query?' + params, //仅为示例，并非真实的接口地址
      method: 'POST',
      data:data,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003') {
          app.loginOut()
        }
        var proData = res.data.data || [];
        var objData = [];
        if (type == "load") {
          objData = _this.data.projectData;
          if (proData.length > 0) {
            var pageIndex = _this.data.pageIndex + 1;
            _this.setData({ pageIndex: pageIndex });

          } else {
            _this.setData({ showNoData: true });
            setTimeout(()=>{
              _this.setData({ showNoData: false });
            }, 1000)
          }
          _this.setData({ showBottom: false });
        } else if (type == "search") {
          var pageIndex = _this.data.pageIndex + 1;
          _this.setData({ pageIndex: pageIndex });
        } else {
          var pageIndex = _this.data.pageIndex + 1;
          _this.setData({ pageIndex: pageIndex });
          setTimeout(()=>{
            wx.hideNavigationBarLoading() //完成停止加载
            wx.stopPullDownRefresh() //停止下拉刷新
          }, 300)
        }


        for (let i = 0; i < proData.length; i++) {
          let obj = {};
          for (let k in proData[i]) {
            if (k.toLowerCase() == 'updatetime') {
              obj[k.toLowerCase()] = proData[i][k].substring(0, 10);
            } else {
              obj[k.toLowerCase()] = proData[i][k];
            }

          }
          objData.push(obj);
        }
        _this.setData({
          projectData: objData
        });
        _this.setData({ loadBtn: true });
        wx.hideLoading()

        for (var i = 0; i < _this.data.projectData.length; i++) {
          if (proid == _this.data.projectData[i].id) {
            _this.setData({ currentIndex: i })
          }
        }
      },
      fail(res) {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideLoading();
        _this.setData({
          network: false
        });
      }
    });
  },
  onPullDownRefresh() {
    this.setData({
      pageIndex: 0
    });
    if (this.data.showNoData) { this.setData({ showNoData: false }); }
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize + '&key=' + this.data.key;
    this.loadData(params, 'refresh', this.data.proid);
  },
  onReachBottom() {
    var _this = this;
    if (_this.data.loadBtn) {
      this.setData({ loadBtn: false });
      if (this.data.showNoData) { this.setData({ showNoData: false }); }
      this.setData({ showBottom: true });
      var pageIndex = _this.data.pageIndex + 1;
      var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize + '&key=' + _this.data.key;
      this.loadData(params, 'load', _this.data.proid);
    }

  },

  bindKeyInput(e) {
    this.setData({
      key: e.detail.value,
      pageIndex: 0
    })
    if (this.data.showNoData) { this.setData({ showNoData: false }); }
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
    var data = encodeURI(JSON.stringify({ 'key': this.data.key}));
    this.loadData(params, 'search', this.data.proid,data);
  },
  inputConfirm(e) {

  },
  confirmSelect(e) {
    var index = e.currentTarget.dataset.index;
    var proid = e.currentTarget.dataset.proid;
    var proname = e.currentTarget.dataset.proname;
    this.setData({ currentIndex: index });
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      proid: proid,
      proname: proname
    })


   setTimeout(()=>{
     wx.navigateBack()
   },100)
  },
  formSubmit(e) {
    var form_id = e.detail.formId;
    wx.request({
      url: app.globalData.smsurl + '/chat/saveformid?formid=' + form_id + '&openid=' + app.globalData.openid + '&appid=' + app.globalData.appid,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      method: 'GET',
      success(res) {
        if (res.data.errorcode == '0003') {
          app.loginOut()
        }
      },
      fail(res) {
      }
    })
  }
})