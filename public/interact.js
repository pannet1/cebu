/* private functions */
const millisecs = 100;

// progress indicator
const _show_progress = (Txn, Start, Ltp, Tgt, Stop) => {      
    let width = 0, rt_txt="Target", lt_txt="Open";
    const elem = document.getElementById("bar");
    const ptxt = document.getElementById("ptxt");

    if( Txn==0) {
        if (Ltp>Start && Ltp<Tgt ) {
            rt_txt = "Long";
            width = (-1*(Start-Ltp)) / (-1*(Start-Tgt)) * 100;
            elem.classList.add("green");
        } else if (Ltp<Start && Ltp>Stop)
        {            
            rt_txt = "Short"
            width = (Start-Ltp) / (Start-Stop) * 100;                        
            elem.classList.add("red");
        }
    }  else { lt_txt="Entry" } 
    // long
    if( Txn==1 ) {
        if (Ltp<Start) {
            rt_txt = "Stop";     
            width = (Start-Ltp) / (Start-Stop) * 100;
            elem.classList.add("red");              
        } else {            
            rt_txt = "Target";     
            width = (-1*(Start-Ltp)) / (-1*(Start-Tgt)) * 100;
            elem.classList.add("green");
        }        
    }  
    // short
    if (Txn==-1) {
        if(Ltp>Start) {
            rt_txt = "Stop";     
            width = (-1*(Start-Ltp)) / (-1*(Start-Stop)) * 100;
            elem.classList.add("red");           
        } else {
            rt_txt = "Target";     
            width = (Start-Ltp) / (Start-Tgt) * 100;
            elem.classList.add("green");            
        }
    }

    elem.style.width = width + "%";        
    ptxt.innerHTML = 
                    "<tr><th style='text-align:left'>"+lt_txt+"</td>"+
                    "<th>LTP</td>"+   
                    "<th style='text-align:right'>"+rt_txt+"</td></tr>";                    
    
    };


/* order status */
const _orderStatus = () => {    
    return zebu.get('api/placeOrder/fetchOrderBook')
    .then(function(response){
        return response;
    });    
}                

/* modify order */      
const _pstModifyOrder = (trans, sym, qty="1", ordr_typ="MKT", prc="00.00", ordr_num, validity ) => {
    
    direction = 0;
    zebu.post('api/placeOrder/modifyOrder', {                         
        "discqty": 0,        
        "exch": "NFO",        
        "filledQuantity": 0,        
        "nestOrderNumber": ordr_num,      
        "prctyp": ordr_typ,     
        "trading_symbol": sym,         
        "price": prc,
        "qty": qty,
        "trigPrice": prc,
        "transtype": trans,
        "pCode": validity
    })
        .then(response => {
        const data = response.data;  
        appendToDOM(response, "modifying order");
        if (data.stat == "Ok") {   
            const log = document.querySelector('.console');
            log.textContent = "Order Modified Successfully";                 
        } else if (data.emsg) {
            const err = document.querySelector('.err');
            err.textContent = err.textContent + data.emsg + '\n';     
        }
    })
    .catch(function (error) {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);              
            }
    })            
};

/* place order */


const _pstPlaceBracket = (trans, sym, tok, qty="1", ordr_typ="MKT", prc, complexty="regular", tgt="", sl="", tsl="" ) => {

    let trigprc = "0.00";
    if(ordr_typ!="MKT") { trigprc = prc }
    

    zebu.post('api/placeOrder/executePlaceOrder', [{                         
        "discqty": "0",
        "exch": "NFO",
        "pCode": "MIS",
        "prctyp": ordr_typ,             
        "qty": qty,
        "ret": "DAY",
        "symbol_id": tok,        
        "trading_symbol": sym,        
        "transtype": trans,
        "complexty": complexty,
        "price": prc,
        "trigPrice": trigprc,
        "target": tgt,
        "stopLoss": sl,
        "trailing_stop_loss":tsl
    }])
        .then(response => {
        const data = response.data;  
        appendToDOM(response, "placing order");
        if (data.stat == "Ok" && parseInt(data.nestOrderNumber) > 0) {   
            const log = document.querySelector('.console');
            log.textContent = "Order Placed Successfully";                 
        } else if (data.emsg) {
            const err = document.querySelector('.err');
            err.textContent = err.textContent + data.emsg + '\n';     
        }
    })
    .catch(function (error) {
            if (error.response) {                
              console.log(error.response.data);
              console.log(error.response.status);              
            }
    })            
};

const _pstPlaceOrder = (trans, sym, tok, qty="1", ordr_typ="MKT", prc="", validity ) => {

    console.log("price is :" + prc);
    zebu.post('api/placeOrder/executePlaceOrder', [{                 
        "complexty": "regular",
        "discqty": "0",
        "exch": "NFO",
        "pCode": validity,
        "prctyp": ordr_typ,     
        "price": prc,
        "qty": qty,
        "ret": "DAY",
        "symbol_id": tok,        
        "trading_symbol": sym,        
        "transtype": trans,
        "trigPrice": prc
    }])
        .then(response => {
        const data = response.data;  
        appendToDOM(response, "placing order");
        if (data.stat == "Ok" && parseInt(data.nestOrderNumber) > 0) {   
            const log = document.querySelector('.console');
            log.textContent = "Order Placed Successfully";                 
        } else if (data.emsg) {
            const err = document.querySelector('.err');
            err.textContent = err.textContent + data.emsg + '\n';     
        }
    })
    .catch(function (error) {
            if (error.response) {                
              console.log(error.response.data);
              console.log(error.response.status);              
            }
    })            
};

const _findITMStrike = (quote,option,strikeDiff=100) => {
    strike = (quote / strikeDiff).toFixed(0)*strikeDiff
    if(option=="CE") {
        if (strike > quote) {
            return (strike - strikeDiff)
        } else {
            return strike
        }
    } else {
        if (strike < quote) {
            return (strike + strikeDiff)
        } else {
            return strike
        }
    }
}

const trail50 = (cmp, lng, srt) => {
    console.log("cmp is "+cmp+" < lng is", lng+" > srt is", srt);    
        if ( direction==1 && cmp < lng )            
                return true;            
        else if ( direction==-1 && cmp > srt )           
                return true;            
        else     
            return false;
}

// not used 
const trailStop = (cmp) => {
    
    for (let i=1; i < Object.keys(levels).length; i++) {
        
        if ( direction==1 
            && cmp < parseInt(open + levels[i]) 
            && high > parseInt(open+ levels[i+1]) 
            )
        {
            console.log("cmp is "+cmp+" high is", high)
            return true
        }
        
        if ( direction==-1 && cmp > (open - levels[i]) && low < (open - levels[i+1] ) )
        {
            console.log("cmp is "+ cmp +" low is", low)
            return true
        }
    }
    return false;
    
}

const drawLvlTable =  (list) => {
    const root = document.getElementById("root");    
    root.innerHTML = "";
    const keysSorted = Object.keys(list).sort(function(a,b){return list[b]-list[a]})
    for (let i=0; i < Object.keys(list).length; i++) {        
        root.innerHTML =    root.innerHTML +     
        "<tr><td style='text-align:right'>"+keysSorted[i]+"</td>"+    
        "<td style='text-align:left'>"+ parseInt( list[keysSorted[i]] )  +"</td></tr>";                     
    }
    
}


const isTradeTime = (s, end="15:25:00", beg="09:15:00") => {

  cDate = new Date(s);
  cTime = cDate.getTime();

  t = s.split(" ");  	  	
  begDate = new Date(t[0] + " " + beg);
  begTime  = begDate.getTime();

  endDate = new Date(t[0] + " " + end);
  endTime = endDate.getTime(); 
  console.log("CTime",CTime,"endTime",endTime);
  if (cTime>=begTime && cTime<=endTime) {
    return true
  } else {
    return false
  }  
}


/* helpers */
const _redirect = (url="/", ms=millisecs) => {
    console.log("redirecting after ms", ms);
    sleep(ms).then( () => {               
        location.href = url;  
    })         
}

function createCookie(name,value,days) {
    let expires
    if (days) {
      let date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toGMTString();
    }
    else expires = "";
    document.cookie = name+"="+value+expires+"; path=/; SameSite=lax";
}

function readCookie (name) {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(let i=0;i < ca.length;i++) {
		let c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

const sleep = (ms) => {
    // console.log("sleeping for "+(ms/1000).toFixed(3)+" secs");
return new Promise(resolve => setTimeout(resolve, ms))
}  

const appendToDOM = (response, who="") => {        
    const log = document.querySelector('.console');
    const err = document.querySelector('.err');
    if(response.status != 200) {
        _redirect("/",5000);        
    }           
    const data = response.data; 
    if (data.stat  =="Ok") {
        log.innerHTML = log.innerHTML + who + '\n';         
    }        
    if (data.stat == "Not_Ok") {           
        let msg = data.stat;
        if(data.emsg) {
            msg = data.emsg;            
        }
        err.innerHTML = err.innerHTML + msg + '\n';     
    }     
}; 
/*                   end of helpers                     */

/*                      algo part                        */
/* 5 trade logic */



function _pstLtp (tkn) {             
    return zebu.post('api/ScripDetails/getScripQuoteDetails', { "exch": "NFO", "symbol": tkn })
    .then(function(response){
        return response;
    });    
}

 function longOnlyTrades (ul1, ce1, pe1) {                 
    
    let ulTkn  = localStorage.getItem(ul1);    
    let ceTkn  = localStorage.getItem(ce1);
    let peTkn  = localStorage.getItem(pe1);                   
    direction  = 0;          
    price      = 1;    
    axios.all([
        zebu.post('api/positionAndHoldings/positionBook', { "ret":"NET"}),                
        zebu.post('api/ScripDetails/getScripQuoteDetails', {"exch":"NFO","symbol":ulTkn })        
    ])    
    .then(responseArr => {                                     
            appendToDOM(responseArr[0], "trade data");                                    
            const positionBook = responseArr[0].data;
            // are we in any position                          
            for(let i = 0; i < positionBook.length; i++) {                            
                // PUT sell                    
                if( positionBook[i].Tsym == pe1 && positionBook[i].Netqty > 0) {
                    direction = -1;                      
                }
                // CALL sell
                else if( positionBook[i].Tsym == ce1 && positionBook[i].Netqty > 0) {
                    direction = 1;   
                }                    
            }           
    
            // is stop in place. get stop loss              
                _orderStatus().then((resp) => {             
                    appendToDOM(resp, "order status");      
                    const orders = resp.data;                
                    noOfOrders = orders.length;                              
                    if (noOfOrders === null || typeof noOfOrders === 'undefined')                         
                        noOfOrders = 0  
                    for(let j = 0; j < noOfOrders; j++) {                                                
                        if( orders[j].Trsym == pe1 && orders[j].Status == "trigger pending") {                            
                            isStop = parseInt(orders[j].Nstordno)                            
                        }
                        if( orders[j].Trsym == ce1 && orders[j].Status == "trigger pending") {
                            isStop = parseInt(orders[j].Nstordno)                            
                        }                                            
                    } // end for
                });                
            
            // exits and entry     
            ulData = responseArr[1].data;         
            appendToDOM(responseArr[1], "Checking Underlying");
            if (ulData.stat == "Ok") {                                
                open = parseInt(ulData.openPrice);     
                high = parseInt(ulData.High);
                low  = parseInt(ulData.Low);                                                 

                levels = {
                    '1': open * factor * 0.236,                 
                    '2': open * factor * 0.382, 
                    '3': open * factor * 0.5,                    
                    '4': open * factor * 0.618,
                    '5': open * factor * 0.786,                    
                    '6': open * factor * 1.236,
                    '7': open * factor * 1.618
                  };               

                const lentry    = eval(open + levels['1']);
                const sentry    = open - levels['1'];
                const tgtinpts  = parseInt(open * factor * trade.target_ratio);   
                const lngtrail  = lentry + (( high - lentry ) /2);
                const srttrail  = sentry - (( sentry - low ) /2);                      

                const printable = {
                    "<< LTP >>": parseInt(ulData.LTP),
                    "* OPEN_ *":  open,
                    "+ HIGH_ +": high,
                    "- _LOW_ -": low,                      
                    "+ MAXIM +": open + levels['7'],
                    "+ TARGT +": open + tgtinpts,
                    "+ 0.382 +": open + levels['2'],                                            
                    "+ STOP_ +": parseInt(open + levels['1'] - trade.stop1),
                    "+ TRAIL +": lngtrail,
                    "+ ENTRY +": open + levels['1'],                      
                    "- STOP_ -": parseInt(open + eval(trade.stop1) - levels['1']),
                    "- ENTRY -": open - levels['1'],                      
                    "- TRAIL -": srttrail,
                    "- 0.382 -": open - levels['2'],
                    "- TARGT -": open - tgtinpts,                      
                    "- MAXIM -": open - levels['7']
                }

                drawLvlTable( printable );
                  
                // long call option exit
                if (direction == 1 && isStop > 0)                     
                {                       
                    _show_progress ( direction, printable['+ ENTRY +'], ulData.LTP, printable['+ TARGT +'], printable['+ STOP_ +'] );                                               
                    if  
                    ( // trail condition                         
                        ulData.LTP > eval(open + levels['2'])            
                    )    
                    {                                                
                        if ( trail50(ulData.LTP, lngtrail, srttrail) )
                        { 
                            _pstModifyOrder ("SELL", ce1, qty=trade.qty1, ordr_typ="MKT", prc="00.00", isStop, trade.validity);
                        }                                                        
                    }
                    else if 
                    ( // exit
                        ( ulData.LTP > parseInt( open + tgtinpts))                                              
                        || !IsTradeTime(ulData.exchFeedTime, trade.squareoff)    
                        || ulData.LTP < ( open - trade.stop1)                                     
                    )
                    {                               
                        _pstModifyOrder ("SELL", ce1, qty=trade.qty1, ordr_typ="MKT", prc="00.00", isStop, trade.validity);                                                        
                    }               
                }                              
                     
                // long put option exit
                if (direction == -1 && isStop > 0 )                
                {                      
                    _show_progress ( direction, printable['+ ENTRY +'], ulData.LTP, printable['+ TARGT +'], printable['+ STOP_ +'] );                                                                   
                    
                    if (ulData.LTP < eval(open - levels['2']) )
                    {                               
                        if( trail50(ulData.LTP, lngtrail, srttrail) ) {
                            _pstModifyOrder ("SELL", pe1, qty=trade.qty1, ordr_typ="MKT", prc="00.00", isStop, trade.validity);                                                        
                        }
                    }                                                                   
                    else if
                    (
                    (ulData.LTP < parseInt( open - tgtinpts))                         
                    || !IsTradeTime(ulData.exchFeedTime, trade.squareoff)
                    || ulData.LTP > (open + trade.stop1)
                    )
                    {                            
                        _pstModifyOrder ("SELL", pe1, qty=trade.qty1, ordr_typ="MKT", prc="00.00", isStop, trade.validity);                                                        
                    }  
                }                                          
               
                
                if ( // entries
                    (noOfOrders < parseInt(trade.allowed * 2) - 1)                   
                    && (direction == 0) 
                ) {                    
                    console.log(ulData.LTP <= ( open - levels['1']) && trade.sellorbuy <=0);
                    console.log(ulData.LTP >= (open + levels['1']) && trade.sellorbuy >=0)
                    _show_progress ( direction, open, ulData.LTP, printable['+ ENTRY +'], printable['- ENTRY -'] ); 
                    if (      // long call option entry                   
                        ulData.LTP >= (open + levels['1']) && trade.sellorbuy >=0
                        && ulData.LTP <= (open + levels['1'] + parseInt(trade.slip)) 
                        && (high < open+levels['2'])
                    ) 
                    {                           
                       _pstLtp(ceTkn).then((resp) => {                   
                                appendToDOM(resp, "long entry and stop");
                                const scripDetails = resp.data;
                                const ltp = parseFloat(scripDetails.LTP);                                     
                                if(ltp>trade.stop1) { price = ltp-trade.stop1; }                                                                                            
                                _pstPlaceOrder("BUY", ce1, ceTkn, qty=trade.qty1, ordr_typ="MKT", prc="", trade.validity);                                
                                _pstPlaceOrder ("SELL", ce1, ceTkn, qty=trade.qty1, ordr_typ="SL-M", prc=price,trade.validity);                             
                                index();
                        });                                     
                    }
                    else if (      // long put option entry                                                             
                         ulData.LTP <= ( open - levels['1']) && trade.sellorbuy <=0
                         && ulData.LTP >= ( open - levels['1'] - parseInt(trade.slip))
                         && (low > open-levels['2'])
                    ) {                         
                         _pstLtp(peTkn).then((resp) => {                   
                                appendToDOM(resp, "short entry and stop");
                                const scripDetails = resp.data
                                const ltp = parseFloat(scripDetails.LTP);                                     
                                if(ltp>trade.stop1) { price = parseInt(ltp-trade.stop1); }
                                _pstPlaceOrder ("BUY", pe1, peTkn, qty=trade.qty1, ordr_typ="MKT", prc="" ,trade.validity);                                
                                _pstPlaceOrder ("SELL", pe1, peTkn, qty=trade.qty1, ordr_typ="SL-M", prc=price,trade.validity);                                                                                                                                           
                                index();
                        });  
                                    
                    }    
                } // end of entries    
                else { 
                    console.log("no of orders ",(noOfOrders/2)," > allowed orders ",trade.allowed) 
                }                                                
                                       
            }                       
      }) // end of response arr2                      
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);              
        }
        });                 

        sleep(6100).then( () => {                 
            longOnlyTrades(ul1, ce1, pe1);
        })
}

/* 4 generate long option scrip names from underlying */
function longScripsFromUl(ul, ulTkn) {               
    zebu.post('api/ScripDetails/getScripQuoteDetails', { "exch": "NFO", "symbol": ulTkn })
            .then( resp => {                         
             appendToDOM(resp, "long Scrips from ul");            
             // TODO
             ulData = resp.data;                                
                if (ulData.stat == "Ok") {                                    
                    const open = parseInt(ulData.openPrice);                    
                    const factinpts = open * factor * 0.236;                                                                            

                    const sellstrike = _findITMStrike(open-factinpts,"PE");
                    const pe1 = trade.base1 + trade.week + sellstrike + "PE";
                    createCookie("pe1",pe1,0)                                        
                    tknFmScrip(pe1);

                    const longstrike = _findITMStrike(open+factinpts,"CE");
                    const ce1 = trade.base1 + trade.week + longstrike  + "CE";
                    createCookie("ce1", ce1, 0);                                                                                                    
                    tknFmScrip(ce1);                                      
                    
                    /* scrips = {                       
                        "pe1": pe1,
                        "ce1": ce1
                        };       

                    _getScripTokens();
                    */                                     
                    
                    if(localStorage.getItem(pe1)!=null && localStorage.getItem(ce1)!=null)
                    {                    
                    createCookie(ul, factinpts, 0);          
                    }                     
                } 
            })
            .catch(function (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                }
            });            
   
}

/* 3 get token from scrip name */
const tknFmScrip = (scrip) => {             
        console.log("getting token for scrip",scrip);
        zebu.post('exchange/getScripForSearch', {        
            "symbol":scrip,
            "exchange":["NFO"]
        })
            .then(response => {         
                const data = response.data;
                appendToDOM(response, "Getting token");                                                                                                  
                for(var k = 0; k < data.length; k++) {                   
                    if(data[k].instrument_name == scrip) {
                    localStorage.setItem(scrip, data[k].token);  
                    }
                }
                
            }) 
            //TODO
            .catch((error) => {                   
                if (error.response) {
                  console.log(error.response.data);
                  console.log(error.response.status);                        
                } else if (error.request) {
                 // client never received a response, or request never left
                } else {
                    // anything else
                  }
            });                
}
// 2. user settings
function getSettings() {            
    const localhost = axios.create();
    return localhost.get('settings.json').then(function(res){
        return res.data;
    });
}

// 1. check if cookies are set
const _setZebuAxios = () => {
    factor = parseFloat(readCookie("factor"));    
    const sid = readCookie("sid");    
    if (sid == null || factor == null) {     
        // TODO
        _redirect("/login",0)                          
    } else {                        
        zebu = axios.create();
        zebu.defaults.headers.common['Content-Type'] = "text/plain";
        zebu.defaults.headers.common['Authorization'] = "Bearer TE185A01 "+sid;  
        zebu.defaults.headers.common['Content-Type'] = "application/json";
        zebu.defaults.baseURL = 'https://www.zebull.in/rest/MobullService/';   
    }       
}


/* -----------------------------------------------    */
//       bootstrap script                            //
/* -----------------------------------------------    */
function index() {         
     console.log("index");
    // 1 get cookies and set zebu headers    
    _setZebuAxios();

    // 2. get user settings from json file
    // TODO  replace result with trade
    getSettings()    
    .then((result) => {
        trade = result;        
        const ul1 = trade.base1+trade.month+'FUT';         
        const ulTkn = localStorage.getItem(ul1);                 
        const cookieUl1 = readCookie(ul1);                
        
        // 3.get token of underlying             
        if(ulTkn == null  ) {
            console.log("first attempt to get token for ul ", ul1 );          
            tknFmScrip(ul1); 
            sleep(1000).then( () => {               
                index();                 
            })                
        }  
         
        if(cookieUl1 == null)
        {         
        // 4. get long options scrip name from underlying                       
            longScripsFromUl(ul1, ulTkn);                                                                  
        }         

        // 5. take trades with instruments
        if ( cookieUl1 != null && ulTkn != null) {                                   
            // get option names names
            const ce1 = readCookie("ce1"); 
            const pe1 = readCookie("pe1");
            longOnlyTrades(ul1, ce1, pe1);
            } else {
            console.log("cookie ul1 is "+cookieUl1+" and ulTkn is "+ulTkn);            
            sleep(2000).then( () => {               
                index();                 
            })    
            }               
            
    });  // end of get settings  
}
/** ------------------------ end of bootstrap ------------------------- */

// positions
const pstPositions = () => {
    zebu.post('api/positionAndHoldings/positionBook', { "ret": "NET"})
        .then(response => {
            const root = document.getElementById("root");           
            const data = response.data;                             
            appendToDOM(response, "positions");
            if (data.stat != "Not_Ok") {         
                    root.innerHTML = "<tr><th>INSTRUMENT</th>"+
                                    "<th>PRODT</th>"+
                                    "<th>BUY AVG</th>"+
                                    "<th>SELL AVG</th>"+
                                    "<th>LTP</th>"+
                                    "<th>MTM</th></tr>";                    
                    for(var i = 0; i < data.length; i++) {                
                        root.innerHTML += 
                            "<tr><td>"+data[i].Tsym+"</td>"+                    
                            "<td>"+data[i].Pcode+"</td>"+                    
                            "<td>"+data[i].NetBuyavgprc+"</td>"+                    
                            "<td>"+data[i].NetSellavgprc+"</td>"+                                                    
                            "<td>"+data[i].LTP+"</td>"+                    
                            "<td>"+data[i].MtoM+"</td><tr>";                                               
                    }                          
                }            
            if (data.emsg == "No Data") {
                root.innerHTML = "No Positions";
            }
        })
        .catch(function (error) {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);              
            }
    });
            
};

// orders 
const getOrders = () => {
    const root = document.getElementById("root");
    zebu.get('api/placeOrder/fetchOrderBook')
        .then(response => {            
            const data = response.data;  
            appendToDOM(response, "orders");            
            if (data.stat != "Not_Ok") {                    
                    root.innerHTML = "<tr><th>TIME</th>"+
                                    "<th>PRODT</th>"+
                                    "<th>TYPE</th>"+
                                    "<th>INSTRUMENT</th>"+
                                    "<th>PRICE</th>"+
                                    "<th>STATUS</th></tr>";
                    for(var i = 0; i < data.length; i++) {                
                        root.innerHTML += 
                            "<tr><td>"+data[i].OrderedTime.split(' ').pop()+"</td>"+                    
                            "<td>"+data[i].Pcode+"</td>"+                    
                            "<td>"+data[i].Trantype+"</td>"+                    
                            "<td>"+data[i].Trsym+"</td>"+                                                    
                            "<td>"+data[i].Prc+"</td>"+                    
                            "<td>"+data[i].Status+"</td><tr>";                                               
                    }                             
                }
            if (data.emsg == "No Data") {
                root.innerHTML = "No Order";
            }
        })
        .catch(function (error) {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);              
            }
    })                
};