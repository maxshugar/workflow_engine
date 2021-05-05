#https://codemirror.net/#

import debugger

d = debugger.Debugger()

filename = 'example.py'

err = d.set_breakpoint(filename, 2)
if err:
    print(err)
else:
    print("Breakpoint set")

d.runScript(filename)

print("end")