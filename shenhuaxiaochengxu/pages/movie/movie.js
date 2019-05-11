// pages/movie/movie.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location:"",
    movieRoom:null,
    banner: [{ imageUrl: "/images/comparebg.jpg"}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that = this;
    // that.setData({
    //   location: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName
    // })
    // that.getBanner();
    // var nowtime = new Date().getTime();
    // var sign = app.createMD5('getRoom', nowtime);
    // wx.request({
    //   url: app.globalData.url + '/api/chatRoom/getRoom',
    //   data: {
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     appUserId:app.globalData.userInfo.id,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    //   },
    //   success: function (e) {
    //     console.log(e)
    //     var movieRoom = e.data.data;
    //     for (var i = 0; i < movieRoom.length;i++){
    //       movieRoom[i].startTime2 = movieRoom[i].startTime.substring(11,16).replace("-",":");
    //       movieRoom[i].endTime2 = movieRoom[i].endTime.substring(11, 16).replace("-", ":");
    //     }
    //     that.setData({
    //       movieRoom: movieRoom
    //     })
    //     app.globalData.movieRoom = movieRoom;
    //   }
    // })
  },
  roomin:function(e){
    var index = e.currentTarget.dataset.index;
    if (app.globalData.userInfo.mobile == null || app.globalData.userInfo.mobile == "") {
      wx.showToast({
        title: '请先注册手机号',
        icon: "loading",
        mask: true,
        duration: 2000,
        success: function () {
          setTimeout(function () {
            wx.redirectTo({
              url: '../login/login'
            })
          }, 2000)
        }
      })
      return;
    }
    app.globalData.roomNum = index;
    wx.navigateTo({
      url: '../room/room',
    })
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
    // this.setData({
    //   userInfo: app.globalData.userInfo
    // })
    var that = this;
    that.setData({
      location: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName
    })
    that.getBanner();
    var nowtime = new Date().getTime();
    var sign = app.createMD5('getRoom', nowtime);
    wx.request({
      url: app.globalData.url + '/api/chatRoom/getRoom',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        appUserId: app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (e) {
        // console.log(e)
        var movieRoom = e.data.data;
        for (var i = 0; i < movieRoom.length; i++) {
          movieRoom[i].startTime2 = movieRoom[i].startTime.substring(11, 16).replace("-", ":");
          movieRoom[i].endTime2 = movieRoom[i].endTime.substring(11, 16).replace("-", ":");
        }
        that.setData({
          movieRoom: movieRoom
        })
        app.globalData.movieRoom = movieRoom;
      }
    })
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
  getBanner: function () { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    wx.request({
      url: app.globalData.url + '/api/banner/banners',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        category: "5", //4 卖品 5聊天室房间列表 6个人中心背景图
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if (res.data.data.length>0){
          that.setData({
            banner: res.data.data
          })
        }
        
      }
    })
  },
  bannerTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var banner = this.data.banner;
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