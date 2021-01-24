const { Validator } = require("jsonschema");
const schemaValidator = new Validator();

module.exports = (requestBody, schemaToValidateAgainst) => {
  const ret = schemaValidator.validate(requestBody, schemaToValidateAgainst);
  if (ret.valid === false) return -1;
  return 0;
};
