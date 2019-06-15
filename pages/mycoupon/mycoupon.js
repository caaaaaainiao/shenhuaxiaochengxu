// pages/mycoupon/mycoupon.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdd:false,
    result: null,
    // pageNo: 1,
    // pageSize: 10,
    couponCount:0,
    couponNum:"",
    pages: null,
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.ask();
    var pages = getCurrentPages().length - 1;
    that.setData({
      pages: pages,
    });
    if (pages == 0) {
      that.setData({
        isShow: true,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  ask: function () {
    var that = this;
    console.log(app.globalData)
    var nowtime = new Date().getTime();
    var pageNo = that.data.pageNo;
    var data = {
      Username: 'MiniProgram',
      Password: '6BF477EBCC446F54E6512AFC0E976C41',
      CinemaCode: app.globalData.cinemacode,
      OpenID: app.globalData.openId,
      Status: 'All'
    };
    
    wx.request({
      url: app.globalData.url + '/Api/Conpon/QueryUserConpons' + '/' + data.Username + '/' +data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.Status,
      method: "Get",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        var result = that.addJson(that.data.result, res.data.data);
        that.setData({
          result: result.conpons,
          couponCount: result.conponCount
        })
        app.globalData.resultList = that.data.result
      }
    })
  },
  toDetail: function (e) {
    var num = e.currentTarget.dataset.num;
    var status = e.currentTarget.dataset.status;
    // if(status == 3){
    //   return;
    // }
    // wx.navigateTo({
    //   url: '../orderDetail/orderDetail?orderNum=' + num,
    // })
  },
  addJson: function (json1, json2) {
    if (json1 == null) {
      return json2
    }
    for (var i = 0; i < json2.length; i++) {
      json1.push(json2[i])
    }
    return json1


  },
  toIndex:function(e){
    var type = e.currentTarget.dataset.type;
    // var plat = e.currentTarget.dataset.plat;
    // var that = this;
    // if(plat == 2){
    //   var nowtime = new Date().getTime();
    //   var sign = app.createMD5('verficationCxTicket', nowtime);
    //   wx.showLoading({
    //     mask: true
    //   })
    //   wx.request({
    //     url: app.globalData.url + '/api/shOrder/verficationCxTicket',
    //     data: {
    //       appUserId: app.globalData.userInfo.id,
    //       orderNum:"",
    //       seatTicketId:"",
    //       timeStamp: nowtime,
    //       mac: sign
    //     },
    //     method: "POST",
    //     header: {
    //       "Content-Type": "application/x-www-form-urlencoded"
    //     },
    //     success: function (res) {
         
    //     }
    //   })
    // }else{
      if (type == 2) {
        wx.switchTab({
          url: '../sell/sell',
        })
      } else {
        wx.switchTab({
          url: '../index/index',
        })
      }
    // }
    
    
  },
  
  // 返回首页
  back: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },

  toDetail:function(e){
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    app.globalData.thisresult = this.data.result[index]

    wx.navigateTo({
      url: '../couponDetail/couponDetail?id='+id,
    })
  },
  addCoupon:function(){
    this.setData({
      isAdd:true
    })
  },
  closeAdd:function(){
    this.setData({
      isAdd: false
    })
  },
  couponNum:function(e){
    this.setData({
      couponNum:e.detail.value
    })
  },
  submitAdd:function(){
    var that = this;
    var num = that.data.couponNum;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('bindCxTichet', nowtime);
    // wx.showLoading({
    //   title: '添加中...',
    //   mask:true
    // })
    // wx.request({
    //   url: app.globalData.url + '/api/ticket/bindCxTichet',
    //   data: {
    //     ticketNumber:num,
    //     appUserId: app.globalData.userInfo.id,
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     console.log(res)
    //     wx.hideLoading();
    //     if(res.data.status == 1){
    //       wx.showToast({
    //         title: '绑定成功',
    //       })
    //       setTimeout(function(){
    //         wx.redirectTo({
    //           url: '/pages/mycoupon/mycoupon',
    //         })
    //       },1000)
    //     }else{
    //       wx.showModal({
    //         title: '绑定失败',
    //         content: res.data.message,
    //       })
    //     }
    //     that.setData({
    //       isAdd:false
    //     })
    //   }
    // })
  }
})