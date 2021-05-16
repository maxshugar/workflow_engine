const io = require("socket.io")(8080, {
  cors: {
    origin: "*",
  },  
});
const spawn = require('child_process').spawn;
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');

// Make temporary dir
const scriptDirName = 'tmp';
var fs = require('fs');
if (!fs.existsSync(scriptDirName))
    fs.mkdirSync(scriptDirName);


io.on("connection", (socket) => {
    socket.on("runScript", (data) => { 
        console.log("Run script event recieved: ", data);
        const fileName = `${uuidv4()}.py`;
        if(data.hasOwnProperty('code')){
            fs.writeFileSync(`${scriptDirName}/${fileName}`, data.code);
            const python = spawn("python", ["-u", `${scriptDirName}/${fileName}`]);
            python.stdout.on("data", function (data) {
                console.log("Py script output: ", data.toString());
                socket.emit('runResult', {
                    ok: true,
                    res: data.toString()
                })
            });              
            python.stderr.on('data', (data) => { 
                console.log(`error:\n${data}`);
                socket.emit('runResult', { 
                    ok: false,
                    err: data.toString()
                })
            });
            python.on('exit', function (code) {
                socket.emit('runResult', { 
                    ok: true,
                    exitCode:  code.toString()
                })
                console.log('child process exited with code ' + code.toString());
              });
        } else {
            socket.emit('runResult', {
                ok: false,
                err: 'No code passed as parameter to run.'
            })
        }
 
    });
 
});
