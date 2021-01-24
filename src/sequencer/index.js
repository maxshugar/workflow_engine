module.exports = {
  load: (sequence) => {
    const startNode = sequence["start"];
    execueSuccessors(startNode, sequence);
  },
};

const execueSuccessors = (task, sequence) => {
  for (let i = 0; i < task.successors.length; i++) {
    const successor = sequence[task.successors[i]];
    successor.execute();
  }
};
