var uuid = require('uuid-random');
const WebSocket = require('ws')

const wss = new WebSocket.WebSocketServer({port:443}, ()=> {
	console.log('server started')
})

var players_data = {}

//=====WEBSOCKET FUNCTIONS======

//Websocket function that managages connection with clients
wss.on('connection', function connection(client){

	//Create Unique User ID for player
	client.id = uuid();
	console.log(`Client ${client.id} Connected!`)
	players_data[""+client.id] = {id : client.id }
	players_data[client.id]["position"] = {x : 0, y : 0, z : 0}

	//Send default client data back to client for reference
	client.send(`{"msg_type": "handshake_inicial", "id": "${client.id}"}`)

	//Method retrieves message from client
	client.on('message', (data) => On_Message_Received(client, data))

	//Method notifies when client disconnects
	client.on('close', () => {
		console.log('This Connection Closed!')
		console.log("Removing Client: " + client.id)
		delete(players_data[client.id])
	})

})

wss.on('listening', () => {
	console.log('listening on 8080')
})



function On_Message_Received(client, data) {
	var dataJSON = JSON.parse(data)
		//console.log("Player Message:")
		//console.log(dataJSON)
		
		if(typeof players_data[dataJSON.id] !== 'undefined') {
			players_data[dataJSON.id]["position"].x = parseFloat(dataJSON.xPos)
			players_data[dataJSON.id]["position"].y = parseFloat(dataJSON.yPos)
			players_data[dataJSON.id]["position"].z = parseFloat(dataJSON.zPos)
			Test_Reply_To_Player_Update(client, dataJSON.id)
		}
		//console.log(players_data)
		
}

function Get_Other_Players(player_id) {
	var other_players = {msg_type : "other_players_update"}
	for (let key in players_data) {
		if (players_data[key].id !== 'undefined' && players_data[key].id !== player_id) {
			let id = players_data[key].id
			other_players[""+id] = players_data[key]
		}
	}
	return other_players
}

function Test_Reply_To_Player_Update(client, player_id) {
	var other_players = Get_Other_Players(player_id)
	//console.log(other_players)
	client.send(JSON.stringify(other_players))
}