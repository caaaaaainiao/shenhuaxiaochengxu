//获取应用实例
const app = getApp()
let _this;
Page({
  // 页面的初始数据
  data: {
    showAlertExchange2:false,
    exchangeList2:[
    {text:'100',tips:'',checked:false},
    {text:'200',tips:'送20元',checked:true},
    {text:'300',tips:'送50元',checked:false},
    {text:'400',tips:'送80元',checked:false},
    {text:'500',tips:'送100元',checked:false},
    ],
    date999: '',
    array002:['','男','女'],
    index002: 0,
    phone: '',
    password: '',
    name: ''
  },
  getPhone: function (e) {
    console.log(e.detail.value)
    this.setData({ phone: e.detail.value })
  },
  getPassword: function (e) {
    console.log(e.detail.value)
    this.setData({ password: e.detail.value })
    if (e.detail.value == '') {
      wx.showToast({
        title: '密码不能为空！',
        icon: 'none',
        duration: 3000
      })
    }
  },
  surePassword: function (e) {
    console.log(e.detail.value)
    if (e.detail.value != this.data.password) {
      wx.showToast({
        title: '密码不一致！',
        icon: 'none',
        duration: 3000
      })
    }
  },
  getName: function (e) {
    console.log(e.detail.value)
    this.setData({ name: e.detail.value })
  },
  bindDateChange999: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({ date999: e.detail.value })
  },
  bindPickerChange002: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({index002: e.detail.value})
  },
  

  btnShowExchange2:(e)=>{
    console.log(_this.data);
    var data = {
      Username: "MiniProgram",
      Password: "6BF477EBCC446F54E6512AFC0E976C41",
      CinemaCode: 33097601,
      OpenID: '12345',
      // 会员卡密码
      CardPassword: _this.data.password,
      // 等级编号
      LevelCode: '2',
      // 初始金额
      InitialAmount: '89',
      // 用户名
      CardUserName: _this.data.name,
      // 手机号
      MobilePhone: _this.data.phone,
      // 身份证号
      IDNumber: '362528199608210013',
      // 性别
      Sex: _this.data.index002
    };
    var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!Num.test(_this.data.phone)) {
      wx.showToast({
        title: '手机号码错误',
        icon: 'none',
        duration: 3000
      })
    } 
    else {
      wx.request({
        url: 'https://xc.80piao.com:8443/Api/Member/CardRegister' + '/' + data.Username + '/' + data.Password + '/' + data.CinemaCode + '/' + data.OpenID + '/' + data.CardPassword + '/' + data.LevelCode + '/' + data.InitialAmount + '/' + data.CardUserName + '/' + data.MobilePhone + '/' + data.IDNumber + '/' + data.Sex,
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res)
        }
      })
      _this.setData({ showAlertExchange2: !_this.data.showAlertExchange2 })
    }
    
  },
  btnChoose2:(e)=>{
    console.log(e);
    let idx=e.currentTarget.dataset.id;
    let temp=_this.data.exchangeList2;
    temp.forEach((item,index)=>{
      if (index==idx) {
        item.checked=true
      }else{
        item.checked=false
      }
    })
    _this.setData({exchangeList2:temp})
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    _this=this;
    wx.setNavigationBarTitle({title: '会员卡'});
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {},
  // 生命周期函数--监听页面显示
  onShow: function () {},
  // 生命周期函数--监听页面隐藏
  onHide: function () {},
  // 生命周期函数--监听页面卸载
  onUnload: function () {},
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {},
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {},
  // 用户点击右上角分享
  onShareAppMessage: function () {}
})