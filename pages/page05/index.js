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
    credit: ''
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
          _this.setData({
            levelName: levelRule.levelName,
            [credit]: rule[i].credit
          })
        }
      }
    })
  },
  btnChoose: (e) => {
    let price = e.currentTarget.dataset.price;
    let idx = e.currentTarget.dataset.id;
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
      price: price
    })
  },
  pay: (e) => {
    let price = _this.data.price;
    let cardno = _this.data.cardno;
    let pass = _this.data.pass;
    let cinemaCode = app.globalData.cinemaList.cinemaCode;
    var data = {
      Username: "MiniProgram",
      Password: "6BF477EBCC446F54E6512AFC0E976C41",
      CinemaCode: cinemaCode,
      CardNo: cardno,
      CardPassword: pass,
      ChargeType: 'WxPay',
      ChargeAmount: price
    };
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/CardCharge' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.ChargeType + '/' + data.ChargeAmount,
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
    console.log(e);
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
    console.log(e);
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
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    console.log(options)
    var that = this;
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/QueryMemberCardByOpenID' + '/' + options.Username + '/' + options.PassWord + '/' + options.CinemaCode + '/' + options.OpenID,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var memberCard = [];
        var allScore = [];
        var n = 0;
        var username = '';
        var score = '';
        var memberCard = res.data.data.memberCard
        for (var i = 0; i < memberCard.length; i++) {
          var num = "memberCard[" + i + "].num";
          var levelName = "memberCard[" + i + "].levelName";
          var balance = "memberCard[" + i + "].balance";
          var levelCode = "memberCard[" + i + "].levelCode";
          allScore.push(memberCard[i].score)
          that.setData({
            [num]: memberCard[i].cardNo,
            [levelName]: memberCard[i].levelName,
            [balance]: memberCard[i].balance,
            [levelCode]: memberCard[i].levelCode,
            username: memberCard[0].userName,       
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