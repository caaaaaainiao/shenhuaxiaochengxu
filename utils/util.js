  const app = getApp();
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTimeDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-')
}
const formatTimeDays = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  var NowData = {
    NowDataYear: year + '年' + month 　+ '月' + day + '日',
    NowDataTime: year + '年' + month + '月' + day + '日' + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  return NowData 
}
const formatTimeGMT = date => {
  date = dateToGMT(date);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') //+ ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const dateToGMT = strDate => {
  var dateStr = strDate.split(" ");
  var strGMT = dateStr[0] + " " + dateStr[1] + " " + dateStr[2] + " " + dateStr[5] + " " + dateStr[3] + " GMT+0800";
  var date = new Date(Date.parse(strGMT));
  return date;
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const sortDistance = property=>{
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return parseFloat(value1) - parseFloat(value2);
  }
}
// 计算用户与影院距离
const distance =(la1, lo1, la2, lo2) =>{
  var La1 = la1 * Math.PI / 180.0;
  var La2 = la2 * Math.PI / 180.0;
  var La3 = La1 - La2;
  var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  s = s.toFixed(2);
  return s;
}

const getcinemaList = callback => {
  if (wx.getStorageSync('cinemaList')!=""){
    wx.getStorage({
      key: 'cinemaList',
      success: function (res) {
        callback && callback(res.data);
        return res.data;
      },
    })

    return;
  }
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等 监听页面加载
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
      var userLat = res.latitude;
      var userLng = res.longitude;
      var data = {
        Username: 'MiniProgram',
        Password: '6BF477EBCC446F54E6512AFC0E976C41',
        AppId: app.usermessage.AppId,
      };
      wx.request({
        url: app.globalData.url+'/Api/Cinema/QueryCinemas/' + data.Username + '/' + data.Password + '/' + data.AppId,
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          var cinemas = res.data.data.cinemas;
          var recent = []
          for (let i = 0; i < cinemas.length; i++) {
            var lat = cinemas[i].latitude;
            var lng = cinemas[i].longitude;
            let distancetemp = distance(userLat, userLng, lat, lng);
            cinemas[i].distance = distancetemp + "km"
          }
         
          var recent = cinemas.sort(sortDistance("distance"))[0].cinemaName;
         
          wx.setStorage({
            key: 'cinemaList',
            data: cinemas,
          });

          callback && callback(cinemas);
        }
      });
    },
  })


 
}

const removegoodList = ( callback) => {

  let key = 'goodList';
  wx.removeStorage({
    key: key,
    success: callback,
  });
}
const updategoodList = (updategood) => {
  
  let key = 'goodList';
  let goodsList = wx.getStorageSync(key);

  if (updategood){
    for (var i = 0; i < goodsList.length; i++) {
      if (goodsList[i].goodsId == updategood.goodsId) {
        goodsList[i].buyNum = updategood.buyNum;
      }
    }

  }

  wx.setStorage({
    key: key,
    data: goodsList,
  });
}
const getgoodList = (goodsUrl,callback) => {
   
  let key ='goodList';
  if (wx.getStorageSync(key) != "") {
    wx.getStorage({
      key: key,
      success: function (res) {
        callback && callback(res.data);
        return res.data;
      },
    })

    return;
  }
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等 监听页面加载
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
        
      wx.request({
        url: goodsUrl,

        method: "get",
        header: {
          "Content-Type": 'application/json'
        },
        success: function (res) {
          // console.log(res)
          var goodsList = res.data.data.goods;
          if (!goodsList) {
            return;
          }
 
          wx.setStorage({
            key: key,
            data: goodsList,
          });

          callback && callback(goodsList);
        }
      });
    },
  })



}

//添加购物车
const addCart = (cart, callback) => {
  let key = 'carlist';
 
  let reslist=[];
  if (wx.getStorageSync(key) != "") {
    wx.getStorage({
      key: key,
      success: function (res) {
        let tempcarlist = res.data;
        let ifoutoufstock=false;
        let ifhas=false;
        if (tempcarlist) {
          for (var i = 0; i < tempcarlist.length; i++) {
            if (tempcarlist[i].goodsId == cart.goodsId) {
              ifhas=true;
              tempcarlist[i].buyNum=cart.buyNum;
              if (tempcarlist[i].buyNum > cart.stockCount ) {
                ifoutoufstock=true;
              }
            }  
          }

          if(!ifhas){
            reslist.push(cart);
          }

          //判断是否超出库存
          if (ifoutoufstock)
            return;

          tempcarlist = tempcarlist.concat(reslist);
          wx.setStorage({
            key: key,
            data: tempcarlist,
          });
        } 
       
        callback && callback(tempcarlist)
        return tempcarlist;
      },
    });

     return;
  }


  cart.buyNum = 1;
  reslist.push(cart);
 
  wx.setStorage({
    key: key,
    data: reslist,
  });
  callback && callback(reslist)
  return reslist;
}
//根据商品ID减少购物车商品数量
const delCart = (cart, callback) => {
 
  let key = 'carlist';
  let reslist = [];

  if (wx.getStorageSync(key) != "") {
    wx.getStorage({
      key: key,
      success: function (res) {
        let tempcarlist = res.data;
        if (tempcarlist) {
          for (var i = 0; i < tempcarlist.length; i++) {
           
            if (tempcarlist[i].goodsId == cart.goodsId) {
              tempcarlist[i].buyNum = cart.buyNum;
             
            }

            if (tempcarlist[i].buyNum > 0) {
              reslist.push(tempcarlist[i]);//只保留数量大于0的购物
            }
          }
        }

        if (reslist.length == 0) {
          wx.removeStorage({
            key: key
          });
        } else {
          wx.setStorage({
            key: key,
            data: reslist,
          });
        }
        callback && callback(reslist)
        return reslist;
      },
    });
    return;
  }
}
//清空购物车
const clearCart = (callback) => {
  let key = 'carlist';
  wx.removeStorage({
    key: key,
    success: callback,
  });
}
//获取购物车列表
const getcartObj = (callback) => {
  let key = 'cartObj';
  return wx.getStorageSync(key);
}
const clearcartObj = (callback) => {
  let key = 'cartObj';
  return wx.removeStorage({
    key: key,
    success: callback,
  });
}
const updateCart= cartlist=>{
  let key='cartObj';
  let cartObj={
    list:cartlist,
    totalNum:0,
    totalPrice:0.0
  };
  for (var i = 0; i < cartlist.length;i++){
    cartObj.totalNum += cartlist[i].buyNum;
    cartObj.totalPrice += parseFloat(cartlist[i].settlePrice) * cartlist[i].buyNum;
  }
  wx.setStorage({
    key: key,
    data: cartObj,
  });
  return cartObj;
}
//优惠券列表
const getconponsList = (conponsUrl,callback)=>{
  wx.request({
    url: conponsUrl,

    method: "get",
    header: {
      "Content-Type": 'application/json'
    },
    success: function (res) {
      var conponsList = res.data.data.conpons;
      if (!conponsList) {
        return;
      }

      

      callback && callback(conponsList);
    }
  });
}
const getAPIUserData=callback=>{
  let obj = {
    UserName: 'MiniProgram',
    Password: '6BF477EBCC446F54E6512AFC0E976C41',
    AppId: 'wxb491affbeb262f2f ', // 国购
    // AppId: 'wx1baa1fc8240ef183', // 高美
    // AppId: 'wx8eafe6ec48aa323f', // 越幕
    // AppId: 'wxa20eeb5bde481333', // 智泉
    // AppId: 'wx2069ef6c2d5b1880', // 美伦
  };
  wx.setStorage({
    key: 'APIUSER',
    data: obj,
  });
  return obj;
}
const getQueryFilmSession = (cinemaNo,callback)=>{
  var that = this
  // console.log(cinemaNo)
  let key ='movieList';
  // if (wx.getStorageSync(key) != "") {
  //   wx.getStorage({
  //     key: key,
  //     success: function (res) {
  //       callback && callback(res.data);
  //       return res.data;
  //     }
  //     })
  //     return;
  // }

  let apiuser = getAPIUserData(null);
  var nowtime = new Date();
  let nowday = formatTimeDay(nowtime);
  let endtime = new Date(nowtime.getTime() + 1000 * 60 * 60 * 24 * 7);//add 15 day
  let endday = formatTimeDay(endtime);
  var data = {
    UserName: apiuser.UserName,
    Password: apiuser.Password,
    CinemaCode: cinemaNo,
    StartDate: nowday,
    EndDate: endday,
  }
  wx.request({
    url: app.globalData.url+'/Api/Session/QueryFilmSessions' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode ,
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      // if (res.data.code == 200){
        var timestamp = new Date().getTime() + 2592000000
        if (res.data.data.film) {
          for (var i = 0; i < res.data.data.film.length; i++) {
            var NowDate = res.data.data.film[i].publishDate
            if (NowDate != null) {
              NowDate = NowDate.substring(0, 19);
              NowDate = NowDate.replace(/-/g, '/');
              var timestamp1 = new Date(NowDate).getTime();
              res.data.data.film[i].time = timestamp1
            }
          }
        } else {
          wx.showModal({
            title: '暂无影片排期',
            content: '请选择其他影院',
          })
        }
      // }
      
      wx.hideLoading();
      var movieList = res.data.data.film;
       // console.log(movieList)
      // this.setData({
      //   movieList: res.data.data.film
      // })
      wx.setStorageSync(key, movieList)
      callback && callback(movieList);
      return movieList;
   
      // that.format();
      // wx.showTabBar();
    }
  })

}
const getCity=(callback)=>{
  let key = 'city';
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
      var userLat = res.latitude;
      var userLng = res.longitude;
      let apiuser = getAPIUserData(null);
      wx.request({
        url: app.globalData.url+'/Api/Cinema/QueryCinemas/' + apiuser.UserName + '/' + apiuser.Password + '/' + apiuser.AppId,
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          callback && callback(res.data.data.cinemas, userLat, userLng);
          return res.data;
        }
      });
    },
    fail:function(){
      var userLat = "30.27415";
      var userLng = "120.15515";
      let apiuser = getAPIUserData(null);
      wx.request({
        url: app.globalData.url + '/Api/Cinema/QueryCinemas/' + apiuser.UserName + '/' + apiuser.Password + '/' + apiuser.AppId,
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          callback && callback(res.data.data.cinemas, userLat, userLng);
          return res.data;
        }
      });
    }
  });
}
const getMemberCardByPhone = (cinemaNo, mobilePhone, callback) => {
  let key = 'CardInfo';
  if (wx.getStorageSync(key) != "") {
    wx.getStorage({
      key: key,
      success: function (res) {
        callback && callback(res.data);
        return res.data;
      }
    })
    return;
  }

  let cardList=[];
  let apiuser = getAPIUserData(null);
 
  var data = {
    UserName: apiuser.UserName,
    Password: apiuser.Password,
    CinemaCode: cinemaNo,
    MobilePhone: mobilePhone
  }
  wx.request({
    url: app.globalData.url+'/Api/Member/QueryMemberCardByPhone' + '/' + data.UserName + '/' + data.Password + '/' + data.CinemaCode + '/' + data.MobilePhone ,
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      console.log(res)
      wx.hideLoading();
      var cardInfo = res.data.data;

      wx.setStorageSync(key, cardInfo)
      callback && callback(cardInfo);
      return cardInfo;
      // console.log(movieList)
      // that.format();
      // wx.showTabBar();
    }
  })

}
// 获取选中影院已绑定的会员卡信息
const getCardInfo = function (username, password, openid, cinemacode, callback) {
  var data = {
    Username: username,
    PassWord: password,
    OpenID: openid,
    CinemaCode: cinemacode
  }
  wx.request({
    url: app.globalData.url+'/Api/Member/QueryMemberCardByOpenID' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode + '/' + data.OpenID,
    method: 'GET',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      callback && callback(res);
      return res
    }
  })
}

//  查询会员卡最新余额
const getCallBack = function (username, password, cinemacode, cardno, cardpassword, callback) {
  var card = [];
  var data = {
    Username: username,
    PassWord: password,
    CinemaCode: cinemacode,
    CardNo: cardno,
    CardPassword: cardpassword,
  };
  wx.request({
    url: app.globalData.url+'/Api/Member/QueryCard' + '/' + data.Username + '/' + data.PassWord + '/' + data.CinemaCode + '/' + data.CardNo + '/' + data.CardPassword,
    method: 'GET',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      callback && callback(res.data.card);
      return res.data.card;
    }
  })
}
module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  formatTimeDay: formatTimeDay,//day
  formatTimeGMT: formatTimeGMT,
  formatTimeDays: formatTimeDays,
  sortDistance: sortDistance,//计算出最近的影院显示在定位处
  getcinemaList: getcinemaList,
  getgoodList: getgoodList,
  removegoodList: removegoodList,
  updategoodList: updategoodList,
  addCart: addCart,
  delCart: delCart,
  clearCart: clearCart,
  updateCart: updateCart,
  getcartObj: getcartObj,
  clearcartObj: clearcartObj,
  getconponsList: getconponsList,
  getAPIUserData: getAPIUserData,//获取固定的平台用户名密码
  getQueryFilmSession: getQueryFilmSession, //获取首页影院排期列表
  getCity: getCity,//获取影院信息列表 通用
  getMemberCardByPhone: getMemberCardByPhone,//根据手机号获取会员卡列表
  getCardInfo: getCardInfo, //获取选中影院已绑定的会员卡信息
  getCallBack: getCallBack, //  查询会员卡最新余额
}
