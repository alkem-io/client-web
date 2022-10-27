/**
 * Emojis management:
 * https://adamcollier.vercel.app/blog/replacing-emojis-with-html-entities
 */
let emojiUnicode = (input) => {
  return emojiUnicode.raw(input).toString('16');
};

emojiUnicode.raw = function (input)
{
  if (input.length === 1) {
    return input.charCodeAt(0);
  }
  let comp =
    (input.charCodeAt(0) - 0xd800) * 0x400 +
    (input.charCodeAt(1) - 0xdc00) +
    0x10000;
  if (comp < 0) {
    return input.charCodeAt(0);
  }
  return comp;
};

export const escapeEmojis = (string) => {
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  let emojis = string.match(regex);

  if (emojis) {
    let convertedEmojis = emojis.map((e) => {
      return emojiUnicode(e);
    });

    let index = 0;

    return string.replace(regex, function () {
      let unicodeEmoji = `&#x${convertedEmojis[index]};`;
      index++;
      return `${unicodeEmoji}`;
    });
  }

  return string;
};


export const unescapeEmojis = (string) => {
  if (!string) return string;
  const regex = /&#x([a-f0-9]+);/g;
  let emojis = string.match(regex);
  if (emojis) {
    emojis.forEach((e) => {
      const hex = e.substring(0, e.length -1).substring(3);
      string = string.replaceAll(e, String.fromCodePoint(parseInt(hex, 16)));
    });
  }

  return string;
}
