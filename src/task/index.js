const STATE_IDLE = 0;
const STATE_RUNNING = 0;
const STATE_COMPLETE = 0;

module.exports = (id, code, language, args) = {
    return({
        id_: id,
        state_: STATE_IDLE,
        language_: language,
        code_: code,
        args_: args,
        execute = () => {

        }
    });
}