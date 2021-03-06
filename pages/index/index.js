//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {
    FlimList: [],
    FilmCodes: [],
    list: null,
    moviearea: '', //当前影院信息
    movieList: null, //当前城市影院列表
    userInfo: null, //个人信息
    currentCity: '', //当前所在城市
    isFirst: false,
    cinemaList: null, //影院列表
    isChoose: false, //选择影院
    timestamp: new Date().getTime(),
    nowCity: [{
      name: "",
      show: ""
    }],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    text: "授权访问当前地址",
    zchb: "",
    onLoad: false,
    sza: [],
    all: true,
  },
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等
  //授权信息
  formSubmit: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data, //用户信息
        })
        app.globalData.userInfo = res.data;
        app.globalData.getUsename = that.data.userInfo.nickName;
        app.globalData.getAvatarUrl = that.data.userInfo.avatarUrl;
      }
    })
    wx.request({
      url: app.globalData.url + '/Api/Cinema/QueryCinemas/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.usermessage.AppId,
      method: 'GET',
      success: function(res) {
        // console.log(res)
        that.setData({
          logo: res.data.data.cinemas[0].businessPic,
          concinemaname: res.data.data.cinemas[0].businessName,
          concont: res.data.data.cinemas[0].businessDesc
        })
        // 设置全局影院图片
        app.globalData.businessPic = res.data.data.cinemas[0].businessPic;
      }
    })
    var timestamp = new Date().getTime()
    that.setData({
      timestamp: new Date().getTime()
    })
    wx.getSetting({ //获取用户当前设置
      success: function(res) {
        //authSetting 返回的授权结果
        if (res.authSetting["scope.userLocation"]) {
          that.setData({
            text: "影片加载中"
          })
        }

      },

    })

    //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等 监听页面加载
    util.getCity(function(res, userLat, userLng) {
      // console.log(res)
      var cinemas = res;
      var recent = []
      if (userLat && userLng) {
        for (let i = 0; i < cinemas.length; i++) {
          var lat = cinemas[i].latitude;
          var lng = cinemas[i].longitude;
          var distance = that.distance(userLat, userLng, lat, lng);
          cinemas[i].distance = distance
        }
        setTimeout(function() {
          that.setData({
            soncinemas: cinemas
          })
          app.globalData.isSnackDistribution = that.data.soncinemas[0].isSnackDistribution
          app.globalData.cinemacode = that.data.soncinemas[0].cinemaCode
          util.getQueryFilmSession(app.globalData.cinemacode, function(res) {
            var timestamp1 = new Date().getTime()
            for (var x in res) { // 影片的预售和购票排序
              res[x].jian = res[x].time - timestamp1
            }

            res.sort(that.compare("jian"));
            // console.log(res)
            app.globalData.movieList = res
            that.setData({
              movieList: res
            })
          })
          that.getMovie(app.globalData.cinemacode)
          if (app.globalData.userInfo && app.globalData.userInfo.openID) {
            util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function(res) {
              // console.log(res)
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
                if (app.globalData.cinemaList.cinemaType != '粤科' && app.globalData.cinemaList.cinemaType != '云智' && app.globalData.cinemaList.cinemaType != "火烈鸟") {
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
                } else {
                  if (!memberCard.score && memberCard.score != 0) {
                    that.setData({
                      memberCardBalance: memberCard.balance,
                      memberCardScore: '---'
                    })
                  } else {
                    that.setData({
                      memberCardBalance: memberCard.balance,
                      memberCardScore: memberCard.score
                    })
                  }
                }
              }
            })
          } else {
            that.setData({
              memberCardScore: '---',
              memberCardBalance: '---'
            })
          }
        }, 500)
      }
      // 声明一个新数组 将市区添加到新数组内
      var arr = [];
      for (let i = 0; i < cinemas.length; i++) {
        arr.push(cinemas[i].city);
      };
      // 去除重复省市显示返回新数组newArr
      var newArr = arr.filter(function(element, index, self) {
        return self.indexOf(element) === index;
      });
      // 将数据赋值到nowCity中显示
      for (var j = 0; j < newArr.length; j++) {
        var name = "nowCity[" + j + "].name";
        var show = "nowCity[" + j + "].show";
        that.setData({
          [name]: newArr[j],
          [show]: newArr[j]
        })
      };

      function sortDistance(property) {
        return function(a, b) {
          var value1 = a[property];
          var value2 = b[property];
          return value1 - value2;
        }
      }
      app.globalData.areaList = cinemas
      var recent = cinemas.sort(util.sortDistance("distance"))[0].cinemaName;
      var cinemaList = cinemas.sort(util.sortDistance("distance"))[0];
      that.setData({
        moviearea: recent
      })
      app.globalData.isCanRefund = cinemaList.isCanRefund;
      app.globalData.isOpenMember = cinemaList.isOpenMember;
      app.globalData.lookcinemaname = cinemaList.cinemaName;
      app.globalData.lookcinemaadd = cinemaList.address;
      app.globalData.moviearea = recent;
      app.globalData.cinemaList = cinemaList;
      if (cinemaList && cinemaList.beforeStartTime) {
        app.globalData.beforeStartTime = cinemaList.beforeStartTime
      } else {
        app.globalData.beforeStartTime = 0;
      }
      that.setData({
        offerDescription: cinemaList.offerDescription,
      })
      wx.setNavigationBarTitle({
        title: app.globalData.cinemaList.cinemaName
      });
      // 调用全局函数设置余额以及积分
    })
    if (that.data.memberCardBalance == "---") {
      app.globalData.cardList = 1;
    } else {
      app.globalData.cardList = 0;
    };
  },

  // 点击头像注册
  login: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  getMovie: function(cinemaNo) {
    if (cinemaNo) {
      var timestamp1 = new Date().getTime()
      var that = this;
      util.getQueryFilmSession(cinemaNo, function(res) {
        // console.log(res)
        wx.hideLoading()
        for (var x in res) { // 影片的预售和购票排序
          res[x].jian = res[x].time - timestamp1
        }

        res.sort(that.compare("jian"));
        // console.log(res)
        app.globalData.movieList = res
        that.setData({
          movieList: res
        })
        // console.log(that.data.movieList)
        app.globalData.sellMovielist = that.data.movieList
      });
    }
  },


  //json数组比较

  compare: function(property) {

    return function(a, b) {

      var value1 = a[property];

      var value2 = b[property];

      return value2 - value1;

    }

  },
  // 获取用户位置，请求影院列表
  getPlace: function() {
    var that = this;
    // console.log("place")
    wx.getStorage({
      key: 'location',
      success: function(res) {
        // console.log(res)
        wx.getStorage({
          key: 'areaNo',
          success: function(e) {
            // console.log(e)
            if (res.data.length > 0) { //有内容
              var list = res.data;
              that.setData({
                moviearea: list[e.data], //电影区域
                cinemaList: list //电影列表
              })
              // console.log(that.data.cinemaList)
              app.globalData.cinemaList = list; //设置全局电影列表
              return;
            }
          },
          fail: function(e) {
            if (res.data.length > 0) {
              var list = res.data;
              that.setData({
                moviearea: list[0],
                cinemaList: list
              })
              // console.log(that.data.cinemaList)
              app.globalData.cinemaList = list;
              wx.setStorage({
                key: "areaNo", //无区域
                data: '0'
              })
              return;
            }
          }
        })
      },
      fail: function(res) {
        wx.getLocation({
          type: 'wgs84', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
          success: function(res) {
            // console.log(res)
            var la = res.latitude; //纬度
            var lg = res.longitude; //经度
            var nowtime = new Date().getTime(); //时间
            var sign = app.createMD5('cinemas', nowtime);
            wx.request({ //获取影院的城市
              url: app.globalData.url + '/api/cinema/cinemas',
              data: {
                latitude: la, //经度
                longitude: lg, //纬度
                // city: city,
                // city:"衢州市",
                timeStamp: nowtime, //时间
                mac: sign //信息
              },
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              success: function(data) {
                console.log(data)
                if (data.data.status == 0) { //数据返回错误
                  // console.log(data.data.message)
                  wx.showToast({
                    title: data.data.message,
                    duration: 2000, //延迟两秒
                    icon: "loading"
                  })
                } else { //返回影院列表
                  if (data.data.data.length == 0) { //当前地区没有该影院
                    wx.showToast({
                      title: "当前地区无影院",
                      duration: 2000, //延迟两秒
                      icon: "loading"
                    })
                  } else { //当前有影院
                    var list = data.data.data;
                    for (var i = 0; i < list.length; i++) { //影院的距离
                      list[i].distance = (list[i].distance / 1000).toFixed(1);
                    }
                    that.setData({
                      moviearea: list[app.globalData.cinemaNo],
                      cinemaList: list
                    })
                    // console.log(that.data.cinemaList)
                    app.globalData.cinemaList = list;
                    wx.setStorage({
                      key: "location",
                      data: list
                    })
                    wx.setStorage({ //当数据存储在本地缓存的areaNo这个指定的key中
                      key: "areaNo",
                      data: '0'
                    })
                  }
                }

              }
            })
          },
        })
      }
    })

  },
  // 计算用户与影院距离
  distance: function(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
  },
  QueryFilm: function(filmCode, cinemacode) { //显示电影详情
    var that = this;
    let apiuser = util.getAPIUserData(null);

    wx.request({
      url: app.globalData.url + '/Api/Film/QueryFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + cinemacode + '/' + filmCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        // console.log(res)
        that.data.FlimList.push(res)
        that.setData({
          FlimList: that.data.FlimList
        })

        for (var i = 0; i < that.data.FlimList.length; i++) {
          // console.log(that.data.FlimList[that.data.FlimList.length - 1])
          that.data.sza.push(that.data.FlimList[that.data.FlimList.length - 1])
          break
        }
        if (that.data.sza.length == that.data.FilmCodes.length) {
          app.globalData.movieList = that.data.sza
        }
      }
    })
  },
  // 移除第一次进入引导
  removeBlack: function() {
    this.setData({
      isFirst: false
    })
    wx.showTabBar({})
    wx.setStorage({
      key: "firstUse",
      data: "点过了"
    })
  },
  // 影片详情
  toDetails: function(e) {
    // console.log("details")
    app.globalData.checkfilmcode = e.currentTarget.dataset.id
    // app.globalData.movieId = e.currentTarget.dataset.id
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    // console.log(e)
    // console.log(app)
    wx.setStorage({
      key: 'movieList',
      data: app.globalData.movieList,
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.mobilePhone && res.data.isRegister == '1') {
          wx.navigateTo({
            url: '../movieDetail/movieDetail', //跳转到影片列表
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
  // 比价购票
  buy: function(e) {
    app.globalData.checkfilmcode = e.currentTarget.dataset.id
    wx.setStorage({
      key: 'movieList',
      data: app.globalData.movieList,
    })
    // app.globalData.movieId = e.currentTarget.dataset.id;
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.mobilePhone && res.data.isRegister == '1') {
          wx.navigateTo({
            url: '../compare/compare', //跳转到影片列表
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
  getMovies: function() {
    var that = this;
    this.setData({
      isChoose: false
    })
  },
  chooseCity: function(e) {
    var that = this;
    var crCity = e.currentTarget.dataset.name;
    that.setData({
      currentCity: crCity
    });
    // 获取存入缓存的数据开始渲染
    var show = [];
    for (let i = 0; i < app.globalData.areaList.length; i++) {
      if (crCity === app.globalData.areaList[i].city) {
        show.push(app.globalData.areaList[i]);
      }
    }
    // 清空列表
    that.setData({
      cinemaList: []
    })
    for (let j = 0; j < show.length; j++) {
      let name = "cinemaList[" + j + "].cinemaName";
      let address = "cinemaList[" + j + "].address";
      let distance = "cinemaList[" + j + "].distance";
      let cinemaCode = "cinemaList[" + j + "].cinemaCode";
      let isSnackDistribution = "cinemaList[" + j + "].isSnackDistribution";
      that.setData({
        [name]: show[j].cinemaName,
        [address]: show[j].address,
        [distance]: show[j].distance,
        [cinemaCode]: show[j].cinemaCode,
        [isSnackDistribution]: show[j].isSnackDistribution,
      })
    };
  },
  showCity: function() { //展示城市
    let that = this;
    // 由距离远近进行排序 增加一个开关选择是否显示所有影院
    let cinemaList = app.globalData.areaList.sort(util.sortDistance("distance"));
    if (that.data.all == true) {
      that.setData({
        cinemaList: cinemaList,
        all: !that.data.all,
      })
    }
  },
  chooseCinema: function(e) { //选择影院
    var that = this
    wx.showTabBar({});
    console.log(e)
    app.globalData.isSnackDistribution = e.currentTarget.dataset.issnack;
    app.globalData.lookcinemaadd = e.currentTarget.dataset.address;
    app.globalData.isCanRefund = e.currentTarget.dataset.iscanrefound;
    app.globalData.isOpenMember = e.currentTarget.dataset.isopenmember;
    var cinemacode = e.currentTarget.dataset.cinemacode;
    app.globalData.lookcinemaname = e.currentTarget.dataset.cinemaname
    for (var i = 0; i < app.globalData.areaList.length; i++) {
      if (app.globalData.areaList[i].cinemaCode == cinemacode) {
        app.globalData.cinemaList = app.globalData.areaList[i]
      }
    }
    app.globalData.cinemaNo = e.currentTarget.dataset.index;
    app.globalData.cinemacode = e.currentTarget.dataset.cinemacode;
    // console.log(app.globalData.cinemacode)
    app.globalData.moviearea = e.currentTarget.dataset.cinemaname;
    that.setData({
      moviearea: app.globalData.moviearea,
      offerDescription: app.globalData.cinemaList.offerDescription,
    })
    that.setData({
      isChoose: false
    })
    util.getQueryFilmSession(app.globalData.cinemacode, function(res) {
      var timestamp1 = new Date().getTime()

      for (var x in res) { // 影片的预售和购票排序
        res[x].jian = res[x].time - timestamp1
      }

      res.sort(that.compare("jian"));

      app.globalData.movieList = res
      that.setData({
        movieList: res
      })
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
          if (app.globalData.cinemaList.cinemaType != '云智' && app.globalData.cinemaList.cinemaType != '粤科' && app.globalData.cinemaList.cinemaType != "火烈鸟") {
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
          } else {
            if (!memberCard.score && memberCard.score != 0) {
              that.setData({
                memberCardBalance: memberCard.balance,
                memberCardScore: '---'
              })
            } else {
              that.setData({
                memberCardBalance: memberCard.balance,
                memberCardScore: memberCard.score
              })
            }
          }
        }
      })
    } else {
      that.setData({
        memberCardScore: '---',
        memberCardBalance: '---'
      })
    }
    setTimeout(function() {
      wx.setNavigationBarTitle({
        title: app.globalData.cinemaList.cinemaName
      });
    }, 100);
  },
  startChoose: function() {
    wx.hideTabBar();
    this.setData({
      isChoose: true
    })
    this.showCity();
  },

  getLocation: function() {
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        if (res.authSetting["scope.userInfo"] && res.authSetting["scope.userLocation"]) {
          //reLaunch
          wx.reLaunch({ // 标实已经授权   关闭所有页面 并跳转到index页面
            url: '/pages/index/index'
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    wx.showTabBar()
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data, //用户信息
        })
        app.globalData.getUsename = that.data.userInfo.nickName
        app.globalData.getAvatarUrl = that.data.userInfo.avatarUrl
      }
    })
    that.getMovie(app.globalData.cinemacode);
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
          if (app.globalData.cinemaList.cinemaType != '云智' && app.globalData.cinemaList.cinemaType != '粤科' && app.globalData.cinemaList.cinemaType != "火烈鸟") {
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
          } else {
            if (!memberCard.score && memberCard.score != 0) {
              that.setData({
                memberCardBalance: memberCard.balance,
                memberCardScore: '---'
              })
            } else {
              that.setData({
                memberCardBalance: memberCard.balance,
                memberCardScore: memberCard.score
              })
            }
          }
        }
      })
    } else {
      that.setData({
        memberCardScore: '---',
        memberCardBalance: '---'
      })
    }
    that.setData({
      userInfo: app.globalData.userInfo,
      movieList: app.globalData.movieList,
    })
    if (that.data.memberCardBalance == "---") {
      app.globalData.cardList = 1;
    } else {
      app.globalData.cardList = 0;
    };
  },
  onShareAppMessage: function() {
    return {
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },

  toCard: function() {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.mobilePhone && res.data.isRegister == '1') {
          if (app.globalData.isOpenMember == 1) {
            wx.navigateTo({
              url: '../mycard/mycard',
            })
          }
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
  hidehb: function() {
    this.setData({
      zchb: ''
    })
    wx.setStorage({
      key: 'zchb',
      data: '',
    })
    wx.showTabBar()
  },
  getAccesstoken: function() {
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token' + '?' + 'grant_type' + '=' + 'client_credential' + '&' + 'appid' + '=' + app.usermessage.AppId + '&' + 'secret' + '=' + app.usermessage.secret,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data.access_token)
        app.usermessage.access_token = res.data.access_token
      },
      fail: function(res) {
        console.log(res)
      }
    })
  }
})