// pages/myticket/myticket.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:null,
    pageNo:1,
    pageSize:10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ask();
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
  ask:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userOrderList', nowtime);
    var pageNo = that.data.pageNo;
    wx.request({
      url: 'https://xc.80piao.com:8443/Api/User/QueryCinemaTicket/' + 'MiniProgram' + '/' + '6BF477EBCC446F54E6512AFC0E976C41' + '/' + app.globalData.cinemacode + '/' + app.globalData.openID,
      method: 'GET',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
       console.log(res)
        var result = []
        for (var x in res.data.data.ticket) {
          if (res.data.data.ticket[x].orderCode != null) {
            result.push(res.data.data.ticket[x])
            that.setData({
              result: result
            })
          }
        }
        console.log(that.data.result)
      }

    })
    // wx.request({
    //   url: app.globalData.url + '/api/shOrder/userOrderList',
    //   data: {
    //     appUserId: app.globalData.userInfo.id,
    //     cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
    //     orderType:"0",//买票
    //     pageNo:pageNo,
    //     pageSize:that.data.pageSize,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     // console.log(res)
    //     // that.data.result = res.data.data.result;
    //     var result = that.addJson(that.data.result, res.data.data.result);
    //     pageNo++;
    //     that.setData({
    //       result: result,
    //       pageNo: pageNo
    //     })
    //   }
    // })
  },
  toDetail:function(e){
    var orderNum = e.currentTarget.dataset.num;
    var status = e.currentTarget.dataset.status;
    // if(status == 3){
    //   return;
    // }
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderNum=' + orderNum,
    })
  },
  addJson: function (json1, json2) {
    if (json1 == null) {
      return json2
    }
    for (var i = 0; i < json2.length; i++) {
      json1.push(json2[i])
    }
    return json1


  }
})