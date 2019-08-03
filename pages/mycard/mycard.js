// pages/mycard/mycard.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMember: true,
    type: 1, //1 充值 2解绑
    swiperIndex: "0",
    userInfo: null,
    phone: null,
    cardnum: "",
    cardmm: "",
    index: -1,
    orderNumber: 0,
    activity: [],
    isShow: true,
    disabled: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
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
      url: app.globalData.url + '/Api/Member/QueryMemberCardByOpenID' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode + '/' + data.OpenID,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res)
        // 如果有已经绑定的会员卡
        if (res.data.data.memberCard && res.data.data.memberCard.length > 0) {
          if (!res.data.data.memberCard[0].balance || res.data.data.memberCard[0].balance == '') {
            res.data.data.memberCard[0].balance = 0
          }
          that.setData({
            card: res.data.data.memberCard[0]
          });
          app.globalData.card = res.data.data.memberCard[0];
          let levelCode = res.data.data.memberCard[0].levelCode;
          // 读取绑定的会员卡的充值规则
          wx.request({
            url: app.globalData.url + '/Api/Member/QueryMemberCardLevelRule' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode + '/' + levelCode,
            method: 'GET',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function(res) {
              console.log(res)
              if (res.data.Status == 'Success') {
                let rule = res.data.data.rule;
                for (let i = 0; i < rule.length; i++) {
                  rule[i]['select'] = 0;
                  var credit = "rule[" + i + "].credit";
                  var ruleCode = "rule[" + i + "].ruleCode";
                  var givenAmount = "rule[" + i + "].givenAmount"
                  that.setData({
                    [credit]: rule[i].credit,
                    [ruleCode]: rule[i].ruleCode,
                    [givenAmount]: rule[i].givenAmount
                  })
                }
                that.setData({
                  rule: rule,
                })
              }
            }
          })
        }
      }
    });
    // 获取线上可开会员卡信息
    wx.request({
      url: app.globalData.url + '/Api/Member/QueryMemberCardLevel' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res)
        // 如果没有开卡规则 则隐藏开卡按钮
        if (res.data.Status != 'Success' || !res.data.data || !res.data.data.level || res.data.data.level.length < 1) {
          that.setData({
            isShow: false,
          })
        } else { // 如果有开卡规则  获取卡背景图
          for (let i = 0; i < res.data.data.level.length; i++) {
            if (res.data.data.level[i].isOnlineOpenCard == 1 && res.data.data.level[i].memberCardImage) {
              let level = res.data.data.level[i];
              that.setData({
                memberCardImage: level.memberCardImage,
              })
            }
          }
        }
      }
    })
    wx.setNavigationBarTitle({
      title: '会员卡'
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
  swiperChange: function(e) {
    // console.log(e.detail)
    var that = this;
    if (e.detail.current == 0) {
      that.setData({
        type: 1
      })
    } else if (e.detail.current == 1) {
      that.setData({
        type: 2
      })
    }
  },
  changeTap: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      that.setData({
        type: 1,
        swiperIndex: 0
      })
    } else if (type == 2) {
      that.setData({
        type: 2,
        swiperIndex: 1
      })
    }
  },
  // 获取手机号码
  onInput: function(e) {
    this.setData({
      cardnum: e.detail.value
    })
  },
  // 获取密码
  onInput2: function(e) {
    this.setData({
      cardmm: e.detail.value
    })
  },
  // 绑定会员卡
  bang: function() {
    wx.showLoading({
      title: '绑定中',
    })
    let that = this;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    var openID = app.globalData.userInfo.openID;
    var userName = that.data.userName;
    var passWord = that.data.passWord;
    var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var data = {
      Username: userName,
      Password: passWord,
      CinemaCode: cinemaCode,
      OpenID: openID,
      CardNo: that.data.cardnum,
      CardPassword: that.data.cardmm,
    };
    wx.request({
      // 会员卡号
      url: app.globalData.url + '/Api/Member/LoginCard' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardNo + '/' + data.CardPassword,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res);
        wx.hideLoading();
        if (res.data.Status == "Success") {
          var cinemaCode = res.data.cinemaCode;
          var cardNo = res.data.card.cardNo;
          var cardPassword = res.data.card.cardPassword;
          var phone = res.data.card.mobilePhone;
          var userName = data.Username;
          var passWord = data.Password;
          var openID = data.OpenID;
          wx.showToast({
            title: '绑定成功',
            duration: 2000,
            icon: "loading"
          })
          wx.redirectTo({
            url: '../mycard/mycard',
          })
        } else {
          wx.showToast({
            title: res.data.ErrorMessage,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },
  // 选择充值金额
  chooseMoney: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var rule = that.data.rule;
    for (var i = 0; i < rule.length; i++) {
      rule[i].select = 0;
    }
    rule[index].select = 1;
    that.setData({
      rule: rule,
      index: index,
    })
  },
  // 充值
  recharge: function() {
    var that = this;
    if (that.data.index == -1) {
      wx.showModal({
        title: '',
        content: '请选择支付金额',
        showCancel: true,
      })
      return;
    };
    // 防止多次点击
    if (that.data.disabled == 0) {
      return;
    } else {
      that.setData({
        disabled: 0,
      })
    }
    // 选择充值的金额
    var rechargeMoney = that.data.rule[that.data.index].credit;
    wx.showLoading({
      title: '加载中..',
      mask: true
    });
    // 筛选出选中的金额的充值规则
    for (let i = 0; i < that.data.rule.length; i++) {
      if (that.data.rule[i].select == 1) {
        that.setData({
          selectRule: that.data.rule[i],
        })
      }
    };
    let card = app.globalData.card;
    // 预支付
    wx.request({
      url: app.globalData.url + '/Api/Member/PrePayCardCharge' + '/' + that.data.userName + '/' + that.data.passWord + '/' + app.globalData.cinemaList.cinemaCode + '/' + app.globalData.userInfo.openID + '/' + card.levelCode + '/' + that.data.selectRule.ruleCode + '/' + that.data.selectRule.credit + '/' + card.cardNo + '/' + card.cardPassword,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.Status == 'Success') {
          // 微信支付接口
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.packages,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success(res) {
              that.setData({
                disabled: 1,
              });
              console.log(res)
              if (res.errMsg == "requestPayment:ok") {
                // 获取远程售票系统会员卡积分余额
                wx.request({
                  url: app.globalData.url + '/Api/Member/QueryCard' + '/' + that.data.userName + '/' + that.data.passWord + '/' + app.globalData.cinemaList.cinemaCode + '/' + card.cardNo + '/' + card.cardPassword,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function(res) {
                    console.log(res)
                    if (res.data.Status == 'Success') {
                      that.setData({
                        card: res.data.card,
                      })
                    }
                  }
                })
              }
            },
            fail(res) {
              that.setData({
                disabled: 1,
              });
              wx.hideLoading();
              wx.showToast({
                title: res.err_desc,
                icon: 'none',
                duration: 3000
              });
            }
          })
        }
      }
    })
  },
  // 解绑
  untying: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否解绑会员卡',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + '/Api/Member/MemberCardUnbind' + '/' + that.data.userName + '/' + that.data.passWord + '/' + that.data.cinemaCode + '/' + that.data.card.cardNo + '/' + that.data.openId,
            method: 'GET',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function(res) {
              console.log(res)
              if (res.data.Status == 'Success') {
                wx.showToast({
                  title: '解绑成功！',
                  icon: 'none',
                  duration: 3000
                });
                setTimeout(function() {
                  wx.redirectTo({
                    url: '../mycard/mycard',
                  })
                }, 1000)
              } else {
                wx.showToast({
                  title: '解绑失败' + res.data.ErrorMessage,
                  icon: 'none',
                  duration: 3000
                });
              }
            }
          })
        }
      }
    })
  },
  // 查看充值记录
  record: function() {
    wx.navigateTo({
      url: '../cardRecord/cardRecord',
    })
  },
  // 开卡
  openCard: function() {
    wx.navigateTo({
      url: '../openCard/openCard',
    })
  }
})