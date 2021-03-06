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
    loadData();
    loadDoneData();
}

document.onkeydown = function(e) {
    var code = e.charCode || e.keyCode;
    if (code == 13) {
        var t = db.transaction(["test"], "readwrite");
        var store = t.objectStore('test');
        
        var List = $("#List")[0].value;

        var request = store.put(List);

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

function loadData() {
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

function loadDoneData() {
    //打开页面的时候显示历史纪录
    var t = db.transaction(["DoneList"], "readonly");
    var store = t.objectStore('DoneList');

    var cursor = store.openCursor();

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

function displayDone(List, num, key) {
    //用来在页面中显示
    var doneList = document.createElement("ul");
    doneList.setAttribute("id", "doneList");

    var aList = document.createElement("li");
    aList.setAttribute("draggable", "true");

    var checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkBox");
    checkBox.setAttribute("onchange", "newUpdata(" +num+ "," +key+ ")");

    var para = document.createElement("p");
    para.setAttribute("id", "pd"+num);
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

    doneList.appendChild(aList);

    var prevTag = document.getElementById("Done");

    insertAfter(doneList, prevTag);
}

function updata(num, key) {
    var child = document.getElementById("p"+num);

    var used = db.transaction(["test"], "readwrite");
    var thestore = used.objectStore("test");

    thestore.delete(key);

    var t = db.transaction(["DoneList"], "readwrite");
    var store = t.objectStore("DoneList");

    var value = child.innerHTML;

    store.put(value);
    
    refresh();
}

function newUpdata(num, key) {
    var child = document.getElementById("pd"+num);
    
    var used = db.transaction(["DoneList"], "readwrite");
    var thestore = used.objectStore("DoneList");

    thestore.delete(key);

    var t = db.transaction(["test"], "readwrite");
    var store = t.objectStore("test");
    var value = child.innerHTML;

    store.put(value);
    
    refresh();
}

function deleteToDo(key) {
    var used = db.transaction(["test"], "readwrite");
    var thestore = used.objectStore("test");

    thestore.delete(key);

    refresh()
}

function deleteDone(key) {
    var used = db.transaction(["DoneList"], "readwrite");
    var thestore = used.objectStore("DoneList");

    thestore.delete(key);
    
    refresh();
}

function editToDo(key, num) {
    var p = document.getElementById("p"+num);

    var title = p.innerHTML;

    p.innerHTML = "<input id='input-" +num+ "'value="+title+">";

    var input = document.getElementById("input-"+num);
    input.setSelectionRange(0, input.value.length);
	input.focus();
    
    input.onblur = function() {
        var message = input.value;

        var used = db.transaction(["test"], "readwrite");
        var thestore = used.objectStore("test");
        var objectStoreRequest = thestore.get(key);
        thestore.put(message, key);


        objectStoreRequest.onsuccess = function(e){
            refresh();
            console.log("success");
        }
    }
}

function editDone(key, num) {
    var p = document.getElementById("pd"+num);

    var title = p.innerHTML;

    p.innerHTML = "<input id='inputd-" +num+"'value="+title+">";
    var input = document.getElementById("inputd-"+num);
	input.setSelectionRange(0, input.value.length);
	input.focus();
    
    input.onblur = function() {
        var message = input.value;

        var used = db.transaction(["DoneList"], "readwrite");
        var thestore = used.objectStore("DoneList");
        var objectStoreRequest = thestore.get(key);
        thestore.put(message, key);

        objectStoreRequest.onsuccess = function(e) {
            refresh();
            console.log("success")
        }
    }
}

function refresh(){
    setTimeout("location.reload();", 50);
}