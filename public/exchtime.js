var srcClockId, tgtClockId, countDownId
var tgtTimezone = 8.05; //target time zone 

var d = new Date();  
//get the timezone offset from local time in minutes
var tzDiff = tgtTimezone * 60 + d.getTimezoneOffset();
//convert the offset to milliseconds, add to targetTime
var diffMsOffset = tzDiff * 60 * 1000;

function countDown() {
    var tDate = new Date(new Date().getTime()+diffMsOffset);
    var sDate = new Date(new Date().getTime());
    var in_hours   = parseInt(tDate.getHours() - sDate.getHours()) * 60;
    var in_minutes = parseInt(tDate.getMinutes() - sDate.getMinutes() + in_hours) ;
    var in_seconds = parseInt(tDate.getSeconds() - sDate.getSeconds());
    var diff = in_hours + in_minutes + in_seconds;
  
    if (diff<0) 
        console.log("diff is less than 0");                 
  	else
      console.log(in_minutes + ":" + in_seconds);                 
}

function UpdateClock(offset) {
    var tDate = new Date(new Date().getTime()+offset);
    var in_hours = tDate.getHours()
    var in_minutes=tDate.getMinutes();
    var in_seconds= tDate.getSeconds();

    if(in_minutes > 0)
        in_minutes = in_minutes;
    if(in_seconds<10)   
        in_seconds = '0'+in_seconds;
    if(in_hours<10) 
        in_hours = '0'+in_hours;
  
   //console.log(in_hours + ":" + in_minutes + ":" + in_seconds);
   consol =  document.getElementById('console');
   consol.innerHTML = in_hours + ":" + in_minutes + ":" + in_seconds;
   
}

function StartClock() {
   // srcClockId = setInterval(UpdateClock(diffMsOffset), 500);
   tgtClockId = setInterval(UpdateClock(0), 500);
   // countDownId = setInterval(countDown(),500);
}

function KillClock() {
  clearTimeout(srcClockId);
  clearTimeout(tgtClockId);    
  clearTimeout(countDownId)  
}

