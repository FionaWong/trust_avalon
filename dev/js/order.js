(function(window,$){

var 

version = '2016.03.05',

config = window.config,

common={'format':'json','from':'pc'},

orderInfo = {

	productId: '',
	productCode: '',
	productName: '',
	mobileNo: '',
	orderNo: '',
	orderAmount: '',
	payOrderStatus:'',
	orderCreateTime: '',
	payOrderNo: '',
	payTime: ''

},

productInfo = {
	productId:'',
	incomeRate:'',
	period:''

},
urls = config.order.urls,
clone = function(obj){

	var result = {};
	 for(key in obj){

	 	result[key] = obj[key];
	 }
	 return result;

},
getOrderInfo = function(data){
	var info = clone(orderInfo);
	info.productId = data.productId;
	info.productName = data.productName;
	info.productCode = data.productCode;
	info.mobileNo = data.mobileNo;
	info.orderNo = data.orderNo;
	info.orderAmount = data.orderAmount;
	info.payOrderStatus = data.payOrderStatus;
	info.payTime = data.payTime;
	info.payOrderNo = data.payOrderNo;
	return info;
},
getProductInfo = function(data){
	var info = clone(productInfo);
	info.productId = data.productId;
	info.incomeRate = data.incomeRate;
	info.period = data.period;
	return info;
},
order = function(){
//domain = config.domain;
//urls.orderDetail = config.orderDetailUrl;
//urls.orderList = config.orderList;


};

order.prototype.getOrderDetailById = function(data,callback) {
	var reqdata = $.extend(clone(common),data);
	$.ajax({
		type: 'GET',
		url: urls.orderDetail,
		dataType: 'json',
		data:  reqdata,
		cache: false,
		timeout: 50000,
		success: function(response){
			var code = response.responseCode;
			if(code == '000000' || code == '0'){
				var responseData = response.responseData;
				//var info = getOrderInfo(responseData);
				callback(responseData);
			}else{

				//$.publish(code,response.response.responseMessage);
				alert('[' + response.responseCode + ']  ' + response.responseMessage);

			}
		},
		error: function(error){

			alert('获取订单失败');
		}

	});
};

order.prototype.getOrdersList = function(callback){

		$.ajax({
		type: 'GET',
		url: urls.orderList,
		dataType: 'json',
		timeout: 50000,
		success: function(response){
			var code = response.responseCode;
			if(code == '000000' || code == '0'){
				var responseData = response.responseData;
				if(responseData instanceof Array)
				{
					var infos = [];
					for (var i = 0; i < responseData.length; i++) {
						var info = getOrderInfo(responseData[i]);
						infos.push(info);
						}
					callback(infos);
				}
			}else{
				//$.publish(code,response.response.responseMessage);
				alert('[' + response.responseCode + ']  ' + response.responseMessage);

			}
			},
		error: function(error){

			alert('获取订单失败');
		}

	});

};

order.prototype.getProductDetailById = function(data,callback){

		var reqdata = $.extend(clone(common),data);
		$.ajax({
		type: 'GET',
		url: urls.productDetail,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			var code = response.responseCode;
			if(code == '000000' || code == '0'){
				var responseData = response.responseData;
				//var info = getProductInfo(responseData);
				callback(responseData);
			}else{
				//$.publish(code,response.response.responseMessage);
				alert('[' + response.responseCode + ']  ' + response.responseMessage);
				
			}
		},
		error: function(error){

			alert('获取产品信息失败');
		}

	});

};

order.prototype.checkPayOrder = function(data,callback){
	var reqdata = $.extend(clone(common),data);
		$.ajax({
		type: 'GET',
		url: urls.checkPayOrder,
		dataType: 'json',
		data:  reqdata,
		timeout: 50000,
		success: function(response){
			var code = response.responseCode;
			if(code == '000000' || code == '0'){
				var responseData = response.responseData;
				callback(responseData);
			}else{
				alert('[' + response.responseCode + ']  ' + response.responseMessage);
				
			}
		},
		error: function(error){

			alert('获取产品信息失败');
		}

	});
}
window.order = new order();


})(window,jQuery);