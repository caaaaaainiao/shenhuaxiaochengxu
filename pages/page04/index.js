//获取应用实例
const app = getApp()
let _this;
Page({
  // 页面的初始数据
  data: {
    isShow: false,
    tabContent: [1, 0, 0, 0, 0],
    array999: ['选择卡类别', '选择卡类别2', '选择卡类别3', '选择卡类别4', '选择卡类别5'],
    index999: 0,
    inputNum: '',
    inputPass: ''
  },
  bindPickerChange999: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index999: e.detail.value
    })
  },
  getNum: function (e) {
    this.setData({
      inputNum: e.detail.value
    })
  },
  getPass: function (e) {
    this.setData({
      inputPass: e.detail.value
    })
  },
  btnShowExchange2: (e) => {
    _this.setData({ isShow: !_this.data.isShow })
  },
  btnChoose: (e) => {
    console.log(e._relatedInfo.anchorRelatedText);
    _this.setData({
      inputNum: e._relatedInfo.anchorRelatedText,
      isShow: !_this.data.isShow
    })
  },
  btnTabSwitch: (e) => {
    console.log(e);
    let idx = e.currentTarget.dataset.id;
    let temp = _this.data.tabContent;
    temp.forEach((item, index) => {
      if (index == idx) {
        temp[index] = 1
      } else {
        temp[index] = 0
      }
    })
    _this.setData({
      tabContent: temp
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    _this = this;
    wx.setNavigationBarTitle({
      title: '会员卡'
    });
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () { },
  querenbangding: function () {
    var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var that = this;
    var data = {
      Username: "MiniProgram",
      Password: "6BF477EBCC446F54E6512AFC0E976C41",
      CinemaCode: 33097601,
      OpenID: '12345',
      // CardNo: 'e042208925',
      CardNo: that.data.inputNum,
      // CardPassword: 'mima123',
      CardPassword: that.data.inputPass,
      // MobilePhone: '15268553143'
      MobilePhone: that.data.inputNum
    };
    // 判断是会员卡号还是手机号
    if (Num.test(that.data.inputNum)) {
      // 手机号
      wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/QueryMemberCardByPhone' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.MobilePhone,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
            console.log(res)
            var memberPhones = [];
            for (var i = 0; i < res.data.data.memberPhones.length; i++) {
              memberPhones.push(res.data.data.memberPhones[i]);
              var levelName = "memberPhones[" + i + "].levelName";
              var cardNo = "memberPhones[" + i + "].cardNo";
              that.setData({
                [levelName]: res.data.data.memberPhones[i].levelName,
                [cardNo]: res.data.data.memberPhones[i].cardNo,
                isShow: true
              })
            };
        },
      })
    } else {
      wx.request({
      // 会员卡号
      url: 'https://xc.80piao.com:8443/Api/Member/LoginCard' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardNo + '/' + data.CardPassword,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.Status == "Success") {
          var cinemaCode = res.data.cinemaCode;
          var cardNo = res.data.card.cardNo;
          var cardPassword = res.data.card.cardPassword;
          var phone = res.data.card.mobilePhone;
          var userName = data.Username;
          var passWord = data.Password;
          var openID = data.OpenID
          wx.navigateTo({
            url: '../page05/index?CinemaCode=' + cinemaCode + '&CardNo=' + cardNo + '&CardPassword=' + cardPassword + '&Username=' + userName + '&PassWord=' + passWord + '&Phone=' + phone + '&OpenID=' + openID
          })
        }
        else if (res.data.Status == 'Failure') {
          wx.showToast({
            title: res.data.ErrorMessage,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
    }
  },
  // 选择会员卡类型注册
  zhuce: function (e) {
    // console.log(e)
    // let idx = e.currentTarget.dataset.id;
    // let temp = _this.data.tabContent;
    // temp.forEach((item, index) => {
    //   if (index == idx) {
    //     temp[index] = 1
    //   } else {
    //     temp[index] = 0
    //   }
    // })
    // _this.setData({
    //   tabContent: temp
    // })
    wx.navigateTo({
      url: '../page06/index'
    })
  },
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
  onShareAppMessage: function () { },
  //获取影院会员卡设置
  QueryCinemaMemberCardSetting: function () {
    var that = this;
    var IsCardRegister = that.data.IsCardRegister;
    var IsCardReCharge = that.data.IsCardReCharge;
    wx.request({
      url: app.API.Url + "/Cinema/QueryCinemaMemberCardSetting",
      data: {
        Username: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: app.usermessage.CinemaCode
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        //console.log(res.data.data, "会员卡设置")
        that.setData({
          IsCardRegister: res.data.data.IsCardRegister,
          IsCardReCharge: res.data.data.IsCardReCharge
        })
        //console.log(that.data.IsCardRegister, "IsCardRegister")
        //console.log(that.data.IsCardReCharge, "IsCardReCharge")
      }
    })
  },
  QueryCard: function () { //用户信息
    var that = this;
    wx.request({
      url: app.API.Url + "/Member/QueryCard",
      data: {
        Username: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: wx.getStorageSync('CinemaCode')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res, "huiyuanka.QueryCard")
        that.setData({
          QueryCardLevel: res.data.Levels.Level
        })
      }
    })
  },
  QueryMemberCardByPhone: function () {

    var that = this;
    that.setData({
      MemberCards: []
    })
    wx.request({
      url: app.API.Url + "/Member/QueryMemberCardByPhone",
      data: {
        Username: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: app.usermessage.CinemaCode,
        MobilePhone: that.data.MobilePhone
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res, "绑定")
        if (res.data.data.MemberPhoneCount != 0) {
          for (var i = 0; i < res.data.data.MemberPhones.length; i++) {
            that.QueryCard(res.data.data.MemberPhones[i])
          }
        }
        that.setData({
          MemberPhoneCount: res.data.data.MemberPhoneCount,
          //MemberCard: res.data.data.MemberPhones
        })
        //console.log(res.data.data.MemberPhones.CardNo)
      }
    })
  },
  QueryCard: function (MemberCard) {
    var that = this;
    var MemberCards = that.data.MemberCards
    wx.request({
      url: app.API.Url + "/Member/QueryCard",
      data: {
        Username: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: app.usermessage.CinemaCode,
        CardNo: MemberCard.CardNo,
        CardPassword: MemberCard.CardPassword
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res, "会员卡详细")
        MemberCards.push(res.data.Card)
        that.setData({
          MemberCards: MemberCards
        })
        //把用户的第一张卡放到内存中,供会员卡支付使用
        wx.setStorageSync("UserMemberCard", MemberCards[0]);
      }
    })
  },

  QueryMemberChargeSettings: function () {
    var that = this;
    wx.request({
      url: app.API.Url + "/Conpon/QueryMemberChargeSettings",
      data: {
        Username: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: app.usermessage.CinemaCode,

      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        //console.log(res, "huiyuanka.QueryMemberChargeSettings")
        var MemberChargeSettingsdata = new Array;
        var MemberChargeSettings = res.data.data.MemberChargeSettings
        if (MemberChargeSettings != null) {
          for (var i = 0; i < MemberChargeSettings.length; i++) {
            if (MemberChargeSettingsdata.length == 0) {
              MemberChargeSettingsdata.push({
                price: MemberChargeSettings[i].Price,
                Data: [MemberChargeSettings[i]]
              })
            } else {
              var flag = false;
              for (var j = 0; j < MemberChargeSettingsdata.length; j++) {
                if (MemberChargeSettingsdata[j].price == MemberChargeSettings[i].Price) {
                  MemberChargeSettingsdata[j].Data.push(MemberChargeSettings[i])
                  flag = true;
                  break;
                }
              }
              if (flag == false) {
                MemberChargeSettingsdata.push({
                  price: MemberChargeSettings[i].Price,
                  Data: [MemberChargeSettings[i]]
                })
                flag = false;

              }


            }
          }
          //console.log(MemberChargeSettingsdata, 'MemberChargeSettings')
          var len = MemberChargeSettingsdata.length;
          for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
              if (MemberChargeSettingsdata[j].price > MemberChargeSettingsdata[j + 1].price) { //相邻元素两两对比
                var temp = MemberChargeSettingsdata[j + 1]; //元素交换
                MemberChargeSettingsdata[j + 1] = MemberChargeSettingsdata[j];
                MemberChargeSettingsdata[j] = temp;
              }
            }
          }
        }
        //console.log(MemberChargeSettingsdata, "MemberChargeSettingsdata")
        that.setData({
          MemberChargeSettingCount: res.data.data.MemberChargeSettingCount,
          MemberChargeSettings: MemberChargeSettingsdata
        })
        //console.log(that.data.MemberChargeSettings, 'MemberChargeSettings')
      }
    })
  },
  getPhoneNumber: function (e) {
    //console.log(e)
    var that = this
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.login({
        success: function (res) {
          if (res.code) {
            console.log(res.code, "code")
            console.log(wx.getStorageSync('UserOpenId'), "OpenID")
            console.log(e.detail, "e.detail")
            wx.request({
              url: app.API.Url + "/User/QueryMobilePhone",
              data: {
                Username: app.usermessage.Username,
                Password: app.usermessage.Password,
                CinemaCode: app.usermessage.CinemaCode,
                OpenID: wx.getStorageSync('UserOpenId'),
                Code: res.code,
                EncryptedData: e.detail.encryptedData,
                Iv: e.detail.iv
              },
              method: 'Post',
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              success: function (res) {
                console.log(res, "huiyuanka.电话")
                //把MobilePhone保存起来
                //wx.setStorageSync("MobilePhone", res.data.data.phoneNumber);
                // if (res.data.ErrorMessage =='成功'){
                //   wx.showToast({
                //     title: '授权成功！',
                //     icon: 'success',
                //     duration: 2000
                //   })
                // }else{
                //   wx.showToast({
                //     title: '授权失败！',
                //     icon: 'none',
                //     duration: 2000
                //   })
                // }
                that.QueryUser()
                console.log(res.data.data.phoneNumber, "pcenter手机号")
              }
            })
          } else {
            //console.log('獲取失败！' + res.errMsg)
          }
        }
      });
    }
  },
  QueryUser: function () { //用户信息
    var that = this;
    wx.request({
      url: app.API.Url + "/User/QueryUser",
      data: {
        Username: app.usermessage.Username,
        Password: app.usermessage.Password,
        CinemaCode: app.usermessage.CinemaCode,
        OpenID: wx.getStorageSync('UserOpenId'),
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res, "pcenter用户信息")
        //console.log(res, "pcenter用户手机号")
        wx.setStorageSync("MobilePhone", res.data.data.MobilePhone);
        that.setData({
          User: res.data.data
        })
      }
    })
  },
})