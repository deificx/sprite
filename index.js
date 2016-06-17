/// <reference path="typings/index.d.ts" />
Ractive.DEBUG = true;
var canvas = document.getElementById('sprite-editor');
var preview = document.getElementById('sprite-preview');
var ctx = canvas.getContext('2d');
var ctxP = preview.getContext('2d');
var scaleSize;
(function (scaleSize) {
    scaleSize[scaleSize["Small"] = 8] = "Small";
    scaleSize[scaleSize["Medium"] = 16] = "Medium";
    scaleSize[scaleSize["Large"] = 24] = "Large";
})(scaleSize || (scaleSize = {}));
var tileSize;
(function (tileSize) {
    tileSize[tileSize["Small"] = 16] = "Small";
    tileSize[tileSize["Medium"] = 32] = "Medium";
    tileSize[tileSize["Large"] = 64] = "Large";
})(tileSize || (tileSize = {}));
var scale = scaleSize.Medium;
var size = tileSize.Medium;
function rgb(color) {
    return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}
function rgba(color) {
    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}
var Sprite = (function () {
    function Sprite(spriteSize) {
        this.color = {
            r: 0,
            g: 0,
            b: 0
        };
        this.size = spriteSize;
        this.sprite = [];
        for (var i = 0; i < this.size; i++) {
            var columns = [];
            for (var j = 0; j < this.size; j++) {
                columns.push({
                    r: 255,
                    g: 255,
                    b: 255
                });
            }
            this.sprite.push(columns);
        }
    }
    Sprite.prototype.draw = function (x, y) {
        if (typeof this.sprite[x] !== 'undefined' && typeof this.sprite[x][y] !== 'undefined') {
            this.sprite[x][y] = {
                r: this.color.r,
                g: this.color.g,
                b: this.color.b
            };
        }
    };
    Sprite.prototype.grid = function () {
        ctx.strokeStyle = rgba({ r: 128, g: 128, b: 128, a: 0.5 });
        ctx.lineWidth = 1;
        for (var i = 0; i <= size; i++) {
            ctx.beginPath();
            ctx.moveTo(i * scale, 0);
            ctx.lineTo(i * scale, canvas.height);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * scale);
            ctx.lineTo(canvas.height, i * scale);
            ctx.closePath();
            ctx.stroke();
        }
    };
    Sprite.prototype.preview = function () {
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                ctxP.beginPath();
                ctxP.fillStyle = rgb(this.sprite[i][j]);
                ctxP.fillRect(i, j, 1, 1);
                ctxP.closePath();
            }
        }
    };
    Sprite.prototype.render = function () {
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                ctx.beginPath();
                ctx.fillStyle = rgb(this.sprite[i][j]);
                ctx.fillRect(i * scale, j * scale, scale, scale);
                ctx.closePath();
            }
        }
    };
    Sprite.prototype.setColor = function (color) {
        this.color = color;
    };
    return Sprite;
})();
var sprite = new Sprite(size);
function resetCanvas() {
    canvas.width = size * scale;
    canvas.height = size * scale;
    preview.width = size;
    preview.height = size;
}
resetCanvas();
var scaleOption = new Ractive({
    el: '#option-scale',
    template: '#dropdown',
    data: {
        id: 'pixel-scale',
        title: 'Pixel Scale',
        options: [
            {
                value: scaleSize.Small.toString(),
                label: 'Small'
            },
            {
                value: scaleSize.Medium.toString(),
                label: 'Medium'
            },
            {
                value: scaleSize.Large.toString(),
                label: 'Large'
            }
        ]
    }
});
scaleOption.set('selectedOption', scaleSize.Medium.toString());
scaleOption.observe('selectedOption', function (newValue) {
    scale = newValue;
    resetCanvas();
});
var sizeOption = new Ractive({
    el: '#option-size',
    template: '#dropdown',
    data: {
        id: 'sprite-size',
        title: 'Sprite Size',
        options: [
            {
                value: tileSize.Small.toString(),
                label: 'Small (' + tileSize.Small + 'x' + tileSize.Small + ')'
            },
            {
                value: tileSize.Medium.toString(),
                label: 'Medium (' + tileSize.Medium + 'x' + tileSize.Medium + ')'
            },
            {
                value: tileSize.Large.toString(),
                label: 'Large (' + tileSize.Large + 'x' + tileSize.Large + ')'
            },
        ]
    }
});
sizeOption.set('selectedOption', tileSize.Medium.toString());
sizeOption.observe('selectedOption', function (newValue) {
    size = newValue;
    sprite = new Sprite(size);
    resetCanvas();
});
var color = new Ractive({
    el: '#color',
    template: '<div style="background-color:rgb({{red}},{{green}},{{blue}})"></div>',
    data: {
        red: sprite.color.r,
        green: sprite.color.g,
        blue: sprite.color.b
    }
});
var redOption = new Ractive({
    el: '#option-red',
    template: '#slider',
    data: {
        id: 'red',
        min: '0',
        max: '255'
    }
});
redOption.set('selectedValue', sprite.color.r);
redOption.observe('selectedValue', function (newValue) {
    redOption.set('title', 'Red (' + newValue + ')');
    color.set('red', newValue);
    sprite.setColor({
        r: newValue,
        g: sprite.color.g,
        b: sprite.color.b
    });
});
var greenOption = new Ractive({
    el: '#option-green',
    template: '#slider',
    data: {
        id: 'green',
        min: '0',
        max: '255'
    }
});
greenOption.set('selectedValue', sprite.color.r);
greenOption.observe('selectedValue', function (newValue) {
    greenOption.set('title', 'Green (' + newValue + ')');
    color.set('green', newValue);
    sprite.setColor({
        r: sprite.color.r,
        g: newValue,
        b: sprite.color.b
    });
});
var blueOption = new Ractive({
    el: '#option-blue',
    template: '#slider',
    data: {
        id: 'blue',
        min: '0',
        max: '255'
    }
});
blueOption.set('selectedValue', sprite.color.r);
blueOption.observe('selectedValue', function (newValue) {
    blueOption.set('title', 'Blue (' + newValue + ')');
    color.set('blue', newValue);
    sprite.setColor({
        r: sprite.color.r,
        g: sprite.color.g,
        b: newValue
    });
});
var saveOption = document.getElementById('option-save');
var save = false;
saveOption.onclick = function () {
    save = true;
};
var gridOption = document.getElementById('option-grid');
var showGrid = true;
gridOption.onchange = function () {
    showGrid = !showGrid;
};
var image = null;
function update() {
    requestAnimationFrame(update);
    sprite.preview();
    sprite.render();
    if (showGrid) {
        sprite.grid();
    }
    if (save) {
        save = false;
        image = preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        location.href = image;
    }
}
requestAnimationFrame(update);
function draw(mouseEvent) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor((mouseEvent.clientX - rect.left) / scale);
    var y = Math.floor((mouseEvent.clientY - rect.top) / scale);
    sprite.draw(x, y);
}
var drawing = false;
canvas.onmousedown = function (event) {
    drawing = true;
    draw(event);
};
canvas.onmousemove = function (event) {
    if (drawing) {
        draw(event);
    }
};
canvas.onmouseup = function (event) {
    drawing = false;
};
canvas.onmouseleave = function (event) {
    drawing = false;
};
