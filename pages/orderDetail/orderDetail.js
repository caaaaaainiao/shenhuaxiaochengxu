// pages/orderDetail/orderDetail.js
//获取应用实例
const app = getApp();
const QRCode = require('../../utils/weapp-qrcode.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formids : '',
    orderNum: 0,
    order: null,
    retreat: false,
    printNo: null,
    realAmount: 0,
    height: 0,
    seat: null,
    verifyCode: null,
    cinemaCode: null,
    oldPrintNo: null,
    orderPayType: null, // 支付类型(1微信2会员卡 限辰星)
    refundFee: null, // 退票手续费
    overRefundTime: null, // 距离开场前可退票时间(分钟)
    showTime: null, // 开场时间
    seatBol : false ,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight
        })
      }
    })
    that.setData({
      orderNum:options.orderNum,
      refundFee: app.globalData.cinemaList.refundFee,
      overRefundTime: app.globalData.cinemaList.overRefundTime,
      // verifyCode: options.verifyCode,
    });
    let data = {
      UserName: app.usermessage.Username,
      Password: app.usermessage.Password,
      CinemaCode: app.globalData.cinemaList.cinemaCode,
      OrderCode: that.data.orderNum,
    };
    wx.request({
      url: app.globalData.url + '/Api/Order/QueryTicketOrder' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OrderCode,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == 'Success') {
          let order = res.data.data;
          let realAmount = Math.floor(res.data.data.realAmount * 100) / 100;
          let seat = res.data.data.seat;
          let cinemaCode = res.data.data.cinemaCode;
          let verifyCode = res.data.data.verifyCode;
          let showTime = res.data.data.showTime;
          let ticketCollectionUrl = res.data.data.ewmPicture;
          that.setData({
            order: order,
            realAmount: realAmount,
            seat: seat,
            cinemaCode: cinemaCode,
            verifyCode: verifyCode,
            // orderPayType: orderPayType, // 支付类型
            showTime: showTime,
            ticketCollectionUrl: ticketCollectionUrl,
          })
          // if (app.globalData.cinemaList.cinemaType == "辰星") {
          //   let printNo = that.data.order.printNo.slice(8);
          //   that.setData({
          //     oldPrintNo: that.data.order.printNo, //退票码
          //     printNo: printNo, // 取票码
          //   })
          // }
          // else {
            that.setData({
              printNo: that.data.order.printNo,
            })
          // }
        }
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('orderDetail', nowtime);
  },
  phone:function(e){
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
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },

  // 退票
  refund:function(){
    var that = this
    if (this.data.seatBol){
      that.setData({
        seatBol: false
      })
      wx.showLoading({
        title: '加载中',
      })
      var that = this;
      var nowtime = new Date().getTime();
      var sign = app.createMD5('refund', nowtime);
      let data = {
        UserName: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: that.data.cinemaCode,
        PrintNo: that.data.printNo,
        VerifyCode: that.data.verifyCode,
        OrderCode: that.data.orderNum,
      };
      wx.request({
        url: app.globalData.url + '/Api/Order/RefundTicket' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OrderCode,
        method: "GET",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.hideTabBar() //隐藏栏
          console.log(res)
          that.setData({
            retreat: false,
          })
          if (res.data.Status == "Success") {
            wx.request({
              url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + app.usermessage.access_token,
              data: {
                "touser": app.globalData.openId,
                "template_id": "-T44MoRBctur8xHCZoB169XjI3hbIit1rvPrVOgKnpE",
                "form_id": that.data.formids,
                "data": {
                  "keyword1": {
                    "value": that.data.order.cinemaName + that.data.order.screenName
                  },
                  "keyword2": {
                    "value": that.data.order.printNo
                  },
                  "keyword3": {
                    "value": that.data.order.filmName
                  },
                  "keyword4": {
                    "value": that.data.showTime
                  },
                  "keyword5": {
                    "value": that.data.seat
                  },
                  "keyword6": {
                    "value": that.data.realAmount
                  }
                }
              },
              method: "POST",
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res)
                // app.usermessage.access_token = res.data.access_token
              }
            })
            wx.showToast({
              title: '退票成功',
            })
            setTimeout(function () {
              wx.navigateTo({
                url: '../myticket/myticket',
              })
            }, 2000)
          }
          else {
            wx.showToast({
              title: '退票失败',
              icon: 'none',
            })
          }
        }
      })
    }
  },
  cancel:function(){
    this.setData({
      retreat:false
    })
  },
  formSubmit: function (e) {
    this.setData({
      formids: e.detail.formId
    })
    console.log(e.detail.formId)
  },
  refundbtn:function(){
    this.setData({
      retreat: true,
      seatBol : true
    })
  },
  syn: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userCard', nowtime);
    wx.showLoading({
      title: '同步中',
    })
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
        wx.hideLoading();
        if (res.data.status == 1) {
          var userInfo = res.data.data;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo;
          setTimeout(function () {
            wx.switchTab({
              url: '../mine/mine',
            })
          }, 2000)
        } else {
          wx.showModal({
            title: '',
            content: res.data.message
          })
        }
      }
    })
  },
})