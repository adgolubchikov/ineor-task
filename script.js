function id(e) { return document.getElementById(e); }

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

$.getJSON('http://localhost:3000/barbers', function(data){ window.barbers=data;}).done(addbarbers);
$.getJSON('http://localhost:3000/services', function(data){ window.services=data; }).done(addservices);
$.getJSON('http://localhost:3000/appointments', function(data){ window.appointments=data; });
$.getJSON('http://localhost:3000/workHours', function(data){ window.workHours=data; });

function addbarbers() {
	let i;
    for (i=0;i<barbers.length;i++) {
	    let opt=document.createElement('option');
	    opt.innerHTML=barbers[i].firstName+' '+barbers[i].lastName;
	    opt.value=barbers[i].id;
	
	    id('barber').appendChild(opt);
    }
}

function addservices() {
	let i;
    for (i=0;i<services.length;i++) {
	    let opt=document.createElement('option');
	    opt.innerHTML=services[i].name;
	    opt.value=services[i].id;
	
	    id('service').appendChild(opt);
    }
}


function validate() {
	
}


