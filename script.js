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

$.getJSON('http://localhost:3000/barbers', function(data){ window.barbers=data;}).done(addBarbers);
$.getJSON('http://localhost:3000/services', function(data){ window.services=data; }).done(addServices);
$.getJSON('http://localhost:3000/appointments', function(data){ window.appointments=data; });
$.getJSON('http://localhost:3000/workHours', function(data){ window.workHours=data; });

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
}

function validate() {
	
	
	
	
	let timestamp=new Date(id('date').value+'T10:00:00').getTime();
	timestamp/=1000;
	$.post('http://localhost:3000/appointments', { startDate: timestamp, barberId: id('barber').value, serviceId: id('service').value});
}


