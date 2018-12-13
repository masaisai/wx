// pages/daiban/daiban.js
import WxParse from '../wxParse/wxParse.js';
const app = getApp()
Page({
  data: {
    indicatorDots: false,
    cardHeight: '800rpx',
    daibanData: [],
    pageIndex: 0,
    pageSize:10,
    loading:true,
    currentIndex:0,
    solutionArray: ['请选择解决方法'],
    imageLoad:false,
    pageNumber: '0',
    total: '0'
  },
  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px'
    });
    _this.loadSolution();
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
      _this.loadData(params);
   
    
  },
  loadData(params) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/task/query?sign=0&' + params,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
      //  wx.setNavigationBarTitle({
        //  title:`待办（${res.data.total}）`,
       // });
        _this.setData({
          total: res.data.total
        });
        if (_this.data.pageIndex == 0 && res.data.data.length > 0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        var objData = res.data.data||[];
       
        if (objData.length== 0) {
          _this.setData({ pageIndex: _this.data.pageIndex-1 });
        }
        objData.forEach((item, index)=>{
          if (item.tag == 1) {
            item.personliable = {};
          } else if (item.tag == 2) {
            item.solutionIndex = 0;
          }

          if (item.data) {
            item.head = app.globalData[item.data.createuser].head;
            item.name = app.globalData[item.data.createuser].name;
            
            if (item.data.personliable) {
              item.personliable = app.globalData[item.data.personliable].name;
            }
          }
          _this.data.daibanData.push(item);
        });
        _this.data.daibanData.forEach((item, index) =>{

          if (item.data && (item.tag == 1 || item.tag == 2)) {
            var str = item.data.step || '';
            var imgReg = /<img.*?(?:>|\/>)/gi;
            //匹配src属性
            var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
            var arr = str.match(imgReg);
            if (arr) {
              for (var i = 0; i < arr.length; i++) {
                var src = arr[i].match(srcReg);
                //获取图片地址
                if (src[1]) {
                  var re = new RegExp(src[1], "gi");
                    str = str.replace(re, app.globalData.ip + src[1])
                  
                }

              }
            }
           // if (!_this.data['bug' + index]) {
              WxParse.wxParse('bug' + index, 'html', str, _this, 0);
              item.wxparse = _this.data['bug' + index];
            //}

          }

        })

         _this.setData({
           daibanData: _this.data.daibanData
         });

        if (objData.length < _this.data.pageSize) {
          _this.setData({
            loading: false
          })
        }
      }, fail() {

      }
    });
  },
  wxParseImgLoad(e){
    var _this=this;
_this.data.daibanData[parseInt(e.currentTarget.dataset.from.substring(3))].wxparse.images[e.currentTarget.dataset.idx].width=e.detail.width;
  _this.data.imageLoad=true

  },
  loadSolution(){
    var _this=this;
    wx.request({
      url: app.globalData.url + '/dict/loadDict?dictTypeId=solution',
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        for (var i = 0; i < res.data.length; i++) {
          _this.data.solutionArray.push(res.data[i].dictvalues);
        }
        _this.setData({
          solutionArray: _this.data.solutionArray
        });
      }
    });
  },
  bugConfirm(e) {
    var _this = this;
    var index=e.currentTarget.dataset.index;
    if (!_this.data.daibanData[index].personliable.name) {
      wx.showToast({
        title: '请选择责任人',
        icon: 'success',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    wx.request({
      url: app.globalData.url + '/bug/updateState?id=' + _this.data.daibanData[index].id + '&tid=' + _this.data.daibanData[index].tid + '&personliable=' + _this.data.daibanData[index].personliable.code + '&state=1&tag=2',
      method: 'POST',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {

        if (res.statusCode == 200) {
          _this.setData({
            pageIndex:0,
            daibanData: []
          });
          wx.showToast({
            title: '缺陷已确认',
            icon: 'success',
            duration: 2000
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
          _this.loadData(params);
        }
      }
    })
  },
  bugSolution(e){
    var _this = this;
    var index = e.currentTarget.dataset.index;
   // var solution = parseInt(_this.data.daibanData[index].solutionIndex) + 1;
    if (_this.data.daibanData[index].solutionIndex=='0') {
      wx.showToast({
        title: '请选择解决方法',
        icon: 'success',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    }

    wx.request({
      url: app.globalData.url + '/bug/update?tid=' + _this.data.daibanData[index].tid + '&solution=' + _this.data.daibanData[index].solutionIndex + '&state=2',
      method: 'POST',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.statusCode == 200) {
          _this.setData({
            pageIndex: 0,
            daibanData: [],
            currentIndex: _this.data.currentIndex - 1 > 0 ? _this.data.currentIndex - 1:0
          });
          wx.showToast({
            title: '缺陷已处理',
            icon: 'success',
            duration: 2000
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
          _this.loadData(params);
        }
      }
    })
  },
  dailyConfirm(e) {
    var _this = this;
    var state = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    //if (state == 2) {
     // wx.navigateBack();
     // return
   // }
    
    wx.request({
      url: app.globalData.url + '/daily/updatestate?state=' + state + '&tid=' + _this.data.daibanData[index].tid,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0000') {
          _this.setData({
            pageIndex: 0,
            daibanData: [],
            currentIndex: _this.data.currentIndex - 1 > 0 ? _this.data.currentIndex - 1 : 0
          });
          wx.showToast({
            title: '日报已审核',
            icon: 'success',
            duration: 2000
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
          _this.loadData(params);
        } else {

        }

      }
    })
  },
  demandConfirm(e) {
    var _this = this;
    var state = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    wx.request({
      url: app.globalData.url + '/demand/update?id=' + _this.data.daibanData[index].id + '&tid=' + _this.data.daibanData[index].tid + '&state=' + state,
      method: 'POST',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0000') {
          _this.setData({
            pageIndex: 0,
            daibanData: [],
            currentIndex: _this.data.currentIndex - 1 > 0 ? _this.data.currentIndex - 1 : 0
          });
          wx.showToast({
            title: '需求已审核',
            icon: 'success',
            duration: 2000
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
          _this.loadData(params);
        } else {
          wx.showToast({
            title: res.data.errormessage,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  taskConfirm(e) {
    var _this = this;
    var state = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    wx.request({
      url: app.globalData.url + '/task/update?id=' + _this.data.daibanData[index].id + '&state=' + state + '&tid=' + _this.data.daibanData[index].tid,
      method: 'POST',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0000') {
          _this.setData({
            pageIndex: 0,
            daibanData: [],
            currentIndex: state == 3 ? _this.data.currentIndex - 1 > 0 ? _this.data.currentIndex - 1 : 0 : _this.data.currentIndex
          });
          wx.showToast({
            title: res.data.errormessage,
            icon:'success',
            duration: 2000
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
          _this.loadData(params);
        } else {
          wx.showToast({
            title: res.data.errormessage,
            icon: 'none',
            duration: 2000
          })
        }

      }
    })
  },
  cancel: function () {
    wx.navigateBack();
  },
  selectPersonliable(e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../select/people-select/people-select?object=personliable&people=' + JSON.stringify(this.data.daibanData[index].personliable)+'&index='+index,
    })
  },
  bindPickerChange: function (e) {
    var index = e.currentTarget.dataset.index;
    this.data.daibanData[index].solutionIndex = e.detail.value;
    this.setData({
      daibanData: this.data.daibanData
    })
  },
  swiperChange: function (e) {
    var _this = this;
    var pageNumber = e.detail.current + 1;
    if (pageNumber > _this.data.total) { pageNumber = _this.data.total }
    var direction = e.detail.current > _this.data.currentIndex ? 1 : -1;
    _this.setData({
      pageNumber: pageNumber,
      currentIndex: e.detail.current
    });
    if (_this.data.imageLoad){
      _this.setData({
        daibanData: _this.data.daibanData,
        imageLoad:false
      })
    }
    if (direction == 1 && (e.detail.current % _this.data.pageSize == 0)) {
      _this.setData({
        pageIndex: _this.data.pageIndex + 1
      });
      var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
      this.loadData(params);
    }
  },
  formSubmit: function (e) {
    var form_id = e.detail.formId;
    wx.request({
      url: app.globalData.smsurl + '/chat/saveformid?formid=' + form_id + '&openid=' + app.globalData.openid + '&appid=' + app.globalData.appid,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      method: 'GET',
      success: function (res) {
       
      },
      fail: function (res) {
      }
    })
  }
})