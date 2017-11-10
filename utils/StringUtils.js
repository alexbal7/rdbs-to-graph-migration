'use strict';

class StringUtils {

  static toCamelCase(str) {
    let arr = str.split('_');
    let finalStr = arr[0];

    for (let i = 1; i < arr.length; i++) {
      finalStr += arr[i].slice(0, 1).toUpperCase() + arr[i].slice(1);
    }

    return finalStr;
  }

  static firstUppercase(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  }

}

module.exports = StringUtils;
