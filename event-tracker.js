
import { Platform } from 'react-native';
import RNDatadome from './datadome-module';

export default class EventTracker {

	static logEvent = async (DataDome, url, options) => {
		let key = DataDome.getInstance().getSdkKey();
		let cookie = await DataDome.getInstance().getStoredDatadomeCookie();
		// no cookie is set with Lambda@Edge be cause set-cookie header is not sent
		if (cookie == null) {
			cookie = ""
		}

		fetch('https://api-sdk.datadome.co/sdk/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: await EventTracker.body(DataDome, url, key, cookie, options)
		})
		.then(function(response){
			return response.json();
		})
		.then(function(json) {
			DataDome.getInstance().storeCookie(json.cookie)
		});
	}

	static body = async (DataDome, url, key, cookie, options) => {
		var details = {
			'cid': DataDome.getInstance().parseDataDomeCookie(cookie),
			'ddv': '1.0.14',
			'ddvc': await RNDatadome.appVersion(),
			'ddk': key,
			'request': url,
			'os': Platform.OS,
			'osr': await RNDatadome.systemVersion(),
			'osn': await RNDatadome.systemName(),
			'osv': await RNDatadome.systemShortVersion(),
			'mdl': await RNDatadome.deviceModel(),
			'ua': options.headers['User-Agent'],
			'inte': 'react-native-fetch',
			'screen_x': await RNDatadome.deviceScreenWidth(),
			'screen_y': await RNDatadome.deviceScreenHeight(),
			'screen_d': await RNDatadome.deviceScreenScale(),
			'events': '[]',
			'camera': '{"auth":false, "info":""}'
		};

		var formBody = [];
		for (var property in details) {
			var encodedKey = encodeURIComponent(property);
			var encodedValue = encodeURIComponent(details[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
		formBody = formBody.join("&");

		return formBody;
	}
}
