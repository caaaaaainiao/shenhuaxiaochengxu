// pages/foodOrder/foodOrder.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 1,
    goodsList: null,
    phone: "",
    totalPrice: 0,
    type2address: "",
    showBlack: false,
    waitActivity: null,
    marActivity: null,
    disPrice: 0,
    canClick: 1,
    coupon: 0,
    showM: false,
    password: "",
    formids: '',
    merOrder: {
      merTicket: {
        conponId: null,
        conponCode: null,
        couponPrice: 0
      },
    },
    startChoose: false,
    merTicketId: "",
    isReady: 0,
    messageshow: false,
    userMessage: "",
    showReady: false,
    cinema: null,
    isShow: false,
    isbind:false,
    onbind:true,
    UrlMap: {
      conponsUrl: app.globalData.url + '/Api/Conpon/QueryUserConpons/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
      goodsUrl: app.globalData.url + '/Api/Goods/QueryGoods/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.setData({
      isOpenMember: app.globalData.isOpenMember
    })
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.userInfo.openID,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        that.setData({
          phone: res.data.data.mobilePhone
        })
      }
    })
    //todo: 创建订单
    wx.getStorage({
      key: 'cartObj',
      success: function(res) {
        // console.log(res.data.list)
        that.setData({
          goodsList: res.data.list
        })
      },
    })
    that.setData({
      userInfo: app.globalData.userInfo,
      // phone: app.globalData.userInfo.mobilePhone,
    })
    util.getCardInfo('MiniProgram', '6BF477EBCC446F54E6512AFC0E976C41', app.globalData.userInfo.openID, app.globalData.cinemacode, function(res) {
      console.log(res.data.data.memberCard)
          var nowtime = new Date();
    let endtime = new Date(nowtime.getTime() + 1000 * 60);
    let endday = util.formatTime2(endtime);
    var deliveryAddress = app.globalData.sellhallname
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/Api/Goods/CreateGoodsOrder',
      method: "POST",
      data: {
        deliveryType: app.globalData.optionstype,
        deliveryAddress: deliveryAddress,
        deliveryMark: that.data.userMessage,
        deliveryTime: endday,
        queryXml: app.globalData.xml,
        userName: 'MiniProgram',
        password: "6BF477EBCC446F54E6512AFC0E976C41",
        openID: app.globalData.userInfo.openID,
        isReady: app.globalData.isReady
      },
      success: function(e) {
        wx.hideLoading()
        if (e.data.Status == "Success") {
          if (res.data.data.memberCard){
            wx.request({
              url: app.globalData.url + '/Api/Goods/QueryGoodsOrderPrice' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + e.data.order.orderCode + '/' + res.data.data.memberCard[0].cardNo,
              method: "GET",
              header: {
                "Content-Type": "application/json"
              },
              success: function (r) {
                console.log(r)
                that.setData({
                  orderMemberPrice: r.data.orderMemberPrice
                })
              }
            })
          }
          that.setData({
            ordercode: e.data.order.orderCode
          })
        } else {
          wx.showModal({
            title: '创建订单失败',
            content: e.data.ErrorMessage + '请重新选择商品',
          })
        }
      }
    })
      if (res.data.data.memberCard){
        that.setData({
          isbind:false,
          onbind:true
        })
      }else{
        that.setData({
          isbind: true,
          onbind:false
        })
      }
      that.setData({
        card: res.data.data.memberCard,
      })
    })
    wx.getStorage({
      key: 'cartObj',
      success: function(res) {
        // console.log(res.data.list)
        that.setData({
          goodsList: res.data.list
        })
        let goodsList = that.data.goodsList;
        // console.log(goodsList)
        if (!goodsList)
          return;
        var newList = [];
        var totalPrice = 0;

        for (var i = 0; i < goodsList.length; i++) {
          if (goodsList[i].buyNum > 0) {
            newList.push(goodsList[i]);
          }
        }
        var json2 = [];
        var arr = [];
        for (var i = 0; i < newList.length; i++) {
          if (arr.indexOf(newList[i].goodsId) == -1) {
            arr.push(newList[i].goodsId);
            json2.push(newList[i])
            if (newList[i].buyNum > 0) {
              totalPrice += newList[i].buyNum * newList[i].settlePrice;
            }

          } else {
            newList[i].repetition = true;
          }
        }
        that.setData({
          goodsList: newList,
          totalPrice: totalPrice,
        });
      },
    })
    util.getcinemaList(function(res) {
      if (res) {
        that.setData({
          type: options.type,
          cinemaList: res,
          cinema: res[0],
        });
      }
    });
    setTimeout(function(){
      if (app.globalData.userInfo && (that.data.phone != null || that.data.phone != "")) {
        util.getMemberCardByPhone(app.globalData.cinemacode, that.data.phone, function (res) {

          app.globalData.userInfo.dxInsiderInfo = res;

        });
      }
    },500)

    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },
  //(减去优惠的)
  updatetotalPrice() {
    let that = this;
    let price = 0;
    if (that.data.merOrder && that.data.merOrder.merTicket && that.data.merOrder.merTicket.couponPrice) {
      price = that.data.totalPrice - that.data.merOrder.merTicket.couponPrice;

    } else {

      price = that.data.totalPrice;
    }
    that.setData({

      disPrice: price.toFixed(2),
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      userInfo: app.globalData.userInfo,
      // phone: app.globalData.userInfo.mobilePhone,
    })
    var that = this 
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUser' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + app.globalData.userInfo.openID,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        that.setData({
          phone: res.data.data.mobilePhone
        })
      }
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
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
  // 接口
  ask: function() {
    var that = this;
    // var json = [{ id: 32, number: 1 }, { id: 33, number: 1 }];
    var json = [];
    for (var i = 0; i < that.data.goodsList.length; i++) {
      var row = {};
      row.id = that.data.goodsList[i].id;
      row.number = that.data.goodsList[i].buyNum;
      json.push(row)
    }
    // console.log(json)
    if (json.length == 0) {
      json = ""
    } else {
      var json2 = [];
      var arr = [];
      for (var i = 0; i < json.length; i++) {
        if (arr.indexOf(json[i].id) == -1) {
          arr.push(json[i].id);
          json2.push(json[i])
        }
      }
      json = JSON.stringify(json2);
    }
    wx.showLoading()
    var nowtime = new Date().getTime();
  },
  // 获取手机号
  getPhone: function(e) {
    let that = this;
    let phone = e.detail.value;
    that.setData({
      phone: phone,
    })
  },
  choosePay: function() {
    // this.formSubmit()
    var that = this
    if (!that.data.userMessage) {
      that.setData({
        userMessage: null
      })
    }
    if (that.data.payway == 1) {
      if (that.data.canClick != 1) {
        return;
      }
      // wx.hideLoading()
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
      that.setData({
        canClick: 0
      }) //防止多次点击
      //查询订单
      wx.request({
        url: app.globalData.url + '/Api/Goods/QueryLocalGoodsOrder' + '/' + 'MiniProgram' + '/' + "6BF477EBCC446F54E6512AFC0E976C41" + '/' + app.globalData.cinemacode + '/' + that.data.ordercode,
        method: "GET",
        success: function (res) {
          console.log(res)
          var arr = res.data.data.goodsList
          console.log(arr)
          var goodslist = []
          for (let x = 0; x < arr.goods.length; x++) {
            var obj = {}
            obj.goodsCode = arr.goods[x].goodsCode
            obj.goodsCount = arr.goods[x].goodsCount
            goodslist.push(obj)
            console.log(goodslist)
            that.setData({
              goodslist: goodslist
            })
          }
          app.globalData.goodslist = that.data.goodslist
          if (res.data.Status == "Success") {
            wx.request({ //预支付
              url: app.globalData.url + '/Api/Goods/PrePayGoodsOrder',
              method: "POST",
              data: {
                userName: "MiniProgram",
                password: "6BF477EBCC446F54E6512AFC0E976C41",
                orderCode: that.data.ordercode,
                mobilePhone: that.data.phone,
                cinemaCode: app.globalData.cinemacode,
                couponsCode: that.data.merOrder.merTicket.conponCode,
                reductionPrice: that.data.merOrder.merTicket.couponPrice,
                goodsList: app.globalData.goodslist,
                deliveryMark: that.data.userMessage
              },
              success: function (res) {
                console.log(res)
                wx.requestPayment({ //微信支付
                  timeStamp: res.data.data.timeStamp,
                  nonceStr: res.data.data.nonceStr,
                  package: res.data.data.packages,
                  signType: res.data.data.signType,
                  paySign: res.data.data.paySign,
                  success(res) {
                    console.log(res)
                    wx.showToast({
                      title: '支付成功！',
                      icon: 'none',
                      duration: 1000,
                      mask: true,
                    })
                    wx.redirectTo({
                      url: '../myfood/myfood'
                    })
                  },
                  fail(res) {
                    console.log(res)
                    that.setData({
                      canClick: 1
                    })
                  }
                })
              }
            })

          } else {
            wx.showToast({
              title: '订单创建失败,请重试',
              icon: 'loading',
              image: '',
              duration: 2000,
              mask: true,
            })
          }
        },
      })
      var json = [];
      console.log(that.data.goodsList)
      for (var i = 0; i < that.data.goodsList.length; i++) {
        var row = {};
        row.id = that.data.goodsList[i].id;
        row.number = that.data.goodsList[i].buyNum;
        json.push(row)
      }
      if (json.length == 0) {
        json = ""
      } else {
        var json2 = [];
        var arr = [];
        for (var i = 0; i < json.length; i++) {
          if (arr.indexOf(json[i].id) == -1) {
            arr.push(json[i].id);
            json2.push(json[i])
          }
        }
        json = JSON.stringify(json2);
      }
      var marActivityId = "";
      if (that.data.marActivity != null) {
        marActivityId = that.data.marActivity.id;
      }
      var merTicketId = "";
      if (that.data.merOrder.merTicket != null) {
        merTicketId = that.data.merOrder.merTicket.id;
      }
    } else if (that.data.payway == 2) {
      //查询订单
      wx.request({
        url: app.globalData.url + '/Api/Goods/QueryLocalGoodsOrder' + '/' + 'MiniProgram' + '/' + "6BF477EBCC446F54E6512AFC0E976C41" + '/' + app.globalData.cinemacode + '/' + that.data.ordercode,
        method: "GET",
        success: function(res) {
          console.log(res)
          var arr = res.data.data.goodsList
          console.log(arr)
          var goodslist = []
          for (let x = 0; x < arr.goods.length; x++) {
            var obj = {}
            obj.goodsCode = arr.goods[x].goodsCode
            obj.goodsCount = arr.goods[x].goodsCount
            goodslist.push(obj)
            console.log(goodslist)
            that.setData({
              goodslist: goodslist
            })
          }
          app.globalData.goodslist = that.data.goodslist
          if (res.data.Status == "Success") {
            if (that.data.card == null) {
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
            } else {
              that.showM()
            }
          } else {
            wx.showToast({
              title: '订单创建失败,请重试',
              icon: 'loading',
              image: '',
              duration: 2000,
              mask: true,
            })
          }
        },
      })
    }
  },
  chooseClose: function() {
    this.setData({
      showReady: false
    })
  },
  chooseType: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    that.setData({
      isReady: type,
    })
  },
  sureChoose: function() {
    this.setData({
      showBlack: true,
      showReady: false
    })
  },
  close: function() {
    this.setData({
      showBlack: false
    })
  },
  syn: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userCard', nowtime);
  },
  setM: function(e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },
  showM: function() {
    var that = this
    // console.log(cinemaType)
    that.setData({
      cinemaType: app.globalData.cinemaList.cinemaType
    })
    if (that.data.card == null) {
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
    } else {
      let card = that.data.card;
      if (card.length > 1) {
        that.setData({
          isShow: true,
        });
      } else if (card.length == 1) {
        that.setData({
          showM: true,
          cardNo: card[0].cardNo,
        })
      }
    }
    that.setData({
      showM: true
    })
  },
  closeM: function() {
    this.setData({
      showM: false,
      isShow: false,
    })
  },
  btnShowExchange2: function() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  btnChoose: function(e) {
    let that = this;
    console.log(e)
    let cardNo = e.currentTarget.dataset.cardno;
    let levelCode = e.currentTarget.dataset.levelcode;
    that.setData({
      cardNo: cardNo,
      levelCode: levelCode,
      showM: true,
      isShow: false,
    });
  },
  chooseCoupon: function() {
    this.setData({
      startChoose: true
    })
  },
  setFoodCoupon: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var code = e.currentTarget.dataset.code;
    var price = e.currentTarget.dataset.couponprice
    let merOrder = that.data.merOrder;
    if (merOrder) {
      merOrder.merTicket.conponCode = code;
      merOrder.merTicket.conponId = id;
      merOrder.merTicket.couponPrice = price;
      that.setData({
        merTicketId: id,
        merOrder: merOrder
      })
      // console.log(that.data.merTicketId)
      console.log(that.data.merOrder)
    }

    // that.ask();
  },
  closeChoose: function() {
    this.updatetotalPrice();
    this.setData({
      startChoose: false
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
    var that = this
    that.setData({
      userMessage: userMessage
    })
  },
  formSubmit: function(e) {
    console.log(e)
    this.setData({
      formids: e.detail.formId
    })
    // console.log(e.detail.formId)
  },
  cardPay: function() {
    var that = this;
    if (that.data.canClick != 1) {
      return;
    }
    that.setData({
      canClick: 0
    }) //防止多次点击
    // if (that.data.phone.length != 11) {
    //   wx.showToast({
    //     title: '手机格式不正确',
    //     icon: 'loading',
    //     image: '',
    //     duration: 1000,
    //     mask: true,
    //   })
    //   return;
    // }
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
    for (var i = 0; i < that.data.goodsList.length; i++) {
      var row = {};
      row.id = that.data.goodsList[i].id;
      row.number = that.data.goodsList[i].buyNum;
      json.push(row)
    }
    if (json.length == 0) {
      json = ""
    } else {
      var json2 = [];
      var arr = [];
      for (var i = 0; i < json.length; i++) {
        if (arr.indexOf(json[i].id) == -1) {
          arr.push(json[i].id);
          json2.push(json[i])
        }
      }
      json = JSON.stringify(json2);
    }
    var marActivityId = "";
    if (that.data.marActivity != null) {
      marActivityId = that.data.marActivity.id;
    }
    var merTicketId = "";
    if (that.data.merOrder.merTicket != null) {
      merTicketId = that.data.merOrder.merTicket.id;
    }
    // wx.showLoading({
    //   title: '支付中',
    // })
    let data = {
      Username: app.usermessage.Username, //账号
      Password: app.usermessage.Password, // 密码
      CinemaCode: app.globalData.cinemacode, //影院编码
      LockOrderCode: null,
      LocalOrderCode: that.data.ordercode, //卖品本地订单号
      CardNo: that.data.cardNo, //会员卡号
      CardPassword: that.data.password, //会员卡密码
      PayAmount: 0,
      GoodsPayAmount: that.data.totalPrice, //卖品支付金额
      SessionCode: null, //放映计划编码
      FilmCode: null, //影片编码
      TicketNum: null, //票数
    };
    if (that.data.cinemaType == '辰星' || that.data.cinemaType == '满天星') {
      console.log(data)
      wx.request({
        url: app.globalData.url + '/Api/Member/CardPay' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.LocalOrderCode + '/' + that.data.phone + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.PayAmount + '/' + data.GoodsPayAmount + '/' + data.SessionCode + '/' + data.FilmCode + '/' + data.TicketNum + '/' + null + '/' + that.data.merOrder.merTicket.conponCode + '/' + that.data.userMessage,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          if (res.data.Status == "Failure") {
            wx.showModal({
              title: '支付失败',
              content: res.data.ErrorMessage,
            })
          } else if (res.data.Status == "Success") {
            wx.redirectTo({
              url: '../myfood/myfood',
            })
          }
        }
      })
    } else if (that.data.cinemaType == '粤科' || that.data.cinemaType == '云智') {
      console.log(that.data.cardNo)
      wx.request({
        url: app.globalData.url + '/Api/Member/YkGoodsOrderMember' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + that.data.ordercode + '/' + that.data.phone + '/' + that.data.cardNo + '/' + data.CardPassword + '/' + that.data.merOrder.merTicket.conponCode + '/' + that.data.userMessage,
        method: "GET",
        success: function(res) {
          console.log(res)
          if (res.data.Status == "Failure") {
            wx.showModal({
              title: '支付失败',
              content: res.data.ErrorMessage,
            })
          } else if (res.data.Status == "Success") {
            wx.redirectTo({
              url: '../myfood/myfood',
            })
          }
        }
      })
    } else if (that.data.cinemaType == '电影1905') {
      wx.request({
        url: app.globalData.url + '/Api/Member/GoodsOrderMember' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.cinemacode + '/' + that.data.ordercode + '/' + that.data.phone + '/' + that.data.cardNo + '/' + data.CardPassword + '/' + that.data.merOrder.merTicket.conponCode + '/' + that.data.userMessage,
        method: "GET",
        success: function(res) {
          console.log(res)
          if (res.data.Status == "Failure") {
            wx.showModal({
              title: '支付失败',
              content: res.data.ErrorMessage,
            })
          } else if (res.data.Status == "Success") {
            wx.redirectTo({
              url: '../myfood/myfood'
            })
          }
        }
      })
    }
  },
  wxway: function() {
    let that = this;
    // console.log(that.data.ordercode)
    wx.request({ //查询优惠券
      url: app.globalData.url + '/Api/Conpon/QueryUserAvailableCoupons/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/' + app.globalData.cinemacode + '/' + app.globalData.userInfo.openID + '/' + '2' + '/' + '1' + '/' + null + '/' + that.data.ordercode,
      success: function(res) {
        console.log(res)
        if (res.data.Status == 'Success') {
          var goodTicket = res.data.data.couponsList
          console.log(goodTicket)
          that.setData({
            goodTicket: goodTicket,
          })
          if (goodTicket.length > 0) {
            var merOrder = {
              merTicket: {
                conponId: goodTicket[0].couponsCode,
                conponCode: goodTicket[0].couponsCode,
                couponPrice: goodTicket[0].reductionPrice
              },
              merTicketList: goodTicket
            };
            if (merOrder == null) {
              let merTicket = {
                conponId: null,
                conponCode: null,
                couponPrice: 0
              }
              merOrder = merTicket
              return merOrder
            }
            console.log(merOrder);
            that.setData({
              merOrder: merOrder,
              disPrice: (that.data.totalPrice - merOrder.merTicket.couponPrice).toFixed(2)
            })
          } else {
            that.setData({
              disPrice: that.data.totalPrice.toFixed(2)
            })
          }
        } else {
          that.setData({
            disPrice: that.data.totalPrice.toFixed(2)
          })
        }
      }
    })
    that.setData({
      payway: 1,

    });
  },
  cardway: function() {
    let that = this;
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
    }
    wx.request({ //查询优惠券
      url: app.globalData.url + '/Api/Conpon/QueryUserAvailableCoupons/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/' + app.globalData.cinemacode + '/' + app.globalData.userInfo.openID + '/' + '2' + '/' + '2' + '/' + null + '/' + that.data.ordercode,
      success: function(res) {
        console.log(res)
        if (res.data.Status == 'Success') {
          var goodTicket = res.data.data.couponsList
          that.setData({
            goodTicket: goodTicket,
          })
          if (goodTicket.length > 0) {
            var merOrder = {
              merTicket: {
                conponId: goodTicket[0].couponsCode,
                conponCode: goodTicket[0].couponsCode,
                couponPrice: goodTicket[0].reductionPrice
              },
              merTicketList: goodTicket
            };
            if (merOrder == null) {
              let merTicket = {
                conponId: null,
                conponCode: null,
                couponPrice: 0
              }
              merOrder = merTicket
              return merOrder
            }
            console.log(merOrder);
            that.setData({
              merOrder: merOrder,
              disPrice: (that.data.orderMemberPrice - merOrder.merTicket.couponPrice).toFixed(2)
            })
          } else {
            that.setData({
              disPrice: that.data.orderMemberPrice
            })
          }
        } else {
          that.setData({
            disPrice: that.data.orderMemberPrice
          })
        }
      }
    })
    that.setData({
      payway: 2,

    });
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