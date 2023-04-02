const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Deployed.... :D");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API -5

function LAST(aao) {
  return {
    matchId: aao.match_id,
    match: aao.match,
    year: aao.year,
  };
}

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesOfPlayerDBQuery = `
    SELECT *
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id=${playerId};`;
  const matchesId = await db.all(getMatchesOfPlayerDBQuery);
  const converting = matchesId.map((undereach) => LAST(undereach));
  response.send(converting);
});

function nemis(quesi) {
  return {
    playerId: quesi.player_id,
    playerName: quesi.player_name,
  };
}

//API-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchesOfPlayerDBQuery = `
    SELECT *
    FROM player_match_score
    WHERE match_id=${matchId};`;
  const appeal = await db.all(getMatchesOfPlayerDBQuery);
  const matchesIdArr = appeal.map((aech) => aech.player_id);

  const getMatchDetailsQuery = `
  SELECT *
  FROM player_details
  WHERE player_Id IN (${matchesIdArr});`;
  const fetchMatchDetailsResponse = await db.all(getMatchDetailsQuery);
  const namechnge = fetchMatchDetailsResponse.map((quesi) => nemis(quesi));
  response.send(namechnge);
});

//API-7

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const totalscore = `SELECT player_id as playerId,
  player_name as playerName,
  sum(score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes
    FROM player_details NATURAL JOIN player_match_score
    WHERE player_id=${playerId};`;
  const approve = await db.get(totalscore);

  response.send(approve);
});

//API-1

//convert to object
const convertPlayerDBObject = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

//GET Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * 
        FROM player_details;`;
  const getAllPlayersResponse = await db.all(getAllPlayersQuery);
  response.send(
    getAllPlayersResponse.map((eachPlayer) => convertPlayerDBObject(eachPlayer))
  );
});

//API-2
//GET Returns a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerByIDQuery = `
    SELECT * 
        FROM player_details
    WHERE player_id=${playerId};`;
  const getPlayerByIDResponse = await db.get(getPlayerByIDQuery);
  response.send(convertPlayerDBObject(getPlayerByIDResponse));
});

//API-3
//Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatePlayerNameQuery = `
    UPDATE player_details
        SET player_name='${playerName}'
    WHERE player_id=${playerId}`;
  const updatePlayerNameResponse = await db.run(updatePlayerNameQuery);
  response.send("Player Details Updated");
});

//API-4
//convert match details to object
const convertMatchDetailsObject = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};

//GET Returns the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = ` 
    SELECT * 
        FROM match_details
    WHERE match_id=${matchId}`;
  const getMatchDetailsResponse = await db.get(getMatchDetailsQuery);
  response.send(convertMatchDetailsObject(getMatchDetailsResponse));
});
module.exports = app;
