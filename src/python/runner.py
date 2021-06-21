# Script which takes python string script as argument, compiles and executes.
# STDOUT and STDERR both set to be unbuffered.

import sys
import traceback

code = sys.argv[1]

try:
    if isinstance(code, str):
        sys.settrace(None)
        cmd = compile(code, "<string>", "exec")
        exec(cmd)
except Exception as e:
    tb = traceback.format_exc()
    print(tb, file=sys.stderr)