// pages/foodOrder/foodOrder.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:1,
    goodsList:null,
    phone:"",
    totalPrice:0,
    type2address:"",
    showBlack:false,
    waitActivity:null,
    marActivity:null,
    disPrice:0,
    canClick:1,
    coupon:0,
    showM: false,
    password: "",
    merOrder:null,
    startChoose:false,
    merTicketId:"",
    isReady:0,
    messageshow: false,
    userMessage: "",
    showReady:false,
    cinema:null,
    UrlMap: { 
      goodsUrl: app.globalData.url + '/Api/Goods/QueryGoods/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/33111001',
      conponsUrl: app.globalData.url + '/Api/Conpon/QueryUserConpons/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/33111001/o9gGQ4nuoKAZq1Xjp_N3iu3bmpZs/All',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    util.getgoodList(that.data.UrlMap, function (goodsList){
      var newList = [];
      var totalPrice = 0;
 
      for (var i = 0; i < goodsList.length; i++) {
        if (goodsList[i].buyNum>0){
          newList.push(goodsList[i]);
        }
      }
      var json2 = [];
      var arr = [];
      for (var i = 0; i < newList.length; i++) {
        if (arr.indexOf(newList[i].goodsId) == -1) {
          arr.push(newList[i].goodsId);
          json2.push(newList[i])
          if (newList[i].buyNum>0){
            totalPrice  += newList[i].buyNum * newList[i].settlePrice;
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
      util.getconponsList(that.data.UrlMap, function (res) {
        
        if (res && res.length > 0) {

          //formatTime
          for(var i=0;i<res.length;i++){
            if (res[i].validityDate){
              res[i].validityDateStr = util.formatTimeGMT(res[i].validityDate);
            }else{
              res[i].validityDateStr=""
            }
           
          }

          let merOrder = {
         
            merTicket:{
              conponId: res[0].conponId,
                 couponPrice:parseFloat(res[0].price),
            },
            merTicketList: res
          };
          that.setData({
            merOrder: merOrder,
           
          });
console.log('merOrder-->');
          console.log(merOrder);
          that.updatetotalPrice();
        }
      });
    });

    // console.log(newList)
    util.getcinemaList(function (res) {
      if (res) {
       
        that.setData({
          type: options.type,
          cinemaList: res,
         
         // phone: app.globalData.userInfo.mobile,
       
          cinema: that.data.cinemaList[0],
          //type2address: app.globalData.type2address,
          //merOrder: app.globalData.merOrder
        });

       
      }
    });
   
    // var newList = [];
    // var totalPrice = 0;
   
    // for(var i = 0;i < goodsList.length;i++){
    //   for(var j = 0;j < goodsList[i].merchandiseList.length;j++){
    //     if (goodsList[i].merchandiseList[j].buyNum > 0){
    //       newList.push(goodsList[i].merchandiseList[j])
          
    //     }
    //   }
    // }
    // var json2 = [];
    // var arr = [];
    // for (var i = 0; i < newList.length; i++) {   
    //   if (arr.indexOf(newList[i].id) == -1) {
    //     arr.push(newList[i].id);
    //     json2.push(newList[i])
    //     // totalPrice = totalPrice + newList[i].buyNum * newList[i].listingPrice
    //   }else{
    //     newList[i].repetition = true;
    //   }
    // }
    // // console.log(newList)
    // that.setData({
    //   type:options.type,
    //   goodsList: newList,
    //   phone: app.globalData.userInfo.mobile,
    //   // totalPrice: totalPrice,
    //   cinema: app.globalData.cinemaList[app.globalData.cinemaNo],
    //   type2address: app.globalData.type2address,
    //   merOrder: app.globalData.merOrder
    // })
    //that.ask();
  },
  //(减去优惠的)
  updatetotalPrice(){
    let that=this;
    let price =0;
    if (that.data.merOrder && that.data.merOrder.merTicket && that.data.merOrder.merTicket.couponPrice){
      price = that.data.totalPrice - that.data.merOrder.merTicket.couponPrice;

    }else {

      price = that.data.totalPrice;
    }
    that.setData({
   
      disPrice: price
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  // 接口
  ask:function(){
    var that = this;
    // var json = [{ id: 32, number: 1 }, { id: 33, number: 1 }];
    var json = [];
    for(var i = 0;i < that.data.goodsList.length;i++){
      var row = {};
      row.id = that.data.goodsList[i].id;
      row.number = that.data.goodsList[i].buyNum;
      json.push(row)
    }
    // console.log(json)
    if(json.length == 0){
      json = ""
    }else{
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
    var sign = app.createMD5('countMerchaniseOrderPrice', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/countMerchaniseOrderPrice',
      data: {
        merchandiseInfo: json,
        appUserId: app.globalData.userInfo.id,
        cinemaCode:app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        merTicketId: that.data.merTicketId,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        var merOrder = res.data.data;
        if (merOrder.merTicketList){
          for (var i = 0; i < merOrder.merTicketList.length; i++) {
            merOrder.merTicketList[i].dxPlatTicket.endTime2 = merOrder.merTicketList[i].dxPlatTicket.endTime.substring(0, 10)
          }
        }
        
        wx.hideLoading()
        that.setData({
          waitActivity: res.data.data.waitActivity,//未参与的活动
          marActivity: res.data.data.marActivity,//已参与活动
          disPrice: res.data.data.disPrice,
          totalPrice: res.data.data.beforeActivityPrice,
          merOrder: merOrder,
         
        })
      }
    })
  },
  choosePay:function(){
    var that = this;
    if(that.data.type == 1){
      that.setData({
        showReady: true
      })
    }else{
      this.setData({
        showBlack: true
      })
    }
    
  },
  chooseClose:function(){
    this.setData({
      showReady: false
    })
  },
  chooseType:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    that.setData({
      isReady: type,
    })
  },
  sureChoose:function(){
    this.setData({
      showBlack: true,
      showReady: false
    })
  },
  close: function () {
    this.setData({
      showBlack: false
    })
  },                                                                                                               
  wxPay:function(){
    var that = this;
    if(that.data.canClick != 1){  
      return;
    }
    that.setData({
      canClick: 0
    })//防止多次点击
    if(that.data.phone.length != 11){
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
    for (var i = 0; i < that.data.goodsList.length; i++) {
      var row = {};
      row.id = that.data.goodsList[i].id;
      row.number = that.data.goodsList[i].buyNum;
      json.push(row)
    }
    if(json.length == 0){
      json = ""
    }else{
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
    if (that.data.marActivity != null){
      marActivityId = that.data.marActivity.id;
    }
    var merTicketId = "";
    if (that.data.merOrder.merTicket != null){
      merTicketId = that.data.merOrder.merTicket.id;
    }
    var nowtime = new Date().getTime();
    var sign = app.createMD5('submitMerchaniseOrder', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/submitMerchaniseOrder',
      data: {
        phone:that.data.phone,
        address: that.data.type2address,
        deliveryType: that.data.type - 1,//取货方式 0 自取,1送达;
        featureAppNo: app.globalData.sellfeatureAppNo,//场次唯一编码
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        appUserId:app.globalData.userInfo.id,
        merchandiseInfo: json,
        activityId: marActivityId, //参与的活动的id
        isReady:that.data.isReady,
        memo: that.data.userMessage,
        merTicketId:merTicketId,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if (res.data.status == 0) {
          wx.showModal({
            title: '',
            content: res.data.message,
          })
          return;
        }
        var ordernum = res.data.data.orderNum;
        // console.log(ordernum)
        var nowtime = new Date().getTime();
        var sign = app.createMD5('minipay', nowtime);
        wx.request({
          url: app.globalData.url + '/api/shOrder/minipay',
          data: {
            appUserId: app.globalData.userInfo.id,
            orderNum:ordernum,
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
              success:function(res){
                // console.log(res)
                wx.redirectTo({
                  url: '../foodSuccess/foodSuccess?orderNum=' + ordernum,
                })
              },
              fail:function(res){
                // console.log(res)
                that.setData({
                  canClick: 1
                })
              }
            })
          }
        })
      }
    })
  },
  cardPay: function () {
    var that = this;
    if (that.data.canClick != 1) {
      return;
    }
    that.setData({
      canClick: 0
    })//防止多次点击
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
    if(that.data.password.length == 0) {
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
    wx.showLoading({
      title: '支付中',
    })
    var nowtime = new Date().getTime();
    var sign = app.createMD5('submitMerchaniseOrder', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/submitMerchaniseOrder',
      data: {
        phone: that.data.phone,
        address: that.data.type2address,
        deliveryType: that.data.type - 1,//取货方式 0 自取,1送达;
        featureAppNo: app.globalData.sellfeatureAppNo,//场次唯一编码
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        appUserId: app.globalData.userInfo.id,
        merchandiseInfo: json,
        activityId: marActivityId, //参与的活动的id
        isReady: that.data.isReady,
        memo: that.data.userMessage,
        merTicketId: merTicketId,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res)
        if (res.data.status == 0) {
          wx.showModal({
            title: '',
            content: res.data.message,
          })
          wx.hideLoading()
          return;
        }
        var ordernum = res.data.data.orderNum;
        // console.log(ordernum)
        var nowtime = new Date().getTime();
        var sign = app.createMD5('cardPay', nowtime);
        wx.request({
          url: app.globalData.url + '/api/shOrder/cardPay',
          data: {
            appUserId: app.globalData.userInfo.id,
            orderNum: ordernum,
            password: that.data.password,
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
              if (res.data.code == "not_enough_balance"){
                wx.showModal({
                  title: '',
                  content: res.data.message,
                  success:function(res){
                    if (res.confirm){
                      wx.redirectTo({
                        url: '../mycard/mycard',
                      })
                    }
                  }
                })
              }else{
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
                  url: '../foodSuccess/foodSuccess?orderNum=' + ordernum,
                })
              }, 1000)
            }
          }
        })
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
            wx.redirectTo({
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
  },
  chooseCoupon:function(){
    this.setData({
      startChoose:true
    })
  },
  setFoodCoupon:function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    let merOrder = that.data.merOrder;
    if (merOrder){
      merOrder.merTicket.conponId = id;
      that.setData({
        merTicketId: id,
        merOrder: merOrder
      })
    }
    
   // that.ask();
  },
  closeChoose: function () {
    this.setData({
      startChoose: false
    })
  },
  messageshow: function () {
    this.setData({
      messageshow: true
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
  }
})