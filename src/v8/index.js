const io = require("socket.io-client");
const socket = io("http://localhost:8001");

const vm = require('vm');
socket.on("connect", () => {
    socket.emit("state", {state: 'STATE_IDLE'});
});

socket.on("run", async ({script}) => {
    try{
        socket.emit("state", {state: 'STATE_RUNNING'});
        var sandbox = {
            console: console,
            setTimeout: setTimeout
        };
        await vm.runInNewContext(script, sandbox);
        await delay(100);
        socket.emit("state", {state: 'STATE_COMPLETE'});

    } catch(err) {
        socket.emit("err", err.toString());
        await delay(100);
        socket.emit("state", {state: 'STATE_IDLE'});
    } 
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


