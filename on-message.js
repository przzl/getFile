const http = require('./http')
const baseConfig = require('./config');
const { FileBox } = require('wechaty');


async function onMessage(msg) {
    const room = msg.room(); // 是否为群消息
    const msgSelf = msg.self(); // 是否自己发给自己的消息
    const contact = msg.from(); // 发消息人
    if (msgSelf) {
        return;
    }
    if (room) {
        const roomName = await room.topic();
        if (roomName == baseConfig.roomName) {
            goFile(this, room, msg);
        }
    }
}

/**
 *
 * @param that
 * @param room
 * @param msg
 * @returns {Promise<void>}
 */
async function goFile(that, room, msg) {
    const contact = msg.from(); // 发消息人
    const contactName = contact.name();//
    const roomName = await room.topic();
    let content = msg.text();
    //经常群成员的备注会获取不到，需重新同步
    if (content == '更新') {
        room.sync();
        return;
    }
    const alias = await room.alias(contact);
    if (alias == null) {
        room.say("请修改群昵称！修改完后直接发送（不用@我）：更新", contact);
        return;
    }
    const type = msg.type();
    const userSelfName = that.userSelf().name();
    if (type == that.Message.Type.Text) { //文字
        const mentionSelf = content.includes(`@${userSelfName}`)
        console.log(`群名: ${roomName} 发消息人: ${contactName} 内容: ${content}`);
        console.log('是否提及:', mentionSelf);
        if (mentionSelf) {
            content = content.replace(/@[^\s]+/g, '').trim();
            console.log('content值:', content);
            if (content == 'gogogo') { //下载文件发送到群中
                let promise = http.sendPost({
                    "sysParams": JSON.stringify({
                        "businessCode": "wechat_getEmailFile",
                        "params": {"userName": alias}
                    })
                }, baseConfig.commonBusUrl);
                promise.then((res) => {
                    console.log(res);
                    if (typeof (res.businessRes.fileList) != undefined) {
                        var fileList = res.businessRes.fileList;
                        for (var i = 0; i < fileList.length; i++) {
                            var base64Code = fileList[i].fileStr;
                            var fileName = fileList[i].realFileName;
                            var buffer = new Buffer(base64Code, 'base64');
                            const fileBox = FileBox.fromBuffer(buffer, fileName);
                            room.say(fileBox);
                        }
                    } else {
                        room.say("获取失败！", contact);
                    }
                });
            } else if (content == '在么') {
                room.say("我在线");
            } else {
                room.say("不明白");
            }
        }
    } else if (type == that.Message.Type.Image || type == that.Message.Type.Attachment) { //将群中文件上传
        const file = await msg.toFileBox();
        const fileName = file.name;
        const mimeType = file.mimeType;
        let promise = file.toBase64();
        promise.then((res) => {
            let promise = http.sendPost({
                "sysParams": JSON.stringify({
                    "businessCode": "wechat_uploadFile",
                    "params": {"userName": alias, "base64Code": res, "fileName": fileName, "mimeType": mimeType}
                })
            }, baseConfig.commonBusUrl);
            promise.then((res) => {
                var returnMsg = res.businessRes;
                if (returnMsg == 'ok') {
                    room.say("上传成功");
                }
            });
        });
    } else {
        room.say("本群只能发文字和文件。");
    }
}

module.exports = onMessage;
