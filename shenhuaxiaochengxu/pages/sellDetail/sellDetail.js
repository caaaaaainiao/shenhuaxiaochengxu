// pages/sellDetail/sellDetail.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location: "",
    isScroll: false,
    onScroll: "0",
    topArr: [],
    parentTop: null,
    chooseType: "0",
    goodsList: null,
    banner: "/images/comparebg.jpg",
    totalNum: 0,
    totalPrice: 0,
    type: 0,
    marActivity: null,
    waitActivity: null,
    isBind:false,
    merOrder:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.setData({
      type: options.type
    })
    this.ask();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    that.setData({
      location: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName
    })
    that.getBanner();
    that.getGoods();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

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

  // 右侧滑动导航
  onScroll: function(e) {
    // console.log(e.detail.scrollTop)
    var st = e.detail.scrollTop;
    var that = this;
    if (st > 10) {
      this.setData({
        isScroll: true
      })
      var query = wx.createSelectorQuery().in(this);
      var topArr = [];
      var parentTop = 0;
      var s = 0;
      query.selectAll(".detailclass").boundingClientRect(function(res) {
        // console.log(res)
        res.forEach(function(msg) {
          topArr.push(msg.top)
        })
        that.setData({
          topArr: topArr
        })
      });
      query.select(".foodDetail").boundingClientRect(function(res) {
        // console.log(res.top)
        parentTop = res.top;
        that.setData({
          parentTop: res.top
        })
      }).exec();
      for (var i = 1; i < that.data.topArr.length; i++) {
        if (that.data.parentTop < that.data.topArr[i] - 10 && that.data.parentTop > that.data.topArr[i - 1] - 10) {
          that.setData({
            onScroll: i - 1,
          })
        } 
        else if (that.data.parentTop > that.data.topArr[that.data.topArr.length-1] - 10){
          that.setData({
            onScroll: that.data.topArr.length - 1, 
          })
        }
      }
      if(that.data.isBind){
        that.setData({
          onScroll: that.data.chooseType,
          isBind:false
        })
      }
      
    } else {
      // console.log(that.data.parentTop)
      this.setData({
        isScroll: false
      })
    }
  },
  // 列表左侧导航
  chooseType: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    this.setData({
      onScroll: index,
      chooseType: index,
    })
    that.setData({
      isBind:true
    })
  },
  getGoods: function() { //获取卖品
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('merchandiseList', nowtime);
    wx.request({
      url: app.globalData.url + '/api/merchandise/merchandiseList',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res.data.data)
        var goodsList = res.data.data;
        for (var i = 0; i < goodsList.length; i++) {
          for (var j = 0; j < goodsList[i].merchandiseList.length; j++) {
            goodsList[i].merchandiseList[j].buyNum = 0;
          }
        }
        that.setData({
          goodsList: goodsList
        })
      }
    })
  },
  getBanner: function() { //获取轮播图
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('banners', nowtime);
    wx.request({
      url: app.globalData.url + '/api/banner/banners',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        category: "4",//4 卖品
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        that.setData({
          banner: res.data.data
        })
      }
    })
  },
  add: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var goodList = that.data.goodsList;
    var totalNum = 0;
    var totalPrice = 0;
    for (var i = 0; i < goodList.length; i++) {
      for (var j = 0; j < goodList[i].merchandiseList.length; j++) {
        if (goodList[i].merchandiseList[j].id == id) {
          goodList[i].merchandiseList[j].buyNum++;
        }
        // if (goodList[i].merchandiseList[j].buyNum > 0) {
        //   totalNum = totalNum + goodList[i].merchandiseList[j].buyNum;
        //   totalPrice = totalPrice + goodList[i].merchandiseList[j].buyNum * goodList[i].merchandiseList[j].listingPrice;
        // }
      }
    }
    that.setData({
      goodsList: goodList,
      // totalNum: totalNum,
      // totalPrice: totalPrice
    })
    that.ask()
  },
  minus: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var goodList = that.data.goodsList;
    var totalNum = 0;
    var totalPrice = 0;
    for (var i = 0; i < goodList.length; i++) {
      for (var j = 0; j < goodList[i].merchandiseList.length; j++) {
        if (goodList[i].merchandiseList[j].id == id) {
          goodList[i].merchandiseList[j].buyNum--;
          if (goodList[i].merchandiseList[j].buyNum < 0) {
            goodList[i].merchandiseList[j].buyNum = 0;
          }
        }
        // if (goodList[i].merchandiseList[j].buyNum > 0) {
        //   totalNum = totalNum + goodList[i].merchandiseList[j].buyNum;
        //   totalPrice = totalPrice + goodList[i].merchandiseList[j].buyNum * goodList[i].merchandiseList[j].listingPrice;
        // }
      }
    }
    that.setData({
      goodsList: goodList,
      // totalNum: totalNum,
      // totalPrice: totalPrice
    })
    that.ask()
  },
  picked: function() {
    var that = this;
    if (that.data.totalNum > 0) {
      app.globalData.goodsList = that.data.goodsList;
      app.globalData.merOrder = that.data.merOrder;
      wx.navigateTo({
        url: '../foodOrder/foodOrder?type=' + that.data.type,
      })
    } else {
      wx.showToast({
        title: '还没有选择商品哦',
        icon: "loading",
        mask: true,
        duration: 2000
      })
    }
  },
  // 接口
  ask: function() {
    var that = this;
    var json = [];
    // var json = [{ id: 32, number: 1 }, { id: 33, number: 1 }];
    if (that.data.goodsList == null) {
      json = "";
    } else {
      for (var i = 0; i < that.data.goodsList.length; i++) {
        for (var j = 0; j < that.data.goodsList[i].merchandiseList.length; j++) {
          if (that.data.goodsList[i].merchandiseList[j].buyNum > 0) {
            var row = {};
            row.id = that.data.goodsList[i].merchandiseList[j].id;
            row.number = that.data.goodsList[i].merchandiseList[j].buyNum;
            json.push(row)
          }
        }
      }
      // console.log(json)
      if (json.length == 0) {
        json = ""
      } else {
        var json2=[];
        var arr = [];
        for(var i = 0;i < json.length;i++){
          if(arr.indexOf(json[i].id) == -1){
            arr.push(json[i].id);
            json2.push(json[i])
          }
        }
        json = JSON.stringify(json2);
      }
    }
    var nowtime = new Date().getTime();
    var sign = app.createMD5('countMerchaniseOrderPrice', nowtime);
    wx.request({
      url: app.globalData.url + '/api/shOrder/countMerchaniseOrderPrice',
      data: {
        merchandiseInfo: json,
        appUserId: app.globalData.userInfo.id,
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        that.setData({
          merOrder:res.data.data,
          totalPrice: res.data.data.totalPrice,
          totalNum: res.data.data.totalNumber,
          waitActivity: res.data.data.waitActivity, //未参与的活动
          marActivity: res.data.data.marActivity
        })
      }
    })
  },
  bannerTap:function(e){
    var index = e.currentTarget.dataset.index;
    var banner = this.data.banner;
    var num = banner[index].playType;
    if(num == 1||num == 3){
      var url = banner[index].redirectUrl;
      if(url != ""){
        app.globalData.acivityUrl = url;
        wx.navigateTo({
          url: '../acivityUrl/acivityUrl',
        })
      }
    } else if (num == 2 && banner[index].dxMovie!=null){
      var id = banner[index].dxMovie.id;
      var movieList = app.globalData.movieList;
      for(var i = 0;i < movieList.length;i++){
        if (movieList[i].id == id){
          app.globalData.movieIndex = i;
          wx.navigateTo({
            url: '../movieDetail/movieDetail',
          })
        }
      }
    }
  }
})