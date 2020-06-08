class MassageFlags {
  constructor(flag) {
    this.CROSSPOSTED = (flag >> 0) & 1;
    this.IS_CROSSPOST = (flag >> 1) & 1;
    this.SUPPRESS_EMBEDS = (flag >> 2) & 1;
    this.SOURCE_MESSAGE_DELETED = (flag >> 3) & 1;
    this.URGENT = (flag >> 4) & 1;
  }
}

module.exports = MassageFlags;
