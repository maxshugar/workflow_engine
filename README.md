# Project Blog

## Lost Code - 08/01/21

The students laptop had to be reformatted due to security updates which resulted in the sequencer code written by the student to be lost. This will have to be rewritten.

## Embedding V8 - 23/01/21

Embedding v8 in a C++ application on Windows 10 x64 has proven to be extremely tedious and difficult. The student has managed to build the engine on Windows 10 x64 but has not managed to successfully compile the hello-world.cc example provided by Google. The student has spent just over a month attempting to compile v8 on windows which has significantly delayed the projects progress. Due to the projects time constraints, the student has decided to use python instead of javascript as a scripting language due to there being more documentation and support online. The student has also tried using SpiderMonkey developed by Mozilla, but ran into similar issues as V8.

## Embedding Python - 24/01/21

The student has successfully compiled a c++ program containing the python interpreter which can execute a python string. The main concern the student now has is the security vulnerabilities posed by allowing remote code to be executed on the host system. One solution would be to create a virtualised environment which prevents malicious code effecting the host system (https://blog.remoteinterview.io/how-we-used-docker-to-compile-and-run-untrusted-code-2fafbffe2ad5).

## Supervisor API - 24/01/21

The student has decided to use Node.js & Express to create a REST API due to the fast setup time and the students extensive experience with node.js. Given more time, the student would have considered implementing the Supervisor in C++ using a header only library such as restinio (https://github.com/Stiffstream/restinio). The supervisor will expose an route for execution of scripts. The body of this route will contain the language and code to be executed encoded as a string, the timeout period for the code, in addition to an optional parameter which will specify whether the script execution will be blocking or non-blocking. If execution has been set to non blocking, the result will be emitted seperately via a web socket. The student does not know how to handle debugging yet.

## Further thoughts on Sandboxing - 24/01/21 (https://medium.com/@yashbudukh/building-a-remote-code-execution-system-9e55c5b248d6)

As previously discussed, remote code execution poses threats to the hosts system. A malicious attacker could gain root level access to the host, and access other machines on the corporate network. Whilst the engineers using this system are unlikely to have any malicious intent, it would be irresponsible for the student to not put some security mechanisms in place. (https://medium.com/@devnullnor/a-secure-node-sandbox-f23b9fc9f2b0). A few solutions to consider:

- Virtualisation (Safest but most expensive) (Top down approach)
- Docker Containers (Bottom up approach)
- Language specific sandboxed implementations (PyPy)

## Worker Pool - 24/01/21

Simultaneous task execution will be achieved via a worker pool.

## Sequencing - 10/02/21

Over two weeks have passed since I last worked on this project. In hindsight, it would be easier to use node.js for the workflow engine. The students proficiency in javascript will make development faster, which is why Node.js will be used throughout this system going forwards. The system is simply a proof of concept behind schedule, therefor security and performance
will have to be made less of a priority.

## Sequencing - 11/02/21

I've been unable to find a decent javascript module which supports debugging therefor I will have to resort back to C++ integrated as an addon which will invoke the CPython library.

## Duktape Script Execution - 20/02/21

Considerable progress has been made with script execution. The student is using Duktape, a light weight javascript interpreter to execute scripts. He has managed
to execute a js scring using Express.js, which routes the request to a c++ addon that handles the execution of the script. The response is then returned back to the client.

## Duktape Debugger - 21/02/21
Duktape includes debugging functionality, which allows breakpoints to be set and the program flow to be controlled. The student is currently studying the following example (https://github.com/svaarala/duktape/tree/6ffafec98fb329db86865230365acec19e16f4a4/examples/debug-trans-dvalue), which acts as an interface with the debugger. So far it is unclear how this will work.

## v8 Working! - 10/03/21

The student finally managed to compile embed v8 as a node.js C++ addon! A web request can be sent to a rest api written using express to a compiled c++ addon which creates a new v8 context and executes the script. V8 has a try catch component which the student has used to catch errors. After the script has been executed, its output is returned as a response to the HTTP client. The next challenge will be to debug the javascript code running using v8. There does not appear to be any examples online. The only relevant material available appears to be the source code for d8, which is a shell application written using v8. Tom suggests I make a start on the web application and come back to debugging.

## Issues with V8 Debugging - 02/05/21
The student has studied the v8 source code in an attempt to understand how debugging functionaly has been implemented. Given the sheer volume of code, and minimal documentation, the student has hit a brick wall with regards to implementing debugger functionality. Given that the student has two months remaining on the project, it would make sense to discontinue studying the V8 source code and devise a plan to implement debugging in a different way, potentially using a different scripting language. The student will study how CodeSandbox achieves debugging functionality for all of its scripting languages, and re-consider the debugging functionality available for python.

## Python Debugging - 05/05/21

Python uses a library called pdb which itself has been written in python. It appears to be a lot simpler to implement as a custom debugger.