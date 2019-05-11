// pages/accredit/accredit.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  getUserInfo: function (e) {
    // console.log(e)
    if (e.detail.errMsg == "getUserInfo:fail auth deny"){
        wx.showToast({
          title: '请先授权',
          icon:"loading",
          duration:2000
        })
    } else if (e.detail.errMsg == "getUserInfo:ok"){
      this.setData({
        userInfo: e.detail.userInfo,
      })
      app.globalData.userInfo = e.detail.userInfo;
      wx.setStorage({
        key: 'accredit',
        data: {
          "userInfo": e.detail.userInfo
        },
        success:function(res){
          // console.log(res)
          wx.switchTab({
            url: '../index/index',
          })
        }
      })
    }
    

  },
})