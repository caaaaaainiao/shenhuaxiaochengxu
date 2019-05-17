// pages/sellDetail/sellDetail.js

const app = getApp();
const util = require('../../utils/util.js');
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
    merOrder:null,
    cinemaList:[],//影院信息列表

    UrlMap:{
      bannerUrl: app.globalData.url + '/Api/Banner/QueryBanner/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/33111001',
      goodsUrl: app.globalData.url + '/Api/Goods/QueryGoods/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/33111001',
      goodTypesUrl: app.globalData.url +'/Api/Goods/QueryGoodsType/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/33111001'
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.setData({
      type: options.type
    })
  // this.ask();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
   
    var that = this;
    util.getcinemaList(function (res) {
      if (res&&res.data){
        that.setData({
          cinemaList:res.data
        });
        
        that.getBanner();
        that.getGoodTypes();
        
      }
     
    });

    // wx.getStorage({
    //   key: 'cinemaList',
    //   success: function (res) {
    //     var movieList = that.data.movieList
    //     var movieList = res.data
    //     console.log(movieList)
    //     that.setData({
    //       movieList: movieList
    //     })
    //     debugger;
    //     var recent = movieList.sort(util.sortDistance("distance"))[0].cinemaName;
    //     that.setData({
    //       location: recent
    //     })

    //     that.getBanner();
    //     that.getGoods();
    //   },
    // })
    // that.setData({
    //   location: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName
    // })
    // that.getBanner();
    // that.getGoods();
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
  //根据商品类型选择商品列表
  changeGoodType:function(selecttype){
    
    let that=this;
    //todo:currenttype
    let goodTypeList = that.data.goodTypeList;
    if (goodTypeList){
      that.setData({
        currenttype: selecttype
    })
      //todo: filterlist
      that.getGoods();
   }
  },

  getGoodTypes:function(){
    var that = this;

    wx.request({
      url: that.data.UrlMap.goodTypesUrl,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        //类型筛选商品                         
        that.setData({
          goodTypeList: res.data.data.type
        });
        that.changeGoodType(that.data.goodTypeList[0]);
      }
    })
  },
  getGoods: function() { //获取卖品
    var that = this;
     wx.request({
      url: that.data.UrlMap.goodsUrl,
     
      method: "get",
      header: {
        "Content-Type": 'application/json'
      },
      success: function(res) {
        var goodsList = res.data.data.goods;
        if (!goodsList){
          return;
        }
       
        let tempgoodsList=[];
        for (var i = 0; i < goodsList.length; i++) {
          if (goodsList[i].goodsType == that.data.currenttype.typeId)
          {
            goodsList[i].itemClass={
              name: that.data.currenttype.typeName
            }
            goodsList[i].buyNum = 0;
            tempgoodsList.appen(goodsList[i]);
          }
        }
        that.setData({
          goodsList: tempgoodsList
        })
      }
    })
  },
  getBanner: function() { //获取轮播图
    var that = this;
    
    wx.request({
      url: that.data.UrlMap.bannerUrl,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        // console.log(res)
        if (res.data.data){
          let bannerList = res.data.data;
          if (bannerList && bannerList.count>0){
            that.setData({
              banner: bannerList
            })
          }
        }
        
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
   // that.ask()
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
    //that.ask()
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
        cinemaCode: that.data.cinemaList[0].cinemaCode,
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