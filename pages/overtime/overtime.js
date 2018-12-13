// pages/overtime/overtime.js
import { formatTime, oneWeekBefore } from '../../utils/util.js';


const app = getApp();
Page({

  data: {
    ranking:'0',
    times:'0',
    hours:'0',
    date: '2018-01-24',
    today:'',
    oneWeekBefore:'',
    consume:'',
    btnDisable:false
  },
  onLoad(options) {
    this.setData({
      date: formatTime().substring(0, 10),
      today: formatTime().substring(0, 10),
      oneWeekBefore: oneWeekBefore()
    });
    this.loadData()
  },
loadData(){
  var _this = this;
  wx.request({
    url: app.globalData.url + '/over/gethours',
    header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
    method: 'GET',
    success(res) {
      if (res.data.errorcode == '0000') {
        _this.setData({
          times: res.data.days,
          hours: res.data.hours
        })
      }
    },
    fail(res) {

    }
  });
},
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  formSubmit(e) {
    var _this = this;
    var form_id = e.detail.formId;
    wx.request({
      url: app.globalData.url + '/chat/saveformid?formid=' + form_id + '&openid=' + app.globalData.openid + '&appid=' + app.globalData.appid,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      method: 'GET',
      success(res){},
      fail(res){}
    });
  
    var data = e.detail.value;
    data.workday = this.data.date;
   if (!data.workday) {
      wx.showToast({
        title: '请选择时间',
        icon: 'none',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    else if (!data.hours || data.consume <= 0) {
      wx.showToast({
        title: '请正确输入工时',
        icon: 'none',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    } else if (data.consume >7) {
      wx.showToast({
        title: '工时不能大于7',
        icon: 'none',
        image: '../../images/warning.png',
        duration: 2000
      });
      return false;
    }
   else if (!data.description) {
     wx.showToast({
       title: '请输入加班事由',
       icon: 'none',
       image: '../../images/warning.png',
       duration: 2000
     });
     return false;
   }
    _this.setData({
      btnDisable: true
    });
   data = encodeURI(JSON.stringify(data));
      wx.request({
        url: app.globalData.url + '/over/save',
        method: 'POST',
        data: data,
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) { 
          if (res.data.errorcode == '0000' && res.statusCode == 200) {
            //var pages = getCurrentPages();
           // var currPage = pages[pages.length - 1];   //当前页面
           // var prevPage = pages[pages.length - 2];  //上一个页面
            wx.showToast({
              title: '加班申请提交成功',
              icon: 'none',
              duration: 2000
            });
            _this.loadData();
            _this.setData({
              date: formatTime().substring(0, 10),
              consume:''
            });
            //wx.navigateBack()
          } else{
            wx.showToast({
              title: res.data.errormessage,
              icon: 'none',
              duration: 2000
            });
          }
          _this.setData({
            btnDisable: false
          })
        }, fail() {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            duration: 2000
          });
          _this.setData({
            btnDisable: true
          })
        }
      })

  }
})