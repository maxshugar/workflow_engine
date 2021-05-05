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
    def __init__(self):
        bdb.Bdb.__init__(self)
        self.set_trace()

    def set_breakpoint(self, filename, lineno):
        self.set_break(filename, lineno)
        bp = self.get_breaks(filename, lineno)[-1]
        print("Breakpoint %d at %s:%d" %
                        (bp.number, bp.file, bp.line))

    def runScript(self, filename):
        # The script has to run in __main__ namespace (or imports from
        # __main__ will break).
        #
        # So we clear up the __main__ and set several special variables
        # (this gets rid of pdb's globals and cleans old variables on restarts).
        import __main__
        __main__.__dict__.clear()
        __main__.__dict__.update({"__name__"    : "__main__",
                                  "__file__"    : filename,
                                  "__builtins__": __builtins__,
                                 })

        # When bdb sets tracing, a number of call and line events happens
        # BEFORE debugger even reaches user's code (and the exact sequence of
        # events depends on python version). So we take special measures to
        # avoid stopping before we reach the main script (see user_line and
        # user_call for details).
        self._wait_for_mainpyfile = True
        self.mainpyfile = self.canonic(filename)
        self._user_requested_quit = False
        with io.open_code(filename) as fp:
            statement = "exec(compile(%r, %r, 'exec'))" % \
                        (fp.read(), self.mainpyfile)
        self.run(statement)