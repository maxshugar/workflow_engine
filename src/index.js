const pySocket = require("socket.io")(9000, {
  cors: {
    origin: "*",
  },
});

const externalSocket = require("socket.io")(8000, {
  cors: {
    origin: "*",
  },
});

const v8Socket = require("socket.io")(8001, {
  cors: {
    origin: "*",
  },
});

const {spawn, execFile} = require("child_process");
const path = require("path"); 

const Sequencer = require('./sequencer');
  
const handleChildProcessIO = (child, externalSocket) => {
  child.stdout.on("data", function (data) {
      console.log({data: data.toString()});
      externalSocket.emit("data", data.toString());
  });                
  child.stderr.on('data', (err) => { 
      console.log(`error:\n${err}`);
      externalSocket.emit("error", err.toString());
  });
  child.on('exit', function (code) {
    console.log(`code:\n${code}`);
      externalSocket.emit("state", {state: 'STATE_ABORTED', code});
  });   
} 

let _pySocket = null; 
let _externalSocket = null; 
let _v8Socket = null;

const dbgFilePath = path.join(__dirname, "python", "debugger.py");
const v8RunnerFilePath = path.join(__dirname, "v8", "index.js");

pySocket.on("connection", (pySocket) => {
  console.log("python connected");
  _pySocket = pySocket;
  // pySocket.emit("getState");
  // Return debugger state to react.
  pySocket.on("state", (state) => {
      if(_externalSocket != null)
        _externalSocket.emit("state", state);
  });       
  pySocket.on("data", (data) => {
    console.log({"Data from Python": data});
  }); 
  pySocket.on("addBreakpoint", (lineNumber) => {
    _externalSocket.emit("addBreakpoint", lineNumber);
  });  
  pySocket.on("removeBreakpoint", (lineNumber) => {
    _externalSocket.emit("removeBreakpoint", lineNumber);
  });  
});  

v8Socket.on("connection", (v8Socket) => {
  console.log("v8 socket connected");
  _v8Socket = v8Socket;
  v8Socket.on("state", (state) => {
    console.log({state})
      if(_externalSocket != null)
        _externalSocket.emit("state", state);
  }); 
  v8Socket.on("err", (err) => {
    console.log(err)
    if(_externalSocket != null)
      _externalSocket.emit("error", err);
});     
});   
  
externalSocket.on("connection", (externalSocket) => {
  console.log("external socket connected");
  _externalSocket = externalSocket;
  let python = spawn("python", ["-u", dbgFilePath]);
  handleChildProcessIO(python, externalSocket); 

  let v8 = execFile("node", [v8RunnerFilePath]);
  handleChildProcessIO(v8, externalSocket);

  externalSocket.on("run", async ({language, script}) => {
    //console.log({language, script})
    if(language == 'javascript'){
      _v8Socket.emit("run", {script});
    } else{
      _pySocket.emit("run", {script}); 
    }
  });  
  externalSocket.on("debug", (data) => {
    // console.log('debug command recieved.')
    _pySocket.emit("debug", data);  
  });  
  externalSocket.on("continue", () => {
    _pySocket.emit("continueDebug");
  });      
  externalSocket.on("step", () => {
    _pySocket.emit("stepDebug");
  });       
  externalSocket.on("abort", () => {
    python.kill(); 
    python = spawn("python", ["-u", dbgFilePath]);
    handleChildProcessIO(python, externalSocket);
    v8 = spawn("node", [v8RunnerFilePath]);
    handleChildProcessIO(v8, externalSocket);
  });  
  // Get the state of the python debugger.
  externalSocket.on("getState", () => {
      if(_pySocket != null) 
        _pySocket.emit("getState");
  });   
  externalSocket.on("addBreakpoint", (lineNumber) => {
    _pySocket.emit("addBreakpoint", lineNumber);
  }); 
  externalSocket.on("removeBreakpoint", (lineNumber) => {
    console.log('removeBreakpoint command recieved from react')
    _pySocket.emit("removeBreakpoint", lineNumber);
  });
  externalSocket.on("addBreakpoints", (breakpoints) => {
    _pySocket.emit("addBreakpoints", breakpoints);
  });
  externalSocket.on("runSequence", (sequence) => {
    const seq = Sequencer(sequence, externalSocket);
    seq.run();
  });
});

