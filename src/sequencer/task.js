const STATE_SEQ_TASK_IDLE = 0;
const STATE_SEQ_TASK_RUNNING = 1;
const STATE_SEQ_TASK_SCOMPLETE = 2;
const STATE_SEQ_TASK_ERROR = 3;

const { spawn } = require("child_process");
const path = require("path");

module.exports = (id, code, language = 'py', externalSocket) => {
  return {
    id,
    state: STATE_SEQ_TASK_IDLE,
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
        if (predecessor.state != STATE_SEQ_TASK_SCOMPLETE) {
          // console.log(`${_this.id} recieved run signal, waiting for ${predecessor.id} to complete`);
          return;
        }
      }

      console.log(JSON.stringify(predecessorIds) + "-> " + this.id);

      this.state = STATE_SEQ_TASK_RUNNING;
      this.socket.emit("sequencer", {state: this.state, taskId: this.id});
      // Create child process
      try {
        const scriptFilename = path.join(__dirname, "../python", "runner.py");
        let python = spawn("python", ["-u", scriptFilename, this.code]);
        python.stdout.on("data", function (data) {
          console.log(data.toString());
        });
        python.stderr.on("data", (err) => {
          console.log(`error:\n${err}`);
          _this.state = STATE_SEQ_TASK_ERROR;
        });
        python.on("exit", function (code) {
          if (_this.state !== STATE_SEQ_TASK_ERROR) {
            _this.state = STATE_SEQ_TASK_SCOMPLETE;
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
