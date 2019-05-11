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
  },
  bindPickerChange002: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({index002: e.detail.value})
  },
  bindDateChange999: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({date999: e.detail.value})
  },

  btnShowExchange2:(e)=>{
    _this.setData({showAlertExchange2:!_this.data.showAlertExchange2})
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