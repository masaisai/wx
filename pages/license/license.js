// pages/license/license.js
const app = getApp();
Page({
  data: {
    cardHeight: '800rpx',
    editionArray:[],
    pageIndex: 0,
    licenseData: [],
    pageSize:10,
    loading:true,
    pageNumber: '0',
    total: '0'
  },
  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight -80 + 'px'
    });
    wx.request({
      url: app.globalData.url + '/dict/loadDict?dictTypeId=editiontype',
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        var editionArray = [];
        res.data.map((item, index) => {
          editionArray.push(item.dictvalues);
        })
        _this.setData({
          editionArray: editionArray
        });
      }
    })
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
    this.loadData(params);
  },
  loadData(params, type) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/license/query?' + params, 
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        
        if (res.data.errorcode == '0003') {
          app.loginOut()
        }
       // wx.setNavigationBarTitle({
        //  title: `License审核（${res.data.total}）`,
       // })
        _this.setData({
          total: res.data.total
        });
        if (_this.data.pageIndex == 0 && res.data.data.length > 0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        if (res.data.data.length == 0) {
          _this.setData({ pageIndex: _this.data.pageIndex - 1 });
        }
        if (res.data.data.length < _this.data.pageSize){
          _this.setData({
            loading:false
          })
        }
        res.data.data.map((item,index)=>{
          item.head = "../../images/touxiang.png";
          app.globalData.allPeople.map((people, num)=>{
            if (people.name == item.usercode){
              item.head = people.head;
            }
          });
          _this.data.licenseData.push(item)
        })
        
        _this.setData({
          licenseData: _this.data.licenseData,
          pageIndex: _this.data.pageIndex + 1
        })
      }, fail() {
       
      }
    });
  },

  bindEditionChange(e){
    var index = e.target.dataset.index;
    this.data.licenseData[index].version=e.detail.value;
    this.setData({
      licenseData: this.data.licenseData
    });
  },
  swiperChange(e) {
    var _this = this;
    var pageNumber= e.detail.current + 1;
    if (pageNumber > _this.data.total) { pageNumber = _this.data.total }
    _this.setData({
      pageNumber: pageNumber
    })
    if (e.detail.current % 10 == 0) {
      _this.setData({
        pageIndex: _this.data.pageIndex + 1
      });
      var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
      this.loadData(params);
    }
  },
  formSubmit(e){
    var _this = this;
    var index = e.detail.target.dataset.index;
    var data = e.detail.value;
    data.id = e.detail.target.dataset.id;
    data.result = e.detail.target.dataset.type;
    data.version = e.detail.target.dataset.version;
    var params ="";
    if (data.result=='success'){
      if (!data['password' + index]) {
        wx.showToast({
          title: '请输入授权码',
          icon: 'success',
          image: '../../images/warning.png',
          duration: 2000
        });
        return false;
      }
      params = 'id=' + data.id + '&result=' + data.result + '&version=' + data.version + '&password=' + data['password' + index]
    } else if (data.result == 'refuse'){
      params = 'id=' + data.id + '&result=' + data.result
    }else{
      return
    }
     
    
    wx.request({
      url: app.globalData.url + '/license/update?' + params, 
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003') {
          app.loginOut()
        }
        if (res.data.errorcode=='0000'){
          var tip = data.result == 'success'?'授权成功':'已驳回';

          wx.showToast({
            title: tip,
            icon: 'none',
            duration: 2000
          });
          _this.setData({
            licenseData: [],
            pageIndex: 0
          });
        }else{
          wx.showToast({
            title:res.data.errormessage,
            icon: 'none',
            duration: 2000
          });
         
        }
       
        var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
        _this.loadData(params);
      }, fail() {

      }
    });
  }

 
  
})