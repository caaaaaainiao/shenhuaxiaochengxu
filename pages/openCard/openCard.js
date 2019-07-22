// pages/openCard/openCard.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    sex:"1",
    passward:"",
    passward2:"",
    birthday:"",
    name:"",
    cardId: '120101200005299837', //身份证号码
    isShow: false,
    cinematype: 1,
    showAlertExchange2: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    that.setData({
      openId: app.globalData.openId,
      cinemaCode: app.globalData.cinemacode,
      userName: app.usermessage.Username,
      passWord: app.usermessage.Password,
      userInfo: app.globalData.userInfo,
    })
    var data = {
      Username: that.data.userName,
      PassWord: that.data.passWord,
      OpenID: that.data.openId,
      CinemaCode: that.data.cinemaCode
    }
    // 满天星需要输入身份证号码
    if (app.globalData.cinemaList.cinemaType == '满天星') {
      that.setData({
        isShow: true,
      })
    }
    
    // 获取线上可开会员卡信息
    wx.request({
      url: app.globalData.url + '/Api/Member/QueryMemberCardLevel' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == 'Success' && res.data.data.level && res.data.data.level.length > 0) {
          for (let i = 0;i < res.data.data.level.length;i ++) {
            if (res.data.data.level[i].isOnlineOpenCard == 1) {
              let level = res.data.data.level[i];
              if (level.credit) {
                that.setData({
                  levelCode: level.levelCode, // 等级编号
                  ruleCode: level.ruleCode, //  规则编码
                  credit: level.credit, // 初始金额
                })
              } else {
                that.setData({
                  levelCode: level.levelCode, // 等级编号
                  ruleCode: level.ruleCode, //  规则编码
                  credit: 0, // 初始金额
                })
              }
            }
          }
        }
      }
    })
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
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  setPassword:function(e){
    this.setData({
      passward:e.detail.value
    })
  },
  surePassword: function (e) {
    this.setData({
      passward2: e.detail.value
    })
  },
  setName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  // 查看会员协议
  cinemaAgreement: function () {
    let that = this;
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
  closeCinemaAgreement: function () {
    let that = this;
    that.setData({
      cinemaAgreement: false,
    })
  },
  setSex: function (e) {
    this.setData({
      sex: e.currentTarget.dataset.sex
    })
  },
  setBirthday: function (e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  closeShow: function () {
    let that = this;
    that.setData({
      showAlertExchange2: !that.data.showAlertExchange2
    })
  },
  open:function(){
    var that = this;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    var cinemaType = app.globalData.cinemaList.cinemaType;
    var data = {
      Username: that.data.userName,
      Password: that.data.passWord,
      CinemaCode: cinemaCode,
      OpenID: that.data.openId,
      // 会员卡密码
      CardPassword: that.data.passward,
      // 等级编号
      LevelCode: that.data.levelCode,
      // 规则编码
      RuleCode: that.data.ruleCode,
      // 初始金额
      InitialAmount: that.data.credit,
      // 用户名
      CardUserName: that.data.name,
      // 手机号
      MobilePhone: that.data.userInfo.mobilePhone,
      // 身份证号
      IDNumber: that.data.cardId,
      // 性别
      Sex: that.data.sex
    };
    var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (that.data.passward == '' || that.data.name == '' || that.data.index002 == '') {
      wx.showToast({
        title: '请填写必要信息！',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.passward != that.data.passward2) {
      wx.showToast({
        title: '密码不一致！',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.showModal({
      title: '是否立即开卡',
      content: '您当前所处' + app.globalData.cinemaList.cinemaName + '请确保填入的信息准确无误',
      success(res) {
        if (res.confirm) { // 点击确认则开卡
          wx.showLoading({
            title: '开卡中',
          });
          if (cinemaType != "粤科") {
            // 如果开卡不需要充值
            if (data.InitialAmount == 0) {
              wx.request({
                url: app.globalData.url + '/Api/Member/CardRegister' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardPassword + '/' + data.LevelCode + '/' + data.RuleCode + '/' + data.InitialAmount + '/' + data.CardUserName + '/' + data.MobilePhone + '/' + data.IDNumber + '/' + data.Sex,
                method: 'GET',
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  wx.hideLoading();
                  if (res.data.Status == 'Success') {
                    wx.showToast({
                      title: '开卡成功！',
                      icon: 'none',
                      duration: 2000
                    });
                    wx.redirectTo({
                      url: '../mycard/mycard',
                    })
                  } else if (res.data.Status == 'Failure') {
                    wx.showToast({
                      title: res.data.ErrorMessage,
                      icon: 'none',
                      duration: 3000
                    })
                  }
                }
              })
            } else {
              // 影院设置了开卡金额  需要进行充值
               // 预支付
                wx.request({
                  url: app.globalData.url + '/Api/Member/PrePayCardRegister' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.LevelCode + '/' + data.RuleCode + '/' + data.InitialAmount + '/' + data.CardUserName + '/' + data.CardPassword + '/' + data.IDNumber + '/' + data.Sex,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function (res) {
                    console.log(res)
                    // 微信支付接口
                    wx.requestPayment({
                      timeStamp: res.data.data.timeStamp,
                      nonceStr: res.data.data.nonceStr,
                      package: res.data.data.packages,
                      signType: res.data.data.signType,
                      paySign: res.data.data.paySign,
                      success(res) {
                        // 成功之后调取开卡接口
                        if (res.errMsg == "requestPayment:ok") {
                          wx.hideLoading();
                          wx.showToast({
                            title: '开卡成功！',
                            icon: 'none',
                            duration: 2000
                          });
                          that.setData({
                            showAlertExchange2: !that.data.showAlertExchange2
                          });
                          setTimeout(function () {
                            wx.redirectTo({
                              url: '../mycard/mycard',
                            })
                          }, 1000)
                        } else {
                          wx.hideLoading();
                          wx.showModal({
                            title: '开卡失败',
                            content: '支付金额将在三个工作日内退回',
                          })
                        }
                      },
                      fail(res) {
                        wx.hideLoading();
                        wx.showToast({
                          title: res.err_desc,
                          icon: 'none',
                          duration: 3000
                        });
                      }
                    })
                  }
                })
              
            }
          }
          //  else if (cinemaType == "电影1905" || cinemaType == "满天星") {
          //   // 此售票系统需进行充值  调取多个接口
          //   that.setData({
          //     showAlertExchange2: !that.data.showAlertExchange2
          //   });
          //   // 获取开卡充值金额
          //   wx.request({
          //     url: app.globalData.url + '/Api/Member/QueryMemberCardLevelRule' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LevelCode,
          //     method: 'GET',
          //     header: {
          //       'content-type': 'application/json' // 默认值
          //     },
          //     success: function (res) {
          //       console.log(res)
          //       if (res.data.Status == 'Success' && res.data.data.rule && res.data.data.rule.length > 0) {
          //         let rule = res.data.data.rule[0];
          //         that.setData({

          //         })
          //       } else if (res.data.Status == 'Success' && res.data.data.rule.length < 1) {
          //         // 如果没设置起充金额
          //         wx.request({
          //           url: app.globalData.url + '/Api/Member/CardRegister' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardPassword + '/' + data.LevelCode + '/' + data.RuleCode + '/' + data.InitialAmount + '/' + data.CardUserName + '/' + data.MobilePhone + '/' + data.IDNumber + '/' + data.Sex,
          //           method: 'GET',
          //           header: {
          //             'content-type': 'application/json' // 默认值
          //           },
          //           success: function (res) {
          //             if (res.data.Status == 'Success') {
          //               wx.showToast({
          //                 title: '开卡成功！',
          //                 icon: 'none',
          //                 duration: 2000
          //               });
          //               wx.redirectTo({
          //                 url: '../mycard/mycard',
          //               })
          //             } else if (res.data.Status == 'Failure') {
          //               wx.showToast({
          //                 title: res.data.ErrorMessage,
          //                 icon: 'none',
          //                 duration: 3000
          //               })
          //             }
          //           }
          //         })
          //       } else {
          //         wx.showToast({
          //           title: res.data.ErrorMessage,
          //           icon: 'none',
          //           duration: 3000
          //         })
          //       }
          //     },
          //   })
          // }
        } else if (res.cancel) {
          return
        }
      }
    })
  }
})