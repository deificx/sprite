/// <reference path="typings/index.d.ts" />
var canvas = document.getElementById('sprite-editor');
var preview = document.getElementById('sprite-preview');
var ctx = canvas.getContext('2d');
var ctxP = preview.getContext('2d');
var scaleSize;
(function (scaleSize) {
    scaleSize[scaleSize["Original"] = 1] = "Original";
    scaleSize[scaleSize["Small"] = 4] = "Small";
    scaleSize[scaleSize["Medium"] = 8] = "Medium";
    scaleSize[scaleSize["Large"] = 16] = "Large";
})(scaleSize || (scaleSize = {}));
var tileSize;
(function (tileSize) {
    tileSize[tileSize["Small"] = 16] = "Small";
    tileSize[tileSize["Medium"] = 32] = "Medium";
    tileSize[tileSize["Large"] = 64] = "Large";
})(tileSize || (tileSize = {}));
var scale = scaleSize.Medium;
var size = tileSize.Medium;
var showGrid = false;
function rgb(color) {
    return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}
function rgba(color) {
    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}
function clamp(n, min, max) {
    return n < min ? min : n > max ? max : n;
}
var Sprite = (function () {
    function Sprite(brushSize, colorVary, spriteSize) {
        this.brushSize = brushSize;
        this.color = {
            r: 0,
            g: 0,
            b: 0
        };
        this.colorVary = colorVary;
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
    Sprite.prototype._draw = function (x, y) {
        if (typeof this.sprite[x] !== 'undefined' && typeof this.sprite[x][y] !== 'undefined') {
            var rVary = 0;
            var gVary = 0;
            var bVary = 0;
            if (this.colorVary) {
                rVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
                gVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
                bVary = clamp(Math.round(Math.random() * 64 - 32), 0, 255);
            }
            this.sprite[x][y] = {
                r: this.color.r + rVary,
                g: this.color.g + gVary,
                b: this.color.b + bVary
            };
        }
    };
    Sprite.prototype._neighbours = function (x, y) {
        var neighbours = [];
        neighbours.push({ x: x - 1, y: y });
        neighbours.push({ x: x + 1, y: y });
        neighbours.push({ x: x, y: y - 1 });
        neighbours.push({ x: x, y: y + 1 });
        return neighbours;
    };
    Sprite.prototype.draw = function (x, y) {
        var _this = this;
        var neighbours = [{ x: x, y: y }];
        for (var i = 1; i <= this.brushSize; i++) {
            if (i < this.brushSize) {
                neighbours.forEach(function (neighbour) {
                    neighbours = neighbours.concat(_this._neighbours(neighbour.x, neighbour.y));
                });
            }
        }
        neighbours.forEach(function (neighbour) {
            _this._draw(neighbour.x, neighbour.y);
        });
    };
    Sprite.prototype.grid = function () {
        ctx.strokeStyle = rgba({ r: 128, g: 128, b: 128, a: 0.25 });
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
    Sprite.prototype.setBrushSize = function (size) {
        this.brushSize = size;
    };
    Sprite.prototype.setColor = function (color) {
        this.color = color;
    };
    Sprite.prototype.toggleColorVary = function () {
        this.colorVary = !this.colorVary;
    };
    return Sprite;
})();
var sprite = new Sprite(1, true, size);
function resetCanvas() {
    canvas.width = size * scale;
    canvas.height = size * scale;
    preview.width = size;
    preview.height = size;
}
resetCanvas();
var color = new Ractive({
    el: '#color',
    template: '<div style="background-color:rgb({{red}},{{green}},{{blue}})"></div>',
    data: {
        red: sprite.color.r,
        green: sprite.color.g,
        blue: sprite.color.b
    }
});
var options = [];
var _options = {};
options.push({
    id: 'pixel-scale',
    title: 'Pixel Scale',
    template: 'dropdown',
    selected: scaleSize.Medium.toString(),
    options: [
        {
            value: scaleSize.Original.toString(),
            label: 'Original'
        },
        {
            value: scaleSize.Small.toString(),
            label: 'Small (' + scaleSize.Small + ')'
        },
        {
            value: scaleSize.Medium.toString(),
            label: 'Medium (' + scaleSize.Medium + ')'
        },
        {
            value: scaleSize.Large.toString(),
            label: 'Large (' + scaleSize.Large + ')'
        }
    ],
    cb: function (value) {
        scale = value;
        resetCanvas();
    }
});
options.push({
    id: 'sprite-size',
    title: 'Sprite Size',
    template: 'dropdown',
    selected: tileSize.Medium.toString(),
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
    ],
    cb: function (value) {
        size = value;
        resetCanvas();
        sprite = new Sprite(sprite.brushSize, sprite.colorVary, size);
    }
});
options.push({
    id: 'red',
    template: 'slider',
    selected: sprite.color.r.toString(),
    cb: function (value, ractive) {
        ractive.set('title', 'Red (' + value + ')');
        color.set('red', value);
        sprite.setColor({
            r: value,
            g: sprite.color.g,
            b: sprite.color.b
        });
    }
});
options.push({
    id: 'green',
    template: 'slider',
    selected: sprite.color.g.toString(),
    cb: function (value, ractive) {
        ractive.set('title', 'Green (' + value + ')');
        color.set('green', value);
        sprite.setColor({
            r: sprite.color.r,
            g: value,
            b: sprite.color.b
        });
    }
});
options.push({
    id: 'blue',
    template: 'slider',
    selected: sprite.color.b.toString(),
    cb: function (value, ractive) {
        ractive.set('title', 'Blue (' + value + ')');
        color.set('blue', value);
        sprite.setColor({
            r: sprite.color.r,
            g: sprite.color.g,
            b: value
        });
    }
});
options.push({
    id: 'brush-size',
    template: 'slider',
    selected: sprite.brushSize.toString(),
    min: '1',
    max: '5',
    cb: function (value) {
        sprite.setBrushSize(value);
    }
});
options.push({
    id: 'color-variation',
    title: 'Color Variation',
    template: 'checkbox',
    selected: '',
    cb: function () {
        sprite.toggleColorVary();
    }
});
options.push({
    id: 'grid',
    title: 'Show Grid',
    template: 'checkbox',
    selected: 'checked',
    cb: function () {
        showGrid = !showGrid;
    }
});
options.forEach(function (option) {
    _options[option.id] = new Ractive({
        el: '#option-' + option.id,
        template: '#' + option.template,
        data: {
            id: option.id,
            title: option.title || option.id,
            min: option.min || '0',
            max: option.max || '255',
            options: option.options || []
        }
    });
    _options[option.id].set('selectedValue', option.selected);
    _options[option.id].observe('selectedValue', function (newValue) {
        option.cb(newValue, _options[option.id]);
    });
});
var saveOption = document.getElementById('option-save');
saveOption.onclick = function () {
    image = preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    location.href = image;
};
var image = null;
function update() {
    requestAnimationFrame(update);
    sprite.preview();
    sprite.render();
    if (showGrid && scale != scaleSize.Original) {
        sprite.grid();
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
