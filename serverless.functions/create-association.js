const OBJECT_ACCESS_TOKEN = process.env.OBJECT_ACCESS_TOKEN;
const axios = require('axios'); 
exports.main = async (context, sendResponse) => {
   const contactObjectRecordID = context.body.contactObjectRecordIDValue
   const assessementObjectRecordID = context.body.assessementObjectRecordID
   const URL = `https://api.hubapi.com/crm/v4/objects/2-31210998/${assessementObjectRecordID}/associations/0-1/${contactObjectRecordID}`
   console.log("contactObjectRecordID", contactObjectRecordID)
   console.log("assessementObjectRecordID", assessementObjectRecordID)
   
   if(contactObjectRecordID != 0  ){
	  let number_of_assessors;
	  let hs_object_id;
	  let stage;
	  let location;
	  let date_of_assessment;
	  let time_of_assessment;
	  let title;
	  //    date_of_assessment,location,stage,title,time_of_assessment,number_of_assessors,hs_object_id
	  try{
		 var config = {
			method: 'GET',
			url: `https://api.hubapi.com/crm/v3/objects/2-31210998/${assessementObjectRecordID}?properties=number_of_assessors,stage,location,date_of_assessment,time_of_assessment&archived=false`,
			headers: {
			   'Authorization': `Bearer ${OBJECT_ACCESS_TOKEN}`,
			   'Content-Type': 'application/json'
			}
		 }

		 const assessResponse = await axios(config)
		 number_of_assessors = assessResponse.data.properties.number_of_assessors;
		 hs_object_id = assessResponse.data.properties.hs_object_id;
		 stage = assessResponse.data.properties.stage;
		 location = assessResponse.data.properties.location;
		 date_of_assessment  = assessResponse.data.properties.date_of_assessment;
		 time_of_assessment = assessResponse.data.properties.time_of_assessment;
		 title = assessResponse.data.properties.title;

		 if(number_of_assessors > 0 ){
			// 		 ===================== Confrim section =====================
			try{
			   createAssociation(246)
			   console.log("number_of_assessors greaterthan 0")
			} catch(error){
			   sendResponse({ body: { second: error }, statusCode: 200 });
			}
		 } else if (number_of_assessors <= 0  && number_of_assessors >= -1 ) {
			// 		 ===================== Waiting section =====================
			try{
			   createAssociation(248)
			   console.log("number_of_assessors lessthan 0")
			} catch(error){
			   sendResponse({ body: { second: error }, statusCode: 200 });
			}
		 } else {
			console.log("number_of_assessors lessthan -1")
			// 		 ===================== Denied section =====================
			sendResponse({ body: { status: "full", association: { labels: ["Denied"] }   }, statusCode: 200 });
		 }

	  } catch(error){
		 console.log("First level error ", error)	  
		 sendResponse({ body: { first: error }, statusCode: 200 });
	  }
	  // ========================= Create Association ===================================================
	  async function createAssociation(ASSID){
		 const inputs = {
			inputs: [
			   {
				  "id": assessementObjectRecordID,
				  "after": "0"
			   }
			]
		 }
		 const checkAssociation = {
			method: 'POST',
			url: "https://api.hubapi.com/crm/v4/associations/2-31210998/0-1/batch/read",
			headers: {
			   'Authorization': `Bearer ${OBJECT_ACCESS_TOKEN}`,
			   'Content-Type': 'application/json'
			},
			data: inputs
		 }
		 let checkAssociationRes;
		 try{
			checkAssociationRes = await axios(checkAssociation) 
			const dataIncludes = checkAssociationRes.data.results
			console.log("dataIncludes ",  dataIncludes.length)

			if(dataIncludes.length > 0) {
			   const assoResult = checkAssociationRes.data.results[0].to
			   const resultData = assoResult.filter( (item) => item.toObjectId == contactObjectRecordID )
			   console.log("resultData ", resultData.length)
			   if(resultData.length > 0){
				  sendResponse({ body: { status: "user already exist", association: { labels: ["alreadyBooked"] }   }, statusCode: 200 });
			   } else {
				  afterAossociationCheck(ASSID)
			   }
			} else {
			   afterAossociationCheck(ASSID)
			}
		 } catch(error ){
			sendResponse({ body: { UserAlreadyAssociatedError: checkAssociationRes.data }, statusCode: 500 });
		 }
	  }
	  //    ========================= Create association =========================================
	  async function afterAossociationCheck(ASSID){
		 const data = [
			{
			   "associationCategory": "USER_DEFINED",
			   "associationTypeId": ASSID
			}
		 ]
		 const config = {
			method: 'PUT',
			url: URL,
			headers: {
			   'Authorization': `Bearer ${OBJECT_ACCESS_TOKEN}`,
			   'Content-Type': 'application/json'
			},
			data: data
		 }
		 try {
			const associationResponse = await axios(config) 
			if(associationResponse.data){
			   console.log("inside data");

			   let updataAssessor = parseInt(number_of_assessors) - 1 ;
			   console.log("updataAssessor", updataAssessor)
			   const updatedData = {
				  properties: {
					 "number_of_assessors": updataAssessor
				  }
			   }
			   var updateRecord = {
				  method: 'PATCH',
				  url: `https://api.hubapi.com/crm/v3/objects/2-31210998/${assessementObjectRecordID}`,
				  headers: {
					 'Authorization': `Bearer ${OBJECT_ACCESS_TOKEN}`,
					 'Content-Type': 'application/json'
				  },
				  data: updatedData
			   }
			   try{
				  const recoredUpdated = await axios(updateRecord) 
				  sendResponse({ body: { association: associationResponse.data, stage, location, time_of_assessment, date_of_assessment , title }, statusCode: 200 });
			   } catch(error){
				  sendResponse({ body: { associationUpdateError: error }, statusCode: 500 });
			   }
			}
		 } catch(error){
			sendResponse({ body: { funerror: error }, statusCode: 500 });
		 }

	  } 

   } else {
	  sendResponse({ body: { userNotExist: true }, statusCode: 200 });
   }
}

