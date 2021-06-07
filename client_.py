import asyncio
import socketio
import debugger

sio = socketio.AsyncClient()

d = debugger()

@sio.event
async def connect():
    print("I'm connected!")

@sio.event
async def initialise(data):
    print(data)

@sio.event
def disconnect():
    print("I'm disconnected!")

@sio.event
def sum_result(data):
    print("sum result recieved: ", data['result'])

async def main():
    await sio.connect('http://localhost:9000')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())