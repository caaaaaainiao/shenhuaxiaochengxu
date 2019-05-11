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
module.exports = {
  formatTime: formatTime,
  sortDistance: sortDistance//计算出最近的影院显示在定位处
}
