// pages/orderForm/orderForm.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPay: false,
    seatOrder: null,
    date: null,
    ticketName: '电影票优惠券',
    seatCoupon: 0,  // 电影票优惠券
    foodCoupon: 0, 
    seatCouponList: null, //电影票优惠券列表
    foodCouponList: null,
    foodPrice: 0,
    phone: '',
    // canClick: 1,
    marActivity: null, //参与活动id
    seatsJson: null,
    endTime: "",
    showM: false,
    password: "",
    merTicketId: "",
    seatTicketId: "",
    chooseType: 0,
    messageshow: false,
    userMessage: "",
    movieName: '',
    count: '',
    autoUnlockDatetime: '',
    comboList: null,
    refreshments: 0, // 小食价格
    allPrice: 0,
    orderCode: '', // 锁座订单号
    isShow: false,
    couponsCode: null,
    reductionPrice: null,
    beginTicket: 0,
    codeArr: [], // 第一张优惠券编码
    priceArr: [], // 第一张优惠券价格
    orderNum: null, // 订单号
    card: null, // 会员卡
    cardNo: null,
    levelCode: null,
    sessionCode: '',
    tradeNo: null, // 交易号
    deductAmount: 0, //支付金额
    printNo: null, // 出票号
    verifyCode: null, // 验证码
    // waitActivity: null,//可參與活動
    UrlMap: {
      goodsUrl: app.globalData.url + '/Api/Goods/QueryGoods/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
      conponsUrl: app.globalData.url + '/Api/Conpon/QueryUserConpons/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // 查询手机号
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.openId,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        // console.log(res)
        that.setData({
          phone: res.data.data.mobilePhone,
        })
      }
    })
    let time = util.formatTime(new Date());
    that.setData({
      orderCode: options.orderCode,
      date: options.date,
      movieName: options.title,
      count: options.count,
      cinemaName: app.globalData.moviearea,
      price: options.price, // 影票总价
      beginTicket: options.price,
      hallName: options.screenName,
      seat: options.seat,
      autoUnlockDatetime: options.autoUnlockDatetime,
      phone: that.data.phone,
      nowTime: time,
      sessionCode: options.sessionCode,
      seatCouponList: app.globalData.ticketCoupons, // 优惠券列表
    });
    if (that.data.seatCouponList.length > 0) { // 如果有优惠券
      that.data.priceArr.push(that.data.seatCouponList[0].price);
      that.data.codeArr.push(that.data.seatCouponList[0].couponsCode);
      that.setData({
        ticketRealPrice: parseInt(that.data.seatCouponList[0].reductionPrice), // 优惠券价格
        couponsCode: that.data.seatCouponList[0].couponsCode, // 优惠券编码
        reductionPrice: that.data.seatCouponList[0].reductionPrice, // 优惠券价格
      })
      let allPrice = Number(options.price) - Number(that.data.reductionPrice) + Number(that.data.refreshments);
      that.setData({
        allPrice: allPrice,
      })
    } else {
      let allPrice = Number(options.price) + Number(that.data.refreshments);
      that.setData({
        allPrice: allPrice,
      })
    }
    wx.request({
      url: app.globalData.url + '/Api/Goods/QueryComponents' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + options.count,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.Status == "Success") {
          // console.log(res)
          var comboList = res.data.data
          that.setData({
            comboList: comboList
          });
          that.manage();
        }
      }
    })
    // 获取会员卡信息
    util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function(res) {
      that.setData({
        card: res.data.data.memberCard,
      })
      // console.log(that.data.card)
    });
  },
  //传入数组以及要去重的对象
  arrayUnique2: function(arr, key) {
    var hash = {};
    return arr.reduce(function(item, next) {
      hash[next[key]] ? '' : hash[next[key]] = true && item.push(next);
      return item;
    }, []);
  },
  // 排序
  sortFun: function(attr, rev) {
    if (rev == undefined) {
      rev = 1;
    } else {
      rev = (rev) ? 1 : -1;
    }

    return function(a, b) {
      a = a[attr];
      b = b[attr];
      // 改变>和<可以进行升序降序
      if (parseInt(a) > parseInt(b)) {
        return rev * -1;
      }
      if (parseInt(a) < parseInt(b)) {
        return rev * 1;
      }
      return 0;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // console.log(app.globalData.seatOrder)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  leftTime: function() {
    var that = this;
    var timer = setInterval(function() {
      var nowTime = parseInt(new Date().getTime());
      var date = new Date(that.data.autoUnlockDatetime)
      var leftTime = parseInt((date - nowTime) / 1000);
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
      // console.log(str)
      that.setData({
        endTime: str
      })
    }, 1000)
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
    let that = this;
    let price = (that.data.allPrice) / (that.data.count);
    let xml = '<ReleaseSeat>' +
      '<CinemaCode>' + app.globalData.cinemacode + '</CinemaCode>' +
      '<Order>' +
      '<PayType>' + '0' + '</PayType>' +
      '<OrderCode>' + that.data.orderCode + '</OrderCode>' +
      '<SessionCode>' + that.data.sessionCode + '</SessionCode>' +
      '<Count>' + that.data.count + '</Count>';
    for (let i = 0; i < app.globalData.seat.length; i++) {
      let seatCode = app.globalData.seat[i].seatCode;
      xml += '<Seat>';
      xml += '<SeatCode>' + seatCode + '</SeatCode>';
      xml += '<Price>' + price + '</Price>';
      xml += '<Fee>' + app.globalData.moviesListDate.ticketFee + '</Fee>';
      xml += '</Seat>'
    }
    xml += '</Order>';
    xml += '</ReleaseSeat>'
    // 解锁座位
    wx.request({
      url: app.globalData.url + '/Api/Order/ReleaseSeat',
      data: {
        "userName": app.usermessage.Username,
        "password": app.usermessage.Password,
        "openID": app.globalData.userInfo.openID,
        "queryXml": xml,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        // console.log(res)
      }
    })
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
    if (that.data.comboList != null) {
      for (var i = 0; i < that.data.comboList.length; i++) {
        that.data.comboList[i].buyNum = 0;
      }
    }
    that.setData({
      comboList: that.data.comboList,
      price: that.data.price,
      allPrice: that.data.allPrice,
    })
    that.leftTime();
  },
  // 增加数量
  add: function(e) {
    var that = this;
    var comboList = that.data.comboList;
    var refreshments = that.data.refreshments;
    var allPrice = that.data.allPrice;
    var price = that.data.price;
    var id = e.currentTarget.dataset.id;
    for (let i = 0; i < comboList.length; i++) {
      if (comboList[i].packageCode == id) {
        comboList[i].buyNum += 1;
        // refreshments = (comboList[i].buyNum) * (comboList[i].packageSettlePrice)
      }
    }
    // console.log(refreshments)
    // allPrice = Number(refreshments) + Number(price)
    that.setData({
      comboList: comboList,
      // refreshments: refreshments,
      // allPrice: allPrice,
    })
    that.calculate();
    // console.log(that.data.comboList)
  },
  // 减少数量
  minus: function(e) {
    var that = this;
    var comboList = that.data.comboList;
    var refreshments = that.data.refreshments;
    var allPrice = that.data.allPrice;
    var price = that.data.price;
    var id = e.currentTarget.dataset.id;
    for (let i = 0; i < comboList.length; i++) {
      if (comboList[i].packageCode == id) {
        comboList[i].buyNum -= 1;
        // refreshments = (comboList[i].buyNum) * (comboList[i].packageSettlePrice)
        if (comboList[i].buyNum < 0) {
          comboList[i].buyNum = 0;
          // refreshments = 0;
        }
      }
    }
    // allPrice = Number(refreshments) + Number(price)
    that.setData({
      comboList: comboList,
      // refreshments: refreshments,
      // allPrice: allPrice,
    })
    that.calculate();
  },
  calculate: function() { //计算价格
    var that = this;
    var json = [];
    let refreshments = 0;
    for (var i = 0; i < that.data.comboList.length; i++) {
      if (that.data.comboList[i].buyNum > 0) {
        var row = {};
        row.packageSettlePrice = that.data.comboList[i].packageSettlePrice;
        row.number = that.data.comboList[i].buyNum;
        json.push(row)
      }
    }
    // console.log(that.data.comboList)
    console.log(json)
    if (json.length == 0) {
      that.setData({
        refreshments: 0,
        allPrice: that.data.price,
      })
    } else {
      for (let i = 0; i < json.length; i++) {
        refreshments += (json[i].number) * (json[i].packageSettlePrice)
      }
      that.setData({
        refreshments: refreshments,
        allPrice: refreshments + Number(that.data.price)
      })
    }
    // if (json.length == 0) {
    //   json = ""
    // } else {
    //   json = JSON.stringify(json)
    // }
    // var id = "";
    // if (that.data.seatCoupon) {
    //   id = that.data.seatCoupon.id
    // }
    // wx.showLoading()
  },
  choosePay: function() {
    let that = this;
    console.log(that.data);
    console.log(app.globalData);
    let data = {
      Username: app.usermessage.Username, //账号
      Password: app.usermessage.Password, // 密码
      CinemaCode: app.globalData.cinemacode, //影院编码
      LockOrderCode: that.data.orderCode, //锁座订单号(编码)
      LocalOrderCode: null, //卖品本地订单号
      CouponsCode: that.data.couponsCode, // 优惠券编码
      CardNo: that.data.cardNo, //会员卡号
      CardPassword: that.data.password, //会员卡密码
      PayAmount: that.data.allPrice, //影票支付金额
      GoodsPayAmount: 0, //卖品支付金额
      SessionCode: that.data.sessionCode, //放映计划编码
      FilmCode: app.globalData.movieId, //影片编码
      TicketNum: that.data.count, //票数
      LevelCode: that.data.levelCode, //会员卡等级编码
      SessionTime: app.globalData.moviesListDate.sessionTime, //排期时间
      ScreenType: app.globalData.moviesListDate.screenType, //影厅类型
      ListingPrice: app.globalData.moviesListDate.listingPrice, //挂牌价
      LowestPrice: app.globalData.moviesListDate.lowestPrice, //最低价
    };
    console.log(data)
    if (that.data.allPrice == '0' && app.globalData.cinemaList.cinemaType == '辰星') {
      // 查询订单
      wx.request({
        url: app.globalData.url + '/Api/Order/QueryLocalOrder' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res);
          if (res.data.Status == 'Success') {
            let order = res.data.data;
            let xml = '<SubmitOrder>' +
              '<CinemaCode>' + order.cinemaCode + '</CinemaCode>' +
              '<Order>' +
              '<PaySeqNo></PaySeqNo>' +
              '<OrderCode>' + order.lockOrderCode + '</OrderCode>' +
              '<SessionCode>' + order.sessionCode + '</SessionCode>' +
              '<Count>' + order.ticketCount + '</Count>' +
              '<MobilePhone>' + that.data.phone + '</MobilePhone>';
            for (let i = 0; i < order.seats.length; i++) {
              let seatCode = order.seats[i].seatCode;
              let realprice = order.seats[i].salePrice;
              let price = order.seats[i].price;
              let fee = order.seats[i].fee;
              xml += '<Seat>';
              xml += '<SeatCode>' + seatCode + '</SeatCode>';
              xml += '<Price>' + price + '</Price>';
              xml += '<RealPrice>' + realprice + '</RealPrice>';
              xml += '<Fee>' + fee + '</Fee>';
              xml += '</Seat>';
            };
            xml += '</Order>';
            xml += '</SubmitOrder>';
            // 提交订单
            console.log(xml)
            wx.request({
              url: app.globalData.url + '/Api/Order/SubmitOrder',
              data: {
                userName: data.Username,
                password: data.Password,
                openID: order.openID,
                queryXml: xml,
              },
              method: "POST",
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res)
                if (res.data.Status == "Success") {
                  wx.showToast({
                    title: '支付成功',
                    mask: true,
                    duration: 2000
                  });
                  that.setData({
                    orderNum: res.data.order.orderCode, // 订单号
                    printNo: res.data.order.printNo, // 出票号
                    verifyCode: res.data.order.verifyCode, // 验证码
                  })
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '../success/success?orderNum=' + that.data.orderNum + '&&movieName=' + that.data.movieName + '&&count=' + that.data.count + '&&printNo=' + that.data.printNo + '&&verifyCode=' + that.data.verifyCode + '&&date=' + that.data.date + '&&seat=' + that.data.seat + '&&nowTime=' + that.data.nowTime,
                    })
                  }, 1000)
                } else if (res.data.Status == "Failure"){
                  wx.showToast({
                    title: res.data.ErrorMessage,
                    duration: 2000
                  });
                }
              }
            })
          }
        }
      })
    } else {
      that.setData({
        showPay: true
      })
    }
  },
  close: function() {
    this.setData({
      showPay: false
    })
  },
  wxPay: function() {
    var that = this;
    // if (that.data.canClick != 1) {
    //   return;
    // }
    // that.setData({
    //   canClick: 0
    // }) //防止多次点击
    if (!that.data.phone || that.data.phone.length != 11) {
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
    // console.log(that.data)
    let list = app.globalData.seat;
    let couponsCode = that.data.codeArr;
    let reductionPrice = that.data.priceArr;
    for (let i = 0; i < list.length; i++) {
      let seatCode = list[i].seatCode;
      json.push({
        "seatCode": seatCode,
        "couponsCode": couponsCode[i],
        "reductionPrice": reductionPrice[i]
      })
    }
    for (let i = 0; i < json.length; i++) {
      if (json[i].couponsCode == undefined) {
        json[i].couponsCode = ""
      }
      if (json[i].reductionPrice == undefined) {
        json[i].reductionPrice = ""
      }
    }
    // 预支付
    wx.request({
      url: app.globalData.url + '/Api/Order/PrePayOrder',
      data: {
        "userName": app.usermessage.Username,
        "password": app.usermessage.Password,
        "cinemaCode": app.globalData.cinemacode,
        "orderCode": that.data.orderCode,
        "seats": json
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res);
        if (res.data.Status == "Success") {
          let timeStamp = res.data.data.timeStamp;
          let nonceStr = res.data.data.nonceStr;
          let packages = res.data.data.packages;
          let signType = res.data.data.signType;
          let paySign = res.data.data.paySign;
          let data = {
            UserName: app.usermessage.Username,
            Password: app.usermessage.Password,
            CinemaCode: app.globalData.cinemacode,
            OrderCode: that.data.orderCode,
          };
          // 查询本地订单
          wx.request({
            url: app.globalData.url + '/Api/Order/QueryLocalOrder' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OrderCode,
            method: 'GET',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function(res) {
              console.log(res)
              // 微信支付
              if (res.data.Status == "Success") {
                let order = res.data.data;
                wx.requestPayment({
                  timeStamp: timeStamp,
                  nonceStr: nonceStr,
                  package: packages,
                  signType: signType,
                  paySign: paySign,
                  success(res) {
                    console.log(res);
                    if (res.errMsg == "requestPayment:ok") {
                      let xml = '<SubmitOrder>' +
                        '<CinemaCode>' + order.cinemaCode + '</CinemaCode>' +
                        '<Order>' +
                        '<PaySeqNo></PaySeqNo>' +
                        '<OrderCode>' + order.lockOrderCode + '</OrderCode>' +
                        '<SessionCode>' + order.sessionCode + '</SessionCode>' +
                        '<Count>' + order.ticketCount + '</Count>' +
                        '<MobilePhone>' + that.data.phone + '</MobilePhone>';
                      for (let i = 0; i < order.seats.length; i++) {
                        let seatCode = order.seats[i].seatCode;
                        let realprice = order.seats[i].salePrice;
                        let price = order.seats[i].price;
                        let fee = order.seats[i].fee;
                        xml += '<Seat>';
                        xml += '<SeatCode>' + seatCode + '</SeatCode>';
                        xml += '<Price>' + price + '</Price>';
                        xml += '<RealPrice>' + realprice + '</RealPrice>';
                        xml += '<Fee>' + fee + '</Fee>';
                        xml += '</Seat>';
                      };
                      xml += '</Order>';
                      xml += '</SubmitOrder>';
                      // 提交订单   
                      wx.request({
                        url: app.globalData.url + '/Api/Order/SubmitOrder',
                        data: {
                          userName: data.UserName,
                          password: data.Password,
                          openID: order.openID,
                          queryXml: xml,
                        },
                        method: "POST",
                        header: {
                          'content-type': 'application/json' // 默认值
                        },
                        success: function(res) {
                          console.log(res)
                          if (res.data.Status == "Success") {
                            wx.showToast({
                              title: '支付成功',
                              mask: true,
                              duration: 2000
                            });
                            that.setData({
                              orderNum: res.data.order.orderCode, // 订单号
                              printNo: res.data.order.printNo, // 出票号
                              verifyCode: res.data.order.verifyCode, // 验证码
                            })
                            setTimeout(function() {
                              wx.redirectTo({
                                url: '../success/success?orderNum=' + that.data.orderNum + '&&movieName=' + that.data.movieName + '&&count=' + that.data.count + '&&printNo=' + that.data.printNo + '&&verifyCode=' + that.data.verifyCode + '&&date=' + that.data.date + '&&seat=' + that.data.seat + '&&nowTime=' + that.data.nowTime,
                              })
                            }, 1000)
                          } else { // 确认订单失败
                            // 自动退款
                            wx.request({
                              url: app.globalData.url + '/Api/Order/RefundPayment' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OrderCode,
                              method: "GET",
                              header: {
                                'content-type': 'application/json' // 默认值
                              },
                              success: function (res) {
                                console.log(res)
                                wx.showToast({
                                  title: '交易失败,已自动退款',
                                  icon: 'none',
                                  duration: 2000,
                                })
                              }
                            })
                          }
                        }
                      })
                    }
                  },
                  fail(res) {
                    console.log(res);
                  }
                })
              } else {
                wx.showModal({
                  title: '查询订单失败',
                  content: res.data.ErrorMessage,
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: "遇到点小问题",
            icon: 'none',
            duration: 3000
          });
        }
      }
    })
  },
  // 会员卡支付
  cardPay: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('cardPay', nowtime);
    var pageNo = that.data.pageNo;
    // if (that.data.canClick != 1) {
    //   return;
    // }
    // that.setData({
    //   canClick: 0
    // }) //防止多次点击
    if (!that.data.phone || that.data.phone.length != 11) {
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
    // if (that.data.canClick != 1) {
    //   return;
    // }
    // that.setData({
    //   canClick: 0
    // })//防止多次点击
    if (!that.data.phone || that.data.phone.length != 11) {
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
    // console.log(app.globalData)
    let data = {
      Username: app.usermessage.Username, //账号
      Password: app.usermessage.Password, // 密码
      CinemaCode: app.globalData.cinemacode, //影院编码
      LockOrderCode: that.data.orderCode, //锁座订单号(编码)
      LocalOrderCode: null, //卖品本地订单号
      CouponsCode: that.data.couponsCode, // 优惠券编码
      CardNo: that.data.cardNo, //会员卡号
      CardPassword: that.data.password, //会员卡密码
      PayAmount: that.data.allPrice, //影票支付金额
      GoodsPayAmount: 0, //卖品支付金额
      SessionCode: that.data.sessionCode, //放映计划编码
      FilmCode: app.globalData.movieId, //影片编码
      TicketNum: that.data.count, //票数
      LevelCode: that.data.levelCode, //会员卡等级编码
      SessionTime: app.globalData.moviesListDate.sessionTime, //排期时间
      ScreenType: app.globalData.moviesListDate.screenType, //影厅类型
      ListingPrice: app.globalData.moviesListDate.listingPrice, //挂牌价
      LowestPrice: app.globalData.moviesListDate.lowestPrice, //最低价
      MobilePhone: that.data.phone, // 手机号
    };
    // console.log(data)
    // 查询本地订单
    wx.request({
      url: app.globalData.url + '/Api/Order/QueryLocalOrder' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        let order = res.data.data;
        if (res.data.Status == "Success") {
          // 会员卡折扣 判断售票系统
          if (app.globalData.cinemaList.cinemaType == "电影1905") { // 1905
            wx.request({
              url: app.globalData.url + '/Api/Member/QueryDiscount' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.LevelCode + '/' + data.ScreenType + '/' + data.LockOrderCode,
              method: 'GET',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function(res) {
                console.log(res)
                if (res.data.Status == "Success") {
                  let price = res.data.card.price;
                  // 1905系统会员卡支付
                  wx.request({
                    url: app.globalData.url + '/Api/Member/SellTicketCustomMember' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.MobilePhone + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.CouponsCode,
                    method: 'GET',
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success: function(res) {
                      console.log(res)
                      if (res.data.Status == "Success") {
                        console.log(res)
                        wx.showToast({
                          title: '交易成功',
                          mask: true,
                          duration: 2000
                        });
                        that.setData({
                          orderNum: res.data.orderNo, // 订单号
                          printNo: res.data.printNo, // 出票号
                          verifyCode: res.data.verifyCode, // 验证码
                        })
                        setTimeout(function() {
                          wx.redirectTo({
                            url: '../success/success?orderNum=' + that.data.orderNum + '&&movieName=' + that.data.movieName + '&&count=' + that.data.count + '&&printNo=' + that.data.printNo + '&&verifyCode=' + that.data.verifyCode + '&&date=' + that.data.date + '&&seat=' + that.data.seat + '&&nowTime=' + that.data.nowTime,
                          })
                        }, 1000)
                      } else { //支付失败
                        wx.showToast({
                          title: "订单确认失败",
                          icon: 'none',
                          duration: 3000
                        });
                      }
                    }
                  })
                } else { // 折扣读取失败
                  wx.showToast({
                    title: res.data.ErrorMessage,
                    icon: 'none',
                    duration: 3000
                  });
                }
              }
            })
          } else { //辰星
            wx.request({
              url: app.globalData.url + '/Api/Member/QueryDiscount' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.LevelCode + '/' + data.ScreenType + '/' + data.LockOrderCode,
              method: 'GET',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function(res) {
                console.log(res)
                let price;
                if (res.data.card.price == '0') {
                  price = that.data.price;
                } else {
                  price = res.data.card.price;
                }
                console.log(data)
                if (res.data.Status == "Success") {
                  // 会员卡支付
                  wx.request({
                    url: app.globalData.url + '/Api/Member/CardPay' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.LocalOrderCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + price + '/' + data.GoodsPayAmount + '/' + data.SessionCode + '/' + data.FilmCode + '/' + data.TicketNum + '/' + data.CouponsCode,
                    method: 'GET',
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success: function (res) {
                      console.log(res)
                      if (res.data.Status == "Success") {
                        that.setData({
                          tradeNo: res.data.tradeNo,
                          deductAmount: res.data.deductAmount,
                        })
                        let xml = '<SubmitOrder>' +
                          '<CinemaCode>' + order.cinemaCode + '</CinemaCode>' +
                          '<Order>' +
                          '<PaySeqNo></PaySeqNo>' +
                          '<OrderCode>' + order.lockOrderCode + '</OrderCode>' +
                          '<SessionCode>' + order.sessionCode + '</SessionCode>' +
                          '<Count>' + order.ticketCount + '</Count>' +
                          '<MobilePhone>' + that.data.phone + '</MobilePhone>';
                        for (let i = 0; i < order.seats.length; i++) {
                          let seatCode = order.seats[i].seatCode;
                          let realprice = order.seats[i].salePrice;
                          let price = order.seats[i].price;
                          let fee = order.seats[i].fee;
                          xml += '<Seat>';
                          xml += '<SeatCode>' + seatCode + '</SeatCode>';
                          xml += '<Price>' + price + '</Price>';
                          xml += '<RealPrice>' + realprice + '</RealPrice>';
                          xml += '<Fee>' + fee + '</Fee>';
                          xml += '</Seat>';
                        };
                        xml += '</Order>';
                        xml += '</SubmitOrder>';
                        // 提交订单   
                        wx.request({
                          url: app.globalData.url + '/Api/Order/SubmitOrder',
                          data: {
                            userName: data.Username,
                            password: data.Password,
                            openID: order.openID,
                            queryXml: xml,
                          },
                          method: "POST",
                          header: {
                            'content-type': 'application/json' // 默认值
                          },
                          success: function (res) {
                            console.log(res)
                            if (res.data.Status == "Success") {
                              wx.showToast({
                                title: '支付成功',
                                mask: true,
                                duration: 2000
                              });
                              that.setData({
                                orderNum: res.data.order.orderCode, // 订单号
                                printNo: res.data.order.printNo, // 出票号
                                verifyCode: res.data.order.verifyCode, // 验证码(退票使用)
                              })
                              setTimeout(function () {
                                wx.redirectTo({
                                  url: '../success/success?orderNum=' + that.data.orderNum + '&&movieName=' + that.data.movieName + '&&count=' + that.data.count + '&&printNo=' + that.data.printNo + '&&verifyCode=' + that.data.verifyCode + '&&date=' + that.data.date + '&&seat=' + that.data.seat + '&&nowTime=' + that.data.nowTime,
                                })
                              }, 1000)
                            }
                            else { //订单确认失败
                                  // 自动退款
                                  wx.request({
                                    url: app.globalData.url + '/Api/Member/CardPayBack' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + that.data.tradeNo + '/' + that.data.deductAmount,
                                    method: "GET",
                                    header: {
                                      'content-type': 'application/json' // 默认值
                                    },
                                    success: function (res) {
                                      console.log(res)
                                      if (res.data.Status == "Success") {
                                        wx.showToast({
                                            title: '交易失败,已自动退款',
                                            icon: 'none',
                                            duration: 3000,
                                        })
                                      } 
                                      else {
                                        wx.showToast({
                                          title: '交易失败，联系工作人员退款',
                                          icon: 'none',
                                          duration: 3000,
                                        })
                                      }
                                    }
                                  })
                            }
                          }
                        })
                      }
                      else { //支付失败
                        wx.showToast({
                          title: res.data.ErrorMessage,
                          icon: 'none',
                          duration: 3000
                        });
                      }
                    }
                  })
                } else { // 折扣查询失败
                  wx.showToast({
                    title: res.data.ErrorMessage,
                    icon: 'none',
                    duration: 3000
                  });
                }
              }
            })
          }
        } else { //订单查询失败
          wx.showToast({
            title: res.data.ErrorMessage,
            icon: 'none',
            duration: 3000
          });
        }
      }
    })
    // var json = [];
    // for (var i = 0; i < that.data.comboList.length; i++) {
    //   var row = {};
    //   row.id = that.data.seatOrder.comboList[i].id;
    //   row.number = that.data.seatOrder.comboList[i].buyNum;
    //   if (row.number > 0) {
    //     json.push(row)
    //   }
    // }
    // if (json.length == 0) {
    //   json = ""
    // } else {
    //   json = JSON.stringify(json);
    // }
    // var marActivityId = "";
    // if (that.data.marActivity != null) {
    //   marActivityId = that.data.marActivity.id;
    // }
    // var seatCouponId = "";
    // if (that.data.seatCoupon != null) {
    //   marActivityId = that.data.seatCoupon.id
    // }
    // wx.showLoading({
    //   title: '支付中',
    // })
    // var nowtime = new Date().getTime();
    // var sign = app.createMD5('confirmTotalOrder', nowtime);
    // wx.request({
    //   url: app.globalData.url + '/api/shOrder/confirmTotalOrder',
    //   data: {
    //     phone: that.data.phone,
    //     appUserId: app.globalData.userInfo.id,
    //     orderNum: that.data.seatOrder.orderNum,
    //     merchandiseInfo: json,
    //     seatTicketId: seatCouponId,
    //     merTicketId: that.data.merTicketId,
    //     activityId: marActivityId, //参与的活动的id
    //     memo: that.data.userMessage,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function(res) {
    //     // console.log(res)
    //     var ordernum = res.data.data.orderNum;
    //     var nowtime = new Date().getTime();
    //     var sign = app.createMD5('cardPay', nowtime);
    //     wx.request({
    //       url: app.globalData.url + '/api/shOrder/cardPay',
    //       data: {
    //         appUserId: app.globalData.userInfo.id,
    //         orderNum: that.data.seatOrder.orderNum,
    //         password: that.data.password,
    //         timeStamp: nowtime,
    //         mac: sign
    //       },
    //       method: "POST",
    //       header: {
    //         "Content-Type": "application/x-www-form-urlencoded"
    //       },
    //       success: function(res) {
    //         // console.log(res)
    //         that.setData({
    //           canClick: 1
    //         }) //解開點擊
    //         wx.hideLoading()
    //         if (res.data.status == 0) {
    //           if (res.data.code == "not_enough_balance") {
    //             wx.showModal({
    //               title: '',
    //               content: res.data.message,
    //               success: function(res) {
    //                 if (res.confirm) {
    //                   wx.redirectTo({
    //                     url: '../page04/index',
    //                   })
    //                 } else if (res.cancel) {
    //                   wx.redirectTo({
    //                     url: '../waitPay/waitPay?orderNum=' + ordernum,
    //                   })
    //                 }
    //               }
    //             })
    //           } else {
    //             wx.showModal({
    //               title: '',
    //               content: res.data.message,
    //             })
    //           }
    //         } else if (res.data.status == 1) {
    //           that.setData({
    //             showPay: false
    //           })
    //           that.syn();
    //           wx.showToast({
    //             title: '支付成功',
    //             mask: true,
    //             duration: 2000
    //           })
    //           setTimeout(function() {
    //             wx.redirectTo({
    //               url: '../success/success?orderNum=' + that.data.seatOrder.orderNum,
    //             })
    //           }, 1000)
    //         }
    //       }
    //     })
    //   }
    // })
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
    let that = this;
    if (that.data.card == null) {
      wx.showModal({
        title: '支付失败',
        content: "您还没有会员卡，是否前去绑定/开卡？",
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../page04/index',
            })
          }
        }
      })
      return;
    } else {
      let card = that.data.card;
      // console.log(card)
      if (card.length > 1) {
        that.setData({
          isShow: true,
        });
      } else if (card.length == 1) {
        that.setData({
          showM: true,
          cardNo: card[0].cardNo,
          levelCode: card[0].levelCode,
        })
      }
    }
  },
  closeM: function() {
    this.setData({
      showM: false,
      isShow: false,
    })
  },
  // 选择会员卡号支付
  btnChoose: function(e) {
    let that = this;
    // console.log(e)
    let cardNo = e.currentTarget.dataset.cardno;
    let levelCode = e.currentTarget.dataset.levelcode;
    that.setData({
      cardNo: cardNo,
      levelCode: levelCode,
      showM: true,
      isShow: false,
    });
  },
  // 获取影票优惠券
  setType1: function() {
    this.setData({
      chooseType: 1
    });
  },
  setType2: function() {
    this.setData({
      chooseType: 2
    })
  },
  setSeatCoupon: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let priceArr = [];
    let codeArr = [];
    for (let i = 0; i < that.data.seatCouponList.length; i++) {
      if (that.data.seatCouponList[i].couponsCode == id) {
        that.setData({
          seatCoupon: that.data.seatCouponList[i]
        })
      }
    }
    console.log(that.data.seatCoupon)
    let price = that.data.price; // 影票总价
    let refreshments = that.data.refreshments; // 卖品总价
    let seatCouponPrice = that.data.seatCoupon.reductionPrice; // 优惠券金额
    if (that.data.seatCoupon.couonsType == '2') { // 兑换券
      seatCouponPrice = price;
      priceArr.push(seatCouponPrice);
      codeArr.push(that.data.seatCoupon.couponsCode);
      price = (that.data.beginTicket) - (seatCouponPrice);
      that.setData({
        conponCode: that.data.seatCoupon.couponsCode,
        reductionPrice: that.data.seatCoupon.reductionPrice,
        ticketRealPrice: (that.data.price) / (that.data.count),  /* 减免金额 */
        allPrice: price + refreshments,
        priceArr: priceArr,
        codeArr: codeArr,
      })
      that.setData({
        ticketName: '电影票兑换券'
      })
    } else { // 代金券
      priceArr.push(seatCouponPrice);
      codeArr.push(that.data.seatCoupon.couponsCode);
      price = (that.data.beginTicket) - (seatCouponPrice);
      that.setData({
        conponCode: that.data.seatCoupon.couponsCode,
        reductionPrice: that.data.seatCoupon.reductionPrice, // 优惠券价格
        ticketRealPrice: seatCouponPrice, // 减免金额
        // price: price,
        allPrice: price + refreshments,
        priceArr: priceArr,
        codeArr: codeArr,
      })
    };
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
    let that = this;
    that.setData({
      chooseType: 0
    })
    // console.log(that.data.reductionPrice);
    // console.log(that.data.conponCode)
  },
  messageshow: function() {
    this.setData({
      messageshow: true
    })
  },
  btnShowExchange2: function() {
    this.setData({
      isShow: !this.data.isShow
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
    // if (that.data.canClick != 1) {
    //   return;
    // }
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