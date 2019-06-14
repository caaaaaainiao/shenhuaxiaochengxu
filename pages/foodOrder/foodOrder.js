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
    merOrder: null,
    startChoose: false,
    merTicketId: "",
    isReady: 0,
    messageshow: false,
    userMessage: "",
    showReady: false,
    cinema: null,
    isShow: false,
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
    util.getCardInfo('MiniProgram', '6BF477EBCC446F54E6512AFC0E976C41', app.globalData.openId, app.globalData.cinemacode, function(res) {
      that.setData({
        card: res.data.data.memberCard,
      })
    })
    // console.log(app.globalData.queryXml)
    let goodsList = wx.getStorageSync('toSubmitGoods');
    if (!goodsList)
      return;
    goodsList = goodsList.data;
    // util.getgoodList(that.data.UrlMap.goodsUrl + app.globalData.cinemacode, function (goodsList){
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
      disPrice: totalPrice
    });


    //todo 优惠券
    console.log(app.globalData.openId)
    util.getconponsList(that.data.UrlMap.conponsUrl + app.globalData.cinemacode + "/" + app.globalData.openId + "/All", function(res) {
      // console.log(res)//适用于该影院的优惠券
      var sellTicket = []
      for (var x in res) {
        if (res[x].reductionType == 2) {
          sellTicket.push(res[x])
        }
      }
      // console.log(sellTicket)  //排除电影票优惠券
      var priceTicker = []
      for (var x in sellTicket) {
        if (sellTicket[x].initialAmount < that.data.totalPrice || sellTicket[x].initialAmount == that.data.totalPrice) {
          priceTicker.push(sellTicket[x])
        }
      }
      // console.log(priceTicker)//排除不符合满减得优惠券

      var notusedTicket = []
      for (var x in priceTicker) {
        if (priceTicker[x].status == 1) {
          notusedTicket.push(priceTicker[x])
        }
      }
      // console.log(notusedTicket) //排除已使用 已过期优惠券

      var timeTicket = []
      var nowday = new Date().getDay() + 1
      // console.log(nowday)
      for (var x in notusedTicket) {
        if (notusedTicket[x].canUsePeriodType == 1) {
          timeTicket.push(notusedTicket[x])
        } else if (notusedTicket[x].canUsePeriodType == 2) {
          if (notusedTicket[x].weekDays == '') { //每天都适用的添加进数组
            timeTicket.push(notusedTicket[x])
          } else { //有固定周几的
            if (notusedTicket[x].weekDays.indexOf(nowday) != -1) {
              if (notusedTicket[x].timePeriod == '') { //没有固定几点到几点的添加进组
                timeTicket.push(notusedTicket[x])
              } else { //固定时间的
                var arr = notusedTicket[x].timePeriod.split(',')
                // console.log(arr) //字符串转数组

                var hourtime = new Date().getHours() + '' + new Date().getMinutes()
                // console.log(hourtime) //获取本地的小时分钟
                for (var y in arr) {
                  // console.log(arr[y]) //获取数组中的每一个字符串
                  var arr1 = arr[y].split('-')
                  // console.log(arr1) //将字符串转化为数组
                  for (var z in arr1) {
                    var hourtime1 = arr1[0].replace(':', '')
                    var hourtime2 = arr1[1].replace(':', '')

                  }
                  if (hourtime > hourtime1 && hourtime < hourtime2) {
                    timeTicket.push(notusedTicket[x])
                  }
                }
              }
            }
          }
        }
      }


      // console.log(timeTicket)
      // console.log(that.data.goodsList)
      var goodTicket = []
      for (var x in that.data.goodsList) {
        for (var y in timeTicket) {
          if (timeTicket[y].goodsCodes == '') {
            goodTicket.push(timeTicket[y])
          } else {
            // array.push(timeTicket[y].goodsCodes)
            var array = timeTicket[y].goodsCodes.split(',')

            // console.log(array)
            for (var z in array) {
              if (that.data.goodsList[x].goodsCode == array[z]) {
                goodTicket.push(timeTicket[y])
              }
            }
          }

        }
      }
      // console.log(goodTicket)


      if (goodTicket && goodTicket.length > 0) {
        //formatTime
        for (var i = 0; i < goodTicket.length; i++) {
          if (goodTicket[i].validityDate) {
            goodTicket[i].validityDateStr = util.formatTimeGMT(goodTicket[i].validityDate);
          } else {
            goodTicket[i].validityDateStr = ""
          }

        }

        let merOrder = {

          merTicket: {
            conponId: goodTicket[0].conponId,
            conponCode: goodTicket[0].conponCode,
            couponPrice: goodTicket[0].price
          },
          merTicketList: goodTicket
        };
        that.setData({
          merOrder: merOrder,

        });
        console.log(merOrder);
        that.updatetotalPrice();
      }
    });
    //  });

    // console.log(newList)
    util.getcinemaList(function(res) {
      if (res) {

        that.setData({
          type: options.type,
          cinemaList: res,

          cinema: res[0],
        });


      }
    });
    console.log(app.globalData)
    if (app.globalData.userInfo && (app.globalData.userInfo.mobilePhone != null || app.globalData.userInfo.mobilePhone != "")) {
      util.getMemberCardByPhone(app.globalData.cinemacode, app.globalData.userInfo.mobilePhone, function(res) {

        app.globalData.userInfo.dxInsiderInfo = res;

      });
    }
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

      disPrice: price
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
      userInfo: app.globalData.userInfo
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
      title: '神画电影',
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
  choosePay: function() {

    var that = this

    var nowtime = new Date();
    let apiuser = util.getAPIUserData(null);
    let endtime = new Date(nowtime.getTime() + 1000 * 60);
    let endday = util.formatTime2(endtime);
    var deliveryAddress = app.globalData.selltimename + '' + app.globalData.orderaddname + '[' + app.globalData.sellhallname + ']'
    //todo: 创建订单
    wx.request({
      url: app.globalData.url + '/Api/Goods/CreateGoodsOrder',
      method: "POST",
      data: {
        deliveryType: app.globalData.optionstype,
        deliveryAddress: deliveryAddress,
        deliveryMark: that.data.userMessage,
        deliveryTime: endday,
        queryXml: app.globalData.xml,
        userName: apiuser.UserName,
        password: apiuser.Password,
        openID: app.globalData.openId,
        isReady: app.globalData.isReady
      },
      success: function(res) {
        console.log(res)
        var ordercode = res.data.order.orderCode
        app.globalData.ordercode = ordercode
        //查询订单
        wx.request({
          url: app.globalData.url + '/Api/Goods/QueryLocalGoodsOrder' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + app.globalData.cinemacode + '/' + ordercode,
          method: "GET",
          success: function(res) {
            console.log(res)
            var arr = res.data.data.goodsList
            var goodslist = []
            var obj = {}
            for (var x = 0; x < arr.goods.length; x++) {
              obj.goodsCode = arr.goods[x].goodsCode
              obj.goodsCount = arr.goods[x].goodsCount
              goodslist.push(obj)
              that.setData({
                goodslist: goodslist
              })
            }
            app.globalData.goodslist = that.data.goodslist
            if (res.data.Status == "Success") {
              that.setData({ //关闭浮层
                showReady: false
              })
              //确认订单的参数(微信)
              let queryXml = '<SubmitGoodsOrder><cinemaCode>' + app.globalData.cinemacode + '</cinemaCode><orderCode>' + app.globalData.ordercode + '</orderCode><mobilePhone>' + app.globalData.phonenum + '</mobilePhone><cardNo></cardNo><cardPassword></cardPassword><paySeqNo></paySeqNo><goodsList>'
              let queryobj = app.globalData.queryobj

              if (queryobj && queryobj.list) {
                for (var i = 0; i < queryobj.list.length; i++) {
                  let items = queryobj.list[i];
                  queryXml += '<goods>';
                  queryXml += '<goodsCode>' + items.goodsCode + '</goodsCode>';
                  queryXml += '<goodsCount>' + items.buyNum + '</goodsCount>';
                  queryXml += '<settlePrice>' + items.settlePrice + '</settlePrice>';
                  queryXml += '<standardPrice>' + items.standardPrice + '</standardPrice>';
                  if (items.channelFee) {
                    queryXml += '<goodsChannelFee>' + items.channelFee + '</goodsChannelFee>';
                  } else {
                    queryXml += '<goodsChannelFee>0</goodsChannelFee>';
                  }

                  queryXml += '</goods>';
                }
              }
              queryXml += ' </goodsList></SubmitGoodsOrder>';
              app.globalData.queryXml = queryXml
              //复制购物车列表到待支付物品列表
              //let cattObj = util.getcartObj(null);
              //wx.setStorageSync('toSubmitGoods', cattObj);

            } else {
              wx.showToast({
                title: '订单创建失败,请重试',
                icon: 'loading',
                image: '',
                duration: 2000,
                mask: true,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
              })
            }
          },
        })
        wx.hideLoading()


      }
    })

    this.setData({
      showBlack: true
    })

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
  wxPay: function() {
    var that = this;
    if (that.data.canClick != 1) {
      return;
    }

    if (app.globalData.userInfo.userInfo.mobilePhone.length != 11) {
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
    var nowtime = new Date().getTime();
    //预支付
    wx.request({
      url: app.globalData.url + '/Api/Goods/PrePayGoodsOrder',
      method: "POST",
      data: {
        userName: "MiniProgram",
        password: "6BF477EBCC446F54E6512AFC0E976C41",
        orderCode: app.globalData.ordercode,
        cinemaCode: app.globalData.cinemacode,
        couponsCode: that.data.merOrder.merTicket.conponCode,
        reductionPrice: that.data.merOrder.merTicket.couponPrice,
        goodsList: app.globalData.goodslist

      },
      success: function(res) {
        console.log(res.data.data)
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.packages,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          success(res) {
            console.log(res)
            wx.request({
              url: app.globalData.url + '/Api/Goods/SubmitGoodsOrder',
              method: "POST",
              data: {
                userName: "MiniProgram",
                password: "6BF477EBCC446F54E6512AFC0E976C41",
                queryXml: app.globalData.queryXml
              },
              success: function(res) {
                console.log(res)
                var orderNum = res.data.order.orderCode
                if (res.data.Status == 'Failure') {
                  wx.request({
                    url: app.globalData.url + '/Api/Goods/RefundPayment' + '/' + 'MiniProgram' + '/' + '6BF477EBCC446F54E6512AFC0E976C41' + '/' + app.globalData.cinemacode + '/' + app.globalData.ordercode,
                    method: "GET",
                    header: {
                      "Content-Type": "application/json"
                    },
                    success: function(res) {
                      console.log(res)
                    }
                  })
                }
                wx.redirectTo({
                  url: '../foodSuccess/foodSuccess?orderNum=' + orderNum
                })
              }

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
      LocalOrderCode: app.globalData.ordercode, //卖品本地订单号
      CardNo: that.data.cardNo, //会员卡号
      CardPassword: that.data.password, //会员卡密码
      PayAmount: 0,
      GoodsPayAmount: that.data.totalPrice, //卖品支付金额
      SessionCode: null, //放映计划编码
      FilmCode: null, //影片编码
      TicketNum: null, //票数
    };
    if (that.data.cinemaType == '辰星') {
      wx.request({
        url: app.globalData.url + '/Api/Member/CardPay' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LockOrderCode + '/' + data.LocalOrderCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.PayAmount + '/' + data.GoodsPayAmount + '/' + data.SessionCode + '/' + data.FilmCode + '/' + data.TicketNum,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          console.log(res)
          that.setData({
            tradeNo: res.data.tradeNo
          })
          //确认订单的参数(会员卡)
          let mpXml = '<SubmitGoodsOrder><cinemaCode>' + app.globalData.cinemacode + '</cinemaCode><orderCode>' + app.globalData.ordercode + '</orderCode><mobilePhone>' + app.globalData.phonenum + '</mobilePhone><cardNo>' + that.data.cardNo + '</cardNo><cardPassword>' + data.Password + '</cardPassword><paySeqNo></paySeqNo><goodsList>'
          let mpobj = app.globalData.queryobj

          if (mpobj && mpobj.list) {
            for (var i = 0; i < mpobj.list.length; i++) {
              let items = mpobj.list[i];
              mpXml += '<goods>';
              mpXml += '<goodsCode>' + items.goodsCode + '</goodsCode>';
              mpXml += '<goodsCount>' + items.buyNum + '</goodsCount>';
              mpXml += '<settlePrice>' + items.settlePrice + '</settlePrice>';
              mpXml += '<standardPrice>' + items.standardPrice + '</standardPrice>';
              if (items.channelFee) {
                mpXml += '<goodsChannelFee>' + items.channelFee + '</goodsChannelFee>';
              } else {
                mpXml += '<goodsChannelFee>0</goodsChannelFee>';
              }

              mpXml += '</goods>';
            }
          }
          mpXml += ' </goodsList></SubmitGoodsOrder>';
          app.globalData.mpXml = mpXml
          wx.request({
            url: app.globalData.url + '/Api/Goods/SubmitGoodsOrder',
            method: "POST",
            data: {
              userName: "MiniProgram",
              password: "6BF477EBCC446F54E6512AFC0E976C41",
              queryXml: app.globalData.mpXml
            },
            success: function(res) {
              console.log(res)
              if (res.data.Status == "Failure") {
                wx.showModal({
                  title: '支付失败',
                  content: res.data.ErrorMessage,
                })
                wx.request({
                  url: app.globalData.url + '/Api/Member/CardPayBack' + '/' + 'MiniProgram' + '/' + '6BF477EBCC446F54E6512AFC0E976C41' + '/' + app.globalData.cinemacode + '/' + data.CardNo + '/' + data.CardPassword + '/' + that.data.tradeNo + '/' + that.data.totalPrice,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function(res) {
                    console.log(res)
                  }
                })
                wx.redirectTo({
                  url: '../foodOrder/foodOrder'
                })
              } else if (res.data.Status == "Success") {
                var ordernum = res.data.order.orderCode
                wx.redirectTo({
                  url: '../foodSuccess/foodSuccess?orderNum=' + ordernum
                })
              }
            }
          })
        }
      })
    } else if (that.data.cinemaType == '电影1905') {
      console.log(that.data.cardNo)
      //确认订单的参数(会员卡)
      let mpXml = '<SubmitGoodsOrder><cinemaCode>' + app.globalData.cinemacode + '</cinemaCode><orderCode>' + app.globalData.ordercode + '</orderCode><mobilePhone>' + app.globalData.phonenum + '</mobilePhone><cardNo>' + that.data.cardNo + '</cardNo><cardPassword>' + data.CardPassword + '</cardPassword><paySeqNo></paySeqNo><goodsList>'
      let mpobj = app.globalData.queryobj

      if (mpobj && mpobj.list) {
        for (var i = 0; i < mpobj.list.length; i++) {
          let items = mpobj.list[i];
          mpXml += '<goods>';
          mpXml += '<goodsCode>' + items.goodsCode + '</goodsCode>';
          mpXml += '<goodsCount>' + items.buyNum + '</goodsCount>';
          mpXml += '<settlePrice>' + items.settlePrice + '</settlePrice>';
          mpXml += '<standardPrice>' + items.standardPrice + '</standardPrice>';
          if (items.channelFee) {
            mpXml += '<goodsChannelFee>' + items.channelFee + '</goodsChannelFee>';
          } else {
            mpXml += '<goodsChannelFee>0</goodsChannelFee>';
          }

          mpXml += '</goods>';
        }
      }
      mpXml += ' </goodsList></SubmitGoodsOrder>';
      app.globalData.mpXml = mpXml
      wx.request({
        url: app.globalData.url + '/Api/Goods/SubmitGoodsOrder',
        method: "POST",
        data: {
          userName: "MiniProgram",
          password: "6BF477EBCC446F54E6512AFC0E976C41",
          queryXml: app.globalData.mpXml
        },
        success: function(res) {
          console.log(res)
          if (res.data.Status == "Failure") {
            wx.showModal({
              title: '支付失败',
              content: res.data.ErrorMessage,
            })

            wx.redirectTo({
              url: '../foodOrder/foodOrder'
            })
          } else if (res.data.Status == "Success") {
            var ordernum = res.data.order.orderCode
            wx.redirectTo({
              url: '../foodSuccess/foodSuccess?orderNum=' + ordernum
            })
          }
        }
      })
    }

    var nowtime = new Date().getTime();
    // var sign = app.createMD5('submitMerchaniseOrder', nowtime);
    // wx.request({
    //   url: app.globalData.url + '/api/shOrder/submitMerchaniseOrder',
    //   data: {
    //     phone: that.data.phone,
    //     address: that.data.type2address,
    //     deliveryType: that.data.type - 1, //取货方式 0 自取,1送达;
    //     featureAppNo: app.globalData.sellfeatureAppNo, //场次唯一编码
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     appUserId: app.globalData.userInfo.id,
    //     merchandiseInfo: json,
    //     activityId: marActivityId, //参与的活动的id
    //     isReady: that.data.isReady,
    //     memo: that.data.userMessage,
    //     merTicketId: merTicketId,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function(res) {
    //     console.log(res)
    //     if (res.data.status == 0) {
    //       wx.showModal({
    //         title: '',
    //         content: res.data.message,
    //       })
    //       wx.hideLoading()
    //       return;
    //     }
    //     var ordernum = res.data.data.orderNum;
    //     // console.log(ordernum)
    //     var nowtime = new Date().getTime();
    //   }
    // })
  },
  syn: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userCard', nowtime);
    // wx.request({
    //   url: app.globalData.url + '/api/shAppuser/userCard',
    //   data: {
    //     appUserId: app.globalData.userInfo.id,
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function(res) {
    //     // console.log(res)
    //     if (res.data.status == 1) {
    //       var userInfo = res.data.data;
    //       that.setData({
    //         userInfo: userInfo
    //       })
    //       app.globalData.userInfo = userInfo;
    //     } else {
    //       wx.showModal({
    //         title: '',
    //         content: res.data.message
    //       })
    //     }
    //   }
    // })
  },
  setM: function(e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },
  showM: function() {
    var that = this
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
              url: '../page04/index',
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
    this.setData({
      userMessage: userMessage
    })
  }
})