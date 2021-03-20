const engine = require('../../build/Release/engine.node');
const vm = require('vm');

module.exports = {
    execute: async (script) => {
        try{
            const x = 1;
            let ret;
            const context = { script, engine, ret };
            vm.createContext(context);
            const code = 'ret = engine.execute(script);';
            vm.runInContext(code, context);
            return context.ret;
        } catch(err) {
            console.log(err)
            return err;
        }
    }
}

// const util = require('util');
// const vm = require('vm');


// const script = new vm.Script('count += 1; name = "kitty";');

// const context = new vm.createContext(sandbox);
// for (let i = 0; i < 10; ++i) {
//   script.runInContext(context);
// }

// console.log(util.inspect(sandbox));

// // { animal: 'cat', count: 12, name: 'kitty' }

// module.exports = (script, debug, ) => {

//     const sandbox = {
//       animal: 'cat',
//       count: 2
//     };

//     return({
//       debug: {
        
//       }
//     });

// }

// const stepInto = () => {
  
// }

// const stepOver = () => {
  
// }

// const setBreakPoint = () => {

// }

// python tools/configure.py --source-directory src-input --output-directory src-custom --config-metadata config -DDUK_USE_FASTINT