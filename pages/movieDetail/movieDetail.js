// pages/movieDetail/movieDetail.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isWant:false,
    isLooked:false,
    isAll:false,
    movie:null,
    canTap:"1",
    comments:null,
    watchRecord:"1"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // console.log(app.globalData.movieList)
    var that = this;
    var movie = app.globalData.movieList[app.globalData.movieIndex];
    // console.log(movie)
    var event = movie;
    // console.log(event)
    if (movie.introduction==null){
      movie.introduction = ''
    }
    var juzhaoList =[]
    if (movie.stagePhoto1 !=null){
      juzhaoList.push(movie.stagePhoto1) 
    }
    if (movie.stagePhoto2 != null) {
      juzhaoList.push(movie.stagePhoto2)
    }
    if (movie.stagePhoto3 != null) {
      juzhaoList.push(movie.stagePhoto3)
    }
    if (movie.stagePhoto4 != null) {
      juzhaoList.push(movie.stagePhoto4)
    }
    if (movie.stagePhoto5 != null) {
      juzhaoList.push(movie.stagePhoto5)
    }
    if (movie.stagePhoto6 != null) {
      juzhaoList.push(movie.stagePhoto6)
    }
    console.log(juzhaoList)

    that.setData({
      movie : movie,
      juzhaoList: juzhaoList
    })
    console.log(that.data.movie)
    // console.log(nameList)
    that.manage(event);
    // console.log(app.globalData)
    var nowtime = new Date().getTime();
    let apiuser = util.getAPIUserData(null);
    var a = app.globalData.openId
    // console.log(a)
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUserFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + a ,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log(res)
        // console.log(res.data.data)
        for (var i in res.data.data.film) { 
          if (res.data.data.film[i].filmImage == movie.image){
               that.setData({
                 isWant : 1
               })
          }
          // console.log(app.globalData.userInfo)
        }
      }
    })
    
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
  manage:function(event){
    var that = this;
    var movie = event;
    // movie.startPlay = movie.startPlay.substring(0,10);
    if (typeof (movie.photos) == "string"){
      movie.photos = movie.photos.split(",");
    }
    
    // console.log(movie)
    that.setData({
      movie:movie
    })
  },
  seeAll:function(){//查看全部介绍
    var that = this;
    if(that.data.isAll){
      that.setData({
        isAll:true
      })
    }else{
      that.setData({
        isAll: false
      })
    }
  },
  wantSee:function(){//想看按钮
    var that = this;
    let apiuser = util.getAPIUserData(null);
    if (that.data.canTap == "1") {
      that.setData({
        canTap: "0"
      })
      if (that.data.isWant == 0) {
        that.setData({
          isWant: 1
        })
      } else {
        that.setData({
          isWant: 0
        })
      }
      
      wx.request({
        url: app.globalData.url + '/Api/User/UpdateUserWantedFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + app.globalData.openId + '/' + that.data.movie.code + '/' + that.data.isWant,
        method: "GET",
        header: { 'content-type': 'application/json' },
        success: function (res) {
          // console.log(res);
          that.setData({
            canTap: "1"
          })
        }
      })
    } 
  },
  toCompare:function(){
    app.globalData.movieId = app.globalData.movieList[app.globalData.movieIndex].id;
    wx.navigateTo({
      url: '../compare/compare',
    })
  },
  toComments:function(){
    var id = app.globalData.movieList[app.globalData.movieIndex].id;
    wx.navigateTo({
      url: '../compare/compare?id='+id,
    })
  },
  looked:function(){  // 看过按钮
    var that = this;
    let apiuser = util.getAPIUserData(null);
    if (that.data.watchRecord == '1') {
      that.setData({
        watchRecord: '0',
      })
    if (that.data.isLooked == '1') {
      that.setData({
        isLooked: '0',
      })
    } else {
      that.setData({
        isLooked: '1',
      })
    }
    // console.log(that.data.watchRecord)
    wx.request({
      url: app.globalData.url + '/Api/User/UpdateUserWantedFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + app.globalData.openId + '/' + that.data.movie.code + '/' + that.data.watchRecord,
      method: "GET",
      header: { 'content-type': 'application/json' },
      success: function (res) {
        // console.log(res);
        that.setData({
          watchRecord: '1'
        })
      }
    })
    }
  }

})