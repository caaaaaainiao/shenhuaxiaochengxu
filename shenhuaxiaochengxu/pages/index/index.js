//index.js
//获取应用实例
const app = getApp();
// 腾讯地图引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'IVSBZ-KOPWS-6ERO4-6DCIQ-ZGCWK-7TBIJ'
});

Page({
  data: {
    moviearea: null, //当前影院信息
    movieList: null, //当前城市影院列表
    userInfo: null, //个人信息
    currentCity: null, //当前所在城市
    isFirst: false,
    cinemaList: [], //影院列表
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
    zchb:"",
    onLoad:false
  },
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等
  onLoad: function (options) {
    //授权信息
    //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等 监听页面加载
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
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
            success: function (res) {
              var cinemas = res.data.data.cinemas;
              var recent = []
              for (let i = 0; i < cinemas.length; i++) {
                var lat = cinemas[i].latitude;
                var lng = cinemas[i].longitude;
                var distance = that.distance(userLat, userLng, lat, lng);
                cinemas[i].distance = distance + "km"
              }
              // 声明一个新数组 将市区添加到新数组内
              var arr = [];
              for (let i = 0; i < cinemas.length; i++) {
                arr.push(cinemas[i].city);
              };
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
              // 计算出最近的影院显示在左上角
              function sortDistance(property) {
                return function (a, b) {
                  var value1 = a[property];
                  var value2 = b[property];
                  return value1 - value2;
                }
              }
              var recent = cinemas.sort(sortDistance("distance"))[0].cinemaName;
              that.setData({
                moviearea: recent
              })
              // 将所有的影院列表存入缓存
              wx.setStorage({
                key: 'cinemaList',
                data: cinemas,
              });
            }
          });
        },
      })
    var that = this;
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
  // 选择城市查看影院列表
  chooseCity: function (e) {
    var that = this;
    var crCity = e.currentTarget.dataset.name;
    // var show = [];
    that.setData({
      currentCity: crCity
    });
    // 获取存入缓存的数据开始渲染
    wx.getStorage({
      key: 'cinemaList',
      success: function (res) {
        var show = [];
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
          that.setData({
            [name]: show[j].cinemaName,
            [address]: show[j].address,
            [distance]: show[j].distance,
          })
        }
      }
    })
  },
  showCity: function () {
    var that = this;
  },
  chooseCinema: function (e) {
    var index = e.currentTarget.dataset.index;
    app.globalData.cinemaNo = index;
    this.setData({
      isChoose: false,
      moviearea: app.globalData.cinemaList[app.globalData.cinemaNo]
    })
    wx.setStorage({
      key: "location",
      data: app.globalData.cinemaList
    })
    wx.setStorage({
      key: "areaNo",
      data: index
    })
    this.getMovies();
  },
  startChoose: function () {
    this.setData({
      isChoose: true
    })
    this.showCity();
  },
  getUserInfo: function (e) {
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
  wxLogin: function () {
    var that = this;
    wx.login({
      success: function (msg) {
        var wxCode = msg.code;
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
          success: function (e) {
            // console.log(e)
            // console.log("登录")
            //个人信息
            that.setData({
              onLoad:true
            })
            if(e.data.status!=1){
              wx.showModal({
                title: '登录失败',
                content: e.data.message,
              })
              return;
            }
            if (e.data.data) {
              wx.setStorage({
                key: 'loginInfo',
                data: {
                  "userInfo": e.data.data
                },
                success: function () {
                  // console.log(e.data.data)
                  app.globalData.userInfo = e.data.data;
                  that.setData({
                    userInfo: e.data.data
                  })
                  that.getPlace();

                }
              })
            } else {
              wx.showToast({
                title: '登录失败',
                icon: 'loading',
                duration: 2000
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
                wx.hideTabBar({

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
          wx.reLaunch({
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
    that.setData({
      userInfo: app.globalData.userInfo,
      movieList: app.globalData.movieList,
      
    })
    // console.log(app.globalData)
    if (app.globalData.movieList){
      that.setData({
        currentCity: app.globalData.cinemaList[0].city
      })
    }
    if (app.globalData.cinemaList&&that.data.moviearea.cinemaName != app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName){
      that.setData({
        moviearea: app.globalData.cinemaList[app.globalData.cinemaNo],
        cinemaList:app.globalData.cinemaList,
      })
    }
    // console.log(app.globalData.userInfo)
    if (app.globalData.movieList!=null){
      this.setData({
        moviearea: app.globalData.cinemaList[app.globalData.cinemaNo], 
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  toCard: function () {
    wx.navigateTo({
      url: '../mycard/mycard',
    })
  },
  hidehb:function(){
    this.setData({
      zchb: ''
    })
    wx.setStorage({
      key: 'zchb',
      data: '',
    })
    wx.showTabBar()
  },
  tologin:function(){
    var that = this;
    if (!that.data.userInfo || !that.data.userInfo.mobile || that.data.userInfo.mobile==""){
      wx.redirectTo({
        url: '../login/login',
      })
    }
   
  }
})