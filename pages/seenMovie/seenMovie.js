// pages/seenMovie/seenMovie.js
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
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ask();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('getSeeMovieNum', nowtime);
    var pageNo = that.data.pageNo;
    // wx.showLoading({
    //   title: '加载中',
    // })
    // wx.request({
    //   url: app.globalData.url + '/shDxMovie/getSeeMovieNum',
    //   data: {
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
    //     // console.log(res)
    //     wx.hideLoading()
    //     that.setData({
    //       total: res.data.data.seeNum
    //     })
    //   }
    // })
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
  ask: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('getSeeMovie', nowtime);
    var pageNo = that.data.pageNo;
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryMovieSeen/' + 'MiniProgram' + '/' + '6BF477EBCC446F54E6512AFC0E976C41' + '/' + app.globalData.cinemacode + '/' + app.globalData.openId,
      method: 'GET',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
       console.log(res.data.data.seen.length)
            that.setData({
              result: res.data.data.seen,
              total: res.data.data.seen.length
            })
      }

    })
    // wx.request({
    //   url: app.globalData.url + '/shDxMovie/getSeeMovie',
    //   data: {
    //     appUserId: app.globalData.userInfo.id,
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     pageNo: pageNo,
    //     pageSize: that.data.pageSize,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     // console.log(res)
    //     wx.hideLoading()
    //     var result = that.addJson(that.data.result, res.data.data);
    //     pageNo++;
    //     for (var i = 0; i < result.length; i++) {
    //       result[i].watchTime2 = result[i].watchTime.substring(0, 10)
    //     }
    //     that.setData({
    //       result: result,
    //       pageNo: pageNo
    //     })
    //   }
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
  comment:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../commentmovie/commentmovie?id='+id,
    })
  }
})