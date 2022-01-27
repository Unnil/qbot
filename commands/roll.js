const i18n = require("../util/i18n");

module.exports = {
  name: "roll",
  cooldown: 2,
  description: i18n.__("roll.description"),
  execute(message, args) {

  let min = 1;
	let max = 6;
  if (args.length === 1) {
    max = args[0];
  } else if (args.length > 1) {
    min = +args[0];
    max = +args[1];
  }

	if (!isFinite(min) || !isFinite(max)) {
    return message.channel.send(i18n.__mf("roll.errorInNumbers", { error: error })).catch(console.error);
	}
	if (min > max) [min, max] = [max, min];
	const randNum = Math.floor(Math.random() * (max - min + 1)) + min;

  message
      .reply(i18n.__mf("roll.result", { roll: randNum }))
      .catch(console.error);
  }
};
