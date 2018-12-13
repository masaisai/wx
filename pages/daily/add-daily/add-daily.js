// pages/daily/add-daily/add-daily.js
import { formatTime } from '../../../utils/util.js';
var app = getApp()
Page({

  data: {
    id: '',
    type: 'add',
    proid: '',
    proname: '',
    date: '2018-01-24',
    protypeIndex: '1',
    protypeArry: [],
    tasktypeArry: [],
    protypeData: [],
    consume: '',
    content: '',
    btnDisable: false
  },

  onLoad(options) {
    var _this = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    _this.setData({
      cardHeight: wx.getSystemInfoSync().windowHeight - 80 + 'px'
    });
    wx.request({
      url: app.globalData.url + '/dict/loadDict?dictTypeId=tasktype',
      method: 'GET',
      data: {},
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      success(res) {
        var protypeArry = [];
        var tasktypeArry = [];
        res.data.map((item,index)=>{
          protypeArry.push(item.dictvalues);
          tasktypeArry.push(item.dictkey);
        })
        protypeArry.forEach((item,index)=>{
          if (item == options.tasktype){
            _this.setData({
              protypeIndex: index
            });
          }
        });
        _this.setData({
          protypeData: res.data,
          protypeArry: protypeArry,
          tasktypeArry: tasktypeArry
        });

      }
    })
    if (options.type == 'project-add') {
     
      this.setData({
        type: options.type,
        proid: options.proid,
        proname: options.proname,
        date: formatTime().substring(0, 10)
      })
    } else if (options.type == 'edit') {
      wx.setNavigationBarTitle({
        title: '编辑日报'
      })
     
      this.setData({
        type: options.type,
        proid: options.proid,
        proname: options.proname,
        id: options.id,
        consume: options.consume,
        content: options.content,
        date: options.workday
      });
    
    } else {
      wx.request({
        url: app.globalData.url + '/project/query',
        method: 'POST',
        data: {},
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) {
          if(res.data.data.length>0){
            _this.setData({
              type: 'add',
              proid: res.data.data[0].id,
              proname: res.data.data[0].proname,
              date: formatTime().substring(0, 10)
            })
          }
          


        }
      })

    }


  },

 

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
 
  },


  bindProTypeChange(e) {
    this.setData({
      protypeIndex: e.detail.value
    })
  },
  selectProject() {
    if (this.data.type == 'edit') {
      return false;
    }
    wx.navigateTo({
      url: '../../select/project-select/project-select?proid=' + this.data.proid,
    })
  },
  bindDateChange(e){
    this.setData({
      date:e.detail.value
    })
  },
  formSubmit(e) {
    var _this = this;
    var form_id = e.detail.formId;
    wx.request({
      url: app.globalData.smsurl + '/chat/saveformid?formid=' + form_id + '&openid=' + app.globalData.openid + '&appid=' + app.globalData.appid,
      header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
      method: 'GET',
      success(res) {
        
      },
      fail(res) {

      }
    });
    if (e.detail.target.dataset.type == 'button') {
      return false
    }
    var data = e.detail.value;
    data.proid = this.data.proid;
    data.workday = this.data.date;
    data.tasktype = this.data.tasktypeArry[this.data.protypeIndex];
    if (!data.proid) {
      wx.showToast({
        title: '请选择项目',
        icon: 'success',
        image: '../../../images/warning.png',
        duration: 2000
      });
      return false;
    } else if (!data.workday) {
      wx.showToast({
        title: '请选择日报时间',
        icon: 'success',
        image: '../../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    else if (!data.tasktype) {
      wx.showToast({
        title: '请选择任务类型',
        icon: 'success',
        image: '../../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    else if (!data.consume || data.consume <= 0) {
      wx.showToast({
        title: '请正确输入耗时',
        icon: 'success',
        image: '../../../images/warning.png',
        duration: 2000
      });
      return false;
    } else if (data.consume > 7) {
      wx.showToast({
        title: '耗时不能大于7',
        icon: 'success',
        image: '../../../images/warning.png',
        duration: 2000
      });
      return false;
    } else if (!data.content) {
      wx.showToast({
        title: '请输入内容',
        icon: 'success',
        image: '../../../images/warning.png',
        duration: 2000
      });
      return false;
    }
    _this.setData({
      btnDisable: true
    })
    if (_this.data.type == 'project-add' || _this.data.type == 'add') {
      data = encodeURI(JSON.stringify(data));
      wx.request({
        url: app.globalData.url + '/daily/add',
        method: 'POST',
        data: data,
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) {
          if (res.data.errorcode == '0003') {
            app.loginOut()
          }
          if (res.data.errorcode == '0000') {
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1];   //当前页面
            var prevPage = pages[pages.length - 2];  //上一个页面
           
            if (_this.data.type == 'add') {
              prevPage.loadData();
            }
            wx.showToast({
              title: '日报提交成功',
              icon: 'success',
              duration: 2000
            });
            wx.navigateBack()
          }
          _this.setData({
            btnDisable: false
          })
        }, fail(res) {
          _this.setData({
            btnDisable: true
          })
        }
      })
    } else if (_this.data.type == 'edit') {
      data.id = _this.data.id
      data = encodeURI(JSON.stringify(data));
      wx.request({
        url: app.globalData.url + '/daily/updatedaily',
        method: 'POST',
        data: data,
        header: { 'Content-Type': 'application/json', 'Content-Cloud-Token': app.globalData.userid },
        success(res) {
         
          if (res.data.errorcode == '0000') {
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1];   //当前页面
            var prevPage = pages[pages.length - 2];  //上一个页面
            if (prevPage.loadData) { prevPage.loadData() }

            wx.showToast({
              title: '日报修改成功',
              icon: 'success',
              duration: 2000
            });
           setTimeout(()=>{
             wx.navigateBack()
           },500)
          }
          _this.setData({
            btnDisable: true
          })
        },
        fail() {
          _this.setData({
            btnDisable: true
          })
        }
      })
    }


  },
  back(){
    wx.navigateBack()
  }
})