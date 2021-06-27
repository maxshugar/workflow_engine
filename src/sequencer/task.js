const states = {
  STATE_SEQ_TASK_IDLE: 'STATE_SEQ_TASK_IDLE',
  STATE_SEQ_TASK_RUNNING: 'STATE_SEQ_TASK_RUNNING',
  STATE_SEQ_TASK_COMPLETE: 'STATE_SEQ_TASK_COMPLETE',
  STATE_SEQ_TASK_ERROR: 'STATE_SEQ_TASK_ERROR',
} 

const { spawn } = require("child_process");
const path = require("path");

module.exports = (id, code, language = 'py', externalSocket) => {
  return {
    id,
    state: states.STATE_SEQ_TASK_IDLE,
    language,
    code: code,
    predecessors: [],
    successors: [],
    socket: externalSocket,

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

      //console.log(JSON.stringify(predecessorIds) + "-> " + this.id);

      this.state = states.STATE_SEQ_TASK_RUNNING;
      this.socket.emit("sequencerState", {state: this.state, taskId: this.id});
      // Create child process
      try {
        const scriptFilename = path.join(__dirname, "../python", "runner.py");
        let python = spawn("python", ["-u", scriptFilename, this.code]);
        python.stdout.on("data", function (data) {
          _this.socket.emit("data", `[${_this.id}] ${data.toString()}`);
        });
        python.stderr.on("data", (err) => {
          _this.state = states.STATE_SEQ_TASK_ERROR;
          _this.socket.emit("sequencerState", {state: _this.state, taskId: _this.id});
          _this.socket.emit("error", err.toString());
        });
        python.on("exit", function (code) {
          if (_this.state !== states.STATE_SEQ_TASK_ERROR) {
            _this.state = states.STATE_SEQ_TASK_COMPLETE;
            _this.socket.emit("sequencerState", {state: _this.state, taskId: _this.id});
            _this.notifySuccessors();
          }
        });
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
