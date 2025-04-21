const mineflayer = require('mineflayer');
const readline = require('readline');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let globalTarget = null;
const gooseArmy = [];
let SAY_MESSAGE = "";
const respected = ['MrG000se', 'Goose4ik'];

rl.question('🌐 IP и порт сервера (например, 135.181.237.60:25821): ', (address) => {
  const [host, port] = address.split(":");
  rl.question('🔐 Пароль: ', (password) => {
    rl.question('🪿 Сколько ботов запустить?: ', (count) => {
      let responded = false;
      const timeout = setTimeout(() => {
        if (!responded) {
          console.log("⌛ Ты не ввёл сообщение для спама вовремя — боты не будут спамить.");
          SAY_MESSAGE = null;
          rl.close();
          launchGooseArmy(host, parseInt(port), password, parseInt(count), SAY_MESSAGE);
        }
      }, 5000);

      rl.question('💬 Что должны говорить в чат?: ', (message) => {
        responded = true;
        clearTimeout(timeout);
        SAY_MESSAGE = message;
        rl.close();
        launchGooseArmy(host, parseInt(port), password, parseInt(count), SAY_MESSAGE);
      });
    });
  });
});

function launchGooseArmy(HOST, PORT, PASSWORD, BOT_COUNT, SAY_MESSAGE) {
  for (let i = 1; i <= BOT_COUNT; i++) {
    setTimeout(() => {
      createGooseBot(i, HOST, PORT, PASSWORD, SAY_MESSAGE);
    }, i * 1000);
  }
}

function createGooseBot(id, HOST, PORT, PASSWORD, SAY_MESSAGE) {
  const username = `GooseBot_${id}`;
  const bot = mineflayer.createBot({ host: HOST, port: PORT, username, onlineMode: false });

  gooseArmy.push(bot);
  bot.loadPlugin(pathfinder);

  let spamInterval, lookInterval, jumpInterval, attackInterval, respectInterval;

  bot.once('login', () => {
    console.log(`🟢 [${username}] подключился.`);
    bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    bot.chat(`/login ${PASSWORD}`);

    setTimeout(() => {
      if (bot && bot.player) {
        bot.chat('/skin MrG000se');
        setTimeout(() => {
          if (bot && bot.player) bot.chat('/skin set MrG000se');
        }, 3000);
      }
    }, 5000);

    setTimeout(() => {
      if (bot && bot.player && SAY_MESSAGE) {
        bot.chat(SAY_MESSAGE);
        spamInterval = setInterval(() => {
          if (bot && bot.player && SAY_MESSAGE) bot.chat(SAY_MESSAGE);
        }, 3000);
      }

      lookInterval = lookAroundRandomly(bot);
      jumpInterval = jumpRandomly(bot);

      attackInterval = setInterval(() => {
        if (bot && bot.player && globalTarget) {
          const target = bot.players[globalTarget]?.entity;
          if (target && !gooseArmy.some(g => g.username === globalTarget)) {
            const mcData = require('minecraft-data')(bot.version);
            const movements = new Movements(bot, mcData);
            bot.pathfinder.setMovements(movements);
            bot.pathfinder.setGoal(new goals.GoalFollow(target, 1));
            bot.lookAt(target.position.offset(0, 1.6, 0)).catch(() => {});
            try {
              bot.attack(target);
            } catch (e) {}
          }
        }
      }, 1000);

      // Уважение к MrG000se и Goose4ik
      respectInterval = setInterval(() => {
        if (!bot || !bot.player) return;
        const onlineFriends = respected.filter(name => bot.players[name]);
        if (onlineFriends.length > 0) {
          const targetName = onlineFriends[Math.floor(Math.random() * onlineFriends.length)];
          const phrases = [
            `! Это мой брат ${targetName}, не трогайте его!`,
            `! ${targetName} — наш! Гусь из гусей.`,
            `! Мы с ${targetName} в одной стае росли!`,
            `! ${targetName} — это семья. Гусь за гуся!`,
            `! Уважайте ${targetName}, он легенда.`,
            `! Кто тронет ${targetName} — получит по клюву.`,
            `! Гусь на гуся — не воюет!`
          ];
          const phrase = phrases[Math.floor(Math.random() * phrases.length)];
          bot.chat(phrase);
        }
      }, Math.random() * 20000 + 20000);
    }, 3000);
  });

  bot.on('chat', (player, message) => {
    if (player !== bot.username) {
      const msg = message.toLowerCase();
      if (msg.includes('привет') || msg.includes('qq all') || msg.includes('all qq')) {
        const replies = [
          'Привет!', 'qq', 'Здарова!', 'Хонк!', '🪿', 'Здравствуй, путник!'
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        setTimeout(() => {
          if (bot && bot.chat) bot.chat(reply);
        }, 500 + Math.random() * 1000);
      }
    }
  });

  bot.on('entityHurt', (entity) => {
    if (!bot.entity || entity !== bot.entity) return;
    const attacker = bot.nearestEntity((e) => e.type === 'player' && e !== bot.entity);
    if (attacker && attacker.username && !gooseArmy.some(g => g.username === attacker.username)) {
      globalTarget = attacker.username;
      console.log(`🚨 [${username}] атакован! Цель: ${globalTarget}`);
      gooseArmy.forEach(g => {
        if (g && g.player && g.chat) {
          const lines = [
            `🪿 За атаку на гуся — расплата, ${globalTarget}!`,
            `⚔️ ВСЕ НА ${globalTarget}!`,
            `💢 ${globalTarget} тронул нашего!`,
            `👊 Гусиная сила летит к ${globalTarget}`
          ];
          g.chat(lines[Math.floor(Math.random() * lines.length)]);
        }
      });
    }
  });

  bot.on('message', (message) => {
    console.log(`📩 [${username}] ${message.toString()}`);
  });

  bot.on('end', () => {
    console.log(`🔌 [${username}] отключён. Перезапуск через 5 сек...`);
    clearAll();
    gooseArmy.splice(gooseArmy.indexOf(bot), 1);
    setTimeout(() => {
      createGooseBot(id, HOST, PORT, PASSWORD, SAY_MESSAGE);
    }, 5000);
  });

  bot.on('error', err => {
    console.log(`❌ [${username}] Ошибка: ${err.message}`);
  });

  function clearAll() {
    clearInterval(spamInterval);
    clearInterval(lookInterval);
    clearInterval(jumpInterval);
    clearInterval(attackInterval);
    clearInterval(respectInterval);
  }
}

function lookAroundRandomly(bot) {
  return setInterval(() => {
    if (!bot || !bot.player || !bot.look) return;
    const yaw = Math.random() * 2 * Math.PI;
    const pitch = (Math.random() - 0.5) * Math.PI / 2;
    bot.look(yaw, pitch, true).catch(() => {});
  }, 3000);
}

function jumpRandomly(bot) {
  return setInterval(() => {
    if (!bot || !bot.player) return;
    bot.setControlState('jump', true);
    setTimeout(() => {
      if (bot && bot.player) bot.setControlState('jump', false);
    }, 500);
  }, 7000);
}
