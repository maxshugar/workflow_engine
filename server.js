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

const spawn = require("child_process").spawn;
 
const handlePythonIO = (python, externalSocket) => {
    python.stdout.on("data", function (data) {
        // console.log(data.toString());
        externalSocket.emit("data", data.toString());
    });                
    python.stderr.on('data', (err) => { 
        //console.log(`error:\n${err}`);
        externalSocket.emit("error", err.toString());
    });
    python.on('exit', function (code) {
        externalSocket.emit("state", {state: 'STATE_ABORTED', code});
    });   
} 
  
const commands = {
  STEP: "STEP",
  CONTINUE: "CONTINUE",
  ABORT: "ABORT",
};
 
let _localSocket = null; 
let _externalSocket = null;

localSocket.on("connection", (localSocket) => {
  console.log("local socket connected");
  _localSocket = localSocket;
  // localSocket.emit("getState");
  // Return debugger state to react.
  localSocket.on("state", (state) => {
      if(_externalSocket != null)
        _externalSocket.emit("state", state);
  }); 
  localSocket.on("data", (data) => {
    console.log({"Data from Python": data});
  }); 
  localSocket.on("addBreakpoint", (lineNumber) => {
    _externalSocket.emit("addBreakpoint", lineNumber);
  }); 
  localSocket.on("removeBreakpoint", (lineNumber) => {
    _externalSocket.emit("removeBreakpoint", lineNumber);
  }); 
}); 
 
externalSocket.on("connection", (externalSocket) => {
  console.log("external socket connected");
  _externalSocket = externalSocket;
  let python = spawn("python", ["-u", `debugger.py`]);
  handlePythonIO(python, externalSocket); 
  externalSocket.on("run", (data) => {
    _localSocket.emit("run", data); 
  }); 
  externalSocket.on("debug", (data) => {
    // console.log('debug command recieved.')
    _localSocket.emit("debug", data);  
  }); 
  externalSocket.on("continue", () => {
    _localSocket.emit("continueDebug");
  });      
  externalSocket.on("step", () => {
    _localSocket.emit("stepDebug");
  });      
  externalSocket.on("abort", () => {
    python.kill(); 
    python = spawn("python", ["-u", `debugger.py`]);
    handlePythonIO(python, externalSocket);
  }); 
  // Get the state of the python debugger.
  externalSocket.on("getState", () => {
      if(_localSocket != null) 
        _localSocket.emit("getState");
  });  
  externalSocket.on("addBreakpoint", (lineNumber) => {
    _localSocket.emit("addBreakpoint", lineNumber);
  });
  externalSocket.on("removeBreakpoint", (lineNumber) => {
    _localSocket.emit("removeBreakpoint", lineNumber);
  });
});

