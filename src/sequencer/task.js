const states = {
  STATE_SEQ_COMPLETE: 'STATE_SEQ_COMPLETE',
  STATE_SEQ_IDLE: 'STATE_SEQ_IDLE',
  STATE_SEQ_TASK_IDLE: 'STATE_SEQ_TASK_IDLE',
  STATE_SEQ_TASK_RUNNING: 'STATE_SEQ_TASK_RUNNING',
  STATE_SEQ_TASK_COMPLETE: 'STATE_SEQ_TASK_COMPLETE',
  STATE_SEQ_TASK_ERROR: 'STATE_SEQ_TASK_ERROR',
} 

const { spawn } = require("child_process");
const path = require("path");

module.exports = (id, code, language = 'python', externalSocket, name, type) => {
  return {
    id,
    state: states.STATE_SEQ_TASK_IDLE,
    language,
    code: code,
    predecessors: [],
    successors: [],
    socket: externalSocket,
    name: name,
    type: type,

    run() {
      
      const _this = this;

      const predecessorIds = [];
 
      // Ensure all dependencies have completed before beginning.
      for (let i = 0; i < this.predecessors.length; i++) {
        const predecessor = this.predecessors[i];
        //console.log(predecessor)
        predecessorIds.push(predecessor.id); 
        if (predecessor.state != states.STATE_SEQ_TASK_COMPLETE) {
          // console.log(`${_this.id} recieved run signal, waiting for ${predecessor.id} to complete`);
          return;
        } 
      }
      
      if(this.type === 'EndNode'){
        this.state = states.STATE_SEQ_COMPLETE;
        this.socket.emit("sequencerState", {state: this.state});
        this.state = states.STATE_SEQ_IDLE;
        this.socket.emit("sequencerState", {state: this.state});
        return;
      }

      this.state = states.STATE_SEQ_TASK_RUNNING;
      this.socket.emit("sequencerState", {state: this.state, taskId: this.id, name: _this.name});
      // Create child process
      try {

        if(language === 'python'){
          const scriptFilename = path.join(__dirname, "../python", "runner.py");
          let python = spawn("python", ["-u", scriptFilename, this.code]);
          python.stdout.on("data", function (data) {
            _this.socket.emit("data", `[${_this.name}] ${data.toString()}`);
          });
          python.stderr.on("data", (err) => {
            _this.state = states.STATE_SEQ_TASK_ERROR;
            _this.socket.emit("sequencerState", {state: _this.state, taskId: _this.id, name: _this.name});
            _this.socket.emit("error", `[${_this.name}] ${err.toString()}`);
          });
          python.on("exit", function (code) {
            if (_this.state !== states.STATE_SEQ_TASK_ERROR) {
              _this.state = states.STATE_SEQ_TASK_COMPLETE;
              _this.socket.emit("sequencerState", {state: _this.state, taskId: _this.id, name: _this.name});
              _this.notifySuccessors();
            }
          });
        } else if (language === 'javascript'){
          const scriptFilename = path.join(__dirname, "../v8", "runner.js");
          let v8 = spawn("node", [scriptFilename, this.code]);
          v8.stdout.on("data", function (data) {
            _this.socket.emit("data", `[${_this.name}] ${data.toString()}`);
          });
          v8.stderr.on("data", (err) => {
            _this.state = states.STATE_SEQ_TASK_ERROR;
            _this.socket.emit("sequencerState", {state: _this.state, taskId: _this.id, name: _this.name});
            _this.socket.emit("error", `[${_this.name}] ${err.toString()}`);
          });
          v8.on("exit", function (code) {
            if (_this.state !== states.STATE_SEQ_TASK_ERROR) {
              _this.state = states.STATE_SEQ_TASK_COMPLETE;
              _this.socket.emit("sequencerState", {state: _this.state, taskId: _this.id, name: _this.name});
              _this.notifySuccessors();
            }
          });
        }
        
      } catch (err) {
        console.log({ err });
      }
    },
    addDependency(dependency) {
      dependency.successors.push(this);
      this.predecessors.push(dependency);
    },
    notifySuccessors() {
      this.successors.map((successor) => successor.run());
    },
  };
};
