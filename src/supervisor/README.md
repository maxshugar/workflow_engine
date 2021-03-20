# Supervisor

The purpose of this interface is to translate client requests into commands for the sequencer, and return script execution results.

## User Stories
1. As a user, I would like to connect to the socket.
2. As a user, I would like to send a command to the socket to execute a sequence.
    - View script output
    - Recieve script result (PASS / FAIL)
    - Recieve runtime metrics
3. As a user, I would like to send a command to the socket to debug a sequence.
    - Set breakpoints
    - Watch variables
    - Abort execution
    - Step over
    - Step into
    - Step out

## Socket Interface Parameters

### Execute
    {
        "sequenceId": int,
        "startTaskId": int
    }

### Debug
    {
        "sequenceId": int,
        "startTaskId": int,
        "debugConfig": [
            "taskId": {
                "breakpoints": [ 
                    lineNumber <int>
                 ],
                "watchVariables": [
                    variableName <string>
                ]
            ]
        ]
    }