// pages/orderDetail/orderDetail.js
//获取应用实例
const app = getApp();
const QRCode = require('../../utils/weapp-qrcode.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
      verifyCode: options.verifyCode,
    });
    let data = {
      UserName: app.usermessage.Username,
      Password: app.usermessage.Password,
      CinemaCode: app.globalData.cinemaList.cinemaCode,
      OrderCode: that.data.orderNum,
    };
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Order/QueryTicketOrder' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OrderCode,
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
          // let verifyCode = res.data.data.verifyCode;
          that.setData({
            order: order,
            realAmount: realAmount,
            seat: seat,
            cinemaCode: cinemaCode,
            // verifyCode: verifyCode,
          })
          if (app.globalData.cinemaList.cinemaType == "辰星") {
            let printNo = that.data.order.printNo.slice(8);
            that.setData({
              oldPrintNo: that.data.order.printNo, //退票码
              printNo: printNo, // 取票码
            })
          }
          else {
            that.setData({
              printNo: that.data.order.printNo,
            })
          }
          // 生成二维码
          var qrcode = new QRCode('canvas', {
            text: that.data.printNo,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
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
      title: '神画电影',
      path: '/pages/index/index'
    }
  },

  // 退票
  refund:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('refund', nowtime);
    let data = {
      UserName: app.usermessage.Username,
      Password: app.usermessage.Password,
      CinemaCode: app.globalData.cinemaCode,
      PrintNo: that.data.printNo,
      VerifyCode: that.data.verifyCode,
    };
    if (app.globalData.cinemaList.cinemaType == "辰星") {
       data.PrintNo = that.data.oldPrintNo;
    }
    console.log(data);
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Order/RefundTicket' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.PrintNo + '/' + data.VerifyCode,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
      }
    })
    // wx.request({
    //   url: app.globalData.url + '/api/shOrder/refund',
    //   data: {
    //     id:that.data.order.id,
    //     orderNum: that.data.orderNum,
    //     appUserId: app.globalData.userInfo.id,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     // console.log(res)
    //     that.setData({
    //       retreat:false
    //     })
    //     if(res.data.status == 1){
    //       that.setData({
    //         order: res.data.data
    //       })
    //       wx.showToast({
    //         title: '退票成功',
    //       })
    //       that.syn();
         
    //     }else{
    //       wx.showModal({
    //         title: '退款失败',
    //         content: res.data.message,
    //       })
    //     }
    //     wx.hideLoading();
    //   }
    // })
  },
  cancel:function(){
    this.setData({
      retreat:false
    })
  },
  refundbtn:function(){
    this.setData({
      retreat: true
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