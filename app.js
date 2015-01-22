var async = require('async');
var io = require('socket.io')(8080);
var mongoose = require('mongoose').connect('mongodb://127.0.0.1/debates');
var debatesModule = require('./modules/debates/debates');
var usersModule = require('./modules/users/users');
var cookie = require('cookie');

//Js Date object
current_date = new Date(new Date().getTime() / 1000);
//Unix time without milliseconds, like in topics
current_date = new Date().getTime() / 1000;
//console.log(current_date);

//Converting topic unix time to js unix time
topic_time = new Date(1421231881 * 1000);

//console.log(topic_time);
//debatesModule.CheckTopics();

io.on('connection', function (socket) {
    
    socket.on('joinTopic', function (data) {
        
        socket.join(data.topic_id);        
    
    });
              
  /*socket.on('join', function (data) {
        
    socket.join(data.topic_id);
    var arResult = new Object();
    
     async.waterfall([
            function(callback){                
                //console.log("Получаем сообщения обсуждения об обсуждении");
                
                debatesModule.GetMessagesByTopicID( data.topic_id, function(err, doc){
                    if(err){
                        console.log('Error while saving topic message');
                    }
                    callback(null, doc);
                });
                
                callback(null, arResult);
            },
            function(arResult, callback){                
                
                callback(null, arResult);
            }
        ], function (Err, arResult) {
            //Отправляем ответ            
            
            if(!Err){
                socket.emit('messages_list', { 'messages' : arResult });
            }else{
                console.log('Main async error while saving topic message');
            }
        });
    
    
  });*/
  
  socket.on('message', function (data) {
         
    var arParams = new Object();
    var arResult = new Object();
    
        arParams.topic_id = data.topic_id;
//      arParams.Language = Socket.CookieSession.ParsedSession.InterfaceLanguage;
//      arParams.SocketID = Socket.id;
//      arParams.CookieSessionID = Socket.CookieSessionID;
        arParams.message = data.message;
        
        async.waterfall([
            function(callback){                
                //console.log("Получаем данные об обсуждении");
                callback(null, arResult);
            },
            function(arResult, callback){                
                //console.log("Проверяем, что обсуждение в статусе Processing");
                callback(null, arResult);
            },
            function(arResult, callback){
                //console.log("Сохраняем сообщение");
                debatesModule.SaveMessage( arParams, function(err, doc){
                    if(err){
                        console.log('Error while saving topic message');
                    }
                    callback(null, arParams);
                });
            }
        ], function (Err, arResult) {
            //Отправляем ответ
            if(!Err){
                io.to(arResult.topic_id).emit('message', arParams.message);
            }else{
                console.log('Main async error while saving topic message');
            }
        });        
    
  });
  
  socket.on('addMember', function (SocketData) {
           
    parsedCookieID = cookie.parse(socket.handshake.headers['cookie']).DBSession;  
    
    if(typeof(parsedCookieID) !== "undefined" || SocketData.user_id.length > 0){
    
        arParams = new Object({ _id : SocketData.user_id, lastCookieId : parsedCookieID  });

        usersModule.CheckUserAuthorization(arParams, function(arResult){

            if(arResult){
                console.log("Authorized");
            }else{
                console.log("Not authorized");
            }

        });
    
    }
    
  });

  socket.on('disconnect', function () {
    io.sockets.emit('Disconnected');
  });
});

console.log("Node.js server started at 8080 port.");