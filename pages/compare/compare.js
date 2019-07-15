// pages/compare/compare.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // location:"神画影院人民广场店 ",
    moviesList: null,
    swiperIndex: 0,
    movieId: null,
    cinemaCode: null,
    screenPlanList: null,
    select: 0,
    orderNum:0,
    showTask:false,
    showTip:0,
    moviearea:null,
    isLoading:true,
    moviesListDate: null,
    isShow:false,
    index: 0,
    selectedIndex:0,
    buyNum : 4
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(app.globalData)
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;   
    this.setData({
      checkfilmcode: app.globalData.checkfilmcode,
      swiperIndex: app.globalData.movieIndex
    })
    this.swiperIndex = this.data.swiperIndex
    // this.moviesList = app.globalData.moviearea
    that.setData({
      movieId: app.globalData.movieId,
      moviearea: app.globalData.moviearea,
      cinemaNo: app.globalData.cinemaNo,
      swiperIndex: app.globalData.movieIndex
    })
    that.getStorageMovieList()
    that.ask();
  },
  getStorageMovieList(){
    var that = this
    wx.getStorage({
      key: 'movieList',
      success: function (res) {
        that.setData({
          moviesList: res.data
          })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
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

  /**b
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
  onShareAppMessage: function () {
    return {
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  swiperChange(e) { //切换电影
    const that = this;
    that.setData({
      swiperIndex: e.detail.current,
      checkfilmcode: that.data.moviesList[e.detail.current].code,
      select: 0
    })
    setTimeout(function() {
      wx.hideLoading();
    }, 500)
    // console.log(that.data.swiperIndex)
    that.ask();
    app.globalData.movieIndex = that.data.swiperIndex;
  },
  dayChange: function(e) { //切换日期
    var day = e.currentTarget.dataset.index;
    this.setData({
      select: day
    })
  },
  manage: function(data) { //影片排片数据处理
    var that = this;
    var screenPlanList = data;
    var json;
    for (var i = 0; i < screenPlanList.length; i++) {
      var month = parseInt(screenPlanList[i].date.substring(5, 7));
      var day = parseInt(screenPlanList[i].date.substring(8, 11));
      var date = new Date();
      var nowMonth = date.getMonth() + 1;
      var nowDay = date.getDate();
      var date2 = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      var nowMonth2 = date2.getMonth() + 1;
      var nowDay2 = date2.getDate();
      var date3 = new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000);
      var nowMonth3 = date3.getMonth() + 1;
      var nowDay3 = date3.getDate();
      if (month == nowMonth && day == nowDay){
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        screenPlanList[i].date = month + "-" + day + " " + "今天";
      } else if (month == nowMonth2 && day == nowDay2){//明天
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        screenPlanList[i].date = month + "-" + day + " " + "明天";
      } else if (month == nowMonth3 && day == nowDay3) {//后天
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        screenPlanList[i].date = month + "-" + day + " " + "后天";
      } else {
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        screenPlanList[i].date = month + "-" + day;
      }
      var oneDay = screenPlanList[i];
      for (var j = 0; j < oneDay.list.length; j++) {
        // console.log(oneDay.list[j].endTime)
        oneDay.list[j].endTime2 = oneDay.list[j].endTime.substring(11, 16);
        oneDay.list[j].startTime2 = oneDay.list[j].startTime.substring(11, 16);
        oneDay.list[j].startCompare = false;
        oneDay.list[0].startCompare = true;
      }
    }
    that.setData({
      screenPlanList: screenPlanList
    })
    app.globalData.screenPlanList = that.data.screenPlanList;
  },
  buyMoer : function(e){
    
    this.setData({
      buyNum: e.target.dataset.index
    })
    console.log(this.data.buyNum)
  },
  ask: function() { //请求数据
    var that = this;
    var nowtime = new Date();
    let nowday = util.formatTimeDay(nowtime);
    let endtime = new Date(nowtime.getTime() + 1000 * 60 * 60 * 24 * 30);//add 30 day
    let endday = util.formatTimeDay(endtime);
    let apiuser = util.getAPIUserData(null);
    let cinemacode = app.globalData.cinemacode
    wx.request({
      url: app.globalData.url + '/Api/Session/QueryFilmSessionPrice' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + cinemacode + '/' + this.data.checkfilmcode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log(res)
        var comparePrices = res.data.data.sessionDate[0].session
        var nowTime = parseInt(new Date().getTime());// 获取当前时间戳
        for (let i = comparePrices.length - 1; i >= 0; i --) { // 循环排期时间  倒序进行判断
          let sessionTime = new Date(comparePrices[i].sessionTime.replace(/-/g, '/')).getTime();// 获取排期时间戳
          if (sessionTime < nowTime) { // 比较两个时间戳大小 判断排期时间是否已过期
            // 如果当前时间比排期时间大  那么排期已过期  把过期的排期删除
            comparePrices.splice(i, 1);
          }
        }
        // console.log(comparePrices)
        that.setData({
          moviesListDate: res.data.data,
          comparePrices: comparePrices,
        })
        // console.log(that.data.moviesListDate)
      }
    })
    that.setData({
      isLoading:true
    })
  },
  buy: function(e) {
    // console.log(e)
    var that = this;
    app.globalData.filmName = that.data.moviesListDate.filmName
    var i = that.data.select;
    var index = e.currentTarget.dataset.index
    var sessionDate = that.data.moviesListDate.sessionDate[i].sessionDate
    var screenCode = e.currentTarget.dataset.screencode;
    var time = that.data.moviesListDate.sessionDate[i].session[index].beginTime;
    var endtime = that.data.moviesListDate.sessionDate[i].session[index].endTime;
    var screenName = that.data.moviesListDate.sessionDate[i].session[index].screenName;
    var sessionCode = that.data.moviesListDate.sessionDate[i].session[index].sessionCode;
    var filmType = that.data.moviesListDate.filmType;
    var salePrice = that.data.moviesListDate.sessionDate[i].session[index].salePrice;
    app.globalData.moviesListDate = that.data.moviesListDate.sessionDate[i].session[index];
    // console.log(that.data.moviesListDate.sessionDate[i])
    wx.navigateTo({
      url: '../chooseSeats/chooseSeats?screenCode=' + screenCode + '&&sessionDate=' + sessionDate + '&&time=' + time + '&&screenName=' + screenName + '&&sessionCode=' + sessionCode + '&&filmType=' + filmType + '&&salePrice=' + salePrice + '&&endtime=' + endtime,
    })
  },
  hideTip:function(){
    this.setData({
      buyNum: 4
    })
  },
  toOrder:function(){//待支付订单
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('minpayOrderAgain', nowtime);
    if (code == 0) {//会员购票
      wx.request({
        url: app.globalData.url + '/api/shOrder/minpayOrderAgain',//查询订单
        data: {
          appUserId: app.globalData.userInfo.id,
          timeStamp: nowtime,
          mac: sign
        },
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          // console.log(res)
          

        }
      })
    } 
  },
  checkSession:function(e){//选择比价
    // console.log(e.currentTarget.dataset.index)
    var that = this;
    // console.log(that.data.comparePrices)
    that.setData({
      // isShow:true,
      selectedIndex: e.currentTarget.dataset.index
    })
  },
  cancel:function(){
    var that = this;
    var nowtime = new Date().getTime();
    that.setData({
      showTask: false
    })
    wx.request({
      url: app.globalData.url + '/api/order/cancelorder',
      data: {
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.orderNum,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if(res.data.status == 1){
          wx.showToast({
            title: '取消成功',
            icon: 'loading',
            image: '',
            duration: 2000,
            mask: true,
          })
          
        }else{
          wx.showToast({
            title: '取消失败',
            icon: 'loading',
            image: '',
            duration: 2000,
            mask: true,
          })
        }
      }
    })
  },
  sure:function(){
    var that = this;
    that.setData({
      showTask:false
    })
    wx.navigateTo({
      url: '../waitPay/waitPay?orderNum='+that.data.orderNum,
    })
  },
  toDetail:function(e){
    var that = this
    var nowtime = new Date();
    let nowday = util.formatTimeDay(nowtime);
    let endtime = new Date(nowtime.getTime() + 1000 * 60 * 60 * 24 * 30);//add 30 day
    let endday = util.formatTimeDay(endtime);
    let apiuser = util.getAPIUserData(null);
    let cinemacode = app.globalData.cinemacode
    if (this.data.swiperIndex == e.currentTarget.dataset.index){
      app.globalData.movieIndex = this.data.swiperIndex;

      wx.navigateTo({
        url: '../movieDetail/movieDetail',
      })
    }else{
      this.setData({
        swiperIndex: e.currentTarget.dataset.index
      })


      wx.request({
        url: app.globalData.url + '/Api/Session/QueryFilmSessionPrice' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + cinemacode + '/' + e.currentTarget.dataset.moviecode ,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          that.setData({
            moviesListDate: res.data.data
          })
          console.log(that.data.moviesListDate)
        }
      })

      // moviesListDate
      // console.log(this.data.swiperIndex)
    }
  }
})