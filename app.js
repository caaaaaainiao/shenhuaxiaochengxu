var utilMd5 = require('utils/md5.js');
App({


  onLaunch: function() {
    

  },


  onShow: function(options) {
    //  console.log("show")
  },


  onHide: function() {
    // console.log("hide")
  },


  onError: function(msg) {
    // console.log("error")
  },
  usermessage: {
    Username: "MiniProgram",
    Password: "6BF477EBCC446F54E6512AFC0E976C41",
    // AppId: 'wx1baa1fc8240ef183', // 高美
    // AppId: 'wxb491affbeb262f2f', // 国购
    // AppId: 'wx8eafe6ec48aa323f', // 越幕
    AppId: 'wxa20eeb5bde481333', // 智泉
    // AppId: 'wx2069ef6c2d5b1880', // 美伦
    // AppId: 'wxfd577490c3d0a0a5', // 睢县
    // AppId: 'wxddbd0d6022465cc9', // 金逸
    // AppId: 'wxb7760b5f31f38e19', // 时代
    // AppId: 'wx8ed523bb8aa3b0b0', // 沃伦
    // AppId: 'wxb9c0ee0184070dc5', // 丰县
    // AppId: 'wxf372e7ee40bed29c', // 天一
    // AppId: 'wxc3d9adadfa5c9960', // 金陵
    // AppId: 'wx2d99084124eb55cc', // 容湖
    // AppId: 'wx44926411189c0621', // 新远
    // secret: '9461327783c15fe6c9cd421b0a6f9690', // 高美
    // secret: '0e050ba2d7338a77d0988a3c5716f813', // 国购
    // secret: '6b5276609738d408c1640e37460a64e6', // 越幕
    secret: 'eff0e90de960e6cae166368c54de0b5f', // 智泉
    // secret: '145bc00fe2907c30ce35a166e50cfc89', // 美伦
    // secret: '6e4e81ce226bf638c6c9e82f49e41cb4', // 睢县
    // secret: '9a041c6519cdef582296831e07bc1601', // 金逸
    // secret: '4de03856faca26ed0fcc741a76bd1c10', // 时代
    // secret: '18f5439fdef228c0488b747c678badc7', // 沃伦
    // secret: 'dd8ea09f751a84e6fc732312df1cbad3', // 丰县
    // secret: '5aa832ac68dab4695d903ef8137c8214', // 天一
    // secret: '63e2a10300bb23d894d940d228879a83', // 金陵
    // secret: 'f9b08699c6c819304320aec01512f023', // 容湖
    // secret: '4837c38d205f3fefae64ca0b880a2a32', // 新远
    access_token: ''
  },
  globalData: {
    firstcode: null,
    cinemacode: null,
    moviearea: '',
    userInfo: null,
    openId: null,
    phone: null,
    cinemaList: null,
    cinemaNo: 0,
    movieList: null,
    movieId: null,
    movieIndex: null,
    screenPlanList: null,
    list: null,
    url: "https://ik.legendpicture.com",
    // url: "http://192.168.1.179:8080",
    // url: "http://192.168.1.177:8080",
    SocketUrl: "wss://ik.legendpicture.com",
    // SocketUrl: "wss://192.168.1.177:8080",
    goodsList: null,
    type2address: "",
    sellfeatureAppNo: "",
    seatOrder: null,
    movieRoom: null,
    roomNum: 0,
    acivityUrl: "",
    cardList: null,
    card: null,
    sellMovielist: null,
    seat: null,
    moviesListDate: null,
    offerDescription: null,
    ticketCoupons: null,
  },
  createMD5: function(apiname, nowtime) {
    var sign = utilMd5.hexMD5("HLBW2018SHAPPLET" + apiname + "SH076WZ80D98X5G2" + nowtime);
    return sign;
  },

})