module.exports = {
  makeDummyPyScript: (name, timeout) =>
    `import time\nprint("${name} executing, please wait..")\nprint("${name} doing some work for ${timeout} seconds.")\ntime.sleep(${timeout})\nprint("${name} complete!")\n`,
  handleChildProcessIO: (child, externalSocket) => {
      child.stdout.on("data", function (data) {
          console.log({data: data.toString()});
          externalSocket.emit("data", data.toString());
      });                
      child.stderr.on('data', (err) => { 
          console.log(`error:\n${err}`);
          externalSocket.emit("error", err.toString());
      });
      child.on('exit', function (code) {
        console.log(`code:\n${code}`);
          externalSocket.emit("state", {state: 'STATE_ABORTED', code});
      });    
    } 
};
