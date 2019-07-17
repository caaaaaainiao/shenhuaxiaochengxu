// pages/cardRecord/cardRecord.js
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
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  ask: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/Api/Member/CardChargeRecord' + '/' + app.globalData.userInfo.openID + '/' + app.globalData.card[0].cardNo,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.Status == 'Success' && res.data.data) {
          let result = res.data.data;
          for (let i = 0; i < result.length; i ++) {
            if (result[i].chargeTime) {
              let cardNo = "result[" + i + "].cardNo";
              let chargeTime = "result[" + i + "].chargeTime";
              let rechargeAmount = "result[" + i + "].rechargeAmount";
              let chargeStatus = "result[" + i + "].chargeStatus";
              that.setData({
                [cardNo]: result[i].cardNo,
                [chargeTime]: result[i].chargeTime,
                [rechargeAmount]: result[i].rechargeAmount,
                [chargeStatus]: result[i].chargeStatus,
              })
            } else {
              result[i].chargeTime = '';
              let cardNo = "result[" + i + "].cardNo";
              let chargeTime = "result[" + i + "].chargeTime";
              let rechargeAmount = "result[" + i + "].rechargeAmount";
              let chargeStatus = "result[" + i + "].chargeStatus";
              that.setData({
                [cardNo]: result[i].cardNo,
                [chargeTime]: result[i].chargeTime,
                [rechargeAmount]: result[i].rechargeAmount,
                [chargeStatus]: result[i].chargeStatus,
              })
            }
          }
        }
        wx.hideLoading()
      }
    })
  },
  addJson: function (json1, json2) {
    if (json1 == null) {
      return json2
    }
    for (var i = 0; i < json2.length; i++) {
      json1.push(json2[i])
    }
    return json1


  }
})