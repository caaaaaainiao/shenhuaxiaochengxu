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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var dataInfo = app.globalData;
    var that = this;
    that.setData({
      userInfo: dataInfo.userInfo
    })
    wx.setNavigationBarTitle({ title: '用户注册' });
    wx.request({
      url: app.globalData.url +'/Api/Cinema/QueryCinemas/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.usermessage.AppId,
      method:'GET',
      success:function(res){
        that.setData({
          logo: res.data.data.cinemas[0].businessPic
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  /**
 * 显示弹窗
 */
  buttonTap: function () {
    this.setData({
      modalHidden: false
    })
  },

  /**
   * 点击取消
   */
  modalCandel: function () {
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
  modalConfirm: function () {
    // do something
    this.setData({
      modalHidden: true
    })
    wx.redirectTo({
      url: '../mycoupon/mycoupon',
    })
  },

  login: function () {
    // console.log("login")
    var phone = this.data.phone;
    var yzm = this.data.inputYzm;
    var that = this;
    if (!(/^1\d{10}$/.test(phone))) {
      wx.showModal({
        title: '提示',
        content: '手机号码错误！',
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
        openID: app.globalData.userInfo.openID,
        cinemaCode: app.globalData.cinemacode,
        userName: apiuser.UserName,
        password: apiuser.Password,
      },
      success: function (res) {
        // console.log(res.data.data.mobilePhone)//用户注册的手机号码
        wx.hideLoading()
        console.log(res)
        if (res.data.Status == "Success") {
              wx.request({
                url: app.globalData.url + '/Api/User/QueryUser' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.userInfo.openID,
                method: "GET",
                header: {
                  "Content-Type": "application/json"
                },
                success: function (res) {
                  if (res.data.Status == 'Success') {
                    wx.setStorage({
                      key: 'loginInfo',
                      data: res.data.data,
                    })
                  }
                }
              })
              app.globalData.phone = that.data.phone
           if (res.data.data.linkUrl == '') {
                wx.switchTab({
                  url: '../index/index',
                })
              }
              else {
             let image = res.data.data.linkUrl;
                that.setData({
                  image: image,
                  modalHidden: false,
                });
              }
        } else {
          wx.showToast({
            title: res.data.ErrorMessage,
            icon: 'loading',
            image: '',
            duration: 2000,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      }
    })

  },
  phoneCut: function (e) { //手机号长度校验
    var text = e.detail.value;
    if (text.length > 11) {
      text = text.slice(0, 11);
    }
    this.setData({
      inputPhone: text,
      phone: text
    })
  },
  yzmCut: function (e) { //验证码长度校验
    var text = e.detail.value;
    if (text.length > 6) {
      text = text.slice(0, 6);
    }
    this.setData({
      inputYzm: text
    })
  },
  sendYzm: function () {
    var phone = this.data.phone;
    var that = this;
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
      let apiuser = util.getAPIUserData(null);
      if (!app.globalData.cinemacode || !app.globalData.userInfo.openID) {
        wx.showToast({
          title: '请删除小程序重新扫码或搜索进入',
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
          userName: apiuser.UserName,
          password: apiuser.Password,
          cinemaCode: app.globalData.cinemacode,
          openID: app.globalData.userInfo.openID,
          mobilePhone: phone
        },
        success: function (res) {
          console.log(res)
          if (res.data.Status == "Success") {
            //倒计时
            that.setData({
              yzmText: that.data.yzmTime + "s后重新发送"
            })
            var timer = setInterval(function () {
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
          }else{
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