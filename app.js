var utilMd5 = require('utils/md5.js');
App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    //  console.log("show")
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    // console.log("hide")
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    // console.log("error")
  },
  usermessage: {
    Username: "MiniProgram",
    Password: "6BF477EBCC446F54E6512AFC0E976C41",
    AppId: 'wx8079e2f2a9958d05',
    OpenID: 'op2p6jrEvV8v0alTJ060Fu6cAreo',
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
    // url: "http://192.168.1.114:8080",
    // url:"http://192.168.1.110:8080",
    goodsList:null,
    type2address:"",
    sellfeatureAppNo:"",
    seatOrder:null,
    movieRoom:null,
    roomNum:0,
    acivityUrl:"",
    cardList:null,
    card:null, // 会员卡信息
    sellMovielist:null,
    seat: null,
    moviesListDate: null,
  },
  createMD5: function (apiname, nowtime) {
    var sign = utilMd5.hexMD5("HLBW2018SHAPPLET" + apiname + "SH076WZ80D98X5G2" + nowtime);
    return sign;
  },
 
})
