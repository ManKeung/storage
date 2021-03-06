[TOC]

# Web Storage教程

## 1、概述：

对于Web Storage来说，实际上是Cookies存储的进化版。如果了解Cookie的人几乎一看Web Storage就会用，如果你从来没用过没了解过Cookie，没关系，看了这篇文章照样轻松玩转Web Storage。首先，学习Web Storage只需背熟这句口诀：“两个接口，四个函数”。

## 2、口诀：

+ 两个接口：分别是localStorage和sessonStorage
+ 四个函数：分别是setItem、getItem、removeItem和clear

## 3、localStorage：

+ 特性：

域内安全、永久保存。即客户端或浏览器中来自同一域名的所有页面都可访问localStorage数据且数据除了删除否则永久保存，但客户端或浏览器之间的数据相互独立。

+ 四个函数：

 A. localStorage.setItem      存储数据信息到本地
 B. localStorage.getItem      读取本地存储的信息
 C. localStorage.removeItem   删除本地存储的信息
 D. localStorage.clear        清空所有存储的信息

##  4、sessonStorage：

+ 特性：

会话控制、短期保存。会话概念与服务器端的session概念相似，短期保存指窗口或浏览器或客户端关闭后自动消除数据。

+ 四个函数：

  A. sessionStorage.setItem       存储数据信息到本地
  B. sessionStorage.getItem       读取本地存储的信息
  C. sessionStorage.removeItem    删除本地存储的信息
  D. sessionStorage.clear         清空所有存储的信息

## 5、四个函数的用法：

+ localStorage.setItem(键名，键值)

在本地客户端存储一个字符串类型的数据，其中，第一个参数“键名”代表了该数据的标识符，而第二个参数“键值”为该数据本身。如：

```
localStorage.setItem("coffeeType", "mocha");      //存储键名为coffeeType和键值为mocha的数据到本地
localStorage.setItem("coffeePrice", "28");        //有了上一句做参考，这句意思你该理解了吧
```

+ localStorage.getItem(键名)

读取已存储在本地的数据，通过键名作为参数读取出对应键名的数据。如：

```
var data = localStorage.getItem("coffeeType");   //读取对应键名为coffeeType的数据
```

+ localStorage.removeItem(键名)

移除已存储在本地的数据，通过键名作为参数删除对应键名的数据。如：

```
localStorage.removeItem("coffeeType");           //从本地存储中移除键名为coffeeType的数据
```

+ localStorage.clear()

移除本地存储所有数据。如：

```
localStorage.clear();      //保存着的"coffeePrice/28"键/值对也被移除了，所有本地数据拜拜
```

> 另外，sessionStorage中的四个函数与以上localStorage类的函数用法基本一致，就不再详解。

## 兼容问题：

有人会说本地存储是H5的新贵，但是对于老、旧的浏览器来说怎么办？那就不用老古董浏览器呗，或者使用cookie作为替代。因为大多使用localStorage是用来存储字符串的，在其他编译型的语言看来，存储字符串能做些什么，但在javascript身上，旧大放光彩，可以存储JSON格式的字符串来扩展应用，可以存储类名变量值等等信息再通过eval()来感受使用JS的快感。既然localStorage是存储字符串的，那么在老古董浏览器上，可以通过使用Cookies来做替代方案并做好域内安全。

# Web Storage应用

## 基本使用：

我们先把上面的四个函数整理一下，并加入一段验证代码用于检测本地的数据存储的存在情况。

```
// localStorage 使用测试
<script type="text/javascript">

    localStorage.setItem("coffeeType", "mocha");
    localStorage.setItem("coffeePrice", "28");

    verify();   //验证本地存储
    localStorage.removeItem("coffeeType");
    verify();   //验证coffeeType是否存在
    localStorage.clear();
    verify();   //验证coffeeType和coffeePrice是否存在

    //自定义验证函数，验证coffeeType和coffeePrice的数据是否存在
    function verify(){
        var type = localStorage.getItem("coffeeType");
        var price = localStorage.getItem("coffeePrice");
        type = type ? type : '不存在';
        price = price ? price : '不存在';

        alert( "coffeeType: " + type + "\n\n" + "coffeePrice: " + price );
    }
</script>
```

如果上面代码执行后弹出框提示不存在的话，那么意味着本地不支持H5的 localStorage 本地存储。那么不支持怎么办，DON'T 担心，可以写一段代码来兼容使用，请继续看下去。

## 2、兼容使用：

在写兼容代码前，再来说一点关于Web Storage的内容，在Web Storage的两个类中，我们比较常用的是localStorage类，至于session的话就交给后台去写吧。但是localStorage类在不支持H5的时候使用不了，所以我们将localStorage的四个函数封装一下，使得当浏览器或客户端不兼容localStorage时自动切换到Cookies存储。

首先，要写好一个操作cookie的类和函数，将四个函数的名字和参数还有功能和localStorage保持一致。正好，《JavaScript权威指南》第五版里已经写好了一个cookieStorage代码，但是呢，这段代码有BUG的，和稍微与localStorage不一致，所以我修改了一下，花了点时间造下轮子，代码如下：

```
// cookieStorage.js
//《JavaScript权威指南》一书中有实现基于cookie的存储API，我把代码敲下来
// 另外，书中的代码有错，以下为无BUG版并修改成1000天相当长的存储时间
window.cookieStorage = (new (function(){
    var maxage = 60*60*24*1000;
    var path = '/';

    var cookie = getCookie();

    function getCookie(){
        var cookie = {};
        var all = document.cookie;
        if(all === "")
            return cookie;
        var list = all.split("; ");
        for(var i=0; i < list.length; i++){
            var cookies = list[i];
            var p = cookies.indexOf("=");
            var name = cookies.substring(0,p);
            var value = cookies.substring(p+1);
            value = decodeURIComponent(value);
            cookie[name] = value;
        }
        return cookie;
    }

    var keys = [];
    for(var key in cookie)
        keys.push(key);

    this.length = keys.length;

    this.key = function(n){
        if(n<0 || n >= keys.length)
            return null;
        return keys[n];
    };

    this.setItem = function(key, value){
        if(! (key in cookie)){
            keys.push(key);
            this.length++;
        }

        cookie[key] = value;
        var cookies = key + "=" +encodeURIComponent(value);
        if(maxage)
            cookies += "; max-age=" + maxage;
        if(path)
            cookies += "; path=" + path;

        document.cookie = cookies;
    };

    this.getItem = function(name){
        return cookie[name] || null;
    };

    this.removeItem = function(key){
        if(!(key in cookie))
            return;

        delete cookie[key];

        for(var i=0; i<keys.length; i++){
            if(keys[i] === key){
                keys.splice(i, 1);
                break;
            }
        }
        this.length--;

        document.cookie = key + "=; max-age=0";
    };

    this.clear = function(){
        for(var i=0; i<keys.length; i++)
            document.cookie = keys[i] + "; max-age=0";
        cookie = {};
        keys = [];
        this.length = 0;
    };
})());
```

有了上面的cookieStorage函数，那就好办了，只需 把localStorage跟cookieStorage整合在一起 就完美了。

那么开始动手，新建一个myStorage.js文件，把上面的cookieStorage代码Copy进去，然后再开始写以下代码：

```
// myStorage.js
//本地存储，localStorage类没有存储空间的限制，而cookieStorage有存储大小限制
//在不支持localStorage的情况下会自动切换为cookieStorage
window.myStorage = (new (function(){

    var storage;    //声明一个变量，用于确定使用哪个本地存储函数

    if(window.localStorage){
        storage = localStorage;     //当localStorage存在，使用H5方式
    }
    else{
        storage = cookieStorage;    //当localStorage不存在，使用兼容方式
    }

    this.setItem = function(key, value){
        storage.setItem(key, value);
    };

    this.getItem = function(name){
        return storage.getItem(name);
    };

    this.removeItem = function(key){
        storage.removeItem(key);
    };

    this.clear = function(){
        storage.clear();
    };
})());
```

上面的代码是myStorage.js，你可以直接Copy。把做好的myStorage.js文件引入到HTML文档后，用法就是跟localStorage的函数一样，不信你试试：

+ myStorage.setItem(键名，键值)

在本地客户端存储一个字符串类型的数据，其中，第一个参数“键名”代表了该数据的标识符，而第二个参数“键值”为该数据本身。如：

```
myStorage.setItem("coffeeType", "mocha");      //存储键名为coffeeType和键值为mocha的数据到本地
myStorage.setItem("coffeePrice", "28");        //有了上一句做参考，这句意思你该理解了吧
```

+ myStorage.getItem(键名)

读取已存储在本地的数据，通过键名作为参数读取出对应键名的数据。如：

```
var data = myStorage.getItem("coffeeType");   //读取对应键名为coffeeType的数据
```

+ myStorage.removeItem(键名)

移除已存储在本地的数据，通过键名作为参数删除对应键名的数据。如：

```
myStorage.removeItem("coffeeType");           //从本地存储中移除键名为coffeeType的数据
```

+ myStorage.clear()

移除本地存储所有数据。如：

```
myStorage.clear();      //保存着的"coffeePrice/28"键/值对也被移除了，所有本地数据拜拜
```

# Web SQL教程

## 1、概述：

H5的本地存储中，其实localStorage并不算是很强大的存储，而Web SQL Database才是牛逼的存在，在浏览器或客户端直接可以实现一个本地的数据库应用，比如做一个个人的备忘录啊，注意，是个人，为什么？因为世面上只有主流的浏览器实现了WebSQL功能，很多非主流并不兼容WebSQL，并且，所谓的主流只是编程开发人员眼中的主流，如果是用户平时自己使用的那些乱七八糟的浏览器，WebSQL简直是灾难啊！！！另外，浏览器间对WebSQL的支持并非为规范，因为这个规范几年前被官方放弃了。还有一个WebSQL不能够广泛使用的原因是，大量前端工程师不懂数据库也没有上进心或好奇心或空闲时间去研究和学会应用WebSQL，导致了开发人员逃避WebSQL和用户对WebSQL没有使用习惯和各类客户端对WebSQL兼容性参差不齐等现象，是WebSQL不能够像服务器端的数据库那么广泛应用的主要原因。

## 2、口诀：

+ 一个语言：不管是WebSQL还是MySQL，SQL的语法必须掌握。SQL是一个结构化查询语言，说白就是用来查询数据的语言中是最自然、最简洁的。

+ 三个函数：分别是：

  A. openDatabase    创建或打开一个本地的数据库对象
  B. executeSql      执行SQL语句，在回调函数的参数中获取执行结果
  C. transaction     处理事务，当一条语句执行失败的时候，之前的执行全部失效

## 3、SQL：

+ 概述：

以下只是把每个功能对应的最基本的SQL语句过一遍。如果不会SQL的，仅做简单语法参考，有兴趣的童鞋需要找资料系统性地全面学习。

+ 创建数据表：

创建具有多个列，每个列用于存放可不同类型的数据。有列自然有行的概念，行代表一组数据，每组数据是当行对应的多个列的数据集合。

`CREATE TABLE IF NOT EXISTS 表名(列名称1 数据类型,  列名称2 数据类型,  列名称N 数据类型)`

+ 查询数据：

从某表中查询某行某列的数据或查询表中所有元素。

`SELECT 列名称1,列名称2,列名称3 FROM 表名称 WHERE 某列名 = 某值`

+ 插入数据：

向某表中插入行数据，行中每个值对应列名。

`INSERT INTO 表名(列名称1, 列名称2, 列名称N) VALUES (值1, 值2, 值N)`

+ 更新数据：

更新某行中列的值。

`UPDATE 表名 SET 列名称1=新值, 列名称2=新值, 列名称N=新值 WHERE 某列名 = 某值`

+ 删除数据：

删除某行，否则删除所有数据。

`DELETE FROM 表名 WHERE 列名称 = 值`

## 4、Web SQL本地存储的三个函数：

+ openDatabase (数据库名字, 数据库版本号, 显示名字, 数据库保存数据的大小, 回调函数（可选）)

不过是否一脸懵逼，好奇怪是不是，参数还要写版本号，还有，显示名字什么鬼？不过，经过测试后，我都是直接这样写就是了（大小请自己定），如下：

`var db = openDatabase("MyDatabase", "", "My Database", 1024*1024);`

+ executeSql(查询字符串, 用以替换查询字符串中问号的参数, 执行成功回调函数（可选）, 执行失败回调函数（可选）)

参数一自然是SQL语句，其中值数据可用?代替；参数二是SQL语句中?对应的值（很像PDO的预处理）。注意，executeSql不能单独使用，需要在事务transaction函数下使用。例子如下：

`executeSql("CREATE TABLE IF NOT EXISTS MyData(name TEXT,message TEXT,time INTEGER)");`

+ transaction(包含事务内容的一个方法, 执行成功回调函数（可选）, 执行失败回调函数（可选）)

事务内容为一个或多个executeSql函数构成。这个函数很难用语言表达，所以请看例子：

```
db.transaction(function(tx){
             tx.executeSql("CREATE TABLE IF NOT EXISTS MyData(name TEXT,message TEXT,time INTEGER)", [], function(){                         alert("create ok")});
                 tx.executeSql("SELECT * FROM MyData", [], function(){alert("select ok")});
                 tx.executeSql("DROP TABLE IF EXISTS MyData", [], function(){alert("drop ok")});
           });
```

## Web SQL的使用：

程序员最喜欢做的事情之一就是封装，将代码封装成自己喜欢的样子，然后在需要用到时会感谢当年封装好的类或函数不需要再造轮子就直接修改着用。所以，我也不例外，把openDatabase、executeSql、transaction三个核心函数封装成一个类。注意，这个类只是实现基本的功能，并且查询我没有写条件查询而是直接查询全部结果。对封装Web SQL有兴趣的童鞋可以研究一下以下代码：

```
// webSQL.js
//回调函数，需要被赋值成函数，初始化为null
var webSQL_create_handle = null;
var webSQL_insert_handle = null;
var webSQL_update_handle = null;
var webSQL_delete_handle = null;
var webSQL_select_handle = null;
var webSQL_drop_handle = null;

//连接数据库(数据库名，数据大小)
function webSQL(database="MyDatabase", datasize=1024*1024){
    this.db = openDatabase(database, "", "My Database", datasize);
}
webSQL.prototype={

    //作为webSQL的原型
    constructor: webSQL,

    //创建表，参数为表名和列名
    create : function(table, allcol){
        var col = "";
        for(var i=0; i<allcol.length; i++){
            col += allcol[i];

            if(i !== allcol.length-1){
                col += ",";
            }
        }
        var sql = "CREATE TABLE IF NOT EXISTS "+table+"("+col+")";
        this.db.transaction(function(tx){
            tx.executeSql(sql,
                [],
                function(tx,rs){
                    console.log(tx,"创建表成功！");
                    if(webSQL_create_handle && typeof(webSQL_create_handle)=="function"){
                        webSQL_create_handle();
                    }
                },
                function(tx,error){
                    console.log(error,"创建表失败！");
                }
            );
        });
    },

    //删除表，参数为表名
    drop : function(table){
        var sql = "DROP TABLE IF EXISTS "+table;
        this.db.transaction(function(tx){
            tx.executeSql(sql,
                [],
                function(tx,rs){
                    console.log(tx,"删除表成功！");
                    if(webSQL_drop_handle && typeof(webSQL_drop_handle)=="function"){
                        webSQL_drop_handle();
                    }
                },
                function(tx,error){
                    console.log(error,"删除表失败！");
                }
            );
        });
    },

    //插入数据，表名，列名，对应列值
    insert : function(tableName, colNameArray, colValueArray){
        var allColName = "";
        var quesMark = "";
        for(var i=0; i<colNameArray.length; i++){
            if(colNameArray[i]){
                allColName += colNameArray[i];
                quesMark += "?";
                if(i !== colNameArray.length-1){
                    allColName += ",";
                    quesMark += ",";
                }
            }
        }
        var sql = "INSERT INTO "+tableName+"("+allColName+") VALUES ("+quesMark+")";
        this.db.transaction(function(tx){
            tx.executeSql(
                sql,
                colValueArray,
                function(tx,rs){
                    console.log(tx,"插入数据成功！");
                    if(webSQL_insert_handle && typeof(webSQL_insert_handle)=="function"){
                        webSQL_insert_handle();
                    }
                },
                function(tx,error){
                    console.log(error,"插入数据失败！");
                }
            );
        });
    },

    //更新数据，表名，列名，列值，条件列名，条件列值，条件关系，是否通配
    update : function(tableName, colNameArray, colValueArray, whereColName=null, whereColValue=null, relation="&&", equal="="){
        var colAndValue = "";
        for(var i=0; i<colNameArray.length; i++){
            if(colNameArray[i]){
                colAndValue += (colNameArray[i] + "=?");
                if(i !== colNameArray.length-1){
                    colAndValue += ",";
                }
            }
        }
        var whereSyntax = "";
        if(whereColName){
            for(var j=0; j<whereColName.length; j++){
                if(whereColName[j]){
                    if(j === 0){
                        whereSyntax += " WHERE ";
                    }
                    whereSyntax += (whereColName[j] + "" + equal + "?");
                    if(j !== whereColName.length-1){
                        whereSyntax += (" "+relation+" ");
                    }
                }
            }
        }
        var fanalArray = new Array();
        for(var m=0; m<colValueArray.length; m++){
            if(colValueArray[m]){
                fanalArray.push(colValueArray[m]);
            }
        }
        if(whereColValue){
            for(var n=0; n<whereColValue.length; n++){
                if(whereColValue[n]){
                    fanalArray.push(whereColValue[n]);
                }
            }
        }
        var sql = "UPDATE "+tableName+" SET "+colAndValue+""+whereSyntax;
        this.db.transaction(function(tx){
            tx.executeSql(
                sql,
                fanalArray,
                function(tx,rs){
                    console.log(tx,"更新数据成功");
                    if(webSQL_update_handle && typeof(webSQL_update_handle)=="function"){
                        webSQL_update_handle();
                    }
                },
                function(tx,error){
                    console.log(error,"更新数据失败！");
                }
            );
        });
    },

    //删除数据，表名，条件列名，条件列值，条件关系，是否通配
    delete : function(tableName, whereColName=null, whereColValue=null, relation="&&", equal="="){
        var whereSyntax = "";
        if(whereColName){
            for(var j=0; j<whereColName.length; j++){
                if(whereColName[j]){
                    if(j === 0){
                        whereSyntax += " WHERE ";
                    }
                    whereSyntax += (whereColName[j] + "" + equal + "?");
                    if(j !== whereColName.length-1){
                        whereSyntax += (" "+relation+" ");
                    }
                }
            }
        }
        var fanalColValue = new Array();
        for(var n=0; n<whereColValue.length; n++){
            if(whereColValue[n]){
                fanalColValue.push(whereColValue[n]);
            }
        }
        var sql = "DELETE FROM "+tableName+""+whereSyntax;
        this.db.transaction(function(tx){
            tx.executeSql(
                sql,
                fanalColValue,
                function(tx,rs){
                    console.log(tx,"删除数据成功！");
                    if(webSQL_delete_handle && typeof(webSQL_delete_handle)=="function"){
                        webSQL_delete_handle();
                    }
                },
                function(tx,error){
                    console.log(error,"删除数据失败！");
                }
            );
        });
    },

    //查询所有数据
    select : function(tableName){
        var sql = "SELECT * FROM "+tableName;
        console.log("db",this.db);
        this.db.transaction(function(tx){
            tx.executeSql(
                sql,
                [],
                function(tx,rs){
                    for(var i=0; i<rs.rows.length; i++){
                        console.log(rs.rows.item(i).name, rs.rows.item(i).value);
                    }
                    if(webSQL_select_handle && typeof(webSQL_select_handle)=="function"){
                        webSQL_select_handle(rs.rows);
                    }
                },
                function(tx,error){
                    console.log(error,"查询失败");
                }
            );
        });
    }
}
```

好长好长的代码，看起来很长很臭，其实这个类非常易用，首先我要把这个类保存在js文件，我命名为webSQL.js，然后需要把这个类引入到HTML文档中使用，下面就是这个类的使用方法：

```
// webSQL.js 测试使用
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>测试Web SQL数据库</title>
</head>
<body>
    <div id="msg">
        <b>Test测试Web SQL</b><br><br><br>
    </div>

<script src="webSQL.js"></script>

<script type="text/javascript">

        //自行根据需求，补充完整查询执行后的回调函数，注意有带参数，参数为查询结果
        webSQL_select_handle = function(rows){
            document.getElementById("msg").innerHTML += "正在读取数据<br><br>";
            for(var i=0; i<rows.length; i++){
        //rows为查询结果，【rows.item(数据行号)】可得到行数据，【rows.item(行号).字段名】可得到行数据中的列字段的数据
                document.getElementById("msg").innerHTML += ((i+1)+". name: "+rows.item(i).name + ", value: " + rows.item(i).value +"<br><br>");
            }
        };

        //自行根据需求，补充完整新建数据表后的执行回调函数
        webSQL_create_handle = function(){
            document.getElementById("msg").innerHTML += "正在创建数据表<br><br>";
        };

        //自行根据需求，补充完整插入数据后的执行回调函数
        webSQL_insert_handle = function(){
            document.getElementById("msg").innerHTML += "正在插入数据<br><br>";
        };

        //自行根据需求，补充完整更新数据后的执行回调函数
        webSQL_update_handle = function(){
            document.getElementById("msg").innerHTML += "正在更新数据<br><br>";
        };

        //自行根据需求，补充完整删除数据后的执行回调函数
        webSQL_delete_handle = function(){
            document.getElementById("msg").innerHTML += "正在删除数据<br><br>";
        };

        //自行根据需求，补充完整删除表后的执行回调函数
        webSQL_drop_handle = function(){
            document.getElementById("msg").innerHTML += "正在清空并删除数据表<br><br>";
        }

        //实例化webSQL类
        var db = new webSQL("MyDatabase");

        //新建一个表，带有两个字段，分别为name和value
        db.create("myTable", ["name", "value"]);

        //插入两个数据，分别是Coffe和me
        db.insert("myTable", ["name", "value"], ["Coffee", "me"]);

        //插入两个数据，分别是JavaScript和good
        db.insert("myTable", ["name", "value"], ["JavaScript", "good"]);

        //查询所有数据
        db.select("myTable");

        //更新数据，将name字段为Coffee的值更改为lhb
        db.update("myTable",["name"],["lhb"],["name"],["Coffee"]);

        //查询所有数据
        db.select("myTable");

        //删除name为lhb的数据
        db.delete("myTable",["name"],["lhb"]);

        //查询所有数据
        db.select("myTable");

        //删除表
        db.drop("myTable");
</script>
</body>
</html>
```

用法非常简单是不是，直接往我写好的函数传参数即可，不过这段代码只在Chrome谷歌浏览器测试通过，其他浏览器没试过，不确定是否兼容其他浏览器。

# H5本地存储的框架程序（重点）

## 1、localStorage类高级应用：

由于并不是所有浏览器都支持WebSQL，而localStorage有着不限量且长期保存在硬盘的特点，所以可以将localStorage再改造，改造成为具备有数据库特点的应用。想要localStorage能具备数据库这种类型的功能，那只能依靠JSON来成大事了。JSON是文本、是语言、是对象、是数组，只要跟JS配合，简直就是万能的（夸张了）！由于JSON实质上是字符串，所以通过localStorage存储在本地十分方便，但是JSON又可以通过JS转化为对象（如今几乎所有语言都能解析JSON），所以小小字符串能成就无限可能。只要有想象力，JSON + JavaScript有强大的行动力。


扯远了！我们先来说说JSON如何使用：首先，到JSON官网下载 json2.js 文件并引入到HTML中；然后使用 JSON.stringify(js对象) 函数将js对象转换成json字符串，或者使用 JSON.parse(json字符串) 函数将json字符串转换成js对象。是不是很抽象？直接看代码吧：

```
// json使用方法
<script src="json2.js"></script>
<script type="text/javascript">
    var Obj = { name: 'Coffee', sex: 'man' };   //一个js对象

    var Json = JSON.stringify(Obj);   //将js对象转换成json字符串

    var Js = JSON.parse(Json);        //json字符串转换成js对象
</script>
```

掌握了JSON的基本操作后，我们就可以来实现一套方便的本地数据存储了。我们先来分析一下，我们不需要庞杂的SQL语句来解析我们要对数据库做的操作，我们只需要有一套API，直接传值调用即可。一个数据库需要建立空间来保存信息，我们先假想一个空间是可以无限扩展的、动态调整其自身大小的，但每个空间之间的值是不关联的，这个空间的概念类似传统的数据表。


所以，我们需要一个主要管理空间的函数，这个函数主要功能是：存储着每个空间的名字、可以创建新的空间、确保向空间插入数据时空间是存在的否则插入失败、可以随意删除空间。

有了空间的概念后，就需要有个管理空间内部的机器人，这个机器人所懂得的行动就像基本的SQL操作一样，具有增、删、查、改功能。

空间可以理解为一个容器，这个容器像一个数组，但这个数组的成员不是相同类型的、有各种各样风格的、有大有小的。这里成员的概念又像对象，每个对象都可以不一样。

有了以上的想法后，我的手指不受控制地跟着思路跑，结果给我写出了这么一个基于JSON的本地存储，这个是我最满意的代码之一了：

```
// localDB.js
//需要myStorage.js文件
//需要json2.js文件
if(! (myStorage && JSON)){
    alert("需要myStorage.js和json2.js两个文件");
}

window.localDB = (new (function(){

    //创建一个空间，参数为空间名
    this.createSpace = function(space_name){

        if( typeof(space_name)!=="string" ){
            console.log("space_name参数需为字符串");
            return false;
        }
        //如果还没有数据库空间管理器，新建一个，否则检测空间管理器中是否已存在同名的空间
        if(!myStorage.getItem("localSpaceDB")){
            var space_obj = [];
            var space_json = JSON.stringify(space_obj);     //转化对象为JSON格式
            myStorage.setItem("localSpaceDB", space_json);

            console.log("新建localSpaceDB成功");
        }

        //取出所有空间名，空间名存在JSON中，所以需要转化成JS对象
        var space_obj = JSON.parse(myStorage.getItem("localSpaceDB"));

        //检查对象是否存在空间名
        for(var i=0; i<space_obj.length; i++){
            if(space_obj[i].spaceName == space_name){

                console.log("已存在空间名"+space_name+"，新建失败");

                return false;   //如果已存在空间名，退出函数，返回失败值
            }
        }

        //空间管理器localSpaceDB登记新空间
        var new_obj = {     //将空间名保存在新对象中
            spaceName : space_name
        };
        var old_space_obj = JSON.parse(myStorage.getItem("localSpaceDB"));   //获取存储所有空间名的对象
        old_space_obj.push( new_obj );
        var new_space_json = JSON.stringify(old_space_obj);
        myStorage.setItem("localSpaceDB", new_space_json);

        //新建一个变量名为space_name的值的空间
        var data_obj = [];
        var data_json = JSON.stringify(data_obj);
        myStorage.setItem(space_name, data_json);

        console.log("新建"+space_name+"空间成功");
        return true;
    };


    //删除一个空间，参数为空间名
    this.deleteSpace = function(space_name){
        if( typeof(space_name)!=="string" ){
            console.log("space_name参数需为字符串");
            return false;
        }
        //判断是否删除的依据变量
        var isDelete = false;
        //空间管理器待删除的空间名的下标
        var delIndex = -1;
        //是否存在空间管理器localSpaceDB
        if(myStorage.getItem("localSpaceDB")){
            //获取空间管理器中所有空间名字的json数据并转化为js对象
            var all_space_name_obj = JSON.parse(myStorage.getItem("localSpaceDB"));
            //检测是否存在space_name值的空间名，记录删除信息
            for(var i=0; i<all_space_name_obj.length; i++){
                if(all_space_name_obj[i].spaceName == space_name){
                    isDelete = true;
                    delIndex = i;
                }
            }
            //确定是否删除
            if(isDelete === true && delIndex !== -1){
                all_space_name_obj.splice(delIndex, 1);     //删除空间名
                var new_space_json = JSON.stringify(all_space_name_obj);    //转换对象为JSON
                //更新空间管理器信息
                myStorage.setItem("localSpaceDB", new_space_json);
                //删除空间
                myStorage.removeItem(space_name);

                console.log("成功删除"+space_name+"空间");
                return true;
            }
            else{
                console.log("删除空间失败，不存在"+space_name+"空间");
                return false;
            }
        }
    };

    //插入数据，参数分别为空间名、插入的对象（不单纯用值来表示，用对象来表示数据）
    this.insert = function(space_name, obj_data){
        //检测是否存在空间
        if(myStorage.getItem(space_name)){
            //获取空间存储的数据
            var all_data = JSON.parse(myStorage.getItem(space_name));
            //插入数据
            all_data.push(obj_data);
            myStorage.setItem(space_name, JSON.stringify(all_data));

            console.log("已插入数据："+obj_data+"，所有数据如下：");
            console.dir(all_data);
            return true;
        }
        else{
            console.log("不存在"+space_name+"空间");
            return false;
        }
    };

    //更新数据，参数为旧的对象、用于替换就对象的新对象
    //如果空间中有一模一样的数据，则更新最新的那个
    this.update = function(space_name, obj_origin, obj_replace){
        //检测是否存在空间
        if(myStorage.getItem(space_name)){
            //获取旧对象下标
            var objIndex = -1;
            //获取空间存储的数据
            var all_data = JSON.parse(myStorage.getItem(space_name));
            //遍历空间，找到obj_origin对象
            for(var i=all_data.length-1; i>=0; i--){
                //如果找到旧对象
                if(JSON.stringify(all_data[i]) == JSON.stringify(obj_origin)){
                    objIndex = i;
                }
            }
            //如果找到旧对象
            if(objIndex !== -1){
                all_data.splice(objIndex, 1, obj_replace);
                //更新空间
                myStorage.setItem(space_name, JSON.stringify(all_data));

                console.log("已更新数据："+obj_origin+"，所有数据如下：");
                console.dir(all_data);
                return true;
            }
            else{
                console.log("没有"+obj_origin+"对象");
                return false;
            }
        }
        else{
            console.log("不存在"+space_name+"空间");
            return false;
        }
    };

    //删除数据，参数为需要删除的对象
    //如果空间中有一模一样的数据，则删除最新的那个
    this.delete = function(space_name, obj_data){
        //检测是否存在空间
        if(myStorage.getItem(space_name)){
            //获取旧对象下标
            var objIndex = -1;
            //获取空间存储的数据
            var all_data = JSON.parse(myStorage.getItem(space_name));
            //遍历空间，找到obj_data对象
            for(var i=all_data.length-1; i>=0; i--){
                //如果找到旧对象
                if(JSON.stringify(all_data[i]) == JSON.stringify(obj_data)){
                    objIndex = i;
                }
            }
            //如果找到旧对象
            if(objIndex !== -1){
                all_data.splice(objIndex, 1);
                //更新空间
                myStorage.setItem(space_name, JSON.stringify(all_data));

                console.log("已删除数据："+obj_data+"，所有数据如下：");
                console.dir(all_data);
                return true;
            }
            else{
                console.log("没有"+obj_data+"对象");
                return false;
            }
        }
        else{
            console.log("不存在"+space_name+"空间");
            return false;
        }
    };

    //查询函数，参数为字符串或数字或数组或布尔型，或对象的属性，返回一个结果数组
    this.select = function(space_name, select_value=" ", is_select_all=true){
        if(myStorage.getItem(space_name)){
            //初始化结果数组
            var select_result = [];

            //生产存储于结果数组中的对象
            function productObj(row, ob){
                return ({
                    At : row,
                    Obj : ob
                });
            };

            //获取space_name空间的所有数据对象
            var all_data = JSON.parse(myStorage.getItem(space_name));

            //如果存在查询条件
            if(select_value){
                //是否查找全部
                if(is_select_all === true){
                    for(var i=all_data.length-1; i>=0; i--){
                        //全部查找，生成结果集
                        select_result.push(new productObj(i,all_data[i]));
                    }
                }
                else{
                    //条件查找
                    for(var i=all_data.length-1; i>=0; i--){
                        //如果格式相同，检测值相等情况
                        if( typeof(all_data[i]) === typeof(select_value) ){
                            if(JSON.stringify(all_data[i]) === JSON.stringify(select_value) ){
                                //如果找到，保存到结果集
                                select_result.push(new productObj(i,all_data[i]));
                            }
                        }
                        else{
                            if( typeof(all_data[i]) !== "number" ||
                                typeof(all_data[i]) !== "boolean" ||
                                typeof(all_data[i]) !== "string"
                            ){
                                for( var x in all_data[i]){
                                    if(typeof(all_data[i][x]) === typeof(select_value)){
                                        if(JSON.stringify(all_data[i][x]) === JSON.stringify(select_value) ){
                                            //如果找到，保存到结果集
                                            select_result.push(new productObj(i,all_data[i]));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(select_result.length>0){
                console.log("查询到结果");
                console.dir(select_result);
            }
            else{
                console.log("没查询到结果");
            }

            //返回结果集
            return select_result;
        }
        else{
            console.log("不存在"+space_name+"空间");
            return [];
        }
    };

})());
```

至于上面的 localDB.js 的用法，很简单，我写了一个例子：

```
// localDB.js 使用测试
<script src="myStorage.js"></script>
<script src="json2.js"></script>
<script src="localDB.js"></script>

<script type="text/javascript">

    //创建一个叫Coffee存储空间
    localDB.createSpace("Coffee");

    //可以向Coffee插入任何类型的数据
    localDB.insert("Coffee", "mocha");
    localDB.insert("Coffee", {name:"cappuccino",price:28});
    localDB.insert("Coffee", false);
    localDB.insert("Coffee", [1,2,3]);

    //更新某个数据，第二个参数需要跟插入时对应的参数的值一模一样
    localDB.update("Coffee", "mocha", "DB");
    localDB.update("Coffee", {name:"cappuccino",price:28}, {name:"latte",price:31})

    //按条件查询数据并返回结果数组，最多可按条件深度挖掘到空间的第三层数据，有兴趣的童鞋可以加个递归让它不停挖掘数据
    var some = localDB.select("Coffee","man");
    //不输入第二、三参数则查找空间中全部数据
    var all = localDB.select("Coffee");

    //删除空间中的数据，第二个参数需要跟插入时对应的参数值一模一样
    localDB.delete("Coffee","DB");
    //删除Coffe空间，空间所有数据丢失
    localDB.deleteSpace("Coffee");

</script>
```

## 2、localDB数据存储的相关概念：

+ 两个空间：

这里的空间是指空间管理器的功能，一个是createSpace函数用于按名创建一个存储空间，另一个是deleteSpace函数是用于按名删除一个存储空间。

+ 四个操作：

这里的操作是指对某个空间所能执行的操作，第一个是insert操作能向空间插入任一类型的数据，第二个是update操作能用一个数据去替换空间的某个数据，第三个是delete操作能删除空间中某个数据，第四个是select操作能根据一个数据去查询空间中匹配的数据并返回一个存储着多个 { At:结果数组下标值, Obj:结果对象 } 对象的结果数组。

+ 对比：

比WebSQL简单多了有木有？本来我打算将local封装成使用SQL来操作的数据库，但是有三点理由阻止了我的冲动，第一、我没有时间（单纯完成这篇文章就花了我好几天空余时间）；第二、网上已经有大神封装过了，那个复杂啊看得我觉得再去封装没必要了；第三、就算将localDB弄成SQL的操作，体验上也没有直接用WebSQL好。如果排除了之前使用数据库的惯性，只从js角度来看，WebSQL这样的用法完全丢失了js的最大特性——动态，不采用SQL方案而选择JSON才符合JS的正统血液，只要不考虑性能问题，把性能的影响压缩到最小，基于JSON的H5本地存储才适合前端的环境，JS+JSON能诞生更多创造性的编程方法，同时H5才会越来越具备魅力和挑战。

## 3、localDB类的应用场景：

有了localDB类，能做什么？做的东西可多了，比如，在本地保存用户的账号、密码、账号信息，就可以避免同一个网站二次登陆，或者避免了多次请求重复的数据导致加大了服务器的负担，可定时根据序列号或md5值等等方案来同步本地与服务器的数据等等。总之，在H5本地存储领域，原生的localStorage是用得最广泛的，至于seesionStorage还不如服务器端语言用得方便实在，而webSQL就不必说了，兼容性太差，开发起来太麻烦，并且有点鸡肋。所以，如果你想体验或使用H5存储，可以试用我的localDB，目的是通过使用我写的localDB来提供你一些思路，然后你能根据需求来打造属于你的H5本地存储函数。

# 总结

如果是做一个网站的话，大多还是依赖着服务器，几乎所有数据都存储在服务器，大量的数值运算也在服务器，所以对于网站来说，H5本地存储除了提高用户体验、加强本地应用功能之外，似乎有点鸡肋和尴尬。但是，H5并不是都用来做网站的，比如在游戏方面，H5本地存储提供了一个很好的存储功能，也就意味着H5所做的并不一定都是联网应用，它也可以是本地应用，没有网络照样玩得转起来，在没有网络的情况下，本地存储是一个必要的存在了。在NativeApp的开发趋于重度联网应用的情况下，WebApp正在悄悄兼顾并完善着起本地的使用，在未来谁会取代谁不好说，但发展趋势是原生软件更加依赖硬件的支持即软件硬件化，而H5技术的产品则是随时随地使用化。
