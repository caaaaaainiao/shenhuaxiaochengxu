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
    orderPayType: null, // 支付类型(1微信2会员卡 限辰星)
    refundFee: null, // 退票手续费
    overRefundTime: null, // 距离开场前可退票时间(分钟)
    showTime: null, // 开场时间
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
          that.setData({
            order: order,
            realAmount: realAmount,
            seat: seat,
            cinemaCode: cinemaCode,
            verifyCode: verifyCode,
            // orderPayType: orderPayType, // 支付类型
            showTime: showTime,
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
      CinemaCode: that.data.cinemaCode,
      PrintNo: that.data.printNo,
      VerifyCode: that.data.verifyCode,
    };
    if (app.globalData.cinemaList.cinemaType == "辰星") {
       data.PrintNo = that.data.oldPrintNo;
    }
    wx.request({
      url: app.globalData.url + '/Api/Order/RefundTicket' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.PrintNo + '/' + data.VerifyCode,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        that.setData({
          retreat:false,
        })
        if (res.data.Status == "Success") {
          wx.showToast({
            title: '退票成功',
          })
        }
        else {
          wx.showToast({
            title: '退票失败,已经退过该票或订单重复！',
            icon: 'none',
          })
        }
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
    let that = this;
    let reg = new RegExp("-", "g");
    let Reg = new RegExp(":", "g");
    // 获取当前时间
    let date = new Date();
    let seperator1 = "-";
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    let hour = date.getHours();
    let mimute = date.getMinutes();
    let second = date.getSeconds();
    let min = hour * 60 + mimute; // 当前分钟
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    let showTime = that.data.showTime.substring(0, 10).replace(reg, ''); // 影片日期
    let nowTime = currentdate.replace(reg, ''); // 当前日期
    let start = that.data.showTime.slice(11).substring(0, 5);
    let Min = Number(start.substring(0, 2) * 60) + Number(start.substring(3)); // 影片开始分钟
    let refundTime = Number(that.data.overRefundTime) + Number(min); // 当前时间加上退票时间与影片开场时间作比较
    if (that.data.overRefundTime == '0') {
      that.setData({
        retreat: true
      })
    } else {
      if (showTime != nowTime) {
        let day = showTime - nowTime;
        if (day == '0') {
          // 判断时分秒
          if (refundTime < Min) { //小于开场时间允许退票
            that.setData({
              retreat: true
            })
          } else { // 大于或等于都不准退票
            wx.showToast({
              title: '退票失败,超过可退票时间',
            })
          }
        } else if (day < '0') {
          // 当前时间已经超过开场时间  不允许退票
          wx.showToast({
            title: '退票失败,超过可退票时间',
          })
        } else if (day > '0') {
          // 当前时间在开场时间日期之前  允许退票
          that.setData({
            retreat: true
          })
        }
      }
    }
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