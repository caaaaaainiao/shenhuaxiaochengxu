var utilMd5 = require('utils/md5.js');
App({

  
  onLaunch: function () {
    
  },

  
  onShow: function (options) {
    //  console.log("show")
  },

  
  onHide: function () {
    // console.log("hide")
  },

 
  onError: function (msg) {
    // console.log("error")
  },
  usermessage: {
    Username: "MiniProgram",
    Password: "6BF477EBCC446F54E6512AFC0E976C41",
    AppId: 'wx8079e2f2a9958d05',
    // AppId: 'wxe9ac67c34cccb15d',
    OpenID: 'op2p6jrEvV8v0alTJ060Fu6cAreo',
    secret : 'a90e16667f571b11d5e42476d8860524',
    // secret: '71239b48a93c0f199df74f5588020574',
    access_token : ''
  },
  globalData: {
    firstcode:null,
    cinemacode:null,
    moviearea : '',
    userInfo: null,
    openId : null,
    phone : null,
    cinemaList:null,
    cinemaNo:0,
    movieList:null,
    movieId:null,
    movieIndex:null,
    screenPlanList:null,
    list:null,
    // url:"https://ik.legendpicture.com",
       url:"https://xc.80piao.com:8443",
     //url:"http://192.168.1.177:8080",
    // url: "http://192.168.1.178:8080",
    // url: "http://192.168.1.114:8080",
    // url: "http://192.168.1.117:8080",
    goodsList:null,
    type2address:"",
    sellfeatureAppNo:"",
    seatOrder:null,
    movieRoom:null,
    roomNum:0,
    acivityUrl:"",
    cardList:null,
    card:null, 
    sellMovielist:null,
    seat: null,
    moviesListDate: null,
    offerDescription: null, 
    ticketCoupons: null, 
  },
  createMD5: function (apiname, nowtime) {
    var sign = utilMd5.hexMD5("HLBW2018SHAPPLET" + apiname + "SH076WZ80D98X5G2" + nowtime);
    return sign;
  },
 
})
