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
