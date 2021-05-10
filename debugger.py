import os
import io
import re
import sys
import cmd
import bdb
import dis
import code
import glob
import pprint
import signal
import inspect
import tokenize
import traceback
import linecache

class Debugger(bdb.Bdb):
    
    line_prefix = '-> '   # Probably a better default

    def __init__(self):
        bdb.Bdb.__init__(self)
    
    def set_breakpoint(self, filename, lineno):
        self.set_break(filename, lineno)
        bp = self.get_breaks(filename, lineno)[-1]
        print("Breakpoint %d set at %s:%d" %
                        (bp.number, bp.file, bp.line))

    def _runscript(self, filename):
        import __main__
        __main__.__dict__.clear()
        __main__.__dict__.update({"__name__"    : "__main__",
                                  "__file__"    : filename,
                                  "__builtins__": __builtins__,
                                 })
        self._wait_for_mainpyfile = True
        self.mainpyfile = self.canonic(filename)
        self._user_requested_quit = False
        with io.open_code(filename) as fp:
            statement = "exec(compile(%r, %r, 'exec'))" % \
                        (fp.read(), self.mainpyfile)
            print(statement)
        self.run(statement)

    def user_call(self, frame, argument_list):
        print(self.line_prefix, "user_call", frame)

    def user_line(self, frame):
        if not self.break_here(frame):
            return
        (filename, lineno, _, _, _) = inspect.getframeinfo(frame)
        print("breakpoint hit at lineno {l}".format(f=filename, l=lineno))
        self.set_continue()

