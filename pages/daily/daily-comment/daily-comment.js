// pages/daily/daily-comment/daily-comment.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    fid:'',
    cardHeight: '800rpx',
    originalData:[],
    replyData:[],
    replyLen:'0',
    usercode:'',
    releaseFocus: false,
    commentValue: '',
    cursor: '0',
    reply: false,
    replyTo: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 100 + 'px',
      usercode:app.globalData.usercode,
      id:options.id
    });
    _this.loadData()

  },
  loadData(){
    var _this = this;
    wx.request({
      url: app.globalData.url + '/daily/findById?id=' + _this.data.id,
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        var replys = res.data;
        var replyData = [];
        replys.map((item,index)=>{
          if (!item.fid) {
            item.name = app.globalData[item.fromuser].name;
            item.head = app.globalData[item.fromuser].head;
            replyData.push(item)
          }
        });
        replyData.map((reply,num)=>{
          reply.children = [];
          replys.map((item, index) => {
            if (reply.id == item.fid) {
              item.name = app.globalData[item.fromuser].name;
              item.head = app.globalData[item.fromuser].head;
              item.touser = reply.name;
              reply.children.push(item)
            }
          });
        })
      
       
        _this.setData({
          replyData: replyData,
          replyLen: replyData.length
        });
      }
    });
    
  },
  bindReply(e) {
    var replyto = '回复' + e.currentTarget.dataset.replyto + '：';
    this.setData({
      reply: true,
      replyTo: replyto,
      cursor: replyto.length,
      releaseFocus: true,
      commentValue: replyto,
      fid: e.currentTarget.dataset.id
    })
  },
  removeReply(e) {
    var id = e.currentTarget.dataset.id;
    var _this = this;
    wx.showModal({
      title: '删除提示',
      content: '确认删除此条信息？',
      confirmColor: "#3e8ef7",
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + '/daily/deletecomment?id=' + id,
            method: 'GET',
            data: {},
            header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
            success(res) {
              _this.loadData();
            }
          });
        } else if (res.cancel) {

        }
      }
    })

  },
  commentInput(e) {
    var _this = this;
    var replyTo = _this.data.replyTo;
    var len = _this.data.replyTo.length;
    if (_this.data.reply && e.detail.value.substring(0, len) != replyTo) {
        this.setData({
          commentValue: '',
          reply: false,
          replyTo: ''
        })
    } else {
      _this.setData({
        commentValue: e.detail.value
      })
    }
  },
  comment(e) {
    var _this = this;
    var len = _this.data.replyTo.length;
    if (_this.data.reply) {
      var content = _this.data.commentValue.substring(len);
      var datas = encodeURI(JSON.stringify({ pid: _this.data.id, content: content, fid: _this.data.fid }));
      wx.request({
        url: app.globalData.url + '/daily/addreply',
        method: 'POST',
        data: datas,
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) {
          
          _this.setData({
            commentValue: ''
          });
          _this.setData({
            reply: false,
            replyTo: '',
            releaseFocus: false,
            commentValue: ''
          });
         // _this.data.orginal
          _this.loadData()
        }
      });
    } else {
      var datas = encodeURI(JSON.stringify({ pid: _this.data.id, content: _this.data.commentValue }));

      wx.request({

        url: app.globalData.url + '/daily/addreply',
        method: 'POST',
        data: datas,
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) {
          
          _this.setData({
            commentValue: ''
          });
          _this.setData({
            reply: false,
            replyTo: '',
            releaseFocus: false,
            commentValue: ''
          });
          _this.loadData()
        }
      });
    }

  }
})