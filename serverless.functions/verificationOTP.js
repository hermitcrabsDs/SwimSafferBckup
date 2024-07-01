const OBJECT_ACCESS_TOKEN = process.env.CONATCT_ACCESS_TOKEN;
const LIST_ACCESS_TOKEN = process.env.LIST_ACCESS_TOKEN
const axios = require('axios'); 

exports.main = async (context, sendResponse) => {
   
   const verfiedOTP = context.body.otpValue
   const contactObjectRecordID = context.body.contactObjectRecordIDValue
   
   console.log(contactObjectRecordID)
   
   
   const config = {
	  method: 'GET',
	  url: `https://api.hubapi.com/crm/v3/objects/contacts/${contactObjectRecordID}?properties=otp&archived=false`,
	  headers: {
		 'Authorization': `Bearer ${OBJECT_ACCESS_TOKEN}`,
		 'Content-Type': 'application/json'
	  }
   }
   
   try{
	  const getUserOTPResponse = await axios(config) 
	  const data = getUserOTPResponse.data.properties.otp
	  console.log(data)
	  
	  if(parseInt(data) == parseInt(verfiedOTP)){
		 sendResponse({ body: { verified: true }, statusCode: 500 });
	  } else {
		 sendResponse({ body: { verified: false }, statusCode: 200 });
	  }
	  
   }catch(error){
	  sendResponse({ body: { userGet: error }, statusCode: 500 });
   }
   
}
