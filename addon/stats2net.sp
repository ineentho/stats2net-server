#include <sourcemod>
#include <socket>

public Plugin:myinfo = {
	name = "Stats2Net",
	author = "Ineentho",
	description = "Uploads server events to a HTTP server",
	version = "0.1",
	url = "http://ineentho.com/"
}

static String:dataToSend[32][256]
static dataId = -1

public OnPluginStart() {
	HookEvent("player_death", Event_PlayerDeath)
	dataId = dataId + 1
	dataToSend[dataId] = "type=serverstart"
	SendHttp()
}

public SendHttp() {
	new Handle:socket = SocketCreate(SOCKET_TCP, OnSocketError);
	SocketConnect(socket, OnSocketConnected, OnSocketReceive, OnSocketDisconnected, "fj100.ineentho.com", 3000)
}

public OnSocketConnected(Handle:socket, any:data) {
	decl String:requestStr[512]

	Format(requestStr, sizeof(requestStr), "GET /addon/action?%s HTTP/1.1\r\nHost: fj100.ineentho.com:3000\r\nConnection: close\r\n\r\n", dataToSend[dataId])
	dataId = dataId - 1
	SocketSend(socket, requestStr)
}

public OnSocketReceive(Handle:socket, String:receiveData[], const dataSize, any:data) {
	// Ignore for now, could be useful to get the score back here later
}

public OnSocketDisconnected(Handle:socket, any:data) {
	CloseHandle(socket);
}

public OnSocketError(Handle:socket, const errorType, const errorNum, any:data) {
	LogError("socket error %d (errno %d)", errorType, errorNum);
	CloseHandle(socket);
}



public Event_PlayerDeath(Handle:event, const String:name[], bool:dontBroadcast) {
	decl String:weapon[64]
	new victimId = GetEventInt(event, "userid")
	new attackerId = GetEventInt(event, "attacker")
	new bool:headshot = GetEventBool(event, "headshot")
	GetEventString(event, "weapon", weapon, sizeof(weapon))

	decl String:victimName[64]
	decl String:attackerName[64]
	new victimClient = GetClientOfUserId(victimId)
	new attackerClient = GetClientOfUserId(attackerId)
	GetClientName(victimClient, victimName, sizeof(victimName))
	GetClientName(attackerClient, attackerName, sizeof(attackerName))

	//PrintToServer("vID: %d, aID: %d, vName: %s, aName: %s, HS: %d", victimId, attackerId, victimName, attackerName, headshot)

	decl String:data[256]
	Format(data, sizeof(data), "type=kill&victimId=%d&attackerId=%d&victimName=%s&attackerName=%s&headshot=%d", victimId, attackerId, victimName, attackerName, headshot)
	dataId = dataId + 1
	dataToSend[dataId] = data
	SendHttp()
}