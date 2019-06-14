// pages/myfood/myfood.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: null,
    pageNo: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ask();
    wx.setNavigationBarTitle({ title: '我的小食' });
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
    wx.setNavigationBarTitle({ title: '我的小食' });
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
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userOrderList', nowtime);
    var pageNo = that.data.pageNo;
    console.log(app.globalData.openId)
    wx.request({
      url: app.globalData.url + '/Api/User/QueryCinemaGoods/' + 'MiniProgram' + '/' + '6BF477EBCC446F54E6512AFC0E976C41' + '/' + app.globalData.cinemacode + '/' + app.globalData.openId,
      method:'GET',
      header: {
        "Content-Type": "application/json"
      },
      success:function(res){
        console.log(res)
        var result = []
        for(var x in res.data.data.good){
          if (res.data.data.good[x].orderCode!=null){ 
            result.push(res.data.data.good[x])
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
    //     orderType: "1",//小食
    //     pageNo: pageNo,
    //     pageSize: that.data.pageSize,
    //     timeStamp: nowtime,
    //     mac: sign
    //   },
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //   },
    //   success: function (res) {
    //     // console.log(res)
    //     var result = that.addJson(that.data.result, res.data.data.result);
    //     pageNo++;
    //     that.setData({
    //       result: result,
    //       pageNo: pageNo
    //     })
    //   }
    // })
  },
  addJson:function(json1,json2){
    if(json1 == null){
      return json2
    }
    for(var i = 0;i < json2.length;i++){
      json1.push(json2[i])
    }
    return json1
  },
  toDetail:function(e){
    var num = e.currentTarget.dataset.num;
    var type = e.currentTarget.dataset.type;
    if(type == 2){
      return;
    }
    wx.navigateTo({
      url: '../goodsOrderDetail/goodsOrderDetail?orderNum='+num,
    })
  }

})