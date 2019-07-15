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
    // AppId: 'wx1baa1fc8240ef183', // 高美
    // AppId: 'wxb491affbeb262f2f', // 国购
    AppId: 'wx8eafe6ec48aa323f', // 越幕
    // AppId: 'wxa20eeb5bde481333', // 智泉
    // secret: '9461327783c15fe6c9cd421b0a6f9690', // 高美
    // secret: '0e050ba2d7338a77d0988a3c5716f813', // 国购
    secret: '6b5276609738d408c1640e37460a64e6', // 越幕
    // secret: 'eff0e90de960e6cae166368c54de0b5f', // 智泉
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
    // url: "http://192.168.1.179:8080",
    // url: "http://192.168.1.177:8080",
    SocketUrl: "wss://ik.legendpicture.com",
    // SocketUrl: "wss://192.168.43.231:8080",
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
