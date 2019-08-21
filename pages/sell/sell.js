// pages/sell/sell.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieList: null,
    timeList: null,
    hallList: null,
    sendtype: "0", //类型
    setMessage: false,
    startChoose: false,
    detailStr: "",
    step: 1,
    screenPlanList: null,
    isOk: false,
    sellfeatureAppNo: ""
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    util.getcinemaList(function(res) {
      let movilisttemp = res.sort(util.sortDistance("distance"));
      var recent = movilisttemp[0].cinemaName;
      that.setData({
        location: recent
      });
      app.globalData.cinemaNo = 0;
    });

    // 调用全局函数设置余额以及积分
    if (app.globalData.userInfo && app.globalData.userInfo.openID) {
      util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function (res) {
        console.log(res)
        if (res.data.Status == "Failure") { // 读取失败
          that.setData({
            memberCardScore: '---',
            memberCardBalance: '---'
          })
        } else if (res.data.data.memberCard == null) { // 未绑定会员卡
          that.setData({
            memberCardScore: '---',
            memberCardBalance: '---'
          })
        } else { // 绑定了会员卡
          var memberCard = res.data.data.memberCard[0];
          if (app.globalData.cinemaList.cinemaType != '云智' && app.globalData.cinemaList.cinemaType != '粤科') {
            wx.request({
              url: app.globalData.url + '/Api/Member/QueryCard/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + memberCard.cardNo + '/' + memberCard.cardPassword,
              method: 'GET',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res)
                if (res.data.Status == 'Success') {
                  if (!res.data.card.score) {
                    that.setData({
                      memberCardBalance: res.data.card.balance,
                      memberCardScore: '---'
                    })
                  } else {
                    that.setData({
                      memberCardBalance: res.data.card.balance,
                      memberCardScore: res.data.card.score
                    })
                  }
                }
              }
            })
          }
        }
      })
    } else {
      that.setData({
        memberCardScore: '---',
        memberCardBalance: '---'
      })
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
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
    let that = this;
    if (app.globalData.lookcinemaname == undefined) {
      app.globalData.lookcinemaname = app.globalData.areaList[0].cinemaName
    }
    var lookcinemaname = app.globalData.lookcinemaname
    this.setData({
      lookcinemaname: lookcinemaname
    })
    // 调用全局函数设置余额以及积分
    if (app.globalData.userInfo && app.globalData.userInfo.openID) {
      util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function (res) {
        console.log(res)
        if (res.data.Status == "Failure") { // 读取失败
          that.setData({
            memberCardScore: '---',
            memberCardBalance: '---'
          })
        } else if (res.data.data.memberCard == null) { // 未绑定会员卡
          that.setData({
            memberCardScore: '---',
            memberCardBalance: '---'
          })
        } else { // 绑定了会员卡
          var memberCard = res.data.data.memberCard[0];
          if (app.globalData.cinemaList.cinemaType != '云智' && app.globalData.cinemaList.cinemaType != '粤科') {
            wx.request({
              url: app.globalData.url + '/Api/Member/QueryCard/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + memberCard.cardNo + '/' + memberCard.cardPassword,
              method: 'GET',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res)
                if (res.data.Status == 'Success') {
                  if (!res.data.card.score) {
                    that.setData({
                      memberCardBalance: res.data.card.balance,
                      memberCardScore: '---'
                    })
                  } else {
                    that.setData({
                      memberCardBalance: res.data.card.balance,
                      memberCardScore: res.data.card.score
                    })
                  }
                }
              }
            })
          }
        }
      })
    } else {
      that.setData({
        memberCardScore: '---',
        memberCardBalance: '---'
      })
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
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
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  // 点击头像注册
  login: function () {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  toCard: function() {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.mobilePhone && res.data.isRegister == '1') {
          wx.navigateTo({
            url: '../mycard/mycard',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
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
  close: function() {
    var that = this;
    if (that.data.movieList) {
      for (var i = 0; i < that.data.movieList.length; i++) {
        that.data.movieList[i].foodcheck = false;
      }
    }
    app.globalData.sendtype = 0;
    that.setData({
      startChoose: false,
      sendtype: 0,
      step: 1,
      detailStr: "",
      movieList: that.data.movieList,
      isOk: false
    })
    wx.showTabBar()
  },
  ask: function(e) { //查询场次
    var that = this;
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var index = e.currentTarget.dataset.index;
    for (var i = 0; i < that.data.typeMovie.length; i++) {
      that.data.typeMovie[i].foodcheck = false;
    }
    that.data.typeMovie[index].foodcheck = true;
    app.globalData.sellhallname = name
    that.setData({
      typeMovie: that.data.typeMovie,
      isOk: true,
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
    var temporary = []; //一个临时数组
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
  // 获取用户位置，请求影院列表
  getPlace: function() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        // console.log(res)
        var la = res.latitude;
        var lg = res.longitude;
        var nowtime = new Date().getTime();
        if (that.data.movieList == 0) { //当前地区没有该影院
          wx.showToast({
            title: "当前地区没有该影院",
            duration: 2000,
            icon: "loading"
          })
        } else {
          var list = that.data.movieList;

          list = list.sort(util.sortDistance("distance")); //重新排序

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
  getMovies: function() {
    var that = this;
    if (!that.data.moviearea) {
      console.log('moviearea is null');
      return;
    }
    var nowtime = new Date().getTime();
    var sign = app.createMD5('hotMovie', nowtime);
  },
  format: function() {
    var json = this.data.movieList;
    for (var i = 0; i < json.length; i++) {
      json[i].movieDimensional = json[i].movieDimensional.split(",");
    }
    this.setData({
      movieList: json
    })
    app.globalData.movieList = this.data.movieList;
  },
  start: function() {
    var that = this;
    wx.request({
      url: app.globalData.url + '/Api/Goods/IsGoodsOrderFood' + '/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/' + app.globalData.cinemacode,
      method: 'GET',
      success: function(res) {
        // console.log(res)
        if (res.data.isOrderFood == '1') {
          that.setData({
            movieList: app.globalData.movieList
          })
          var type = that.data.sendtype;
          var isOk = that.data.isOk;
          app.globalData.type2address = that.data.detailStr;
          app.globalData.sellfeatureAppNo = that.data.sellfeatureAppNo;
          if (type == 1) {
            wx.getStorage({
              key: 'loginInfo',
              success: function(res) {
                if (res.data.mobilePhone && res.data.isRegister == '1') {
                  wx.navigateTo({
                    url: '../sellDetail/sellDetail?type=' + type,
                  })
                } else {
                  wx.navigateTo({
                    url: '../login/login'
                  })
                }
              },
              fail: function() {
                wx.navigateTo({
                  url: '../login/login',
                })
              }
            })
          } else if (type == 2 && app.globalData.isSnackDistribution == '是') {
            if (isOk) {
              wx.getStorage({
                key: 'loginInfo',
                success: function(res) {
                  if (res.data.mobilePhone && res.data.isRegister == '1') {
                    wx.navigateTo({
                      url: '../sellDetail/sellDetail?type=' + type,
                    })
                  } else {
                    wx.navigateTo({
                      url: '../login/login'
                    })
                  }
                },
                fail: function() {
                  wx.navigateTo({
                    url: '../login/login',
                  })
                }
              })
            } else {
              wx.request({
                url: app.globalData.url + '/Api/Screen/QueryScreens' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode,
                method: 'GET',
                success: function(res) {
                  console.log(res.data.data.screen)
                  that.setData({
                    typeMovie: res.data.data.screen
                  })
                }
              })
              that.setData({
                startChoose: true
              })
              wx.hideTabBar()
            }
          } else if (type == 2 && app.globalData.isSnackDistribution == '否') {
            wx.showModal({
              title: '暂不支持送餐服务',
            })
          }

        } else if (res.data.isOrderFood == '0') {
          wx.showModal({
            title: '该时间段不支持点餐',
            content: res.data.goodsStartTime + '-' + res.data.goodsEndTime,
          })
        }
      }
    })

  },
})