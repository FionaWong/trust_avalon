(function(window,configure){


var 
	evn = configure.evn,

	domain  = configure.domain,

	paySuccessUrl = configure.paySuccessUrl,

	gotoPayUrl = configure.gotoPayUrl,

	gotoAddAccountUrl = configure.gotoAddAccountUrl;
	
	if(domain.charAt(domain.length -1) == '/'){
		
		domain = domain.substring(0,domain.length-1);
		
		}

	var config = function(){

		var conf = {};
		if(evn == 'local'){

			conf.dingdan = {

				'urls': {

				'gotoPayUrl':  domain + gotoPayUrl,
				'gotoAddAccountUrl': domain + gotoAddAccountUrl
					}

			};

			conf.order = {

				'urls' : {

					orderDetail: domain +  '/json/orderDetail.json',
					orderList:  domain + '/json/orderList.json',
					productDetail: domain + '/json/productDetail.json',
					checkPayOrder: domain + "/open/licai/xintuo/checkPayOrder.do"
				}

			};

			conf.account = {
			'clock' : 60,
			'haoxin_clock' : 60,
			'urls' : {
			'createAccount': domain + '/json/createAccount.json',
			'isAccountExist': domain + '/json/isAccountExist.json',
			'queryBindCards': domain + '/json/queryBindCards.json',
			'sendOTP': domain + '/json/sendOTP.json',
			'bindCard': domain + '/json/bindBankCard.json',
			'querySupportBankList': domain + '/json/querySupportBankList.json',
			'toPay': domain + 'json/payResult.json',
			'paySuccessUrl':domain + paySuccessUrl,
			'payStatus':domain + '/open/order/queryPayStatus.do'
			},
			'publicKey' :'8bfcdc2fba15b27f9ce73fbf17465cb6b483aa3c9c69a8e33fbb128a1fd00a4baff762cb5118d55025ef0a29153057ca793c33e009d9832bdd4ca1982b25394d0ec2e36a1d0d274d91c07a5683c4a2ee3f30cfb208c26943e0f15bfd399e728da38396f066910883de8feaaf66a2d1fcde96a5362bbebc43ba3be836b836b6bf'
			};

			

		}else if(evn == 'stg'){

			conf.dingdan = {

				'gotoPayUrl':  domain + gotoPayUrl,
				'gotoAddAccountUrl': domain + gotoAddAccountUrl

			};			
			conf.order = {

					'urls' : {

						orderDetail: domain +  '/open/licai/xintuo/queryOrderDetail.do',
						orderList:  domain + '/open/licai/xintuo/queryOrderList.do',
						productDetail: domain + '/open/licai/xintuo/productDetailInfo.do',
						checkPayOrder: domain + "/open/licai/xintuo/checkPayOrder.do"
					}

				};
			
			conf.account = {

			'clock' : 60,
			'haoxin_clock' : 60,
			'urls' : {
			'createAccount': domain + '/open/order/createPamaAccount.do',
			'isAccountExist':domain + '/open/order/queryPamaInfo.do',
			'queryBindCards':domain + '/open/order/queryBindCards.do',
			'sendOTP':domain + '/open/order/sendOTP.do',
			'bindCard':domain + '/open/order/bindCard.do',
			'querySupportBankList':domain + '/open/order/querySupportBankList.do',
			'toPay':domain + '/open/order/orderReceive.do',
			'paySuccessUrl': domain + paySuccessUrl,
			'payStatus':domain + '/open/order/queryPayStatus.do'
			},

			'publicKey' :'8bfcdc2fba15b27f9ce73fbf17465cb6b483aa3c9c69a8e33fbb128a1fd00a4baff762cb5118d55025ef0a29153057ca793c33e009d9832bdd4ca1982b25394d0ec2e36a1d0d274d91c07a5683c4a2ee3f30cfb208c26943e0f15bfd399e728da38396f066910883de8feaaf66a2d1fcde96a5362bbebc43ba3be836b836b6bf'

			};

		}else if (evn == 'prd') {

			conf.dingdan = {

				'gotoPayUrl':  domain + gotoPayUrl,
				'gotoAddAccountUrl': domain + gotoAddAccountUrl

			};
			conf.order = {

					'urls' : {

						orderDetail: domain +  '/open/licai/xintuo/queryOrderDetail.do',
						orderList:  domain + '/open/licai/xintuo/queryOrderList.do',
						productDetail: domain + '/open/licai/xintuo/productDetailInfo.do',
						checkPayOrder: domain + "/open/licai/xintuo/checkPayOrder.do"

					}

				};

			conf.account = {

			'clock' : 60,
			'haoxin_clock' : 60,
			'urls' : {
			'createAccount': domain + '/open/order/createPamaAccount.do',
			'isAccountExist':domain + '/open/order/queryPamaInfo.do',
			'queryBindCards':domain + '/open/order/queryBindCards.do',
			'sendOTP':domain + '/open/order/sendOTP.do',
			'bindCard':domain + '/open/order/bindCard.do',
			'querySupportBankList':domain + '/open/order/querySupportBankList.do',
			'toPay':domain + '/open/order/orderReceive.do',
			'paySuccessUrl': domain + paySuccessUrl,
			'payStatus':domain + '/open/order/queryPayStatus.do'
			},

			'publicKey' :'adee58af9bafad2b2e9008eeee066509c053069f84c483eb5c312f2eb833073df48eb139ecaf8912ed08e6adf40aa1a419c6a0aada923bde727ee6082210d5e4e44cbfe0f2a56042b5ba2eb4d8981913410586ceb376e18e0e03b2140507cd5189f09c8624df00f5c0c3828c6cbcf714319bb239fe466e923eae1bf8642b6a6e5a3ac50e141ccf05b11edeeebb22ee5f1792440671b94938b85a52352f228c9246f331077fc0239f889351e88223b3e6d30b62c900a6bea739597400da20178791cbce5a9283a7dc641eb1e417ffeadeac677a6863682f6afb018568f2874f0f6a8639f32bc9c34208319ead6267099e14fe8944593543c80e2c465214c8940d'

			};

	}

	return conf;
	}

window.config = config();

})(window,configure)


