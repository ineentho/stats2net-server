#include <sourcemod>
#include <socket>

public Plugin:myinfo = {
	name = "Stats2Net",
	author = "Ineentho",
	description = "Uploads server events to a HTTP server",
	version = "0.1",
	url = "http://ineentho.com/"
}

ConVar statsURL
ConVar statsPort
static String:dataToSend[32][256]
static dataId = -1

public OnPluginStart() {
	HookEvent("player_death", Event_PlayerDeath)

	char currentMap[64]
	GetCurrentMap(currentMap, sizeof(currentMap))

	char nextMessage[256]
	Format(nextMessage, sizeof(nextMessage), "type=serverstart&map=%s", currentMap)

	dataId = dataId + 1
	dataToSend[dataId] = nextMessage
	statsURL = CreateConVar("stats2net_remote_host", "flygfisk-stats.ineentho.com")
	statsPort = CreateConVar("stats2net_remote_port", "80")
	SendHttp()
}

public OnMapStart() {
	char currentMap[64]
	GetCurrentMap(currentMap, sizeof(currentMap))

	char nextMessage[256]
	Format(nextMessage, sizeof(nextMessage), "type=map&map=%s", currentMap)

	dataId = dataId + 1
	dataToSend[dataId] = nextMessage

	SendHttp()
}

public SendHttp() {
	new Handle:socket = SocketCreate(SOCKET_TCP, OnSocketError);
	char strStatsUrl[128]
	statsURL.GetString(strStatsUrl, 128)
	SocketConnect(socket, OnSocketConnected, OnSocketReceive, OnSocketDisconnected, strStatsUrl, statsPort.IntValue)
}

public OnSocketConnected(Handle:socket, any:data) {
	decl String:requestStr[512]
	char strStatsUrl[128]
	statsURL.GetString(strStatsUrl, 128)
	char strStatsPort[10]
	statsPort.GetString(strStatsPort, 128)
	Format(requestStr, sizeof(requestStr), "GET /addon/action?%s HTTP/1.1\r\nHost: %s:%s\r\nConnection: close\r\n\r\n", dataToSend[dataId], strStatsUrl, strStatsPort)
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

	new victimClient = GetClientOfUserId(victimId)
	new attackerClient = GetClientOfUserId(attackerId)

	decl String:victimName[64]
	decl String:attackerName[64]
	GetClientName(victimClient, victimName, sizeof(victimName))
	GetClientName(attackerClient, attackerName, sizeof(attackerName))

	decl String:victimSteam[32]
	decl String:attackerSteam[32]

	if (IsFakeClient(victimClient)) {
		victimSteam = "BOT"
	} else {
		GetClientAuthId(victimClient, AuthId_SteamID64, victimSteam, sizeof(victimSteam))
	}

	if (IsFakeClient(attackerClient)) {
		attackerSteam = "BOT"
	} else {
		GetClientAuthId(attackerClient, AuthId_SteamID64, attackerSteam, sizeof(attackerSteam))
	}

	//PrintToServer("vID: %d, aID: %d, vName: %s, aName: %s, HS: %d", victimId, attackerId, victimName, attackerName, headshot)

	decl String:data[256]
	Format(data, sizeof(data), "type=kill&victimId=%d&attackerId=%d&victimName=%s&attackerName=%s&victimSteam=%s&attackerSteam=%s&headshot=%d", victimId, attackerId, victimName, attackerName, victimSteam, attackerSteam, headshot)
	dataId = dataId + 1
	dataToSend[dataId] = data
	SendHttp()
}