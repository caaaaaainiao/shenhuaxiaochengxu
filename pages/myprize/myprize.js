// pages/myprize/myprize.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: null,
    pageNo: 1,
    pageSize: 10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ask();
    wx.setNavigationBarTitle({ title: '我的奖品' });
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
    wx.setNavigationBarTitle({ title: '我的奖品' });
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
    var nowtime = new Date().getTime();
    var sign = app.createMD5('myGift', nowtime);
    var pageNo = that.data.pageNo;
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.request({
      url: app.globalData.url + '/Api/User/QueryGiftRecord',
      data: {
        "userName": "MiniProgram",
        "password": "6BF477EBCC446F54E6512AFC0E976C41",
        "cinemaCode": "33097601",
        "openID": "o9gGQ4nuoKAZq1Xjp_N3iu3bmpZs"
      },
      method: "Post",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        console.log(res.data.data)
        // wx.hideLoading()
        var result = res.data.data;
        that.setData({
          result: result,
          // pageNo: pageNo
        })
      }
    })
  },
})