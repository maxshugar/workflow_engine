const Sequencer = require('../src/sequencer');
const {makeDummyPyScript} = require('../src/sequencer/helpers');



const examplePyPayload = {
    language: 'py',
    sequence: {
        startNodes: ["task1", "task2"],
        nodes: {
            task1: {
                code: makeDummyPyScript("task1", 1),
                predecessors: [],
            },
            task2: {
                code: makeDummyPyScript("task2", 1),
                predecessors: [],
            }, 
            task3: {
                code: makeDummyPyScript("task3", 1),
                predecessors: ["task1", "task2"],
            }
        }
    }
}

const examplePyPayload2 = {
    language: 'py',
    sequence: {
        startNodes: ["task1", "task2"],
        nodes: {
            task1: {
                code: makeDummyPyScript("task1", 2),
                predecessors: [],
            },
            task2: {
                code: makeDummyPyScript("task2", 1),
                predecessors: [],
            }, 
            task3: {
                code: makeDummyPyScript("task3", 3),
                predecessors: ["task1", "task2"],
            },
            task4: {
                code: makeDummyPyScript("task4", 2),
                predecessors: ["task2"],
            },
            task5: {
                code: makeDummyPyScript("task5", 5),
                predecessors: ["task3", "task4"],
            },
            task6: {
                code: makeDummyPyScript("task6", 2),
                predecessors: ["task5"],
            }
        }
    }
}

const seq = Sequencer(examplePyPayload2);

seq.run();