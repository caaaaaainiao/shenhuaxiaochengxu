// pages/wantsee/wantsee.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: null,
    pageNo: 1,
    pageSize: 10,
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ask();
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
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
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
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
    let apiuser = util.getAPIUserData(null);
    var a = app.globalData.openId
    console.log(a)
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUserFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + a + '/' + 1,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading()
        console.log(res.data.data)
        that.setData({
          result: res.data.data,
          // pageNo: pageNo
        })
      }
    })
  },
})