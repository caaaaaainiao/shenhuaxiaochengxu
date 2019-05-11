// pages/waitPay/waitPay.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum: 0,
    order: null,
    minute: "00",
    second: "00",
    showPay: false,
    canClick: 1,
    showM: false,
    password: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderNum: options.orderNum
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('unPayOrder', nowtime);
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/api/shOrder/unPayOrder',
      data: {
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.orderNum,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if (res.data.data.order != null) {
          var order = res.data.data;
          var seats = order.order.seats.split(",");
          var seatsJson = [];
          for (var i = 0; i < seats.length; i++) {
            var row = {};
            row.name = seats[i];
            seatsJson.push(row)
          }
          order.order.seats = seatsJson;
          that.setData({
            order: order
          })
        } else {
          that.setData({
            order: res.data.data
          })
        }
        that.leftTime();
        wx.hideLoading()
      }
    })
  },
  phone: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

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
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  leftTime: function () {
    var that = this;
    var timer = setInterval(function () {
      var nowTime = parseInt(new Date().getTime() / 1000);
      var leftTime = that.data.order.order.orderExpireSecond - nowTime;
      var minute = parseInt(leftTime / 60);
      var second = parseInt(leftTime % 60);
      if (minute < 0 || second < 0) {
        clearInterval(timer)
        wx.switchTab({
          url: '../index/index',
        })
        return;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }
      
      that.setData({
        minute: minute,
        second: second
      })
    }, 1000)
  },
  cancelOrder: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('cancelorder', nowtime);
    wx.request({
      url: app.globalData.url + '/api/order/cancelorder',
      data: {
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.orderNum,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if (res.data.status == 1) {
          wx.showToast({
            title: '取消成功',
            icon: 'loading',
            image: '',
            duration: 2000,
            mask: true,
          })
          setTimeout(function(){
            wx.redirectTo({
              url: '../compare/compare',
            })
          },1500)
        } else {
          wx.showToast({
            title: '取消失败',
            icon: 'loading',
            image: '',
            duration: 2000,
            mask: true,
          })
        }
      }
    })
  },
  toPay: function () {
    var that = this;
    if (that.data.order.disPrice == 0){
      that.cancelOrder();
      wx.showToast({
        title: '订单已取消',
      })
    }else{
      this.setData({
        showPay: true
      })
    }
    
  },
  wxPay: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('minipay', nowtime);
    if (that.data.canClick != 1) {
      return;
    }
    that.setData({
      canClick: 0
    })//防止多次点击
    wx.request({
      url: app.globalData.url + '/api/shOrder/minipay',
      data: {
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.orderNum,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        // return;
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.package,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          success: function (res) {
            that.setData({
              showPay: false
            })
            wx.showToast({
              title: '支付成功',
              mask: true,
              duration: 2000
            })
            setTimeout(function () {
              wx.redirectTo({
                url: '../success/success?orderNum=' + that.data.orderNum,
              })
            }, 1000)
          },
          fail: function (res) {
            // console.log(res)
            that.setData({
              canClick: 1
            })
          }
        })
      }
    })
  },
  close: function () {
    this.setData({
      showPay: false
    })
  },
  cardPay:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('cardPay', nowtime);
    var pageNo = that.data.pageNo;
    if (that.data.canClick != 1) {
      return;
    }
    if (that.data.password.length == 0) {
      wx.showToast({
        title: '请输入密码',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
      return;
    }
    that.setData({
      canClick: 0
    })//防止多次点击
    wx.showLoading({
      title: '支付中',
    })
    wx.request({
      url: app.globalData.url + '/api/shOrder/cardPay',
      data: {
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.orderNum,
        password:that.data.password,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        that.setData({
          canClick: 1
        })//解開點擊
        wx.hideLoading()
        if (res.data.status == 0) {
          if (res.data.code == "not_enough_balance") {
            wx.showModal({
              title: '',
              content: res.data.message,
              // confirmText:"",
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '../mycard/mycard',
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title: '',
              content: res.data.message,
            })
          }
        } else if (res.data.status == 1) {
          that.setData({
            showPay: false
          })
          that.syn();
          wx.showToast({
            title: '支付成功',
            mask: true,
            duration: 2000
          })
          setTimeout(function () {
            wx.redirectTo({
              url: '../success/success?orderNum=' + that.data.orderNum,
            })
          }, 1000)
        }
      }
    })
  },
  syn: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userCard', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shAppuser/userCard',
      data: {
        appUserId: app.globalData.userInfo.id,
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if (res.data.status == 1) {
          var userInfo = res.data.data;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo;
        } else {
          wx.showModal({
            title: '',
            content: res.data.message
          })
        }
      }
    })
  },
  setM: function (e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },
  showM: function () {
    if (app.globalData.userInfo.dxInsiderInfo == null) {
      wx.showModal({
        title: '支付失败',
        content: "您还没有会员卡，是否前去绑定/开卡？",
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../mycard/mycard',
            })
          }
        }
      })
      return;
    }
    this.setData({
      showM: true
    })
  },
  closeM: function () {
    this.setData({
      showM: false
    })
  }
})