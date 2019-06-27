// pages/movie/movie.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location:"",
    movieRoom:null,
    Username : '',
    Password : '',
    CinemaCode : '',
    banner: [{ imageUrl: "/images/comparebg.jpg" }],
    MovieList : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.globalData.url+'/Api/Activity/QueryActivitys/' + 'MiniProgram/' +'6BF477EBCC446F54E6512AFC0E976C41/'+app.globalData.cinemacode +'/04',
      method:'GET',
      success: function (res) {
        console.log(res.data.data)
        that.setData({
          picture: res.data.data.images
        })

      }
    })
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
  },
  roomin:function(e){
    var that =this
    var index = e.currentTarget.dataset.index;
    app.globalData.movieRoom = that.data.MovieList[index];
    console.log(that.data.MovieList[index])
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.mobilePhone) {
          wx.navigateTo({
            url: '../room/room',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../login/login',
        })
      }
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
    if (app.globalData.lookcinemaname == undefined) {
      app.globalData.lookcinemaname = app.globalData.areaList[0].cinemaName
    }
    var lookcinemaname = app.globalData.lookcinemaname
    this.setData({
      lookcinemaname: lookcinemaname
    })
    var that = this;
    var nowtime = new Date().getTime();
    that.getNowTimeMovie()
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
  },
  getNowTimeMovie : function (){
    var that = this
    let apiuser = util.getAPIUserData(null);
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/Api/chatRoom/getRooms' ,
      // url: app.globalData.url + '/Api/chatRoom/getRooms',
      method: "POST",
      data:{
        cinemaCode  : app.globalData.cinemacode
      },
      header: {
        // 'content-type': 'application/json' // 默认值
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading()
        // that.data.FlimList.push(res)
        that.setData({
          MovieList : res.data
        })
       
      }
    })
  }
})