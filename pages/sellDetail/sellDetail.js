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
    isBind: false,
    merOrder: null,
    cinemaList: [], //影院信息列表
    fullCar: true,
    UrlMap: {
      bannerUrl: app.globalData.url + '/Api/Activity/QueryActivitys/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
      goodsUrl: app.globalData.url + '/Api/Goods/QueryGoods/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
      goodTypesUrl: app.globalData.url + '/Api/Goods/QueryGoodsType/MiniProgram/6BF477EBCC446F54E6512AFC0E976C41/',
      createOrderUrl: app.globalData.url + '/Api/Goods/CreateGoodsOrder'
    },
    showReady: false,
    isReady: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    app.globalData.isReady = 1
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      type: options.type
    })
    app.globalData.optionstype = options.type
    util.clearCart(null);
    util.removegoodList(null);
    util.clearcartObj(null);
    // this.ask();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },
  chooseClose: function() {
    this.setData({
      showReady: false
    })
  },
  chooseReadyType: function(e) {
    console.log(e)
    var that = this;
    var type = e.currentTarget.dataset.type;
    that.setData({
      isReady: type,
    })
    app.globalData.isReady = type
  },
  createGoodsOrder: function() {
    let that = this;
    //创建订单
    if (that.data.type == 1) {
      that.setData({
        showReady: true
      })
    } else if (that.data.type == 2) {
      that.setData({
        showReady: false
      })
      that.sureChoose()
    }


  },
  sureChoose: function () {
    let that = this;
    let loginInfo = wx.getStorageSync('loginInfo');
    app.globalData.loginInfo = loginInfo
    if (!loginInfo) {
      wx.showToast({
        title: '您还没有登录，请重新登录',
        icon: "loading",
        mask: true,
        duration: 2000
      });
      return;
    }
    if (that.data.totalNum <= 0) {
      wx.showToast({
        title: '还没有选择商品哦~',
        icon: "none",
        mask: true,
        duration: 2000
      });

      return;
    }



    //创建订单的参数
    let xml = '<CreateGoodsOrder><cinemaCode>' + app.globalData.cinemacode + '</cinemaCode><payType>0</payType><goodsList>';
      let cartobj = util.getcartObj(null);
      if (cartobj && cartobj.list) {
        for (var i = 0; i < cartobj.list.length; i++) {
          let item = cartobj.list[i];
          xml += '<goods>';
          xml += '<goodsCode>' + item.goodsCode + '</goodsCode>';
          xml += '<goodsCount>' + item.buyNum + '</goodsCount>';
          xml += '<standardPrice>' + item.standardPrice + '</standardPrice>';
          if (item.channelFee) {
            xml += '<goodsChannelFee>' + item.channelFee + '</goodsChannelFee>';
          } else {
            xml += '<goodsChannelFee>0</goodsChannelFee>';
          }

          xml += '</goods>';
        }
      }
    xml += '</goodsList></CreateGoodsOrder>';
    // console.log(xml);
    console.log('点击跳转')
    app.globalData.xml = xml


    let apiuser = util.getAPIUserData(null);
    let key = 'goodList';
    if (wx.getStorageSync(key) != "") {
      wx.getStorage({
        key: key,
        success: function (res) {
          wx.setStorageSync('toSubmitGoods', res);
          //重置购物阶段数据
          that.emptyCart();
          //新增待支付购物列表
       

        },
      })

    }
    setTimeout(function(){
      wx.redirectTo({
        url: '../foodOrder/foodOrder?type=' + that.data.type,
      })
    },500)



  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

    var that = this;
    util.getcinemaList(function(res) {
      if (res) {
        that.setData({
          cinemaList: res,
          cinema: res[0],
        });

        that.getBanner();
        that.getGoodTypes();
      }
    });
    wx.getStorage({
      key: 'cinemaList',
      success: function(res) {
        var movieList = that.data.movieList
        var movieList = res.data
        // console.log(movieList)
        that.setData({
          movieList: movieList
        })

        var recent = movieList.sort(util.sortDistance("distance"))[0].cinemaName;
        that.setData({
          location: recent
        })
      }
    });


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.lookcinemaname == undefined) {
      app.globalData.lookcinemaname = app.globalData.areaList[0].cinemaName
    }
    if (app.globalData.lookcinemaadd == undefined) {
      app.globalData.lookcinemaadd = app.globalData.areaList[0].address
    }
    var lookcinemaname = app.globalData.lookcinemaname
    var lookcinemaadd = app.globalData.lookcinemaadd
    this.setData({
      lookcinemaname: lookcinemaname,
      lookcinemaadd: lookcinemaadd
    })

    this.setData({
      fullCar: true
    });
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
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
  onShareAppMessage: function() {
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
        } else if (that.data.parentTop > that.data.topArr[that.data.topArr.length - 1] - 10) {
          that.setData({
            onScroll: that.data.topArr.length - 1,
          })
        }
      }
      if (that.data.isBind) {
        that.setData({
          onScroll: that.data.chooseType,
          isBind: false
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
      isBind: true
    })

    let currenttype = that.data.goodTypeList[index];
    that.changeGoodType(currenttype);
  },
  preventD() {
    return
  },
  showcart: function() {

    if (this.data.totalNum > 0) {
      let cattObj = util.getcartObj(null);
      this.setData({
        fullCar: false,
        cattObj: cattObj
      });
      return;
    }

    wx.showToast({
      title: '还没有选择商品哦~',
      icon: "none",
      mask: true,
      duration: 2000
    });

  },
  hidecart: function() {
    this.setData({
      fullCar: true
    })
  },
  //根据商品类型选择商品列表
  changeGoodType: function(selecttype) {

    let that = this;
    //todo:currenttype
    let goodTypeList = that.data.goodTypeList;
    if (goodTypeList) {
      that.setData({
        currenttype: selecttype
      })
      //todo: filterlist
      that.getGoods();
    }
  },

  getGoodTypes: function() {
    var that = this;

    wx.request({
      url: that.data.UrlMap.goodTypesUrl + app.globalData.cinemacode,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        console.log(res)
        if (res.data.data.typeCount > 0) {
          //类型筛选商品                         
          that.setData({
            goodTypeList: res.data.data.type
          });
          that.changeGoodType(that.data.goodTypeList[0]);
        }

      }
    })
  },
  getGoods: function() { //获取卖品
    var that = this;

    util.getgoodList(that.data.UrlMap.goodsUrl + app.globalData.cinemacode, function(goodsList) {
      let tempgoodsList = [];
      wx.hideLoading()
      for (var i = 0; i < goodsList.length; i++) {
        if (goodsList[i].goodsType == that.data.currenttype.typeCode) {
          // goodsList[i].itemClass = {
          //   name: that.data.currenttype.typeName
          // }
          if (!goodsList[i].buyNum) {
            goodsList[i].buyNum = 0;
          }

          tempgoodsList.push(goodsList[i]);
        }
      }

      that.groupGoodsTypeList(goodsList);

      //所有商品列表
      util.updategoodList(null, goodsList);

    });
  },
  //分组汇总为一个商品列表集合
  groupGoodsTypeList: function(goodsList) {
    let that = this;
    let tempList = [];

    let goodtypes = that.data.goodTypeList;
    for (var i = 0; i < goodtypes.length; i++) {
      let tempobj = {
        currentItemClass: goodtypes[i].typeName,
        goodsList: []
      };
      for (var j = 0; j < goodsList.length; j++) {
        if (goodsList[j].goodsType == goodtypes[i].typeCode) {

          if (!goodsList[j].buyNum) {
            goodsList[j].buyNum = 0;
          }

          tempobj.goodsList.push(goodsList[j]);
        }
      }

      if (tempobj.goodsList.length > 0) {
        tempList.push(tempobj);
      }
    }

    that.setData({
      allGoodTypeList: tempList,
      goodsList: goodsList
    });
  },
  getBanner: function() { //获取轮播图
    var that = this;

    wx.request({
      url: that.data.UrlMap.bannerUrl + app.globalData.cinemacode + '/03',
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        // console.log(res)
        if (res.data.data) {
          let bannerList = res.data.data;
          if (bannerList && bannerList.count > 0) {
            that.setData({
              banner: bannerList.images
            })
          }
        }

      }
    })
  },
  emptyCart: function() {
    let queryobj = util.getcartObj(null);
    app.globalData.queryobj = queryobj
    util.clearCart(null);
    util.removegoodList(null);
    util.clearcartObj(null);
    this.setData({
      goodsList: null,
      groupGoodsTypeList: null,
      cattObj: null,
      totalNum: 0,
      totalPrice: 0,
      fullCar: true,
    });
    this.chooseClose();
    this.getGoodTypes();
  },
  add: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var goodList = that.data.goodsList;
    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].goodsId == id) {

        if (goodList[i].buyNum < goodList[i].stockCount) {
          goodList[i].buyNum += 1;
        }

        util.updategoodList(goodList[i]);

        util.addCart(goodList[i], function(result) {
          that.setData({
            goodsList: goodList,

          });

          that.groupGoodsTypeList(goodList);
          //更新购物车
          let tempCart = util.updateCart(result);
          that.setData({
            cattObj: tempCart,
            totalNum: tempCart.totalNum,
            totalPrice: tempCart.totalPrice
          });
        })
      }
    }

  },
  minus: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var goodList = that.data.goodsList;

    for (var i = 0; i < goodList.length; i++) {
      if (goodList[i].goodsId == id) {
        goodList[i].buyNum -= 1;
        if (goodList[i].buyNum < 0) {
          goodList[i].buyNum = 0;
        }
        util.updategoodList(goodList[i]);
        util.delCart(goodList[i], function(result) {
          that.setData({
            goodsList: goodList,

          });
          that.groupGoodsTypeList(goodList);
          //更新购物车
          let tempCart = util.updateCart(result);
          that.setData({
            cattObj: tempCart,
            totalNum: tempCart.totalNum,
            totalPrice: tempCart.totalPrice
          });

          if (tempCart.totalNum <= 0) {
            that.emptyCart();
          }
        })
      }
    }


  },
  picked: function() {
    var that = this;
    if (that.data.totalNum > 0) {
      app.globalData.goodsList = that.data.goodsList;
      //app.globalData.merOrder = that.data.merOrder;
      //todo:https://xc.80piao.com:8443/Api/Goods/QueryLocalGoodsOrder
      wx.navigateTo({
        url: '../foodOrder/foodOrder?type=' + that.data.type,
      })
    } else {
      wx.showToast({
        title: '还没有选择商品哦~',
        icon: "none",
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
        var json2 = [];
        var arr = [];
        for (var i = 0; i < json.length; i++) {
          if (arr.indexOf(json[i].id) == -1) {
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
        console.log(res)
        that.setData({
          merOrder: res.data.data,
          totalPrice: res.data.data.totalPrice,
          totalNum: res.data.data.totalNumber,
          waitActivity: res.data.data.waitActivity, //未参与的活动
          marActivity: res.data.data.marActivity
        })
      }
    })
  },
  bannerTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var banner = this.data.banner;
    var num = banner[index].playType;
    if (num == 1 || num == 3) {
      var url = banner[index].redirectUrl;
      if (url != "") {
        app.globalData.acivityUrl = url;
        wx.navigateTo({
          url: '../acivityUrl/acivityUrl',
        })
      }
    } else if (num == 2 && banner[index].dxMovie != null) {
      var id = banner[index].dxMovie.id;
      var movieList = app.globalData.movieList;
      for (var i = 0; i < movieList.length; i++) {
        if (movieList[i].id == id) {
          app.globalData.movieIndex = i;
          wx.navigateTo({
            url: '../movieDetail/movieDetail',
          })
        }
      }
    }
  }
})