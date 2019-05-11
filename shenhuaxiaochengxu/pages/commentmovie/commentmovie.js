// pages/commentmovie/commentmovie.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: [
      { text: "好看到炸裂！", select: false },
      { text: "非常温暖感人，推荐！", select: false },
      { text: "见仁见智", select: false },
      { text: "给导演加鸡腿", select: false },
      { text: "剧情不错！", select: false },
      { text: "值回票价", select: false },
      { text: "演员太美，舔屏！", select: false },
      { text: "演技满分！", select: false },
    ],
    movieId:"",
    inputText:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieId:options.id
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
  inputText:function(e){
    var text = e.detail.value;
    this.setData({
      inputText:text
    })
  },
  select:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var text = that.data.text;
    if (text[index].select){
      text[index].select = false;
    }else{
      text[index].select = true;
    }
    that.setData({
      text:text
    })
  },
  submit:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('saveComment', nowtime);
    var str = "";
    var comment = "";
    for(var i = 0;i < that.data.text.length;i++){
      if(that.data.text[i].select){
        comment += that.data.text[i].text;
      }
    }
    comment += that.data.inputText;
    wx.showLoading({
      title: '提交中',
    })
    wx.request({
      url: app.globalData.url + '/api/Comment/saveComment',
      data: {
        appUserId: app.globalData.userInfo.id,
        comment: comment,
        movieId:that.data.movieId,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: function (res) {
        // console.log(res)
        if(res.data.status == 1){
          wx.showToast({
            title: '评论成功',
            duration:2000,
            icon:"loading"
          })
          setTimeout(function(){
            wx.redirectTo({
              url: '../seenMovie/seenMovie?id=' + that.data.movieId,
            })
          },1500)
        }else{
          wx.showModal({
            title: '评论失败',
            content: '',
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  }
})