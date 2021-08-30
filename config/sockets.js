const mongoose = require('mongoose');
require("../models/Evento")
const Evento = mongoose.model('eventos')
module.exports = function (io) {
  const formatMessage = require('./messages');
  const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./users');

  const botName = 'ChatCord Bot';

  // Run when client connects
  io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Bem Vindo ao MELChat<br> Lembre-se: Respeito é bom, então não Ofendam outros usuarios<br> Não usem este chat para outros fins maldosos, ou de má carater.<br> Aproveitem!'));
      var evts;
      Evento.findOne({ _id: user.room }).then((evento) => {
        evento.chat.forEach(evt => {
          socket.emit('message', formatMessage(evt.user, evt.cont));
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao participar do evento!")
        console.log(err)
    })

      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} has joined the chat`)
        );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);
      Evento.findOne({ _id: user.room }).then((evento) => {
        evento.chat.push({user:user.username,cont: msg})
        evento.save()
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao participar do evento!")
        console.log(err)
    })
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });

}
