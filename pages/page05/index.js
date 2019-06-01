//获取应用实例
const app = getApp();
// 获取远程余额回调函数
const getCallBack = function (username, password, cinemacode, cardno, cardpassword, callback) {
  var card = [];
  var data = {
    Username: username,
    PassWord: password,
    CinemaCode: cinemacode,
    CardNo: cardno,
    CardPassword: cardpassword
  };
  wx.request({
    url: 'https://xc.80piao.com:8443/Api/Member/QueryCard' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword,
    method: 'GET',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      callback && callback(res.data.card);
      return res.data.card;
    }
  })
}
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
    face: '',
    userCardList: ''
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
          var givenAmount = "rule[" + i + "].givenAmount"
          _this.setData({
            levelName: levelRule.levelName,
            [credit]: rule[i].credit,
            [ruleCode]: rule[i].ruleCode,
            [givenAmount]: rule[i].givenAmount
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
      CardNo: cardno,
      CardPassword: pass,
      ChargeType: 'WxPay',
      RuleCode: ruleCode,
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
          // 微信支付接口
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.packages,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          success(res) {
            if (res.errMsg == "requestPayment:ok") {
              wx.request({
                url: 'https://xc.80piao.com:8443/Api/Member/CardCharge' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword + '/' + data.ChargeType + '/' + data.RuleCode + '/' + data.ChargeAmount, 
                method: 'GET',
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  if (res.data.Status == "Success") {
                    wx.showToast({
                      title: '充值成功！',
                      icon: 'none',
                      duration: 2000
                    });
                    _this.setData({ showAlertExchange2: !_this.data.showAlertExchange2 })
                    setTimeout(function () {
                      wx.redirectTo({
                        url: '../page05/index',
                      })
                    }, 1000) 
                  }
                }
              })
            }
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
  login: function () {
    wx.navigateTo({
      url: '../page04/index',
    })
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
    // 设置头像 昵称
    wx.getStorage({
      key: 'accredit',
      success: function (res) {
        that.setData({
          face: res.data.userInfo.avatarUrl,
          username: res.data.userInfo.nickName
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
        var status = [];
        var userCardList = [];
        var n = 0;
        var username = '';
        var score = '';
        var memberCard = res.data.data.memberCard;
        // 判断是否绑定了会员卡  未绑定则跳转至绑定页面
        if (memberCard == null) {
          wx.getStorage({
            key: 'accredit',
            success: function (res) {
              that.setData({
                face: res.data.userInfo.avatarUrl,
                username: res.data.userInfo.nickName,
                score: 0
              })
            },
          });
            wx.navigateTo({
              url: '../page04/index',
            })
        } 
        // 将已绑定的会员卡循环出来
        else {
          // 循环出已绑定的会员卡
          for (var i = 0; i < memberCard.length; i++) {
            if ( memberCard[i].status == 1 ) {
              status.push(memberCard[i]);
            }
          }
          // 循环绑定会员卡调用方法请求到最新的余额以及积分
          for (let i = 0; i < status.length; i++) {
            getCallBack(data.Username, data.PassWord, data.CinemaCode, status[i].cardNo, status[i].cardPassword, function (res)             {
              userCardList.push(res);
              that.setData({
                userCardList: userCardList
              })
            })   
          }
          // 设置计时器解决request异步问题
          setTimeout(function () { 
            var card = that.data.userCardList;
            for (let i = 0; i < card.length; i++) {
              var num = "status[" + i + "].num";
              var levelName = "status[" + i + "].levelName";
              var balance = "status[" + i + "].balance";
              var levelCode = "status[" + i + "].levelCode";
              var pass = "status[" + i + "].pass";
              if (card[i].balance == null) {
                that.setData({
                  [balance]: 0,
                  [num]: card[i].cardNo,
                  [pass]: card[i].cardPassword,
                  [levelName]: card[i].levelName,
                  [levelCode]: card[i].levelCode
                })
              } else {
                that.setData({
                  [num]: card[i].cardNo,
                  [pass]: card[i].cardPassword,
                  [levelName]: card[i].levelName,
                  [balance]: card[i].balance,
                  [levelCode]: card[i].levelCode,
                })
              }
            }
            }, 1000);
          // 计算余额最多的会员卡
          var first = status.sort(function (a, b) { return a.balance < b.balance })[0];
          first.cinemaCode = that.data.cinemaCode;
          var cardList = []
          if (first.score == null) {
            first.score = 0
          }
          cardList.push(first);
          app.globalData.cardList = cardList;
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