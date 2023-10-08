const crypto = require('crypto');

class Encrypter {
  constructor() {
    this.algorithm = 'aes-192-cbc';
    this.key = crypto.scryptSync(process.env.ENCRYPT_KEY, 'salt', 24);
    this.iv = Buffer.from(process.env.ENCRYPT_IV, 'hex');
  }

  encrypt(clearText) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    const encrypted =
      cipher.update(clearText, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    return (
      decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
    );
  }
}

module.exports = { Encrypter };
