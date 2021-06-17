#!/usr/bin/env python
# encoding: utf-8

import sys
import traceback
import enum
import json
import socketio
import time

sio = socketio.Client()

class states(enum.Enum):
        STATE_IDLE = 0
        STATE_RUNNING = 1
        STATE_DEBUGGING = 2
        STATE_TERMINATED = 3
        STATE_PAUSED = 4
        STATE_STEPPING = 5
        STATE_STEPPING_INTO = 6
        STATE_STEPPING_OUT = 7
        STATE_STEPPING_OVER = 8
        STATE_COMPLETE = 9
        STATE_FAILING = 10
        STATE_CONTINUING = 11
        STATE_BREAKPOINT_ADDED = 12
        STATE_BREAKPOINT_REMOVED = 13

class commands(enum.Enum):
    STEP = 1,
    CONTINUE = 2,
    ABORT = 3

class Unbuffered(object):
   def __init__(self, stream):
       self.stream = stream
   def write(self, data):
       self.stream.write(data)
       self.stream.flush()
   def writelines(self, datas):
       self.stream.writelines(datas)
       self.stream.flush()
   def __getattr__(self, attr):
       return getattr(self.stream, attr)

class debugger():

    def __init__(self, sio):
        self.state = states.STATE_IDLE.name
        self.breakpoints = []
        self.watchList = []
        self.sio = sio

    def run(self, scriptStr):
        try:
            if isinstance(scriptStr, str):
                sys.settrace(None)
                cmd = compile(scriptStr, "<string>", "exec")
                exec(cmd)
                self.state = states.STATE_COMPLETE.name
        except Exception as e:
            tb = traceback.format_exc()
            print(tb, file=sys.stderr)
            self.state = states.STATE_TERMINATED.name
        
    def debug(self, scriptStr, breakpoints):
        try:
            self.breakpoints = breakpoints
            if isinstance(scriptStr, str):
                cmd = compile(scriptStr, "<string>", "exec")
            sys.settrace(self.tracer)
            exec(cmd)
            self.state = states.STATE_COMPLETE.name
        except Exception as e:
            tb = traceback.format_exc()
            print(tb, file=sys.stderr)
            self.state = states.STATE_TERMINATED.name

    def addBreakpoint(self, lineNumber):
        if lineNumber in self.breakpoints:
            return False
        self.breakpoints.append(lineNumber)
        return True

    def removeBreakpoint(self, lineNumber):
        if lineNumber in self.breakpoints:
            self.breakpoints.remove(lineNumber)
            return True
        return False

    def tracer(self, frame, event, arg):
        # Ignore other modules
        filename = frame.f_code.co_filename
        if(filename == "<string>"):
            if event == 'call':
                co = frame.f_code
                func_name = co.co_name
                #print("Function '" + func_name + "' called!")
            elif event == 'line':                
                self.handleLine(frame, event, arg)
            elif event == 'return':
                co = frame.f_code
                func_name = co.co_name
                #print("Returning from '" + func_name + "'!")
            elif event == 'exception':
                co = frame.f_code
                func_name = co.co_name
                line_no = frame.f_lineno
                exc_type, exc_value, exc_traceback = arg
                #print ('Tracing exception: %s "%s" on line %s of %s' % \
                #(exc_type.__name__, exc_value, line_no, func_name))
            return self.tracer
        return

    def handleLine(self, frame, event, arg):
        
        line_no = frame.f_lineno
        # # Check if debugger should step through line.
        # if(d.state == states.STATE_STEPPING.name):
        

        # Check if breakpoint has been hit on line.
        if(line_no in self.breakpoints):
            self.state = states.STATE_PAUSED.name
            self.sio.emit("state", {"state": d.state, "breakpoint": True, "lineNumber": line_no})

            while(self.state == states.STATE_PAUSED.name):
                    time.sleep(0.1)
        
 
        # if(self.state == states.STATE_STEPPING.name):
        #     self.state = states.STATE_PAUSED.name
    
        # print('line_no: ' + str(line_no) + '\n')

        # # Pause execution if debugger has been paused.
        # if(self.state == states.STATE_PAUSED.name):
        #     print("paused after breakpoint state")
        #     self.sio.emit("PAUSED", {"breakpoint": False, "stepping": True, "lineNumber": line_no})
        #     while(self.state == states.STATE_PAUSED.name):
        #         time.sleep(0.1)
        #     return

        

        # if(self.state == states.STATE_STEPPING.name or line_no in self.breakpoints):
        #     if(self.state == states.STATE_STEPPING.name):
        #         print("Line '" + str(line_no) + "' reached!")
        #     elif(line_no in self.breakpoints):
        #         self.state = states.STATE_BREAKPOINT_HIT.name
                
        #         while(self.state == states.STATE_BREAKPOINT_HIT):
        #             time.sleep(0.1)
        #         #print("breakpoint on line " + str(line_no) + " hit!")
        #     # Print watch list.    
        #     for varName in self.watchList:
        #         if varName in frame.f_locals:
        #             print(varName + ": " + str(frame.f_locals[varName]))
        #     #while(self.state == )
            # cmd = input("Enter command...\n")
            # if(cmd == 'step'): self.state = states.STATE_STEPPING.name
            # if(cmd == 'continue'): self.state = states.STATE_DEBUGGING.name

    def start(self):
        # Send start state.

        while(self.state != states.STATE_TERMINATED.name):
            try:

      
                data = json.loads(lines)
                
                # Set debugger state to idle.
                # if(data["state"] == states.STATE_IDLE.name):
                #     self.state = states.STATE_IDLE.name
                #     self.sendJsonToParent({"state": self.state, "msg": "Hello master, I'm ready and waiting :)"})
                # else:
                #     self.sendJsonToParent({"state": self.state, "msg": "Hello master, I haven't recieved a state from you :("})
                
                #{"state": "STATE_IDLE", "msg": "Hello slave :)"}

                #self.sendJsonToParent({"msg": "hello to you too :)"})
                #self.sendJsonToParent({"state": self.state, "msg": "msg recieved"})

                #j = json.loads(cmd)
                #print(j, flush=True)
                #j = json.dumps({"state": d.state, "msg": "I'm for instructions :)"})
                #print(j, flush=True)
            except Exception as e:
                self.state = states.STATE_FAILING.name
                self.sendJsonToParent({"state": self.state, "msg": str(e)})


# d.start()

# scriptStr = "x = 1\ny = 2\nz = x + y\nprint(z)\n"

# d.debug(scriptStr, [1, 4], ["z"])

d = debugger(sio)

@sio.event
def connect():
    sio.emit("state", {"state": d.state})  

# @sio.event
# def connect_error(data):
#     print("The connection failed!")

@sio.event
def run(data):
    if(d.state != states.STATE_IDLE.name):
        sio.emit("state", {"state": d.state, "sid": sio.sid})
        return
    d.state = states.STATE_RUNNING.name
    sio.emit("state", {"state": d.state})   
    time.sleep(0.1) 
    d.run(data["script"])
    time.sleep(0.1)
    sio.emit("state", {"state": d.state, "sid": sio.sid})
    d.state = states.STATE_IDLE.name
    time.sleep(0.1)
    sio.emit("state", {"state": d.state, "sid": sio.sid})

@sio.event 
def debug(data):
    if(d.state != states.STATE_IDLE.name):
        sio.emit("state", {"state": d.state, "sid": sio.sid})
        return
    d.state = states.STATE_DEBUGGING.name
    sio.emit("state", {"state": d.state}) 
    time.sleep(0.1) 
    d.debug(data["script"], data["breakpoints"])
    time.sleep(0.1)
    sio.emit("state", {"state": d.state, "sid": sio.sid})
    d.state = states.STATE_IDLE.name
    time.sleep(0.1)
    sio.emit("state", {"state": d.state, "sid": sio.sid})

@sio.event
def getState(): 
    sio.emit("state", {"state": d.state, "sid": sio.sid})
    return

@sio.event
def continueDebug():
    d.state = states.STATE_CONTINUING.name
    sio.emit("state", {"state": d.state, "sid": sio.sid})
    return

@sio.event
def stepDebug():
    d.state = states.STATE_STEPPING.name
    sio.emit("state", {"state": d.state, "sid": sio.sid})
    return

@sio.event
def addBreakpoint(lineNumber):
    if(d.addBreakpoint(lineNumber)):
        sio.emit("state", {"state": states.STATE_BREAKPOINT_ADDED.name, "sid": sio.sid, "lineNumber": lineNumber})
        sio.emit("state", {"state": d.state, "sid": sio.sid})
    return

@sio.event
def removeBreakpoint(lineNumber):
    print("removeBreakpoint command recieved from node")
    if(d.removeBreakpoint(lineNumber)):
        sio.emit("state", {"state": states.STATE_BREAKPOINT_REMOVED.name, "sid": sio.sid, "lineNumber": lineNumber})
        sio.emit("state", {"state": d.state, "sid": sio.sid})
    return

@sio.event
def addBreakpoints(breakpoints):
    d.breakpoints = breakpoints
    return

@sio.event
def disconnect():
    print("I'm disconnected!")

def main():
    sio.connect('http://localhost:9000')
    

if __name__ == '__main__':
    main() 