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
    watchRecord:"0"
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
    console.log(movie)
    var event = movie;
    // console.log(event)
    var nameList = event.cast.split(',')
    // console.log(nameList)
    that.setData({
      nameList:nameList
    })
    that.manage(event);
    // console.log(app.globalData)
    var nowtime = new Date().getTime();
    let apiuser = util.getAPIUserData(null);
    var a = app.globalData.openID
    console.log(a)
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryUserFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + a + '/' + 1,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data.data)
        for (var i in res.data.data.film) { 
          if (res.data.data.film[i].filmName == movie.name){
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
      title: '神画电影',
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
        url: 'https://xc.80piao.com:8443/Api/User/UpdateUserWantedFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + app.globalData.openId + '/' + that.data.movie.code + '/' + that.data.isWant,
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
  getComment:function(){//获取评论列表
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('commentList', nowtime);
    wx.request({
      url: app.globalData.url+'/api/Comment/commentList',
      data: {
        movieId: that.data.movie.id,
        pageNo:"1",
        pageSize: "3",
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        // console.log(res);
        that.setData({
          comments:res.data.data
        })
      }
    })
  },
  praiseComment:function(e){//评论点赞
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('upvote', nowtime);
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.url+'/api/movie/comment/upvote',
      data: {
        appUserId:app.globalData.userInfo.id,
        id: id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        var newComment = that.data.comments;
        for (var i = 0; i < newComment.length;i++){
          if (newComment[i].id == id){
            newComment[i].upvoteNum = res.data.data.upvoteNum;
            newComment[i].upvoteStatus = res.data.data.upvoteStatus;
          }
        }
        that.setData({
          comments: newComment
        })
      }
    })
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
  looked:function(){
    var that = this;
    if(that.data.watchRecord == 0){
      wx.showModal({
        title: '',
        content: '您还没有看过该影片哦',
      })
    }else{
      if(that.data.commentRecord == 0){
        wx.navigateTo({
          url: '../commentmovie/commentmovie?movieId='+that.data.movie.id,
        })
      }else{
        wx.showModal({
          title: '',
          content: '您已经评论过该影片哦',
        })
      }
    }
  }

})