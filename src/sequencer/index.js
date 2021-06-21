const Task = require("./task");

module.exports = (sequence, socket) => {
  // Convert tasks to objects.
  const taskObjects = {};
  Object.keys(sequence.nodes).map((id) => {
    const task = sequence.nodes[id];
    taskObjects[id] = Task(id, task.code, 'py', socket);
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
    run(){
      sequence.startNodes.map((id) => {
        const task = this.dependencyGraph[id];
        task.run();
      });
    },
  };
};
