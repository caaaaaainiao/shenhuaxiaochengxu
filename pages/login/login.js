// pages/login/login.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    inputPhone: "",
    inputYzm: "",
    yzmText: "获取验证码",
    yzmTime: "60",
    image: null,
    modalHidden: true,
    isshow: false,
    iskey: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    getInfo: 0,
    index: 0,
    dianji:false,
    show:true,
    text:'请选择注册影院',
    nowCity: [{
      name: "",
      show: ""
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var dataInfo = app.globalData;
    var that = this;
    that.setData({
      userInfo: dataInfo.userInfo,
      areaList: app.globalData.areaList,
      cinemaName: app.globalData.cinemaList.cinemaName,
      cinemacode: app.globalData.cinemacode,
    })
    wx.setNavigationBarTitle({
      title: '用户注册'
    });
    wx.request({
      url: app.globalData.url + '/Api/Cinema/QueryCinemas/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.usermessage.AppId,
      method: 'GET',
      success: function(res) {
        that.setData({
          logo: res.data.data.cinemas[0].businessPic
        })
      }
    })
    // 声明一个新数组 将市区添加到新数组内
    var arr = [];
    for (let i = 0; i < app.globalData.areaList.length; i++) {
      arr.push(app.globalData.areaList[i].city);
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
    let allCinemas = app.globalData.areaList.sort(util.sortDistance("distance"));
    that.setData({
      allCinemas: allCinemas,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  /**
   * 显示弹窗
   */
  buttonTap: function() {
    this.setData({
      modalHidden: false
    })
  },

  /**
   * 点击取消
   */
  modalCandel: function() {
    // do something
    this.setData({
      modalHidden: true
    })
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   *  点击确认
   */
  modalConfirm: function() {
    // do something
    this.setData({
      modalHidden: true
    })
    wx.redirectTo({
      url: '../mycoupon/mycoupon?cinemacode=' + this.data.currentCode,
    })
  },
  
  // 选择城市
  chooseCity: function (e) {
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
      allCinemas: []
    })
    for (let j = 0; j < show.length; j++) {
      let name = "allCinemas[" + j + "].cinemaName";
      let address = "allCinemas[" + j + "].address";
      let distance = "allCinemas[" + j + "].distance";
      let cinemaCode = "allCinemas[" + j + "].cinemaCode";
      let isSnackDistribution = "allCinemas[" + j + "].isSnackDistribution";
      that.setData({
        [name]: show[j].cinemaName,
        [address]: show[j].address,
        [distance]: show[j].distance,
        [cinemaCode]: show[j].cinemaCode,
        [isSnackDistribution]: show[j].isSnackDistribution,
      })
    };
  },

  // 选择影院
  chooseCinema: function (e) { //选择影院
    var that = this;
    var cinemacode = e.currentTarget.dataset.cinemacode;
    that.setData({
      cinemacode: cinemacode,
      currentCode: cinemacode,
    })
  },

  // 获取用户信息
  getUserInfo: function(e) { //获取用户信息
    var that = this;
    if (e.detail.errMsg == "getUserInfo:fail auth deny") { // 拒绝
      wx.reLaunch({
        url: '../index/index',
      })
    } else if (e.detail.errMsg == "getUserInfo:ok") { // 允许
      that.setData({
        userInfoDetail: e.detail
      })
      wx.setStorage({
        key: 'accredit',
        data: {
          "userInfo": e.detail.userInfo,
          "userInfoDetail": e.detail
        },
        success: function (res) {
          that.wxLogin();
        }
      })
    } else { // 报错
      wx.showModal({
        title: e.detail.errMsg
      })
    }
  },

  // 获取手机号
  getPhoneNumber: function(e) { //获取用户信息
    var that = this;
    if (!that.data.currentCode) {
      wx.showModal({
        title: '请点击选择影院',
        showCancel: false,
      })
    } else {
      if (e.detail.errMsg == "getPhoneNumber:fail user deny") { // 拒绝
        wx.showToast({
          title: '请先授权',
          icon: "loading",
          duration: 2000
        })
      } else if (e.detail.errMsg == "getPhoneNumber:ok") { // 允许
        that.setData({
          userInfoDetail: e.detail
        })
        that.wxGetPhoneNumber();
      } else { // 报错
        console.log(e.detail.errMsg)
        wx.showModal({
          title: e.detail.errMsg
        })
      }
    }
  },

  wxLogin: function() { // 获取用户信息
    var that = this;
    wx.login({
      success: function(msg) {
        var wxCode = msg.code; // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let encryptedData = that.data.userInfoDetail.encryptedData;
        let iv = that.data.userInfoDetail.iv;
        let apiuser = util.getAPIUserData(null);
        wx.request({
          url: app.globalData.url + '/Api/User/UserLogin',
          data: {
            code: wxCode,
            userName: apiuser.UserName,
            password: apiuser.Password,
            encryptedData: encryptedData,
            iv: iv,
            cinemaCode: that.data.cinemacode
          },
          method: "POST",
          header: {
            "Content-Type": "application/json"
          },
          success: function(e) {
            //个人信息
            if (e.data.Status == 'Success') {
              app.globalData.openId = e.data.data.openID;
              if (e.data.data.mobilePhone && e.data.data.isRegister == '1') {
                wx.setStorage({
                  key: 'loginInfo',
                  data: e.data.data,
                })
                app.globalData.userInfo = e.data.data;
                wx.switchTab({
                  url: '../index/index',
                })
              } else {
                that.setData({
                  getInfo: 1,
                  iskey: false,
                })
              }
            } else {
              wx.showToast({
                title: '授权失败，请重新授权',
                icon: 'none',
                duration: 2000,
              })
              that.setData({
                getInfo: 0,
              })
            }
          },
          fail: function(e) {
            wx.showToast({
              title: '授权失败，请重新授权',
              icon: 'none',
              duration: 2000,
            })
            that.setData({
              getInfo: 0,
            })
          }
        })
      }
    })
  },

  wxGetPhoneNumber: function() { // 获取用户手机号
    var that = this;
    wx.login({
      success: function(msg) {
        var wxCode = msg.code; // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let encryptedData = that.data.userInfoDetail.encryptedData;
        let iv = that.data.userInfoDetail.iv;
        let apiuser = util.getAPIUserData(null);
        wx.request({
          url: app.globalData.url + '/Api/User/GetPhoneNum',
          data: {
            code: wxCode,
            userName: apiuser.UserName,
            password: apiuser.Password,
            encryptedData: encryptedData,
            iv: iv,
            cinemaCode: that.data.currentCode
          },
          method: "POST",
          header: {
            "Content-Type": "application/json"
          },
          success: function(e) {
            console.log(e)
            //个人信息
            if (e.data.Status == 'Success') {
              if (e.data.linkUrl == '') {
                wx.request({
                  url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + that.data.currentCode + '/' + app.globalData.openId,
                  method: "GET",
                  header: {
                    "Content-Type": "application/json"
                  },
                  success: function (res) {
                    console.log(res)
                    if (res.data.Status == 'Success') {
                      wx.setStorage({
                        key: 'loginInfo',
                        data: res.data.data,
                      })
                      app.globalData.userInfo = res.data.data;
                      that.setData({
                        userInfo: res.data.data,
                      });
                      wx.switchTab({
                        url: '../index/index',
                      })
                    } else {
                      wx.showToast({
                        title: '授权失败，请重新授权',
                        icon: 'none',
                        duration: 2000,
                      })
                      that.setData({
                        getInfo: 0,
                      })
                    }
                  }
                })
              } else {
                let image = e.data.linkUrl;
                that.setData({
                  image: image,
                  modalHidden: false,
                });
                wx.request({
                  url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + that.data.currentCode + '/' + app.globalData.openId,
                  method: "GET",
                  header: {
                    "Content-Type": "application/json"
                  },
                  success: function (res) {
                    console.log(res)
                    if (res.data.Status == 'Success') {
                      wx.setStorage({
                        key: 'loginInfo',
                        data: res.data.data,
                      })
                      app.globalData.userInfo = res.data.data;
                      that.setData({
                        userInfo: res.data.data,
                      });
                    } else {
                      wx.showToast({
                        title: '授权失败，请重新授权',
                        icon: 'none',
                        duration: 2000,
                      })
                      that.setData({
                        getInfo: 0,
                      })
                    }
                  }
                })
              }
            } else {
              wx.showToast({
                title: '授权失败，请重新授权',
                icon: 'none',
                duration: 2000,
              })
              that.setData({
                getInfo: 1,
              })
            }
          },
          fail: function(e) {
            wx.showToast({
              title: '授权失败，请重新授权',
              icon: 'none',
              duration: 2000,
            })
            that.setData({
              getInfo: 1,
            })
          }
        })
      }
    })
  },
})