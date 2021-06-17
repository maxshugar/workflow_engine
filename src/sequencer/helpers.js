module.exports = {
  makeDummyPyScript: (name, timeout) =>
    `import time\nprint("${name} executing, please wait..")\nprint("${name} doing some work for ${timeout} seconds.")\ntime.sleep(${timeout})\nprint("${name} complete!")\n`,
};
