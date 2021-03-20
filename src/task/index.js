const STATE_IDLE = 0;
const STATE_RUNNING = 1;
const STATE_COMPLETE = 2;

module.exports = (id, code, language, args) => {
    return ({
        id_: id,
        state_: STATE_IDLE,
        language_: language,
        code_: code,
        args_: args,
        dependencies_: [],
        successors_: [],
        execute() {
            for(let i = 0; i < this.dependencies_.length; i++){
                if(this.dependencies_[i].state_ !== STATE_COMPLETE){
                    console.log("Task " + this.id_ + ' waiting for task ' + this.dependencies_[i].id_ + ' to complete.');
                    return;
                }
            }
            this.state_ = STATE_RUNNING;
            console.log("Executing task " + this.id_);
            //Task complete.
            this.state_ = STATE_COMPLETE;
            this.notifySuccessors();
        },
        addDependency(dependency) {
            dependency.successors_.push(this);
            this.dependencies_.push(dependency);
        },
        notifySuccessors(){
            this.successors_.map(successor => successor.execute() )
        }
    });
}