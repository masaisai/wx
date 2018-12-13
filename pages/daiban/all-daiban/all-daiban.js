// pages/daiban/all-daiban/all-daiban.js
import WxParse from '../../wxParse/wxParse.js';
const app = getApp()
Page({
  data: {
    indicatorDots: false,
    cardHeight: '800rpx',
    daibanData: [],
    pageIndex: 0,
    pageSize: 10,
    loading: true,
    currentIndex: 0,
    imageLoad: false,
    pageNumber: '0',
    total: '0'
  },
  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px'
    });
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
    this.loadData(params);

  },
  loadData(params) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/task/query?sign=1&' + params,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
       // wx.setNavigationBarTitle({
        //  title: `待办（${res.data.total}）`,
        //});
        _this.setData({
          total: res.data.total
        });
        if (_this.data.pageIndex == 0 && res.data.data.length > 0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        var objData = res.data.data || [];
        if (objData.length < _this.data.pageSize) {
          _this.setData({
            loading: false
          })
        }
        if (objData.length == 0) {
          _this.setData({ pageIndex: _this.data.pageIndex - 1 });
        }
        objData.forEach((item, index)=>{
          if (item.tag == 1) {
            item.personliable = {};
          } else if (item.tag == 2) {
            item.solutionIndex = 0;
          }
          if (item.data) {
            if (item.tag == 1) {
              item.head = app.globalData[item.data.createuser].head;
              item.name = app.globalData[item.data.createuser].name;
            } else if (item.tag == 2) {
              item.head = app.globalData[item.data.personliable].head;
              item.name = app.globalData[item.data.personliable].name;
            } else if (item.tag == 4) {
              item.head = app.globalData[item.data.assignuser].head;
              item.name = app.globalData[item.data.assignuser].name;
            } else if (item.tag == 5) {
              item.head = app.globalData[item.data.createuser].head;
              item.name = app.globalData[item.data.createuser].name;
            } else if (item.tag == 6) {
              item.head = app.globalData[item.data.createuser].head;
              item.name = app.globalData[item.data.createuser].name;
            }
            
            if (item.data.personliable){
              item.personliable = app.globalData[item.data.personliable].name;
            }
          }
          _this.data.daibanData.push(item);
        });
        _this.data.daibanData.forEach((item, index)=>{
         
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
            if (!_this.data['bug' + index]){
              WxParse.wxParse('bug' + index, 'html', str, _this, 0);
              item.wxparse = _this.data['bug' + index];
            }
            
          }
         
        })
        _this.setData({
          daibanData: _this.data.daibanData
        });

      }, fail() {

      }
    });
  },
  wxParseImgLoad(e) {
    var _this = this;
    _this.data.daibanData[parseInt(e.currentTarget.dataset.from.substring(3))].wxparse.images[e.currentTarget.dataset.idx].width = e.detail.width;
    _this.data.imageLoad = true
  },
  swiperChange(e) {
    var _this = this;
    var pageNumber =  e.detail.current + 1;
    if (pageNumber > _this.data.total) { pageNumber = _this.data.total }
    var direction = e.detail.current > _this.data.currentIndex ? 1 : -1;
    _this.setData({
      pageNumber: pageNumber,
      currentIndex: e.detail.current
    });
    if (_this.data.imageLoad) {
      _this.setData({
        daibanData: _this.data.daibanData,
        imageLoad: false
      })
    }

    if (direction==1&&(e.detail.current % _this.data.pageSize == 0)) {
      _this.setData({
        pageIndex: _this.data.pageIndex + 1
      });
      var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
      this.loadData(params);

    }
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