//获取应用实例
const app = getApp()
let _this;
Page({
  // 页面的初始数据
  data: {
    showAlertExchange:false,
    showAlertExchange2:true,
    exchangeList:[
      {text:'100',tips:'',checked:false},
      {text:'200',tips:'',checked:true},
      {text:'300',tips:'升级为季卡',checked:false},
      {text:'600',tips:'升级为半年卡',checked:false},
      {text:'1200',tips:'升级为年卡',checked:false},
    ],
    exchangeList_a: [
      { text: '1个月', tips: '', checked: false },
      { text: '2个月', tips: '', checked: true },
      { text: '3个月', tips: '升级为季卡', checked: false },
      { text: '6个月', tips: '升级为半年卡', checked: false },
      { text: '12个月', tips: '升级为年卡', checked: false },
    ],
    exchangeList2:[
      {text:'100',tips:'',checked:false},
      {text:'200',tips:'送20元',checked:true},
      {text:'300',tips:'送50元',checked:false},
      {text:'400',tips:'送80元',checked:false},
      {text:'500',tips:'送100元',checked:false},
    ],
  },
  btnShowExchange:(e)=>{
    _this.setData({showAlertExchange:!_this.data.showAlertExchange})
  },
  btnShowExchange2:(e)=>{
    _this.setData({showAlertExchange2:!_this.data.showAlertExchange2})
  },
  btnChoose:(e)=>{
    console.log(e);
    let idx=e.currentTarget.dataset.id;
    let temp=_this.data.exchangeList;
    temp.forEach((item,index)=>{
      if (index==idx) {
        item.checked=true
      }else{
        item.checked=false
      }
    })
    _this.setData({exchangeList:temp})
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
  btnDelete:(e)=>{
    console.log(e);
    let idx=e.currentTarget.dataset.id;
    wx.showModal({
      title:'解绑',
      content: "解除绑定后,将不再享受相应的会员权益",
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#d20909",
      confirmText: "确定",
      confirmColor: "#999999",
      success: function(res) {
        
      },
      fail: function (res) {
        
      },
      complete: function (res) {
        
      }
    });
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