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
    AppId: 'wx1baa1fc8240ef183', // 所有
    secret: '9461327783c15fe6c9cd421b0a6f9690', // 所有
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
    url:"https://ik.legendpicture.com",
    // url:"https://xc.80piao.com:8443",
    // url: "http://192.168.1.219:8080",
    // url: "http://192.168.1.109:8080",
    SocketUrl: "wss://ik.legendpicture.com",
    // SocketUrl: "wss://xc.80piao.com:8443",
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
