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
                # print("Function '" + func_name + "' called!")
            elif event == 'line':                
                self.handleLine(frame, event, arg)
            elif event == 'return':
                co = frame.f_code
                func_name = co.co_name
                # print("Returning from '" + func_name + "'!")
            elif event == 'exception':
                co = frame.f_code 
                func_name = co.co_name
                line_no = frame.f_lineno
                exc_type, exc_value, exc_traceback = arg
                # print ('Tracing exception: %s "%s" on line %s of %s' % \
                # (exc_type.__name__, exc_value, line_no, func_name))
            return self.tracer
        return

    def handleLine(self, frame, event, arg):
        line_no = frame.f_lineno
        # Check if breakpoint has been hit on line.
        if(line_no in self.breakpoints):
            self.state = states.STATE_PAUSED.name
            self.sio.emit("state", {"state": d.state, "breakpoint": True, "lineNumber": line_no})
            while(self.state == states.STATE_PAUSED.name):
                    time.sleep(0.1)

d = debugger(sio)

@sio.event
def connect():
    d.breakpoints = []
    sio.emit("state", {"state": d.state, "engineType": "python"})  

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
    sio.emit("state", {"state": d.state, "sid": sio.sid, "engineType": "python"})

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
    sio.emit("state", {"state": d.state, "sid": sio.sid, "engineType": "python"})

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
    d.addBreakpoint(lineNumber)
    sio.emit("state", {"state": states.STATE_BREAKPOINT_ADDED.name, "sid": sio.sid, "lineNumber": lineNumber})
    time.sleep(0.1)
    sio.emit("state", {"state": d.state, "sid": sio.sid})
    return

@sio.event
def removeBreakpoint(lineNumber):
    # print("removeBreakpoint command recieved from node")
    d.removeBreakpoint(lineNumber)
    sio.emit("state", {"state": states.STATE_BREAKPOINT_REMOVED.name, "sid": sio.sid, "lineNumber": lineNumber})
    time.sleep(0.1)
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