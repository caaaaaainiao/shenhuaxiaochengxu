// pages/suggestion/suggestion.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: null,
    suggestion: "",
    phone: "",
    isAsk: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.ask();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      isAsk: false
    });
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  ask: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('list', nowtime);
    wx.request({
      url: app.globalData.url + '/api/suggestion/list',
      data: {
        appUserId: app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function(res) {
        // console.log(res)
        var result = res.data.data;
        for (var i = 0; i < result.length; i++) {
          result[i].createTime2 = result[i].createTime.substring(0, 10)
        }
        that.setData({
          result: result,
        })
      }
    })
  },
  question: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('suggestions', nowtime);
    if (that.data.phone.length != 11) {
      wx.showModal({
        title: '提交失败',
        content: '手机号格式不正确',
      })
      return
    }
    if (that.data.suggestion.length == 0) {
      wx.showModal({
        title: '提交失败',
        content: '请输入您的意见',
      })
      return
    }
    wx.showLoading({
      title: '提交中',
    })
    wx.request({
      url: app.globalData.url + '/api/suggestion/suggestions;charset=utf-8',
      data: {
        appUserId: app.globalData.userInfo.id,
        phone: that.data.phone,
        suggestion: that.data.suggestion,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        wx.hideLoading()
        if (res.data.status == 1) {
          wx.showToast({
            title: '提交成功',
            icon: "loading",
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '提交失败',
            content: '',
          })
        }
        that.setData({
          isAsk: false
        })
      }
    })
  },
  words: function(e) {
    var that = this;
    that.setData({
      suggestion: e.detail.value
    })
  },
  phone: function(e) {
    var that = this;
    that.setData({
      phone: e.detail.value
    })
  },
  showAsk: function() {
    this.setData({
      isAsk: true
    })
  }
})