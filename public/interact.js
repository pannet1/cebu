

/* not working till 9th oct */

/* private functions */
const CE = 'CE';
const PE = 'PE';
const millisecs = 100;

// progress indicator
const _show_progress = (Start, Ltp, Buy, Sel, lt_txt="Open", rt_txt="Trigger") => {    
    let width = 0;
    const elem = document.getElementById("bar");
    const root = document.getElementById("root");
    root.innerHTML = "<tr><th style='text-align:left'>"+lt_txt+"</td>"+
                    "<th>LTP</td>"+   
                    "<th style='text-align:right'>"+rt_txt+"</td></tr>";                    
    if (Ltp < Start) {
        width = (Start-Ltp) / (Start-Sel) * 100;
        elem.style.width = width + "%";        
        if(Buy>Start)
            elem.classList.add("red");              
        else {
            elem.classList.add("green");                  
        }
        root.innerHTML += "<tr><td style='text-align:left'>"+Start+"</td>"+
                    "<td>"+Ltp+"</td>"+   
                    "<td style='text-align:right'>"+Sel+"</td></tr>";   
     }    
    if (Ltp > Start) {        
        width = (Ltp-Start) / (Buy-Start) * 100;
        elem.style.width = width + "%";        
        if(Buy>Start)
            elem.classList.add("green");              
        else {
            elem.classList.add("red");                
        }
        root.innerHTML += "<tr><td style='text-align:left'>"+Start+"</td>"+
                        "<td style='text-align:center'>"+Ltp+"</td>"+
                        "<td style='text-align:right'>"+Buy+"</td></tr>";    
    }         
    if (width ==0) {
        root.innerHTML += "<tr><td style='text-align:left'>"+Start+"</td>"+
        "<td>"+Ltp+"</td>"+   
        "<td style='text-align:right'>&nbsp;</td>"+Buy+" / "+Sel+"</tr>";  
    } 
};

/* get tokens from scrip json object */
function _getScripTokens () {           
  // convert object to key's array
  const keys = Object.keys(scrips);
  // iterate over object
  keys.forEach((key, index) => {
    if (scrips[key] == undefined) {
    console.log("Token is undefined for ",scrips[key]);
    }  else {
    console.log("trying to obtain token from keys of ",scrips)
    tknFmScrip(scrips[key]);
    }
});
};

/* order status */
const _orderStatus = () => {    
    return zebu.get('api/placeOrder/fetchOrderBook')
    .then(function(response){
        return response.data;
    });    
}                

/* modify order */      
const _pstModifyOrder = (sym, qty="1", ordr_typ="MKT", prc="", ordr_num ) => {
    if (ordr_num == 0) console.log("WARNING: Tried to modify an order with no #")
    zebu.post('api/placeOrder/modifyOrder', [{                         
        "discqty": "0",
        "exch": "NFO",
        "trading_symbol": sym,           
        "nestOrderNumber": ordr_num,
        "prctyp": ordr_typ,     
        "price": prc,
        "qty": qty,
        "trigPrice": prc,
        "filledQuantity": "0"        
    }])
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
const _pstPlaceOrder = (trans, sym, tok, qty="1", ordr_typ="MKT", prc="" ) => {
    zebu.post('api/placeOrder/executePlaceOrder', [{                 
        "complexty": "regular",
        "discqty": "0",
        "exch": "NFO",
        "pCode": "MIS",
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
    if(response.status != 200) {
        _redirect("/",5000);        
    }           
    const data = response.data;    
    if (data.emsg) {
        log.innerHTML = log.innerHTML + data.emsg + '\n';         
    } else if (data.stat == "Not_Ok") {            
        log.innerHTML = log.innerHTML + data.stat + '\n';     
    }     
}; 
/*                   end of helpers                     */

/*                      algo part                        */
/* 5 trade logic */
const longOnlyTrades = (ul, call, put) => {             
    
    // console.log("looking to trade for ul ",`${ul}`);      
    
    let ce1        = readCookie(call);
    let pe1        = readCookie(put);    
     
    let ulTkn      = localStorage.getItem(ul1);    
    let callTkn    = localStorage.getItem(call);
    let putTkn     = localStorage.getItem(put);            
    
    let direction  = 0;  
    let isStop     = 0;
    let price      = 0;    
    
    axios.all([
        zebu.post('api/positionAndHoldings/positionBook', { "ret":"NET"}),                
        zebu.post('api/ScripDetails/getScripQuoteDetails', {"exch":"NFO","symbol":ulTkn })        
    ])    
    .then(responseArr => {              
            
            tradeData = responseArr[0].data;
            appendToDOM(responseArr[0], "trade data");                                    
            // are we in any position
            if (tradeData) {                   
                for(let i = 0; i < tradeData.length; i++) {                            
                    // PUT sell
                    if( tradeData[i].Tsym == pe1 && tradeData[i].Netqty > 0) {
                        direction = -1;    price = parseInt(tradeData[i].NetBuyavgprc - trade.stop1);                              
                    }
                    // CALL sell
                    else if( tradeData[i].Tsym == ce1 && tradeData[i].Netqty > 0) {
                        direction = 1;    price = parseInt(tradeData[i].NetBuyavgprc - trade.stop1);                              
                    }                    
                }
            }     
            
            // is stop in place. get stop loss                      
            _orderStatus().then((orders) => {                   
                if (orders) {                                  
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
                    
                    // place stop orders
                    if (price <= 0) price = 1;

                    if (isStop == 0) {
                        if (direction == -1) _pstPlaceOrder ("SELL", pe1, putTkn, qty=trade.qty1, ordr_typ="SL-M", prc=price); 
                        else 
                        if (direction == 1) _pstPlaceOrder ("SELL", ce1, callTkn, qty=trade.qty1, ordr_typ="SL-M", prc=price);
                    } else {
                        console.log("stop zzz is: ", isStop, "stop price is ", price);     
                    }
                    
                    
                }  // orders.stat                 
            });
            

            ulData = responseArr[1].data;         
            appendToDOM(responseArr[1], "Underlying data");        
            // exits and entry     
            if (ulData.stat = "Ok") {                                
                open = parseInt(ulData.openPrice);          
                const entrypts  = parseInt(open * factor * 0.236);                      
                const buyEntry  = open + entrypts;
                const sellEntry = open - entrypts; 
                const tgtinpts  = parseInt(open * factor * trade.target_ratio);                                          
                
                // long call option exit
                if (direction == 1)                     
                    { 
                        if 
                        (
                        ( ulData.LTP > ( open + tgtinpts)) 
                        // || (  ulData.LTP < ( open - trade.stop1 ))    
                        ){                            
                          _pstModifyOrder (ce1, qty=trade.qty1, ordr_typ="MKT", prc=price, isStop);
                        }
                        
                        if(buyEntry < open+tgtinpts )
                        _show_progress (buyEntry, ulData.LTP, open+tgtinpts, open+tgtinpts-trade.stop1, "Entry","Target");                           
                        else
                        _show_progress (buyEntry, ulData.LTP, open+tgtinpts, open-tgtinpts-trade.stop1, "Entry","Stop");                                  
                     }                       

                // long put option exit
                if (direction == -1 )
                    {
                        if
                        (
                        (ulData.LTP < ( open - tgtinpts)) 
                        // || (ulData.LTP > ( open + trade.stop1 )) 
                        ){ 
                            _pstModifyOrder (pe1, qty=trade.qty1, ordr_typ="MKT", prc="", isStop);  
                        }       
                        if(sellEntry > open-tgtinpts)
                        _show_progress (sellEntry, ulData.LTP, open-tgtinpts, open-tgtinpts+ parseInt(trade.stop1),"Entry","Target");                            
                        else 
                        _show_progress (sellEntry, ulData.LTP, open-tgtinpts, open-tgtinpts+parseInt(trade.stop1),"Entry","Stop");                            
                    }              
                                
                

                if ( // entries
                    (noOfOrders < parseInt(trade.allowed * 2) - 1)
                    && (direction == 0) 
                ) {                    
                    console.log("looking to buy @", buyEntry, " and sell @", sellEntry);
                    if (      // long call option entry                   
                        ulData.LTP >= (open + entrypts) && trade.sellorbuy >=0
                        && ulData.LTP <= (open + entrypts + parseInt(trade.slip)) 
                    ) 
                    { 
                        _pstPlaceOrder ("BUY", ce1, callTkn, qty=trade.qty1, ordr_typ="MKT"); 
                    }

                    else if (      // long put option entry                                                             
                         ulData.LTP <= ( open - entrypts) && trade.sellorbuy <=0
                         && ulData.LTP >= ( open - entrypts - parseInt(trade.slip))
                    ) { 
                        _pstPlaceOrder ("BUY", pe1, putTkn, qty=trade.qty1, ordr_typ="MKT", prc=""); 
                    }    
                } // end of entries    
                else { console.log("no of orders ",noOfOrders, "/ allowed orders ", parseInt(trade.allowed * 2) - 1); }                                               

                if (direction ==0)                     
                    _show_progress (open, ulData.LTP, buyEntry, sellEntry, "Open","Target");                                                              
                
            }                       
      }) // end of response arr2                      
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);              
        }
        });                 
}

/* 4 generate long option scrip names from unerlying */
function longScripsFromUl(ul, ulTkn) {               
    zebu.post('api/ScripDetails/getScripQuoteDetails', { "exch": "NFO", "symbol": ulTkn })
            .then( resp => {                         
             appendToDOM(resp, "long Scrips from ul");            
             ulData = resp.data;                                
                if (ulData.stat == "Ok") {                                    
                    const open = parseInt(ulData.openPrice);                    
                    const factinpts = open * factor * 0.236;                                        
                    createCookie(ul, factinpts, 0);                                        
                    const longstrike = _findITMStrike(open+factinpts,CE);
                    createCookie("ce1", trade.base1 + trade.week + longstrike  + CE, 0);                                                            
                    const sellstrike = _findITMStrike(open-factinpts,PE)
                    scrips = {
                    "ce1": trade.base1 + trade.week + longstrike  + CE,
                    "pe1": trade.base1 + trade.week + sellstrike + PE
                    };                            
                    createCookie("pe1",trade.base1 + trade.week + sellstrike + PE,0)
                    _getScripTokens();                      
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
        zebu.post('exchange/getScripForSearch', {        
            "symbol":scrip,
            "exchange":["NFO"]
        })
            .then(response => {         
                const data = response.data;
                appendToDOM(response, "Getting token");    
                console.log(data);                                                                                       
                for(var k = 0; k < data.length; k++) {                   
                    if(data[k].instrument_name == scrip) {
                    localStorage.setItem(scrip, data[k].token);  
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
     
    // 1 get cookies and set zebu headers    
    _setZebuAxios();

    // 2. get user settings from json file
    getSettings()
    .then((result) => {
        trade = result;        
        ul1 = trade.base1+trade.month+'FUT'; 
        const ulTkn = localStorage.getItem(ul1);                 
        const cookieUl1 = readCookie(ul1);        
        
        // 3.get token of underlying             
        if(ulTkn == null  ) {
            console.log("first attempt to get token for ul ", ul1 );          
            tknFmScrip(ul1);                  
        }  else if(cookieUl1 == null)
        {         
        // 4. get long options scrip name from underlying                       
            longScripsFromUl(ul1, ulTkn);                                            
            console.log("building long scrip list for ul "+ ul1+ " with token "+ ulTkn )  
        }         

        // 5. take trades with instruments
        if ( cookieUl1 != null && ulTkn != null) {                                   
            ce1 = readCookie("ce1"); 
            pe1 = readCookie("pe1");
            if(ce1!=null && pe1!=null) longOnlyTrades('ul1', 'ce1', 'pe1');             
        } else {
            console.log("cookie ul is "+cookieUl1+" and ulTkn is "+ulTkn);
            _redirect("/",500);
        }              

    });  // end of get settings

    sleep(5000).then( () => {
        index();
    })         
  
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
    root.innerHTML += "resuming";
    _redirect("/",5000);                
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
    root.innerHTML += "resuming";
    _redirect("/",5000);  
};
