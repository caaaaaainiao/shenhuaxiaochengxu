// pages/sell/sell.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
 
    //userInfo: null,
    movieList: null,
    timeList:null,
    hallList:null,
    sendtype: "0",//类型
    setMessage: false,
    startChoose: false,
    detailStr: "",
    step:1,
    screenPlanList:null,
    isOk:false,
    sellfeatureAppNo:""
  },
   
   
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    app.globalData.phonenum = app.globalData.userInfo.mobilePhone
     // 读取缓存  设置影院信息
    that.countMovie()
  //   var movieList = app.globalData.sellMovielist
  //  that.setData({
  //    movieList:movieList
  //  })
  //  console.log(that.data.movieList)
    wx.getStorage({
      key: 'accredit',
      success: function (res) {
        // console.log(res)
        that.setData({
          userInfom: res.data.userInfo
        })
        // console.log(that.data.userInfo)
      },
    })
    util.getcinemaList(function(res){
  

      let movilisttemp = res.sort(util.sortDistance("distance"));
      var recent = movilisttemp[0].cinemaName;
      that.setData({
        location: recent
      });
      app.globalData.cinemaNo = 0;
    });
    
    this.setData({
      userInfo: app.globalData.userInfo ? app.globalData.userInfo:{},
    })
    // console.log(app.globalData)
    // wx.hideTabBar({

    // })
    // 调用全局函数设置余额以及积分
    util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.openID, app.globalData.cinemacode, function (res) {
      var memberCard = [];
      var status = [];
      if (res.data.Status == "Failure") {
        that.setData({
          memberCardScore: '---',
          memberCardBalance: '---'
        })
      } else if (res.data.data.memberCard == null) {
        that.setData({
          memberCardScore: '---',
          memberCardBalance: '---'
        })
      } else {
        var memberCard = res.data.data.memberCard;
        for (var i = 0; i < memberCard.length; i++) {
          if (memberCard[i].status == 1) {
            status.push(memberCard[i]);
          }
        }
        // 计算余额最多的会员卡
        var first = memberCard.sort(function (a, b) { return a.balance < b.balance })[0];
        if (first.score == null) {
          first.score = 0
        }
        that.setData({
          memberCardBalance: first.balance,
          memberCardScore: first.score
        })
      }
    });
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
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
    // console.log(app.globalData.areaList)
    // console.log(app.globalData.lookcinemaname)
    if (app.globalData.lookcinemaname == undefined){
      app.globalData.lookcinemaname = app.globalData.areaList[0].cinemaName
    }
    var lookcinemaname = app.globalData.lookcinemaname
    this.setData({
      lookcinemaname: lookcinemaname
    })
    var that = this;
    // 调用全局函数设置余额以及积分
    util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.openID, app.globalData.cinemacode, function (res) {
      var memberCard = [];
      var status = [];
      if (res.data.Status == "Failure") {
        that.setData({
          memberCardScore: '---',
          memberCardBalance: '---'
        })
      } else if (res.data.data.memberCard == null) {
        that.setData({
          memberCardScore: '---',
          memberCardBalance: '---'
        })
      } else {
        var memberCard = res.data.data.memberCard;
        for (var i = 0; i < memberCard.length; i++) {
          if (memberCard[i].status == 1) {
            status.push(memberCard[i]);
          }
        }
        // 计算余额最多的会员卡
        var first = memberCard.sort(function (a, b) { return a.balance < b.balance })[0];
        if (first.score == null) {
          first.score = 0
        }
        that.setData({
          memberCardBalance: first.balance,
          memberCardScore: first.score
        })
      }
    });
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
  // onShareAppMessage: function () {
  //   return {
  //     title: '神画电影',
  //     path: '/pages/index/index'
  //   }
  // },
  chooseType: function(e) {
    var setType = e.currentTarget.dataset.type;
    var that = this;
    app.globalData.sendtype = setType;
    that.setData({
      sendtype: setType
    })
    wx.showTabBar()
        // console.log(res)
  },
  close:function(){
    var that = this;
    if (that.data.movieList){
      for (var i = 0; i < that.data.movieList.length; i++) {
        that.data.movieList[i].foodcheck = false;
      }
    }
    app.globalData.sendtype = 0;
    that.setData({
      startChoose:false,
      sendtype:0,
      step:1,
      detailStr:"",
      movieList: that.data.movieList,
      isOk: false
    })
    wx.showTabBar()
  },
  ask: function (e) { //查询场次
    var that = this;
    var movieid = e.currentTarget.dataset.id;
    var moviename = e.currentTarget.dataset.name;
    var nowtime = new Date().getTime();
    var index = e.currentTarget.dataset.index;
    app.globalData.orderaddname = moviename
    var beginmovieList = that.data.movieList[index].session
    for (var i = 0; i < that.data.movieList.length; i++) {
      that.data.movieList[i].foodcheck = false;
    }
    that.data.movieList[index].foodcheck = true;
    that.setData({
      step: 2,
      beginmovieList:beginmovieList,
      detailStr: moviename + ",",
      moviename:moviename,
       movieList: that.data.movieList
    })
  },
  manage: function (data) { //影片排片数据处理
    var that = this;
    var screenPlanList = data;
    var json;
    for (var i = 0; i < screenPlanList.length; i++) {
      var month = parseInt(screenPlanList[i].date.substring(5, 7));
      var day = parseInt(screenPlanList[i].date.substring(8, 11));
      var date = new Date();
      var nowMonth = date.getMonth() + 1;
      var nowDay = date.getDate();
      if (month == nowMonth) {
        if (day == nowDay) { //当天
          if (month < 10) {
            month = "0" + month;
          }
          if (day < 10) {
            day = "0" + day;
          }
          screenPlanList[i].date = month + "-" + day + " " + "今天";
        } else if (day == nowDay + 1) {
          if (month < 10) {
            month = "0" + month;
          }
          if (day < 10) {
            day = "0" + day;
          }
          screenPlanList[i].date = month + "-" + day + " " + "明天";
        } else if (day == nowDay + 2) {
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
       
      }
      var oneDay = screenPlanList[i];
      for (var j = 0; j < oneDay.list.length; j++) {
        // console.log(oneDay.list[j].endTime)
        oneDay.list[j].endTime2 = oneDay.list[j].endTime.substring(11, 16);
        oneDay.list[j].startTime2 = oneDay.list[j].startTime.substring(11, 16);
      }
      
    }
    app.globalData.screenPlanList = screenPlanList;
    that.setData({
      screenPlanList: screenPlanList
    })
    // 设置场次
    var temporary = [];//一个临时数组
    for (var i = 0; i < screenPlanList.length; i++) {
      if (screenPlanList[i].date.indexOf("今天") > 0) {
        for (var j = 0; j < screenPlanList[i].list.length; j++) {
          temporary.push(screenPlanList[i].list[j].startTime2)
        }
      }
    }
    var timearr = [];
    for (var i = 0; i < temporary.length; i++) {
      if (timearr.indexOf(temporary[i]) == -1) {
        var row = {};
        row.time = temporary[i];
        timearr.push(row);
      }
    }
    that.setData({
      timeList: timearr
    })
  },
  setTime:function(e){//设置场次，获取影厅
    var that = this;
    var time = e.currentTarget.dataset.time;
    var index = e.currentTarget.dataset.index;
    var hallList = [];
    var screenname = that.data.beginmovieList[index].screenName
    app.globalData.selltimename = time
    that.setData({
      screenname:screenname
    })
    var beginmovieList = that.data.beginmovieList
    for (var i = 0; i < beginmovieList.length;i++){
      beginmovieList[i].foodcheck = false;
    }
    beginmovieList[index].foodcheck = true;
    that.setData({
      step:3,
      detailStr: that.data.detailStr + time + ",",
      beginmovieList: beginmovieList
    })
  },
  setHall:function(e){//选择影厅
    var that = this;
    var hall = e.currentTarget.dataset.hall;
    var index = e.currentTarget.dataset.index;
    app.globalData.sellhallname = hall
    console.log(that.data.screenname)
    that.setData({
      isOk:true,
      detailStr: that.data.detailStr +hall,
    })
  },
  back:function(){
    var that = this;
    var step = that.data.step;
    if(step == 2){
      that.setData({
        step:1,
        detailStr:"",
        isOk:false
      })
    }else if(step == 3){
      var detailArr = that.data.detailStr.split(",");

      that.setData({
        step: 2,
        detailStr: detailArr[0] + ",",
        isOk: false
      })
    }
  },
  // 获取用户位置，请求影院列表
  getPlace: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        // console.log(res)
        var la = res.latitude;
        var lg = res.longitude;
        var nowtime = new Date().getTime();
        var sign = app.createMD5('cinemas', nowtime);
        if (that.data.movieList == 0) {//当前地区没有该影院
          wx.showToast({
            title: "当前地区没有该影院",
            duration: 2000,
            icon: "loading"
          })
        } else {
          var list = that.data.movieList;

          list = list.sort(util.sortDistance("distance"));//重新排序
     
          that.setData({
            moviearea: list[0],
            location: list[0].cinemaName,
            cinemaList: list
          })
          // console.log(that.data.cinemaList)
          app.globalData.cinemaList = list;
          app.globalData.cinemaNo = 0;
          wx.setStorage({
            key: "location",
            data: list
          })
          //that.getMovies();
        }
      },
    })
  },
  getMovies: function () {
    var that = this;
    if (!that.data.moviearea)
    {
      console.log('moviearea is null');
      return;
    }
    var nowtime = new Date().getTime();
    var sign = app.createMD5('hotMovie', nowtime);
  },
  format: function () {
    var json = this.data.movieList;
    for (var i = 0; i < json.length; i++) {
      json[i].movieDimensional = json[i].movieDimensional.split(",");
    }
    this.setData({
      movieList: json
    })
    app.globalData.movieList = this.data.movieList;
    // console.log(this.data.movieList)
  },
  start:function(){
    var that = this;
    var type = that.data.sendtype;
    var isOk = that.data.isOk;
    app.globalData.type2address = that.data.detailStr;
    app.globalData.sellfeatureAppNo = that.data.sellfeatureAppNo;
    if(type == 1){
      wx.navigateTo({
        url: '../sellDetail/sellDetail?type=' + type,
      })
    } else if (type == 2){
        if(isOk){
          wx.navigateTo({
            url: '../sellDetail/sellDetail?type=' + type,
          })
        }else{
          that.setData({
            startChoose: true
          })
          wx.hideTabBar()
        }
    }
  },
  countMovie: function () {
    var movieList = app.globalData.sellMovielist;
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var that = this;
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    var today = year + "-" + month + "-" + day;
    for (var i = 0; i < movieList.length; i++) {
      for (var j = 0; j < movieList[i].session.length; j++) {
        if (movieList[i].session[j].startTime.substring(0, 10) != today) {
          movieList[i].session.splice(0, 1);
          j--;
        }
      }
    }
    for (var g = 0; g < movieList.length; g++) {
      if (movieList[g].session.length == 0) {
        movieList.splice(g, 1);
        g--;
      }
    }
    that.setData({
      movieList: movieList
    })
  }
})