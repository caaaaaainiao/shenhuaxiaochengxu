//获取应用实例
const app = getApp();
let _this;
Page({
  // 页面的初始数据
  data: {
    showAlertExchange: false,
    showAlertExchange2: false,
    username: '',
    userName: '',
    passWord: '',
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
    show: '',
    face: ''
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
    let username = _this.data.userName;
    let password = _this.data.passWord;
    var data = {
      Username: username,
      Password: password,
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
    let username = _this.data.userName;
    let password = _this.data.passWord;
    var data = {
      Username: username,
      Password: password,
      CinemaCode: cinemaCode,
      OpenID: openId,
      ChargeAmount: price,
      RuleCode: ruleCode
    };
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/PrePayCardCharge' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.RuleCode + '/' + data.ChargeAmount,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data.data)
        // var str = res.data.data.nonceStr.toUpperCase();
        // console.log(str)
          // 微信支付接口
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          // nonceStr: str,
          nonceStr: res.data.data.nonceStr.toUpperCase(),
          package: res.data.data.packages,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          success(res) {
            console.log(res)
           },
          fail(res) {
            wx.showToast({
              title: res.err_desc,
              icon: 'none',
              duration: 3000
            });
            console.log(res)
           } 
        })
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
  // 解绑
  btnDelete: function (e) {
    // console.log(e)
    var that = this;
    let cardno = e.currentTarget.dataset.cardno;
    let pass = e.currentTarget.dataset.pass;
    var data = {
      Username: that.data.userName,
      Password: that.data.passWord,
      CinemaCode: that.data.cinemaCode,
      CardNo: cardno,
      CardPassword: pass,
      OpenID: that.data.openId,
    };
    wx.showModal({
      title: '解绑',
      content: "解除绑定后,将不再享受相应的会员权益",
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#d20909",
      confirmText: "确定",
      confirmColor: "#999999",
      success: function (res) {
        wx.request({
          url: 'https://xc.80piao.com:8443/Api/Member/MemberCardUnbind'+ '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            wx.showToast({
              title: '解绑成功！',
              icon: 'none',
              duration: 3000
            });
            wx.redirectTo({
              url: '../page05/index',
            })
          }
        })
      },
      // fail: function (res) {

      // },
      // complete: function (res) {

      // }
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
    // 设置头像
    wx.getStorage({
      key: 'accredit',
      success: function (res) {
        that.setData({
          face: res.data.userInfo.avatarUrl
        })
      },
    })
    that.setData({
      openId: app.globalData.openId,
      cinemaCode: app.globalData.cinemacode,
      userName: app.usermessage.Username,
      passWord: app.usermessage.Password,
    })
    var data = {
      Username: that.data.userName,
      PassWord: that.data.passWord,
      OpenID: that.data.openId,
      CinemaCode: that.data.cinemaCode
    }
    // 读取已绑定的会员卡
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
        // 判断是否绑定了会员卡  未绑定则跳转至绑定页面
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
            wx.redirectTo({
              url: '../page04/index',
            })
          },3000) 
        } 
        // 将已绑定的会员卡循环出来
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
            var pass = "status[" + i + "].pass";
            allScore.push(status[i].score)
            that.setData({
              [num]: status[i].cardNo,
              [pass]: status[i].cardPassword,
              [levelName]: status[i].levelName,
              [balance]: status[i].balance,
              [levelCode]: status[i].levelCode,
              username: status[0].userName,
            })
          }
          // 计算余额最多的会员卡
          var first = status.sort(function (a, b) { return a.balance < b.balance })[0];
          first.cinemaCode = that.data.cinemaCode;
          var cardList = [];
          cardList.push(first)
          app.globalData.cardList = cardList;
          console.log(app.globalData.cardList)
          // 判断积分  显示余额最多的积分
          if (first.score == null) {
            that.setData({
              score: 0
            })
          } else {
            that.setData({
              score: first.score
            })
          }
        }
      }
    })
    _this = this;
    wx.setNavigationBarTitle({ title: '会员卡' });
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () { },
  // 生命周期函数--监听页面显示
  onShow: function () {
   },
  // 生命周期函数--监听页面隐藏
  onHide: function () { },
  // 生命周期函数--监听页面卸载
  onUnload: function () {
    // wx.reLaunch({
    //   url: '../logs/logs'
    // })
   },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () { },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () { },
  // 用户点击右上角分享
  onShareAppMessage: function () { }
})