const OBJECT_ACCESS_TOKEN = process.env.CONATCT_ACCESS_TOKEN;
const LIST_ACCESS_TOKEN = process.env.ASSESSORLIST_TOKEN;
const axios = require('axios'); 

exports.main = async (context, sendResponse) => {
   const Email = context.body.email;
   console.log(Email)
   const userData ={
	  limit: 1,
	  sorts: [
		 "DESCENDING"
	  ],
	  properties: [
		 "email"
	  ],
	  filterGroups: [
		 {
			filters: [
			   {
				  propertyName: "email",
				  value: Email,
				  operator: "EQ"
			   }
			]
		 }
	  ]
   }
   const config = {
	  method: 'POST',
	  url: `https://api.hubapi.com/crm/v3/objects/contacts/search`,
	  headers: {
		 'Authorization': `Bearer ${LIST_ACCESS_TOKEN}`,
		 'Content-Type': 'application/json'
	  },
	  data: userData
   }

   try{
	  const getUserResponse = await axios(config) 
	  const result = getUserResponse.data.results.length

	  if(result >= 1){
		 const getUserID = getUserResponse.data.results[0].id
		 console.log("getUserID ", getUserID)
		 const checkConfig = {
			method: 'GET',
			url: ` https://api.hubapi.com/crm/v3/lists/records/0-1/${getUserID}/memberships`,
			headers: {
			   'Authorization': `Bearer ${LIST_ACCESS_TOKEN}`,
			   'Content-Type': 'application/json'
			}
		 }
		 try{
			const checkUserResponse = await axios(checkConfig) 
			const allList = checkUserResponse.data.results
			const userExist = allList.filter( item => item.listId == "11480" )
			console.log("userExist ", userExist)
			if(userExist.length >=1 ){
			   sendResponse({ body: { verifyUser: true , label: "inthelist", UserID: getUserID  }, statusCode: 200 });
			} else {
			   sendResponse({ body: { verifyUser: false, label: "notinlist"  }, statusCode: 200 });
			}
		 }catch(error){
			sendResponse({ body: { userDataError: error }, statusCode: 200 }); 
		 }
	  } else {
		 sendResponse({ body: { verifyUser: false, label: "notinlist"  }, statusCode: 200 });
	  }


   }catch(error){
	  sendResponse({ body: { userGet: error }, statusCode: 500 });
   }

}
