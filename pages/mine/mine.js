// pages/mine/mine.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    progress: false,
    count: null,
    banner: "/images/comparebg.jpg",
    banner2: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    if (this.data.userInfo.mobile == null || this.data.userInfo.mobile == ""){
      wx.navigateTo({
        url: '../login/login',
      })
    }
    this.getBanner();
    this.getBanner2();
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
      userInfo: app.globalData.userInfo
    })
    this.ask();
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
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  myTicket: function() {
    wx.navigateTo({
      url: '../myticket/myticket',
    })
  },
  myFood: function() {
    wx.navigateTo({
      url: '../myfood/myfood',
    })
  },
  myCoupon: function() {
    var that = this;
    // wx.showToast({
    //   title: '暂未开放',
    //   icon: "loading",
    //   duration: 2000
    // })
    wx.navigateTo({
      url: '../mycoupon/mycoupon?number=' + that.data.count.couponCount,
    })
  },
  myPrize: function() {
    wx.navigateTo({
      url: '../myprize/myprize',
    })
  },
  toCommon: function() {
    wx.navigateTo({
      url: '../common/common',
    })
  },
  toActivity: function() {
    wx.navigateTo({
      url: '../hotActivity/hotActivity',
    })
  },
  toSeenMovie: function() {
    wx.navigateTo({
      url: '../seenMovie/seenMovie',
    })
  },
  toWantsee: function() {
    wx.navigateTo({
      url: '../wantsee/wantsee',
    })
  },
  toMycard: function() {
    wx.navigateTo({
      url: '../mycard/mycard',
    })
  },
  ask: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('shUserCenter', nowtime);
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/shDistributor/shUserCenter',
      data: {
        appUserId: app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res.data)
        that.setData({
          count: res.data.data
        })
        wx.hideLoading();
      }
    })
  },
  getBanner: function() { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    wx.request({
      url: app.globalData.url + '/api/banner/banners',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        category: "6", //4 卖品 5聊天室房间列表 6个人中心背景图
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        if (res.data.data.length > 0) {
          that.setData({
            banner: res.data.data[0].imageUrl
          })
        }

      }
    })
  },
  getBanner2: function() { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    wx.request({
      url: app.globalData.url + '/api/banner/banners',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        category: "7", //4 卖品 5聊天室房间列表7个人中心底部banner图
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        if (res.data.data.length > 0) {
          that.setData({
            banner2: res.data.data
          })
        }

      }
    })
  },
  bannerTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var banner = this.data.banner2;
    var num = banner[index].playType;
    if (num == 1 || num == 3) {
      var url = banner[index].redirectUrl;
      if (url != "") {
        app.globalData.acivityUrl = url;
        wx.navigateTo({
          url: '../acivityUrl/acivityUrl',
        })
      }
    } else if (num == 2 && banner[index].dxMovie != null) {
      var id = banner[index].dxMovie.id;
      var movieList = app.globalData.movieList;
      for (var i = 0; i < movieList.length; i++) {
        if (movieList[i].id == id) {
          app.globalData.movieIndex = i;
          wx.navigateTo({
            url: '../movieDetail/movieDetail',
          })
        }
      }
    }
  }
})