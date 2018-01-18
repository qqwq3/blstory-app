
// 阿拉伯数字转为中文书写 - 封装

let _AnicTo = {
    // 数字与中文映射
    ary0:["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
    // 每四位以内的单位
    ary1:["", "十", "百", "千"],
    // 四位以上的单位
    ary2:["", "万", "亿", "兆"],
    init:function (name) {
        this.name = name;
    },
    strrev:function () {
        let  ary = [];
        for (let  i = this.name.length; i >= 0; i--) {
            ary.push(this.name[i]);
        }
        return ary.join("");
    },
    //倒转字符串。
    isUnit: function(ary) {
        let  retVal = false;
        let  cur = ary[0];
        if(this.ary2.indexOf(cur) > 0) {
            retVal = true;
        }
        return retVal;
    },
    // 检查是否时ary2中的单位
    pri_ary:function () {
        let  $this = this;
        // 反转后再逐位处理
        let  ary = this.strrev();
        // 是否读零
        let  zero = "";
        // 缓存结果
        let  newary = "";
        // 万级单位数组索引
        let  i4 = -1;
        for (let  i = 0; i < ary.length; i++) {
            // 首先判断万级单位，每隔四个字符就让万级单位数组索引号递增
            if (i % 4 === 0) {
                i4++;
                // 将万级单位存入该字符的读法中去，它肯定是放在当前字符读法的末尾，所以首先将它叠加入$r中，
                newary = this.ary2[i4] + newary;
                // 在万级单位位置的“0”肯定是不用的读的，所以设置零的读法为空
                zero = "";
            }
            //关于0的处理与判断。
            //如果读出的字符是“0”，执行如下判断这个“0”是否读作“零”
            if (ary[i] === '0') {
                switch (i % 4) {
                    case 0:
                        break;
                    // 如果位置索引能被4整除，表示它所处位置是万级单位位置，
                    // 这个位置的0的读法在前面就已经设置好了，所以这里直接跳过
                    case 1:
                    case 2:
                    case 3:
                        // 如果不被4整除，那么都执行这段判断代码：
                        // 如果它的下一位数字（针对当前字符串来说是上一个字符，因为之前执行了反转）也是0，
                        // 那么跳过，否则读作“零”
                        if (ary[i - 1] !== '0') {
                            zero = "零";
                        }
                        break;
                }

                newary = zero + newary;
                zero = '';
            }
            else {
                // 如果不是“0”，就将该当字符转换成数值型，
                // 并作为数组ary0的索引号，以得到与之对应的中文读法，
                // 其后再跟上它的的一级单位（空、十、百还是千）最后再加上前面已存入的读法内容。
                newary = this.ary0[parseInt(ary[i])] + this.ary1[i % 4] + newary;
            }
        }
        // 用while处理最前面的零和单位（前面没有数字则不需要单位）
        while (newary.indexOf("零") === 0 || this.isUnit(newary)) {
            newary = newary.substr(1);
        }
        return newary;
    }
};

//创建class类
function AnicTo(){
    this.init.apply(this, arguments);
}

AnicTo.prototype = _AnicTo;

export default function ArabicNumeralIntoChinese(numbers){
    let strNumbers = numbers.toString();
    let O = new AnicTo(strNumbers);
    return O.pri_ary();
}

// 用法
// let value = ArabicNumeralIntoChinese(numbers);
// console.log(value);















































