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
  onLoad: function () {
    var that = this;
    that.setData({
      userInfo: app.globalData.userInfo,
    })
    // 获取用户信息
    wx.request({
      url: app.globalData.url + '/Api/User/QueryUserInfo' + '/' + app.usermessage.Username + '/' + app.usermessage.Password + '/' + app.globalData.openId,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        if (res.data.Status == "Success") {
          that.setData({
            phone: res.data.data.mobilePhone,
            sex: res.data.data.sex,
            nickName: res.data.data.nickName,
            headUrl: res.data.data.headUrl,
            birthday: res.data.data.birthday,
          })
          that.data.userInfo.mobilePhone = res.data.data.mobilePhone;
          that.data.userInfo.nickName = res.data.data.nickName;
          that.data.userInfo.headlmgUrl = res.data.data.headUrl;
          that.data.userInfo.sex = res.data.data.sex;
          that.data.userInfo.birthday = res.data.data.birthday;
          console.log(that.data.userInfo);
          wx.setStorage({
            key: 'loginInfo',
            data: that.data.userInfo,
          })
          app.globalData.userInfo = that.data.userInfo;
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
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  // 修改头像
  imgChange:function(){
    var that = this;
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        wx.uploadFile({
          url: app.globalData.url + '/Api/User/UpdateUserInfo', 
          filePath: tempFilePaths[0],
          name: 'headUrl',
          formData: {
            userName: app.usermessage.Username,
            password: app.usermessage.Password,
            openID: app.globalData.userInfo.openID,
            headUrl: that.data.headUrl,
            nickName: that.data.nickName,
            sex: that.data.sex,
            birthday: that.data.birthday,
            mobilePhone: that.data.phone,
          },
          header: {
            'content-type': 'application/json'
          },
          success(res) {
            console.log(res)
            // var userInfo = that.data.userInfo;
            // userInfo.headlmgUrl = JSON.parse(res.data).data.headurl
            // that.setData({
            //   userInfo: userInfo
            // })
            // app.globalData.userInfo.headlmgUrl = userInfo.header
          }
        })
      }
    })
  },
  bindDateChange: function (e) {//生日

    var userInfo = this.data.userInfo;
    userInfo.birthday = e.detail.value;
    this.setData({
      birthday: e.detail.value,
    })
    this.change()
  },
  bindSexChange: function (e) {//性别
    var sex = parseInt(e.detail.value) + 1;
    var userInfo = this.data.userInfo;
    userInfo.sex = sex;
    this.setData({
      sex: sex,
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
      url: app.globalData.url + '/Api/User/UpdateUserInfo',
      data: {
        userName: app.usermessage.Username,
        password: app.usermessage.Password,
        openID: app.globalData.userInfo.openID,
        headUrl: that.data.headUrl,
        nickName: that.data.nickName,
        sex: that.data.sex,
        birthday: that.data.birthday,
        mobilePhone: that.data.phone,
      },
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        // console.log(res)
        if (res.data.Status != 'Success') {
          wx.showModal({
            title: '修改失败',
          })
        } else {
          wx.setStorage({
            key: 'loginInfo',
            data: that.data.userInfo,
          })
          app.globalData.userInfo = that.data.userInfo;
        }
        wx.hideLoading();
      }
    })
  },
  nameChange:function(e){
    var that = this;
    var name = e.detail.value;
    var userInfo = that.data.userInfo;
    userInfo.nickName = name;
    that.setData({
      nickName: name,
    })  
    that.change();
  },
  phoneChange: function (e) {
    var that = this;
    var mobilePhone = that.data.userInfo.mobilePhone;
    that.setData({
      phone: e.detail.value,
      mobilePhone: e.detail.value,
    });
    that.change(); 
  }
})