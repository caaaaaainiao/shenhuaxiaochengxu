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
    userInfo: null,
    shouquan: false,
    wxInfo: null,
    text: "授权访问当前地址",
    zchb: "",
    onLoad: false,
    sza: [],
    all: true,
  },
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等
  //授权信息
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  onLoad: function (options) {
    var that = this;
    that.getAccesstoken();
    wx.getStorage({
      key: 'accredit',
      success: function(res) { //key所对应的内容
        // console.log(res)
        that.setData({
          wxInfo: res.data.userInfo, //用户信息
          userInfoDetail: res.data.userInfoDetail
        })
        app.globalData.getUsename = that.data.wxInfo.nickName
        app.globalData.getAvatarUrl = that.data.wxInfo.avatarUrl
      },
      fail: function(res) {
        that.setData({
          shouquan: true
        })
        wx.hideTabBar() //隐藏栏
      },
      complete:function(res){
        console.log(res)
      }
    })
    // wx.showLoading({
    //   title: '加载中',
    // })
    var that = this;
    wx.request({
      url:app.globalData.url+'/Api/Cinema/QueryCinemas/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.usermessage.AppId,
      method: 'GET',
      success: function (res) {
        that.setData({
          logo: res.data.data.cinemas[0].businessPic,
          concinemaname: res.data.data.cinemas[0].businessName,
          concont: res.data.data.cinemas[0].businessDesc
        })
      }
    })
    var timestamp = new Date().getTime()
    that.setData({
      timestamp: new Date().getTime()
    })
    wx.getSetting({ //获取用户当前设置
      success: function (res) {
        //  console.log(res)
        //authSetting 返回的授权结果
        if (res.authSetting["scope.userLocation"]) {
          that.setData({
            text: "影片加载中"
          })
        }
      }
    })
    wx.getStorage({
      key: 'zchb',
      success: function (res) {
        console.log(res)
        that.setData({
          zchb: res.data //key所对应的内容
        })
        wx.hideTabBar() //隐藏栏
      },
    })
    //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等 监听页面加载
    util.getCity(function (res, userLat, userLng) {
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
        setTimeout(function () {
          that.setData({
            soncinemas: cinemas
          })
          app.globalData.cinemacode = that.data.soncinemas[0].cinemaCode
          util.getQueryFilmSession(app.globalData.cinemacode, function (res) {
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
          if (app.globalData.openId != null) {
            util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.openId, app.globalData.cinemacode, function (res) {
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
                var first = memberCard.sort(function (a, b) {
                  return a.balance < b.balance
                })[0];
                if (first.score == null) {
                  first.score = 0
                }
                that.setData({
                  memberCardBalance: first.balance,
                  memberCardScore: first.score
                })
              }
            })

            wx.getStorage({
              key: 'accredit',
              success: function (res) { //key所对应的内容
                // console.log(res)

                that.wxLogin(); //获取信息函数
              },
              fail: function (res) {
                that.setData({
                  shouquan: true
                })
                wx.hideTabBar() //隐藏栏
              }
            })
          }
        }, 1000)
      }
      // 声明一个新数组 将市区添加到新数组内
      var arr = [];
      for (let i = 0; i < cinemas.length; i++) {
        arr.push(cinemas[i].city);
      };
      // console.log(arr)
      // 去除重复省市显示返回新数组newArr
      var newArr = arr.filter(function (element, index, self) {
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
        return function (a, b) {
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
      // console.log(cinemaList)
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
  getMovie: function (cinemaNo) {
    if (cinemaNo) {
      var timestamp1 = new Date().getTime()
      var that = this;
      util.getQueryFilmSession(cinemaNo, function (res) {
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
        console.log(that.data.movieList)
        app.globalData.sellMovielist = that.data.movieList
      });
    }
  },


  //json数组比较

  compare: function (property) {

    return function (a, b) {

      var value1 = a[property];

      var value2 = b[property];

      return value2 - value1;

    }

  },
  // 获取用户位置，请求影院列表
  getPlace: function () {
    var that = this;
    // console.log("place")
    wx.getStorage({
      key: 'location',
      success: function (res) {
        // console.log(res)
        wx.getStorage({
          key: 'areaNo',
          success: function (e) {
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
          fail: function (e) {
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
      fail: function (res) {
        wx.getLocation({
          type: 'wgs84', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
          success: function (res) {
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
              success: function (data) {
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
  distance: function (la1, lo1, la2, lo2) {
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
  QueryFilm: function (filmCode, cinemacode) { //显示电影详情
    var that = this;
    let apiuser = util.getAPIUserData(null);

    wx.request({
      url: app.globalData.url + '/Api/Film/QueryFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + cinemacode + '/' + filmCode,

      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
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
  removeBlack: function () {
    this.setData({
      isFirst: false
    })
    wx.showTabBar({ })
    wx.setStorage({
      key: "firstUse",
      data: "点过了"
    })
  },
  // 影片详情
  toDetails: function (e) {
    // console.log("details")
    app.globalData.checkfilmcode = e.currentTarget.dataset.id
    // app.globalData.movieId = e.currentTarget.dataset.id
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    console.log(e)
    // console.log(app)
    wx.setStorage({
      key: 'movieList',
      data: app.globalData.movieList,
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.mobilePhone && res.data.isRegister == '1') {
          wx.navigateTo({
            url: '../movieDetail/movieDetail', //跳转到影片列表
          })
        } else {
          wx.navigateTo({
            url: '../login/login' //2
          })
        }
      },
      fail: function () {
        wx.reLaunch({
          url: '../login/login',
        })
      }
    })

  },
  // 比价购票
  buy: function (e) {
    console.log(e)
    app.globalData.checkfilmcode = e.currentTarget.dataset.id
    wx.setStorage({
      key: 'movieList',
      data: app.globalData.movieList,
    })
    // app.globalData.movieId = e.currentTarget.dataset.id;
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.mobilePhone && res.data.isRegister == '1') {
          wx.navigateTo({
            url: '../compare/compare', //跳转到影片列表
          })
        } else {
          wx.navigateTo({
            url: '../login/login' //1
          })
        }
      },
      fail: function () {
        wx.reLaunch({
          url: '../login/login',
        })
      }
    })
  },
  getMovies: function () {
    var that = this;
    this.setData({
      isChoose: false
    })
  },
  chooseCity: function (e) {
    var that = this;
    var crCity = e.currentTarget.dataset.name;
    // var show = [];
    that.setData({
      currentCity: crCity
    });
    // 获取存入缓存的数据开始渲染
    var show = [];
    // console.log(this.cinemaList)
    // console.log(app.globalData.areaList)
    that.data.cinemaList = []
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
      that.setData({
        [name]: show[j].cinemaName,
        [address]: show[j].address,
        [distance]: show[j].distance,
        [cinemaCode]: show[j].cinemaCode
      })
    };
  },
  showCity: function () { //展示城市
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
  chooseCinema: function (e) { //选择影院
    console.log(e)
    // console.log(app.globalData.cinemaList)
    app.globalData.lookcinemaadd = e.currentTarget.dataset.address;
    // app.globalData.lookcinemaadd = e._relatedInfo.anchorTargetText
    var cinemacode = e.currentTarget.dataset.cinemacode;
    app.globalData.lookcinemaname = e.currentTarget.dataset.cinemaname
    // console.log(app.globalData.lookcinemaname)
    for (var i = 0; i < app.globalData.areaList.length; i++) {
      if (app.globalData.areaList[i].cinemaCode == cinemacode) {
        app.globalData.cinemaList = app.globalData.areaList[i]
      }
    }
    var that = this
    app.globalData.cinemaNo = e.currentTarget.dataset.index;
    app.globalData.cinemacode = e.currentTarget.dataset.cinemacode;
    console.log(app.globalData.cinemacode)
    app.globalData.moviearea = e.currentTarget.dataset.cinemaname;
    that.setData({
      moviearea: app.globalData.moviearea,
      offerDescription: app.globalData.cinemaList.offerDescription,
    })
    that.setData({
      isChoose: false
    })
    util.getQueryFilmSession(app.globalData.cinemacode, function (res) {
      var timestamp1 = new Date().getTime()
      console.log(res)
      // that.setData({
      //   movieList: res
      // })
      // console.log(that.data.movieList)
      for (var x in res) { // 影片的预售和购票排序
        res[x].jian = res[x].time - timestamp1
      }

      res.sort(that.compare("jian"));
      // console.log(res)
      app.globalData.movieList = res
      that.setData({
        movieList: res
      })
    });
    // 调用全局函数设置余额以及积分
    util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.openId, app.globalData.cinemacode, function (res) {
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
        var first = memberCard.sort(function (a, b) {
          return a.balance < b.balance
        })[0];
        if (first.score == null) {
          first.score = 0
        }
        that.setData({
          memberCardBalance: first.balance,
          memberCardScore: first.score
        })
      }
    });
    setTimeout(function () {
      wx.setNavigationBarTitle({
        title: app.globalData.cinemaList.cinemaName
      });
    }, 100);
  },
  startChoose: function () {
    this.setData({
      isChoose: true
    })
    this.showCity();
  },
  getUserInfo: function (e) { //获取用户信息
    console.log(e)
    var that = this;
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '请先授权',
        icon: "loading",
        duration: 2000
      })
    } else if (e.detail.errMsg == "getUserInfo:ok") {
      wx.showTabBar();
      this.setData({
        // userInfo: e.detail.userInfo,
        userInfoDetail: e.detail
      })
      app.globalData.userInfo = e.detail.userInfo;
      wx.setStorage({
        key: 'accredit',
        data: {
          "userInfo": e.detail.userInfo,
          "userInfoDetail": e.detail
        },
        success: function (res) {
          // console.log(res)
          that.setData({
            shouquan: false,
            wxInfo: e.detail.userInfo
          })
          that.wxLogin();
        }
      })
    }


  },
  wxLogin: function () { //用户信息
    var that = this;
    let loginInfo = wx.getStorageSync('loginInfo');
    if (loginInfo) {
      app.globalData.userInfo = loginInfo;
      that.setData({
        userInfo: loginInfo
      });
      util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function (res) {
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
          var first = memberCard.sort(function (a, b) {
            return a.balance < b.balance
          })[0];
          if (first.score == null) {
            first.score = 0
          }
          that.setData({
            memberCardBalance: first.balance,
            memberCardScore: first.score
          })
        }
      })
      return;
    }

    wx.login({
      success: function (msg) {
        var wxCode = msg.code; // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let encryptedData = that.data.userInfoDetail.encryptedData;
        let iv = that.data.userInfoDetail.iv;
        let url = app.globalData.url + '/Api/User/UserLogin';
        let apiuser = util.getAPIUserData(null);
        wx.request({
          url: app.globalData.url + '/Api/User/UserLogin',
          data: {
            code: wxCode,
            userName: apiuser.UserName,
            password: apiuser.Password,
            encryptedData: encryptedData,
            iv: iv,
            cinemaCode: app.globalData.cinemacode
          },
          method: "POST",
          header: {
            "Content-Type": "application/json"
          },
          success: function (e) {
            console.log(e)
            //个人信息
            if (e.data.Status == 'Success') {
              that.setData({
                onLoad: true
              })
              if (e.data.data) {
                wx.setStorage({
                  key: 'loginInfo',
                  data: e.data.data,
                  success: function () {
                    // console.log(e)
                    app.globalData.openId = e.data.data.openID;
                    app.globalData.userInfo = e.data.data;
                    that.setData({
                      userInfo: e.data.data
                    })
                    util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function (res) {
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
                        var first = memberCard.sort(function (a, b) {
                          return a.balance < b.balance
                        })[0];
                        if (first.score == null) {
                          first.score = 0
                        }
                        that.setData({
                          memberCardBalance: first.balance,
                          memberCardScore: first.score
                        })
                      }
                    })

                  }
                })
              }
              wx.request({
                url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + e.data.data.cinemaCode + '/' + e.data.data.openID,
                method: "GET",
                header: {
                  "Content-Type": "application/json"
                },
                success: function (res) {
                  if (res.data.data.mobilePhone == null || res.data.data.mobilePhone == '') {
                    wx.navigateTo({
                      url: '../index/index',
                    })
                  }
                }
              })
            } 
            else {
              wx.showToast({
                title: '授权失败',
                icon: 'none',
                duration: 2000,
                success () {
                    that.setData({
                      shouquan: true
                    })
                }
              })
            }
            //是否第一次进入 引导
            wx.getStorage({
              key: 'firstUse',
              success: function (res) {

              },
              fail: function () {
                that.setData({
                  isFirst: true
                })

              }
            })

          },
          fail: function (e) {
            console.log(e)
          }
        })
      }
    })
  },
  getLocation: function () {
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        if (res.authSetting["scope.userInfo"] && res.authSetting["scope.userLocation"]) {
          //reLaunch
          wx.reLaunch({ // 标实已经授权   关闭所有页面 并跳转到index页面
            url: '/pages/index/index'
          })
        } else {

        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.getMovie(app.globalData.cinemacode);
    let loginInfo = wx.getStorageSync('loginInfo');
    if (loginInfo) {
      app.globalData.userInfo = loginInfo;
      that.setData({
        userInfo: loginInfo,
        openID: loginInfo.openID
      });
      app.globalData.openId = loginInfo.openID

    }
    // 调用全局函数设置余额以及积分
    if (app.globalData.cinemacode && app.globalData.openId) {
      util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.openId, app.globalData.cinemacode, function (res) {
        var memberCard = [];
        var status = [];
        let userCardList = [];
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
          // console.log(status)
          for (let i = 0; i < status.length; i++) {
            util.getCallBack(app.usermessage.Username, app.usermessage.Password, app.globalData.cinemacode, status[i].cardNo, status[i].cardPassword, function (res) {
              userCardList.push(res);
              that.setData({
                userCardList: userCardList
              })
            })
          }
          // 计算余额最多的会员卡
          setTimeout(function () {
            var first = userCardList.sort(function (a, b) {
              return a.balance < b.balance
            })[0];
            console.log(first)
            if (first.score == null) {
              first.score = 0
            }
            that.setData({
              memberCardBalance: first.balance,
              memberCardScore: first.score
            })
          }, 1000)
        }
      });
    }

    return;
    that.setData({
      userInfo: app.globalData.userInfo,
      movieList: app.globalData.movieList,
    })
    // console.log(app.globalData)
    if (app.globalData.movieList) {
      that.setData({
        currentCity: app.globalData.cinemaList[0].city
      })
    }
    if (app.globalData.cinemaList && that.data.moviearea.cinemaName != app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName) {
      that.setData({
        moviearea: app.globalData.cinemaList[app.globalData.cinemaNo],
        cinemaList: app.globalData.cinemaList,
        offerDescription: app.globalData.cinemaList.offerDescription,
      })
    }
    if (app.globalData.movieList != null) {
      this.setData({
        moviearea: app.globalData.cinemaList[app.globalData.cinemaNo],
      })

    }
    if (that.data.memberCardBalance == "---") {
      app.globalData.cardList = 1;
    } else {
      app.globalData.cardList = 0;
    };
    setTimeout(function () {
      wx.setNavigationBarTitle({
        title: app.globalData.cinemaList.cinemaName
      });
    }, 1000);
  },
  onShareAppMessage: function () {
    return {
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },

  toCard: function () {
    var that = this;
    if (that.data.memberCardBalance == "---") {
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          if (res.data.mobilePhone && res.data.isRegister == '1') {
            wx.navigateTo({
              url: '../page04/index', //跳转到影片列表
            })
          } else {
            wx.navigateTo({
              url: '../login/login' //3
            })
          }
        },
        fail: function () {
          wx.reLaunch({
            url: '../login/login',
          })
        }
      })
    } else {
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          if (res.data.mobilePhone && res.data.isRegister == '1') {
            wx.navigateTo({
              url: '../page05/index', //跳转到影片列表
            })
          } else {
            wx.navigateTo({
              url: '../login/login' //4
            })
          }
        },
        fail: function () {
          wx.reLaunch({
            url: '../login/login',
          })
        }
      })
    }
  },
  hidehb: function () {
    this.setData({
      zchb: ''
    })
    wx.setStorage({
      key: 'zchb',
      data: '',
    })
    wx.showTabBar()
  },
  getAccesstoken: function () {
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token' + '?' + 'grant_type' + '=' + 'client_credential' + '&' + 'appid' + '=' + app.usermessage.AppId + '&' + 'secret' + '=' + app.usermessage.secret,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log(res.data.access_token)
        app.usermessage.access_token = res.data.access_token
      }
    })
  }
})