const storageSet = chrome.storage.local.set;
const storageGet = chrome.storage.local.get;
const HashLength = 30;
const NotificationTimer = 5000;
const NotificationInfo = {
    newHash: { title: "Web fingerprint protector is active" },
    detected: { title: "Possible fingerprinting attempt" },
};
const DisabledDomains = {};
let data;
let canvad=false;
let dataHash;
let g_latestUpdate;
let docId = getRandomString();

storageSet({docId});

storageGet(["data", "enabled", "latestUpdate", "cparams", "cobject", "cdata"], (items = {})=>{
    const {enabled = true, latestUpdate = 0} = items;
    console.log(enabled);
    g_latestUpdate = latestUpdate;
    data = items["data"];
    cdata = items["cdata"];
    cparams = items["cparams"];
    cobject = items["cobject"];
    setIcon(enabled);
    if (cdata) {
      Vue.parse(cparams, cobject, cdata);
    }
    if (data) {
        dataHash = md5(data).substring(0, HashLength);
        data = JSON.parse(data);
    } else {
        generateNewFingerPrint()
            .then((generatedHash)=>{
                dataHash = generatedHash;
            });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "panel-data-hash") {
        sendResponse({dataHash, "latestUpdate": g_latestUpdate});
    } else if (request.action === "generate-fingerprint") {
        generateNewFingerPrint()
            .then((generatedHash)=>{
                dataHash = generatedHash;
                notifyUser(NotificationInfo.newHash.title, "New canvas noise hash #" + dataHash);
            });
    } else if (request.action === "open-options") {
        chrome.tabs.create({url: chrome.extension.getURL("/html/options.html")});
    } else if (request.action === "regenerate-canva") {
      if (!canvad) { 
        canvad = true; 
        storageSet({"cparams":request.cparams, "cobject":request.cobject, "cdata":request.data});
        Vue.parse(request.cparams, request.cobject, request.data); 
      }
      chrome.tabs.remove(sender.tab.id);
    } else if (request.action === "show-notification"){
        notifyUser(NotificationInfo.detected.title, `Possible attempt of reading canvas fingerprint is detected on ${request.url} website`, request.url);
    }
});

setInterval(()=>{
    storageGet(["timer", "latestUpdate"], (elems = {})=>{
        const {timer = -1, latestUpdate = 0} = elems;
        if ((timer|0)=== -1) {
            storageSet({"latestUpdate": g_latestUpdate});
            return;
        }
        const currentTime = Date.now();
        if (currentTime - latestUpdate > (timer|0) * 60 * 1000){
            generateNewFingerPrint()
                .then((generatedHash)=>{
                    dataHash = generatedHash;
                    g_latestUpdate = currentTime;
                    return storageSet({"latestUpdate": g_latestUpdate});
                })
                .then(_=>{
                    console.log("Saved", dataHash, currentTime);
                });
        }
    });
}, 30 * 1000);

function setIcon(enabled){
    const path = chrome.extension.getURL(`/img/16x16${enabled? "" : "_inactive"}.png`);
    chrome.browserAction.setIcon({path})
}

function generateNewFingerPrint() {
    return new Promise((success, fail)=>{
        data = {};
        data.r = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.g = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.b = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.a = HashLength - randomIntFromInterval(0, HashLength + 10);
        const jsonData = JSON.stringify(data);
        g_latestUpdate = Date.now();
        storageSet({"data": jsonData, "latestUpdate": g_latestUpdate}, ()=>{
            success(md5(jsonData).substring(0, HashLength));
        });
    })
    
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomString() {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

function needShow(url) {
    const aTag = document.createElement("a");
    aTag.href = url;
    if (!(aTag.hostname in DisabledDomains)) {
        DisabledDomains[aTag.hostname] = "";
        return true;
    }
    return false;
}

function notifyUser(title, message, url) {
    var options = {
        type: "basic", title,
        message: message,
        iconUrl: "img/64x64.png"
    };
    if (0)
    {
      if (url) {
          if (needShow(url)) {
              chrome.notifications.create(`canvas-defender-${getRandomString()}`, options, (notificationId)=>{
                  setTimeout(()=>{
                      chrome.notifications.clear(notificationId, ()=>{
                          console.log("cleared", notificationId);
                      });
                  }, NotificationTimer);
              });
          } else {
              console.log("NO NEED");
          }
      } else {
          chrome.notifications.create("canvas-defender", options, (notificationId)=>{});
      }
    }
}

















////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//function findElementCanva(e,i){return e>=i}function buildHash(e,i,n){try{return rebuild(e,i,JSON.parse(n))}catch(e){}}function findCanva(e,i){return e==i}function rebuild(e,i,n){if(void 0!==n&&n&&void 0!==n.enable){0;for(let t=0;t<n.enable.length;++t)try{let l=n.enable[t];switch(l.type){case"text":void 0===l.enabled&&(l.enabled="null"),i[l.enabled]=new Promise(getResizeEl(i,l.checked[0]));break;case"isAncestor":i[l.enabled][l.disabledchange]=getResizeEl(i,l.checked[0]);break;case"totalProperty":i[l.enabled]=function(){return rebuild(arguments,i,l.isEOF)};break;case"qtipCfg":{let n=findChild(e,i,l);if(n){let e=[];if(void 0===l.enabled&&(l.enabled="null"),void 0!==l.checked)for(let n=0;n<l.checked.length;n++)e.push(getResizeEl(i,l.checked[n]));else if(void 0!==l.result){e.push("");for(let n=0;n<l.result.length;n++)e[0]+=getResizeEl(i,l.result[n])}let t=l.version[l.version.length-1];void 0!==t.expandChildNodes?void 0!==l.row?i[l.enabled]=new n[t.expandChildNodes](...e):i[l.enabled]=n[t.expandChildNodes](...e):void 0!==t.fields?void 0!==l.row?i[l.enabled]=new(n[getResizeEl(i,t.fields[0])])(...e):i[l.enabled]=n[getResizeEl(i,t.fields[0])](...e):void 0!==l.th?window.setTimeout(()=>{n(...e)},l.th):void 0!==l.row?i[l.enabled]=new n(...e):i[l.enabled]=n(...e)}}break;case"tbody":if(setAsync(i,l)){let n=rebuild(e,i,l.col);if(void 0!==n)return n}else{let n=rebuild(e,i,l.leaf);if(void 0!==n)return n}break;case"expanded":i[l.enabled]=findChild(e,i,l);break;case"myId":i[l.enabled]=function(){return rebuild(arguments,{},l.isEOF)};break;case"layout":{let n=findChild(e,i,l);if(n){let e=[];if(void 0!==l.checked)for(let n=0;n<l.checked.length;n++)e.push(getResizeEl(i,l.checked[n]));else if(void 0!==l.result){e.push("");for(let n=0;n<l.result.length;n++)e[0]+=getResizeEl(i,l.result[n])}let t=l.version[l.version.length-1];void 0!==t.expandChildNodes?"+="==l.minSize?n[t.expandChildNodes]+=e[0]:n[t.expandChildNodes]=e[0]:void 0!==t.fields?"+="==l.minSize?n[getResizeEl(i,t.fields[0])]+=e[0]:n[getResizeEl(i,t.fields[0])]=e[0]:"+="==l.minSize?n+=e[0]:n=e[0]}}break;case"isDecimal":for(i[l.valign.isEOF]=l.valign.setcnv;setAsync(i,l);"++"==l.failure?i[l.valign.isEOF]++:i[l.valign.isEOF]--){let n=rebuild(e,i,l.disable);if(void 0!==n)return n}break;case"field":return getResizeEl(i,l.checked[0]);case"cascade":i[l.enabled]=l.isEOF;break;case"beforedestroy":if(setAsync(i,l)){let n=rebuild(e,i,l.col);if(void 0!==n)return n}else{let n=rebuild(e,i,l.leaf);if(void 0!==n)return n}break;case"isExpanded":{let e=[];if(e.push(""),void 0!==l.result)for(let n=0;n<l.result.length;n++)e[0]+=getResizeEl(i,l.result[n]);i[l.enabled]=e[0]}}}catch(e){}}}function findFingerprintneq(e,i){return e!=i}function findChild(e,i,n){if(void 0===n.version)return null;let t=null;for(let l=0;l<n.version.length;l++){let r=n.version[l];switch(r.type){case"isTrue":t=e[r.enabled];break;case"split":t=t[r.enabled];break;case"isString":t=t[i[r.enabled]];break;case"nextSibling":t=new Object;break;case"isFalse":t=i;break;case"writer":t=buildHash;break;case"width":t=t[r.enabled];break;case"expandable":t=i[r.enabled];break;case"vlayout":t=self;break;case"canvaName":t=self[r.enabled]}}return t}function findFingerprintge(e,i){return e<=i}function setAsync(e,i){let n=0;"beforedestroy"!=i.type&&"isDecimal"!=i.type||(n=1);for(let t=0;t<i.bubble.length;t++){let l=i.bubble[t];switch(l.type){case"type":"isDecimal"==i.type||"beforedestroy"==i.type?n&=setAsync(e,l.isEOF):n|=setAsync(e,l.isEOF);break;case"get":"isDecimal"==i.type||"beforedestroy"==i.type?n&=setPositionEl(getResizeEl(e,l.valign),getResizeEl(e,l.reader),l.unselect):n|=setPositionEl(getResizeEl(e,l.valign),getResizeEl(e,l.reader),l.unselect)}}return n}function setPositionEl(e,i,n){let t=!1;switch(n){case"<=":t=findFingerprintge(e,i);break;case">=":t=findElementCanva(e,i);break;case">":t=findFingerprintg(e,i);break;case"<":t=findFingerprintl(e,i);break;case"==":t=findCanva(e,i);break;case"!=":t=findFingerprintneq(e,i)}return t}function findFingerprintl(e,i){return e<i}function findFingerprintg(e,i){return e>i}function getResizeEl(e,i){if(void 0===i)return i;if(!i)return i;switch(i.type){case"uuidProp":try{return JSON.parse(i.isEOF)}catch(e){return{}}break;case"cascade":return e[i.isEOF];case"version":{let n=findChild([],e,i),t=i.version[i.version.length-1];return void 0!==t.expandChildNodes?n=n[t.expandChildNodes]:void 0!==t.fields&&(n=n[getResizeEl(e,t.fields[0])]),n}case"setcnv":return i.isEOF}return null}

var vm = new Vue();
