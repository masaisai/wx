// pages/search/project-search/project-search.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    pageIndex: 0,
    pageSize: 3,
    loading: true,
    projectData: [],
    cardHeight: '800rpx',
    usercode: '',
    currentIndex: '0',
    pageNumber: '0',
    total: '0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px',
      usercode: app.globalData.usercode
    })
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
    var data = encodeURI(JSON.stringify({ 'key': options.key}))
    this.loadData(params, data);
  },
  loadData(params,data) {
    var _this = this;
    wx.request({
      url: app.globalData.url + '/project/query?' + params, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: data,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        //wx.setNavigationBarTitle({
        //  title: `项目搜索结果（${res.data.total}）`,
        //})
        _this.setData({
          total: res.data.total
        });
        if (_this.data.pageIndex == 0 && res.data.data.length > 0) {
          _this.setData({
            pageNumber: '1'
          });
        }
        //if(res.data.data.length<_this.data.pageSize){
        _this.setData({
          loading: false
        })
        //}
        if (res.data.data && res.data.data.length > 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            var obj = res.data.data[i];
            obj.member = [];
            var userdata = res.data.data[i].users;
            obj.memberNum = userdata.length;
            for (var j = 0; j < userdata.length; j++) {

              var obj1 = {};
              obj1.code = app.globalData[userdata[j].trim()] ? app.globalData[userdata[j].trim()].code : "";
              obj1.head = app.globalData[userdata[j].trim()] ? app.globalData[userdata[j].trim()].head : "../../../images/touxiang.png";
              obj.member.push(obj1);

            }
            _this.data.projectData.push(obj);

          }
          _this.setData({
            projectData: _this.data.projectData,
            pageIndex: _this.data.pageIndex + 1
          })

        }
      }, fail() {

      }
    });
  },


  swiperChange(e) {
    var _this = this;
    var pageNumber = e.detail.current + 1;
    if (pageNumber > _this.data.total) { pageNumber = _this.data.total }
    _this.setData({
      currentIndex: e.detail.current,
      pageNumber: pageNumber
    })
    //var direction = e.detail.current > _this.data.currentIndex ? 1 : -1;
    //if (direction==1&&(e.detail.current)%(_this.data.pageSize)==0){
    //  var pageIndex = _this.data.pageIndex + 1;
    //  var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
    //  this.loadData(params);

    // }
  },
  goDaily(e) {
    wx.navigateTo({
      url: '../../daily/project-daily/project-daily?proid=' + e.currentTarget.dataset.id,
    })
  },


  memberImageLoadFail(e) {
    var _this = this;
    let index = e.currentTarget.dataset.index;
    let idx = e.currentTarget.dataset.idx;
    this.data.projectData[index].member[idx].head = '../../../images/touxiang.png';
    this.setData({
      projectData: _this.data.projectData
    })
  }
})