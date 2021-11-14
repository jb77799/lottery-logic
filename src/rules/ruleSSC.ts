import { OptionSection, ProfitParams } from 'src/Interfases'
import BetOptionsGenerator from '../optionsGenerators/Generator'
import CalculatorSSC from '../profitCalculators/CalculatorSSC'
import Util from '../Util'
import { encode as BaoZiShunZiDuiZiEncode, decode as BaoZiShunZiDuiZiDecode } from '../encoders/BaoZiShunZiDuiZi'
import { encode as DaXiaoDanShuangEncode, decode as DaXiaoDanShuangDecode } from '../encoders/DaXiaoDanShuang'
import { encode as LongHuEncode, decode as LongHuDecode } from '../encoders/LongHuHe'

const OptionsGenerator = new BetOptionsGenerator()
const ProfitCalculator = new CalculatorSSC()

const DIGIT_ARRAY = ['万位', '千位', '百位', '十位', '个位']
const DA_XIAO_DAN_XHUANG_ARRAY = ['大', '小', '单', '双']
const LONG_HU_HE_ARRAY = ['龙', '虎', '和']
const QUJIAN_ARRAY = ['一区(0-1)', '二区(2-3)', '三区(4-5)', '四区(6-7)', '五区(8-9)']
const DA_XIAO_ARRAY = ['小(0-4)', '大(5-9)']

enum QuJian {
  '一区(0-1)',
  '二区(2-3)',
  '三区(4-5)',
  '四区(6-7)',
  '五区(8-9)'
}

enum DaXiao {
  '小(0-4)',
  '大(5-9)'
}

/** 获取几个数组的任选排列 */
function getPailieByRenxuanArr(sumArr: Array<any>, len: number) {
  if (sumArr.length < len) return 0
  var numArr: Array<string> = []
  getAllPailieZuheListNew(sumArr, len, numArr, '', false)
  var total = 0
  numArr.forEach(function (element) {
    var arr = element.split(',')
    var sum = 1
    arr.forEach(function (element) {
      sum = sum * Number(element)
    })
    total = total + sum
  })
  return total
}

/** 获取几个数字的所有排列组合 */
function getAllPailieZuheListNew(data: Array<string>, len: number, numArr: Array<string>, str: string, isRepeat = false) {
  for (var i = 0; i < data.length; i++) {
    if (len === 1) {
      numArr.push(str + data[i])
    } else {
      var newData = data.concat()
      if (!isRepeat) newData.splice(0, i + 1)
      getAllPailieZuheListNew(newData, len - 1, numArr, str + data[i] + ',', isRepeat)
    }
  }
}

function getPailieByRenxuan(this: any, num: number) {
  var sum: Array<number> = []
  this.betOptions.forEach((element: any) => {
    if (element.selected.length) {
      sum.push(element.selected.length)
    }
  })
  return getPailieByRenxuanArr(sum, num)
}

function positionBet(num: number, position: Array<number>, limit: number) {
  var total = position.reduce(function (sum: number, ele: number) {
    return sum + ele
  }, 0)
  var bs = getPailieByNoLabel(total, limit)
  return num * bs
}

/** 获取几个号码的排列 */
function getPailieByNoLabel(num: number, len: number) {
  if (num < len) return 0
  var numArr: Array<string> = []
  OptionsGenerator.getAllPailieZuHeBuTongHao(Array(num).fill(1), len, numArr, '', false)
  return numArr.length
}

/** 获取和值排列并求和 */
function getPailieSumOfHezhi(data: any, limit: number, sum: number) {
  var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  var numArr: Array<number> = []
  var total = 0
  OptionsGenerator.getAllPailieZuHeBuTongHao(arr, limit, numArr, sum, true)
  for (var i = 0, len = data.length; i < len; i++) {
    numArr.forEach(function (ele: number) {
      if (ele === Number(data[i])) {
        total++
      }
    })
  }
  return total
}

/** 获取和值排列并求和不含豹子号 */
function getPailieSumOfHezhiNoBaozi(data: Array<string>, limit: number) {
  var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  var sumArr: Array<string> = []
  var numArr: Array<string> = []
  var total = 0
  getAllPailieZuheListNoBaozi(arr, limit, sumArr, numArr, 0, '', true)
  for (var i = 0, len = data.length; i < len; i++) {
    sumArr.forEach(function (ele) {
      if (String(ele) === data[i]) {
        total++
      }
    })
  }
  return total
}

/** 获取排列组合不包含豹子 */
function getAllPailieZuheListNoBaozi(data: Array<any>, len: number, sumArr: Array<string>, numArr: Array<any>, sum: number, str: string, isRepeat = false) {
  for (var i = 0; i < data.length; i++) {
    var newStr = str + data[i]
    var newSum = sum + data[i]
    if (len === 1) {
      // 排除豹子
      if (Util.judgeCharRepeatNum(newStr, data[i]) !== newStr.length) {
        var newArr = newStr.split('')
        var isExist = numArr.some(function (ele) {
          var flag = ele.every(function (num: any) {
            return newArr.includes(num)
          })
          if (flag) {
            var array1 = ele.sort()
            var array2 = newArr.sort()
            for (var j = 0; j < array2.length; j++) {
              if (array2[j] !== array1[j]) {
                return false
              }
            }
            return true
          }
        })
        if (!isExist) {
          numArr.push(newArr)
          sumArr.push(newSum)
        }
      }
    } else {
      var newData = data.concat()
      if (!isRepeat) newData.splice(0, i + 1)
      getAllPailieZuheListNoBaozi(newData, len - 1, sumArr, numArr, newSum, newStr, isRepeat)
    }
  }
}

/** 二重号和单号排列组合 */
function getPailieOfErchonghaoDanhao(minArr: Array<string>, maxArr: Array<string>, limit: number) {
  if (maxArr.length < limit || minArr.length === 0) return 0
  var numArr: Array<string> = []
  OptionsGenerator.getAllPailieZuHeBuTongHao(maxArr, limit, numArr, '', false)
  var total = 0
  for (var i = 0, len = minArr.length; i < len; i++) {
    var sum = 0
    numArr.forEach(function (ele) {
      if (!ele.includes(minArr[i])) {
        sum++
      }
    })
    total = total + sum
  }
  return total
}

/** 二重号排列组合 */
function getPailieOfErchonghaoSingle(data: Array<string>, limit: number) {
  if (data.length < limit) return 0
  var numArr: Array<string> = []
  OptionsGenerator.getAllPailieZuHeBuTongHao(data, limit, numArr, '', false)
  return numArr.length
}

/** 获取跨度排列并求最大和最小之差 */
function getPailieDOfKuadu(data: Array<string>, limit: number) {
  var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  var numArr: Array<string> = []
  var total = 0
  getAllPailieZuheChaList(arr, limit, numArr, null, null, true)

  for (var i = 0, len = data.length; i < len; i++) {
    numArr.forEach(function (ele: string) {
      if (String(ele) === data[i]) {
        total++
      }
    })
  }
  return total
}

/** 获取几个数字的所有排列组合最大和最小差值 */
function getAllPailieZuheChaList(data: Array<any>, len: number, numArr: Array<any>, min: number | null, max: number | null, isRepeat = false) {
  for (var i = 0; i < data.length; i++) {
    var newMin = min
    var newMax = max
    if (!newMin && newMin !== 0) {
      newMin = data[i]
    }
    if (!newMax && newMax !== 0) {
      newMax = data[i]
    }
    if (len === 1) {
      numArr.push(Math.max(Number(newMax), data[i]) - Math.min(Number(newMin), data[i]))
    } else {
      var newData = data.concat()
      if (!isRepeat) newData.splice(0, i + 1)
      getAllPailieZuheChaList(newData, len - 1, numArr, Math.min(Number(newMin), data[i]), Math.max(Number(newMax), data[i]), isRepeat)
    }
  }
}

function generatLongHuHeRule(label: string) {
  return {
    betOptions: OptionsGenerator.generatBetOptions(LONG_HU_HE_ARRAY, false, [label]),
    encode: LongHuEncode,
    decode: LongHuDecode,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(((data.prize * data.amountUnit) / 6) * data.beishu - data.betAmt, 2))
  }
}

export default {
  'yixing-dingweidan-fushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY),
    betCount: function () {
      return this.betOptions.reduce((sum: number, element: OptionSection) => sum + element.selected.length, 0)
    },
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{ 1: 1 }, { 1: 2 }, { 1: 3 }, { 1: 4 }, { 1: 5 }], 1)
    }
  },
  'wuxing-zhixuan-fushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY)
  },
  'sixing-zhixuan-fushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(1))
  },
  'qiansan-zhixuan-fushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
  },
  'zhongsan-zhixuan-fushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(1, 4))
  },
  'housan-zhixuan-fushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
  },
  'erxing-zhixuan-houerfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(3))
  },
  'erxing-zhixuan-qianerfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(0, 2))
  },
  'renxuan-renxuan2-zhixuanfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY),
    betCount: getPailieByRenxuan(2),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, { 1: 3 }, { 1: 6 }, { 1: 10 }], 2)
    }
  },
  'renxuan-renxuan3-zhixuanfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY),
    betCount: getPailieByRenxuan(3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan4-zhixuanfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY),
    betCount: getPailieByRenxuan(4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, {}, { 1: 5 }], 4)
    }
  },
  'renxuan-renxuan2-zhixuandanshi': {
    betCount: () => 2,
    rule: '勾选2位后输入(0-9)2个号码1注,与开奖号码位置和数值完全相同,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12 34 67或33|98|45',
    position: [1, 1, 1, 0, 0],
    positionLimit: 2,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 2),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, { 1: 3 }, { 1: 6 }, { 1: 10 }], 2)
    }
  },
  'renxuan-renxuan3-zhixuandanshi': {
    betCount: () => 3,
    rule: '勾选3位后输入(0-9)2个号码1注,与开奖号码位置和数值完全相同,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 345 678或334|985|456',
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan4-zhixuandanshi': {
    betCount: () => 4,
    rule: '勾选4位后输入(0-9)4个号码1注,与开奖号码位置和数值完全相同,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 1234 3456 6789或3347|9856|4568',
    position: [0, 1, 1, 1, 1],
    positionLimit: 4,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, {}, { 1: 5 }], 4)
    }
  },
  'renxuan-renxuan2-zuxuandanshi': {
    betCount: () => 2,
    rule: '勾选2位后输入(0-9)2个不同号码为1注,与开奖号码位置和数值完全相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12 34 67或33|98|45',
    noRepeat: true,
    noOrder: true,
    position: [0, 0, 0, 1, 1],
    positionLimit: 2,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, { 1: 3 }, { 1: 6 }, { 1: 10 }], 2)
    }
  },
  'renxuan-renxuan3-zusandanshi': {
    betCount: () => 3,
    rule: '勾选3位后输入(0-9)2个不同号码为2注,与开奖号码位置和数值完全相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 121 334 667或331|988|454',
    isNeedRepeat: true,
    mustRepeatNum: 2,
    noBaozi: true,
    noOrder: true,
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan3-zuliudanshi': {
    betCount: () => 3,
    rule: '勾选3位后输入(0-9)3个不同号码为1注,与开奖号码位置和数值完全相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 345 678或312|987|456',
    noRepeat: true,
    noOrder: true,
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan3-hunhezuxuan': {
    betCount: () => 3,
    rule: '勾选3位后输入(0-9)3个号码为1注(不含豹子号),符合与开奖号码组三组六规则,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 345 678或312|987|456',
    noBaozi: true,
    noOrder: true,
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan2-zhixuanhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 18, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 2, 0)
    },
    position: [0, 0, 1, 1, 0],
    positionLimit: 2,
    isSingleNum: true,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 2),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, { 1: 3 }, { 1: 6 }, { 1: 10 }], 2)
    }
  },
  'renxuan-renxuan3-zhixuanhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 27, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 3, 0)
    },
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    isSingleNum: true,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan2-zuxuanhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 17, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 2)
    },
    position: [0, 0, 0, 1, 1],
    positionLimit: 2,
    isSingleNum: true,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 2),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, { 1: 3 }, { 1: 6 }, { 1: 10 }], 2)
    }
  },
  'renxuan-renxuan3-zuxuanhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 26, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 3)
    },
    position: [0, 0, 1, 1, 1],
    positionLimit: 2,
    isSingleNum: true,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 3),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan2-zuxuanfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2),
    position: [0, 0, 0, 1, 1],
    positionLimit: 2,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, { 1: 3 }, { 1: 6 }, { 1: 10 }], 2)
    }
  },
  'renxuan-renxuan3-zusanfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2) * 2,
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 6),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'renxuan-renxuan4-zuxuan24': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 4),
    position: [0, 1, 1, 1, 1],
    positionLimit: 4,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, {}, { 1: 5 }], 4)
    }
  },
  'renxuan-renxuan4-zuxuan12': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['二重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 2)
    },
    position: [0, 1, 1, 1, 1],
    positionLimit: 4,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, {}, { 1: 5 }], 4)
    }
  },
  'renxuan-renxuan4-zuxuan6': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['二重号']),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 2)
    },
    position: [0, 1, 1, 1, 1],
    positionLimit: 4,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, {}, { 1: 5 }], 4)
    }
  },
  'renxuan-renxuan4-zuxuan4': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['三重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 1)
    },
    position: [0, 1, 1, 1, 1],
    positionLimit: 4,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 4),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, {}, { 1: 5 }], 4)
    }
  },
  'renxuan-renxuan3-zuliufushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 3),
    position: [0, 0, 1, 1, 1],
    positionLimit: 3,
    positionBetCount: (num: number, position: Array<number>) => positionBet(num, position, 6),
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.profitWrapper.call(this, data, [{}, {}, {}, { 1: 4 }, { 1: 10 }], 3)
    }
  },
  'hezhi-wuxing-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 45, false), true),
    isSingleNum: true,
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.getProfitSSC.call(this, data)
    }
  },
  'wuxing-zhixuan-danshi': {
    betCount: () => 5,
    rule: '输入(0-9)任意5个号码1注,与开奖号码完全相同(且顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12345 23456 88767或33021|98897|45698'
  },
  'sixing-zhixuan-danshi': {
    betCount: () => 4,
    rule: '输入(0-9)4个号码1注,与开奖号码千 百 十 个位相同(顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 1234 2345 8876或3302|9889|4569'
  },
  'qiansan-zhixuan-danshi': {
    betCount: () => 3,
    rule: '输入(0-9)3个号码1注,与开奖号码万 千 百位完全相同(顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 234 887或330|988|456'
  },
  'housan-zhixuan-danshi': {
    betCount: () => 3,
    rule: '输入(0-9)3个号码1注,与开奖号码百 十 个位完全相同(顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 234 887或330|988|456'
  },
  'erxing-zhixuan-houerdanshi': {
    betCount: () => 2,
    rule: '输入(0-9)2个号码1注,与开奖号码十 个位完全相同(顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12 23 87或30|87|56'
  },
  'erxing-zhixuan-qianerdanshi': {
    betCount: () => 2,
    rule: '输入(0-9)2个号码1注,与开奖号码万 千位完全相同(顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12 23 87或30|87|56'
  },
  'qiansan-zuxuan-zusandanshi': {
    betCount: () => 3,
    rule: '输入(0-9)2个不同号码1注,与开奖号码万 千 百位相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 122 556 878或221|998|445',
    isNeedRepeat: true,
    mustRepeatNum: 2,
    noBaozi: true,
    noOrder: true
  },
  'zhongsan-zuxuan-zusandanshi': {
    betCount: () => 3,
    rule: '输入(0-9)2个不同号码1注,与开奖号码千 百 十位相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 112 565 887或221|998|445',
    isNeedRepeat: true,
    mustRepeatNum: 2,
    noBaozi: true,
    noOrder: true
  },
  'housan-zuxuan-zusandanshi': {
    betCount: () => 3,
    rule: '输入(0-9)2个不同号码1注,与开奖号码百 十 个位相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 112 565 887或221|998|454',
    isNeedRepeat: true,
    mustRepeatNum: 2,
    noBaozi: true,
    noOrder: true
  },
  'qiansan-zuxuan-zuliudanshi': {
    betCount: () => 3,
    rule: '输入(0-9)3个不同号码1注,与开奖号码万 千 百位相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456',
    noRepeat: true,
    noOrder: true
  },
  'zhongsan-zuxuan-zuliudanshi': {
    betCount: () => 3,
    rule: '输入(0-9)3个不同号码1注,与开奖号码千 百 十位相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456',
    noRepeat: true,
    noOrder: true
  },
  'housan-zuxuan-zuliudanshi': {
    betCount: () => 3,
    rule: '输入(0-9)3个不同号码1注,与开奖号码百 十 个位相同(顺序不限),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456',
    noRepeat: true,
    noOrder: true
  },
  'erxing-zuxuan-houerdanshi': {
    betCount: () => 2,
    rule: '输入(0-9)2个不同号码1注,与开奖号码十 个位相同(顺序不限,不含对子号),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12 46 87或23|87|56',
    noRepeat: true,
    noOrder: true,
    noBaozi: true
  },
  'erxing-zuxuan-qianerdanshi': {
    betCount: () => 2,
    rule: '2个不同号码为1注,与开奖号码万 千位完全相同(顺序不限,不含对子号),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 12 23 87或30|87|56',
    noRepeat: true,
    noBaozi: true,
    noOrder: true
  },
  'qiansan-zuxuan-hunhezuxuan': {
    betCount: () => 3,
    rule: '输入(0-9)3个号码1注(不含豹子号),符合与开奖号码组三组六规则,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456',
    noBaozi: true,
    noOrder: true
  },
  'zhongsan-zuxuan-hunhezuxuan': {
    betCount: () => 3,
    rule: '输入(0-9)3个号码1注(不含豹子号),符合与开奖号码组三组六规则,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456',
    noBaozi: true,
    noOrder: true
  },
  'housan-zuxuan-hunhezuxuan': {
    betCount: () => 3,
    rule: '输入(0-9)3个号码1注(不含豹子号),符合与开奖号码组三组六规则,即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456',
    noBaozi: true,
    noOrder: true
  },
  'zhongsan-zhixuan-danshi': {
    betCount: () => 3,
    rule: '输入(0-9)3个号码1注,与开奖号码千 百 十位完全相同(顺序一致),即为中奖',
    placeholder: '输入注单请用空格或竖线隔开 格式范例: 123 456 987或213|987|456'
  },
  'wuxing-zhixuan-zuhe': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY),
    betCount: (num: number) => 5 * num,
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.getProfitZuHe.call(this, data, 5)
    }
  },
  'sixing-zhixuan-zuhe': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(1)),
    betCount: (num: number) => 4 * num,
    getProfit: function (data: ProfitParams) {
      return ProfitCalculator.getProfitZuHe.call(this, data, 4)
    }
  },
  'qiansan-zhixuan-zuhe': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2)),
    betCount: (num: number) => 3 * num,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3 })
  },
  'zhongsan-zhixuan-zuhe': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(3)),
    betCount: (num: number) => 3 * num,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3 })
  },
  'housan-zhixuan-zuhe': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(4)),
    betCount: (num: number) => 3 * num,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3 })
  },
  'wuxing-zuxuan-zuxuan120': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 5)
  },
  'sixing-zuxuan-zuxuan24': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 4)
  },
  'erxing-zuxuan-houerfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2)
  },
  'erxing-zuxuan-qianerfushi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2)
  },
  'budingwei-sanxingbudingwei-housanermabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 3: 3 })
  },
  'budingwei-sanxingbudingwei-qiansanermabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 3: 3 })
  },
  'budingwei-sanxingbudingwei-zhongsanermabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 3: 3 })
  },
  'budingwei-sixingbudingwei-sixingermabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 3: 3, 6: 6 })
  },
  'budingwei-wuxingbudingwei-wuxingermabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 2),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 4: 4, 6: 6, 10: 10 })
  },
  'budingwei-wuxingbudingwei-wuxingsanmabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: (num: number) => getPailieByNoLabel(num, 3),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 4: 4, 6: 6, 10: 10 })
  },
  'wuxing-zuxuan-zuxuan60': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['二重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 3)
    }
  },
  'sixing-zuxuan-zuxuan12': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['二重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 2)
    }
  },
  'wuxing-zuxuan-zuxuan30': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['二重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[1].selected, this.betOptions[0].selected, 2)
    }
  },
  'wuxing-zuxuan-zuxuan20': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['三重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 2)
    }
  },
  'sixing-zuxuan-zuxuan4': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['三重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 1)
    }
  },
  'wuxing-zuxuan-zuxuan10': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['三重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 1)
    }
  },
  'wuxing-zuxuan-zuxuan5': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['三重号', '二重号']),
    betCount: function () {
      return getPailieOfErchonghaoDanhao(this.betOptions[0].selected, this.betOptions[1].selected, 1)
    }
  },
  'sixing-zuxuan-zuxuan6': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['四重号', '单号']),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 2)
    }
  },
  'qiansan-zuxuan-zusan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, ['二重号']),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 2) * 2
    }
  },
  'zhongsan-zuxuan-zusan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 2) * 2
    }
  },
  'housan-zuxuan-zusan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 2) * 2
    }
  },
  'qiansan-zuxuan-zuliu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 3)
    }
  },
  'zhongsan-zuxuan-zuliu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 3)
    }
  },
  'housan-zuxuan-zuliu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieOfErchonghaoSingle(this.betOptions[0].selected, 3)
    }
  },
  'qiansan-zhixuan-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 27, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 3, 0)
    },
    isSingleNum: true
  },
  'zhongsan-zhixuan-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 27, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 3, 0)
    },
    isSingleNum: true
  },
  'housan-zhixuan-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 27, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 3, 0)
    },
    isSingleNum: true
  },
  'erxing-zhixuan-houerhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 18, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 2, 0)
    },
    isSingleNum: true
  },
  'erxing-zhixuan-qianerhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 18, false), true),
    betCount: function () {
      return getPailieSumOfHezhi(this.betOptions[0].selected, 2, 0)
    },
    isSingleNum: true
  },
  'qiansan-zuxuan-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(1, 26, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 3)
    },
    isSingleNum: true,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(data.prize[0] * data.amountUnit * data.beishu - data.betAmt, 2))
  },
  'zhongsan-zuxuan-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(1, 26, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 3)
    },
    isSingleNum: true,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(data.prize[0] * data.amountUnit * data.beishu - data.betAmt, 2))
  },
  'housan-zuxuan-hezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(1, 26, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 3)
    },
    isSingleNum: true,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(data.prize[0] * data.amountUnit * data.beishu - data.betAmt, 2))
  },
  'erxing-zuxuan-houerhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(1, 17, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 2)
    },
    isSingleNum: true
  },
  'erxing-zuxuan-qianerhezhi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(1, 17, false), true),
    betCount: function () {
      return getPailieSumOfHezhiNoBaozi(this.betOptions[0].selected, 2)
    },
    isSingleNum: true
  },
  'qiansan-zhixuan-kuadu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieDOfKuadu(this.betOptions[0].selected, 3)
    }
  },
  'zhongsan-zhixuan-kuadu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieDOfKuadu(this.betOptions[0].selected, 3)
    }
  },
  'housan-zhixuan-kuadu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieDOfKuadu(this.betOptions[0].selected, 3)
    }
  },
  'erxing-zhixuan-houerkuadu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieDOfKuadu(this.betOptions[0].selected, 2)
    }
  },
  'erxing-zhixuan-qianerkuadu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    betCount: function () {
      return getPailieDOfKuadu(this.betOptions[0].selected, 2)
    }
  },
  'quwei-teshu-yifanfengshun': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 })
  },
  'quwei-teshu-haoshichengshuang': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2 })
  },
  'quwei-teshu-sanxingbaoxi': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true)
  },
  'quwei-teshu-sijifacai': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true)
  },
  'budingwei-sanxingbudingwei-housanyimabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3 })
  },
  'budingwei-sanxingbudingwei-qiansanyimabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3 })
  },
  'budingwei-sanxingbudingwei-zhongsanyimabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3 })
  },
  'budingwei-sixingbudingwei-sixingyimabudingwei': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true),
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeA(data, { 1: 1, 2: 2, 3: 3, 4: 4 })
  },
  'qiansan-zuxuan-baodan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false)),
    betCount: (num: number) => num * 54,
    limit: 1
  },
  'zhongsan-zuxuan-baodan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false)),
    betCount: (num: number) => num * 54,
    limit: 1
  },
  'housan-zuxuan-baodan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false)),
    betCount: (num: number) => num * 54,
    limit: 1
  },
  'erxing-zuxuan-houerbaodan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false)),
    betCount: (num: number) => num * 9,
    limit: 1
  },
  'erxing-zuxuan-qianerbaodan': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false)),
    betCount: (num: number) => num * 9,
    limit: 1
  },
  'qiansan-qita-hezhiweishu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true)
  },
  'zhongsan-qita-hezhiweishu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true)
  },
  'housan-qita-hezhiweishu': {
    betOptions: OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true)
  },
  'qiansan-qita-teshuhaoma': {
    betOptions: OptionsGenerator.generatBetOptions(['豹子', '顺子', '对子']),
    encode: BaoZiShunZiDuiZiEncode,
    decode: BaoZiShunZiDuiZiDecode,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(7.21 * data.amountUnit * data.beishu - data.betAmt, 2))
  },
  'zhongsan-qita-teshuhaoma': {
    betOptions: OptionsGenerator.generatBetOptions(['豹子', '顺子', '对子']),
    encode: BaoZiShunZiDuiZiEncode,
    decode: BaoZiShunZiDuiZiDecode,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(7.21 * data.amountUnit * data.beishu - data.betAmt, 2))
  },
  'housan-qita-teshuhaoma': {
    betOptions: OptionsGenerator.generatBetOptions(['豹子', '顺子', '对子']),
    encode: BaoZiShunZiDuiZiEncode,
    decode: BaoZiShunZiDuiZiDecode,
    getProfit: (data: ProfitParams) => ProfitCalculator.profitTypeE(data, Util.toFixed(7.21 * data.amountUnit * data.beishu - data.betAmt, 2))
  },
  'hezhi-wuxing-bsde': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_DAN_XHUANG_ARRAY),
    encode: DaXiaoDanShuangEncode,
    decode: DaXiaoDanShuangDecode
  },
  'daxiaodanshuang-daxiaodanshuang-houerdaxiaodanshuang': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_DAN_XHUANG_ARRAY, false, DIGIT_ARRAY.slice(3)),
    encode: DaXiaoDanShuangEncode,
    decode: DaXiaoDanShuangDecode
  },
  'daxiaodanshuang-daxiaodanshuang-housandaxiaodanshuang': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_DAN_XHUANG_ARRAY, false, DIGIT_ARRAY.slice(2)),
    encode: DaXiaoDanShuangEncode,
    decode: DaXiaoDanShuangDecode
  },
  'daxiaodanshuang-daxiaodanshuang-qianerdaxiaodanshuang': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_DAN_XHUANG_ARRAY, false, DIGIT_ARRAY.slice(0, 2)),
    encode: DaXiaoDanShuangEncode,
    decode: DaXiaoDanShuangDecode
  },
  'daxiaodanshuang-daxiaodanshuang-qiansandaxiaodanshuang': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_DAN_XHUANG_ARRAY, false, DIGIT_ARRAY.slice(0, 3)),
    encode: DaXiaoDanShuangEncode,
    decode: DaXiaoDanShuangDecode
  },
  'daxiaodanshuang-daxiaodanshuang-zhongsandaxiaodanshuang': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_DAN_XHUANG_ARRAY, false, DIGIT_ARRAY.slice(1, 4)),
    encode: DaXiaoDanShuangEncode,
    decode: DaXiaoDanShuangDecode
  },
  'quwei-quwei-wumaquweisanxing': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_ARRAY, true, DIGIT_ARRAY.slice(0, 2)).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof DaXiao, index: number) => (index < 1 ? DaXiao[key] : key),
    decode: (key: number, index: number) => (index < 1 ? DaXiao[key] : key)
  },
  'quwei-quwei-simaquweisanxing': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_ARRAY, true, DIGIT_ARRAY.slice(1, 2)).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof DaXiao, index: number) => (index < 1 ? DaXiao[key] : key),
    decode: (key: number, index: number) => (index < 1 ? DaXiao[key] : key)
  },
  'quwei-quwei-housanquweierxing': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_ARRAY, true, DIGIT_ARRAY.slice(2, 3)).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof DaXiao, index: number) => (index < 1 ? DaXiao[key] : key),
    decode: (key: number, index: number) => (index < 1 ? DaXiao[key] : key)
  },
  'quwei-quwei-qiansanquweierxing': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_ARRAY, true, DIGIT_ARRAY.slice(0, 1)).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof DaXiao, index: number) => (index < 1 ? DaXiao[key] : key),
    decode: (key: number, index: number) => (index < 1 ? DaXiao[key] : key)
  },
  'quwei-quwei-zhongsanquweierxing': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_ARRAY, true, DIGIT_ARRAY.slice(1, 2)).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof DaXiao, index: number) => (index < 1 ? DaXiao[key] : key),
    decode: (key: number, index: number) => (index < 1 ? DaXiao[key] : key)
  },
  'quwei-qujian-wumaqujiansanxing': {
    betOptions: OptionsGenerator.generatBetOptions(DA_XIAO_ARRAY, true, DIGIT_ARRAY.slice(0, 2)).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof QuJian, index: number) => (index < 2 ? QuJian[key] : key),
    decode: (key: number, index: number) => (index < 2 ? QuJian[key] : key)
  },
  'quwei-qujian-simaqujiansanxing': {
    betOptions: OptionsGenerator.generatBetOptions(QUJIAN_ARRAY, true, ['千位']).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2))
    ),
    encode: (key: keyof typeof QuJian, index: number) => (index < 1 ? QuJian[key] : key),
    decode: (key: number, index: number) => (index < 1 ? QuJian[key] : key)
  },
  'quwei-qujian-housanqujianerxing': {
    betOptions: OptionsGenerator.generatBetOptions(QUJIAN_ARRAY, true, ['百位']).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(3))
    ),
    encode: (key: keyof typeof QuJian, index: number) => (index < 1 ? QuJian[key] : key),
    decode: (key: number, index: number) => (index < 1 ? QuJian[key] : key)
  },
  'quwei-qujian-qiansanqujianerxing': {
    betOptions: OptionsGenerator.generatBetOptions(QUJIAN_ARRAY, true, ['万位']).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(1, 3))
    ),
    encode: (key: keyof typeof QuJian, index: number) => (index < 1 ? QuJian[key] : key),
    decode: (key: number, index: number) => (index < 1 ? QuJian[key] : key)
  },
  'quwei-qujian-zhongsanqujianerxing': {
    betOptions: OptionsGenerator.generatBetOptions(QUJIAN_ARRAY, true, ['千位']).concat(
      OptionsGenerator.generatBetOptions(OptionsGenerator.generatButtonNumbers(0, 9, false), true, DIGIT_ARRAY.slice(2, 4))
    ),
    encode: (key: keyof typeof QuJian, index: number) => (index < 1 ? QuJian[key] : key),
    decode: (key: number, index: number) => (index < 1 ? QuJian[key] : key)
  },
  'longhu-longhuhe-wanqian': generatLongHuHeRule('万:千'),
  'longhu-longhuhe-wanbai': generatLongHuHeRule('万:百'),
  'longhu-longhuhe-wanshi': generatLongHuHeRule('万:十'),
  'longhu-longhuhe-wange': generatLongHuHeRule('万:个'),
  'longhu-longhuhe-qianbai': generatLongHuHeRule('千:百'),
  'longhu-longhuhe-qianshi': generatLongHuHeRule('千:十'),
  'longhu-longhuhe-qiange': generatLongHuHeRule('千:个'),
  'longhu-longhuhe-baishi': generatLongHuHeRule('百:十'),
  'longhu-longhuhe-baige': generatLongHuHeRule('百:个'),
  'longhu-longhuhe-shige': generatLongHuHeRule('十:个')
}
