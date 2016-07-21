/*
* 入口
*/

$(document).ready(function(){

    productId = common.getParam("productId") || "64106";
    //页面渲染
    pageRenderView();
    //url中的amount
    amount = buyMoneyOperator.getAmount();
    //url中有amount值，触发点击事件
    if(amount){
      buyMoneyOperator.setAmount(amount);
      $('a.buyBtn').trigger('click');
    }
})
var productId ='',
amount,
yuanObj={};
/*
  通用方法区域
*/
//bind方法
if (!function() {}.bind) {
    Function.prototype.bind = function(context) {
        var self = this
            , args = Array.prototype.slice.call(arguments);

        return function() {
            return self.apply(context, args.slice(1));
        }
    };
}
//公用外部迭代器
var It = function(obj,index){
  this.obj = obj;
  this.index = index;
}
It.prototype.next = function(){
  if(this.index < this.obj.length){
    this.index ++;
  }else{
    this.index = 0;//从头开始
  }
  return this.obj[this.index] || '';
}
It.prototype.getItem = function(index){
  return obj[index] || '';
}
It.prototype.isDone = function(index){
  if(index >= this.index) return true;
  else return false;
}
//公用的发布订阅模式分发器
var observer = {
  msg:[],
  listen:function(key,fn){
    if(!this.msg[key]){
      this.msg[key] = [];
    }
    this.msg[key].push(fn);
  },
  trigger : function(){
    var key = Array.prototype.slice.call(argument);
    var fns = this.msg[key];
    if(!fns || fns.length == 0){
      return false;
    }
    for(var i=0,l=fns.length;i<l;i++){
      fns[i].apply(argument);
    }
  },
  cancel:function(key,fn){
    var fns = this.msg[key];
    if(!fns || fns.length<0){return false;}
    if(!fn){
      fns.length = 0;
    }
    for(var l=fns.length;l>=0;l--){
      if(fns[l] == fn){
        fns[l].splice(1,1);
      }
    }
  }
}
var installObserver = function(obj){
  for(var x in obj){
    obj[x] = observer[x];
  }
}

/*
  ajax 请求处理
*/
var services = function(opt){
    opt = opt || {
      type: 'GET',
      url: "http://www.pingan.com",
      dataType:"json",
      cache:false,
      data:{},
      timeout: 50000
    };
    return $.ajax(opt);
};
/**
  route 中间件: 第一层json处理
*/
function codeTree(funcs){ //funcs{000000:function(){},900002:function(){},other}
  var ok_code = '000000',
      noLogin_code ='900002',
      noProductId = '901001',
      noFiveInfor ='903007',//五项信息不全
      noID ='903008',//证件不是身份证
      noAccount ='903009',//主账户不存在
      other_code = 'other';
  var codeTree ={};
  codeTree[ok_code] = funcs[ok_code] || function(){};
  codeTree[noLogin_code] = funcs[noLogin_code] || function(json){common.loginPop();};//common.alert(json.responseMessage || "请重新登陆页面."); };
  codeTree[noProductId] = funcs[noProductId] || function(json){common.alert( json.responseMessage || "指定的条件记录不存在.");};
  codeTree[other_code] = funcs[other_code] || function(json){common.alert( json.responseMessage || "系统繁忙，请稍后再试。");};
  codeTree[noFiveInfor] = funcs[noFiveInfor] || function(){common.alert(json.responseMessage || "五项信息不全");};
  codeTree[noID] = funcs[noID] || function(){common.alert(json.responseMessage || "证件号码不是身份证");};
  codeTree[noAccount] = funcs[noAccount] || function(){common.alert(json.responseMessage || "主账户不存在");};
  return codeTree;
}
/*
  ajax控制器中间件
*/
function ajaxMidware(servicesFn,serviceOpt){//注入service ajax的调用函数
      //serviceFn返回promise
  var ajaxCall = servicesFn(serviceOpt);

  //注入业务处理函数，ajax成功失败回调函数，一般只负责sucess
  return function(codeTree){//注入成功回调函数及其需要的参数[{code:function(){}.bind(params)},{unlogin:function(){}.bind(params)},{error}]
    var invoke = {};
    ajaxCall.then(function(json){
      if(json.responseCode){
        if(codeTree[json.responseCode]){
          codeTree[json.responseCode](json);
        }else{
          codeTree['other'](json);
        }
      }
    },function(json){//失败函数
      codeTree['other'](json);//暂时执行Other里面的内容
    });
  }
}
/**
  各种业务控制器
**/
//页面渲染
var pageRenderController = function(opt,successFn){
 ajaxMidware(services,opt)(successFn);
};

//登陆流程封装
var loginedController = function(){
  checkAmountController();
};
var checkAmountController = function(){
  //校验输入额度是否符合规则
  if(!buyNowView.checkAmountValid()) return false;
  //校验剩余额度
  var codeTreeObj = codeTree(buyNowView.checkAmountFns());
  ajaxMidware(services,buyNowView.checkAmountOpt())(codeTreeObj);
};
var accountIsExitController = function(){
  //主账户是否存在
  var codeTreeAccount = codeTree(buyNowView.accountIsExitFn());
  ajaxMidware(services,buyNowView.accountIsExitOpt())(codeTreeAccount);

};
var createOrderController = function(){
  //生成订单
  var codeTreeOrder = codeTree(buyNowView.createOrderFn());
  ajaxMidware(services,buyNowView.createOrderOpt())(codeTreeOrder);
}

//未登陆流程封装
var isloginedController = function(){
 //判断是否输入购买额度，校验是否是数字
 //将额度保存到url中
 //弹框
 services(buyNowView.memberAliasOpt())
 .then(buyNowView.memberAliasFn().success,buyNowView.memberAliasFn().fail);
};

//view层
var buyNowView = {
  //是否登录
  memberAliasOpt: function(){
    return opt = {
      type : 'GET',
      url : url_config.memberAlias,
      dataType : "jsonp",
      cache : false,
      data : {},
      timeout: 50000
    };
  },
  memberAliasFn : function(){
    return {
      success:function(json){
        if(!json.isLoginEmall) {
           //额度保存,弹框登录
           common.loginPop(buyNowView.addUrlPara('amount',$('#buyMoney').attr('data-value')));
           return false;
         } else{
            //执行已登录流程
            loginedController();
         }
      },
      fail : function(e){
        common.alert("网络繁忙，请稍候再试");
      }
    }
  },
  payAmount :0,
  //订单生成
  createOrderOpt : function(){
    var data={
        productCode:detail_obj.productCode,
        payAmount:parseInt(buyNowView.payAmount),
        productId:detail_obj.productId,
        productName:detail_obj.productName,
        source:getParam("source") || 'Fmall',
        activity:getParam('activity')   || 'Fmall'
    };
    return opt = {
        url:url_config.createOrder,
        dataType:"jsonp",
        cache:false,
        data:data
    };
  },
  createOrderFn : function(){
    return {
      '000000':function(json){
            window.location.href = url_config.order_ensure+"&orderNo="+json.responseData.orderNo;
      },
      '900002':function(json){
        $('a.buyBtn').addClass('canClick');
        common.alert("请重新登陆");
      },
      'other':function(){
        $('a.buyBtn').addClass('canClick');
        common.alert("网络繁忙，请稍候再试");
      }
    }
  },
  //主账户是否存在
  accountIsExitOpt:function(){
    return opt = {
      type : 'GET',
      url : url_config.isAccountExist,
      dataType : "jsonp",
      cache : false,
      data : {'format':'json','from':'pc'},
      timeout: 50000
    };
  },
  accountIsExitFn:function(){
    return {
      '000000':function(json){
        if(!(json && json.responseData)){
          $('a.buyBtn').addClass('canClick');
          common.alert('主账号状态异常');
          return false;
        }
        var responseData = json.responseData;
        if(responseData.isExist == '0' ){

              window.location.href = url_config.infor+"&productId="+productId+'&amount='+buyNowView.payAmount;

        }else if(responseData.isExist == '1' && responseData.status == '01'){

          createOrderController();

        }else if(responseData.isExist == '1' && responseData.status == '00'){

          window.location.href = url_config.infor+"&productId="+productId+'&amount='+buyNowView.payAmount;

        }else{
          $('a.buyBtn').addClass('canClick');
          common.alert('主账号状态异常');

        }
      },
      '903007':function(){//五项信息补全/证件类型不是身份证/主账户不存在
         window.location.href = url_config.infor+"&productId="+productId+'&amount='+buyNowView.payAmount;
      },
      '903008' : function () {
         window.location.href = url_config.infor+"&productId="+productId+'&amount='+buyNowView.payAmount;
      },
      '903009':function () {
         window.location.href = url_config.infor+"&productId="+productId+'&amount='+buyNowView.payAmount;
      },
      'other':function () {
        $('a.buyBtn').addClass('canClick');
        common.alert(response.responseMessage || "系统繁忙，请稍后再试");
      }
    }
  },
  addUrlPara : function(name, value) {
    if(!value) return false;
      var currentUrl = window.location.href.split('#')[0];
      if (/\?/g.test(currentUrl)) {
          if (/name=[-\w]{4,25}/g.test(currentUrl)) {
              currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
          } else {
              currentUrl += "&" + name + "=" + value;
          }
      } else {
          currentUrl += "?" + name + "=" + value;
      }
      if (window.location.href.split('#')[1]) {
          return currentUrl + '#' + window.location.href.split('#')[1];
      } else {
          return currentUrl;
      }
  },
  checkAmountValid : function(){
    var _amount = $("#buyMoney").attr('data-value');
    if(!_amount){
      common.alert("请输入正确的购买金额");
      return false;
    }
    //校验amount是否合法，然后放入val中
    if(buyMoneyOperator.validateRules.isNotEmpty({'val':_amount})
      && buyMoneyOperator.validateRules.isNumber({'val':_amount})){
         buyNowView.payAmount = _amount;
         return true;
     }else{
       common.alert("请输入正确的购买金额");
       return false;
     }
  },
  checkAmountOpt :function(){
    return {
     url:url_config.product_validate,
     dataType:"jsonp",
     cache:false,
     data:{format:'json',productId:productId}
   }
  },
  checkAmountFns:function(){
    return {
      '000000':function(json){
          var left = json.responseData.residueQuota;
          var validateObj = {
            val : buyNowView.payAmount,
            max : left*10000,
            min : detail_obj.investmentAmount,
            uplimit : detail_obj.upperLimitAmount || 50,
            increase : detail_obj.increaseAmount
          };
          buyMoneyOperator.buyAmountValidate (validateObj) && detail_obj.isOff == '4'?
          (function(){
            $("a.buyBtn").removeClass("ts_orange_btn").addClass("orange_btn");
            $("p.errorMsg").hide();
            //查看主账户是否存在
            accountIsExitController();
          })()
          :
          (function(){
            $("p.errorMsg").show();
            $('a.buyBtn').addClass('canClick')
          })()
      }
    }
  }
}
//页面渲染view层
var pageRenderView = function(){
  //调用detail接口
   var opt = {
     type : 'GET',
     url : url_config.product_detail,
     dataType : "jsonp",
     cache : false,
     data : {format:'json',productId:productId},
     timeout: 50000
   };
   var successFn = function(json){
     detail_obj = json.responseData || {};
     var render = new pageRender(detail_obj);
     render.renderElm() &&//页面数据赋值
     render.yuanObjFn() &&//返回数据处理
     render.cuxiaoHTML() &&//活动规 则、促销文案等
     render.titleRender() &&//页面数据赋值
     render.amountRender() &&//页面数据赋值
     render.timeLineRender() &&//计算时间轴
     render.docRender() &&//相关文档赋值
     render.btnRender(detail_obj.isOff) &&
     render.eventBind();
   }
   pageRenderController(opt,codeTree({'000000':successFn.bind(this)}));
};

/*
  页面处理
*/
var pageRender = function(detail_obj){
   this.detail_obj = detail_obj;
   this.yuanObj = {};
};
pageRender.timeLineUtil = {
   toDate:function	(dateStr){
      return new Date(dateStr);
    },
    getDate:function(dates,addDay){
      if(Object.prototype.toString.call(this,dates) != '[object Date]') dates = new Date(dates);
      var day = dates.valueOf() + addDay*24*60*60*1000;
      return new Date(day);
    },
    getDatearray:function(){
      var dateArray =[];
      dateArray.push(pageRender.timeLineUtil.toDate($('.dateCollectStart').html()));
      dateArray.push(pageRender.timeLineUtil.toDate($('.dateCollectEnd').html()));
      dateArray.push(pageRender.timeLineUtil.toDate($('.dateIncomeStart').html()));
      dateArray.push(pageRender.timeLineUtil.toDate($('.dateIncomeEnd').html()));
      dateArray.push(pageRender.timeLineUtil.getDate($('.dateIncomeEnd').html(),5));
      return dateArray;
    },
    //datas in array are formatted to Date
    getArea:function(){
      dateArray = pageRender.timeLineUtil.getDatearray()  || [];
      dateArray = dateArray.sort(function(a,b){
        return a>b;
      });
      var now = new Date();
      if(now<dateArray[0]){return 1;}
      else if(dateArray[0]<now && now<dateArray[1]) {return 2;}
      else if(dateArray[1]<now && now<dateArray[2]) {return 3;}
      else if(dateArray[2]<now && now<dateArray[3]) {return 4;}
      else if(dateArray[3]<now && now<dateArray[4]) {return 5;}
      else{return 6;}
    },
    setWidth:function(){
      var seat = pageRender.timeLineUtil.getArea();
      switch(seat){
        case 1:
          $("span.status3").width(0);
          break;
        case 2:
          $("span.status3").width(190);
          break;
        case 3:
          $("span.status3").width(340);
          break;
        case 4:
          $("span.status3").width(430);
          break;
        case 5:
          $("span.status3").width(755);
          break;
        default:
          $("span.status3").width(855);
          break;
      }
    }
};
pageRender.prototype = {
  constructor : this,
  renderElm : function(){
    var self = this,detail_obj= self.detail_obj;
    for(var i in detail_obj){
        $('.'+i).val(  detail_obj[i])  ;
        $('.'+i).html( detail_obj[i]) ;
    }
    return true;
  },
  yuanObjFn : function(){
    var self = this,detail_obj= self.detail_obj;
    return yuanObj = {
        rate:detail_obj.incomeRate,//rate
        productIntroduce:detail_obj.productIntroduce,//productIntroduce
        incomeInstruction:detail_obj.incomeInstruction,//incomeInstruction
        bVal:'1',//current
        minVal:(detail_obj.investmentAmount || 5)*10000+"",//min
        maxVal:(detail_obj.upperLimitAmount || 50)*10000+"",//max
        increment:(detail_obj.increaseAmount || 1)*10000+"",//step
        productLimit:detail_obj.period//days

    }
  },
  cuxiaoHTML : function(){
    var self = this,obj= self.yuanObj;
    var html = "";
        html +="<span class='cu_icon' ";
        html += obj.incomeInstruction ? "style='display:block;'>" : "style='display:none;'>";
        html += "<i></i>" + obj.incomeInstruction
              +"</span>"
              +"<a href='#product_detail' class='productIntroduce' ";
        html += obj.productIntroduce ? "style='display:block;'>" : "style='display:none;'>";
        html +="了解详情&gt;</a>";

        $(".cu_ljxq").html(html);
        return true;
  },
  titleRender : function(){
    var self = this,detail_obj= self.detail_obj;
    //render title
        document.title = detail_obj.productName+"-中国平安-金融旗舰店";
        $("meta[name='description']").attr("content", detail_obj.productName+"，理财产品，平安金融旗舰店");
        $("meta[name='keywords']").attr("content", detail_obj.productName+"，理财产品，活期高收益，平安，金融旗舰店");
        $('.dateCollectStart_long').html(detail_obj.dateCollectStart);
        $('.dateCollectEnd_long').html(detail_obj.dateCollectEnd);
        //buy button add otitle
         $("a.buyBtn").attr("otitle","产品详情-金融旗舰店-"+ detail_obj.productName || ''+"-立即购买");
        //rate add %
        $('.incomeRate').html(detail_obj.incomeRate);
        return true;
  },
  amountRender : function(){//render buyAmount
    var self = this,detail_obj= self.detail_obj;
    $("#buyMoney").val(detail_obj.investmentAmount+"万元起");
    return true;
  },
  timeLineRender : function(){
    function changeData(elm){
          var val = elm.html();
          elm.html(dateParser(val));
      }
      function dateParser(str){
          str = str || "";
          return str.substring(0,10);
      }
    //date parser
        changeData($('.dateCollectStart'));
        changeData($('.dateCollectEnd'));
        //changeData($('.dateCollectStart'));
        changeData($('.dateIncomeStart'));
        changeData($('.dateIncomeEnd'));
        var timeLineUtil = pageRender.timeLineUtil;
        timeLineUtil.setWidth();
        return true;
  },
  docRender : function(){
    detail_obj = this.detail_obj;
    var docMap = detail_obj.attachmentMap;
        var i=0;
        var docArray ={
            notice:'产品开放申购公告',
            instructions:'产品说明书',
            agreement:'产品合同文本',
            riskTip:'产品投资风险提示函',
            statement:'产品委托人声明'
        };
        var str ="";
        for(var x in docMap){
            i++;
            str +=
                '<p>'+i+
                '. <a target="_blank" class="referDoc" href="'+docMap[x]+
                '" title="'+detail_obj.productName+''+docArray[x]+'">'+detail_obj.productName+''+docArray[x]+'</a></p>';
        }
        $(".docList").html(str);
        return true;
  },
  btnRender : function(isoff){
     //5.17 如果可用额度为0或者小于最小购买额度时，在按钮下方展示“您还有机会，其他买家还有一些未支付的订单，15分钟将可能被释放，您可以稍后刷新页面抢购剩余份额。”按钮文案为“售罄”，状态禁用；
  // 当产品状态为“禁用”时不展示此内容。
  // 另外，现在配置的产品默认会展示促销文案，要把这段内容删掉。
      function buyNow(){
        var residueQuota = detail_obj.residueQuota;
        // for test
        //var residueQuota = 0.1;
        var investmentAmount = detail_obj.investmentAmount  ;
        if(residueQuota == 0 || residueQuota < investmentAmount){
           $("a.buyBtn").html("售罄").addClass("ts_orange_btn");
           $('.15leftMsg').show();
           return ;
        }
        $("a.buyBtn").html("立即购买").addClass("orange_btn").addClass("canClick");
        //$(".errorMsg").html("尊敬的用户： 您好，因一账通5月20日晚23点至5月21日凌晨6点进行系统维护，届时可能对您购买金融理财产品造成影响，请尽量避开此时间段进行购买，谢谢。");
      }
    //buy button
        switch(isoff){
            case '2':
                $("a.buyBtn").html("已售罄").addClass("ts_orange_btn");
                break;
            case '3':
               $("a.buyBtn").html("立即购买").addClass("ts_orange_btn");
                $(".tobeSold").show();
                break;
            case '4':
               buyNow();
                break;
            default:
                $("a.buyBtn").html("已售罄").addClass("ts_orange_btn");
                break;
        }
        return true;
  },
  eventBind:function(){
    //需要执行的方法
    buyBtnClick();
    //绑定购买金额Input框
    var buyMoney = new buyMoneyOperator("buyMoney");
    buyMoney.bindEvent();
    //buyBtn click
    function buyBtnClick(){
      $("a.buyBtn").click(function(){
          if($(this).hasClass('canClick')){
             //$(this).removeClass('canClick');
             if(detail_obj.isOff == '4') {
               isloginedController($('#buyMoney').attr('data-value'));
              }
          }
      })
    }
  }
}
// 输入额度的校验等操作
function buyMoneyOperator(elm){
  this.$input = $("#"+elm);
}
//静态方法，用来做校验
buyMoneyOperator.validateRules = {
  //不能为空
  isNotEmpty:function(obj){
    var val = obj.val || "";
    val = val.replace(/\,/g,'');
    if(!val){
      showErrorMsg(obj.errorMsg || "请输入购买金额");
      return false;
    }
    return true;
  },
  //必须是数字
  isNumber:function(obj){
    var reg = new RegExp("^[0-9]*$"),
    val = obj.val || "",
    val = val.replace(/\,/g,'');
    if(!reg.test(val)){
      showErrorMsg(obj.errorMsg || "购买金额请输入数字");
      return false;
    }
    return true;
  },
  //小于等于剩余额度
  lessRest : function(obj){
    var val = obj.val || "",
    val = val.replace(/\,/g,''),
    left = obj.max || 0;
    if(parseInt(left)*10000  > val || parseInt(left)*10000  == val){}else{
       showErrorMsg("剩余额度"+left+"万元");
        return false;
    }
    return true;
  },
  //大于等于起购金额
  moreInvest:function(obj){
    var val = obj.val || "",
    val = val.replace(/\,/g,''),
    investAmount = obj.min || 0;
    if(parseInt(investAmount)*10000 > parseInt(val)){
            showErrorMsg("起购金额"+investAmount+"万元");
            return false;
        }
    return true;
  },
  //小于等于单次购买上限
  lessUplimit : function(obj){
    var val = obj.val || "",
    val = val.replace(/\,/g,''),
    uplimit = obj.uplimit || 0;
    if(val>parseInt(uplimit)*10000 ){
            showErrorMsg("单次购买额度不能超过"+uplimit+"万元");
            return false;
        }
    return true;
  },
  //递增金额的数倍
  multipleIncrease : function(obj){
    var val = obj.val || "",
    val = val.replace(/\,/g,''),
    increase = obj.increase || 0;
    if(parseInt(val)  % (parseInt(increase)*10000) === 0 ){}else{
            showErrorMsg("请输入"+increase+"万元的倍数，然后购买");
            return false;
        }
    return true;
  }
};
/*
* to validate buy amount input value
* amountObj ={
val : buy amount input
max : all the amount could be bought
min : the minist purchase amount
uplimit : the max amount could be bought one time
increase : should be multiple of the increase
}
* errorMsg : if not meet the rules print message
* callback : the delegate callback
*/
buyMoneyOperator.buyAmountValidate = function(amountObj,errorMsg){
  amountObj = amountObj ||{};
  var result = true;
  if(amountObj && amountObj.length == 0){
    return false;
  }
  for(var x in buyMoneyOperator.validateRules){
    if(typeof(buyMoneyOperator.validateRules[x])  === 'function'){
      result = result && buyMoneyOperator.validateRules[x](amountObj);
      if(!result){
        break;
      }
    }
  }
  return result;
}
var showErrorMsg = buyMoneyOperator.showErrorMsg =  function(errorMsg){
 $("p.errorMsg").html(errorMsg);
}
buyMoneyOperator.setAmount = function(amount){
   var val=amount ,strArr=[],wei=1,newStr;
    var str=val.replace(/,/g,"");
   $('#buyMoney').attr("data-value",str);
    var len=str.length;
    for(var i=len-1;i>=0;i--){
        strArr.unshift(str.charAt(i));
        if(wei%3===0&&wei<len){
            strArr.unshift(",");
        }
        wei++;
    }
    newStr=strArr.join("");
  $('#buyMoney').val(newStr);
}
buyMoneyOperator.getAmount = function(){
  return common.getParam('amount') || '';
}
//作用域方法，绑定事件
buyMoneyOperator.prototype = {
  constructor : buyMoneyOperator,
  //while doing input listen if the input value is legal
  bindEvent : function(){
      this.$input.keyup(function(e){
          var val=$(this).val(),strArr=[],wei=1,newStr;
          var str=val.replace(/,/g,"");
          $(this).attr("data-value",str);
          var len=str.length;
          for(var i=len-1;i>=0;i--){
              strArr.unshift(str.charAt(i));
              if(wei%3===0&&wei<len){
                  strArr.unshift(",");
              }
              wei++;
          }
          newStr=strArr.join("");
          $(this).val(newStr);
      }).blur(function(){
          var v=$(this).val();
          $(this).val(v.replace(/^0(0*,?0*)*/,""));
          //validate
          if(!v){return ;}

      }).keydown(function(e) {
          var codeArr=[48,49,50,51,52,53,54,55,56,57,8,13,46,96,97,98,99,100,101,102,103,104,105],len=codeArr.length,flag=false;
          var code=e.which;
          for(var i=0;i<len;i++){
              if(code===codeArr[i]){
                  flag=true;
                  break;
              }
          }
          if(!flag){
              e.preventDefault();
              return false;
          }
      }).focus(function(e){
          var val=$(this).val();
          if(val.indexOf('万元起') > -1){$(this).val("");}
      });
   }
};

//公共方法的操作
var common={
    prefix:"",
    star:function($obj){
        var $inner=$obj.find(".starInner").eq(0);
        var score=parseInt($inner.html());
        var wid=29;
        $inner.width(score*wid);
    },
    tab:function(id){
        var $contents=$("#"+id+" .fTabContent .fContent");
        $("#"+id+" .fTabTitle").delegate("li","click",function(e){
            e.preventDefault();
            $(this).addClass("fTabChecked").siblings().removeAttr("class");
            var $cont=$contents.eq($(this).index());
            $cont.show().siblings().hide();
        });
    },
    alert:function(content,callback,btnText){
        var obj=this.popup("alert",1).init();
        $("#alertMain").html(content+'<center><a href="javascript:;" class="btn_alert">'+(btnText||"确&nbsp;定")+'</a></center>');
        $("#alertMain .btn_alert").unbind("click").bind("click",function(e){
            e.preventDefault();
            obj.close();
            if(callback) {
              callback();
            }
        });
        obj.open();
    },
    prompt:function(id){
        var obj=this.popup(id,2).init();
        return {
            open:obj.open,
            close:obj.close
        }
    },
    confirm:function(content,okFunc,cancelFunc){
        var obj=this.popup("confirm",4).init();
        $("#confirmMain").html(content+'<div class="btns_confirm"><a href="javascript:;" class="btn_ok">确&nbsp;定</a><a href="javascript:;" class="btn_cancel">取&nbsp;消</a></div>');
        obj.open();
        $("#confirm .btn_ok").unbind("click").bind("click",function(){
            if(okFunc){
                okFunc();
            }
            obj.close();
        });
        $("#confirm .btn_cancel").unbind("click").bind("click",function(){
            if(cancelFunc){
                cancelFunc();
            }
            obj.close();
        });
        return  obj;
    },
    popup:function(id,type){
        var temp_pop=document.getElementById(id);
        if(temp_pop||id=="alert"||id=="loading"||id=="confirm"){
            if(temp_pop){
                $(temp_pop).hide();
            }
            var str="";
            var $o_main=$(".fpopup#"+id+"_pop");
            var o_main=$o_main.get(0);
            if(!o_main){
                if(type&&type==1){//alert
                    var strDiv='<div id="alert" class="alert"><h4>提示</h4><div class="alertMain" id="alertMain"></div></div>';
                    str='<div class="fpopup" id="'+id+'_pop"><div class="ffMask"></div><div class="fMain"><a href="javascript:;" class="popClose">×</a>'+strDiv+'</div></div>';
                }else if(type&&type==2){//prompt
                    var className=$("#"+id).get(0).className;
                    var str1=$("#"+id).remove().html();
                    str='<div class="fpopup" id="'+id+'_pop"><div class="ffMask"></div><div class="fMain"><a href="javascript:;" class="popClose">×</a><div id="'+id+'" class="prompt"><h4>提示</h4><div id="'+id+'" class="proMain '+className+'">'+str1+'</div></div></div></div>';
                }else if(type&&type==3){//loading
                    var strDiv='<div id="loading"><span class="loading_icon"></span></div>';
                    str='<div class="fpopup" id="'+id+'_pop"><div class="ffMask"></div><div class="fMain">'+strDiv+'</div></div>';
                }else if(type&&type==4){//confirm
                    var strDiv='<div id="confirm" class="confirm"><h4>提示</h4><div class="confirmMain" id="confirmMain"></div></div>';
                    str='<div class="fpopup" id="'+id+'_pop"><div class="ffMask"></div><div class="fMain"><a href="javascript:;" class="popClose">×</a>'+strDiv+'</div></div>';
                }else{
                    var className=$("#"+id).get(0).className;
                    var str1=$("#"+id).remove().html();
                    str='<div class="fpopup" id="'+id+'_pop"><div class="ffMask"></div><div class="fMain"><a href="javascript:;" class="popClose">×</a><div id="'+id+'" class="content '+className+'">'+str1+'</div></div></div>';
                }
                $("body").eq(0).append(str);
                var $o_main=$(".fpopup#"+id+"_pop");
                var wid=$o_main.width()/2;
                var hei=$o_main.height()/2;
                $o_main.css({'margin-left':-wid+"px",'margin-top':-hei+"px"});
                $(".fpopup#"+id+"_pop .popClose").click(function(){
                    $bg.removeClass("visible");
                    $(this).parent().parent().removeClass("visible");
                });
            }
            var o_bg=document.getElementById("popupBg");
            if(!o_bg){
                str="<div id='popupBg' class='popupBg'></div>";
                $("body").eq(0).append(str);
                o_bg=document.getElementById("popupBg");
            }
            var bHei=$("body").height();
            $(o_bg).height(bHei);
            var $bg=$(o_bg);
            var o_rs={
                id:id,
                obj:$o_main,
                init:function(){
                    /*var o_main=$(".fpopup#"+id+"_pop").get(0);
                    if(!o_main){
                        $("#"+id).hide();
                    }*/
                    return o_rs;
                },
                open:function(){
                    $bg.addClass("visible");
                    o_rs.obj.addClass("visible");
                    o_rs.obj.find("#"+o_rs.id).show();
                },
                close:function(){
                    $bg.removeClass("visible");
                    o_rs.obj.removeClass("visible");
                }
            };
            return o_rs;
        }
    },
    getpos:function(obj){
        var t=obj.offsetTop;
        var l=obj.offsetLeft;
        var height=obj.offsetHeight;
        while(obj=obj.offsetParent){
             t+=obj.offsetTop;
             l+=obj.offsetLeft;
        }
        return {"left":l,"top":t};
    },
    select:function(){
        var _optionHandler=function($obj){
            var $sib=$obj.children();
            var $con=$sib.eq(0);
            var $input=$sib.eq(1);
            var $list=$sib.eq(2);
            $obj.delegate("li","click",function(){
                var val_sel=$.trim($(this).find("a").html());
                $con.html(val_sel);
                $input.val($.trim($(this).attr("ovalue")));
            });
            $con.click(function(e){
                e.stopPropagation();
                if($list.hasClass("block")){
                    $list.removeClass("block");
                }else{
                    $list.addClass("block");
                }
            });
            $(document).click(function(e){
                var target=e.target;
                if(!$(target).hasClass("sel_content")){
                    if($list.hasClass("block")){
                        $list.removeClass("block");
                    }
                }
            });
        }
        $(".select").each(function(){
            _optionHandler($(this));
        });
    },
    qianfen:function(str){
      str=(str+"");
      var arr1=str.split(".");
      var arr=[],len=arr1[0].length,wei=1;

        for(var i=len-1;i>=0;i--){
          arr.unshift(arr1[0].charAt(i));
          if(wei%3==0&&wei<len){
            arr.unshift(",");
          }
          wei++;
        }

      var str1=arr.join("");
      if(arr1[1]){
        str1=str1+"."+arr1[1];
      }else{
        if(str.indexOf(".")>-1){
          str1=str1+".";
        }
      }
      return str1;
    },
    toWan:function(str){
      str=str+"";
      var newStr="";
      var arrStr=str.split("."),len=arrStr[0].length;
      if(len<5){
        if(len<4){

        }else{
          arrStr[0]=common.qianfen(arrStr[0]);
        }

        if(arrStr[1]){
          var xiaoshu=parseFloat("0."+arrStr[1]);
          xiaoshu=Math.round(xiaoshu*100)/100;
          newStr=arrStr[0]+"."+xiaoshu.toString().split("0.")[1];
        }else{
          newStr=arrStr[0];
        }

        return newStr;
      }else{
        var newV=str/10000+"";
        var newArr=newV.split(".");
        if(newArr[0].length<4){
          if(newArr[1]){
            var xiaoshu=parseFloat("0."+newArr[1]);
            xiaoshu=Math.round(xiaoshu*1000000)/1000000;
            newStr=newArr[0]+"."+xiaoshu.toString().split("0.")[1];
          }else{
            newStr=newArr[0];
          }
          return newStr+"万";
        }else{
          var str1=common.qianfen(newArr[0]);
          if(newArr[1]){
            var xiaoshu=parseFloat("0."+newArr[1]);
            xiaoshu=Math.round(xiaoshu*1000000)/1000000;
            newStr=str1+"."+xiaoshu.toString().split("0.")[1]+"万";
          }else{
            newStr=str1+"万";
          }
          return newStr;
        }
      }
    },
    inputQianfen:function(id){
      var $input=$("#"+id);
      $input.keyup(function(e){
          var val=$(this).val(),strArr=[],wei=1,newStr;
          var str=val.replace(/,/g,"");
          $(this).attr("data-value",str);
          newStr=common.qianfen(str);
            $(this).val(newStr);
      }).blur(function(){
          var v=$(this).val();
          $(this).val(v.replace(/^0(0*,?0*)*/,""));
      }).keydown(function(e) {
          var codeArr=[48,49,50,51,52,53,54,55,56,57,8,13,46,190],len=codeArr.length,flag=false;
          var code=e.which;
          for(var i=0;i<len;i++){
              if(code===codeArr[i]){
                  flag=true;
                  break;
              }
          }
          if(!flag){
              e.preventDefault();
              return false;
          }
      });

    },
    loading:function(time,callback){
        var pop=this.popup("loading",3).init();
        pop.open();
        function handler(){
            if(callback){
                callback();
            }
            pop.close();
        }
        if(time){
            setTimeout(handler,time);
        }
        return pop;
    },
    getParam : function(name){
        var search = document.location.search;
        var pattern = new RegExp("[?&]"+name+"\=([^&]+)", "g");
        var matcher = pattern.exec(search);
        var items = null;
        if(null != matcher){
          try{
            items = decodeURIComponent(decodeURIComponent(matcher[1]));
          }catch(e){
            try{
                    items = decodeURIComponent(matcher[1]);
            }catch(e){
                    items = matcher[1];
            }
          }
        }
        return items;
    },
    //弹窗
   loginPop : function(returnUrl){
     returnUrl =  returnUrl || window.location.href;
    loginPop(true,returnUrl);
   }
};

window.common=common;

//response 处理
