
Meteor.startup(function(){
    process.env.MAIL_URL = "smtp://postmaster@sandboxec10ef4a57e140218e8551fbef2e5c8f.mailgun.org:0a552af27cec37e3a4d98acf68ed31af@smtp.mailgun.org:587";

	Meteor.methods({
	  sendtextToEmail: function (text) {
		 var result = Email.send({
			to: "rgilbile@officebrain.com",
			from: "rgilbile@officebrain.com",
			subject: "Chat Email",
			text: text
		 });
     console.log('REsult '   + result);
		 return result;
	  },
	  emailConversation: function (to,message) {
		 var result = Email.send({
			to: to,
			from: "rgilbile@officebrain.com",
			subject: "Conversation Email",
			text: message
		 });
		 return result;
	  }
	});

   ChatRooms.allow({
        'insert':function(userId,doc){
          return true;
        },
        'update':function(userId,doc,fieldNames, modifier){
            return true;
        },
        'remove':function(userId,doc){
            return false;
        }
    });
    audioCall.allow({
         'insert':function(userId,doc){
           return true;
         },
         'update':function(userId,doc,fieldNames, modifier){
             return true;
         },
         'remove':function(userId,doc){
             return false;
         }
     });
     videoCall.allow({
          'insert':function(userId,doc){
            return true;
          },
          'update':function(userId,doc,fieldNames, modifier){
              return true;
          },
          'remove':function(userId,doc){
              return false;
          }
      });
    Messages.allow({
         'insert':function(userId,doc){
           return true;
         },
         'update':function(userId,doc,fieldNames, modifier){
             return true;
         },
         'remove':function(userId,doc){
             return false;
         }
     });

});
const Messages = new Mongo.Collection('unreadMessage');

Accounts.onCreateUser( function (options, user) {
    user.roles = "user";
    if ( options.profile )
      user.profile = options.profile;
    return user;
});


YourFileCollection =new FS.Collection('uploads',{
  //stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/chatDemo/public/uploads/user/'})]
  stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/test/upload/'})]
});
/*
YourFileCollection.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  },
  download: function (userId, doc) {
    return true;
  }
});*/
