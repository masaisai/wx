// pages/project/project.js
const app = getApp();

Page({
  data: {
    indicatorDots: false,
    pageIndex: 0,
    pageSize: 3,
    projectData: [],
    cardHeight: '800rpx',
    inputValue: '',
    usercode: '',
    currentIndex: '0',
    loading: true,
    pageNumber: '0',
    total: '0'
  },
  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 125 + 'px',
      usercode: app.globalData.usercode
    });

    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
    this.loadData(params);
  },
  loadData(params) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/project/query?' + params,
      method: 'POST',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        // wx.setNavigationBarTitle({
        //  title: `项目（${res.data.total}）`,
        // })
        _this.setData({
          total: res.data.total
        })
        if (res.data.data.length > 0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        var objData = res.data.data || [];

        for (var i = 0; i < objData.length; i++) {
          var obj = objData[i];
          obj.member = [];
          var userdata = objData[i].users;
          obj.memberNum = userdata.length;
          if (userdata) {
            userdata.map((item, index)=>{
              if (app.globalData[item.trim()]) {
                var obj1 = {};
                obj1.code = app.globalData[item.trim()].code;
                obj1.head = app.globalData[item.trim()].head;
                obj.member.push(obj1);
              }
            })

          }

          _this.data.projectData.push(obj)
        }
        _this.setData({
          projectData: _this.data.projectData,
          loading: false
        })

      }, fail(){

      }
    });
  },

  setRate(e) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/project/update?id=' + e.currentTarget.dataset.id + '&rate=' + e.detail.value,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0000') {
        }
      }

    })
  },
  goDaily(e){
wx.navigateTo({
  url: '../daily/project-daily/project-daily?proid=' + e.currentTarget.dataset.id,
})
  },
  swiperChange(e) {
    var _this = this;
    _this.setData({
      currentIndex: e.detail.current,
      pageNumber: e.detail.current + 1 - _this.data.total > 0 ? _this.data.total : e.detail.current + 1
    })
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  inputConfirm(e) {
    wx.navigateTo({
      url: "../search/project-search/project-search?key=" + e.detail.value
    })
  },
  search() {
    var value = this.data.inputValue;
    if (value.length <= 0) {
      wx.showToast({
        title: '请输入关键字',
        icon: 'success',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    wx.navigateTo({
      url: "../search/project-search/project-search?key=" + value
    })
  },
  memberImageLoadFail(e) { //图片加载失败
    let index = e.currentTarget.dataset.index;
    let idx = e.currentTarget.dataset.idx;
    this.data.projectData[index].member[idx].head = '../../../images/touxiang.png';
    this.setData({
      projectData: this.data.projectData
    })
  }
})