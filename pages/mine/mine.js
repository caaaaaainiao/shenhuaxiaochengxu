// pages/mine/mine.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    progress: false,
    count: null,
    banner: "/images/comparebg.jpg",
    banner2: "",
    couponsCount: 0, // 优惠券
    giftCount: 0, // 奖品
    goodsCount: 0, // 小食
    ticketCount: 0, // 影票
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    let data = {
      UserName: app.usermessage.Username,
      Password: app.usermessage.Password,
      CinemaCode: app.globalData.cinemacode,
      GradeCode: "06",
      OpenID: app.globalData.userInfo.userInfo.openID,
    };
    // 读取页面背景图片
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Activity/QueryActivitys/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.GradeCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.Status == "Success") {
          that.setData({
            picture: res.data.data.images[0].image,
          })
        }
      }
    });
    // 读取资源数量
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryUserResourceNumber' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == "Success") {
          that.setData({
            couponsCount: res.data.data.couponsCount,
            giftCount: res.data.data.giftCount,
            goodsCount: res.data.data.goodsCount,
            ticketCount: res.data.data.ticketCount,
          })
        }
      }
    })
    wx.getStorage({
      key: 'accredit',
      success: function(res) {
        // console.log(res.data.userInfo)
        that.setData({
          userInfo: res.data.userInfo
        })
      },
    })
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
  a:function(){
    var that = this
    let data = {
      UserName: app.usermessage.Username,
      Password: app.usermessage.Password,
      CinemaCode: app.globalData.cinemacode,
      GradeCode: "06",
      OpenID: app.globalData.openID,
    };
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryUserResourceNumber' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == "Success") {
          that.setData({
            couponsCount: res.data.data.couponsCount,
            giftCount: res.data.data.giftCount,
            goodsCount: res.data.data.goodsCount,
            ticketCount: res.data.data.ticketCount,
          })
        }
      }
    })
  },
  onShow: function() {
    var that = this;
    that.a()
    wx.getStorage({
      key: 'accredit',
      success: function (res) {
        that.setData({
          userInfo: res.data.userInfo
        })
      },
    })
    // this.setData({
    //   userInfo: app.globalData.userInfo
    // })
    // this.ask();
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
  onShareAppMessage: function() {
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  myTicket: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../myticket/myticket',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  myFood: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../myfood/myfood',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  myCoupon: function() {
    var that = this;
    // wx.showToast({
    //   title: '暂未开放',
    //   icon: "loading",
    //   duration: 2000
    // })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../mycoupon/mycoupon',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  myPrize: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../myprize/myprize',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  toCommon: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../common/common',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  toActivity: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../hotActivity/hotActivity',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  toSeenMovie: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../seenMovie/seenMovie',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  toWantsee: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.userInfo.mobilePhone) {
          wx.navigateTo({
            url: '../wantsee/wantsee',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }, fail: function () {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  toMycard: function() {
    util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.openId, app.globalData.cinemacode, function (res) {
      if (res.data.data.memberPhoneCount == 0) {
        wx.getStorage({
          key: 'loginInfo',
          success: function (res) {
            if (res.data.userInfo.mobilePhone) {
              wx.navigateTo({
                url: '../page04/index',
              })
            } else {
              wx.navigateTo({
                url: '../login/login'
              })
            }
          }, fail: function () {
            wx.reLaunch({
              url: '../index/index',
            })
          }
        })
      }
      else {
        wx.getStorage({
          key: 'loginInfo',
          success: function (res) {
            if (res.data.userInfo.mobilePhone) {
              wx.navigateTo({
                url: '../page05/index',
              })
            } else {
              wx.navigateTo({
                url: '../login/login'
              })
            }
          }, fail: function () {
            wx.reLaunch({
              url: '../index/index',
            })
          }
        })
      }
    })
      
    
  },
  ask: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('shUserCenter', nowtime);
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/shDistributor/shUserCenter',
      data: {
        appUserId: app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res.data)
        that.setData({
          count: res.data.data
        })
        wx.hideLoading();
      }
    })
  },
  getBanner: function() { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    wx.request({
      url: app.globalData.url + '/api/banner/banners',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        category: "6", //4 卖品 5聊天室房间列表 6个人中心背景图
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        if (res.data.data.length > 0) {
          that.setData({
            banner: res.data.data[0].imageUrl
          })
        }

      }
    })
  },
  getBanner2: function() { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    wx.request({
      url: app.globalData.url + '/api/banner/banners',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        category: "7", //4 卖品 5聊天室房间列表7个人中心底部banner图
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        if (res.data.data.length > 0) {
          that.setData({
            banner2: res.data.data
          })
        }

      }
    })
  },
  bannerTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var banner = this.data.banner2;
    var num = banner[index].playType;
    if (num == 1 || num == 3) {
      var url = banner[index].redirectUrl;
      if (url != "") {
        app.globalData.acivityUrl = url;
        wx.getStorage({
          key: 'loginInfo',
          success: function (res) {
            if (res.data.userInfo.mobilePhone) {
              wx.navigateTo({
                url: '../acivityUrl/acivityUrl',
              })
            } else {
              wx.navigateTo({
                url: '../login/login'
              })
            }
          }, fail: function () {
            wx.reLaunch({
              url: '../index/index',
            })
          }
        })
      }
    } else if (num == 2 && banner[index].dxMovie != null) {
      var id = banner[index].dxMovie.id;
      var movieList = app.globalData.movieList;
      for (var i = 0; i < movieList.length; i++) {
        if (movieList[i].id == id) {
          app.globalData.movieIndex = i;
          wx.getStorage({
            key: 'loginInfo',
            success: function (res) {
              if (res.data.userInfo.mobilePhone) {
                wx.navigateTo({
                  url: '../movieDetail/movieDetail',
                })
              } else {
                wx.navigateTo({
                  url: '../login/login'
                })
              }
            }, fail: function () {
              wx.reLaunch({
                url: '../index/index',
              })
            }
          })
        }
      }
    }
  },
})