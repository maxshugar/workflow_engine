# import debugger

# d = debugger.Debugger()

# d.runScript({"script": 'hello', "breakpoints": [1, 2]})

# d.setBreakpoint()
# d.setOver()
# d.stepInto()
# d.stepThrough()


# d.onError()

# d.onStdout()

# d.onBreakpointHit()

# import asyncio

# async def myCoroutine():
#     while True:
#         await asyncio.sleep(1)
#         print("my coroutine")

# loop = asyncio.get_event_loop()

# try:
#     asyncio.ensure_future(myCoroutine())
#     loop.run_forever()
# except KeyboardInterrupt:
#     pass
# finally:
#     print("closing loop")
#     loop.close()