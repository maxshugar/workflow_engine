const Task = require("./task");

const states = {
  STATE_SEQ_IDLE: 'STATE_SEQ_IDLE',
  STATE_SEQ_RUNNING: 'STATE_SEQ_RUNNING'
} 

module.exports = (sequence, socket) => {
  // Convert tasks to objects.
  const taskObjects = {};
  Object.keys(sequence.nodes).map((id) => {
    const task = sequence.nodes[id];
    taskObjects[id] = Task(id, task.code, task.language, socket, task.name, task.type);
  });

  // Build dependency graph.
  Object.keys(taskObjects).map((id) => {
    const task = taskObjects[id];
    sequence.nodes[id].predecessors.map(dependencyId => {
        if (dependencyId != 'startNode'){
            task.addDependency(taskObjects[dependencyId]);
        }
    })
  });

  return {
    sequence: sequence,
    dependencyGraph: taskObjects,
    state: states.STATE_SEQ_IDLE,
    run(){
      
      socket.emit("sequencerState", {state: states.STATE_SEQ_RUNNING});

      sequence.startNodes.map((id) => {
        const task = this.dependencyGraph[id];
        task.run();
      });
    },
  };
};
