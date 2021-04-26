const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");

const validateRequestAgainstSchema = require("./validate_request");
const executeSchema = require("./schemas/execute_schema.json");
const engine = require('../engine');

const port = 4000;
const app = express();

app.use(bodyParser.json());
app.use(cors())

app.post("/execute", async (req, res) => {

  console.log(req.body);

  if (validateRequestAgainstSchema(req.body, executeSchema) < 0){
    console.log("schema error")
    return res.status(400).json({ success: false, body: "schema error" });
  }
    
  
  const {code, language, blocking} = req.body;
  let ret = await engine.execute(code);
  return res.json({ success: "?", body: ret });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});