// pages/orderDetail/orderDetail.js
//获取应用实例
const app = getApp();
const QRCode = require('../../utils/weapp-qrcode.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum:0,
    order: null,
    retreat:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      orderNum:options.orderNum,
    });
      //订单详情
    wx.request({
      url: app.globalData.url + '/Api/Goods/QueryGoodsOrder' + '/' + 'MiniProgram' + '/' + '6BF477EBCC446F54E6512AFC0E976C41' + '/' + app.globalData.cinemacode + '/' + that.data.orderNum,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        // console.log(app.globalData)
        that.setData({
          order : res.data.data,
          cinemaList: app.globalData.cinemaList
        })
        var qrcode = new QRCode('canvas', {
          text: that.data.order.orderCode,
          width: 150,
          height: 150,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('orderDetail', nowtime);
  },
  phone: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  refund:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('refund', nowtime);
    wx.showLoading({
      title: '加载中',
    })
  },
  cancel:function(){
    this.setData({
      retreat:false
    })
  },
  refundbtn:function(){
    this.setData({
      retreat: true
    })
  },
  syn: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userCard', nowtime);
    wx.showLoading({
      title: '同步中',
    })
    wx.request({
      url: app.globalData.url + '/api/shAppuser/userCard',
      data: {
        appUserId: app.globalData.userInfo.id,
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        wx.hideLoading();
        if (res.data.status == 1) {
          var userInfo = res.data.data;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo;
          setTimeout(function () {
            wx.switchTab({
              url: '../mine/mine',
            })
          }, 2000)
        } else {
          wx.showModal({
            title: '',
            content: res.data.message
          })
        }
      }
    })
  },
})