const Task = require("./task");

module.exports = ({ language, sequence }) => {
  // Convert tasks to objects.
  const taskObjects = {};
  Object.keys(sequence.nodes).map((taskName) => {
    const task = sequence.nodes[taskName];
    taskObjects[taskName] = Task(taskName, task.code, language);
  });

  // Build dependency graph.
  Object.keys(taskObjects).map((taskName) => {
    const task = taskObjects[taskName];
    sequence.nodes[taskName].predecessors.map(dependencyName => {
        if (dependencyName != 'startNode'){
            task.addDependency(taskObjects[dependencyName]);
        }
    })
  });

  return {
    language: language,
    sequence: sequence,
    dependencyGraph: taskObjects,
    run(){
      sequence.startNodes.map((taskName) => {
        const task = this.dependencyGraph[taskName];
        task.run();
      });
    },
  };
};
