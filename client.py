import asyncio
import socketio

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("I'm connected!")
    await sio.emit('sum', {"numbers": [5, 5]})
    await sio.emit('runScript', {"script": "print('hello')\n"})

@sio.event
def disconnect():
    print("I'm disconnected!")

@sio.event
def sum_result(data):
    print("sum result recieved: ", data['result'])

async def main():
    await sio.connect('http://localhost:8080')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())