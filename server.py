from aiohttp import web
import socketio
import multiprocessing

import debugger_2

# d = debugger_2.Debugger()

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

queue = multiprocessing.Queue()

def run():
    print("running")

@sio.event
def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def sum(sid, data):
    print("sum event recieved: ", sid, data)
    result = data['numbers'][0] + data['numbers'][1]
    await sio.emit("sum_result", {"result": result}, to=sid)

@sio.event
async def runScript(sid, data):
    print("runScript event recieved: ", sid, data)
    #queue.put((d.run, [data['script']]))
    queue.put(run)

@sio.event
async def debugScript(sid, data):
    print("debugScript event recieved: ", sid, data)
    
@sio.event
async def runSequence(sid, data):
    print("runSequence event recieved: ", sid, data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

def worker(q):
    d = q.get()
    print('worker called')
    #print(f, args)
    d.run("something")

if __name__ == '__main__':
    p = multiprocessing.Process(target=worker, args=(queue,))
    p.start()

    web.run_app(app)
