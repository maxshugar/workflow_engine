// const engine = require('../../build/Release/executor.node');

module.exports = (script) => {
    try{

        // ret = engine.execute(script);
        // console.log(ret);
        // return ret;

        // const x = 1;
        // let ret; 
        // const context = { script, engine, ret };
        // vm.createContext(context);
        // const code = 'ret = engine.execute(script);';
        // vm.runInContext(code, context);
        // console.log(context.ret);
        // return context.ret;
    } catch(err) {
        console.log(err)
        return err;
    }
}