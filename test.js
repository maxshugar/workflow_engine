const inspector = require("inspector");

class asyncInspector extends inspector.Session {
  constructor() {
    super();
  }

  asyncPost(method, params = {}) {
    return new Promise((resolve) => {
      this.post(method, params, (err, res) => {
        if (err) resolve({ ok: false, err });
        resolve({ ok: true, res });
      });
    });
  }
}

async function test() {
  try {
    const session = new asyncInspector();
    session.connect();

    let ret = await session.asyncPost("Debugger.enable");
    ret = await session.asyncPost("Runtime.enable");
    ret = await session.asyncPost("Runtime.compileScript", {
      expression: "let x = 3;\n let y = 17;\n x + y;\n",
      sourceURL: "/script",
      persistScript: true,
    });
    let { scriptId } = ret.res;
    
    ret = await session.asyncPost("Debugger.setBreakpoint", {
      location: { scriptId, lineNumber: 2 },
    });
    //console.log(ret);
    
    session.on('Debugger.paused', (ret) => {
        //console.log(JSON.stringify(ret));
    })

    session.on('Debugger.scriptParsed', (ret) => {
        console.log(JSON.stringify(ret));
    })

    ret = await session.asyncPost('Runtime.runScript', { scriptId });
    //console.log(ret);

  } catch (err) {
    console.log(err);
  }
}

test();
