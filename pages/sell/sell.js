// pages/sell/sell.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo_test: {
      Username: 'MiniProgram',
      Password: '6BF477EBCC446F54E6512AFC0E976C41',
    },
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
    // 读取缓存  设置影院信息
    util.getcinemaList(function(res){
      debugger;
      let movilisttemp = res.sort(util.sortDistance("distance"));
      var recent = movilisttemp[0].cinemaName;
      that.setData({
        location: recent
      });
    });
   
    // wx.getStorage({
    //   key: 'cinemaList',
    //   success: function(res) {
    //     var movieList =  that.data.movieList
    //     var movieList = res.data
    //     console.log(movieList)
    //     that.setData({
    //       movieList: movieList 
    //     })
    //     let movilisttemp = movieList.sort(util.sortDistance("distance"));
    //     app.globalData.cinemaList = movilisttemp;
    //     app.globalData.cinemaNo = 0;

    //     var recent = movilisttemp[0].cinemaName;
    //     that.setData({
    //       location: recent
    //     })
    //   },
    // })
    
    this.setData({
      userInfo: app.globalData.userInfo ? app.globalData.userInfo:{},
    })
    // console.log(app.globalData)
    // wx.hideTabBar({

    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  // onShow: function() {
  //   this.setData({
  //     userInfo: app.globalData.userInfo,
  //     location: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName,
  //     movieList: app.globalData.movieList
  //   })
  // },

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
    console.log(setType)
    if (app.globalData.userInfo&&(app.globalData.userInfo.mobile == null || app.globalData.userInfo.mobile == "")) {
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
    that.setData({
      sendtype: setType
    })
    // if (setType == 2) {
    //   wx.hideTabBar()
    //   that.setData({
    //     startChoose: true
    //   })
    // } 
    wx.showTabBar()
  },
  close:function(){
    var that = this;
    if (that.data.movieList){
      for (var i = 0; i < that.data.movieList.length; i++) {
        that.data.movieList[i].foodcheck = false;
      }
    }
   
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
    var sign = app.createMD5('screening', nowtime);
    var index = e.currentTarget.dataset.index;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/api/shMovie/screening',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        movieId: movieid,
        buyGoods:1,
        appUserId:app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)

        that.manage(res.data.data.screenPlanList);
        for(var i = 0;i < that.data.movieList.length;i++){
          that.data.movieList[i].foodcheck = false;
        }
        that.data.movieList[index].foodcheck = true;
        that.setData({
          step:2,
          detailStr: moviename+",",
          movieList: that.data.movieList
        })
        
        // console.log(that.data.movieList)
        // console.log(app.globalData)
        wx.hideLoading()
      }
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
    // console.log(timearr)
    that.setData({
      timeList: timearr
    })
  },
  setTime:function(e){//设置场次，获取影厅
    var that = this;
    var time = e.currentTarget.dataset.time;
    var index = e.currentTarget.dataset.index;
    var timeList = that.data.timeList;
    var hallList = [];
    var screenPlanList = that.data.screenPlanList;
    for (var i = 0; i < screenPlanList.length; i++) {
      if (screenPlanList[i].date.indexOf("今天") > 0) {
        for (var j = 0; j < screenPlanList[i].list.length; j++) {
          if (screenPlanList[i].list[j].startTime2 == time){
            var row = {};
            row.name = screenPlanList[i].list[j].hallName;
            row.featureAppNo = screenPlanList[i].list[j].featureAppNo;
            hallList.push(row)
          }
        }
      }
    }
    
    for(var i = 0;i < timeList.length;i++){
      timeList[i].foodcheck = false;
    }
    timeList[index].foodcheck = true;
    that.setData({
      hallList: hallList,
      step:3,
      detailStr:that.data.detailStr+time+",",
      timeList:timeList
    })
    // console.log(hallList)
    // console.log(timeList)
  },
  setHall:function(e){//选择影厅
    var that = this;
    var hall = e.currentTarget.dataset.hall;
    var index = e.currentTarget.dataset.index;
    var hallList = that.data.hallList;
    var detailStr = that.data.detailStr.split(",");
    detailStr = detailStr[0] + "," + detailStr[1]+",";
    for (var i = 0; i < hallList.length; i++) {
      hallList[i].foodcheck = false;
    }
    hallList[index].foodcheck = true;
    that.setData({
      detailStr:detailStr+hall,
      isOk:true,
      hallList:hallList,
      sellfeatureAppNo: hallList[index].featureAppNo
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
          //debugger;
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



        // wx.request({
        //   url: app.globalData.url + '/api/cinema/cinemas',
        //   data: {
        //     latitude: la,
        //     longitude: lg,
        //     // city: city,
        //     timeStamp: nowtime,
        //     mac: sign
        //   },
        //   method: "POST",
        //   header: { "Content-Type": "application/x-www-form-urlencoded" },
        //   success: function (data) {
        //     if(data.data.code=='401')//请先登录
        //     {
        //       that.getMovies();
        //       return;
        //     } 
        //     // console.log(data)
        //     if (data.data.status == 0) {//数据返回错误
        //       // console.log(data.data.message)
        //       wx.showToast({
        //         title: data.data.message,
        //         duration: 2000,
        //         icon: "loading"
        //       })
        //     } else {//返回影院列表
        //       if (data.data.data.length == 0) {//当前地区没有该影院
        //         wx.showToast({
        //           title: "当前地区没有该影院",
        //           duration: 2000,
        //           icon: "loading"
        //         })
        //       } else {
        //         var list = data.data.data;
        //         for (var i = 0; i < list.length; i++) {
        //           list[i].distance = (list[i].distance / 1000).toFixed(1) + "km";
        //         }
        //         that.setData({
        //           moviearea: list[0],
        //           location: list[0].cinemaName,
        //           cinemaList: list
        //         })
        //         // console.log(that.data.cinemaList)
        //         app.globalData.cinemaList = list;
        //         app.globalData.cinemaNo = 0;
        //         wx.setStorage({
        //           key: "location",
        //           data: list
        //         })
        //         //that.getMovies();
        //       }
        //     }

        //   },
        //    fail: function () {}
        // });
        // wx.request({
        //   url: 'https://api.map.baidu.com/geocoder/v2/?ak=eAptnIH53X9m1LhoQNnI625z&location=' + la + ',' + lg + '&output=json',
        //   header: {
        //     'Content-Type': 'application/json'
        //   },
        //   success: function (msg) {
        //     // console.log(msg);
        //     var city = msg.data.result.addressComponent.city;
        //     that.setData({ currentCity: city });
        //     var nowtime = new Date().getTime();
        //     var sign = app.createMD5('cinemas', nowtime);
        //     wx.request({
        //       url: app.globalData.url + '/api/cinema/cinemas',
        //       data: {
        //         latitude: la,
        //         longitude: lg,
        //         city: city,
        //         timeStamp: nowtime,
        //         mac: sign
        //       },
        //       method: "POST",
        //       header: { "Content-Type": "application/x-www-form-urlencoded" },
        //       success: function (data) {
        //         // console.log(data)
        //         if (data.data.status == 0) {//数据返回错误
        //           // console.log(data.data.message)
        //           wx.showToast({
        //             title: data.data.message,
        //             duration: 2000,
        //             icon: "loading"
        //           })
        //         } else {//返回影院列表
        //           if (data.data.data.length == 0) {//当前地区没有该影院
        //             wx.showToast({
        //               title: "当前地区没有该影院",
        //               duration: 2000,
        //               icon: "loading"
        //             })
        //           } else {
        //             var list = data.data.data;
        //             for (var i = 0; i < list.length; i++) {
        //               list[i].distance = (list[i].distance / 1000).toFixed(1) + "km";
        //             }
        //             that.setData({
        //               moviearea: list[0],
        //               location:list[0].cinemaName,
        //               cinemaList: list
        //             })
        //             // console.log(that.data.cinemaList)
        //             app.globalData.cinemaList = list;
        //             app.globalData.cinemaNo = 0;
        //             wx.setStorage({
        //               key: "location",
        //               data: list
        //             })
        //             that.getMovies();
        //           }
        //         }

        //       }
        //     })
        //   },
        //   fail: function () {
        //     that.setData({ currentCity: '获取定位失败' })
        //   }
        // })

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
    wx.request({
      url: app.globalData.url + '/api/Movie/hotMovie',
      data: {
        cinemaCode: that.data.moviearea.cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        // console.log(res)
        that.setData({
          movieList: res.data.data
        })
        that.format();
      },
      fail: function () {
        console.log('getMovies fail');
      }
    })
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
  }
})