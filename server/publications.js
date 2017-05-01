Meteor.publish("chatrooms",function(){
    return ChatRooms.find({});
});
Meteor.publish("onlusers",function(){
    return Meteor.users.find({"status.online":true},{username:1});
})
Meteor.publish('unreadMessage',function(userId){
//  var result =  ChatRooms.find({'read':'false',sendTo: userId}).count();
//  console.log(' >>  ' + userId +  ' ' +   result);
    var res=ChatRooms.find({chatIds:{$all:[userId]}});
return res;
});
Meteor.publish("audioCall",function(){
    return audioCall.find({});
});
Meteor.publish("videoCall",function(){
    return videoCall.find({});
});
/*
Meteor.publish("YourFileCollection",function(){
    return YourFileCollection.find({});
});
*/
