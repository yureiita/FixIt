/**
 * FixIt decryptor for encrypted pages
 * @param {Object} option
 * @param {Function} option.ondecrypted handler after decrypting
 * @author @Lruihao https://lruihao.cn
 * @since v0.2.15
 */
FixItDecryptor = function (option = {}) {
  var _proto = FixItDecryptor.prototype;
  this.option = option || {};
  this.decryptedEventSet = new Set();

  /**
   * initialize FixIt decryptor
   */
  _proto.init = () => {
    let _decryptor = this;
    if (_decryptor.option.ondecrypted) {
      _decryptor.addEventListener('decrypted', _decryptor.option.ondecrypted);
    }
    document.querySelector('#fixit-decryptor')?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const $content = document.querySelector('#content');
        const password = $content.getAttribute('data-password');
        const base64EncodeContent = $content.getAttribute('data-content');
        // TODO 密码正则验证，只允许数字和字母 (maybe)
        const input = this.value.trim();
        const saltLen = input.length % 2 ? input.length : input.length + 1;
        const inputMd5 = CryptoJS.MD5(input).toString();
        const inputSha256 = CryptoJS.SHA256(input).toString();
        if (inputMd5 !== password) {
          return console.log('password error: ', input, inputMd5);
        }
        const base64DecodeContent = atob(base64EncodeContent.replace(inputSha256.slice(saltLen), ''));
        // TODO 记住解密状态
        this.parentNode.classList.add('d-none');
        const $decryptedContent = document.createElement('div');
        $decryptedContent.innerHTML = base64DecodeContent;
        $decryptedContent.className = 'decrypted-content';
        $content.insertAdjacentElement('afterbegin', $decryptedContent);
        // $content.insertAdjacentHTML('afterbegin', base64DecodeContent);
        // content decrypted events
        for (let event of _decryptor.decryptedEventSet) {
          event();
        }
      }
    });
  };

  /**
   * add event listener for FixIt Decryptor
   * @param {String} event
   * @param {Function} listener event handler
   */
  _proto.addEventListener = (event, listener) => {
    switch (event) {
      case 'decrypted':
        this.decryptedEventSet.add(listener);
        break;
      default:
        console.warn(`Event ${event} not found in FixIt Decryptor!`);
        break;
    }
  };

  /**
   * remove event listener for FixIt Decryptor
   * @param {String} event
   * @param {Function} listener event handler
   */
  _proto.removeEventListener = (event, listener) => {
    switch (event) {
      case 'decrypted':
        this.decryptedEventSet.delete(listener);
        break;
      default:
        console.warn(`Event ${event} not found in FixIt Decryptor!`);
        break;
    }
  };
};