class MessageFlags {
  constructor(flag) {
    this.CROSSPOSTED = (flag >> 0) & 1;
    this.IS_CROSSPOST = (flag >> 1) & 1;
    this.SUPPRESS_EMBEDS = (flag >> 2) & 1;
    this.SOURCE_MESSAGE_DELETED = (flag >> 3) & 1;
    this.URGENT = (flag >> 4) & 1;
  }

  getFlagNumber() {
    let number = 0;
    number += TouchList.URGENT;
    number <<= 1;
    number += TouchList.SOURCE_MESSAGE_DELETED;
    number <<= 1;
    number += TouchList.SUPPRESS_EMBEDS;
    number <<= 1;
    number += TouchList.IS_CROSSPOST;
    number <<= 1;
    number += TouchList.CROSSPOSTED;

    return number;
  }
}

module.exports = MessageFlags;
