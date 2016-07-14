/**
 * 调用jp接口 和将参数添加到链接后面
 */



var callYZT = {
	// 展示基金金额
	jijinShowMoney : function(id) {
		var secuCode=$("#secuCode").val();
		var fundCode="";
		var money = callYZT.getCookie('mon'); 
		if (money == null || money == '' || money!='null') { 
			money=jijin_money;
		}
		
		if (money != null && money != ''&& money!='null') {
			var monArr=money.split('-');
			if(monArr.length>1){
				fundCode=monArr[monArr.length-2];
				money=monArr[monArr.length-1];
				if(fundCode==secuCode &&　money!=null && money != ''&& money!='null' ){
					$("#" + id ).val(money);
				}
			}
			
		}
	},
	
	
	moneyToNum : function(val){
		var num = val.trim();
		var ss=num.toString();
		if(ss.length==0){
			return "0";
		}
		return ss.replace(/,/g, "");
		
	},
	
	
	getCookie :function(name){
		if(name == 'mon'){
			var fromN=document.cookie.indexOf("mon=")+0;
		    if(fromN!=-1){
		    	fromN+=4;
				var toN=document.cookie.indexOf(";",fromN)+0;
				if(toN==-1){
					toN=document.cookie.length
				}
				return unescape(document.cookie.substring(fromN,toN))
		    	}  
		    
		    }

		if(name == 'ans'){
			var fromN=document.cookie.indexOf("ans=")+0;
		    if(fromN!=-1){
		    	fromN+=4;
				var toN=document.cookie.indexOf(";",fromN)+0;
				if(toN==-1){
					toN=document.cookie.length
				}
				return unescape(document.cookie.substring(fromN,toN))
		    	}  
		}
		return "";
},
	
	setCookie  :function (){
		var secuCode=$("#secuCode").val();
		var value = getQueryString('ans');
		var mon = "";
		var ans = "";
		if(value!=null && value!="null" && value!="" ){
			var valArray = value.split(';');
			if(valArray.length>1){
				var val1 = valArray[0];
			    ans = val1;
				var val2 = valArray[1];
				if(val2.split('=').length>1){
					mon = val2.split('=')[1];
					if(mon== ""  || mon==null ||mon =="null" ||parseFloat(mon) <= 0){
						mon ="";
					}
				}
			}
			
		}
		
		if(mon!=null && mon !=''){
		   mon =callYZT.moneyToNum(mon);
		   mon=Math.round(mon);
		   if(mon.toString().length>10){
		    	mon=9999999999; //
		    }
			var exp=new Date();
			var time=60*60*1000;// 365*60*60*24*1000;
			exp.setTime(exp.getTime()+time);
			var f = document.domain.indexOf("pingan.com.cn") > -1 ? "pingan.com.cn": "pingan.com";
	        document.cookie = escape("mon") + "=" + escape(secuCode+"-"+mon) + "; expires="+  exp.toGMTString() +"; path=/;domain=" + f

		}
		if(ans !=null && ans !=''){
			var exp=new Date();
			var time=60*60*1000;// 365*60*60*24*1000;
			exp.setTime(exp.getTime()+time);
			document.cookie=escape("ans")+"="+escape(ans)+"; " +"expires="+exp.toGMTString();
		}
	},
	
	clearCookie :function (name){
		// 为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间
		 var exp = new Date();
		  exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
		  var val = callYZT.getCookie(name);
		  document.cookie = escape(name)+"="+escape(val)+ "; expires=" + exp.toGMTString();
	},
	
	getObjJson:function (json){
		var nJson = null;
		try{
			nJson = eval("("+json+")");
		}catch(e){
			nJson = json;
		}
		return nJson;
		
	},

	doJP : function() { 
		var ans = callYZT.getCookie('ans');
		ans =ans.toUpperCase();
		var mon = callYZT.getCookie('mon');
		var secuCode = $("#secuCode").val();
		if((null!=ans && ''!=ans && 'null'!=ans) ||(null!=mon && ''!=mon && 'null'!=mon)){
			// 判断是否登陆
			$.ajax({
				url : protocol+'/memberAlias.jsp',
				data : {
					_r : new Date().getTime()
				},
				dataType:"jsonp",
				success : function(json) {
					var obj=callYZT.getObjJson(json);
					if (!obj.isLoginEmall) {
						return;
					}
			// 查询用户的答题结果(没有就将答题结果保存到该用户下)
				var data = {
						ans : ans,
						mon: mon,
						secuCode:secuCode
					};
					$.ajax({
						type : 'post',
						url : protocol + '/InvestmentAdviser_evaluateResult_jump.do',
						dataType : "jsonp",
						data : data,
						success : function(json) {
			               var abc;
						}

					});
					
					callYZT.clearCookie('ans');
					clearInterval(iCount);
				}
			
			});
		}else{
		    clearInterval(iCount);
		}
	
		
	}

};
var iCount=1;
$(document).ready(function(){
	callYZT.setCookie();
	 iCount = setInterval("callYZT.doJP()",3000);
	callYZT.doJP();
	
});

