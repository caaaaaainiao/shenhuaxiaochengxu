// pages/openCard/openCard.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    sex:"0",
    passward:"",
    passward2:"",
    birthday:"",
    name:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo:app.globalData.userInfo
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
      title: '神画电影',
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
  open:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('registerCard', nowtime);
    var cinemaCode = app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode;
    var id = that.data.userInfo.id;
    var phone = that.data.userInfo.mobile;
    var password = that.data.passward;
    var password2 = that.data.passward2;
    var name = that.data.name;
    var sex = that.data.sex;
    var birthday = that.data.birthday;
    if(password == ""){
      wx.showModal({
        title: '开卡失败',
        content: '请设置密码',
      })
      return;
    }
    if (password2 == "") {
      wx.showModal({
        title: '开卡失败',
        content: '请校验密码',
      })
      return;
    }
    if (password != password2) {
      wx.showModal({
        title: '开卡失败',
        content: '密码不一致',
      })
      return;
    }
    if (!(/^[0-9]*$/.test(password))) {
      wx.showModal({
        title: '开卡失败',
        content: '密码仅限数字',
      })
      return;
    }
    // if (name == "") {
    //   wx.showModal({
    //     title: '开卡失败',
    //     content: '请输入姓名',
    //   })
    //   return;
    // }
    // if (birthday == "") {
    //   wx.showModal({
    //     title: '开卡失败',
    //     content: '请选择生日',
    //   })
    //   return;
    // }
    wx.request({
      url: app.globalData.url + '/api/shAppuser/registerCard',
      data: {
        cinemaCode: cinemaCode,
        appUserId:id,
        phone:phone,
        pwd:password,
        name:name,
        sex:sex,
        birthday:birthday,
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
          wx.showToast({
            title: '开卡成功',
            duration: 2000,
            icon: "loading"
          })
          var userInfo = res.data.data;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo;
          wx.redirectTo({
            url: '../mycard/mycard',
          })
        } else {
          wx.showModal({
            title: '',
            content: res.data.message
          })
        }
      }
    })
  }
})