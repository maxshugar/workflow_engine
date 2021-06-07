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

const python = spawn("python", ["-u", `debugger.py`]);

const commands = {
    STEP: 'STEP',
    CONTINUE: 'CONTINUE',
    ABORT: 'ABORT'
}

localSocket.on("connection", (localSocket) => {
    localSocket.on("data", (data) => {
        // console.log({"Python data": data})
        // let script = "import time\nx = 1\ny = 2\nz = x + y\nprint(z)\ntime.sleep(1)\nprint(z)\n"
        // // Debug a script.
        // localSocket.emit("debug", {script, breakpoints: [1]});
    });
    localSocket.on("PAUSED", (data) => {
        console.log(data);

        // Continue to next breakpoint.
        // socket.emit("state", states.STATE_DEBUGGING);
        // Step through code
        localSocket.emit("command", commands.STEP);
    })

    externalSocket.on("connection", (externalSocket) => {
        externalSocket.on("run", (data) => {
            console.log('run command recieved');
            //console.log(data)
            let {script} = data;
            // console.log(script)
            localSocket.emit("run", {script});
        });
    });

    python.stdout.on("data", function (data) {
        externalSocket.emit("runResult", {ok: true, res: data.toString()});
    });               
    python.stderr.on('data', (data) => { 
        console.log(`error:\n${data}`);
    });
    python.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    }); 

})

