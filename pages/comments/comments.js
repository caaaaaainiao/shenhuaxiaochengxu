// pages/comments/comments.js
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
    var sign = app.createMD5('commentList', nowtime);
    var pageNo = that.data.pageNo;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/api/Comment/commentList',
      data: {
        movieId: that.data.movie.id,
        pageNo: pageNo,
        pageSize: that.data.pageSize,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res);
        wx.hideLoading()
        var result = that.addJson(that.data.result, res.data.data);
        pageNo++;
        that.setData({
          result: result,
          pageNo: pageNo
        })
      }
    })
  },
  addJson: function(json1, json2) {
    if (json1 == null) {
      return json2
    }
    for (var i = 0; i < json2.length; i++) {
      json1.push(json2[i])
    }
    return json1


  }
})