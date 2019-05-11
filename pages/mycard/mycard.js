// pages/mycard/mycard.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMember:true,
    type:1,//1 充值 2解绑
    money:[
      { money: 100, select: false },
      { money: 200, select: false },
      { money: 300, select: false },
      { money: 400, select: false },
      { money: 500, select: false },
      { money: 800, select: false },
      // { money: 1000, select: false }
    ],
    swiperIndex:"0",
    userInfo:null,
    phone:null,
    cardnum:"",
    cardmm:"",
    index:-1,
    orderNumber:0,
    activity:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      userInfo:app.globalData.userInfo
    })
    // console.log(app.globalData.userInfo)
    if (that.data.userInfo.dxInsiderInfo != null){
      that.syn();
      that.activity();
    }
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
  swiperChange:function(e){
    // console.log(e.detail)
    var that = this;
    if(e.detail.current == 0){
      that.setData({
        type:1
      })
    } else if (e.detail.current == 1) {
      that.setData({
        type: 2
      })
    }
  },
  changeTap:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    if(type == 1){
      that.setData({
        type: 1,
        swiperIndex:0
      })
    } else if (type == 2) {
      that.setData({
        type: 2,
        swiperIndex: 1
      })
    }
  },
  // blur:function(e){
  //   this.setData({
  //     phone:e.detail.value
  //   })
  // },
  onInput:function(e){
    this.setData({
      cardnum:e.detail.value
    })
  },
  onInput2: function (e) {
    this.setData({
      cardmm: e.detail.value
    })
  },
  bang:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('bindcard', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shAppuser/bindcard',
      data: {
        pwd: that.data.cardmm,
        card:that.data.cardnum,
        appUserId:app.globalData.userInfo.id,
        cinemaCode:app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if(res.data.status == 1){
          wx.showToast({
            title: '绑定成功',
            duration:2000,
            icon:"loading"
          })
          // setTimeout(function(){
          //   wx.reLaunch({
          //     url: '/pages/index/index'
          //   })
          // },1000)
          var userInfo = res.data.data;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo;
          that.activity();
        }else{
          wx.showModal({
            title:'',
            content: res.data.message
          })
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
  chooseMoney:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var money = that.data.money;
    for(var i = 0;i < money.length;i++){
      money[i].select = false;
    }
    for (var i = 0; i < that.data.activity.length; i++) {
      var ruleName = that.data.activity[i].ruleName.substring(5, that.data.activity[i].ruleName.length)
      if (ruleName ==money[index].money) {
        that.setData({
          activityText: that.data.activity[i].ruleGroupRemark
        })
        break;
      }else{
        that.setData({
          activityText: ""
        })
      }
    }
    money[index].select = true;
    that.setData({
      money:money,
      index:index,
    })
  },
  recharge:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('minipay', nowtime);
    var rechargeMoney = that.data.money[that.data.index].money;
    // var realPrice = app.globalData.cinemaList[app.globalData.cinemaNo].rechargeDisconut * rechargeMoney;
    if (that.data.index == -1){
      wx.showModal({
        title: '',
        content: '请选择支付金额',
        showCancel: true,
      })
      return;
    }
    var ruleId = "";
    var ruleName = "";
    for(var i = 0;i < that.data.activity.length;i++){
      if (that.data.activity[i].ruleName.indexOf(rechargeMoney)>0){
        var name = that.data.activity[i].ruleName.substring(5, that.data.activity[i].ruleName.length);
        if (name == rechargeMoney){
          ruleId = that.data.activity[i].ruleId;
          ruleName = that.data.activity[i].ruleName;
        }   
        // console.log(that.data.activity[i].ruleGroupRemark)
      }
    }
    wx.showLoading({
      title: '加载中..',
      mask:true
    })
    wx.request({
      url: app.globalData.url + '/api/shCardRecharge/minipay',
      data: {
        appUserId: app.globalData.userInfo.id,
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        cardNum: that.data.userInfo.dxInsiderInfo.cardNumber,
        rechargeMoney: rechargeMoney,
        app:"2",
        realPrice: rechargeMoney,
        ruleName: ruleName,
        ruleId: ruleId,
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
          that.setData({
            orderNumber: res.data.data.orderNumber
          })
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success: function (res) {
              wx.showToast({
                title: '支付成功',
                mask: true,
                duration: 2000
              })
            //  console.log(res)
              that.syn();
            },
            fail: function (res) {
              wx.showModal({
                title: '充值失败',
                // content: 充值失败
              })
            }
          })
        } else {
          wx.showModal({
            title: '',
            content: res.data.message
          })
        }
      }
    })
  },
  untying:function(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否解绑会员卡',
      success:function(res){
        if(res.confirm){         
          var nowtime = new Date().getTime();
          var sign = app.createMD5('untyingCard', nowtime);
          wx.request({
            url: app.globalData.url + '/api/shAppuser/untyingCard',
            data: {
              appUserId: that.data.userInfo.id,
              card: that.data.userInfo.dxInsiderInfo.cardNumber,
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
                  userInfo: userInfo,
                  swiperIndex: "0",
                  type: 1
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
        }
      }
    })
  },
  activity: function () {//获取活动
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('queryActivity', nowtime);
    wx.request({
      url: app.globalData.url + '/api/cardOrder/queryActivity',
      data: {
        cardNum: app.globalData.userInfo.dxInsiderInfo.cardNumber,
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
        that.setData({
          activity:res.data.data
        })
      }
    })
  },
  record:function(){
    wx.navigateTo({
      url: '../cardRecord/cardRecord',
    })
  },
  openCard:function(){
    wx.navigateTo({
      url: '../openCard/openCard',
    })
  }
})