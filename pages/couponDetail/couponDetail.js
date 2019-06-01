// pages/couponDetail/couponDetail.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var result= app.globalData.thisresult
    console.log(result)
    this.setData({
      id:options.id,
      result: result
    })
    this.ask();
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

  },
  ask: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('ticketInfo', nowtime);
    // wx.request({
    //   url: app.globalData.url + '/api/ticket/ticketInfo',
    //   data: {
    //     id:that.data.id,
    //     // id:8,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     // console.log(res)
    //     var coupon = res.data.data;
    //     coupon.endTime2 = coupon.endTime.substring(0,10);
    //     that.setData({
    //       coupon: coupon
    //     })
    //   }
    // })
  },
})