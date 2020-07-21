function id(e) { return document.getElementById(e); }

const OFFSET=new Date().getTimezoneOffset();

let app = new Vue({
  el: '#app',
  data: {
    title: 'BOOK YOUR BARBER',
    header: 'Great Hair Doesn\'t Happen By Chance. It Happens By Appointment!<br />So Don\'t Wait And Book Your Appointment Now!',
    formheader: 'BOOK YOUR APPOINTMENT',
    mobileheader: 'Great Hair Doesn\'t Happen By Chance. It Happens By Appointment!',
    success: 'APPOINTMENT SUCCESSFULLY BOOKED',
    fullname: '',
    number: '',
    email: '',
    barber: '',
    service: '',
    date: '',
    time: ''
  }
});

$.getJSON('http://localhost:3000/barbers', function(data){ window.barbers=data;}).done(addBarbers);
$.getJSON('http://localhost:3000/services', function(data){ window.services=data; }).done(addServices);
$.getJSON('http://localhost:3000/appointments', function(data){ window.appointments=data; });
$.getJSON('http://localhost:3000/workHours', function(data){ window.workHours=data; });


$.getJSON('http://api.giphy.com/v1/gifs/search?api_key=KeTn0RgXZQF8EDkUGgQmSaJYuWPEz5mI&q=barber', function(data){ window.gifs=data; });


function addBarbers() {
	let i;
    for (i=0;i<barbers.length;i++) {
	    let opt=document.createElement('option');
	    opt.innerHTML=barbers[i].firstName+' '+barbers[i].lastName;
	    opt.value=barbers[i].id;
	
	    id('barber').appendChild(opt);
    }
}

function addServices() {
	let i;
    for (i=0;i<services.length;i++) {
	    let opt=document.createElement('option');
	    opt.innerHTML=services[i].name;
	    opt.value=services[i].id;
	
	    id('service').appendChild(opt);
    }
}

function updatePrice() {
	let priceId=id('service').value;
	
	if (priceId==-1) id('price').value='';
	
	for (let i=0;i<services.length;i++) {
		if (priceId==services[i].id) id('price').value=services[i].price+' EUR';
	}
	
	updateTime();
}

function updateTime() {
	let barberId=id('barber').value;
	let date=id('date').value;
	let service=id('service').value;
	
	if (date=='') { clearTime(); return; }
	if (barberId==-1) { clearTime(); return; }
	if (service==-1) { clearTime(); return; }
	
	let thisBarber=[];
	let i;
	
	for (i=0;i<appointments.length;i++) {
		if (appointments[i].barberId==barberId) thisBarber.push(appointments[i]);
	}
	
	date=new Date(date);
	
	let workDays=''; //would be '12345' for Mon-Fri
	for (i=0;i<5;i++) {
		workDays+=workHours[i].day;
	}
	
	
	if (thisBarber.length==0) {
		//no appointments for this barber
		if (workDays.indexOf((date.getDay()+1).toString())==-1) {
			//today not working
			clearTime();
			return;
		}
		
		let start, end;
		for (i=0;i<5;i++) {
		    if (workHours[i].day==date.getDay()+1) {
				let fix=''; if (workHours[i].startHour<10) fix='0';
				start=new Date(id('date').value+'T'+fix+workHours[i].startHour+':00:00');
				
				fix=''; if (workHours[i].endHour<10) fix='0';
				end=new Date(id('date').value+'T'+fix+workHours[i].endHour+':00:00');
			}
	    }
	    
	    //now, we have start time and end time for today
	    
	    let res=[]; let now=start.getTime();
	    while (now<end.getTime()) {
			let temp=getTimeInterval([now/1000,service]);
			res.push(temp);
			now+=1000*(temp[1]-temp[0]);
		}
		
		
		clearTime();
		
		for (i=0;i<res.length;i++) {
			//adding time intervals to <select>
			let opt=document.createElement('option');
			let aHours=new Date(res[i][0]*1000).getHours();
			if (aHours<10) aHours='0'+aHours;
			let aMinutes=new Date(res[i][0]*1000).getMinutes();
			if (aMinutes<10) aMinutes='0'+aMinutes;
			let bHours=new Date(res[i][1]*1000).getHours();
			if (bHours<10) bHours='0'+bHours;
			let bMinutes=new Date(res[i][1]*1000).getMinutes();
			if (bMinutes<10) bMinutes='0'+bMinutes;
			
			opt.innerHTML=aHours+':'+aMinutes+' - '+bHours+':'+bMinutes;
			opt.value='T'+aHours+':'+aMinutes+':00';
			
			id('time').appendChild(opt);
		}
	}
	else {
		//check if there are appointments today
		let today=false; let t=date.getTime()/1000; let todayTimes=[];
		for (i=0;i<thisBarber.length;i++) {
			if ((thisBarber[i].startDate>=t) && (thisBarber[i].startDate<t+86400)) {
				//there are appointments today
				today=true;
				todayTimes.push([thisBarber[i].startDate,thisBarber[i].serviceId]);
			}
		}
		
		if (today) {
			//making schedule without occupied intervals
			if (workDays.indexOf((date.getDay()+1).toString())==-1) {
			    //today not working
			    clearTime();
			    return;
		    }
		
		    let start, end;
		    for (i=0;i<5;i++) {
		        if (workHours[i].day==date.getDay()+1) {
				    let fix=''; if (workHours[i].startHour<10) fix='0';
				    start=new Date(id('date').value+'T'+fix+workHours[i].startHour+':00:00');
				
				    fix=''; if (workHours[i].endHour<10) fix='0';
				    end=new Date(id('date').value+'T'+fix+workHours[i].endHour+':00:00');
			    }
	        }
	        
	        todayTimes.sort(function(a, b) { return a[0]-b[0]; });
	    
	        //now, we have start time and end time for today
	    
	        let res=[]; let now=start.getTime(); let j=0;
	        while (now<end.getTime()) {
				//need interval [now, getTimeInterval(now, service)]
				//if now+interval > todaytimes[start] => we can't make an interval, so now=todayTimes[end];
				if (todayTimes[j]) {
					if (getTimeInterval([now/1000,service])[1] > todayTimes[j][0]) {
						//should jump to end of nearest occupied interval
						now=1000*getTimeInterval([todayTimes[j][0], todayTimes[j][1]])[1];
						j++;
						continue;
					}
				}
			    let temp=getTimeInterval([now/1000, service]);
			    res.push(temp);
			    now+=1000*(temp[1]-temp[0]);
		    }
		
		
		    clearTime();
		    
		    for (i=0;i<res.length;i++) {
			    //adding time intervals to <select>
			    let opt=document.createElement('option');
			    let aHours=new Date(res[i][0]*1000).getHours();
			    if (aHours<10) aHours='0'+aHours;
			    let aMinutes=new Date(res[i][0]*1000).getMinutes();
			    if (aMinutes<10) aMinutes='0'+aMinutes;
			    let bHours=new Date(res[i][1]*1000).getHours();
			    if (bHours<10) bHours='0'+bHours;
			    let bMinutes=new Date(res[i][1]*1000).getMinutes();
			    if (bMinutes<10) bMinutes='0'+bMinutes;
			
			    opt.innerHTML=aHours+':'+aMinutes+' - '+bHours+':'+bMinutes;
			    opt.value='T'+aHours+':'+aMinutes+':00';
			
			    id('time').appendChild(opt);
		    }
		}
		else {
			//making schedule just based on work hours and interval
		    if (workDays.indexOf((date.getDay()+1).toString())==-1) {
			    //today not working
			    clearTime();
			    return;
		    }
		
		    let start, end;
		    for (i=0;i<5;i++) {
		        if (workHours[i].day==date.getDay()+1) {
				    let fix=''; if (workHours[i].startHour<10) fix='0';
				    start=new Date(id('date').value+'T'+fix+workHours[i].startHour+':00:00');
				
				    fix=''; if (workHours[i].endHour<10) fix='0';
				    end=new Date(id('date').value+'T'+fix+workHours[i].endHour+':00:00');
			    }
	        }
	    
	        //now, we have start time and end time for today
	    
	        let res=[]; let now=start.getTime();
	        while (now<end.getTime()) {
			    let temp=getTimeInterval([now/1000,service]);
			    res.push(temp);
			    now+=1000*(temp[1]-temp[0]);
		    }
		
		
		    clearTime();
		    
		    for (i=0;i<res.length;i++) {
			    //adding time intervals to <select>
			    let opt=document.createElement('option');
			    let aHours=new Date(res[i][0]*1000).getHours();
			    if (aHours<10) aHours='0'+aHours;
			    let aMinutes=new Date(res[i][0]*1000).getMinutes();
			    if (aMinutes<10) aMinutes='0'+aMinutes;
			    let bHours=new Date(res[i][1]*1000).getHours();
			    if (bHours<10) bHours='0'+bHours;
			    let bMinutes=new Date(res[i][1]*1000).getMinutes();
			    if (bMinutes<10) bMinutes='0'+bMinutes;
			
			    opt.innerHTML=aHours+':'+aMinutes+' - '+bHours+':'+bMinutes;
			    opt.value='T'+aHours+':'+aMinutes+':00';
			
			    id('time').appendChild(opt);
		    }
		}
	}
}

function getTimeInterval(inp) {
	//get timestamps of occupied time
	let start=parseInt(inp[0]); let end;
	let i;
	for (i=0;i<services.length;i++) {
		if (services[i].id==parseInt(inp[1])) end=start+60*services[i].durationMinutes;
	}
	
	return [start, end];
}

function clearTime() {
	id('time').innerHTML='<option value="-2" disabled selected hidden>Select Time</option>';
}

function validate() {
	let errors=false;
	if (!checkName(id('firstname').value) || !checkName(id('lastname').value)) { errors=true; app.fullname='Please enter your full name'; } else { app.fullname=''; }
	if (!checkEmail(id('email').value)) { errors=true; app.email='Please enter a valid email'; } else { app.email=''; }
	if (!checkNumber(id('number').value)) { errors=true; app.number='Please enter phone number'; } else { app.number=''; }
	if (id('barber').value==-1) { errors=true; app.barber='Please select a barber'; } else { app.barber=''; }
	if (id('service').value==-1) { errors=true; app.service='Please select a service'; } else { app.service=''; }
	if (!checkDate(id('date').value)) { errors=true; app.date='Please pick a date'; } else { app.date=''; }
	if (id('time').value==-1) { errors=true; app.time='Please pick a time'; } else { app.time=''; }
	
	if (errors) return;
	
	let timestamp=new Date(id('date').value+id('time').value).getTime();
	timestamp/=1000;
	$.post('http://localhost:3000/appointments', { startDate: timestamp, barberId: id('barber').value, serviceId: id('service').value});
	
	id('main').style.display='none';
	id('success').style.display='block';
	id('gif').setAttribute('src', 'https://giphy.com/embed/'+gifs.data[Math.round(Math.random()*gifs.data.length)].id);
}

function checkName(str) {
	if (str.length>50) return false;
	if (str.length<3) return false;
	return true;
}

function checkEmail(str) {
	let rule = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return rule.test(String(str).toLowerCase());
}

function checkDate(str) {
	if (str=='') return false;
	return true;
}

function checkNumber(str) {
	str=str.replace(' ','');
	str=str.replace('(','');
	str=str.replace(')','');
	str=str.replace('-','');
	
	let rule=/^\+?(386)?(\d{8,9})$/;
	return rule.test(str);
}


