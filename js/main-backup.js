function addLoadEvent(func){  
    var oldonLoad = window.onload;  
    if(typeof window.onload!='function'){  
            window.onload = func;  
    }  
    else{  
        window.onload = function(){  
            oldonload();  
            func();  
        }  
    }  
}

function insertAfter(newElement, targetElement){
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        // 如果最后的节点是目标元素，则直接添加。因为默认是最后
        parent.appendChild(newElement);
    }
    else {
        parent.insertBefore(newElement, targetElement.nextSibling);
        //如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
    }
}

var openRequest = indexedDB.open("test", 2);
var db;

openRequest.onupgradeneeded = function(e) {
    console.log("upgrading...");
    db = e.target.result;
    db.createObjectStore('test', {autoIncrement: true});
    db.createObjectStore('DoneList', {autoIncrement: true});
}

openRequest.onsuccess = function(e) {
    console.log("Success!");
    db = e.target.result;
    loadData(0);
    loadDoneData(0);
}

document.onkeydown = function(e) {
    var code = e.charCode || e.keyCode;
    if (code == 13) {
        var t = db.transaction(["test"], "readwrite");
        var store = t.objectStore('test');
        
        var List = document.getElementById("List").value;
        console.log(List);

        var request = store.add(List);

        request.onsuccess = function(e) {
            window.location.href = "index.html";
        }

        loadData(0);
    }
}

openRequest.onerror = function(e) {
    console.log("Error");
    console.dir(e);
}

function loadData(N) {
    //打开页面的时候显示历史纪录
    var t = db.transaction(["test"], "readonly");
    var store = t.objectStore('test');

    var cursor = store.openCursor();

    var num = 1;
    
    cursor.onsuccess = function(e) {
        var res = e.target.result;
        if (res) {
            var List = res.value;
            var key = res.key;
            displayToDo(List, num, key);

            num++;
            res.continue();
        }
    }
}

function displayToDo(List, num, key) {
    //用来在页面中显示
    var toDoList = document.createElement("ol");
    toDoList.setAttribute("id", "todolist");

    var aList = document.createElement("li");
    aList.setAttribute("draggable", "true");

    var checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkBox");
    checkBox.setAttribute("onchange", "updata(" +num+ "," +key+ ")");

    var para = document.createElement("p");
    para.setAttribute("id", "p"+num);
    para.setAttribute("onclick", "editToDo("+key+","+num+")");

    var paraNode = document.createTextNode(List);
    para.appendChild(paraNode);

    var Delete = document.createElement("a");
    Delete.setAttribute("href", "#");
    Delete.setAttribute("onclick", "deleteToDo("+key+")");

    var paraDelete = document.createTextNode("Delete");
    Delete.appendChild(paraDelete);

    aList.appendChild(checkBox);
    aList.appendChild(para);
    aList.appendChild(Delete);

    toDoList.appendChild(aList);

    var prevTag = $("#onProcess")[0];

    insertAfter(toDoList, prevTag);
}

function updata(num, key) {
    var child = document.getElementById("p"+num);
    
    var parent = child.parentNode;
    var grandparent = parent.parentNode;
    var final = grandparent.parentNode;


    var t = db.transaction(["test"], "readonly");
    var store = t.objectStore('test');

    var used = db.transaction(["test"], "readwrite");
    var thestore = used.objectStore("test");

    thestore.delete(key);

    final.removeChild(grandparent);

    var t = db.transaction(["DoneList"], "readwrite");
    var store = t.objectStore("DoneList");
    var value = child.innerHTML;
    store.add(value);

    loadDoneData(0);
}

function loadDoneData(N) {
    if (document.getElementById("todolist") != null) {
        var parent = document.getElementById("div2");
        var child = document.getElementsByTagName("ul");
    
        var num = child.length;

        for (i=0; i<num; num--) {
            parent.removeChild(child[i]);
        }
    }

    //打开页面的时候显示历史纪录
    var t = db.transaction(["DoneList"], "readonly");
    var store = t.objectStore('DoneList');

    var cursor = store.openCursor();

    var cursor =store.openCursor();

    var num = 1;
    
    cursor.onsuccess = function(e) {
        var res = e.target.result;
        if (res) {
            var List = res.value;
            var key = res.key;
            displayDone(List, num, key);
            num++;
            res.continue();
        }
    }
}

function displayDone(List, num, key) {
    //用来在页面中显示
    var toDoList = document.createElement("ul");
    toDoList.setAttribute("id", "todolist");

    var aList = document.createElement("li");
    aList.setAttribute("draggable", "true");

    var checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkBox");
    checkBox.setAttribute("onchange", "newUpdata(" +num+ "," +key+ ")");

    var para = document.createElement("p");
    para.setAttribute("id", "p"+num);
    para.setAttribute("onclick", "editDone("+key+","+num+")");

    var paraNode = document.createTextNode(List);
    para.appendChild(paraNode);

    var Delete = document.createElement("a");
    Delete.setAttribute("href", "#");
    Delete.setAttribute("onclick", "deleteDone("+key+")");

    var paraDelete = document.createTextNode("Delete");
    Delete.appendChild(paraDelete);

    aList.appendChild(checkBox);
    aList.appendChild(para);
    aList.appendChild(Delete);

    toDoList.appendChild(aList);

    var prevTag = document.getElementById("Done");

    insertAfter(toDoList, prevTag);
}

function newUpdata(num, key) {
    var child = document.getElementById("p"+num);
    
    var used = db.transaction(["DoneList"], "readwrite");
    var thestore = used.objectStore("DoneList");

    thestore.delete(key);

    var t = db.transaction(["test"], "readwrite");
    var store = t.objectStore("test");
    var value = child.innerHTML;
    var request = store.add(value);
    
    request.onsuccess = function(e) {
        window.location.href = "index.html";
    }


    loadData(0);
}

function deleteDone(key) {
    var used = db.transaction(["DoneList"], "readwrite");
    var thestore = used.objectStore("DoneList");

    var request = thestore.delete(key);
    
    request.onsuccess = function(e) {
        window.location.href = "index.html";
    }

    loadDoneData(1);
}

function deleteToDo(key) {
    var used = db.transaction(["test"], "readwrite");
    var thestore = used.objectStore("test");

    request = thestore.delete(key);
    request.onsuccess = function(e) {
        window.location.href = "index.html";
    }
    loadData(1);
}

function editDone(key, num) {
    var p = document.getElementById("p"+num);

    console.log(p);

    var title = p.innerHTML;

    p.innerHTML = "<input id='input-" +num+"'value="+title+"' />";
    var input = document.getElementById("input-"+num);
	input.setSelectionRange(0, input.value.length);
	input.focus();
    
    input.onblur = function() {
        var message = input.value;

        var used = db.transaction(["DoneList"], "readwrite");
        var thestore = used.objectStore("DoneList");
        var objectStoreRequest = thestore.get(key);

        objectStoreRequest.onsuccess = function(e) {
            thestore.put(message);
            deleteDone(key);
        }
    }
}

function editToDo(key, num) {
    var p = document.getElementById("p"+num);

    var title = p.innerHTML;

    p.innerHTML = "<input id='input-" +num+ "' value='"+title+"/>";

    var input = document.getElementById("input-"+num);
	input.setSelectionRange(0, input.value.length);
	input.focus();
    
    input.onblur = function() {
        var message = input.value;

        var used = db.transaction(["test"], "readwrite");
        var thestore = used.objectStore("test");
        var objectStoreRequest = thestore.get(key);

        objectStoreRequest.onsuccess = function(e) {
            thestore.put(message);
            deleteToDo(key);
        }
    }
}