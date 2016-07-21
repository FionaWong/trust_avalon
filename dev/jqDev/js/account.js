(function(window,$){

var 

version = '2016.03.05',

config = window.config,

Armor = window.Armor,

PublicKey = config.account.publicKey,

RSAKey = window.RSAKey,

rsa = new RSAKey(),

_phone,

self,

common={'format':'json','from':'pc'},

urls = config.account.urls,

layout = $('.layer_bg'),

haoxinView = $('.haoxin'),

haoxin_validCode = $('.haoxin .validCode'),

haoxin_validInput = $('.haoxin .validInput'),

haoxin_submit = $('.haoxin .submit'),

setInterval_obj,

haoxin_clock = config.account.haoxin_clock,

clone = function(obj){

	var result = {};
	 for(key in obj){

	 	result[key] = obj[key];
	 }
	 return result;

},

testApplyHaoXinHandler = function(resquest,response,selfCallback,callback){

	var code = response.responseCode;
	var responseData = response.responseData;
	if(code == '000000' || code == '0' || code == '900001'){

		callback(responseData);
	}else if(code == '670100' && responseData.riskResult.riskDecision == "01"){

	if(resquest.riskRepeatFlg == undefined)
	{
		resquest.riskRepeatFlg = '1';
		resquest.riskEventId = responseData.riskResult.riskEventId;
		resquest.riskAppOptResult = responseData.riskResult.riskAppOptResult;
		resquest.riskMobile = responseData.riskResult.riskMobile;
		resquest.riskBlackBox = Armor.data;
		resquest.riskPwd = resquest.passWord ? resquest.passWord : resquest.pwd;

	}else if(resquest.riskRepeatFlg == '0'){

		resquest.riskRepeatFlg = '1';

	}
	self._launchHaoXin(selfCallback,resquest,callback);

	}else if(code == '900401'){
		
		alert('[' + response.responseCode + ']  ' + ' 输入的银行卡号不正确，请重新输入');
		
	}else{

			//$.publish(code,response.response.responseMessage);
			alert('[' + response.responseCode + ']  ' + response.responseMessage);
		}

},

applyHaoXinHandler = function(resquest,response,selfCallback,callback){

	var code = response.responseCode;
	var responseData = response.responseData;
	if(code == '000000' || code == '0'){

		callback(responseData);
	}else if(code == '670100' && responseData.riskResult && responseData.riskResult.riskDecision == "01"){

	if(resquest.riskRepeatFlg == undefined)
	{
		resquest.riskRepeatFlg = '1';
		resquest.riskEventId = responseData.riskResult.riskEventId;
		resquest.riskAppOptResult = responseData.riskResult.riskAppOptResult;
		resquest.riskMobile = responseData.riskResult.riskMobile;
		resquest.riskBlackBox = Armor.data;
		resquest.riskPwd = resquest.passWord ? resquest.passWord : resquest.pwd;

	}else if(resquest.riskRepeatFlg == '0'){

		resquest.riskRepeatFlg = '1';

	}
	self._launchHaoXin(selfCallback,resquest,callback);

	}else if(code == '900401'){
		
		alert('[' + response.responseCode + ']  ' + ' 输入的银行卡号不正确，请重新输入');
		
	}else{

			//$.publish(code,response.response.responseMessage);
			alert('[' + response.responseCode + ']  ' + response.responseMessage);
		}

},

notApplyHaoXinHandler = function(response,callback){

	var code = response.responseCode;
	if(code == '000000' || code == '0'){
	var responseData = response.responseData;
		callback(responseData);
	}else{
		//$.publish(code,response.response.responseMessage);
		alert('[' + response.responseCode + ']  ' + response.responseMessage);
	}

},

account = function(){

	self = this;
	rsa.setPublic(PublicKey, "10001");

};

account.prototype.isAccountExist = function(callback) {
		
		var reqdata = $.extend({},clone(common));
		$.ajax({
		type: 'POST',
		url: urls.isAccountExist,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			notApplyHaoXinHandler(response,callback);
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype.queryPayStatus = function(data,callback) {
		
		var reqdata = $.extend(data,clone(common));
		$.ajax({
		type: 'POST',
		url: urls.payStatus,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			var code = response.responseCode;
			if(code == '000000' || code == '0'){
				var responseData = response.responseData;
				callback(responseData);
			}else if(code = '901001'){
				alert("支付状态查询失败:指定的条件记录不存在");
			}else if(code = '900001'){
				alert("系统繁忙，请稍后再试");
			}else{
				//$.publish(code,response.response.responseMessage);
				alert('[' + response.responseCode + ']  ' + response.responseMessage);
			}
		},
		error: function(error){
			alert('网络请求失败');
		}

	});

};

account.prototype.queryBindCards = function(callback) {
		
		var reqdata = $.extend({},clone(common));
		$.ajax({
		type: 'POST',
		url: urls.queryBindCards,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			notApplyHaoXinHandler(response,callback);
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype.sendOTP = function(data,callback,args) {
		
		var reqdata = $.extend(clone(common),data);
		return $.ajax({
		type: 'POST',
		url: urls.sendOTP,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			var code = response.responseCode;
			if(code == '000000' || code == '0'){
				var responseData = response.responseData;
				callback(args);
			}else{
				//$.publish(code,response.response.responseMessage);
				alert('[' + response.responseCode + ']  ' + response.responseMessage);
			}
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype._sendOTP = function(){

	self.sendOTP({'mobile':_phone},self._countClock);
}


account.prototype.querySupportBankList = function(callback){

		var reqdata = $.extend({},clone(common));
		$.ajax({
		type: 'POST',
		url: urls.querySupportBankList,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			notApplyHaoXinHandler(response,callback);
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype.bindCard = function(data,callback){

		var reqdata = $.extend(clone(common),data,{'riskBlackBox': Armor.data});
		//var encryptPwd = reqdata.passWord = self._signPassword(reqdata.passWord);
		return $.ajax({
		type: 'POST',
		url: urls.bindCard,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){

			applyHaoXinHandler(reqdata,response,self.bindCard,callback);
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype.toPay = function(data,callback){

		var reqdata = $.extend(clone(common),data,{'payClassify':'10'},{'riskBlackBox': Armor.data});
		if($.trim(reqdata.passWord).length == 6){

			var encryptPwd = reqdata.passWord = self._signPassword(reqdata.passWord);

		}
	
		$.ajax({
		type: 'POST',
		url: urls.toPay,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){

			applyHaoXinHandler(reqdata,response,self.toPay,callback);
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype.createAccount = function(data,callback){

		var reqdata = $.extend(clone(common),data,{'riskBlackBox': Armor.data});
		if($.trim(reqdata.pwd).length == 6){

			var encryptPwd = reqdata.pwd = self._signPassword(reqdata.pwd);

		}
		$.ajax({
		type: 'POST',
		url: urls.createAccount,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			applyHaoXinHandler(reqdata,response,self.createAccount,callback);
		},
		error: function(error){

			alert('网络请求失败');
		}

	});

};

account.prototype._launchHaoXin = function(selfCallback,data,callback){

	var phoneNum = data.riskMobile;
	var inputCode;
	layout.show();
	haoxinView.show();
	haoxin_validCode.off('click');
	$('.haoxin .dtm_sty b').html(self._hidePhoneNum(phoneNum));

	if(haoxin_clock == config.account.haoxin_clock){
			haoxin_validCode.on('click',self._sendOTP);
			haoxin_validCode.html('获取验证码');
	}

	/*haoxin_validCode.on('click',function(){

		self.sendOTP({'mobile':phoneNum},self._countClock);

	});*/

	haoxin_validInput.on('keyup',function(){

		inputCode = haoxin_validInput.val();
		if($.trim(haoxin_validInput.val()) != ''){
			haoxin_submit.removeClass('btn_gray');
			haoxin_submit.addClass('btn');
			

		}else{
			haoxin_submit.removeClass('btn');
			haoxin_submit.addClass('btn_gray');
		}

	});

	haoxin_submit.on('click',function(){

			if ($.trim(haoxin_validInput.val()) != '') {
				$.extend(data,{'riskPhonecode':haoxin_validInput.val()});
				layout.hide();
				haoxinView.hide();
				selfCallback.call(self,data,callback);
				haoxin_submit.off('click');

			}else{
				alert('请输入验证码');
			}

			});

};

account.prototype._signPassword = function(password){

	return rsa.encrypt(password);
};

account.prototype._hidePhoneNum = function(phoneNum){
	_phone = phoneNum;
    var mphone = phoneNum.substr(3,4);
    var lphone = phoneNum.replace(mphone,"****");
    return lphone;
};

account.prototype._countClock = function(){

	haoxin_validCode.off('click');
	haoxin_validCode.html(haoxin_clock + '秒后可重新发送');
	setInterval_obj = setInterval(function(){
		haoxin_clock --;
		if(haoxin_clock == 0){
			haoxin_validCode.on('click',self._sendOTP);
			haoxin_validCode.html('获取验证码');
			haoxin_clock = config.account.haoxin_clock;
			window.clearInterval(setInterval_obj);

		}else{
			haoxin_validCode.html(haoxin_clock + '秒后可重新发送');
		}

	},1000);
};

window.account = new account();


})(window,jQuery);