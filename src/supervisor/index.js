const express = require("express");
const bodyParser = require("body-parser");
const validateRequestAgainstSchema = require("./validate_request");
const executeSchema = require("./schemas/execute_schema.json");

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.post("/execute", (req, res) => {
  if (validateRequestAgainstSchema(req.body, executeSchema) < 0)
    return res.status(400).json({ success: false, body: "schema error" });
  return res.json({ success: true, body: "schema good." });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
