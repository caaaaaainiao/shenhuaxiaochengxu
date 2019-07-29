// pages/chooseSeats/chooseSeats.js
var canOnePointMove = false
var arr = []
var key = true
var num = 0

var onePoint = {

  x: 0,

  y: 0

}

var twoPoint = {

  x1: 0,

  y1: 0,

  x2: 0,

  y2: 0

}
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenCode: null,
    featureAppNo: null,
    seats: null,
    scale: 1,
    translateX: 0,
    translateY: 0,
    location: null,
    date: "",
    // time: "",
    // style: "",
    seatNum: 0,
    seatArr: [],
    price: 0,
    totalPrice: 0, // 座位总价
    seatNumber: [],
    nowlist: null,
    activityPriceNum: 0, //参与特价个数
    activityId: 0,
    orderNum: "",
    isClick: false,
    rowNumMr: -20,
    screenName: "",
    salePrice: '',
    seatx:50,
    seaty:50,
    seats: '',
    // isEmpty: 'empty',
    rows: '',
    rownum:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // console.log(options)
    that.setData({
      screenCode: options.screenCode,
      featureAppNo: options.sessionCode,
      location: app.globalData.moviearea,
      sessionDate: options.sessionDate,
      date: options.sessionDate,
      startTime2: options.time,
      movieDimensional: options.filmType,
      screenName: options.screenName,
      salePrice: options.salePrice,
      endtime: options.endtime
    })
    // 单价
    var data = {
      Username: app.usermessage.Username,
      Password: app.usermessage.Password,
      CinemaCode: app.globalData.cinemacode,
      ScreenCode: that.data.screenCode,
      FeatureAppNo: that.data.featureAppNo,
      Status: 'All'
    }
    wx.request({
      url: app.globalData.url + '/Api/Screen/QueryScreenSeatsArrangement' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.ScreenCode,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log(res)
        var seats = res.data.data.rows;
        that.setData({
          seats: seats,
        });
      }
    });
    wx.request({
      url: app.globalData.url + '/Api/Session/QuerySessionSeat' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.FeatureAppNo + '/' + data.Status,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        // console.log(res)
        var seat = res.data.sessionSeat.seat;
        var seats = that.data.seats;
        for (let i = 0; i < seats.length; i++) {
          if (seats[i]) {
            for (let j = 0; j < seats[i].seats.length; j++) {
              if (seats[i].seats[j] != null) {
                for (let k in seat) {
                  if (seats[i].seats[j].seatCode == seat[k].code) {
                    seats[i].seats[j].status = seat[k].status
                  }
                }
              };
            }
          }
        }
        var maxColumn = 0; // 计算最大列
        for (var i = 0; i < seats.length; i++) {
          if (seats[i]) {
            if (seats[i].seats.length > maxColumn) {
              maxColumn = seats[i].seats.length
            }
          }
        }
        var scale = 650 / (maxColumn * 64 - 8);
        that.setData({
          rows: seats,
          scale:scale
        })
        that.setRowNum();
      }
    })
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: app.globalData.filmName //页面标题
    })
    // console.log(app.globalData)
    // console.log("app" + app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode)
    // 获取座位信息
    var that = this;
    var nowtime = new Date().getTime();
  },
  manage: function(res) { //处理数据
    var that = this;
    var maps = [];
    var seats = res;
    var maxRow = 0; // 计算最Y轴
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].YCoord) > maxRow) {
        maxRow = parseInt(seats[i].YCoord)
      }
    }
    var minRow = maxRow; // 计算最小Y轴
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].YCoord) < minRow) {
        minRow = parseInt(seats[i].YCoord)
      }
    }
    // 同行整合
    for (var j = minRow; j < maxRow + 1; j++) {
      maps[j - minRow] = [];
      for (var i = 0; i < seats.length; i++) {
        if (seats[i].YCoord == j) {
          maps[j - minRow].push(seats[i])
        }
      }
    }
    // console.log(maps)
    maxRow = maxRow - minRow + 1;
    var maxColumn = 0; // 计算最大列
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].XCoord) > maxColumn) {
        maxColumn = parseInt(seats[i].XCoord)
      }
    }
    var minColumn = maxColumn; // 计算最小列
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].XCoord) < minColumn) {
        minColumn = parseInt(seats[i].XCoord)
      }
    }
    // console.log(minColumn)
    // console.log(maxColumn)
    // 处理列
    var result = [];
    for (var i = 0; i < maps.length; i++) {
      var oneRow = maps[i];
      var newRow = [];
      if (oneRow.length == 0) {
        for (var j = minColumn; j < maxColumn + 1; j++) {
          var row = {};
          row.isEmpty = true;
          newRow.push(row)
        }
      } else {
        for (var j = minColumn; j < maxColumn + 1; j++) {
          var num = 0;
          for (var g = 0; g < oneRow.length; g++) {
            if (maps[i][g].XCoord == j) {
              newRow.push(maps[i][g])
              num++;
            }
          }
          if (num == 0) {
            var row = {};
            row.isEmpty = true;
            newRow.push(row)
          }
        }
      }

      result.push(newRow)
    }
    maps = result;
    // console.log(maps)
    // 情侣座
    for (var i = 0; i < maps.length; i++) {
      for (var j = 0; j < maps[i].length; j++) {
        var groupCode = maps[i][j].groupCode;
        for (var g = j + 1; g < maps[i].length; g++) {
          if (groupCode == maps[i][g].groupCode) {
            maps[i][j].isLeft = true;
            maps[i][g].isRight = true;
          }
        }
      }
    }
    // 多人座
    for (var i = 0; i < maps.length; i++) {
      for (var j = 0; j < maps[i].length; j++) {
        if (maps[i][j].isLeft && maps[i][j].isRight) {
          maps[i][j].isLeft = false;
          maps[i][j].isRight = false;
          maps[i][j].isMiddle = true;
        }
      }
    }
    //座位名称
    for (var i = 0; i < maps.length; i++) {
      for (var j = 0; j < maps[i].length; j++) {
        maps[i][j].seatname = maps[i][j].rowNum + "排" + maps[i][j].columnNum + "座"
      }
    }
    // console.log(maps)
    var scale = 650 / (maxColumn * 64 - 8);
    that.setData({
      seats: maps,
      scale: scale
    })
   
  },
  setRowNum:function(){
    var that = this;
    var seats = that.data.seats;
    var rownums = that.data.rownum;
    for(var i = 0;i < seats.length;i++){
      if (seats[i] && seats[i].rowNum){
        var rownum = seats[i].rowNum;
        rownums[i]=rownum;
      } else {
        rownums[i] = "";
      }
    }
    that.setData({
      rownum:rownums
    })
  },
  choose: function(e) { //选座
    var that = this;
    var rows = that.data.rows;
    var code = e.currentTarget.dataset.code;
    var seatNum = that.data.seatNum;
    var status = e.currentTarget.dataset.status;
    var checkNum = 0;
    if (canOnePointMove){
      return;
    }
    if (status == "sell") {
      // wx.showModal({
      //   title: '选座失败',
      //   content: '该座位已售出',
      //   showCancel: true
      // })
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]) {
        for (let j = 0; j < rows[i].seats.length; j++) {
          let g = j + 1;
          let k = j - 1;
          if (rows[i].seats[j] != null && rows[i].seats[j].seatCode == code) {
            if (rows[i].seats[j].isSelect) {
              rows[i].seats[j].isSelect = false;
              checkNum--;
              if (rows[i].seats[j].loveFlag == 'L') {
                rows[i].seats[g].isSelect = false;
                checkNum--;
              };
              if (rows[i].seats[j].loveFlag == 'R') {
                rows[i].seats[k].isSelect = false;
                checkNum--;
              }
            } else {
              if (rows[i].seats[j].loveFlag == 'L') {
                rows[i].seats[g].isSelect = true;
                checkNum++;
              };
              if (rows[i].seats[j].loveFlag == 'R') {
                rows[i].seats[k].isSelect = true;
                checkNum++;
              }
              rows[i].seats[j].isSelect = true;
              checkNum++;
            }
          }
        }
      }
    }
    seatNum = seatNum + checkNum;
    if (seatNum > 4) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i]) {
          for (var j = 0; j < rows[i].seats.length; j++) {
            let g = j + 1;
            let k = j - 1;
            if (rows[i].seats[j] != null && rows[i].seats[j].seatCode == code) {
              rows[i].seats[j].isSelect = false;
              seatNum--;
              if (rows[i].seats[j].loveFlag == "L") {
                rows[i].seats[g].isSelect = false;
                seatNum--;
              }
              if (rows[i].seats[j].loveFlag == "R") {
                rows[i].seats[k].isSelect = false;
                seatNum--;
              }
            }
          }
        }
      }
      wx.showModal({
        title: '选座失败',
        content: '一次最多购买4张票',
      })
    }
    that.setData({
      rows: rows,
      seatNum: seatNum
    })
    that.dealseat();
  },
  dealseat: function() {
    var that = this;
    var rows = that.data.rows;
    var seatArr = [];
    var seatNumber = [];
    // console.log(rows)
    for (var i = 0; i < rows.length; i++) {
      if (rows[i]) {
        for (var j = 0; j < rows[i].seats.length; j++) {
          if (rows[i].seats[j] != null && rows[i].seats[j].isSelect) {
            seatArr.push([rows[i].seats[j].rowNum + '排' + rows[i].seats[j].columnNum + '座'])
            seatNumber.push(rows[i].seats[j].seatCode)
          }
        }
      }
    }
    // console.log(seatArr)
    // console.log(seatNumber)
    that.setData({
      seatArr: seatArr,
      seatNumber: seatNumber,
      price: that.data.salePrice,
    })
    that.setData({
      totalPrice: (seatArr.length * that.data.price).toFixed(2),
    })
    // if (that.data.nowlist.marketPrice - that.data.nowlist.disPrice > 0 && that.data.nowlist.globalLeftNum != null) { //有优惠
    //   var total = 0;
    //   if (that.data.nowlist.globalLeftNum == -88) { //无限制
    //     that.setData({
    //       totalPrice: (seatArr.length * that.data.nowlist.disPrice).toFixed(2),
    //       activityPriceNum: seatArr.length
    //     })
    //   } else {
    //     if (seatArr.length < that.data.nowlist.globalLeftNum) { //个数内
    //       that.setData({
    //         totalPrice: (seatArr.length * that.data.nowlist.disPrice).toFixed(2),
    //         activityPriceNum: seatArr.length
    //       })
    //     } else { //超出个数
    //       that.setData({
    //         totalPrice: (that.data.nowlist.globalLeftNum * that.data.nowlist.disPrice + (seatArr.length - that.data.nowlist.globalLeftNum) * that.data.price).toFixed(2),
    //         activityPriceNum: that.data.nowlist.globalLeftNum
    //       })
    //     }
    //   }

    // } else {
    //   that.setData({
    //     totalPrice: (seatArr.length * that.data.price).toFixed(2),
    //     activityPriceNum: 0
    //   })
    // }
  },
  sureSeat: function() {
    let that = this;
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let reg = /[\u4e00-\u9fa5]/g;
    let today = that.data.sessionDate.replace(reg, "").split('-');
    wx.showModal({
      title: '您购买的是' + today[0] + '月' + today[1] + '日的电影',
      content: app.globalData.cinemaList.ticketHint,
      success(res) {
        if (res.cancel) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          var nowtime = new Date().getTime();
          var sign = app.createMD5('countOrderPrice', nowtime);
          var appData = app.globalData;
          var seatarr = "";
          var seatNumber = "";
          var ticketNum = that.data.seatArr.length;
          var ticketOriginPrice = that.data.price;

          if (that.data.seatArr.length == 0) {
            wx.showModal({
              title: '',
              content: '还没选座位哦',
            })
            return;
          }
          if (!that.data.isClick) {
            that.setData({
              isClick: true
            })
          } else {
            return;
          }
          // wx.showLoading()
          for (var i = 0; i < that.data.seatArr.length; i++) {
            seatarr += that.data.seatArr[i] + ","
            seatNumber += that.data.seatNumber[i] + ","
          }
          seatarr = seatarr.substring(0, seatarr.length - 1);
          seatNumber = seatNumber.substring(0, seatNumber.length - 1);
          var activityId = that.data.activityId;
          if (activityId == null) {
            activityId = "";
          }
          var newNum = that.data.seatNumber.toString();
          let xml = '<LockSeat>' +
            '<CinemaCode>' + app.globalData.cinemacode + '</CinemaCode>' +
            '<Order>' +
            '<Count>' + that.data.seatNum + '</Count>' +
            '<PayType>' + '0' + '</PayType>';

          for (let i = 0; i < that.data.seatNum; i++) {
            let newNum = that.data.seatNumber[i].toString();
            xml += '<Seat>';
            xml += '<AddFee>' + app.globalData.moviesListDate.addFee + '</AddFee>';
            xml += '<CinemaAllowance>' + app.globalData.moviesListDate.cinemaAllowance + '</CinemaAllowance>';
            xml += '<Fee>' + app.globalData.moviesListDate.ticketFee + '</Fee>';
            xml += '<Price>' + that.data.salePrice + '</Price>';
            xml += '<SeatCode>' + newNum + '</SeatCode>';
            xml += '</Seat>';
          }
          xml += '<SessionCode>' + that.data.featureAppNo + '</SessionCode>';
          xml += '</Order>';
          xml += '</LockSeat>';
          wx.request({
            url: app.globalData.url + '/Api/Order/LockSeat',
            data: {
              userName: app.usermessage.Username,
              password: app.usermessage.Password,
              openID: app.globalData.openId,
              queryXml: xml,
            },
            method: "POST",
            header: {
              // "content-Type": "application/x-www-form-urlencoded"
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              // console.log(res)
              if (res.data.Status == "Success") {
                // console.log(that.data)
                // console.log(app.globalData)
                var order = res.data.order;
                var date = that.data.date + ' ' + that.data.startTime2 + '-' + that.data.endtime;
                var screenName = that.data.screenName;
                var autoUnlockDatetime = order.autoUnlockDatetime;
                var count = order.count;
                var seat = that.data.seatArr;
                var orderCode = order.orderCode;
                var sessionCode = order.sessionCode;
                var title = app.globalData.movieList[app.globalData.movieIndex].name;
                var price = that.data.totalPrice;
                app.globalData.seat = order.seat;
                wx.hideLoading();
                wx.showToast({
                  title: '正在预定座位...',
                  icon: 'loading',
                  duration: 2000,
                  mask: true,
                  success: function (res) {
                    setTimeout(function () {
                      wx.redirectTo({
                        url: '../orderForm/orderForm?date=' + date + '&&screenName=' + screenName + '&&autoUnlockDatetime=' + autoUnlockDatetime + '&&count=' + count + '&&seat=' + seat + '&&orderCode=' + orderCode + '&&sessionCode=' + sessionCode + '&&title=' + title + '&&price=' + price,
                      })
                    }, 500)
                  },
                  fail: function (res) { },
                  complete: function (res) { },
                })
              } else {
                wx.showToast({
                  title: '选座失败，请选择其他场次',
                  content: res.data.ErrorMessage,
                  icon: 'none',
                  duration: 3000
                });
              }
              that.setData({
                isClick: false
              })
            }
          })
        }
      }
    })
  },
  // 暂时不要更换场次按钮
  // change: function() {
  //   wx.navigateBack({})
  // },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.setNavigationBarTitle({ title: app.globalData.cinemaList.cinemaName });
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
      title: app.globalData.cinemaList.cinemaName,
      path: '/pages/index/index'
    }
  },
  // // 缩放，平移
  touchstart: function (e) {

    var that = this

    if (e.touches.length < 2) {

      canOnePointMove = true

      onePoint.x = e.touches[0].pageX * 2

      onePoint.y = e.touches[0].pageY * 2

    } else {

      twoPoint.x1 = e.touches[0].pageX * 2

      twoPoint.y1 = e.touches[0].pageY * 2

      twoPoint.x2 = e.touches[1].pageX * 2

      twoPoint.y2 = e.touches[1].pageY * 2

    }

  },
  touchmove: function (e) {

    var that = this

    if (e.touches.length < 2 && canOnePointMove) {

      var onePointDiffX = (e.touches[0].pageX * 2 - onePoint.x) / 2

      var onePointDiffY = (e.touches[0].pageY * 2 - onePoint.y) / 2

      that.setData({

        translateX: onePointDiffX + that.data.translateX,

        translateY: onePointDiffY + that.data.translateY

      })

      onePoint.x = e.touches[0].pageX * 2

      onePoint.y = e.touches[0].pageY * 2



    } else if (e.touches.length > 1) {

      var preTwoPoint = JSON.parse(JSON.stringify(twoPoint))

      twoPoint.x1 = e.touches[0].pageX * 2

      twoPoint.y1 = e.touches[0].pageY * 2

      twoPoint.x2 = e.touches[1].pageX * 2

      twoPoint.y2 = e.touches[1].pageY * 2

      // 计算角度，旋转(优先)

      // var perAngle = Math.atan((preTwoPoint.y1 - preTwoPoint.y2) / (preTwoPoint.x1 - preTwoPoint.x2)) * 180 / Math.PI

      // var curAngle = Math.atan((twoPoint.y1 - twoPoint.y2) / (twoPoint.x1 - twoPoint.x2)) * 180 / Math.PI

      // if (Math.abs(perAngle - curAngle) > 1) {

      //   // that.setData({

      //   //   msg: '旋转',

      //   //   rotate: that.data.rotate + (curAngle - perAngle)

      //   // })

      // } else {

      // 计算距离，缩放

      var preDistance = Math.sqrt(Math.pow((preTwoPoint.x1 - preTwoPoint.x2), 2) + Math.pow((preTwoPoint.y1 - preTwoPoint.y2), 2))

      var curDistance = Math.sqrt(Math.pow((twoPoint.x1 - twoPoint.x2), 2) + Math.pow((twoPoint.y1 - twoPoint.y2), 2))
      var scaleNum = that.data.scale + (curDistance - preDistance) * 0.005;
      if (scaleNum < 0.3) {
        scaleNum = 0.3
      }
      that.setData({

        // msg: '缩放',

        scale: scaleNum

      })

      // }

    }
    // that.checkLeft();
  },

  touchend: function (e) {

    var that = this

    canOnePointMove = false

  },
})