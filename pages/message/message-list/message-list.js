// pages/message/message-list/message-img-list.js
const app = getApp();
Page({
  data: {
    pageIndex: 0,
    pageSize:10,
    msgtype:'',
    messageData: [],
    loadData: true,
    noData: false,
    longTapBtn: false,
    editMode:false,
    checkData: []

  },
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
    wx.setNavigationBarTitle({
      title: options.msgvalue,
    })
    this.setData({
      msgtype: options.msgtype
    })
   
  },
  onShow(){
    this.loadData(this.data.msgtype,'refresh')
  },
  loadData(msgtype,type) {
    var _this = this;
    this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px'
    });
    if (type == 'refresh') {
      this.setData({
        pageIndex: 0
      })
    }
    wx.request({
      url: app.globalData.smsurl + '/message/findlist?msgtype=' +msgtype+'&pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (type == 'refresh') {
          _this.setData({
            loadData: true,
            noData: false
          })
        }
        if (res.data.length < _this.data.pageSize) {
          _this.setData({
            loadData: false
          })
        }

        var mids = [];
        if (type == 'refresh') {
          _this.data.messageData = [];
        }
        res.data.map((item, index) => {
          item.sendtime = item.sendtime.substring(5, 10);
          if (item.content.length>40){
            item.content = item.content.substring(0,40)+'...'
          }
          item.checked = false;
          _this.data.messageData.push(item);

        });

        _this.setData({
          messageData: _this.data.messageData
        });
        if (_this.data.messageData.length==0){
          _this.setData({
            noData:true
          })
        }
        wx.hideLoading()
      }, fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误'
        })

      }
    })

  },


  onReachBottom() {
    if (this.data.noData) { return }
    this.setData({
      pageIndex: this.data.pageIndex + 1
    })
    this.loadData(this.data.msgtype)
  },

  openPage(e){
    if (!this.data.longTapBtn){
      wx.navigateTo({
        url: '../message-detail/message-detail?id=' + e.currentTarget.dataset.id + '&mid=' + e.currentTarget.dataset.mid,
      })
    }
   
  },
  longTap(e) {
    var _this = this;
    if (!_this.data.longTapBtn) {
      _this.data.longTapBtn = true;
      _this.initCheck();
      _this.setData({
        editMode: true,
        messageData: _this.data.messageData
      });
    }
  },
  removeItem() {
    var data = this.data.checkData;
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确认删除所选信息？',
      confirmColor: "#3e8ef7",
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.smsurl + '/message/delete',
            data: data,
            method: 'POST',
            header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
            success(res) {
              if (res.data.errorcode == '0000') {
                _this.loadData(_this.data.msgtype,"refresh")
              }
              _this.cancelEdit();
            },
            fail() {
              // _this.cancelEdit();

            }

          })
        } else if (res.cancel) {
          //_this.cancelEdit();
        }
      }
    })
  },
  cancelEdit() {
    var _this = this;
    _this.data.messageData.map((item, index) => {
      item.checked = false;
    });
    _this.setData({
      editMode: false,
      messageData: _this.data.messageData
    });
    _this.data.longTapBtn = false;
  },
  formSubmit(e) {
    app.formSubmit(e)
  },
  initCheck() {
    var _this = this;
    _this.setData({
      checkData: []
    });

    _this.data.messageData.map((item, index) => {
      item.checked = false;
    });
  },
  checkboxChange(e) {
    var _this = this;
    var values = e.detail.value;
    _this.setData({
      checkData: values
    });
    _this.data.messageData.map((item, index) => {
      for (var i = 0; i < values.length; i++) {
        if (item.mid == values[i]) {
          item.checked = true;
        }
      }

    });
  }
  
})