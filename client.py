import socketio
import asyncio
import multiprocessing as mp
import multiprocessing.queues as mpq

import debugger_2

sio = socketio.AsyncClient()

workerQueue = mpq.Queue(ctx = mp.get_context())

async def run(args):
    print("running with args: ", args)
    await sio.emit("runPyScriptRes", {"hello": 1234})

@sio.event
async def connect():
    print("Client connected.")

@sio.event
def sum(sid, data):
    print("sum event recieved: ", sid, data)
    result = data['numbers'][0] + data['numbers'][1]
    sio.emit("sum_result", {"result": result}, to=sid)

@sio.event
def runPyScript(data):
    print("runScript event recieved: ", data)
    # workerQueue.put(data)

@sio.event
def debugScript(sid, data):
    print("debugScript event recieved: ", sid, data)
    
@sio.event
def runSequence(sid, data):
    print("runSequence event recieved: ", sid, data)

@sio.event
def disconnect():
    print('disconnected.')

def worker(workerQueue):
    data = workerQueue.get()
    print('worker called, args: ', data)
    run(data)

if __name__ == '__main__':

    # p = mp.Process(target=worker, args=(workerQueue,))
    # p.start()

