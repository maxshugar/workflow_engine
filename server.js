const localSocket = require("socket.io")(9000, {
  cors: {
    origin: "*",
  },  
});

const externalSocket = require("socket.io")(8000, {
    cors: {
        origin: "*",
    },  
});

const spawn = require('child_process').spawn;

let python = spawn("python", ["-u", `debugger.py`]);

const commands = {
    STEP: 'STEP',
    CONTINUE: 'CONTINUE',
    ABORT: 'ABORT'
}

localSocket.on("connection", (localSocket) => {
    console.log('localsocket connected')
    localSocket.emit("getState");
    localSocket.on("state", (state) => {
        externalSocket.emit("state", state);
    })
    externalSocket.on("connection", (externalSocket) => {
        externalSocket.on("run", (data) => {  
            localSocket.emit("run", data);
            localSocket.emit("getState");
        });   
        externalSocket.on("debug", (data) => { 
            localSocket.emit("debug", data); 
            localSocket.emit("getState");
        }); 
        externalSocket.on("abort", () => {
            console.log('abort command recieved');
            python.kill(); 
            python = spawn("python", ["-u", `debugger.py`]); 
            
        });  
        externalSocket.on("getState", () => {    
            localSocket.emit("getState"); 
        });   
    });  
  
    python.stdout.on("data", function (data) {
        externalSocket.emit("data", {ok: true, res: data.toString()});
    });               
    python.stderr.on('data', (data) => { 
        console.log(`error:\n${data}`);
    }); 
    python.on('exit', function (code) {
        externalSocket.emit("state", {state: 'STATE_ABORTED', code});
    }); 
   
})

