const i18n = require("../util/i18n");
const d20 = require('d20');

module.exports = {
  name: "roll",
  cooldown: 2,
  description: i18n.__("roll.description"),
  execute(message, args) {

  let command = '';
  args.forEach(argument => {
    command = command + " " + argument;
  });

  let result = d20.verboseRoll(command);

  let sum = 0;
  result.forEach(roll => {
    sum += roll;
  });

  result = sum + " ["+ result +"]"
  message
      .reply(i18n.__mf("roll.result", { roll: result }))
      .catch(console.error);
  }
};
