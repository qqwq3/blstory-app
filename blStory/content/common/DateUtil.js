
// 时间戳转换为标准时间格式 - 简单封装

class DateUtil{
    /**
     * 例如:2017-12-08 10:48:46转成date类,
     * 可把- replace成/
     * @param dateString
     * @return Date
     */
    static parserDateString(dateString){
        if(dateString){
            let regEx = new RegExp('\\-','gi'),
                validDateStr = dateString.replace(regEx,"/"),
                milliseconds=Date.parse(validDateStr);
            return new Date(milliseconds);
        }
    }
    // timestamp时间戳 formater时间格式
    static formatDate(timestamp, formater) {
        let date = new Date();
        date.setTime(parseInt(timestamp));
        formater = (formater !== null)? formater : 'yyyy-MM-dd hh:mm';
        Date.prototype.Format = function (fmt) {
            let o = {
                "M+": this.getMonth() + 1,                   //月
                "d+": this.getDate(),                        //日
                "h+": this.getHours(),                       //小时
                "m+": this.getMinutes(),                     //分
                "s+": this.getSeconds(),                     //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds()                  //毫秒
            };

            if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

            for (let k in o) {
                if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1,(RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
            return fmt;
        };
        return date.Format(formater);
    }
}

export default DateUtil;

// 用法如下：
// 可将 - 替换成 / 或者 年月日等
// DateUtil.formatDate(时间戳, "yyyy-MM-dd hh:mm:ss")














