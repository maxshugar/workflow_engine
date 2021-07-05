'use strict';
const vm = require('vm');

try{
    vm.runInThisContext(process.argv[2]);
} catch(err){
    console.error(err.toString())
}

