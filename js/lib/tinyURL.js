/* TinyURL JS API
  @author: Ephellon Dantzler
  @timestamp: Sunday August 13, 2017 02:04:32 CST (-06:00)
*/
// JavaScript Emulation from "1.8.5" to "1.3"

// C -> XRequest

function ProperURL__String(url) {
  if(ProperURL.test(url))
    return new URL(url);
  try {
    // Missing protocol
    if(/([\w]+)\.([\w]+)(\/.+)?$/i.test(url))
      return new URL('http://' + RegExp.$_);
  } catch(error) {
    throw new URIError("Failed to construct 'URL': Invalid URL");
  }
};

ProperURL.test = function test(url) {
  try {
    new URL(url);
  } catch(error) {
    return false;
  }
  return true;
};

function tinyurl__Object_Function(options, callback) {
  var head = "https://www.tinyurl.com/api-create.php?url=",
      url = head + encodeURIComponent(options.url),
      start, end, count, fetching,
      timeout = options.timeout;
  tinyurl.callback = callback;

  if((timeout != undefined && timeout != null)) {
    start = (new Date).getTime();
    XRequest(options, callback);
    for(
      count = 0, end = start + (timeout * 1000), fetching = true;
      fetching && count < end;
      count = (new Date).getTime()
    )
      fetching = (XRequest.status == undefined || XRequest.status == null);
    end = count;

    XRequest.request = {start: start, end: end, span: end - start};
  } else {
    XRequest({url: url, method: options.method || "GET"}, callback);
  }
}

function tinyurl__Object(options) {
  if((options.callback != undefined && options.callback != null))
    return tinyurl(options, options.callback);
  if((options.success != undefined && options.success != null))
    return tinyurl(options, options.success);
  return tinyurl(options, function () {});
}

function tinyurl__String_Object(url, options) {
  if(ProperURL.test(url))
    return tinyurl(new URL(url), options);
  else
    return tinyurl(ProperURL(url), options);
}

function tinyurl__String_Function(url, callback) {
  if(ProperURL.test(url))
    return tinyurl(new URL(url), {method: "GET", callback: callback});
  else
    return tinyurl(ProperURL(url), {method: "GET", callback: callback});
}

function tinyurl__String(url) {return tinyurl(url, {method: "GET"})};

function tinyurl__URL(url) {return tinyurl({method: "GET", url: url.href})};

function tinyurl__URL_Object(url, options) {return tinyurl(Object.assign({url: url.href}, options))};

tinyurl.toString = function toString(url, options) {
  if(url != undefined && url != null)
    return tinyurl.apply(null, arguments);
  return tinyurl.url;
};

// https://robwu.nl/cors-anywhere.html
var updateURLInterval;

function XRequest(options, callback) {
  var API_URL = "https://cors-anywhere.herokuapp.com/",
      XHR = new XMLHttpRequest;
  XHR.open(options.method, API_URL + options.url);
  XHR.onload = function(){var args = arguments;return setTimeout(function(){return callback.apply(null, args)}, 100)};
  XHR.onerror = options.error;

  if(/^POST/i.test(options.method))
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  try {
    XRequest.request = XHR;
    updateURLInterval =
    setInterval(function() {
      tinyurl.preview = (tinyurl.url = XRequest.request.responseText || "").replace(/\:\/\/(w+\.)?/, "://$1preview.");
      if(tinyurl.url != "")
        clearInterval(updateURLInterval);
    }, 1);
    XHR.send();
  } catch(error) {
    XHR.onerror.apply(null, error);
  }
}

function ProperURL() {
  var index = 0, args = arguments, types = Types.apply(null, arguments).split(','), check = Types.check, oftype = Types.oftype;
  switch(types + '') {
    case ('String' + ''):
      return ProperURL__String.apply(null, args);
      break;
    default:
      throw TypeError('ProperURL(' + types + ') is undefined');
      break;
  }
};

function tinyurl() {
  var index = 0, args = arguments, types = Types.apply(null, arguments).split(','), check = Types.check, oftype = Types.oftype;
  switch(types + '') {
    case ('URL,Object' + ''):
      return tinyurl__URL_Object.apply(null, args);
      break;
    case ('URL' + ''):
      return tinyurl__URL.apply(null, args);
      break;
    case ('String,Object' + ''):
      return tinyurl__String_Object.apply(null, args);
      break;
    case ('String,Function' + ''):
      return tinyurl__String_Function.apply(null, args);
      break;
    case ('String' + ''):
      return tinyurl__String.apply(null, args);
      break;
    case ('Object,Function' + ''):
      return tinyurl__Object_Function.apply(null, args);
      break;
    case ('Object' + ''):
      return tinyurl__Object.apply(null, args);
      break;
    default:
      throw TypeError('tinyurl(' + types + ') is undefined');
      break;
  }
};

window.tinyurl = tinyurl;

function Types(){for(var index=0,results=[],args=[].slice.call(arguments),arg;index<args.length;index++)if(((arg=args[index])!=undefined&&arg!=null)&&arg.constructor==Function&&(arg.name!=undefined&&arg.name!=null&&arg.name!=""))results.push(arg.name);else if(arg!=undefined&&arg!=null)results.push(arg.constructor.name);else results.push(typeof arg);return results.join(',')};Types.check=function(a,b){var c=RegExp("^(\\b"+a+"\\b,?)+$").test(b),d=(c)?RegExp.$_:b.replace(RegExp("^(\\b"+a+"\\b,?)+"),"").split(","),i=check.failIndex=((c)?-1:((b=b.split(",")).length-d.length));return check.fail=((c)?"":b.slice(i,b.length)+""),c};Types.oftype=function(a,b){return check(a,b+"")?b:b.slice(0,index=check.failIndex)};
