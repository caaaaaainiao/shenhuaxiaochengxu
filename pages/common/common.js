// pages/common/common.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sexArr:["男","女"],
    userInfo:null,
    phone: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 查询手机号
    var a = app.globalData.openID
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryUserInfo' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + a,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        that.setData({
          // phone: res.data.data.mobilePhone,
        })
      }
    })
    that.setData({
      userInfo: app.globalData.userInfo,
    })
    // console.log(app.globalData.userInfo)
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
  imgChange:function(){
    var that = this;
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          
          url: app.globalData.url + '/shDxAppUser/modifyPersonalData', // 仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'headImage',
          formData: {
            appUserId: app.globalData.userInfo.id,
          },
          header: {
            "chartset": "utf-8"
          },
          success(res) {
            // console.log(res)
            var userInfo = that.data.userInfo;
            userInfo.header = JSON.parse(res.data).data.headurl
            that.setData({
              userInfo: userInfo
            })
            app.globalData.userInfo.header = userInfo.header
          }
        })
      }
    })
  },
  bindDateChange: function (e) {//生日
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var userInfo = this.data.userInfo;
    userInfo.birthday = e.detail.value;
    this.setData({
      userInfo: userInfo
    })
    this.change()
  },
  bindSexChange: function (e) {//生日
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var sex = parseInt(e.detail.value) + 1;
    var userInfo = this.data.userInfo;
    userInfo.gender = sex;
    this.setData({
      userInfo: userInfo
    })
    this.change()
  },
  change:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('modifyPersonalData', nowtime);
    var userInfo = that.data.userInfo;
    if(userInfo.birthday == null){
      userInfo.birthday = ""
    }
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/shDxAppUser/modifyPersonalData',
      data: {
        appUserId:app.globalData.userInfo.id,
        name: userInfo.nickName,
        gender:userInfo.gender,
        birthday:userInfo.birthday,
        appUserId: app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        // "chartset": "utf-8"
      },
      success: function (res) {
        // console.log(res)
        wx.hideLoading();
        if(res.data.status == 1){
          var userInfo = that.data.userInfo;
          userInfo.name = res.data.data.name;
          userInfo.gender = res.data.data.gender;
          userInfo.birthday = res.data.data.birthday;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo
        }else{
          wx.showModal({
            title: '修改失败',
          })
        }
      }
    })
  },
  nameChange:function(e){
    var that = this;
    var name = e.detail.value;
    var userInfo = that.data.userInfo;
    userInfo.nickName = name;
    that.setData({
      userInfo: userInfo
    })  
    that.change();
  },
  phoneChange: function (e) {
    var that = this;
    console.log(e)
  }
})