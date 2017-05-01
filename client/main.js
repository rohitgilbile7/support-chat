Accounts.ui.config({
   passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Tracker.autorun(function(){
    Meteor.subscribe("chatrooms");
    Meteor.subscribe("onlusers");
    Meteor.subscribe("unreadMessage",Meteor.userId());
    Meteor.subscribe("audioCall");
    Meteor.subscribe("videoCall");
//    Meteor.subscribe("YourFileCollection");


});

Template.sidebar.helpers({
    'onlusr':function(){
        return Meteor.users.find({ "status.online": true , _id: {$ne: Meteor.userId()} });
    },
    'msg':function(){

      // console.log( ChatRooms.find({ "messages.sendTo":{"$in":[Meteor.userId()]}}) + '************').count();
  //      const topPosts =  ChatRooms.find({ "messages.sendTo":{"$in" :[Meteor.userId()]}});
      //  const topPosts =  ChatRooms.find({ "messages.sendTo":{"$elemMatch":{sendTo: Meteor.userId()}}}).count();

    }
});
Template.userSidebar.helpers({
    'onlineSupport':function(){
        return Meteor.users.find({ "status.online": true , "roles": 'support', _id: {$ne: Meteor.userId()} });
    }
});
Template.userSidebar.events({
    'click .user':function(e){
        Session.set('currentId',this._id);
        Session.set('username',this.username);
        var res=ChatRooms.findOne({chatIds:{$all:[this._id,Meteor.userId()]}});
        if(res)
        {
            //already room exists
            Session.set("roomid",res._id);
        }
        else{
            //no room exists
            var newRoom= ChatRooms.insert({chatIds:[this._id , Meteor.userId()],messages:[]});
            Session.set('roomid',newRoom);
        }
        $('.user').removeClass('active');
        $('#' + this._id).addClass('active');
        $('div[class=chat-with]').text($(e.target).data('name'));
        var avatar = $(e.target).attr('src');
        // $('.chat-header img').attr("src",avatar).show();
        var div = $("#chat_area");
  //      div.scrollTop(div.prop('scrollHeight'));
        // console.log('scrollTop' +div);
        setTimeout(function(){div.scrollTop(div.prop('scrollHeight'));},1000);
      //  console.log('calle console');

    },
    'click .audioCall':function(e){
      // $('.generateAudioKey').show();
       Modal.show("audioTemplate", {}, {
         backdrop: 'static'
       });
       var text = randomString();
       $('#audioKey').val(text);
       loadAudio();
    },
    "click #makeCall": function (e) {
      Modal.show("videoTemplate", {}, {
        backdrop: 'static'
      });
  //    var text =  randomString();
  //  var text =   $('#makeCall').attr('attr-peerId');

//      $('#videoKey').val(text);
    //  $('#endCall').show();
    },
    "click #endCall": function () {
      window.localStream.stop();
      window.currentCall.close();
    },
     'click .shareScreen':function(){
        Modal.show("screenShareTemplate", {}, {
          backdrop: 'static'
        });
          $('.experiment').show();
        var text = randomString();
        $('#room-id').val(text);
      }

});

Template.main.helpers({
  'role':function(){
    if(Meteor.user().roles){
      return Meteor.user().roles;
    }
    else{
      return false;
    }
  }
});

Template.sidebar.events({
    'click .user':function(e){
      //alert(this._id + "  " + Meteor.userId());
        Session.set('currentId',this._id);
        Session.set('username',this.username);
        var res=ChatRooms.findOne({chatIds:{$all:[this._id,Meteor.userId()]}});
        if(res)
        {
            //already room exists
            Session.set("roomid",res._id);
        }
        else{
            //no room exists
            var newRoom= ChatRooms.insert({chatIds:[this._id , Meteor.userId()],messages:[]});
            Session.set('roomid',newRoom);
        }
        $('.user').removeClass('active');
        $('#' + this._id).addClass('active');
        $('div[class=chat-with]').text($(e.target).data('name'));
        var avatar = $(e.target).attr('src');
        // $('.chat-header img').attr("src",avatar).show();
        var div = $("#chat_area");
  //      div.scrollTop(div.prop('scrollHeight'));
        // console.log('scrollTop' +div);
        setTimeout(function(){div.scrollTop(div.prop('scrollHeight'));},1000);
      //  console.log('calle console');
    },
    'click .audioCall':function(e){
      // $('.generateAudioKey').show();

       Modal.show("audioTemplate", {}, {
         backdrop: 'static'
       });
       var text = "";
       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

       for( var i=0; i < 8; i++ )
           text += possible.charAt(Math.floor(Math.random() * possible.length));

       $('#audioKey').val(text);
       loadAudio();
    },
    "click #makeCall": function () {
      Modal.show("videoTemplate", {}, {
        backdrop: 'static'
      });
    //  var text =  randomString();
    //  var text = $('#makeCall').attr('attr-peerId');
    //  $('#videoKey').val(text);

    },
    "click #endCall": function () {
      window.currentCall.close();

    },
    'click .shareScreen':function(){
      Modal.show("screenShareTemplate", {}, {
        backdrop: 'static'
      });
      $('.experiment').show();
      var text = randomString();
      $('#room-id').val(text);
    }

});
Template.screenShareTemplate.events({
  'click .closeshareScreen':function(){
    Modal.hide();

  },
  'click #open-room':function(){
    //disableInputButtons();
    connection.open($('#room-id').val(), function() {
        showRoomURL(connection.sessionid);
    });
  },
  'click #join-room':function(){
    //disableInputButtons();
    connection.join(document.getElementById('room-id').value);
  },
  'click #open-or-join-room':function(){
    disableInputButtons();
    connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExists, roomid) {
        if(!isRoomExists) {
            showRoomURL(roomid);
        }
    });
  }
});

Template.videoTemplate.events({
  'click .closeVideocall':function(){
    Modal.hide();
    window.localStream.stop();
      mediaStream.stop();

  },
  'click #submitVideoKey':function(){
      var name = Meteor.user().username;
      var from = Meteor.userId();
      var to = Session.get('currentId');
       var pending =  'pending';
       var key = $('#videoKey').val();
       if(key!== '') {
         var de=videoCall.insert({
           fromcall:from,
           tocall:to,
           key:key,
           status:pending,
           createdAt: Date.now()
         });
         // send message to user
         var text = 'Video call request Private Id: '  + key;
         var de=ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
          name: name,
          text: text,
          image: '',
          createdAt: Date.now(),
          sendFrom: from,
          sendTo: to,
          read: false
         }}});
         alert('Video call request send successfully!');
         $('.generatevideoKey').hide();

         $('#videocontainer').show();

    }
       else{
         alert('Please enter Key');
       }
  },
  'click #joinVideoKey':function(){
    var name = Meteor.user().username;
    var to = Meteor.userId();
    var from = Session.get('currentId');
    var key = $('#videoKey').val();
   var response = videoCall.find({ "fromcall": from,'tocall':to,'status':'pending','key':key});
     if(response){
       $('#videocontainer').show();
       $('.generatevideoKey').hide();
      //  var user = this;

       var outgoingCall = peer.call(key, window.localStream);
       window.currentCall = outgoingCall;
       outgoingCall.on('stream', function (remoteStream) {
         window.remoteStream = remoteStream;
         $("#theirVideo").attr('src',remoteStream);
         var video = document.getElementById("theirVideo");
         video.src = URL.createObjectURL(remoteStream);
       });
     }
     else{
       alert('Key Not Found');
     }
  },
  "click #endCall": function () {
      alert('Phone call is hangup');
      Modal.hide();
      window.localStream.stop();
      mediaStream.stop();
  }
});
Template.audioTemplate.events({
  'click .closeAudiocall':function(){
    Modal.hide();
  },
  'click #submitKey':function(){
    var name = Meteor.user().username;
    var from = Meteor.userId();
    var to = Session.get('currentId');
     var pending =  'pending';
     var key = $('#audioKey').val();
     if(key!== '') {
       var de=audioCall.insert({
         fromcall:from,
         tocall:to,
         key:key,
         status:pending,
         createdAt: Date.now()
       });
       // send message to user
       var text = 'Audio call request Private Id:'  + key;
       var de=ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
        name: name,
        text: text,
        image: '',
        createdAt: Date.now(),
        sendFrom: from,
        sendTo: to,
        read: false
       }}});
       alert('Audio call request send successfully');
       $('.audioDiv').show();
     }
     else{
       alert('Please enter Key');
     }
  },
  'click #joinKey':function(){
    var name = Meteor.user().username;
    var to = Meteor.userId();
    var from = Session.get('currentId');
    var key = $('#audioKey').val();
   var response = audioCall.find({ "fromcall": from,'tocall':to,'status':'pending','key':key});
     if(response){
       $('.audioDiv').show();
     }
     else{
       alert('Key Not oFound');
     }
  }
});
Template.messages.helpers({
    'msgs':function(){
        var result=ChatRooms.findOne({_id:Session.get('roomid')});
        if(result){
          return result.messages;
        }
    }
});

Template.messages.events = {
  'click #sendMessage' : function (event,template) {
      if (Meteor.user())
        {
            var imageSrc = $('#file').text();
            var name = Meteor.user().username;
            var message = document.getElementById('message');
            if(imageSrc == ' '){
              image = 'noimage';
            }
            else{
              image = imageSrc.slice(0, -1);
            }
            sendTo = Session.get('currentId');
            sendFrom = Meteor.userId();
            if (message.value !== '' || image != 'noimage') {
                var de=ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
                 name: name,
                 text: message.value,
                 image: image,
                 createdAt: Date.now(),
                 sendFrom: sendFrom,
                 sendTo: sendTo,
                 read: false
                }}});
                document.getElementById('message').value = '';
                message.value = '';
                $('#file').text('');
                $('#imageName').html('');
				       // $('#imagePreview').attr('src','');
				        $('.preview').hide();
		       }
        }
        else
        {
           alert("login to chat");
        }
    },
    'change .file-uploads': function (event, template) {
    //  console.log("uploading...")
  var  src = '';
      FS.Utility.eachFile(event, function (file) {
        console.log("each file...");
        var yourFile = new FS.File(file);
      //  console.log(yourFile);
        YourFileCollection.insert(yourFile, function (err, fileObj) {

          console.log("callback for the insert, err: ", err);
          if (!err) {
      //      console.log("inserted without error");
  //    console.log(fileObj.name() + '  ffsdfds');
            var src= 'http://127.0.0.1/test/upload/uploads-'+fileObj._id +'-' +fileObj.name();
            var data = imageJson.push(src);
            $('#file').append(src + ",");
          //  $('#imagePreview').attr('src',src);
            $('#imageName').append("<span id="+fileObj._id+">"+ fileObj.name() +" <a href='"+src+"' target='_blank' id="+fileObj._id+" class=''>View</a>   <a href='javascript:void(0)' id="+fileObj._id+" class='deleteImage'>Delete</a> <br/></span> " );
            $('.preview').show();
          }
          else {
            console.log("there was an error", err);
          }
        });
      });
    },
	'click .deleteImage':function(e){
    var id = $(e.target).attr('id');
		//$(e.target).closest('span').remove();
    $('span[id='+id+']').remove();
	},
	'click .sendinEmail': function(e){
		var textToEmail = $(e.target).data('message');
		var messageFrom = $(e.target).closest("a").attr('class');
		var sendMessage = messageFrom + ': '  + textToEmail;
		Meteor.call('sendtextToEmail',sendMessage,function(err, response) {
			if(!err){
				alert('email send successfully!');
			}
      else{
        alert('Error: ' + err);
      }
		});
	},
	'click .emailConversation': function(e){
		Modal.show("sendConversation", {}, {
			backdrop: 'static'
		});
	},
    'click .copyText':function(e){
      var text = $(e.target).data('message');
      var copyText = document.createElement("input");
      document.body.appendChild(copyText);
//    $(copyText).css('display','none');
      copyText.setAttribute("id", "copyTextId");
      document.getElementById("copyTextId").value = text;
      document.getElementById("copyTextId").select();
      console.log(document.getElementById("copyTextId").select());
      document.execCommand('copy');
      document.body.removeChild(copyText);
      alert('Message copied to clipboard ' + text);
  }
}

Template.registerHelper( 'equals', ( a1, a2 ) => {
  return a1 === a2;
});
Template.registerHelper( 'Imageequals', ( a1 ) => {
  return a1 != 'noimage';
});
Template.registerHelper( 'userroles', (roles ) => {

   if(roles === 'support'){
     return true;
   }
   else{
     return false;
   }
});
Template.registerHelper('timeFormat', ( timestamp ) => {
  if ( timestamp ) {
    let length = timestamp.toString().length;
    if ( length === 10 ) {
      return moment.unix( timestamp ).format( 'MMMM Do, YYYY' );
    } else {
      return moment.unix( timestamp / 1000 ).format( 'MMMM Do, h:mm' );
    }
  }
});
//Template.tags.helpers({
Template.registerHelper('stringToArray', ( input ) => {
    var tagArray = [];
    tagArray = input.split(',');
    return tagArray;
});
// Template.registerHelper('isEmpty',function(item) {
//   return item === '';
// });
// Handlebars.registerHelper("isNull", function(value) {
//   return value === null;
// });
if (Meteor.isClient) {
  var imageJson =new Array();
  Meteor.subscribe("fileUploads");
  // Template.body.onRendered(renderCallTemplate);

  YourFileCollection =new FS.Collection('uploads',{
     stores: [new FS.Store.FileSystem('uploads',{path:'/var/www/html/test/upload/'})]
  //    stores: [new FS.Store.FileSystem('uploads',{path:'D:/wamp/www/test/upload'})]
  });

  FS.debug = true;

  Template.videoTemplate.onCreated(function () {
  //  Meteor.subscribe("presences");
//    Meteor.subscribe("users");

    window.peer = new Peer({
      key: '2p9ffp7ol6p3nmi',  // change this key
      debug: 3,
      config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
      ]}
    });

    // This event: remote peer receives a call
    peer.on('open', function () {
      $('#myPeerId').text(peer.id);
      $('#myPeerId').attr('attr-peerId',peer.id);
    //  alert(peer.id);
      $('#videoKey').val(peer.id);
      // update the current user's profile
    /*  Meteor.users.update({_id: Meteor.userId()}, {
        $set: {
          profile: { peerId: peer.id}
        }
      }); */
    });

    // This event: remote peer receives a call
    peer.on('call', function (incomingCall) {

      window.currentCall = incomingCall;
      incomingCall.answer(window.localStream);
      incomingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        var video = document.getElementById("theirVideo")
        video.src = URL.createObjectURL(remoteStream);
      });
    });

    navigator.getUserMedia = ( navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia );

    // get audio/video
    navigator.getUserMedia({audio:true, video: true}, function (stream) {
      //display video
      var video = document.getElementById("myVideo");
      video.src = URL.createObjectURL(stream);
      window.localStream = stream;
    }, function (error) { console.log(error); }
    );

  });

  // start Video calling
  /* Meteor.startup(function() {
   Meteor.VideoCallServices.onReceivePhoneCall = function() {
     Modal.show("chatModal", {}, {
       backdrop: 'static'
     });
   }
   Meteor.VideoCallServices.onCallTerminated = function() {
     console.log(this);
     Modal.hide();
   }
   Meteor.VideoCallServices.onCallIgnored = function() {
     Modal.hide();
     alert("call ignored");
   }
   Meteor.VideoCallServices.onWebcamFail = function(error) {
     alert("Please connect webcam", error);
      Modal.hide();
     console.log("Failed to get webcam", error);
   }
   Meteor.VideoCallServices.elementName = "sidebar";
   Meteor.VideoCallServices.STUNTURN = {
     "iceServers": [{
       url: 'stun:stun01.sipphone.com'
     }, {
       url: 'stun:stun.ekiga.net'
     }, {
       url: 'stun:stun.fwdnet.net'
     }, {
       url: 'stun:stun.ideasip.com'
     }, {
       url: 'stun:stun.iptel.org'
     }, {
       url: 'stun:stun.rixtelecom.se'
     }, {
       url: 'stun:stun.schlund.de'
     }, {
       url: 'stun:stun.l.google.com:19302'
     }, {
       url: 'stun:stun1.l.google.com:19302'
     }, {
       url: 'stun:stun2.l.google.com:19302'
     }, {
       url: 'stun:stun3.l.google.com:19302'
     }, {
       url: 'stun:stun4.l.google.com:19302'
     }, {
       url: 'stun:stunserver.org'
     }, {
       url: 'stun:stun.softjoys.com'
     }, {
       url: 'stun:stun.voiparound.com'
     }, {
       url: 'stun:stun.voipbuster.com'
     }, {
       url: 'stun:stun.voipstunt.com'
     }, {
       url: 'stun:stun.voxgratia.org'
     }, {
       url: 'stun:stun.xten.com'
     }, {
       url: 'turn:numb.viagenie.ca',
       credential: 'muazkh',
       username: 'webrtc@live.com'
     }, {
       url: 'turn:192.158.29.39:3478?transport=udp',
       credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
       username: '28224511:1379330808'
     }, {
       url: 'turn:192.158.29.39:3478?transport=tcp',
       credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
       username: '28224511:1379330808'
     }]

   };
   Meteor.VideoCallServices.setRingtone('/nokia.mp3');

 });

 Template.sidebar.events({
 "click #answer": function() {
   Meteor.VideoCallServices.answerCall();
 },
 "click .userIDLink": function(event) {
   Modal.show("chatModal", {
     callee: this._id,
     calleename: this.username,
     isCaller: true
   }, {
     backdrop: 'static',
     keyboard: false
   });
 },
 'click .audioCall':function(e){
    $('.generateAudioKey').show();
 }
});
//{_id:{$ne:Meteor.userId()}}
Template.sidebar.helpers({
 check(asd) {
   console.log(asd);
 },
 hasUsers() {
   return Meteor.users.find({
     _id: {
       $ne: Meteor.userId()
     },
     "status.online": true
   }).count() > 0;
 },
 getUsers() {
   return Meteor.users.find({
     _id: {
       $ne: Meteor.userId()
     },
     "status.online": true
   });
 },
 getStatus() {
   let callState = Session.get("callState");
   if (callState)
     return callState.message;
 }
})
Template.sidebar.onRendered(function() {
 // Meteor.subscribe("userList");
  Meteor.subscribe("onlusers");


})
Template.chatModal.onCreated(function() {
 Meteor.VideoCallServices.setLocalWebcam("videoChatCallerVideo");
 Meteor.VideoCallServices.setRemoteWebcam("videoChatAnswerVideo");
})
Template.chatModal.onRendered(function() {

 let self = this;
 const receiving = Meteor.VideoCallServices.VideoChatCallLog.findOne({
   $or: [{
     status: "C",
   }, {
     status: "R",
   }],
   callee_id: Meteor.userId()
 });
 if (!receiving)
   Meteor.VideoCallServices.loadLocalWebcam(true, function() {
     console.log("callback");
     Meteor.VideoCallServices.callRemote(self.data.callee)
   });


})
Template.chatModal.onDestroyed(function() {});

Template.chatModal.events({
 "click #answerCall" (event, template) {
   Meteor.VideoCallServices.loadLocalWebcam(false, function() {
     Meteor.VideoCallServices.answerCall();
   });
 },
 "click #ignoreCall" (event, template) {
   Meteor.VideoCallServices.ignoreCall();
   Modal.hide(template);
 },
 "click #closeChat": function(event, template) {
   Meteor.VideoCallServices.callTerminated();
   //Modal.hide(template);
   Modal.hide();
 }
})
Template.chatModal.helpers({
 getCallerName() {
   let callData = Meteor.VideoCallServices.VideoChatCallLog.findOne({
     _id: Session.get("currentPhoneCall")
   });
   return Meteor.users.findOne({
     _id: callData.caller_id
   }).username;
 },
 getStatus() {
   let callState = Session.get("callState");
   if (callState)
     return callState.message;
 },
 incomingPhoneCall() {
   return Meteor.VideoCallServices.VideoChatCallLog.findOne({
     $or: [{
       status: "C",
     }, {
       status: "R",
     }],
     callee_id: Meteor.userId()
   });
 }
}) */
  // ends video calling

Template.sendConversation.events({
	'click #sendChatConversation':function(event){
		var toEmail = $('#emailTo').val();
  	var result=ChatRooms.findOne({_id:Session.get('roomid')});
        if(result){
          var message = '';
		  //return result.messages;
			for(var k in result.messages) {
				 message += result.messages[k].name +':' +result.messages[k].image + ' ' + result.messages[k].text + '\n';
			}
    	Meteor.call('emailConversation',toEmail,message,function(err, response) {
			Modal.hide();
			if(!err){
				alert('email send successfully!');
			}
			else{
				console.log(err);
			}
    });
        }
	},
	'click .closeSendChat':function(){
		Modal.hide();
	}
});

//screen sharing start

var connection = new RTCMultiConnection();
// by default, socket.io server is assumed to be deployed on your own URL
//    connection.socketURL = '/';
// comment-out below line if you do not have your own socket.io server
 connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'screen-sharing-demo';
connection.session = {
    screen: true,
    oneway: true
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};
connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
    connection.videosContainer.appendChild(event.mediaElement);
    event.mediaElement.play();
    setTimeout(function() {
        event.mediaElement.play();
    }, 5000);
};
// Using getScreenId.js to capture screen from any domain
// You do NOT need to deploy Chrome Extension YOUR-Self!!
connection.getScreenConstraints = function(callback) {
    getScreenConstraints(function(error, screen_constraints) {
        if (!error) {
            screen_constraints = connection.modifyScreenConstraints(screen_constraints);
            callback(error, screen_constraints);
            return;
        }
        throw error;
    });
};
function disableInputButtons() {
    // document.getElementById('open-or-join-room').disabled = true;
    document.getElementById('open-room').disabled = true;
    document.getElementById('join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
}
// ......................................................
// ......................Handling Room-ID................
// ......................................................
function showRoomURL(roomid) {
    var roomHashURL = '#' + roomid;
    var roomQueryStringURL = '?roomid=' + roomid;
    var html = '<h2>Unique URL for your room:</h2><br>';
    html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';
    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;
    roomURLsDiv.style.display = 'block';
}
(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;
    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();
var roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
    roomid = localStorage.getItem(connection.socketMessageEvent);
} else {
    roomid = connection.token();
}
/*
document.getElementById('room-id').value = roomid;
document.getElementById('room-id').onkeyup = function() {
    localStorage.setItem(connection.socketMessageEvent, this.value);
};*/
var hashString = location.hash.replace('#', '');
if(hashString.length && hashString.indexOf('comment-') == 0) {
  hashString = '';
}
var roomid = params.roomid;
if(!roomid && hashString.length) {
    roomid = hashString;
}
if(roomid && roomid.length) {
    document.getElementById('room-id').value = roomid;
    localStorage.setItem(connection.socketMessageEvent, roomid);
    // auto-join-room
    (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function(isRoomExists) {
            if(isRoomExists) {
                connection.join(roomid);
                return;
            }
            setTimeout(reCheckRoomPresence, 5000);
        });
    })();
    disableInputButtons();
}
// screen sharing ends

}

function loadAudio(){
  var video, localMediaStream;

  window.URL = window.URL || window.webkitURL;
  navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia;

  video = document.querySelector('video');
  var capture = document.getElementById('capture');
  var stop = document.getElementById('stop');

  capture.addEventListener('click', function () {
      navigator.getUserMedia({audio: true, video: false}, function(stream) {
          localMediaStream = stream;
          video.src = window.URL.createObjectURL(stream);
      }, function(e) {
          console.log(e);
      });
  });

  stop.addEventListener('click', function(e) {
      video.pause();
      localMediaStream.stop();
  });

}
function randomString(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 8; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

return text;
}
