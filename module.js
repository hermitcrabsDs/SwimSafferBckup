$(document).ready(function(){

   $('ul.tabs > li.tab-link').click(function(){
      var tab_id = $(this).attr('data-tab');
      $('ul.tabs > li.tab-link').removeClass('current');
      $('.tab-content').removeClass('current');
      $(this).addClass('current');
      $("#"+tab_id).addClass('current');
	  
	  const url = new URL(window.location.href);
	  url.searchParams.set('tab', tab_id);
	  window.history.replaceState(null, null, url)
	  
   });
   $('ul.tabs2 > li.tab-links').click(function(){
      var tabber_id = $(this).attr('data-target');
      $(this).siblings().removeClass('active');
      $('.current .tabb-content').removeClass('active');
      $(this).addClass('active');
      $("#"+tabber_id).addClass('active');
   });

   $('.tabber-topic').click(function(){
      var tabber_id = $(this).attr('data-target');
      $(this).siblings().removeClass('active');
      $(this).parent().parent().find('.tabber-col').each(function(){
         $(this).removeClass('active');    
      });
      $(this).addClass('active');
      console.log(tabber_id);
      $("."+tabber_id).each(function(){
         $(this).addClass('active');
      });
   });

})
// =============================== Variable declaration  =================================================
const domain = document.querySelector('#domain').value;
const element = document.querySelector('#datepicker');
const firstSlide = document.querySelector('.first_slide');
const secondSlide = document.querySelector('.second_slide');
const thirdSlide = document.querySelector('.third_slide');
const fourthSlide = document.querySelector('.fourth_slide');
const fifthSlide = document.querySelector('.fifth_slide');
let contactObjectRecordID = document.getElementById("contactObjectRecordID");
const firstSlideNextBtn = document.querySelector('.first_slide_btn');
const paginationButtons = document.querySelector('.pagination-wp');
const errorMeesageOTP = document.getElementById('otperrormessage')

// =============================== First Slide Click Event =================================================
firstSlideNextBtn.addEventListener('click', function(){
	  firstSlide.classList.remove('active');
	  secondSlide.classList.add('active');
	  $("html, body").animate({ scrollTop: 0 }, "slow");
	  return false;
})
// =============================== Form submission event =================================================
window.addEventListener('message', event => {
   if(event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
	  event.preventDefault();
	  const email = event.data.data.submissionValues.email
	  setTimeout( function(){
		 fetch("/_hcms/api/accesssorUserVerification", {
			method: "post",
			headers: {               
			   "Content-Type": "application/json"
			},
			body: JSON.stringify({
			   email
			})
		 }).then( (response) => { 
			return response.json()
		 }).then( data => {
			contactObjectRecordID.value = data.UserID
			let verifyUser = data.verifyUser 
			let Label = data.label 
			secondSlide.classList.remove('active');
			thirdSlide.classList.add('active');
			document.getElementById(Label).classList.add('active')
			
			// ======================= Timer =========================
			let timeInSecs;
			let ticker;
			function startTimer(secs) {
			   timeInSecs = parseInt(secs);
			   ticker = setInterval(function(){
				  tick()
			   }, 1000); 
			}
			function tick() {
			   let secs = timeInSecs;
			   if (secs > 0) {
				  timeInSecs--; 
			   }
			   else {
				  clearInterval(ticker);
				  document.getElementById("cnfirmOTPform").style.display = "none"
				  document.getElementById("otpExpire").style.display = "block"
			   }
			   var mins = Math.floor(secs/60);
			   secs %= 60;
			   var pretty = ( (mins < 10) ? "0" : "" ) + mins + ":" + ( (secs < 10) ? "0" : "" ) + secs;
			   document.getElementById("countdown").innerHTML = pretty;
			}
			startTimer(5*60); 
		 }).catch(error => {
			console.log(error)
		 });
	  },1500)
   }

});

// =============================== Date Picker =================================================
flatpickr(element, {
   dateFormat: "d M Y",
   onChange: function(selectedDates, dateStr, instance) {
	  let d = new Date(selectedDates)
	  const unixTime = d.getTime()
	  let path = `${domain}?date=${unixTime}`;
	  getContent(path)
   }
});
// =============================== Get next page content ===========================================
function getContent(path){
   document.getElementById('loading').style.display = "block";
   document.querySelector('.table-wrapper .tbody').innerHTML = ''
   document.querySelector('.table-wrapper .pagination').innerHTML = "";
   
   fetch(path).then( res => {
	  return res.text()
   }).then( data => {
	  const parser = new DOMParser();
	  const Dom = parser.parseFromString(data, "text/html");
 	  let content = Dom.querySelector('.table-wrapper .tbody').innerHTML
	  let pagination = Dom.querySelector('.table-wrapper .pagination').innerHTML
	  if(content.trim().length == 0){
		 document.querySelector('.table-wrapper .tbody').insertAdjacentHTML("beforeend", '<tr><td colspan="5"><h3 style="text-align:center;width: 100%;">No reacords are found</h3></td></tr>');
		 document.getElementById('loading').style.display = "none";
	  } else {
		 document.querySelector('.table-wrapper .tbody').insertAdjacentHTML("beforeend", content);
		 document.querySelector('.table-wrapper .pagination').insertAdjacentHTML("beforeend", pagination);
		 document.getElementById('loading').style.display = "none";
	  }
   }).catch(error => {
	  console.log(error)
   })
}
// =============================== Pagination Click EVENT ===========================================
$(".pagination").on("click", "a", function(event){
   event.preventDefault()
   const path = $(this).attr('href')
   getContent(path)
});

// =============================== Book button click EVENT ===========================================

document.querySelector('.table-wrapper .table').addEventListener("click", function(event) {
   if(event.target.classList.contains('bookButton')){
	  let getID = event.target.getAttribute('id')
	  let assessementObjectRecordID = event.target.getAttribute('data-objectid')
	  let contactObjectRecordIDValue = contactObjectRecordID.value
	  fetch("/_hcms/api/createAssessmentAssoication", {
		 method: "post",
		 headers: {               
			"Content-Type": "application/json"
		 },
		 body: JSON.stringify({
			assessementObjectRecordID,
			contactObjectRecordIDValue
		 })
	  }).then( (response) => { 
		    return response.json()
	  }).then( data => {
		 const Label = data.association.labels[0]
		 if(Label == "alreadyBooked" ){
		 }else {
			const locationContent = data.location
			const stageContent = data.stage
			const timeOFassessment =  data.time_of_assessment
			const dateOFassessment =  data.date_of_assessment
			document.querySelectorAll('.locationContent').forEach(function(item){
			   item.innerHTML = locationContent
			})
			document.querySelectorAll('.stageContent').forEach(function(item){
			   item.textContent = stageContent
			})
			document.querySelectorAll('.timeassessment').forEach(function(item){
			   item.innerHTML = timeOFassessment
			})
			document.querySelectorAll('.dateassessment').forEach(function(item){
			   let d = new Date(dateOFassessment)
			   item.innerHTML = d.toDateString()
			})
		 }
		 fifthSlide.classList.add('active');
		 fourthSlide.classList.remove('active');
		 document.getElementById(Label).classList.add('active')
		  $("html, body").animate({ scrollTop: 0 }, "slow");
		 return false;
	  }).catch(error => {
		 console.log(error)
	  });
   }
})
// =============================== Confirm OTP EVENT ===========================================

if(document.getElementById('cnfirmOTPform')){
document.getElementById('cnfirmOTPform').addEventListener('submit', function(event){
   event.preventDefault();
   let otpValue = document.getElementById("otpinput").value;
   let contactObjectRecordIDValue = contactObjectRecordID.value
   
   if (otpValue == "" || otpValue == " "){
	  errorMeesageOTP.style.display = "block";
   }   else {
	  fetch("/_hcms/api/accesssorOTPVerification", {
		 method: "post",
		 headers: {               
			"Content-Type": "application/json"
		 },
		 body: JSON.stringify({
			otpValue,
			contactObjectRecordIDValue
		 })
	  }).then( (response) => { 
		 return response.json()
	  }).then( data => {
		 let verified = data.verified
		 if(verified){
			thirdSlide.classList.remove('active');
			fourthSlide.classList.add('active');
			errorMeesageOTP.style.display = "none";
		 } else {
			errorMeesageOTP.textContent = "Please enter the correct OTP";
			errorMeesageOTP.style.display = "block";
		 }
	  }).catch(error => {
		 console.log(error)
	  })
   }
})
}
document.getElementById("otpinput").addEventListener("focus", function(){
   errorMeesageOTP.style.display = "none"
});

// =============================== End of Confirm OTP EVENT ===========================================

