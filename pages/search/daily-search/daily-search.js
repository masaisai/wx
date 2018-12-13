// pages/search/daily-search/daily-search.js
const app = getApp()
Page({
  data: {
    type: '',
    cardHeight: '800rpx',
    skiphiddenitemlayout: true,
    circular: false,
    dailyData: [],
    pageIndex: 0,
    pageSize: 10,
    inputValue: '',
    duration: 500,
    loading: true,
    loading1: false,
    currentIndex: '0',
    usercode: '',
    pageNumber: '0',
    total: '0'

  },

  onLoad(options) {
    var usercode = '';
    app.globalData.allPeople.map((item, index) => {
      if (item.name == options.key) {
        usercode = item.code;
      }
    })
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px',
      usercode: usercode
    });
    if (this.data.usercode.length == 0) {
      this.setData({ loading: false })
      return
    }
    // var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize + '&usercode=' + this.data.usercode;
    //this.loadData(params);
  },
  onShow(options) {
    if (this.data.usercode) {
      var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize + '&usercode=' + this.data.usercode;
      this.loadData(params);
    }
  },
  loadData(params, direction) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/daily/query?' + params,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        //wx.setNavigationBarTitle({
        // title: `日报搜索结果（${res.data.total}）`,
        // })
        _this.setData({
          total: res.data.total
        });
        if (_this.data.pageIndex == 0 && res.data.data.length > 0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        var objData = res.data.data || [];
        var dailyData = [];
        if (objData.length == 0) {
          if (direction == -1) {
            _this.setData({ pageIndex: _this.data.pageIndex + 1 })
          } else if (direction == 1) {
            _this.setData({ pageIndex: _this.data.pageIndex - 1 })
          }
        }
        _this.data.pageIndex > 0 ? _this.setData({ loading1: true }) : _this.setData({ loading1: false });
        for (var i = 0; i < objData.length; i++) {
          var obj = {};
          for (var k in objData[i]) {
            obj[k.toLowerCase()] = objData[i][k];
          }
          obj.name = app.globalData[objData[i].createuser].name;
          obj.head = app.globalData[objData[i].createuser].head;
          obj.readheads = [];
          objData[i].readusers.forEach((item, index)=>{
            obj.readheads.push(app.globalData[item].head);
          });
          objData[i].replys.forEach((item, index)=>{
            obj.replys[index].fromusername = app.globalData[item.fromuser].name;
            obj.replys[index].fromuserhead = app.globalData[item.fromuser].head
          })
          dailyData.push(obj);
        }
        var currentIndex = '';
        //var currentIndex = direction == -1 ? _this.data.pageIndex > 0 ? _this.data.pageSize : _this.data.pageSize - 1 : _this.data.pageIndex > 0 ? 1 :0;
        if (direction == -1) {
          if (_this.data.pageIndex > 0) {
            currentIndex = _this.data.pageSize
          } else {
            currentIndex = _this.data.pageSize - 1
          }
        } else if (direction == 1) {
          if (_this.data.pageIndex > 0) {
            currentIndex = 1
          } else {
            currentIndex = 0
          }
        } else {
          currentIndex = _this.data.currentIndex
        }
        _this.setData({
          duration: 0
        });
        _this.setData({
          currentIndex: currentIndex

        });
        _this.setData({
          dailyData: dailyData,
          duration: 500
        });


      }, fail() {
        if (direction == -1) {
          _this.setData({ pageIndex: _this.data.pageIndex + 1 })
        } else if (direction == 1) {
          _this.setData({ pageIndex: _this.data.pageIndex - 1 })
        }
      }
    });
  },


  goComment(e) {
    wx.navigateTo({
      url: '../../daily/daily-comment/daily-comment?replys=' + JSON.stringify(this.data.dailyData[e.currentTarget.dataset.index].replys) + '&id=' + e.currentTarget.dataset.id
    })
  },


  swiperChange(e) {
    var _this = this;
    var pageNumber = _this.data.pageIndex > 0 ? parseInt(_this.data.pageIndex) * parseInt(_this.data.pageSize) + e.detail.current : e.detail.current + 1;
    if (pageNumber > _this.data.total) { pageNumber = _this.data.total }
    _this.setData({
      pageNumber: pageNumber
    })
    var direction = e.detail.current > _this.data.currentIndex ? 1 : -1;
    if (direction == 1) {
      var subSize = _this.data.pageIndex == 0 ? 0 : 1;
      if ((e.detail.current - subSize) % (_this.data.pageSize) == 0) {
        if (e.detail.current != _this.data.currentIndex) {
          _this.setData({
            pageIndex: _this.data.pageIndex + 1
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize + '&usercode=' + _this.data.usercode;
          this.loadData(params, direction);
        }
      }

    } else {
      if (_this.data.pageIndex > 0) {
        if ((e.detail.current) % (_this.data.pageSize) == 0) {
          if (e.detail.current != _this.data.currentIndex) {
            _this.setData({
              pageIndex: _this.data.pageIndex - 1
            });
            var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize + '&usercode=' + _this.data.usercode;
            this.loadData(params, direction);
          }
        }
      }
    }

    _this.setData({
      currentIndex: e.detail.current
    })

  },


  giveliked(e) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/daily/giveliked?id=' + e.currentTarget.dataset.id + '&state=' + e.currentTarget.dataset.state,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0000') {
          var index = e.currentTarget.dataset.index;
          if (_this.data.dailyData[index].isheats) {
            _this.data.dailyData[index].isheats = 0;
            _this.data.dailyData[index].heatsamount = _this.data.dailyData[index].heatsamount - 1;
            var arrayIndex = '';
            _this.data.dailyData[index].readusers.forEach((item, idx)=>{
              if (item == app.globalData.usercode) { arrayIndex = idx }
            });
            _this.data.dailyData[index].readusers.splice(arrayIndex, 1);
          } else {
            _this.data.dailyData[index].isheats = 1;
            _this.data.dailyData[index].heatsamount = _this.data.dailyData[index].heatsamount + 1;
            _this.data.dailyData[index].readusers.push(app.globalData.usercode);
          }
          _this.data.dailyData[index].readheads = [];
          _this.data.dailyData[index].readusers.forEach((item, idx)=>{
            _this.data.dailyData[index].readheads.push(app.globalData[item].head);
          });
          _this.setData({
            dailyData: _this.data.dailyData
          })
        }
      }
    })
  }

})