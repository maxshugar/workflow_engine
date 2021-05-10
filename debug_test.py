#https://codemirror.net/#

# import debugger

# d = debugger.Debugger()

# filename = 'example.py'

# d.set_breakpoint(filename, 2)
# d.set_breakpoint(filename, 3)

# d._runscript(filename)

# import dis

# def sample(a, b):
#     x = a + b
#     y = x * 2
#     print('Sample: ' + str(y))


# def trace_calls(frame, event, arg):
#     if frame.f_code.co_name == "sample":
#         print(frame.f_code)
#         return trace_lines

# def trace_lines(frame, event, arg):
#     print(frame.f_lineno)

# import sys
# sys.settrace(trace_calls)

# sample(3,2)


import debugger_2

d = debugger_2.Debugger()

d.run("print('hello')\n")

# Further work - analysis of test bottlenecks

# Runtime profiling

# Running tests in parallel. 