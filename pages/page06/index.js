//获取应用实例
const app = getApp()
let _this;
Page({
  // 页面的初始数据
  data: {
    showAlertExchange2: false,
    // exchangeList2: [
    //   { text: '100', tips: '', checked: false },
    //   { text: '200', tips: '送20元', checked: true },
    //   { text: '300', tips: '送50元', checked: false },
    //   { text: '400', tips: '送80元', checked: false },
    //   { text: '500', tips: '送100元', checked: false },
    // ],
    date999: '',
    array002: ['', '男', '女'],
    index002: 0,
    phone: '',
    password: '',
    name: '',
    id: '',
    openId: '',
    movieName: '',
    levelName: '',
    ruleDescription: '',
    effectiveDays: '',
    credit: '',
    ruleCode: '',
    disabled: false
  },
  getPhone: function (e) {
    this.setData({ phone: e.detail.value })
  },
  getPassword: function (e) {
    this.setData({ password: e.detail.value })
    if (e.detail.value == '') {
      wx.showToast({
        title: '密码不能为空！',
        icon: 'none',
        duration: 3000
      })
    }
  },
  surePassword: function (e) {
    if (e.detail.value != this.data.password) {
      wx.showToast({
        title: '密码不一致！',
        icon: 'none',
        duration: 3000
      })
    }
  },
  getName: function (e) {
    this.setData({ name: e.detail.value })
  },
  bindDateChange999: function (e) {
    this.setData({ date999: e.detail.value })
  },
  bindPickerChange002: function (e) {
    this.setData({ index002: e.detail.value })
  },
  btnShowExchange2:function(){
    var that = this;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    var data = {
        Username: "MiniProgram",
        Password: "6BF477EBCC446F54E6512AFC0E976C41",
        CinemaCode: cinemaCode,
        OpenID: that.data.openId,
        // 会员卡密码
        CardPassword: that.data.password,
        // 等级编号
        LevelCode: that.data.id,
        // 初始金额
        InitialAmount: that.data.credit,
        // 用户名
        CardUserName: that.data.name,
        // 手机号
        MobilePhone: that.data.phone,
        // 身份证号
        IDNumber: '362528199608210013',
        // 性别
        Sex: that.data.index002
      };
      var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (that.data.phone == '' || that.data.password == '' || that.data.name == '' || that.data.index002 == '') {
        wx.showToast({
          title: '请填写必要信息！',
          icon: 'none',
          duration: 3000
        })
    } else if (!Num.test(that.data.phone)) {
        wx.showToast({
          title: '手机号码错误',
          icon: 'none',
          duration: 3000
        })
      }
      else {
        that.setData({ showAlertExchange2: !that.data.showAlertExchange2 });
        wx.request({
          url: 'https://xc.80piao.com:8443/Api/Member/QueryMemberCardLevelRule' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.LevelCode,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.Status == 'Success') {
              var levelRule = res.data.data;
              var rule = levelRule.rule;
              for (var i = 0; i < rule.length; i++) {
                var credit = "rule[" + i + "].credit";
                var ruleCode = "rule[" + i + "].ruleCode";
                that.setData({
                  levelName: levelRule.levelName,
                  [credit]: rule[i].credit,
                  [ruleCode]: rule[i].ruleCode
                })
              }
            } else if (res.data.Status == 'Failure') {
              wx.showToast({
                title: res.data.ErrorMessage,
                icon: 'none',
                duration: 3000
              })
            }
          },
        })
      }
      // else {
      //   wx.request({
      //     url: 'https://xc.80piao.com:8443/Api/Member/CardRegister' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardPassword + '/' + data.LevelCode + '/' + data.InitialAmount + '/' + data.CardUserName + '/' + data.MobilePhone + '/' + data.IDNumber + '/' + data.Sex,
      //     method: 'GET',
      //     header: {
      //       'content-type': 'application/json' // 默认值
      //     },
      //     success: function (res) {
      //       console.log(res)
      //       wx.navigateTo({
      //         url: '../page05/index?Username=' + data.Username + '&PassWord=' + data.Password + '&CinemaCode=' + data.CinemaCode + '&OpenID=' + data.OpenID + '&Credit=' + data.InitialAmount
      //       })
      //     }
      //   })
      // }
  },
  closeShow: function () {
    this.setData({ showAlertExchange2: !this.data.showAlertExchange2 })
  },
  btnChoose: function (e) {
    let that = this;
    let price = e.currentTarget.dataset.price;
    let idx = e.currentTarget.dataset.id;
    let rulecode = e.currentTarget.dataset.rule;
    let temp = that.data.rule;
    let credit = that.data.credit;
    if (price < credit) {
      that.setData({ disabled: true})
    } else {
      that.setData({
         disabled: false,
         ruleCode: rulecode
      })
    }
    temp.forEach((item, index) => {
      if (index == idx) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
    that.setData({
      rule: temp,
      price: price
    })
  },
  // 预支付
  pay: function () {
    let that = this;
    let price = that.data.price;
    let openId = that.data.openId;
    let cinemaCode = app.globalData.cinemaList.cinemaCode;
    let ruleCode = that.data.ruleCode;
    var data = {
      Username: "MiniProgram",
      Password: "6BF477EBCC446F54E6512AFC0E976C41",
      CinemaCode: cinemaCode,
      OpenID: that.data.openId,
      InitialAmount: price,
      RuleCode: ruleCode
    };
    console.log(that.data.openId)
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/Member/PrePayCardRegister' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.RuleCode + '/'  + data.InitialAmount,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
      }
    })
  },
  btnChoose2: function () {
    let idx = e.currentTarget.dataset.id;
    let temp = this.data.exchangeList2;
    temp.forEach((item, index) => {
      if (index == idx) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
    this.setData({ exchangeList2: temp })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    var cinemaCode = app.globalData.cinemaList.cinemaCode;
    var movieName = app.globalData.moviearea;
    that.setData({
      id: options.id,
      openId: options.openId,
      movieName: movieName,
      levelName: options.name,
      ruleDescription: options.text,
      effectiveDays: options.time,
      credit: options.credit
    })
    console.log(that.data.openId)
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