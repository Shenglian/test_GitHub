var init = function(){
  var body = document.getElementsByTag("body");
  body = body && body[0];
  if(body){
    body.style.background = "red";
    console.log("ok");
  }

}
var domReady = function(callback){
	callback = callbac || function(){};
	if(document.addEventListener){
		document.addEventListener("DOMContentLoaded",callback,false);
	}
	if(document.attachEvent){
		document.attachEvent("onreadystatechange",function(){
			if(/loaded|complete/.test(document.readyState)){
				callback();
			}
		
		});
	}
	if(document.documentElement.doScroll && !window.frameElement){
		try{
			document.documentElement.doScroll("left");
		}catch(e){
			setTimeout(arguments.callee,0);
			return;
		}
		callback();
	
	}

}
domReady(function(){
	init();

});
