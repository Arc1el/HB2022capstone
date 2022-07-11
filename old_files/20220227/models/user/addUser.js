const crypto = require('crypto');

//암호화 위한 salt 생성, sha-512로 암호화
const salt = () => (Math.round((new Date().valueOf() * Math.random()))) + "";
const getCrypto = (_salt, password) => (crypto.createHash("sha512").update(password + _salt).digest("hex"));

//register시 들어오는 data
class AddUser {
    constructor(data) {
        this.salt = salt();
        this.userid = data.userid;
        //비밀번호 암호화
        this.password = getCrypto(this.salt, data.password);
        this.name = data.name;
    }
}

module.exports = (data) => new AddUser(data);