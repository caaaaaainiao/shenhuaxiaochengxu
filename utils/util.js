const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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
        callback && callback(res);
         return res;
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
        AppId: 'wx8079e2f2a9958d05'
      };
      wx.request({
        url: 'https://xc.80piao.com:8443/Api/Cinema/QueryCinemas/' + data.Username + '/' + data.Password + '/' + data.AppId,
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
module.exports = {
  formatTime: formatTime,
  sortDistance: sortDistance,//计算出最近的影院显示在定位处
  getcinemaList: getcinemaList
}
