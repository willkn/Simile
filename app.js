const express = require('express');
const app = express();
const port = 3000;

const myAddon = require('./build/Release/test');


app.get('/', (req, res) => {
  res.send(myAddon.hello());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post('/drawio', (req, res) => {
    convertToThreeColumncsv();
})


function convertToThreeColumncsv() {

}