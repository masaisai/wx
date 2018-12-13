// pages/select/people-select/people-select.js
const app = getApp()
Page({
  data: {
    object: '',
    peopleData: [],
    selectData: "",
    index:''
  },

  onLoad(options) {
    var _this = this;
    var peopleData = JSON.parse(JSON.stringify(app.globalData.allPeople));
    peopleData = peopleData.filter((item) => {
          item.head = item.head.replace(/\\/g, '/');
          return item.state!=2;
        });
    var selectData = JSON.parse(options.people);
    for (var i = 0; i <peopleData.length; i++) {
      if (peopleData[i]['code'] == selectData['code']) {
          peopleData[i]['checked'] = true;
        } else {
         peopleData[i]['checked'] = false;
        }
    };
    
    _this.setData({
      peopleData: peopleData,
      selectData: selectData,
      index: options.index
    });

  },

  radioChange(e) {
    var select={};
    var _this=this;
    select.code = e.detail.value;
    select.name = app.globalData[select.code].name;
    select.head = app.globalData[select.code].head;
  
    _this.data.peopleData.forEach((item,index)=>{
      if (item['code'] == select['code']) {
        item['checked'] = true;
      } else {
        item['checked'] = false;
      }
    })
    this.setData({
      selectData: select,
      peopleData: _this.data.peopleData
    })
  },
  confirmSelect() {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.data.daibanData[this.data.index].personliable = this.data.selectData;
    prevPage.setData({
      daibanData: prevPage.data.daibanData
    })
    wx.navigateBack()
  },
  imgError(e) {
    this.data.peopleData[e.currentTarget.dataset.index].head = '../../images/touxiang.png';
    this.setData({
      peopleData: this.data.peopleData
    })
  }

})