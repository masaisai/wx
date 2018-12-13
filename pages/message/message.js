// pages/message/message.js
const app = getApp();
Page({
  data: {
    cardHeight:'800rpx',
    url:'',
    mesTypeData:{},
    messageData: [],
    noData:false,
    try:0
  },
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px'
    });
   
  },
  onShow(){
    this.setData({
      noData:false
    })
    this.getMesType()
    this.loadData()
  },
  loadData(){
    var _this = this;
    wx.request({
      url: `${app.globalData.smsurl}/message/findoutline`,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {

       if(res.data.length>0){
         _this.setMesData(res.data)
       }else{
         _this.setData({
           noData:true
         })
       }
         wx.hideLoading()
      }, fail(res){
        wx.hideLoading()
        wx.showToast({
          title: '网络错误'
        })
      }
    })
  },
  setMesData(data){
    var _this = this;

    if (_this.data.try>3)return;
    if (_this.data.mesTypeData.task){
      data.map((item, index) => {
        item.msgvalue = _this.data.mesTypeData[item.msgtype];
        if (item.msgtype == "system") {
          item.url = './system-list/system-list'
        } else{
          item.url = './message-list/message-list?msgtype=' + item.msgtype + '&msgvalue=' + item.msgvalue
        }
      });
     
      _this.setData({
        messageData: data
      });
     
    }else{
      _this.data.try++;
      setTimeout(()=>{
        _this.setMesData(data)
      },200)
    }
    
  },
  getMesType(){
    var _this=this;
    wx.request({
      url: `${app.globalData.smsurl}/dict/loadDict?dictTypeId=msgtype`,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
       if(res.data.length>0){
         var mesTypeData={};
         res.data.map((item,index)=>{
           mesTypeData[item.dictkey] = item.dictvalues;
         })
        _this.setData({
          mesTypeData: mesTypeData
        });
       }
        
      },
      fail(res) {
       
      }
    })
  },
  openPage(e){
    var url = e.currentTarget.dataset.url;
    setTimeout(()=>{
      wx.navigateTo({
        url: url
      })
    }, 200)
  },
  formSubmit(e) {
    app.formSubmit(e)
  }
})