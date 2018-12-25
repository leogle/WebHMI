//created by lrh 2017-10-19
var topoName;
function HmiGraphyx(mainControl) {
    this.config = {
        //背景颜色
        backgroundColor: 'white',
        //选择颜色
        selectionColor: 'blue',
        backgroundImg:'',
        lineColor: "#333333",
        fontColor: "#333333",
        fill: '#2898E0',
        fontSize: 20,
        defaultWidth: 30,
        imgPath:'/content/images/water/',
        defaultHeight : 30
    };

    this.nodes = [];
    this.currentNode;
    this.currentObject;
    this.canvas = null;
    self = this;

    //初始化
    this.init = function () {
        this.control = $("#" + mainControl);
        this.canvas = new fabric.Canvas(mainControl, {
            width: this.control.width(),
            height: this.control.height(),
            backgroundColor: this.config.backgroundColor,
            selectionLineWidth: this.config.selectionColor,
        });

        //设置事件
        this.canvas.on('object:selected', function (options) {
            if (options.target) {
                self.currentObject = options.target;
                self.currentNode = self.getNodeByObject(options.target);
                self.setControl(self.canvas.getActiveObject());
                self.showProperty(options.target);
                if (options.target.lock) {
                    var obj = options.target;
                    obj.lockMovementX = true;
                    obj.lockMovementY = true;
                    obj.lockRotation = true;
                    obj.lockScalingFlip = true;
                    obj.lockScalingX = true;
                    obj.lockScalingY = true;
                    obj.lockSkewingX = true;
                    obj.lockSkewingY = true;
                    obj.lockUniScaling = true;
                    self.setLockControl(obj);
                }
            }
        });

        this.canvas.on('object:moving', function (options) {
            if (options.target) {           
                self.showProperty(options.target);
            }
        });

        this.canvas.on('selection:cleared', function (options) {
            self.currentObject = null;
            self.currentNode = null;
        });

        if (this.config.backgroundImg)
            this.canvas.setBackgroundImage(this.config.backgroundImg)
    };

    this.layout = {
    };

    //转成Json
    this.toJson = function () {
        var json = this.canvas.toJSON(['tag','tagOnImg','img']);
        return json;
    };

    //加载json
    this.loadJson = function (json) {
        this.canvas.loadFromJSON(json);
        var objs = this.canvas.getObjects();
        for (var i = 0; i < objs.length; i++) {
            this.setControl(objs[i]);
        }
    };

    this.add = function (node, fabricObject) {
        node.fabricOjb = fabricObject;
        //this.nodes.add(node);
    };

    //通过fabric对象获取Node对象
    this.getNodeByObject = function (fabricObject) {
        for (var node in this.nodes) {
            if (node.fabricOjb === fabricObject) {
                return node;
            }
        }
    };

    this.showProperty = function (fabricOjbect) {
        $("#nodeText").val(fabricOjbect.text);
        $("#nodeFontSize").val(fabricOjbect.get('fontSize'));
        $("#nodeFont").val(fabricOjbect.fontFamily);
        $("#nodeColor").val(fabricOjbect.fontColor);
        $("#nodeFill").val(fabricOjbect.fill);
        $("#nodeRotate").val(fabricOjbect.angle);
        $("#nodeScalX").val(fabricOjbect.get('scaleX'));
        $("#nodeScalY").val(fabricOjbect.get('scaleY'));
        $("#nodeX").val(fabricOjbect.left);
        $("#nodeY").val(fabricOjbect.top);
        $("#nodeTag").val(fabricOjbect.tag);
        $("#nodeTagOnImg").val(fabricOjbect.tagOnImg);
    };

    //设置控制框样式
    this.setControl = function (element) {
        element.set({
            cornerColor: 'gray',
            cornerSize: 8,
            borderColor: 'gray',
            borderDashArray: [3, 3]
        });
        element['rotatingPointOffset'] = 20;
    };

    this.setLockControl = function (element) {
        setControl(element);
        element.set({
            borderColor: 'red'
        });
    }

    //this.init();
}

/**
组态显示界面
*/
function HmiViwer(mainControl) {
    //this.prototype = new HmiGraphyx(mainControl);
    this.control = $("#" + mainControl);
    this.canvas = {};

    /*
    初始化画布
    */
    this.init = function () {
        this.canvas = new fabric.StaticCanvas(mainControl, {
            width: this.control.width(),
            height: this.control.height(),
            //backgroundColor: this.prototype.config.backgroundColor,
            //selectionLineWidth: this.prototype.config.selectionColor,
        });
    }

    /*
    *缩放画布
    *@param factor 缩放系数
    */
    this.zoom = function (factor) {
        this.canvas.setZoom(factor);
    }

    /**
    *从服务器加载布局
    */
    this.load = function (topoName) {
        var self = this;
        $.ajax({
            url: "/Hmi/GetTopo",
            async: true,
            type: "POST",
            dataType: "json",
            data: {
                "topoId": topoName,
            },
            error: function (err) {
                alert("服务器异常，请稍后重试..");
            },
            success: function (response) {
                var err = response.result;
                var json = response.topologyJson;
                if (err && err !== "ok") {
                    alert(err);
                } else {
                    self.canvas.loadFromJSON(json);
                }
            }
        });
    }
}

/**
组态编辑器
*/
function HmiEditor(mainControl) {
    this.prototype = new HmiGraphyx(mainControl);
    this.prototype.init();
    this.canvas = this.prototype.canvas;

    this.config = {
        lineColor: "#333333",
        fontColor: "#333333",
        fontSize: 20
    };
    this.layout = {
    };

    this.test = function () {
        var canvas = this.prototype.canvas;
        var rec = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            heigth: 30,
            width: 20,
            angle: 45,
        });
        var circle = new fabric.Circle({
            radius: 20, fill: 'green', left: 100, top: 100
        });
        var triangle = new fabric.Triangle({
            width: 20, height: 30, fill: 'blue', left: 50, top: 50
        });

        var image = new fabric.Image.fromURL('images/baseMode1.png', function (img) {
            img.scale(0.5).set('flipX', true);
            img.set('top', 100);
            img.set('left', 100);
            canvas.add(img);
        });

        var image2 = new fabric.Image();
        image2.setSrc('images/baseMode1.png');

        canvas.add(image2);

        this.prototype.canvas.add(rec);
        this.prototype.canvas.add(circle);
        this.prototype.canvas.add(triangle);
        //
        triangle.set({ strokeWidth: 5, stroke: 'rgba(100,200,200,0.5)' });
        circle.set('selectable', true);
        this.prototype.canvas.renderAll();
        this.prototype.canvas.remove(rec);
        this.prototype.canvas.selection = true;

        var text = new fabric.Text('hello world', { left: 100, top: 100 });
        text.tag = "abc";
        text.fill = 'red';
        this.prototype.canvas.add(text);
        console.log(JSON.stringify(canvas.toJSON(['tag'])));
        text.set('text', 'text1');
        this.canvas.renderAll();
    };

    //图形拖放
    this.prototype.drag = function (modeDiv, drawArea, text) {
        var self = this;
        modeDiv.ondragstart = function (e) {
            e = e || window.event;
            var dragSrc = this;
            var backImg = $(dragSrc).find("img").eq(0).attr("src");
            backImg = backImg.substring(backImg.lastIndexOf('/') + 1);
            var datatype = $(this).attr("datatype");
            try {
                //IE只允许KEY为text和URL
                e.dataTransfer.setData('text', backImg + ";" + text + ";" + datatype);
            } catch (ex) {
                console.log(ex);
            }
        };

        //阻止默认事件
        drawArea.ondragover = function (e) {
            e.preventDefault();
            return false;
        };

        //创建节点
        drawArea.ondrop = function (e) {
            e = e || window.event;
            var data = e.dataTransfer.getData("text");
            var img, text, datatype;
            if (data) {
                var datas = data.split(";");
                if (datas && datas.length === 3) {
                    img = datas[0];
                    text = datas[1];
                    datatype = datas[2];
                    var node;
                    if (datatype === "Text") {
                        node = new TextNode(text);
                        node.nodeImage = "";
                        var fText = new fabric.Text(text, {
                            left: e.offsetX,
                            top: e.offsetY,
                        });
                        node.fabricOjb = fText;
                        fText.tag = "";
                        self.setControl(fText);
                        self.canvas.add(fText);
                        self.add(node, fText);
                    }
                    else if (datatype === "Image") {
                        node = new ImgNode(self.config.imgPath + img);
                        //设备图片
                        new fabric.Image.fromURL(node.image, function (img) {
                            img.scale(1).set({
                                left: e.clientX,
                                top: e.clientY,
                                fontColor: '#333333',
                            });
                            img.img = node.image;
                            self.setControl(img);
                            self.canvas.add(img);
                            self.add(node, img);
                        });
                    }
                    else if (datatype === "Graphic") {
                        node = new GraphicNode();
                        var element;
                        //设置图形
                        if (text === "长方形") {
                            element = new fabric.Rect({
                                left: e.offsetX,
                                top: e.offsetY,
                                width: 50,
                                height: 50,
                                fill: self.config.fill,
                            });
                        } else if (text === "圆形") {
                            element = new fabric.Circle({
                                left: e.offsetX,
                                top: e.offsetY,
                                radius: 20,
                                fill: self.config.fill,
                            });
                        }
                        else if (text === "三角形") {
                            element = new fabric.Triangle({
                                left: e.offsetX,
                                top: e.offsetY,
                                width: 40,
                                height: 40,
                                fill: self.config.fill,
                            });
                        }
                        else if (text === "椭圆形") {
                            element = new fabric.Ellipse({
                                left: e.offsetX,
                                top: e.offsetY,
                                width: 30,
                                height: 30,
                                fill: self.config.fill,
                            });
                        }
                        else if (text === "直线") {
                            element = new fabric.Line({
                                left: e.offsetX,
                                top: e.offsetY,
                                width: 30,
                                height: 30,
                                fill: self.config.fill,
                            });
                        }
                        else if (text === "多边形") {
                            element = new fabric.Polygon({
                                left: e.offsetX,
                                top: e.offsetY,
                                width: 30,
                                height: 30,
                                fill: self.config.fill,
                            });
                        }
                        self.setControl(element);
                        self.canvas.add(element);
                        self.add(node, img);
                    }
                    //var cuurId = "device" + (++self.modeIdIndex);
                    var curId = "" + new Date().getTime() * Math.random();
                    node.deviceId = curId;
                    node.dataType = datatype;

                    ++self.modeIdIndex;

                    self.currentNode = node;
                }
            }
            if (e.preventDefault()) {
                e.preventDefault();
            }
            if (e.stopPropagation()) {
                e.stopPropagation();
            }
        }
    }
}

var editor = new HmiEditor("editorCanvas");

//常用工具操作
editor.utils = {

    //复制图元
    copy : function () {
        editor.canvas.getActiveObject().clone(function (cloned) {
            _clipboard = cloned;
        })
    },
/*
    copy2: function () {
        var copyObjs = [];
        var objs = editor.canvas.getActiveObjects();
        for (var obj in objs) {
            obj.clone(function (cloned) {
                copyObjs.push(cloned);
            })
        }
        _clipboard = copyObjs;
        editor.canvas.getActiveObject().clone(function (cloned) {
            _clipboard = cloned;
        })
    },
*/
    /*
    粘贴图元
    */
    paste: function () {
        _clipboard.clone(function (clonedObj) {
            editor.canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function (obj) {
                    canvas.add(obj);
                });
                // this should solve the unselectability
                clonedObj.setCoords();
            } else {
                editor.canvas.add(clonedObj);
            }
            _clipboard.top += 10;
            _clipboard.left += 10;
            editor.canvas.setActiveObject(clonedObj);
            editor.canvas.requestRenderAll();
        });
    },
    //移除選擇元素
    remove: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        //var node = this.prototype.currentNode;
        editor.canvas.remove(editor.prototype.currentObject);
        //editor.prototype.nodes.fabric();
    },

    //放大
    zoomin: function () {
        editor.canvas.setZoom(editor.canvas.getZoom() + 0.3);
    },
    //縮小
    zoomout: function () {
        if (editor.canvas.getZoom() > 0.3) {
            editor.canvas.setZoom(editor.canvas.getZoom() - 0.3);
        }
    },

    //组合
    group: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        if (editor.canvas.getActiveObject().type !== 'activeSelection') {
            return;
        }
        editor.canvas.getActiveObject().toGroup();
        editor.canvas.requestRenderAll();
    },

    ungroup: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        if (editor.canvas.getActiveObject().type !== 'group') {
            return;
        }
        editor.canvas.getActiveObject().toActiveSelection();
        editor.canvas.requestRenderAll();

    },

    //置顶
    bringToFront: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        editor.canvas.bringToFront(editor.canvas.getActiveObject());
    },
    //置底
    sendToBack: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        editor.canvas.sendToBack(editor.canvas.getActiveObject());
    },
    //下一层
    sendBackwards: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        editor.canvas.sendBackwards(editor.canvas.getActiveObject());
    },
    //上一层
    bringForward: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        editor.canvas.bringForward(editor.canvas.getActiveObject());
    },

    moveRight: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        editor.canvas.getActiveObject().set('left',
            editor.canvas.getActiveObject().get('left')+10);
    },

    alinLeft: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        var objs = editor.canvas.getActiveObjects();
        var x = 0;
        x = objs[0].get('left');
        for (var i = 0; i < objs.length; i++) {
            x = objs[i].get('left') < x ? objs[i].get('left'):x;
        }
        for (var i = 0; i < objs.length; i++) {
            objs[i].set('left', x);
        }
    },

    lock:function(){
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        var obj = editor.canvas.getActiveObject();
        obj.lockMovementX = true;
        obj.lockMovementY = true;
        obj.lockRotation = true;
        obj.lockScalingFlip = true;
        obj.lockScalingX = true;
        obj.lockScalingY = true;
        obj.lockSkewingX = true;
        obj.lockSkewingY = true;
        obj.lockUniScaling = true;
        obj.lock = true;
        editor.prototype.setLockControl(obj);
    },

    unlock: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        var obj = editor.canvas.getActiveObject();
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingFlip = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
        obj.lockSkewingX = false;
        obj.lockSkewingY = false;
        obj.lockUniScaling = false;
        obj.lock = false;
        editor.prototype.setControl(obj);
    },

    alinTop: function () {
        if (!editor.canvas.getActiveObject()) {
            return;
        }
        var objs = editor.canvas.getActiveObjects();
        var x = 0;
        x = objs[0].get('top');
        for (var i = 0; i < objs.length; i++) {
            x = objs[i].get('top') < x ? objs[i].get('top') : x;
        }
        for (var i = 0; i < objs.length; i++) {
            objs[i].set('top', x);
        }
    },

    //保存編輯文檔
    save: function () {
        var json = JSON.stringify(editor.canvas.toJSON(['tag','tagOnImg','img','lock']));
        $.ajax({
            url: "/hmi/SaveTopo",
            async: true,
            type: "POST",
            dataType: "json",
            data: {
                "topoJson": json,
                "topoId": topoName,
            },
            error: function (err) {
                //self.closeLoadingWindow();
                alert("服务器异常，请稍后重试..");
            },
            success: function (response) {
                var err = response.result;
                if (err && err !== "ok") {
                    if (err === "logout") {
                        handleSessionTimeOut();
                        return;
                    } else {
                        //self.closeLoadingWindow();
                        alert(err);
                    }
                } else {
                    alert("保存成功");
                    //self.replaceStage(editor.templateId, editor.topologyId, showAlert, editor.stage.topoLevel);
                    //self.closeLoadingWindow();
                }
            }
        });
    },

    //加载界面
    load : function () {
        $.ajax({
            url: "/Hmi/GetTopo",
            async: true,
            type: "POST",
            dataType: "json",
            data: {
                "topoId": topoName,
            },
            error: function () {
                //self.closeLoadingWindow();
                alert("服务器异常，请稍后重试..");
            },
            success: function (response) {
                var err = response.result;
                var json = response.topologyJson;
                if (err && err !== "ok") {
                    if (err === "logout") {
                        handleSessionTimeOut();
                        return;
                    } else {
                        //self.closeLoadingWindow();
                        jAlert(err);
                    }
                } else {
                    editor.canvas.loadFromJSON(json);
                    //editor.canvas.setBackground('gray');
                    editor.canvas.requestRenderAll();
                    var objs = editor.canvas.getObjects();
                    for (i = 0; i < objs.length; i++) {
                        if (objs[i].lock) {
                            editor.prototype.setLockControl(objs[i]);
                            editor.utils.lock(objs[i]);
                        } else {
                            editor.prototype.setControl(objs[i]);
                        }
                    }
                }
            }
        });
    }
};

//以下定义暂不需要
function Node() {
    this.x = 100;
    this.y = 100;
    this.width = 30;
    this.heigth = 30;
    this.angle = 0;
    this.fill = 'black';
    this.tag = '';
    this.fontFamily = '微软雅黑';
    this.fontSize = 18;
    this.fontColor = '#333333';
    this.fontWeight = 'normal';
    this.fabricOjb = '';
    this.text = '';
    this.image;
    this.deviceId;

    this.updateNode = function () {
        fabricOjb.set({
            left: this.x,
            top: this.y,
            angle: this.angle,
        });
    }
}

function TextNode(text) {
    Node.call(this);
    this.text = text;

    this.setText = function (text) {
        this.text = text;
    }
}

function ImgNode(url) {
    Node.call(this);
    this.image = url;
}

function GraphicNode() {
    Node.call(this);
}