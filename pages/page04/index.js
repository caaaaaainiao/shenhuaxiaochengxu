//获取应用实例
const app = getApp()
// let _this;
Page({
  // 页面的初始数据
  data: {
    isShow: false,
    tabContent: [1, 0, 0, 0, 0],
    // array999: ['选择卡类别', '选择卡类别2', '选择卡类别3', '选择卡类别4', '选择卡类别5'],
    index999: 0,
    inputNum: '',
    inputPass: '',
    Username: '',
    Password: '',
    backgroundImage: null,
  },
  bindPickerChange999: function (e) {
    this.setData({
      index999: e.detail.value
    })
  },
  // 获取手机号 密码
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
    this.setData({ isShow: !this.data.isShow })
  },
  btnChoose: function (e) {
    var that = this;
    that.setData({
      inputNum: e.target.dataset.cardno,
      isShow: !that.data.isShow
    })
    var cinemaType = app.globalData.cinemaList.cinemaType;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    var openID = app.globalData.userInfo.openID;
    var userName = that.data.Username;
    var passWord = that.data.Password;
    var data = {
      Username: userName,
      Password: passWord,
      CinemaCode: cinemaCode,
      OpenID: openID,
      CardNo: that.data.inputNum,
      CardPassword: that.data.inputPass,
      MobilePhone: that.data.inputNum
    };
    wx.request({
      // 点击会员卡号输入密码直接绑定
      url: app.globalData.url + '/Api/Member/LoginCard' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardNo + '/' + data.CardPassword,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
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
  },
  // 选择会员卡类别进行开卡
  manage: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var text = e.currentTarget.dataset.text;
    var time = e.currentTarget.dataset.time;
    var credit = e.currentTarget.dataset.price;
    var rule = e.currentTarget.dataset.rule;
    wx.navigateTo({
      url: '../page06/index?id=' + id + '&openId=' + app.globalData.userInfo.openID + '&name=' + name + '&text=' + text + '&time=' + time + '&credit=' + credit + '&ruleCode=' + rule,
    })
  },
  // 跳转到会员卡类别
  btnTabSwitch: function(e){
    var that = this;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    let idx = e.currentTarget.dataset.id;
    let temp = that.data.tabContent;
    var userName = that.data.Username;
    var passWord = that.data.Password;
    temp.forEach((item, index) => {
      if (index == idx) {
        var data = {
          Username: userName,
          Password: passWord,
          CinemaCode: cinemaCode
        };
        temp[index] = 1;
        wx.request({
          url: app.globalData.url + '/Api/Member/QueryMemberCardLevel' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            var memberCardLevel = [];
            for (let i = 0; i < res.data.data.level.length; i ++) {
              if (res.data.data.level[i].isOnlineOpenCard == '1') {
                memberCardLevel.push(res.data.data.level[i])
              }
            }
            that.setData({
              backgroundImage: memberCardLevel[0].memberCardImage,
            })
            for (var i = 0; i < memberCardLevel.length; i ++) {
              var levelName = "memberCardLevel[" + i + "].levelName";
              var levelCode = "memberCardLevel[" + i + "].levelCode";
              var ruleName = "memberCardLevel[" + i + "].ruleName";
              var ruleDescription = "memberCardLevel[" + i + "].ruleDescription";
              // var effectiveDays = "memberCardLevel[" + i + "].effectiveDays";
              var credit = "memberCardLevel[" + i + "].credit";
              var ruleCode = "memberCardLevel[" + i + "].ruleCode";
              var image = "memberCardLevel[" + i + "].memberCardImage"
              var str = memberCardLevel[i].ruleDescription;
              if (str != null) {
                var newDescription = str.replace(/，/g, "，\n")
                that.setData({
                  [levelName]: memberCardLevel[i].levelName,
                  [levelCode]: memberCardLevel[i].levelCode,
                  [ruleName]: memberCardLevel[i].ruleName,
                  [ruleDescription]: newDescription,
                  // [effectiveDays]: memberCardLevel[i].effectiveDays,
                  [credit]: memberCardLevel[i].credit,
                  [ruleCode]: memberCardLevel[i].ruleCode,
                  [image]: memberCardLevel[i].memberCardImage,
                })
              } else {
                that.setData({
                  [levelName]: memberCardLevel[i].levelName,
                  [levelCode]: memberCardLevel[i].levelCode,
                  [ruleName]: memberCardLevel[i].ruleName,
                  [ruleDescription]: memberCardLevel[i].ruleDescription,
                  // [effectiveDays]: memberCardLevel[i].effectiveDays,
                  [credit]: memberCardLevel[i].credit,
                  [ruleCode]: memberCardLevel[i].ruleCode,
                  [image]: memberCardLevel[i].memberCardImage,
                })
              }
            }
          }
        })
      } else {
        temp[index] = 0
      }
    })
    that.setData({
      tabContent: temp
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    let that = this;
    wx.setNavigationBarTitle({
      title: '会员卡'
    });
    wx.getStorage({
      key: 'sjhm',
      success: function(res) {
        that.setData({
          inputNum: res.data
        })
      },
    })
    that.setData({
      Username: app.usermessage.Username,
      Password: app.usermessage.Password
    })
    // console.log(app.globalData)
    wx.request({
      url: app.globalData.url + '/Api/Member/QueryMemberCardLevel' + '/' + that.data.Username + '/' + that.data.Password + '/' + app.globalData.cinemaList.cinemaCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        var memberCardLevel = [];
        for (let i = 0; i < res.data.data.level.length; i++) {
          if (res.data.data.level[i].isOnlineOpenCard == '1') {
            memberCardLevel.push(res.data.data.level[i])
          }
        }
        console.log(memberCardLevel)
        that.setData({
          backgroundImage: memberCardLevel[0].memberCardImage,
        })
        for (var i = 0; i < memberCardLevel.length; i++) {
          var levelName = "memberCardLevel[" + i + "].levelName";
          var levelCode = "memberCardLevel[" + i + "].levelCode";
          var ruleName = "memberCardLevel[" + i + "].ruleName";
          var ruleDescription = "memberCardLevel[" + i + "].ruleDescription";
          // var effectiveDays = "memberCardLevel[" + i + "].effectiveDays";
          var credit = "memberCardLevel[" + i + "].credit";
          var ruleCode = "memberCardLevel[" + i + "].ruleCode";
          var image = "memberCardLevel[" + i + "].memberCardImage"
          var str = memberCardLevel[i].ruleDescription;
          if (str != null) {
            var newDescription = str.replace(/，/g, "，\n")
            that.setData({
              [levelName]: memberCardLevel[i].levelName,
              [levelCode]: memberCardLevel[i].levelCode,
              [ruleName]: memberCardLevel[i].ruleName,
              [ruleDescription]: newDescription,
              // [effectiveDays]: memberCardLevel[i].effectiveDays,
              [credit]: memberCardLevel[i].credit,
              [ruleCode]: memberCardLevel[i].ruleCode,
              [image]: memberCardLevel[i].memberCardImage,
            })
          } else {
            that.setData({
              [levelName]: memberCardLevel[i].levelName,
              [levelCode]: memberCardLevel[i].levelCode,
              [ruleName]: memberCardLevel[i].ruleName,
              [ruleDescription]: memberCardLevel[i].ruleDescription,
              // [effectiveDays]: memberCardLevel[i].effectiveDays,
              [credit]: memberCardLevel[i].credit,
              [ruleCode]: memberCardLevel[i].ruleCode,
              [image]: memberCardLevel[i].memberCardImage,
            })
          }
        }
      }
    })
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () { },
  //  绑定会员卡
  querenbangding: function () {
    // 获取全局变量 判断售票系统
    let that = this;
    var cinemaType = app.globalData.cinemaList.cinemaType;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    var openID = app.globalData.userInfo.openID;
    var userName = that.data.Username;
    var passWord = that.data.Password;
    var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var data = {
      Username: userName,
      Password: passWord,
      CinemaCode: cinemaCode,
      OpenID: openID,
      CardNo: that.data.inputNum,
      CardPassword: that.data.inputPass,
      MobilePhone: that.data.inputNum
    };
    if (cinemaType == "辰星" || cinemaType == "满天星") {
      console.log(cinemaType)
      wx.request({
        // 会员卡号
        url: app.globalData.url + '/Api/Member/LoginCard' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardNo + '/' + data.CardPassword,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res)
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
            console.log(res)
            wx.showToast({
              title: res.data.ErrorMessage,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    } else if (cinemaType == "电影1905" || cinemaType == "粤科") {
      console.log(cinemaType)
      if (Num.test(that.data.inputNum)) {
        // 手机号返回会员卡号进行选择绑定
        wx.request({
          url: app.globalData.url + '/Api/Member/GetMemberCardByMobile' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.MobilePhone,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {zz
            var memberPhones = [];
            // console.log(res.data.data)
            for (var i = 0; i < res.data.data.cards.cardNo.length; i++) {
              memberPhones.push(res.data.data.cards.cardNo[i]);
              var cardNo = "memberPhones[" + i + "]";
              that.setData({
                [cardNo]: res.data.data.cards.cardNo[i],
                isShow: true
              })
            };
          },
        })
      } 
      else {
        wx.request({
          // 会员卡号输入密码直接绑定
          url: app.globalData.url + '/Api/Member/LoginCard' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardNo + '/' + data.CardPassword,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
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
    }
  },
  // 跳转到会员卡类别
  zhuce: function (e) {
    var that = this;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    let idx = e.currentTarget.dataset.id;
    let temp = that.data.tabContent;
    var userName = that.data.Username;
    var passWord = that.data.Password;
    temp.forEach((item, index) => {
      if (index == idx) {
        var data = {
          Username: userName,
          Password: passWord,
          CinemaCode: cinemaCode
        };
        temp[index] = 1;
        wx.request({
          url: app.globalData.url + '/Api/Member/QueryMemberCardLevel' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            var memberCardLevel = [];
            for (let i = 0; i < res.data.data.level.length; i++) {
              if (res.data.data.level[i].isOnlineOpenCard == '1') {
                memberCardLevel.push(res.data.data.level[i])
              }
            }
            that.setData({
              backgroundImage: memberCardLevel[0].memberCardImage
            })
            for (var i = 0; i < memberCardLevel.length; i++) {
              var levelName = "memberCardLevel[" + i + "].levelName";
              var levelCode = "memberCardLevel[" + i + "].levelCode";
              var ruleName = "memberCardLevel[" + i + "].ruleName";
              var ruleDescription = "memberCardLevel[" + i + "].ruleDescription";
              // var effectiveDays = "memberCardLevel[" + i + "].effectiveDays";
              var credit = "memberCardLevel[" + i + "].credit";
              var ruleCode = "memberCardLevel[" + i + "].ruleCode";
              var image = "memberCardLevel[" + i + "].memberCardImage"
              var str = memberCardLevel[i].ruleDescription;
              if (str != null) {
                var newDescription = str.replace(/，/g, "，\n")
                that.setData({
                  [levelName]: memberCardLevel[i].levelName,
                  [levelCode]: memberCardLevel[i].levelCode,
                  [ruleName]: memberCardLevel[i].ruleName,
                  [ruleDescription]: newDescription,
                  // [effectiveDays]: memberCardLevel[i].effectiveDays,
                  [credit]: memberCardLevel[i].credit,
                  [ruleCode]: memberCardLevel[i].ruleCode,
                  [image]: memberCardLevel[i].memberCardImage,
                })
              } else {
                that.setData({
                  [levelName]: memberCardLevel[i].levelName,
                  [levelCode]: memberCardLevel[i].levelCode,
                  [ruleName]: memberCardLevel[i].ruleName,
                  [ruleDescription]: memberCardLevel[i].ruleDescription,
                  // [effectiveDays]: memberCardLevel[i].effectiveDays,
                  [credit]: memberCardLevel[i].credit,
                  [ruleCode]: memberCardLevel[i].ruleCode,
                  [image]: memberCardLevel[i].memberCardImage,
                })
              }
            }
          }
        })
      } else {
        temp[index] = 0
      }
    })
    that.setData({
      tabContent: temp
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