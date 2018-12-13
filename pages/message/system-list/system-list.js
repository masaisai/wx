// pages/message/system-list/system-list.js
const app = getApp();
Page({

  data: {
    pageIndex:0,
    pageSize:10,
    systemData:[],
    load:true,
    loadData:true,
    noData:false,
    longTapBtn:false,
    editMode:false,
    checkData:[]

  },
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px'
    });
  this.loadData()
  },
  loadData(type) {
    var _this = this;
    this.data.load=false;
    if(type=='refresh'){
      this.setData({
        pageIndex:0
      })
    }
    wx.request({
      url: app.globalData.smsurl + '/message/findlist?msgtype=system&pageIndex=' + this.data.pageIndex + '&pageSize=' + this.data.pageSize,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        if (type == 'refresh') {
          _this.setData({
            loadData: true,
            noData: false
          })
        }
        if (res.data.length<_this.data.pageSize){
          _this.setData({
            loadData:false
          })
        }
       
        var mids=[];
        if (type == 'refresh') {
          _this.data.systemData = [];
        }
        res.data.map((item,index)=>{
          item.sendtime=item.sendtime.substring(5,10);
          item.checked=false;
          _this.data.systemData.push(item);
          if(item.state==0){
            mids.push(item.mid)
          }
         
        });
        
        _this.setData({
          systemData: _this.data.systemData
        });
        if(mids.length>0){
          _this.loadRead(mids);
        }
        if (_this.data.systemData.length == 0) {
          _this.setData({
            noData: true
          })
        }
        wx.hideLoading();
        _this.data.load = true;
      }, fail(res) {
        wx.hideLoading();
        _this.data.load = true;
        wx.showToast({
          title: '网络错误'
        })
       
      }
    })

  },

  
  onReachBottom() {
    if(this.data.noData){return}
    this.setData({
      pageIndex:this.data.pageIndex+1
    })
    if (this.data.load){
      this.loadData()
    }
  },
  loadRead(mids){
    var _this = this;
    wx.request({
      url: app.globalData.smsurl + '/message/updatetoread',
      data: mids,
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
      }, 
      fail(res) {
      }
    })
  },
  longTap(e){
    var _this = this;
    if (!_this.data.longTapBtn) {
      _this.data.longTapBtn = true;
      _this.initCheck();
      /*_this.data.systemData.map((item, index) => {
          if (item.mid == e.currentTarget.dataset.mid) {
            item.checked = true;
            _this.data.checkData.push(item.mid)
          }
      });*/
      _this.setData({
        editMode: true,
        systemData: _this.data.systemData,
        checkData:_this.data.checkData
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
                  _this.loadData("refresh")
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
  cancelEdit(){
    var _this=this;
    _this.data.systemData.map((item, index) => {
        item.checked = false;
    });
    _this.setData({
      editMode:false,
      systemData: _this.data.systemData
    });
    _this.data.longTapBtn = false;
  },
  formSubmit(e) {
    app.formSubmit(e)
  },
  initCheck(){
    var _this = this;
    _this.setData({
      checkData:[]
    });
  
    _this.data.systemData.map((item, index) => {
          item.checked =false; 
    });
  },
  checkboxChange(e) {
    var _this=this;
    var values = e.detail.value;
    _this.setData({
      checkData: values
    });
    _this.data.systemData.map((item, index) => {
      for (var i = 0; i < values.length;i++){
        if (item.mid == values[i]) {
          item.checked = true;
        }
      }
      
    });
  }
})