import express from 'express';
import http from 'http';
import socket from 'socket.io';


const app = express();
const httpServ = http.Server(app);
const io = socket(httpServ);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
});

const users = {};
const games = {};

const broadcastUsers = () => {
    Object.values(users).forEach(user => {
        socket.broadcast.to(user.id).emit('getUsers', Object.values(users).filter(subUser => subUser.id !== user.id))
    })
}

io.on("connection", function(socket) {

    socket.on('disconnect', function() {
        delete users[socket.id];
        broadcastUsers();
    })

    socket.on('addUser', (newUser) => {
        users[socket.id] = {
            name: newUser,
            id: socket.id
        };
        console.log(users);
        broadcastUsers();
    })

    socket.on('inviteUser', ({id, status}) => {
        if (status === 'accept') {
            games[id].status = 'playing';
            socket.broadcast.to(id).emit('listenInvits', {
                message: 'Let\'s get ready to rumble !',
                status: true
            });
        } else if (status === 'send') {
            games[socket.id] = {
                players: [id, socket.id],
                status: 'pending'
            }
            socket.broadcast.to(id).emit('listenInvits', {
                message: 'Player ' + users[socket.id].name + ' has challenged you, do you want to accept the duel ?',
                id: socket.id,
                status: false
            });
        } else if (status === 'decline') {
            delete games[id];
            socket.broadcast.to(id).emit('listenInvits', {
                message: 'Player declined the invitation',
                status: false,
            });
        }
    })

    broadcastUsers();
})

httpServ.listen(3000);

app.listen(3400, function() {
    console.log('I\'m glad that he is gone ! Listen to this on port 3400 !')
})
