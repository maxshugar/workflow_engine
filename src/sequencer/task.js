const STATE_IDLE = 0;
const STATE_RUNNING = 1;
const STATE_COMPLETE = 2;

const {spawn} = require('child_process');
const path = require('path');

module.exports = (name, code, language) => {

    return ({  
        name: name,
        state: STATE_IDLE,
        language: language,
        code: code,
        predecessors: [],
        successors: [],

        run(){

            const _this = this;

            const predecessorNames = [];

            // Ensure all dependencies have completed before beginning.
            for(let i = 0; i < this.predecessors.length; i++){
                const predecessor = this.predecessors[i];
                predecessorNames.push(predecessor.name);
                if(predecessor.state != STATE_COMPLETE){
                    // console.log(`${_this.name} recieved run signal, waiting for ${predecessor.name} to complete`);
                    return;
                }
            }
            
            console.log(JSON.stringify(predecessorNames)  + '-> ' + this.name);

            this.state = STATE_RUNNING;

            // Create child process
            const scriptFilename = path.join(__dirname, '../debugger', 'runner.py');
            let python = spawn("python", ["-u", scriptFilename, this.code]);
            python.stdout.on("data", function (data) {
                //console.log(data.toString());
            });                
            python.stderr.on('data', (err) => { 
                console.log(`error:\n${err}`);
            });
            python.on('exit', function (code) {
                if(code === 0){
                    _this.state = STATE_COMPLETE;
                    _this.notifySuccessors();
                }
            });   
        },
        addDependency(dependency) {
            dependency.successors.push(this);
            this.predecessors.push(dependency);
        },
        notifySuccessors(){
            this.successors.map(successor => successor.run() )
        }
    });
}