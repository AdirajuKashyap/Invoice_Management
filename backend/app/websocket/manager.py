class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, user_id, websocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id):
        self.active_connections.pop(user_id, None)

    async def send_personal(self, user_id, data):
        connection = self.active_connections.get(user_id)
        if connection:
            await connection.send_json(data)


manager = ConnectionManager()