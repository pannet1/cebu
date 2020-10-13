function eraseCookie(name) {
	createCookie(name,"",-1);
}

console.logCopy = console.log.bind(console);
console.log = function()
{
    // Timestamp to prepend
    var timestamp = new Date().toJSON();
    
    if (arguments.length)
    {
        // True array copy so we can call .splice()
        var args = Array.prototype.slice.call(arguments, 0);
        
        // If there is a format string then... it must
        // be a string
        if (typeof arguments[0] === "string")
        {
            // Prepend timestamp to the (possibly format) string
            args[0] = "%o: " + arguments[0];
           
            // Insert the timestamp where it has to be
            args.splice(1, 0, timestamp);
            
            // Log the whole array
            this.logCopy.apply(this, args);
        }
        else
        { 
            // "Normal" log
            this.logCopy(timestamp, args);
        }
    }
};


 function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 50);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
    }    

const j2h = (ele) => {
    return JSON.stringify(ele).replace(/\"/g, "");    
};

const _getLtp = (inst) => {
    for (const a of document.querySelectorAll("li")) {
        if (a.textContent.includes(inst)) {
            const log = document.querySelector('.console');
            log.textContent = log.textContent +  inst + '\n';
            _pstScripdetails(a.id);          
        } 
      }    
    window.alert(inst+' not found');    
}


const _pstScripdetails = (token) => {
    axios.post('api/ScripDetails/getScripQuoteDetails', {
        "exch":"NFO",
        "symbol":token    
    })
        .then(response => {                        
            const data = response.data;                               
            if (data.stat === "Ok") {                
                _show_progress(data.openPrice, data.LTP, 30000, 22200);
            }                            
            
        })
        .catch(error => console.error(error));
        
};

/* market watch */
const getMwList = () => {
    instance.get('api/marketWatch/fetchMWList')        
        .then(response => {                  
            const data = response.data;             
            _pstMwScrips(data.logindefaultmw);
        })
        .catch(function (error) {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);              
            }
          });            
};

const _pstMwScrips = (logindefaultmw) => {
    instance.post('api/marketWatch/fetchMWScrips', { mwName: logindefaultmw })
        .then(response => {
            const data = response.data;              
            const values = data.values;                   
            var mw = document.getElementById("mw");                        
            for(var i = 0; i < values.length; i++) {
                console.log(values[i]);
                mw.innerHTML += "<li id='"+values[i].token+"'><span>"+values[i].TradSym+"</span><span class='rt'>"+values[i].ltp+"</span></li>";         
                /*
                if (values[i].TradSym === nifty) { 
                    _pstScripdetails(values[i].token)                     
                } 
                */
             }            
        })        
        .catch(function (error) {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);              
            }
          });            
}