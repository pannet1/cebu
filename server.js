const fs = require('fs');
const url = require('url');
const express = require('express');
const compression = require('compression');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(compression());

app.get('/factor', function (req, res) {      
   const nse1 = require('axios');
   nse1.get('https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/liveIndexWatchData.json')
   .then(resp => {                  
         data = resp.data.data;                        
         vix = data[4].previousClose               
         factor = ( 1*( vix / 100 ) * Math.sqrt(1)  ) 
                     / Math.sqrt(365) ;        
         res.setHeader('Content-Type', 'application/json');
         res.json({"factor":factor});             
   })
   .catch(function (error) {
      if (error.resp) {          
      console.log(error.resp.data);
      console.log(error.resp.status);              
         }
   });         
   
});  

app.get('/logout', function (req, res) {      
   res.sendFile( __dirname + "/public/" + "logout.html" );        
});

// render json file
app.get('/settings.json', function (req, res) {
   res.sendFile( __dirname + "/public/" + "settings.json" );    
});

// render settings page
 app.get('/settings', function (req, res) {
   res.sendFile( __dirname + "/public/" + "settings.html" );    
});


// write new settings to file
app.get('/update', function (req, res) {
   // read file and make object
   file = __dirname + "/public/" + "settings.json";
   let settings = JSON.parse(fs.readFileSync(file, 'utf8'));

   // get query string part from the url
   const queryObject = url.parse(req.url, true).query
   
   // mege it with existing json object
   trade = {...settings, ...queryObject};
   
   // edit or add property
   // trade.week = "24SEP20";
   //write file      
   fs.writeFileSync(file, JSON.stringify(trade));   
   return res.redirect("settings");    
   console.log(trade);
});

app.get('/reset', function(req, res) {

src = __dirname + "/public/" + "default.json";
dest = __dirname + "/public/" + "settings.json";

// destination.txt will be created or overwritten by default.
fs.copyFile(src, dest, (err) => {
   if (err) throw err;
   console.log(src + " was copied to " + dest);
 });

 return res.redirect("settings");    


})

app.get('/login', function (req, res) {
   res.sendFile( __dirname + "/public/" + "login.html" );    
});


app.get('/', function (req, res) {         
   res.sendFile( __dirname + "/public/" + "index.html" );        
});


var port = process.env.PORT || 8081;
var server = app.listen(port, function () {
   //var host = server.address().address
   // var port = server.address().port  

   console.log("zebu app listening at http://localhost:%s", port)
});
