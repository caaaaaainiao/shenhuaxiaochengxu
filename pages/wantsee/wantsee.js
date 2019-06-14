// pages/wantsee/wantsee.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: null,
    pageNo: 1,
    pageSize: 10,
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ask();
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // var that = this;
    // var nowtime = new Date().getTime();
    // var sign = app.createMD5('getWantSeeNum', nowtime);
    // var pageNo = that.data.pageNo;
    // // wx.showLoading({
    // //   title: '加载中',
    // // })
    // wx.request({
    //   url: app.globalData.url + '/shDxMovie/getWantSeeNum',
    //   data: {
    //     appUserId: app.globalData.userInfo.id,
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     // console.log(res)
    //     wx.hideLoading()
    //     that.setData({
    //       total: res.data.data.wantSeeNum
    //     })
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
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
  ask: function () {
    var that = this;
    let apiuser = util.getAPIUserData(null);
    // var nowtime = new Date().getTime();
    // var sign = app.createMD5('getWantSeeMovie', nowtime);
    // var pageNo = that.data.pageNo;
    // let useropenID = null
    var a = app.globalData.openID
    console.log(a)
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryUserFilm' + '/' + apiuser.UserName + '/' + apiuser.Password + '/' + a + '/' + 1,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data.data)
        // wx.hideLoading()
        // var result = that.addJson(that.data.result, res.data.data);
        // pageNo++;
        // for(var i = 0;i < result.length;i++){
        //   result[i].startPlay2 = result[i].startPlay.substring(0,10)
        // }
        that.setData({
          result: res.data.data,
          // pageNo: pageNo
        })
      }
    })

    // wx.showLoading({
    //   title: '加载中',
    // })
  },
  // addJson: function (json1, json2) {
  //   if (json1 == null) {
  //     return json2
  //   }
  //   for (var i = 0; i < json2.length; i++) {
  //     json1.push(json2[i])
  //   }
  //   return json1


  // }
})