// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const dbUri = "mongodb+srv://arose5:ZaraYaqob14$3@ramblerpy-5rd9x.mongodb.net/test?retryWrites=true&w=majority";
//app.use(bodyParser.json({ strict: false }));
app.use(express.json({strict: false}));
app.use(cors());

app.post('/tracks', async function(req, res) {

  MongoClient.connect(dbUri, { useNewUrlParser: true,  useUnifiedTopology: true  }, function(err, db) {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log("db connected");
    let filteredSongs = [];
    let inputs = req.body;
    console.log(inputs);

    //assign db input search variables
    var dbParams = [parseFloat(inputs.Dalow), parseFloat(inputs.Dahigh), parseFloat(inputs.Vlow), parseFloat(inputs.Vhigh), parseFloat(inputs.Tlow), parseFloat(inputs.Thigh), parseFloat(inputs.Dulow), parseFloat(inputs.Duhigh)]

    var [filterDanceabiltyLow, filterDanceabiltyHigh, filterValenceLow, filterValenceHigh, filterTempoLow, filterTempoHigh,filterDurationLow, filterDurationHigh] = dbParams;

    var dbo = db.db("Spotify_Tracks");
    dbo.collection("Tracks").aggregate([
        {$project: {
                tracks: {$filter: {
                        input: '$tracks',
                        as: 'track',
                        cond: {$and: [

                                //Lower Input
                                {$gte: ['$$track.danceability', filterDanceabiltyLow]},
                                //Higher Input
                                {$lte: ['$$track.danceability', filterDanceabiltyHigh]},

                                //Lower Input
                                {$gte: ['$$track.valence:', filterValenceLow]},
                                //Higher Input
                                {$lte: ['$$track.valence:', filterValenceHigh]},

                                //Lower Input
                                {$gte: ['$$track.tempo', filterTempoLow]},
                                //Higher Input
                                {$lte: ['$$track.tempo', filterTempoHigh]},

                                //Lower Input
                                {$gte: ['$$track.duration_ms', filterDurationLow]},
                                //Higher Input
                                {$lte: ['$$track.duration_ms', filterDurationHigh]},

                            ]}
                      }},
                _id: 0
            }}
    ])
    .toArray(function(err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
        //only stores the JSON
        filteredSongs = result[0]['tracks'];
        console.log("after db connection:");
        console.log(filteredSongs);
        res.send(filteredSongs);
        //Returns all the songs for UI function
        //return filteredSongs;
        db.close();
    });
  });
})

module.exports.handler = serverless(app);
