//获取应用实例
const app = getApp()
let _this;
Page({
  // 页面的初始数据
  data: {
    showAlertExchange: false,
    showAlertExchange2: false,
    username: null,
    score: null,
    cardno: '',
    pass: '',
    price: '',
    levelcode: '',
    levelName: '',
    credit: '',
    openId: '',
    cinemaCode: '',
    ruleCode: '',
    show: ''
  },
  btnShowExchange: (e) => {
    _this.setData({ showAlertExchange: !_this.data.showAlertExchange })
  },
  btnShowExchange2: (e) => {
    var cardno = e.currentTarget.dataset.cardno;
    var pass = e.currentTarget.dataset.pass;
    var levelcode = e.currentTarget.dataset.code;
    _this.setData({
      cardno: cardno,
      pass: pass,
      levelcode: levelcode,
      showAlertExchange2: !_this.data.showAlertExchange2
    });
    var cardNo = _this.data.cardno;
    var levelcode = _this.data.levelcode;
    let cinemaCode = app.globalData.cinemaList.cinemaCode;
    var data = {
      Username: "MiniProgram",
      Password: "6BF477EBCC446F54E6512AFC0E976C41",
      CinemaCode: cinemaCode,
      CardNo: cardNo,
      LevelCode: levelcode
    };
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/QueryMemberCardLevelRule' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LevelCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var levelRule = res.data.data;
        var rule = levelRule.rule;
        for (var i = 0; i < rule.length; i ++) {
          var credit = "rule[" + i + "].credit";
          var ruleCode = "rule[" + i + "].ruleCode";
          _this.setData({
            levelName: levelRule.levelName,
            [credit]: rule[i].credit,
            [ruleCode]: rule[i].ruleCode
          })
        }
      }
    })
  },
  btnChoose: (e) => {
    let price = e.currentTarget.dataset.price;
    let idx = e.currentTarget.dataset.id;
    let rulecode = e.currentTarget.dataset.rule;
    let temp = _this.data.rule;
    temp.forEach((item, index) => {
      if (index == idx) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
    _this.setData({ 
      rule: temp,
      price: price,
      ruleCode: rulecode
    })
  },
  // 预支付
  pay: function () {
    let price = _this.data.price;
    let cardno = _this.data.cardno;
    let pass = _this.data.pass;
    let cinemaCode = app.globalData.cinemaList.cinemaCode;
    let openId = _this.data.openId;
    let ruleCode = _this.data.ruleCode;
    var data = {
      Username: "MiniProgram",
      Password: "6BF477EBCC446F54E6512AFC0E976C41",
      CinemaCode: cinemaCode,
      OpenID: openId,
      ChargeAmount: price,
      RuleCode: ruleCode
    };
    // console.log(_this.data.openId)
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/PrePayCardCharge' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.RuleCode + '/' + data.ChargeAmount,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
      }
    })
  },
  closeShow: (e) => {
    _this.setData({ showAlertExchange2: !_this.data.showAlertExchange2 })
  },
  btnChoose2: (e) => {
    // console.log(e);
    let idx = e.currentTarget.dataset.id;
    let temp = _this.data.exchangeList2;
    temp.forEach((item, index) => {
      if (index == idx) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
    _this.setData({ exchangeList2: temp })
  },
  btnDelete: (e) => {
    // console.log(e);
    let idx = e.currentTarget.dataset.id;
    wx.showModal({
      title: '解绑',
      content: "解除绑定后,将不再享受相应的会员权益",
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#d20909",
      confirmText: "确定",
      confirmColor: "#999999",
      success: function (res) {

      },
      fail: function (res) {

      },
      complete: function (res) {

      }
    });
  },
  // 清除缓存 方便真机调试
  // clear: function () {
  //   wx.clearStorage()
  //   console.log(1)
  // },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    // console.log(app.globalData)
    that.setData({
      openId: app.globalData.openId,
      cinemaCode: app.globalData.cinemacode
    })
    // console.log(that.data.openId)
    var data = {
      Username: 'MiniProgram',
      PassWord: '6BF477EBCC446F54E6512AFC0E976C41',
      OpenID: that.data.openId,
      CinemaCode: that.data.cinemaCode
    }
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/QueryMemberCardByOpenID' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode + '/' + data.OpenID,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var memberCard = [];
        var allScore = [];
        var status = [];
        var n = 0;
        var username = '';
        var score = '';
        var memberCard = res.data.data.memberCard;
        if (memberCard == null) {
          that.setData({
            username: '未登录',
            score: 0
          });
          wx.showToast({
            title: '3秒后自动跳转至登录',
            icon: 'none',
            duration: 3000
          });
          setTimeout(function () {
            wx.navigateTo({
              url: '../page04/index',
            })
          },3000) 
        } 
        else {
          for (var i = 0; i < memberCard.length; i++) {
            if ( memberCard[i].status == 1 ) {
              status.push(memberCard[i]);
            }
          }
          for (var i = 0; i < status.length; i++) {
            var num = "status[" + i + "].num";
            var levelName = "status[" + i + "].levelName";
            var balance = "status[" + i + "].balance";
            var levelCode = "status[" + i + "].levelCode";
            allScore.push(status[i].score)
            that.setData({
              [num]: status[i].cardNo,
              [levelName]: status[i].levelName,
              [balance]: status[i].balance,
              [levelCode]: status[i].levelCode,
              username: status[0].userName,
            })
          }
          // 计算总积分
          for (let i = 0; i < allScore.length; i++) {
            n += allScore[i];
          }
          that.setData({
            score: n
          })
        }
      }
    })
    _this = this;
    wx.setNavigationBarTitle({ title: '会员卡' });
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () { },
  // 生命周期函数--监听页面显示
  onShow: function () { },
  // 生命周期函数--监听页面隐藏
  onHide: function () { },
  // 生命周期函数--监听页面卸载
  onUnload: function () { },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () { },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () { },
  // 用户点击右上角分享
  onShareAppMessage: function () { }
})