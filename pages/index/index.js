//index.js
//获取应用实例
const app = getApp();
Page({
  data: {
    FlimList: [],
    FilmCodes: [],
    list: null,
    moviearea: null, //当前影院信息
    movieList: null, //当前城市影院列表
    userInfo: null, //个人信息
    currentCity: null, //当前所在城市
    isFirst: false,
    cinemaList: null, //影院列表
    isChoose: false, //选择影院
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
    indexList: null
  },
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等
  //授权信息
  getdate: function(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    return year + "-" + month + "-" + date;
  },

  onLoad: function(options) {
    var that = this
  


    var accreditInfo = wx.getStorage({
      key: 'accredit',
      success: function(res) { //key所对应的内容
        // console.log(res)
        that.setData({
          wxInfo: res.data.userInfo //用户信息
        })
        wx.hideTabBar(); //隐藏栏
        that.wxLogin(); //获取信息函数
      },
      fail: function(res) {
        // console.log(res) //失败打印内容
        that.setData({
          shouquan: true
        })
        wx.hideTabBar() //隐藏栏
      }
    })
    wx.getSetting({ //获取用户当前设置
      success: function(res) {
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
      success: function(res) {
        // console.log(res)
        that.setData({
          zchb: res.data //key所对应的内容
        })
        wx.hideTabBar() //隐藏栏
      },
    })
    //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等 监听页面加载
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var userLat = res.latitude;
        var userLng = res.longitude;
        var data = {
          Username: 'MiniProgram',
          Password: '6BF477EBCC446F54E6512AFC0E976C41',
          AppId: 'wx8079e2f2a9958d05'
        };
        wx.request({
          url: 'https://xc.80piao.com:8443/Api/Cinema/QueryCinemas/' + data.Username + '/' + data.Password + '/' + data.AppId,
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            var cinemas = res.data.data.cinemas;
            var recent = []
            for (let i = 0; i < cinemas.length; i++) {
              var lat = cinemas[i].latitude;
              var lng = cinemas[i].longitude;
              var distance = that.distance(userLat, userLng, lat, lng);
              cinemas[i].distance = distance
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
            // console.log(cinemas)
            app.globalData.cinemacode = cinemas[0].cinemaCode
            // console.log(app.globalData.cinemacode)
            that.getMovie(app.globalData.cinemacode)
            var recent = cinemas.sort(sortDistance("distance"))[0].cinemaName;
            that.setData({
              moviearea: recent
            })
            wx.setStorage({
              key: 'city',
              data: cinemas,
            });
          }
        });
      },
    })
  },
  // bindGetUserInfo(e) {
  //   console.log(e.detail)
  // },

  format: function() {
    //rua 把里面的数据拿出来 放到最外面一层
    var that = this;
    var json = that.data.movieList;
    for (var i = 0; i < json.length; i++) {
      for (var j = 0; j < json[i].films.film.length; j++) {
        that.data.FilmCodes.push(json[i].films.film[j].code)
      }
    }
    that.setData({
      movieList: json,
      FilmCodes: that.data.FilmCodes
    })
    var b = []; //去重
    b.push(that.data.FilmCodes[0]);

    for (var i = 0; i < that.data.FilmCodes.length; i++) {
      if (b.indexOf(that.data.FilmCodes[i]) == -1) {
        b.push(that.data.FilmCodes[i])
      }
    }
    that.setData({
      FilmCodes: b
    })
    // console.log(that.data.FilmCodes)
    for (var i = 0; i < that.data.FilmCodes.length; i++) {
      that.QueryFilm(that.data.FilmCodes[i])
      // console.log(i)
    }
    var arr = that.data.movieList;

    function uniq(array) {
      var temp = []; //一个新的临时数组
      for (var i = 0; i < array.length; i++) {
        if (temp.indexOf(array[i]) == -1) {
          temp.push(array[i]);
        }
      }
      return temp;
    }
    app.globalData.movieList = that.data.movieList;
  },
  getMovie: function(a) {
    console.log(a)
    var that = this;
    var Nowtimestamp = new Date().getTime()
    var NowtimestampOne = new Date(Nowtimestamp);
    var NowtimestampTwo = new Date(Nowtimestamp + 604800000);
    this.setData({
      Nowtimestamp: Nowtimestamp
    })
    var data = {
      Username: 'MiniProgram',
      Password: '6BF477EBCC446F54E6512AFC0E976C41',
      CinemaCode: a,
      StartDate: this.getdate(NowtimestampOne),
      EndDate: this.getdate(NowtimestampTwo),
    }
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Session/QueryFilmSessions' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.StartDate + '/' + data.EndDate,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var timestamp = new Date().getTime() + 2592000000
        for (var i = 0; i < res.data.data.film.length; i++) {
          var NowDate = res.data.data.film[i].publishDate
          if (NowDate != null) {
            NowDate = NowDate.substring(0, 19);
            NowDate = NowDate.replace(/-/g, '/');
            var timestamp1 = new Date(NowDate).getTime();
            res.data.data.film[i].time = timestamp1
          }
        }
        that.setData({
          indexList: res.data.data.film
        })
      }
    })
    // var data = {
    //   Username: 'MiniProgram',
    //   Password: '6BF477EBCC446F54E6512AFC0E976C41',
    //   CinemaCode: 33111001,
    //   StartDate: '2019-05-16',
    //   EndDate: '2019-06-16',
    // }
    // wx.request({
    //   url: 'https://xc.80piao.com:8443/Api/Session/QuerySessions' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.StartDate + '/' + data.EndDate,
    //   method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function(res) {
    //     console.log(res)
    //     wx.hideLoading();
    //     var movieList = res.data.sessions.session
    //     that.setData({
    //       movieList: movieList
    //     })
    //     // console.log(movieList)
    //     that.format();
    //     wx.showTabBar();
    //   }
    // })

  },
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
  QueryFilm: function(FilmCode) { //显示电影详情
    var that = this;
    var data = {
      Username: 'MiniProgram',
      Password: '6BF477EBCC446F54E6512AFC0E976C41',
      CinemaCode: '33097601',
      FilmCode: FilmCode
    }
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Film/QueryFilm' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.FilmCode,

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
          //  console.log(that.data.sza)
          app.globalData.movieList = that.data.sza
          // console.log(app.globalData.movieList)
        }
      }
    })
  },
  // 移除第一次进入引导
  removeBlack: function() {
    this.setData({
      isFirst: false
    })
    wx.showTabBar({

    })
    wx.setStorage({
      key: "firstUse",
      data: "点过了"
    })
  },
  // 影片详情
  toDetails: function(e) {
    // console.log("details")

    app.globalData.movieIndex = e.currentTarget.dataset.index;
    // console.log(e)
    wx.navigateTo({
      url: '../movieDetail/movieDetail', //跳转到影片列表
    })
  },
  // 比价购票
  buy: function(e) {
    console.log(e.currentTarget.dataset)
    // return;
    // if (app.globalData.userInfo.mobile == null || app.globalData.userInfo.mobile == "") {
    //   wx.showToast({
    //     title: '请先注册手机号',
    //     icon: "loading",
    //     mask: true,
    //     duration: 2000,
    //     success: function() {
    //       setTimeout(function() {
    //         wx.redirectTo({
    //           url: '../login/login'
    //         })
    //       }, 2000)
    //     }
    //   })
    //   return;
    // }
    app.globalData.movieId = e.currentTarget.dataset.id;
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../compare/compare',
    })
  },
  getMovies: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('hotMovie', nowtime);
    // wx.showLoading({
    //   title: '加载中',
    // })
    this.setData({
      isChoose: false
    })
    // wx.navigateBack({
    //   delta : 1
    // })
  },
  chooseCity: function(e) {
    var that = this;
    var crCity = e.currentTarget.dataset.name;
    // var show = [];
    that.setData({
      currentCity: crCity
    });
    // 获取存入缓存的数据开始渲染
    wx.getStorage({
      key: 'city',
      success: function(res) {
        var show = [];
        // console.log(this.cinemaList)
        that.data.cinemaList = []
        for (let i = 0; i < res.data.length; i++) {
          if (crCity === res.data[i].city) {
            show.push(res.data[i]);
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
            [distance]: show[j].distance + "km",
            [cinemaCode]: show[j].cinemaCode
          })
        }
      }
    })
  },
  showCity: function() { //展示城市
    // var that = this;
    // var nowtime = new Date().getTime();
    // var sign = app.createMD5('getCinemaCity', nowtime);
    // wx.request({
    //   url: app.globalData.url + '/shDxCinema/getCinemaCity', //点击左上角获取所有影院
    //   data: {
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function(res) {
    //     // console.log(res)
    //     that.setData({
    //       nowCity: res.data.data
    //     })
    //   }
    // })
  },
  chooseCinema: function(e) { //选择影院
    var that = this
    app.globalData.cinemaNo = e.currentTarget.dataset.index;
    app.globalData.cinemacode = e.currentTarget.dataset.cinemacode;
    app.globalData.moviearea = e.currentTarget.dataset.cinemaname;
    that.setData({
      moviearea: app.globalData.moviearea
    })
    this.getMovies();
    that.getMovie(app.globalData.cinemacode)
  },
  startChoose: function() {
    this.setData({
      isChoose: true
    })
    this.showCity();
  },
  getUserInfo: function(e) { //获取用户信息
    // console.log(e)
    var that = this;
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '请先授权',
        icon: "loading",
        duration: 2000
      })
    } else if (e.detail.errMsg == "getUserInfo:ok") {
      this.setData({
        userInfo: e.detail.userInfo,
      })
      app.globalData.userInfo = e.detail.userInfo;
      wx.setStorage({
        key: 'accredit',
        data: {
          "userInfo": e.detail.userInfo
        },
        success: function(res) {
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
  wxLogin: function() { //用户信息
    var that = this;
    wx.login({
      success: function(msg) {
        var wxCode = msg.code; // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var nowtime = new Date().getTime();

        var sign = app.createMD5('appletAuthorize', nowtime);
        wx.request({
          url: app.globalData.url + '/shDistributor/appletAuthorize',
          data: {
            code: wxCode,
            userInfo: JSON.stringify(that.data.wxInfo), //JSON.stringify(wxInfo),
            timeStamp: nowtime,
            mac: sign
          },
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
          },
          success: function(e) {
            console.log(e)
            // console.log("登录")
            //个人信息
            that.setData({
              onLoad: true
            })
            if (e.data.status != 1) {
              // wx.showModal({
              //   title: '登录失败',
              //   content: e.data.message, //请先登录
              // })
              return;
            }
            if (e.data.data) {
              wx.setStorage({
                key: 'loginInfo',
                data: {
                  "userInfo": e.data.data
                },
                success: function() {
                  console.log(e)
                  app.globalData.userInfo = e.data.data;
                  that.setData({
                    userInfo: e.data.data
                  })
                  that.getPlace();

                }
              })
            } else {
              // wx.showToast({
              //   title: '登录失败',
              //   icon: 'loading',
              //   duration: 2000
              // })
            }

            //是否第一次进入 引导
            wx.getStorage({
              key: 'firstUse',
              success: function(res) {

              },
              fail: function() {
                that.setData({
                  isFirst: true
                })
                wx.hideTabBar({

                })
              }
            })

          },
          fail: function(e) {
            console.log(e)
          }
        })
      }
    })
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
        } else {

        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
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
      console.log(1)
      that.setData({
        moviearea: app.globalData.cinemaList[app.globalData.cinemaNo],
        cinemaList: app.globalData.cinemaList,
      })
    }
    // console.log(app.globalData.userInfo)
    if (app.globalData.movieList != null) {
      console.log(0)
      this.setData({
        moviearea: app.globalData.cinemaList[app.globalData.cinemaNo],
      })
    }
  },
  onShareAppMessage: function() {
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  toCard: function() {
    wx.navigateTo({
      url: '../page04/index',
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
  tologin: function() {
    var that = this;
    if (!that.data.userInfo || !that.data.userInfo.mobile || that.data.userInfo.mobile == "") {
      wx.redirectTo({
        url: '../login/login',
      })
    }

  }
})