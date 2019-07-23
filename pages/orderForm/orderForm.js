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
    formids: 0,
    seatCouponList: null, //电影票优惠券列表
    foodCouponList: null,
    foodPrice: 0,
    phone: '',
    timer: '',
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
    allPrice: 0, // 总价
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
    payway: null, //支付方式 2-会员卡，1-微信
    // waitActivity: null,//可參與活動
    UrlMap: {
      goodsUrl: app.globalData.url + '/Api/Goods/QueryGoods/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
      conponsUrl: app.globalData.url + '/Api/Conpon/QueryUserConpons/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 查询手机号
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.openId,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
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
      memberCardPrice: options.price, // 会员卡价格
      beginTicket: options.price,
      hallName: options.screenName,
      seat: options.seat,
      autoUnlockDatetime: options.autoUnlockDatetime,
      phone: that.data.phone,
      nowTime: time,
      sessionCode: options.sessionCode,
      seatCouponList: app.globalData.ticketCoupons, // 优惠券列表
    });
    // 获取会员卡信息
    setTimeout(function(){
      util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function (res) {
        if (res.data.Status == 'Success' && res.data.data.memberCard) { // 如果有会员卡
          wx.hideLoading();
          var first = res.data.data.memberCard.sort(function (a, b) { return a.balance < b.balance })[0];
          that.setData({
            card: first,
          })
          // 获取会员卡折扣
          if (first) {
              wx.request({
                url: app.globalData.url + '/Api/Member/QueryDiscount' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + first.cardNo + '/' + null + '/' + first.levelCode + '/' + app.globalData.moviesListDate.screenType + '/' + that.data.orderCode,
                method: 'GET',
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  console.log(res);
                  let reductionPrice = that.data.reductionPrice;
                  let refreshments = that.data.refreshments;
                  if (res.data.Status == 'Success') {
                    if (app.globalData.cinemaList.cinemaType == '辰星') {
                      let price;
                      if (res.data.card.price == '0') {
                        price = parseFloat(that.data.price).toFixed(2);
                      } else {
                        price = parseFloat(res.data.card.price * that.data.count).toFixed(2);
                      }
                      that.setData({
                        memberCardPrice: price,
                        // allPrice: parseFloat(price - reductionPrice + refreshments).toFixed(2),
                      })
                    } else if (app.globalData.cinemaList.cinemaType == '粤科') {
                      let price;
                      if (res.data.card.discountType == '1') {
                        price = parseFloat(res.data.card.price * that.data.count).toFixed(2);
                      }
                      if (!res.data.card.price) {
                        price = parseFloat(that.data.price).toFixed(2)
                      }
                      that.setData({
                        memberCardPrice: price,
                        // allPrice: parseFloat(price - reductionPrice + refreshments).toFixed(2),
                      })
                    } else if (app.globalData.cinemaList.cinemaType == '满天星' || app.globalData.cinemaList.cinemaType == '电影1905') {
                      let price;
                      if (res.data.card.price == '0') {
                        price = parseFloat(that.data.price).toFixed(2);
                      } else {
                        price = parseFloat(res.data.card.price * that.data.count).toFixed(2);
                      }
                      that.setData({
                        memberCardPrice: price,
                        // allPrice: parseFloat(price - reductionPrice + refreshments).toFixed(2),
                      })
                    } 
                  }
                }
              })
          }
        } else {
          wx.hideLoading();
        }
      });
    },500)
    that.leftTime();
  },
  //传入数组以及要去重的对象
  arrayUnique2: function (arr, key) {
    var hash = {};
    return arr.reduce(function (item, next) {
      hash[next[key]] ? '' : hash[next[key]] = true && item.push(next);
      return item;
    }, []);
  },
  // 排序
  sortFun: function (attr, rev) {
    if (rev == undefined) {
      rev = 1;
    } else {
      rev = (rev) ? 1 : -1;
    }

    return function (a, b) {
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
  onReady: function () {
    var that = this;
    // console.log(app.globalData.seatOrder)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    setTimeout(function () {
      util.getCardInfo(app.usermessage.Username, app.usermessage.Password, app.globalData.userInfo.openID, app.globalData.cinemacode, function (res) {
        if (res.data.Status == 'Success' && res.data.data.memberCard) { // 如果有会员卡
          var first = res.data.data.memberCard.sort(function (a, b) { return a.balance < b.balance })[0];
          that.setData({
            card: first,
          })
          // 获取会员卡折扣
          if (first) {
            wx.request({
              url: app.globalData.url + '/Api/Member/QueryDiscount' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + first.cardNo + '/' + null + '/' + first.levelCode + '/' + app.globalData.moviesListDate.screenType + '/' + that.data.orderCode,
              method: 'GET',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                console.log(res);
                let reductionPrice = that.data.reductionPrice;
                let refreshments = that.data.refreshments;
                if (res.data.Status == 'Success') {
                  if (app.globalData.cinemaList.cinemaType == '辰星') {
                    let price;
                    if (res.data.card.price == '0') {
                      price = parseFloat(that.data.price).toFixed(2);
                    } else {
                      price = parseFloat(res.data.card.price * that.data.count).toFixed(2);
                    }
                    that.setData({
                      memberCardPrice: price,
                      // allPrice: parseFloat(price - reductionPrice + refreshments).toFixed(2),
                    })
                  } else if (app.globalData.cinemaList.cinemaType == '粤科') {
                    let price;
                    if (res.data.card.discountType == '1') {
                      price = parseFloat(res.data.card.price * that.data.count).toFixed(2);
                    }
                    if (!res.data.card.price) {
                      price = parseFloat(that.data.price).toFixed(2)
                    }
                    that.setData({
                      memberCardPrice: price,
                      // allPrice: parseFloat(price - reductionPrice + refreshments).toFixed(2),
                    })
                  } else if (app.globalData.cinemaList.cinemaType == '满天星' || app.globalData.cinemaList.cinemaType == '电影1905') {
                    let price;
                    if (res.data.card.price == '0') {
                      price = parseFloat(that.data.price).toFixed(2);
                    } else {
                      price = parseFloat(res.data.card.price * that.data.count).toFixed(2);
                    }
                    that.setData({
                      memberCardPrice: price,
                      // allPrice: parseFloat(price - reductionPrice + refreshments).toFixed(2),
                    })
                  }
                }
              }
            })
          }
        }
      });
    }, 500)
  },
  leftTime: function () {
    var that = this;
    that.setData({
      timer: setInterval(function () {
        var nowTime = parseInt(new Date().getTime());
        var date = new Date(that.data.autoUnlockDatetime.replace(/-/g, '/')).getTime();
        var leftTime = parseInt((date - nowTime) / 1000);
        var str = "";
        var minute = parseInt(leftTime / 60);
        var second = parseInt(leftTime % 60);
        if (minute == 0 && second < 1) {
          clearInterval(that.data.timer)
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
    })

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
    clearInterval(this.data.timer)
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
      success: function (res) {
        // console.log(res)
      }
    })
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
  // 选择会员卡支付
  cardway: function () {
    let that = this;
    that.setData({
      payway: 2,
    });
    if (that.data.card == null) {
      wx.showModal({
        title: '',
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
    } else {
      let card = that.data.card;
      if (card) {
        that.setData({
          cardNo: card.cardNo,
          levelCode: card.levelCode,
        })
      }
    }
    // 获取优惠券
    wx.request({
      url: app.globalData.url + '/Api/Conpon/QueryUserAvailableCoupons/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.openId + '/' + 1 + '/' + that.data.payway + '/' + that.data.cardNo + '/' + that.data.orderCode,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == 'Success') {
          let seatCouponList = res.data.data.couponsList;
          that.setData({
            seatCouponList: seatCouponList,
          });
          if (seatCouponList && seatCouponList.length > 0) { // 如果有优惠券
            let merOrder = {  // 声明一个新的对象用来存放第一张优惠券一级优惠券列表
              merTicket: {
                counponId: seatCouponList[0].couponsCode,
                couponCode: seatCouponList[0].couponsCode,
                couponPrice: seatCouponList[0].reductionPrice
              },
              merTicketList: seatCouponList
            };
            if (!merOrder) {
              let merTicket = {
                counponId: null,
                couponCode: null,
                couponPrice: 0
              }
              merOrder = merTicket
              return merOrder
            }
            that.data.priceArr.push(merOrder.merTicket.couponPrice)
            that.data.codeArr.push(merOrder.merTicket.couponCode);
            that.setData({
              merOrder: merOrder, // 首张优惠券+优惠券列表
              ticketRealPrice: Number(merOrder.merTicket.couponPrice), // 优惠券价格
              couponsCode: merOrder.merTicket.couponCode, // 优惠券编码
              reductionPrice: merOrder.merTicket.couponPrice, // 优惠券价格
            })
            let allPrice = Number(that.data.memberCardPrice) - Number(merOrder.merTicket.couponPrice) + Number(that.data.refreshments);
            that.setData({
              allPrice: parseFloat(allPrice).toFixed(2),
            })
          } else {
            let allPrice = Number(that.data.memberCardPrice) + Number(that.data.refreshments);
            that.setData({
              allPrice: parseFloat(allPrice).toFixed(2),
            })
          }
        } else {
          let allPrice = Number(that.data.memberCardPrice) + Number(that.data.refreshments);
          that.setData({
            allPrice: parseFloat(allPrice).toFixed(2),
          })
        }
      }
    })
  },
  // 选择微信支付
  wxway: function () {
    let that = this;
    that.setData({
      payway: 1,
    });
    // 获取优惠券
    wx.request({
      url: app.globalData.url + '/Api/Conpon/QueryUserAvailableCoupons/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.openId + '/' + 1 + '/' + that.data.payway + '/' + null + '/' + that.data.orderCode,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == 'Success') {
          let seatCouponList = res.data.data.couponsList;
          that.setData({
            seatCouponList: seatCouponList,
          });
          if (seatCouponList && seatCouponList.length > 0) { // 如果有优惠券
            let merOrder = {  // 声明一个新的对象用来存放第一张优惠券一级优惠券列表
              merTicket: {
                counponId: seatCouponList[0].couponsCode,
                couponCode: seatCouponList[0].couponsCode,
                couponPrice: seatCouponList[0].reductionPrice
              },
              merTicketList: seatCouponList
            };
            if (!merOrder) {
              let merTicket = {
                counponId: null,
                couponCode: null,
                couponPrice: 0
              }
              merOrder = merTicket
              return merOrder
            }
            that.data.priceArr.push(merOrder.merTicket.couponPrice)
            that.data.codeArr.push(merOrder.merTicket.couponCode);
            that.setData({
              merOrder: merOrder, // 首张优惠券+优惠券列表
              ticketRealPrice: Number(merOrder.merTicket.couponPrice), // 优惠券价格
              couponsCode: merOrder.merTicket.couponCode, // 优惠券编码
              reductionPrice: merOrder.merTicket.couponPrice, // 优惠券价格
            })
            let allPrice = Number(that.data.price) - Number(merOrder.merTicket.couponPrice) + Number(that.data.refreshments);
            that.setData({
              allPrice: parseFloat(allPrice).toFixed(2),
            })
          } else {
            let allPrice = Number(that.data.price) + Number(that.data.refreshments);
            that.setData({
              allPrice: parseFloat(allPrice).toFixed(2),
            })
          }
        } else {
          let allPrice = Number(that.data.price) + Number(that.data.refreshments);
          that.setData({
            allPrice: parseFloat(allPrice).toFixed(2),
          })
        }
      }
    })
  },
  manage: function () {
    var that = this;
    if (that.data.comboList != null) {
      for (var i = 0; i < that.data.comboList.length; i++) {
        that.data.comboList[i].buyNum = 0;
      }
    }
    that.setData({
      comboList: that.data.comboList,
      price: that.data.price,
      allPrice: parseFloat(that.data.allPrice).toFixed(2),
    })
    that.leftTime();
  },
  // 增加数量
  add: function (e) {
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
  minus: function (e) {
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
  calculate: function () { //计算价格
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
        allPrice: parseFloat(that.data.allPrice).toFixed(2),
      })
    } else {
      for (let i = 0; i < json.length; i++) {
        refreshments += (json[i].number) * (json[i].packageSettlePrice)
      }
      that.setData({
        refreshments: refreshments,
        allPrice: parseFloat(refreshments + Number(that.data.price)).toFixed(2),
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
  choosePay: function () {
    let that = this;
    if (!that.data.phone) {
      wx.showToast({
        title: '号码不能为空!',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
      return;
    } else if (that.data.phone.length != 11) {
      wx.showToast({
        title: '号码格式错误!',
        icon: 'loading',
        image: '',
        duration: 1000,
        mask: true,
      })
      return;
    }
    if (that.data.payway == 1) { // 微信支付
      that.wxPay();
    };
    if (that.data.payway == 2) { // 会员卡支付
      that.showM();
    }
  },
  close: function () {
    this.setData({
      showPay: false
    })
  },
  // 微信支付
  wxPay: function () {
    var that = this;
    var json = [];
    console.log(that.data)
    let list = app.globalData.seat;
    console.log(list)
    for (let i = 0; i < list.length; i++) {
      let seatCode = list[i].seatCode;
      json.push({
        "seatCode": seatCode,
      })
    }
    // 预支付
    wx.request({
      url: app.globalData.url + '/Api/Order/PrePayOrder',
      data: {
        "userName": app.usermessage.Username,
        "password": app.usermessage.Password,
        "cinemaCode": app.globalData.cinemacode,
        "orderCode": that.data.orderCode,
        "mobiePhone": that.data.phone,
        "couponsCode": that.data.couponsCode,
        "reductionPrice": that.data.reductionPrice,
        "seats": json,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
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
            success: function (res) {
              wx.hideTabBar() //隐藏栏
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
                      wx.showToast({
                        title: '支付成功！',
                        icon: 'none',
                        duration: 1000
                      });
                      setTimeout(function () {
                        wx.redirectTo({
                          url: '../myticket/myticket',
                        })
                      }, 1000)
                    }
                  },
                  fail(res) {
                    wx.hideTabBar() //隐藏栏
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
          wx.hideTabBar() //隐藏栏
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
  cardPay: function () {
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
  // 会员卡密码确认
  pay2: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // if (that.data.canClick != 1) {
    //   wx.hideTabBar() //隐藏栏
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
    let data = {
      Username: app.usermessage.Username, //账号
      Password: app.usermessage.Password, // 密码
      CinemaCode: app.globalData.cinemacode, //影院编码
      LockOrderCode: that.data.orderCode, //锁座订单号(编码)
      LocalOrderCode: null, //卖品本地订单号
      CouponsCode: that.data.couponsCode, // 优惠券编码
      CardNo: that.data.cardNo, // 会员卡号
      CardPassword: that.data.password, // 会员卡密码
      CouponsCode2: null,
      PayAmount: that.data.allPrice, //影票支付金额
      GoodsPayAmount: 0, //卖品支付金额
      SessionCode: that.data.sessionCode, //放映计划编码
      FilmCode: app.globalData.movieId, //影片编码
      TicketNum: that.data.count, //票数
      SessionTime: app.globalData.moviesListDate.sessionTime, //排期时间
      ScreenType: app.globalData.moviesListDate.screenType, //影厅类型
      ListingPrice: app.globalData.moviesListDate.listingPrice, //挂牌价
      LowestPrice: app.globalData.moviesListDate.lowestPrice, //最低价
      MobilePhone: that.data.phone, // 手机号
    };
    // 查询本地订单
    wx.request({
      url: app.globalData.url + '/Api/Order/QueryLocalOrder' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res);
        let order = res.data.data;
        let price = that.data.memberCardPrice;
        if (res.data.Status == "Success") {
          // 判断售票系统
          if (app.globalData.cinemaList.cinemaType == "电影1905") { // 1905
                // 1905系统会员卡支付
                wx.request({
                  url: app.globalData.url + '/Api/Member/SellTicketCustomMember' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.MobilePhone + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.CouponsCode,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function (res) {
                    wx.hideTabBar() //隐藏栏
                    console.log(res)
                    if (res.data.Status == "Success") {
                      wx.showToast({
                        title: '交易成功',
                        mask: true,
                        duration: 2000
                      });
                      setTimeout(function () {
                        wx.redirectTo({
                          url: '../myticket/myticket',
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
          } else if (app.globalData.cinemaList.cinemaType == "辰星") { //辰星
              if (res.data.Status == "Success") {
                  // 会员卡支付
                wx.request({
                  url: app.globalData.url + '/Api/Member/CardPay' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.LocalOrderCode + '/' + data.MobilePhone + '/' + data.CardNo + '/' + data.CardPassword + '/' + price + '/' + data.GoodsPayAmount + '/' + data.SessionCode + '/' + data.FilmCode + '/' + data.TicketNum + '/' + data.CouponsCode + '/' + data.CouponsCode2,
                  method: 'GET',
                  header: {
                     'content-type': 'application/json' // 默认值
                  },
                  success: function (res) {
                      wx.hideTabBar() //隐藏栏
                      console.log(res)
                      if (res.data.Status == "Success") {
                        wx.showToast({
                          title: '交易成功',
                          mask: true,
                          duration: 2000
                        });
                        setTimeout(function () {
                          wx.redirectTo({
                            url: '../myticket/myticket',
                          })
                        }, 1000)
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
                }
          } else if (app.globalData.cinemaList.cinemaType == "粤科") { //粤科
                if (res.data.Status == 'Success') {
                  // 会员卡支付
                wx.request({
                  url: app.globalData.url + '/Api/Member/YkTicketmMember' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.MobilePhone + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.CouponsCode,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function(res) {
                    wx.hideTabBar() //隐藏栏
                    console.log(res)
                    if (res.data.Status == "Success") {
                      wx.showToast({
                        title: '交易成功',
                        mask: true,
                        duration: 2000
                      });
                      setTimeout(function () {
                        wx.redirectTo({
                          url: '../myticket/myticket',
                        })
                      }, 1000)
                    }
                     else {// 支付失败
                      wx.showToast({
                        title: "订单确认失败",
                        icon: 'none',
                        duration: 3000
                      });
                    }
                  }
                })
                } 
          } else if (app.globalData.cinemaList.cinemaType == "满天星") { // 满天星
              if (res.data.Status == "Success") {
                // 会员卡支付
                wx.request({
                  url: app.globalData.url + '/Api/Member/CardPay' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.LocalOrderCode + '/' + data.MobilePhone + '/' + data.CardNo + '/' + data.CardPassword + '/' + price + '/' + data.GoodsPayAmount + '/' + data.SessionCode + '/' + data.FilmCode + '/' + data.TicketNum + '/' + data.CouponsCode + '/' + data.CouponsCode2,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function (res) {
                    wx.hideTabBar() //隐藏栏
                    console.log(res)
                    if (res.data.Status == "Success") {
                      wx.showToast({
                        title: '交易成功',
                        mask: true,
                        duration: 2000
                      });
                      setTimeout(function () {
                        wx.redirectTo({
                          url: '../myticket/myticket',
                        })
                      }, 1000)
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
              } 
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
  changePhone: function (e) {
    var phone = e.detail.value;
    this.setData({
      phone: phone
    })
  },
  setM: function (e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },
  showM: function () {
    let that = this;
    if (that.data.card == null) {
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
    } else {
      let card = that.data.card;
      console.log(card)
      if (card) {
        that.setData({
          showM: true,
          cardNo: card.cardNo,
          levelCode: card.levelCode,
        })
      }
    }
  },
  closeM: function () {
    this.setData({
      showM: false,
      isShow: false,
    })
  },
  // 选择会员卡号支付
  btnChoose: function (e) {
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
  setType1: function () {
    let that = this;
    that.setData({
      chooseType: 1
    });
    console.log(that.data)
  },
  setType2: function () {
    this.setData({
      chooseType: 2
    })
  },
  // 选择优惠券
  setSeatCoupon: function (e) {
    console.log(e)
    let that = this;
    let merOrder = that.data.merOrder;
    let id = e.currentTarget.dataset.id;
    let code = e.currentTarget.dataset.code;
    let ticketPrice = e.currentTarget.dataset.couponprice; // 优惠券价格
    let price = that.data.price; // 影票原价
    let refreshments = that.data.refreshments; // 卖品总价
    if (merOrder) {
      merOrder.merTicket.couponCode = code;
      merOrder.merTicket.counponId = id;
      merOrder.merTicket.couponPrice = ticketPrice;
      that.setData({
        merTicketId: id,
        merOrder: merOrder
      })
      console.log(that.data.merOrder.merTicket)
    }
    // 代金券
    if (that.data.payway == '2') { // 会员卡支付
      price = Number(that.data.memberCardPrice) - Number(ticketPrice); // 会员价减去优惠券价格
      price = parseFloat(price * 100) / 100;
    } else { // 微信支付
      price = Number(that.data.beginTicket) - Number(ticketPrice);// 影票原价减去优惠券价格
      price = parseFloat(price * 100) / 100;
    }
    console.log(that.data.beginTicket)
    console.log(ticketPrice)
    that.setData({
      couponsCode: that.data.merOrder.merTicket.couponCode,
      reductionPrice: that.data.merOrder.merTicket.couponPrice, // 优惠券价格
      ticketRealPrice: ticketPrice, // 减免金额
      allPrice: parseFloat(price + refreshments).toFixed(2),
    })
    // for (let i = 0; i < that.data.seatCouponList.length; i++) {
    //   if (that.data.seatCouponList[i].couponsCode == id) {
    //     that.setData({
    //       seatCoupon: that.data.seatCouponList[i]
    //     })
    //   }
    // }
    // console.log(that.data.seatCoupon)
    // let price = that.data.price; // 影票总价
    // let refreshments = that.data.refreshments; // 卖品总价
    // let seatCouponPrice = that.data.seatCoupon.reductionPrice; // 优惠券金额
    // if (that.data.seatCoupon.couonsType == '2') { // 兑换券
    //   seatCouponPrice = price;
    //   priceArr.push(seatCouponPrice);
    //   codeArr.push(that.data.seatCoupon.couponsCode);
    //   price = (that.data.beginTicket) - (seatCouponPrice);
    //   that.setData({
    //     couponsCode: that.data.seatCoupon.couponsCode,
    //     reductionPrice: that.data.seatCoupon.reductionPrice,
    //     ticketRealPrice: (that.data.price) / (that.data.count),  /* 减免金额 */
    //     allPrice: parseFloat(price + refreshments).toFixed(2),
    //     priceArr: priceArr,
    //     codeArr: codeArr,
    //   })
    //   that.setData({
    //     ticketName: '电影票兑换券'
    //   })
    // }
  },
  setFoodCoupon: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.setData({
      merTicketId: id
    })
    that.calculate();
  },
  closeChoose: function () {
    let that = this;
    that.setData({
      chooseType: 0
    })
  },
  messageshow: function () {
    this.setData({
      messageshow: true
    })
  },
  btnShowExchange2: function () {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  closeMessageshow: function () {
    this.setData({
      messageshow: false
    })
  },
  setMessage: function (e) {
    var userMessage = e.detail.value;
    this.setData({
      userMessage: userMessage
    })
  },
  formSubmit: function (e) {
    this.setData({
      formids: e.detail.formId
    })
    // console.log(e.detail.formId)
  },
  zero: function () {
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
      success: function (res) {
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
        setTimeout(function () {
          wx.redirectTo({
            url: '../success/success?orderNum=' + ordernum,
          })
        }, 1000)
      }
    })
  },
  // 查看会员协议
  cinemaAgreement: function() {
    let that = this;
    console.log(app.globalData.cinemaList.cinemaAgreement)
    if (app.globalData.cinemaList.cinemaAgreement) {
      that.setData({
        cinemaAgreement: true,
        agreement: app.globalData.cinemaList.cinemaAgreement,
      })
    } else {
      that.setData({
        cinemaAgreement: true,
        agreement: '暂无协议',
      })
    }
  },
    // 关闭会员协议
  closeCinemaAgreement: function() {
    let that = this;
    that.setData({
      cinemaAgreement: false,
    })
  },
})