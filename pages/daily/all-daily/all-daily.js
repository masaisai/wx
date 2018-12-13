// pages/daily/all-daily/all-daily.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardHeight: '800rpx',
    skiphiddenitemlayout:true,
    circular: false,
    dailyData: [],
    pageIndex: 0,
    pageSize:10,
    loading: true,
    inputValue: '',
    duration:500,
    loading: true,
    loading1:false,
    currentIndex: '0',
    pageNumber:'0',
    total:'0'
    

  },
  onShow() {
    
    var _this = this;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 125 + 'px'
    });
    var params = 'pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize;
   
    this.loadData(params);
  },
  loadData(params, direction) {
    var _this = this;
    console.log(params)
    wx.request({
      url: app.globalData.url + '/daily/query?' + params,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (res.data.errorcode == '0003' || res.data.errorcode == '0014') {
          app.loginOut();
          return
        }
        //wx.setNavigationBarTitle({
        //  title: `所有日报（${res.data.total}）`
       // });
       _this.setData({
         total: res.data.total
       })
       if (_this.data.pageIndex == 0 && res.data.data.length>0) {
         _this.setData({
           pageNumber: '1'
         });
       }
        var objData = res.data.data||[];
        var dailyData=[];
         if (objData.length == 0 && direction == -1){
            _this.setData({ pageIndex: _this.data.pageIndex + 1 })
          } else if (objData.length == 0 && direction == 1){
            _this.setData({ pageIndex: _this.data.pageIndex - 1 })
          }
        _this.data.pageIndex > 0 ? _this.setData({ loading1: true }) : _this.setData({ loading1: false });
        objData.map((obj,num)=>{
          if (app.globalData[obj.createuser]){
            obj.name = app.globalData[obj.createuser].name;
            obj.head = app.globalData[obj.createuser].head;
          }
          obj.readheads = [];
          obj.readusers.forEach((item, index)=>{
            obj.readheads.push(app.globalData[item].head);
          });
          obj.replys.forEach((item, index)=>{
            obj.replys[index].fromusername = app.globalData[item.fromuser].name;
            obj.replys[index].fromuserhead = app.globalData[item.fromuser].head
          })
          dailyData.push(obj);
        })
        var currentIndex ='';
        //var currentIndex = direction == -1 ? _this.data.pageIndex > 0 ? _this.data.pageSize : _this.data.pageSize - 1 : _this.data.pageIndex > 0 ? 1 :0;
        if (direction == -1){
          if (_this.data.pageIndex > 0){
            currentIndex =_this.data.pageSize
          }else{
            currentIndex = _this.data.pageSize - 1
          }
        }else if (direction == 1){
          if (_this.data.pageIndex > 0) {
            currentIndex = 1
          } else {
            currentIndex = 0
          }
        }else{
          currentIndex=_this.data.currentIndex
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
        //为合理展示切换效果，此处三个setData不能合并  
      
          _this.recordReaders(0)
        
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
    var _this=this;
    setTimeout(()=>{
      wx.navigateTo({
        url: '../daily-comment/daily-comment?id=' + e.currentTarget.dataset.id
      })
    }, 100)
   
  },
  addDaily() {
    setTimeout(()=>{
      wx.navigateTo({
        url: '../add-daily/add-daily',
      })
    },100)
  },
  recordReaders(index){
    if (this.data.dailyData[index].ready == 0){
      wx.request({
        url: app.globalData.url + '/daily/changereaduser?id=' + this.data.dailyData[index].id + '&state=1',
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        method: 'GET',
        success(res) {
         
        },
        fail(res) {
        }
      })
    }
   
  },
  record(e){
    var _this = this;
    var currentDataIndex = _this.data.pageIndex > 0 ? e.detail.current - 1 : e.detail.current;
    if (currentDataIndex > 0 && _this.data.dailyData[currentDataIndex]) {
      _this.recordReaders(currentDataIndex)
    }
  },
  swiperChange(e) {
    var _this = this;
    var pageNumber = _this.data.pageIndex > 0 ? parseInt(_this.data.pageIndex) * parseInt(_this.data.pageSize) + e.detail.current:e.detail.current+1;
    if (pageNumber > _this.data.total) { pageNumber = _this.data.total}
    _this.setData({
      pageNumber: pageNumber
    })
   
    var direction = e.detail.current > _this.data.currentIndex?1:-1;
    if (direction == 1){
      var subSize = _this.data.pageIndex == 0?0:1;
      if ((e.detail.current - subSize) % (_this.data.pageSize) == 0) {
        if (e.detail.current != _this.data.currentIndex) {
          _this.setData({
            pageIndex: _this.data.pageIndex+1
          });
          var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
          this.loadData(params, direction);
        }
      }
    
  }else{
      if (_this.data.pageIndex > 0) {
        if ((e.detail.current) % (_this.data.pageSize) == 0) {
          if (e.detail.current != _this.data.currentIndex) {
            _this.setData({
              pageIndex: _this.data.pageIndex-1
            });
            var params = 'pageIndex=' + _this.data.pageIndex + '&pageSize=' + _this.data.pageSize;
            this.loadData(params, direction);
          }
        }
      }
  }

    _this.setData({
      currentIndex: e.detail.current
    })
  
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  inputConfirm(e) {
    wx.navigateTo({
      url: "../../search/daily-search/daily-search?key=" + e.detail.value
    })
  },
  search() {
    var value = this.data.inputValue;
    if(value.length <= 0) {
      wx.showToast({
        title: '请输入关键字',
        icon: 'success',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    wx.navigateTo({
      url: "../../search/daily-search/daily-search?key=" + value
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
          if(_this.data.dailyData[index].isheats){
            _this.data.dailyData[index].isheats=0;
            _this.data.dailyData[index].heatsamount = _this.data.dailyData[index].heatsamount-1;
            var arrayIndex='';
            _this.data.dailyData[index].readusers.forEach((item, idx)=>{
              if (item == app.globalData.usercode) { arrayIndex = idx}
            });
            _this.data.dailyData[index].readusers.splice(arrayIndex,1);
          }else{
            _this.data.dailyData[index].isheats = 1;
            _this.data.dailyData[index].heatsamount = _this.data.dailyData[index].heatsamount+1;
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