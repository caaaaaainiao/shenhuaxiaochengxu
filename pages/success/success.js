// pages/success/success.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum:0,
    order:null,
    banner:"",
    movieName: null,
    count: null,
    date: null,
    seat: null,
    printNo: null,
    nowTime: null,
    verifyCode: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderNum:options.orderNum,
      movieName: options.movieName,
      count: options.count,
      printNo: options.printNo,
      date: options.date,
      seat: options.seat,
      nowTime: options.nowTime,
      verifyCode: options.verifyCode,
    })
    // this.getBanner();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('orderDetail', nowtime);
  },
  look:function(e){
    let that = this;
    wx.redirectTo({
      url: '../orderDetail/orderDetail?orderNum=' + that.data.orderNum + '&&movieName=' + that.data.movieName + '&&count=' + that.data.count + '&&printNo=' + that.data.printNo + '&&verifyCode=' + that.data.verifyCode + '&&date=' + that.data.date + '&&seat=' + that.data.seat + '&&nowTime=' + that.data.nowTime,
    })
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
  getBanner: function () { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    // wx.request({
    //   url: "https://xc.80piao.com:8443/Api/Activity/QueryActivitys",
    //   method: "GET",
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function (res) {
    //     console.log(res)
    //     if (res.data.data.length > 0) {
    //       that.setData({
    //         banner: res.data.data
    //       })
    //     }
    //   }
    // })
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