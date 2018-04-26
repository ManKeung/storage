// cookie存储API
window.cookieStorage = (new (function() {
  var maxage = 60*60*24*1000; // 时间
  var path = '/';

  var cookie = getCookie();

  function getCookie() {
    var cookie = {};
    var all = document.cookie;

    if(all === '') {
      return cookie;
    }

    var list = all.split('; ');

    for(var i=0; i<list.length; i++) {
      var cookies = list[i];
      var p = cookies.indexOf('=');
      var name = cookies.substring(0, p);
      var value = cookies.substring(p+1);
      value = decodeURIComponent(value);
      cookie[name] = value;
    }

    return cookie;
  }

  var keys = [];

  for(var key in cookie) {
    keys.push(key);
  }

  this.length = keys.length;

  this.key = function(n) {
    if(n<0 || n>=keys.length) {
      return null;
    }

    return keys[n];
  };

  this.setItem = function(key, value) {
    if(!(key in cookie)) {
      keys.push(key);
      this.length++;
    }

    cookie[key] = value;
    var cookies = key + '=' + encodeURIComponent(value);

    if(maxage) {
      cookies +='; max-age=' + maxage;
    }
    if(path) {
      cookies += '; path=' + path;
    }

    document.cookie = cookies;
  };

  this.getItem = function(name) {
    return cookie[name] || null;
  };

  this.removeItem = function(key) {
    if(!(key in cookie)) {
      return ;
    }

    delete cookie[key];

    for(var i=0; i<keys.length; i++) {
      if(keys[i] == key) {
        keys.splice(i, 1);
        break;
      }
    }

    this.length--;

    document.cookie = key + '=; max-age=0';
  };

  this.clear = function() { // 测试有点问题
    for(var i=0; i<keys.length; i++) {
      document.cookie = keys[i]+'; max-age=0';
    }

    cookie = {};
    keys = [];
    this.length = 0;
  };
})());

// 兼容写法
window.myStorage = (new (function() {
  var storage = null; // 声明一个变量，用于确定使用哪个本地存储函数

  if(window.localStorage) {
    storage = localStorage; // h5
  }else {
    storage = cookieStorage; // 不支持h5
  }

  this.setItem = function(key, value) {
    storage.setItem(key, value);
  };

  this.getItem = function(name) {
    return storage.getItem(name);
  };

  this.removeItem = function(key) {
    storage.removeItem(key);
  };

  this.clear = function() {
    storage.clear();
  };
})());

//  json2.js
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (typeof JSON !== "object") {
  JSON = {};
}

(function() {
  "use strict";

  var rx_one = /^[\],:{}\s]*$/;
  var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
  var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
  var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  function f(n) {
    // Format integers to have at least two digits.
    return (n < 10) ?
      "0" + n :
      n;
  }

  function this_value() {
    return this.valueOf();
  }

  if (typeof Date.prototype.toJSON !== "function") {

    Date.prototype.toJSON = function() {

      return isFinite(this.valueOf()) ?
        (
          this.getUTCFullYear() +
          "-" +
          f(this.getUTCMonth() + 1) +
          "-" +
          f(this.getUTCDate()) +
          "T" +
          f(this.getUTCHours()) +
          ":" +
          f(this.getUTCMinutes()) +
          ":" +
          f(this.getUTCSeconds()) +
          "Z"
        ) :
        null;
    };

    Boolean.prototype.toJSON = this_value;
    Number.prototype.toJSON = this_value;
    String.prototype.toJSON = this_value;
  }

  var gap;
  var indent;
  var meta;
  var rep;


  function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string) ?
      "\"" + string.replace(rx_escapable, function(a) {
        var c = meta[a];
        return typeof c === "string" ?
          c :
          "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + "\"" :
      "\"" + string + "\"";
  }


  function str(key, holder) {

    // Produce a string from holder[key].

    var i; // The loop counter.
    var k; // The member key.
    var v; // The member value.
    var length;
    var mind = gap;
    var partial;
    var value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (
      value &&
      typeof value === "object" &&
      typeof value.toJSON === "function"
    ) {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof rep === "function") {
      value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
      case "string":
        return quote(value);

      case "number":

        // JSON numbers must be finite. Encode non-finite numbers as null.

        return (isFinite(value)) ?
          String(value) :
          "null";

      case "boolean":
      case "null":

        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce "null". The case is included here in
        // the remote chance that this gets fixed someday.

        return String(value);

        // If the type is "object", we might be dealing with an object or an array or
        // null.

      case "object":

        // Due to a specification blunder in ECMAScript, typeof null is "object",
        // so watch out for that case.

        if (!value) {
          return "null";
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?

        if (Object.prototype.toString.apply(value) === "[object Array]") {

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || "null";
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.

          v = partial.length === 0 ?
            "[]" :
            gap ?
            (
              "[\n" +
              gap +
              partial.join(",\n" + gap) +
              "\n" +
              mind +
              "]"
            ) :
            "[" + partial.join(",") + "]";
          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === "object") {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === "string") {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (
                  (gap) ?
                  ": " :
                  ":"
                ) + v);
              }
            }
          }
        } else {

          // Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (
                  (gap) ?
                  ": " :
                  ":"
                ) + v);
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0 ?
          "{}" :
          gap ?
          "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
          "{" + partial.join(",") + "}";
        gap = mind;
        return v;
    }
  }

  // If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== "function") {
    meta = { // table of character substitutions
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      "\"": "\\\"",
      "\\": "\\\\"
    };
    JSON.stringify = function(value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.

      var i;
      gap = "";
      indent = "";

      // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === "number") {
        for (i = 0; i < space; i += 1) {
          indent += " ";
        }

        // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === "string") {
        indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== "function" && (
          typeof replacer !== "object" ||
          typeof replacer.length !== "number"
        )) {
        throw new Error("JSON.stringify");
      }

      // Make a fake root object containing our value under the key of "".
      // Return the result of stringifying the value.

      return str("", { "": value });
    };
  }


  // If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== "function") {
    JSON.parse = function(text, reviver) {

      // The parse method takes a text and an optional reviver function, and returns
      // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.

        var k;
        var v;
        var value = holder[key];
        if (value && typeof value === "object") {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }


      // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      rx_dangerous.lastIndex = 0;
      if (rx_dangerous.test(text)) {
        text = text.replace(rx_dangerous, function(a) {
          return (
            "\\u" +
            ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
          );
        });
      }

      // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with "()" and "new"
      // because they can cause invocation, and "=" because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.

      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
      // replace all simple value tokens with "]" characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or "]" or
      // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

      if (
        rx_one.test(
          text
          .replace(rx_two, "@")
          .replace(rx_three, "]")
          .replace(rx_four, "")
        )
      ) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.

        j = eval("(" + text + ")");

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.

        return (typeof reviver === "function") ?
          walk({ "": j }, "") :
          j;
      }

      // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError("JSON.parse");
    };
  }
}());


window.localDB = (new(function() {

  // 创建一个空间，参数为空间名
  this.createSpace = function(space_name) {
    if (typeof(space_name) !== 'string') {
      console.error('space_name参数需为字符串!');
      return false;
    }

    // 如果没有数据空间管理器，新建一个，否则检查空间管理器中是否已存在同名的空间
    if (!myStorage.getItem('localSpaceDB')) {
      var space_obj = [];
      var space_json = JSON.stringify(space_obj); // 转化对象为json格式
      myStorage.setItem('localSpaceDB', space_json);
      console.log('新建localSpaceDB成功！');
    }

    // 取出所有空间名，空间名存在json中，所以需要转化成js对象
    var space_obj = JSON.parse(myStorage.getItem('localSpaceDB'));

    // 检查对象是否存在空间名
    for (var i = 0; i < space_obj.length; i++) {
      if (space_obj[i].spaceName == space_name) {
        console.log('已存在空间名' + space_name + '，新建失败');

        return false; // 如果已存在空间名，退出函数，返回失败
      }
    }

    // 空间管理器localSpaceDB等级新空间
    var new_obj = { // 空间名保存在新对象中
      spaceName: space_name
    };

    var old_space_obj = JSON.parse(myStorage.getItem('localSpaceDB')); // 获取存储所有空间名的对象
    old_space_obj.push(new_obj);
    var new_space_json = JSON.stringify(old_space_obj);
    myStorage.setItem('localSpaceDB', new_space_json);

    // 新建一个变量名为space_name的值空间
    var data_obj = [];
    var data_json = JSON.stringify(data_obj);
    myStorage.setItem(space_name, data_json);

    console.log('新建' + space_name + '空间成功');
    return true;
  };

  // 删除一个空间，参数为空间名
  this.deleteSpace = function(space_name) {
    if (typeof(space_name) !== 'string') {
      console.log('space_name参数需为字符串！');
      return false;
    }

    // 判断是否删除的依据变量
    var isDelete = false;
    // 空间管理器待删除出的空间名的下标
    var delIndex = -1;
    // 是否存在空间管理器localSpaceDB
    if (myStorage.getItem('localSpaceDB')) {
      // 获取空间管理器中所有空间名的json数据并转化为js对象
      var all_space_name_obj = JSON.parse(myStorage.getItem('localSpaceDB'));
      // 检查是否存在space_name值得空间名，记录删除信息
      for (var i = 0; i < all_space_name_obj.length; i++) {
        if (all_space_name_obj[i].spaceName == space_name) {
          isDelete = true;
          delIndex = i;
        }
      }
      // 确定是否删除
      if (isDelete === true && delIndex !== -1) {
        all_space_name_obj.splice(delIndex, 1); // 删除空间名
        var new_space_json = JSON.stringify(all_space_name_obj); // 转化对象为js
        // 更新空间管理器
        myStorage.setItem('localSpaceDB', new_space_json);
        // 删除空间
        myStorage.removeItem(space_name);

        console.log('成功删除' + space_name + '空间');
        return true;
      } else {
        console.log('删除空间失败，不存在' + space_name + '空间');
        return false;
      }
    }
  };

  // 插入数据，参数分别为空间名、插入的对象（不单纯用值表示，用对象表示数据）
  this.insert = function(space_name, obj_data) {
    // 检查是否存在空间
    if (myStorage.getItem(space_name)) {
      // 获取空间存储的数据
      var all_data = JSON.parse(myStorage.getItem(space_name));
      // 插入数据
      all_data.push(obj_data);
      myStorage.setItem(space_name, JSON.stringify(all_data));

      console.log('已插入数据：' + obj_data + '，所有数据如下：');
      console.dir(all_data);
      return true;
    } else {
      console.log('不存在' + space_name + '空间');
      return false;
    }
  };

  // 更新数据，参数为旧的对象、用于替换旧对象的新对象
  // 如果空间中有一模一样的数据，则更新最新的那个
  this.update = function(space_name, obj_origin, obj_replace) {
    // 检查是否存在空间
    if (myStorage.getItem(space_name)) {
      // 获取旧对象下标
      var objIndex = -1;
      // 获取空间存储的数据
      var all_data = JSON.parse(myStorage.getItem(space_name));
      // 遍历空间，找到obj_origin对象
      for (var i = all_data.length - 1; i >= 0; i--) {
        // 如果找到旧对象
        if (JSON.stringify(all_data[i]) == JSON.stringify(obj_origin)) {
          objIndex = i;
        }
      }
      // 如果找到旧对象
      if (objIndex !== -1) {
        all_data.splice(objIndex, 1, obj_replace);
        // 更新空间
        myStorage.setItem(space_name, JSON.stringify(all_data));

        console.log('已更新数据：' + obj_origin + '，所有数据如下：');
        console.dir(all_data);
        return true;
      } else {
        console.log('没有' + obj_origin + '对象');
        return false;
      }
    } else {
      console.log('不存在' + space_name + '空间');
      return false;
    }
  };

  // 删除数据，参数为需要删除的对象
  // 如果空间中有一模一样的数据，则删除最新的那个
  this.delete = function(space_name, obj_data) {
    // 检查是否存在空间
    if (myStorage.getItem(space_name)) {
      // 获取旧对象下标
      var objIndex = -1;
      // 获取空间存储的数据
      var all_data = JSON.parse(myStorage.getItem(space_name));
      // 遍历空间，找到obj_data对象
      for (var i = all_data.length - 1; i >= 0; i--) {
        // 如果找到旧对象
        if (JSON.stringify(all_data[i]) == JSON.stringify(obj_data)) {
          objIndex = i;
        }
      }
      // 如果找到旧的对象
      if (objIndex !== -1) {
        all_data.splice(objIndex, 1);
        // 更新空间
        myStorage.setItem(space_name, JSON.stringify(all_data));

        console.log('已删除数据：' + obj_data + '，所有数据如下：');
        console.dir(all_data);
        return true;
      } else {
        console.log('没有' + obj_data + '对象');
        return false;
      }
    } else {
      console.log('不存在' + space_name + '空间');
      return false;
    }
  };

  //查询函数，参数为字符串或数字或数组或布尔型，或对象的属性，返回一个结果数组
  this.select = function(space_name, select_value = ' ', is_select_all = true) {
    if (myStorage.getItem(space_name)) {
      //初始化结果数组
      var select_result = [];

      //生产存储于结果数组中的对象
      function productObj(row, ob) {
        return ({
          At: row,
          Obj: ob
        });
      };

      //获取space_name空间的所有数据对象
      var all_data = JSON.parse(myStorage.getItem(space_name));

      //如果存在查询条件
      if (select_value) {
        //是否查找全部
        if (is_select_all === true && arguments.length !== 2) {
          for (var i = all_data.length - 1; i >= 0; i--) {
            //全部查找，生成结果集
            select_result.push(new productObj(i, all_data[i]));
          }
        } else {
          //条件查找
          for (var i = all_data.length - 1; i >= 0; i--) {
            //如果格式相同，检测值相等情况
            if (typeof(all_data[i]) === typeof(select_value)) {
              if (JSON.stringify(all_data[i]) === JSON.stringify(select_value)) {
                //如果找到，保存到结果集
                select_result.push(new productObj(i, all_data[i]));
              }
            } else {
              if (typeof(all_data[i]) !== 'number' ||
                typeof(all_data[i]) !== 'boolean' ||
                typeof(all_data[i]) !== 'string'
              ) {
                for (var x in all_data[i]) {
                  if (typeof(all_data[i][x]) === typeof(select_value)) {
                    if (JSON.stringify(all_data[i][x]) === JSON.stringify(select_value)) {
                      // 如果找到，保存到结果集
                      select_result.push(new productObj(i, all_data[i]));
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (select_result.length > 0) {
        console.log('查询到结果');
        console.dir(select_result);
      } else {
        console.log('没查询到结果');
      }

      // 返回结果集
      return select_result;
    } else {
      console.log('不存在' + space_name + '空间');
      return [];
    }
  };
})());

// H5本地存储的框架程序  合并所有的
