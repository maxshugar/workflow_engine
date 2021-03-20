const Task = require('./task');

let Run = () => {
    let t1 = Task(1, '', '', []);
    let t2 = Task(2, '', '', []);
    let t3 = Task(3, '', '', []);
    let t4 = Task(4, '', '', []);
    let t5 = Task(5, '', '', []);
    
    t2.addDependency(t1);
    t3.addDependency(t1);
    t4.addDependency(t2);
    t4.addDependency(t3);
    //t5.addDependency(t4);

    t1.execute();

}
Run();

// const executor = require('./executor');

// const script = 
// `
// let x = 1; 
// let y = 2; 
// let z = x + y;
// `

// /* what do I want to do with this script?

//     - Run it
//     - Redirect stdout to a variable, and then through a socket.
//     - Set breakpoints on lines
//     - Watch variables
//     - 

// */
// executor.debug({script, breakpoints: [1,2,3]});