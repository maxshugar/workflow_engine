class Debugger():

    def __init__(self):
        self.debugQueue = multiprocessing.Queue()
        self.socketQueue = multiprocessing.Queue()

    async def step(self, event):
        # Tell the debugger we want to step in
        self.debugQueue.put("step")

    async def stop(self, event):
        # Tell the debugger we're stopping execution
        self.debugQueue.put("stop")

    async def over(self, event):
        # Tell the debugger to step over the next code block
        self.debugQueue.put("over")

    def run(script):
        print("running")

    def _run(self, script):
        

        if isinstance(script, str):
            script = compile(script, "<string>", "exec")
        sys.settrace(self.trace_dispatch)
        try:
            exec(script)
        except Exception:
            pass
        finally:
            print("debug complete")
            sys.settrace(None)

    def trace_lines(self, frame, event, arg):
        """Handler that executes with every line of code"""

        # We only care about *line* and *return* events
        if event != 'line' and event != 'return':
            return

        # Get a reference to the code object and source
        co = frame.f_code
        source = inspect.getsourcelines(co)[0]

        # Send the UI information on the code we're currently executing
        self.socketQueue.put({ "co": { "file": co.co_filename,
                                    "name": co.co_name,
                                    "lineno": str(frame.f_lineno)
                                    },
                            "frame": { "lineno": frame.f_lineno,
                                        "firstlineno": co.co_firstlineno,
                                        "locals": str(frame.f_locals),
                                        "source": source
                                        },
                            'trace': 'line'
                            })

        # Wait for a debug command
        cmd = self.debugQueue.get()

        if cmd == "step":
            # If stepping through code, return this handler
            return trace_lines

        if cmd == "stop":
            # If stopping execution, raise an exception
            raise StopExecution()

        elif cmd == 'over':
            # If stepping out of code, return the function callback
            return trace_calls  

        # print("CODE")
        # print("co_argcount " + str(co.co_argcount))
        # print("co_cellvars " + str(co.co_cellvars))
        # print("co_code " + str(co.co_code))
        # print("co_consts " + str(co.co_consts))
        # print("co_filename " + str(co.co_filename))
        # print("co_firstlineno " + str(co.co_firstlineno))
        # print("co_flags " + str(co.co_flags))
        # print("co_freevars " + str(co.co_freevars))
        # print("co_kwonlyargcount " + str(co.co_kwonlyargcount))
        # print("co_lnotab " + str(co.co_lnotab))
        # print("co_name " + str(co.co_name))
        # print("co_names " + str(co.co_names))
        # print("co_nlocals " + str(co.co_nlocals))
        # print("co_stacksize " + str(co.co_stacksize))
        # print("co_varnames " + str(co.co_varnames))
        #
        # print("FRAME")
        # print("clear " + str(frame.clear))
        # # print("f_back " + str(frame.f_back))
        # # print("f_builtins " + str(frame.f_builtins))
        # # print("f_code " + str(frame.f_code))
        # # print("f_globals " + str(frame.f_globals))
        # print("f_lasti " + str(frame.f_lasti))
        # print("f_lineno " + str(frame.f_lineno))
        # print("f_locals " + str(frame.f_locals))
        # print("f_trace " + str(frame.f_trace))

    def trace_calls(self, frame, event, arg):
        """Handler that executes on every invocation of a function call"""

        # We only care about function call events
        if event != 'call':
            return

        # Get a reference for the code object and function name
        co = frame.f_code
        func_name = co.co_name

        # Only react to the functions we care about
        if func_name in ['sample', 'xyz']:
            # Get the source code from the code object
            source = inspect.getsourcelines(co)[0]

            # Tell the UI to perform an update
            trace_lines.applicationq.put({ "co": { "file": co.co_filename,
                                        "name": co.co_name,
                                        "lineno": str(frame.f_lineno)
                                        },
                                "frame": { "lineno": frame.f_lineno,
                                            "firstlineno": co.co_firstlineno,
                                            "locals": str(frame.f_locals),
                                            "source": source
                                            },
                                "trace": "call"
                                })

            print('Call to %s on line %s of %s' % (func_name, frame.f_lineno, co.co_filename))

            # Wait for a debug command (we stop here right before stepping into or out of a function)
            cmd = trace_lines.debugq.get()

            if cmd == 'step':
                # If stepping into the function, return the line callback
                return trace_lines
            elif cmd == 'over':
                # If stepping over, then return nothing
                return

        return   