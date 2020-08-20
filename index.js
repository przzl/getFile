const { ipadToken } = require('./config')
const { Wechaty } = require('wechaty');
const onScan = require('./on-scan')
const onMessage = require('./on-message')
const { PuppetPadplus } = require('wechaty-puppet-padplus')
const puppet = new PuppetPadplus({
  token: ipadToken
})
let bot = new Wechaty({puppet, name: 'getFile'});

bot.on('scan', onScan);
bot.on('message', onMessage);



bot
  .start()
  .then(() => {
    console.log('开始登陆微信');
  })
  .catch(async function(e) {
    console.log('初始化失败: ${e}.')
    await bot.stop()
    process.exit(1)
  });
