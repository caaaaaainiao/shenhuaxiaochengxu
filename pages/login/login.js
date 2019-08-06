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
    iskey: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var dataInfo = app.globalData;
    var that = this;
    that.setData({
      userInfo: dataInfo.userInfo,
      areaList: app.globalData.areaList
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
  },

  //选择影院
  choosecinema: function() {
    var that = this
    that.setData({
      isshow: true,
      iskey: false
    })
    // console.log(that.data.areaList)

  },
  // 关闭选择影院
  submite: function() {
    var that = this
    that.setData({
      isshow: false,
      iskey: true
    })
  },

  //选择具体影院
  choosearea: function(e) {
    var that = this
    app.globalData.cinemacode = e.currentTarget.dataset.cinemacode
    that.setData({
      cinemacode: e.currentTarget.dataset.cinemacode,
      cinemaname: e.currentTarget.dataset.cinemaname,
      isshow: false,
      iskey: true
    })
    // console.log(that.data.cinemacode)
    // console.log(that.data.cinemaname)
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
      url: '../mycoupon/mycoupon',
    })
  },

  login: function() {
    // console.log("login")
    var phone = this.data.phone;
    // console.log(phone)
    var yzm = this.data.inputYzm;
    var cinemaname = this.data.cinemaname
    var that = this;
    if (!(/^1\d{10}$/.test(phone))) {
      wx.showModal({
        title: '提示',
        content: '手机号码错误！',
      })
      return;
    }

    if (!cinemaname) {
      wx.showModal({
        title: '提示',
        content: '请选择影院',
      })
      return;
    }

    if (yzm.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请填写验证码！',
      })
      return;
    }
    wx.showLoading({
      title: '请稍等',
    })
    let apiuser = util.getAPIUserData(null);


    wx.request({
      url: app.globalData.url + '/Api/User/MobilePhoneRegister',
      method: "POST",
      data: {
        verifyCode: yzm,
        mobilePhone: phone,
        openID: app.globalData.openId,
        cinemaCode: that.data.cinemacode,
        userName: apiuser.UserName,
        password: apiuser.Password,
      },
      success: function(res) {
        // console.log(res.data.data.mobilePhone)//用户注册的手机号码
        wx.hideLoading()
        // console.log(res)
        if (res.data.Status == "Success") {
          wx.request({
            url: app.globalData.url + '/Api/User/QueryUser' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.userInfo.openID,
            method: "GET",
            header: {
              "Content-Type": "application/json"
            },
            success: function(e) {
              // console.log(e)
              if (e.data.Status == 'Success') {
                wx.setStorage({
                  key: 'loginInfo',
                  data: e.data.data,
                })
              }
            }
          })
          app.globalData.phone = that.data.phone
          if (res.data.data.linkUrl == '') {
            wx.switchTab({
              url: '../index/index',
            })
          } else {
            let image = res.data.data.linkUrl;
            that.setData({
              image: image,
              modalHidden: false,
            });
          }
        } else {
          wx.showToast({
            title: res.data.ErrorMessage,
            icon: 'none',
            duration: 2000,
            mask: true,
          })
        }
      }
    })

  },
  phoneCut: function(e) { //手机号长度校验
    var text = e.detail.value;
    if (text.length > 11) {
      text = text.slice(0, 11);
    }
    this.setData({
      inputPhone: text,
      phone: text
    })
  },
  yzmCut: function(e) { //验证码长度校验
    var text = e.detail.value;
    if (text.length > 6) {
      text = text.slice(0, 6);
    }
    this.setData({
      inputYzm: text
    })
  },
  sendYzm: function() {
    var that = this;
    var phone = that.data.phone;
    if (that.data.yzmText == "获取验证码") {
      //手机号验证
      if (!(/^1\d{10}$/.test(phone))) {
        wx.showModal({
          title: '提示',
          content: '手机号码错误！',
        })
        return;
      }
      that.setData({
        yzmText: "正在发送"
      })
      //发送请求获取验证码
      if (!app.globalData.cinemacode) {
        wx.showToast({
          title: '请删除小程序重新扫码或搜索进入01',
          duration: 1000,
          icon: 'none',
          mask: true
        });
        return;
      } else if (!app.globalData.userInfo.openID) {
        wx.showToast({
          title: '请删除小程序重新扫码或搜索进入02',
          duration: 1000,
          icon: 'none',
          mask: true
        });
        return;
      }
      wx.request({
        url: app.globalData.url + '/Api/User/SendVerifyCode',
        method: "POST",
        data: {
          userName: app.usermessage.Username,
          password: app.usermessage.Password,
          cinemaCode: app.globalData.cinemacode,
          openID: app.globalData.openId,
          mobilePhone: phone
        },
        success: function(res) {
          console.log(res)
          if (res.data.Status == "Success") {
            //倒计时
            that.setData({
              yzmText: that.data.yzmTime + "s后重新发送"
            })
            var timer = setInterval(function() {
              var time = parseInt(that.data.yzmTime) - 1;
              if (time == 0) {
                that.setData({
                  yzmText: "获取验证码",
                  yzmTime: 60
                })
                clearInterval(timer)
                return;
              } else {
                that.setData({
                  yzmText: time + "s后重新发送",
                  yzmTime: time
                })
              }

            }, 1000)
          } else {
            wx.showToast({
              title: res.data.ErrorMessage,
              duration: 1000,
              icon: 'none',
              mask: true
            })
            that.setData({
              yzmText: "获取验证码",
              yzmTime: 60
            })
          }
        }
      })
    }
  }
})