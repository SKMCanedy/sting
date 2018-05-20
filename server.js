const express = require("express");
const app = express();
const router = express.Router();
const port =  process.env.PORT || 8080;

app.use("/", express.static("public"), function (req,res){
    res.sendStatus(200);
});

app.use("/dashboard", express.static("app"), function (req,res){
    res.sendStatus(200);
});

// app.get('/dashboard', function(req, res) {
//     res.sendFile(path.join(__dirname + '/app/index.html'));
// });


app.listen(port, function (){
    console.log(`Listening on port ${port}`);
});