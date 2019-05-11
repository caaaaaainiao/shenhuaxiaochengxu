// pages/orderForm/orderForm.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPay: false,
    seatOrder: null,
    date: null,
    seatCoupon: 0, //电影票优惠券
    foodCoupon: 0, //小食优惠券
    seatCouponList: null,
    foodCouponList: null,
    foodPrice: 0,
    phone: '',
    canClick: 1,
    marActivity: null, //参与活动id
    seatsJson: null,
    endTime: "0:00",
    showM: false,
    password: "",
    merTicketId: "",
    seatTicketId: "",
    chooseType: 0,
    messageshow: false,
    userMessage: ""
    // waitActivity: null,//可參與活動

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      date: options.date
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // console.log(app.globalData.seatOrder)
    that.manage();
  },

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
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  manage: function() {
    var that = this;
    var seatOrder = app.globalData.seatOrder;
    var seats = seatOrder.order.seats.split(",");
    var seatsJson = [];
    for (var i = 0; i < seats.length; i++) {
      var row = {};
      row.name = seats[i]
      seatsJson.push(row);
    }
    that.setData({
      seatsJson: seatsJson
    })
    if (seatOrder.comboList != null) {
      for (var i = 0; i < seatOrder.comboList.length; i++) {
        seatOrder.comboList[i].buyNum = 0;
      }
    }
    var seatCouponList = seatOrder.order.seatTicketList;
    if (seatCouponList) {
      for (var i = 0; i < seatCouponList.length; i++) {
        var time = seatCouponList[i].dxPlatTicket.endTime;
        seatCouponList[i].dxPlatTicket.endTime2 = time.substring(0, 4) + "年" + time.substring(5, 7) + "月" + time.substring(8, 10) + "日";
      }
    }

    that.setData({
      seatOrder: seatOrder,
      seatCoupon: seatOrder.order.seatTicket,
      seatCouponList: seatCouponList,
      foodCoupon: seatOrder.merOrder,
      foodCouponList: seatOrder.merOrder,
      phone: app.globalData.userInfo.mobile
    })
    // console.log(that.data.seatOrder)
    that.leftTime();
  },
  add: function(e) {
    var that = this;
    var seatOrder = that.data.seatOrder;
    var id = e.currentTarget.dataset.id;
    for (var i = 0; i < seatOrder.comboList.length; i++) {
      if (seatOrder.comboList[i].id == id) {
        seatOrder.comboList[i].buyNum = seatOrder.comboList[i].buyNum + 1;
      }
    }
    that.setData({
      seatOrder: seatOrder,
      seatCoupon: seatOrder.order.seatTicket,
      // seatCouponList: seatOrder.order.seatTicketList,
      foodCoupon: seatOrder.merOrder,
      foodCouponList: seatOrder.merOrder,
    })
    that.calculate();
  },
  minus: function(e) {
    var that = this;
    var seatOrder = that.data.seatOrder;
    var id = e.currentTarget.dataset.id;
    for (var i = 0; i < seatOrder.comboList.length; i++) {
      if (seatOrder.comboList[i].id == id) {
        seatOrder.comboList[i].buyNum = seatOrder.comboList[i].buyNum - 1;
        if (seatOrder.comboList[i].buyNum < 0) {
          seatOrder.comboList[i].buyNum = 0;
        }
      }
    }
    that.setData({
      seatOrder: seatOrder,
      seatCoupon: seatOrder.order.seatTicket,
      // seatCouponList: seatOrder.order.seatTicketList,
      foodCoupon: seatOrder.merOrder,
      foodCouponList: seatOrder.merOrder,
    })
    that.calculate();
  },
  calculate: function() { //计算价格
    var that = this;
    var json = [];
    for (var i = 0; i < that.data.seatOrder.comboList.length; i++) {
      if (that.data.seatOrder.comboList[i].buyNum > 0) {
        var row = {};
        row.id = that.data.seatOrder.comboList[i].id;
        row.number = that.data.seatOrder.comboList[i].buyNum;
        json.push(row)
      }

    }
    if (json.length == 0) {
      json = ""
    } else {
      json = JSON.stringify(json)
    }
    var id = "";
    if (that.data.seatCoupon) {
      id = that.data.seatCoupon.id
    }
    wx.showLoading()
    var nowtime = new Date().getTime();
    var sign = app.createMD5('modifyOrderPrice', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/modifyOrderPrice',
      data: {
        orderNum: that.data.seatOrder.orderNum,
        appUserId: app.globalData.userInfo.id,
        merchandiseInfo: json,
        seatTicketId: id,
        merTicketId: that.data.merTicketId,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        wx.hideLoading();
        if (res.data.status == 0) {
          wx.showToast({
            title: '锁座失败',
          })
        } else if (res.data.status == 1) { //修改成功

          var seatOrder = that.data.seatOrder;
          seatOrder.merOrder = res.data.data.merOrder;
          seatOrder.waitActivity = res.data.data.waitActivity;
          seatOrder.disPrice = res.data.data.disPrice;
          seatOrder.price = res.data.data.price;
          seatOrder.order = res.data.data.order;
          that.setData({
            seatOrder: seatOrder,
            seatCoupon: seatOrder.order.seatTicket,
            foodCoupon: seatOrder.merOrder,
            foodCouponList: seatOrder.merOrder,
          })
          if (res.data.data.merOrder != null && res.data.data.merOrder.merTicket != null) {
            that.setData({
              merTicketId: res.data.data.merOrder.merTicket.id
            })
          }
          if (res.data.data.orderActivity != null) {
            that.setData({
              marActivity: res.data.data.orderActivity
            })
          }

        }

      }
    })
  },
  choosePay: function() {
    this.setData({
      showPay: true
    })
  },
  close: function() {
    this.setData({
      showPay: false
    })
  },
  wxPay: function() {
    var that = this;
    if (that.data.canClick != 1) {
      return;
    }
    that.setData({
      canClick: 0
    }) //防止多次点击
    if (that.data.phone.length != 11) {
      wx.showToast({
        title: '手机格式不正确',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
      return;
    }
    var json = [];
    for (var i = 0; i < that.data.seatOrder.comboList.length; i++) {
      var row = {};
      row.id = that.data.seatOrder.comboList[i].id;
      row.number = that.data.seatOrder.comboList[i].buyNum;
      if (row.number > 0) {
        json.push(row)
      }
    }
    if (json.length == 0) {
      json = ""
    } else {
      json = JSON.stringify(json);
    }
    var marActivityId = "";
    if (that.data.marActivity != null) {
      marActivityId = that.data.marActivity.id;
    }
    var seatCouponId = "";
    if (that.data.seatCoupon != null) {
      seatCouponId = that.data.seatCoupon.id
    }
    var nowtime = new Date().getTime();
    var sign = app.createMD5('confirmTotalOrder', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/confirmTotalOrder',
      data: {
        phone: that.data.phone,
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.seatOrder.orderNum,
        merchandiseInfo: json,
        seatTicketId: seatCouponId,
        merTicketId: that.data.merTicketId,
        activityId: marActivityId, //参与的活动的id
        memo: that.data.userMessage,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        var ordernum = res.data.data.orderNum;
        var nowtime = new Date().getTime();
        var sign = app.createMD5('minipay', nowtime);
        wx.request({
          url: app.globalData.url + '/api/shOrder/minipay',
          data: {
            appUserId: app.globalData.userInfo.id,
            orderNum: ordernum,
            timeStamp: nowtime,
            mac: sign
          },
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function(res) {
            // console.log(res)
            // return;
            wx.requestPayment({
              timeStamp: res.data.data.timeStamp,
              nonceStr: res.data.data.nonceStr,
              package: res.data.data.package,
              signType: res.data.data.signType,
              paySign: res.data.data.paySign,
              success: function(res) {
                that.setData({
                  canClick: 1
                }) //防止多次点击
                that.setData({
                  showPay: false
                })
                wx.showToast({
                  title: '支付成功',
                  mask: true,
                  duration: 2000
                })
                setTimeout(function() {
                  wx.redirectTo({
                    url: '../success/success?orderNum=' + ordernum,
                  })
                }, 1000)
              },
              fail: function(res) {
                // console.log(res)
                wx.showToast({
                  title: '支付失败',
                  mask: true,
                  duration: 2000
                })
                setTimeout(function() {
                  wx.redirectTo({
                    url: '../waitPay/waitPay?orderNum=' + ordernum,
                  })
                }, 1000)
              }
            })
          }
        })
      }
    })
  },
  leftTime: function() {
    var that = this;
    var timer = setInterval(function() {
      var nowTime = parseInt(new Date().getTime() / 1000);
      var leftTime = that.data.seatOrder.order.orderExpireSecond - nowTime;
      var str = "";
      var minute = parseInt(leftTime / 60);
      var second = parseInt(leftTime % 60);
      if (minute == 0 && second < 1) {
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
      str = minute + ":" + second;

      that.setData({
        endTime: str
      })
    }, 1000)
  },
  cardPay: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('cardPay', nowtime);
    var pageNo = that.data.pageNo;
    if (that.data.canClick != 1) {
      return;
    }
    that.setData({
      canClick: 0
    }) //防止多次点击
    if (that.data.phone.length != 11) {
      wx.showToast({
        title: '手机格式不正确',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
      return;
    }

  },
  pay2: function() {
    var that = this;
    if (that.data.canClick != 1) {
      return;
    }
    // that.setData({
    //   canClick: 0
    // })//防止多次点击
    if (that.data.phone.length != 11) {
      wx.showToast({
        title: '手机格式不正确',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
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
    var json = [];
    for (var i = 0; i < that.data.seatOrder.comboList.length; i++) {
      var row = {};
      row.id = that.data.seatOrder.comboList[i].id;
      row.number = that.data.seatOrder.comboList[i].buyNum;
      if (row.number > 0) {
        json.push(row)
      }
    }
    if (json.length == 0) {
      json = ""
    } else {
      json = JSON.stringify(json);
    }
    var marActivityId = "";
    if (that.data.marActivity != null) {
      marActivityId = that.data.marActivity.id;
    }
    var seatCouponId = "";
    if (that.data.seatCoupon != null) {
      marActivityId = that.data.seatCoupon.id
    }
    wx.showLoading({
      title: '支付中',
    })
    var nowtime = new Date().getTime();
    var sign = app.createMD5('confirmTotalOrder', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/confirmTotalOrder',
      data: {
        phone: that.data.phone,
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.seatOrder.orderNum,
        merchandiseInfo: json,
        seatTicketId: seatCouponId,
        merTicketId: that.data.merTicketId,
        activityId: marActivityId, //参与的活动的id
        memo: that.data.userMessage,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        var ordernum = res.data.data.orderNum;
        var nowtime = new Date().getTime();
        var sign = app.createMD5('cardPay', nowtime);
        wx.request({
          url: app.globalData.url + '/api/shOrder/cardPay',
          data: {
            appUserId: app.globalData.userInfo.id,
            orderNum: that.data.seatOrder.orderNum,
            password: that.data.password,
            timeStamp: nowtime,
            mac: sign
          },
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function(res) {
            // console.log(res)
            that.setData({
              canClick: 1
            }) //解開點擊
            wx.hideLoading()
            if (res.data.status == 0) {
              if (res.data.code == "not_enough_balance") {
                wx.showModal({
                  title: '',
                  content: res.data.message,
                  success: function(res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: '../mycard/mycard',
                      })
                    } else if (res.cancel) {
                      wx.redirectTo({
                        url: '../waitPay/waitPay?orderNum=' + ordernum,
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
              setTimeout(function() {
                wx.redirectTo({
                  url: '../success/success?orderNum=' + that.data.seatOrder.orderNum,
                })
              }, 1000)
            }
          }
        })
      }
    })
  },
  syn: function() {
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
      success: function(res) {
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
  changePhone: function(e) {
    var phone = e.detail.value;
    this.setData({
      phone: phone
    })
  },
  setM: function(e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },
  showM: function() {
    if (app.globalData.userInfo.dxInsiderInfo == null) {
      wx.showModal({
        title: '支付失败',
        content: "您还没有会员卡，是否前去绑定/开卡？",
        success: function(res) {
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
  closeM: function() {
    this.setData({
      showM: false
    })
  },
  setType1: function() {
    this.setData({
      chooseType: 1
    })
  },
  setType2: function() {
    this.setData({
      chooseType: 2
    })
  },
  setSeatCoupon: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    if (type == 2) {
      var nowtime = new Date().getTime();
      var sign = app.createMD5('verficationCxTicket', nowtime);
      wx.showLoading({
        mask: true
      })
      wx.request({
        url: app.globalData.url + '/api/shOrder/verficationCxTicket',
        data: {
          appUserId: app.globalData.userInfo.id,
          orderNum: that.data.seatOrder.orderNum,
          seatTicketId: id,
          timeStamp: nowtime,
          mac: sign
        },
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function(res) {
          wx.hideLoading();
          if(res.data.status == 1){
            for (var i = 0; i < that.data.seatCouponList.length; i++) {
              if (that.data.seatCouponList[i].id == id) {
                that.setData({
                  seatCoupon: that.data.seatCouponList[i]
                })
              }
            }
            that.calculate();
          }else{
            wx.showModal({
              title: '用券失败',
              content: res.data.message,
            })
          }
        }
      })
    } else {
      // seatCoupon
      for (var i = 0; i < that.data.seatCouponList.length; i++) {
        if (that.data.seatCouponList[i].id == id) {
          that.setData({
            seatCoupon: that.data.seatCouponList[i]
          })
        }
      }
      that.calculate();
    }

  },
  setFoodCoupon: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.setData({
      merTicketId: id
    })
    that.calculate();
  },
  closeChoose: function() {
    this.setData({
      chooseType: 0
    })
  },
  messageshow: function() {
    this.setData({
      messageshow: true
    })
  },
  closeMessageshow: function() {
    this.setData({
      messageshow: false
    })
  },
  setMessage: function(e) {
    var userMessage = e.detail.value;
    this.setData({
      userMessage: userMessage
    })
  },
  zero: function() {
    var that = this;
    if (that.data.canClick != 1) {
      return;
    }
    // that.setData({
    //   canClick: 0
    // })//防止多次点击
    if (that.data.phone.length != 11) {
      wx.showToast({
        title: '手机格式不正确',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
      return;
    }
    var json = [];
    for (var i = 0; i < that.data.seatOrder.comboList.length; i++) {
      var row = {};
      row.id = that.data.seatOrder.comboList[i].id;
      row.number = that.data.seatOrder.comboList[i].buyNum;
      if (row.number > 0) {
        json.push(row)
      }
    }
    if (json.length == 0) {
      json = ""
    } else {
      json = JSON.stringify(json);
    }
    var marActivityId = "";
    if (that.data.marActivity != null) {
      marActivityId = that.data.marActivity.id;
    }
    var seatCouponId = "";
    if (that.data.seatCoupon != null) {
      seatCouponId = that.data.seatCoupon.id
    }
    var nowtime = new Date().getTime();
    var sign = app.createMD5('confirmTotalOrder', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/confirmTotalOrder',
      data: {
        phone: that.data.phone,
        appUserId: app.globalData.userInfo.id,
        orderNum: that.data.seatOrder.orderNum,
        merchandiseInfo: json,
        seatTicketId: seatCouponId,
        merTicketId: that.data.merTicketId,
        activityId: marActivityId, //参与的活动的id
        memo: that.data.userMessage,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if (res.data.status == 0) {
          wx.showModal({
            title: '购票失败',
            content: res.data.message,
          })
          return;
        }
        var ordernum = res.data.data.orderNum;
        wx.showToast({
          title: '支付成功',
          mask: true,
          duration: 2000
        })
        setTimeout(function() {
          wx.redirectTo({
            url: '../success/success?orderNum=' + ordernum,
          })
        }, 1000)
      }
    })
  }
})