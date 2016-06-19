/// <reference path="typings/index.d.ts" />
var canvas = document.getElementById('sprite-editor');
var preview = document.getElementById('sprite-preview');
var ctx = canvas.getContext('2d');
var ctxP = preview.getContext('2d');
var scaleSize;
(function (scaleSize) {
    scaleSize[scaleSize["Original"] = 1] = "Original";
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
var configuration = {
    brushSize: 1,
    color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
    },
    scale: scaleSize.Medium,
    showGrid: false,
    size: tileSize.Medium
};
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
    function Sprite(colorVary) {
        this.colorVary = colorVary;
        this.sprite = [];
        for (var i = 0; i < tileSize.Large; i++) {
            var columns = [];
            for (var j = 0; j < tileSize.Large; j++) {
                columns.push({
                    r: 128,
                    g: 128,
                    b: 128,
                    a: 0
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
                r: configuration.color.r + rVary,
                g: configuration.color.g + gVary,
                b: configuration.color.b + bVary,
                a: configuration.color.a
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
        for (var i = 1; i <= configuration.brushSize; i++) {
            if (i < configuration.brushSize) {
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
        for (var i = 0; i <= configuration.size; i++) {
            ctx.beginPath();
            ctx.moveTo(i * configuration.scale, 0);
            ctx.lineTo(i * configuration.scale, canvas.height);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * configuration.scale);
            ctx.lineTo(canvas.height, i * configuration.scale);
            ctx.closePath();
            ctx.stroke();
        }
    };
    Sprite.prototype.preview = function () {
        for (var i = 0; i < configuration.size; i++) {
            for (var j = 0; j < configuration.size; j++) {
                ctxP.beginPath();
                ctxP.fillStyle = rgba(this.sprite[i][j]);
                ctxP.fillRect(i, j, 1, 1);
                ctxP.closePath();
            }
        }
    };
    Sprite.prototype.render = function () {
        for (var i = 0; i < configuration.size; i++) {
            for (var j = 0; j < configuration.size; j++) {
                ctx.beginPath();
                ctx.fillStyle = rgba(this.sprite[i][j]);
                ctx.fillRect(i * configuration.scale, j * configuration.scale, configuration.scale, configuration.scale);
                ctx.closePath();
            }
        }
    };
    Sprite.prototype.toggleColorVary = function () {
        this.colorVary = !this.colorVary;
    };
    return Sprite;
})();
var sprite = new Sprite(true);
function resetCanvas() {
    canvas.width = configuration.size * configuration.scale;
    canvas.height = configuration.size * configuration.scale;
    preview.width = configuration.size;
    preview.height = configuration.size;
}
resetCanvas();
var color = new Ractive({
    el: '#color',
    template: '<div style="background-color:rgba({{red}},{{green}},{{blue}},{{alpha}})"></div>',
    data: {
        red: configuration.color.r,
        green: configuration.color.g,
        blue: configuration.color.b,
        alpha: configuration.color.a
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
        configuration.scale = value;
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
        configuration.size = value;
        resetCanvas();
    }
});
options.push({
    id: 'red',
    template: 'slider',
    selected: configuration.color.r.toString(),
    cb: function (value, ractive) {
        ractive.set('title', 'Red (' + value + ')');
        color.set('red', value);
        configuration.color.r = value;
    }
});
options.push({
    id: 'green',
    template: 'slider',
    selected: configuration.color.g.toString(),
    cb: function (value, ractive) {
        ractive.set('title', 'Green (' + value + ')');
        color.set('green', value);
        configuration.color.g = value;
    }
});
options.push({
    id: 'blue',
    template: 'slider',
    selected: configuration.color.b.toString(),
    cb: function (value, ractive) {
        ractive.set('title', 'Blue (' + value + ')');
        color.set('blue', value);
        configuration.color.b = value;
    }
});
options.push({
    id: 'alpha',
    template: 'slider',
    selected: Math.round(configuration.color.a * 100).toString(),
    max: '100',
    cb: function (value, ractive) {
        ractive.set('title', 'Alpha (' + value + ')');
        color.set('alpha', value / 100);
        configuration.color.a = value / 100;
    }
});
options.push({
    id: 'brush-size',
    template: 'slider',
    selected: configuration.brushSize.toString(),
    min: '1',
    max: '5',
    cb: function (value, ractive) {
        ractive.set('title', 'Brush Size (' + value + ')');
        configuration.brushSize = value;
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
        configuration.showGrid = !configuration.showGrid;
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
var newOption = document.getElementById('option-new');
newOption.onclick = function () {
    sprite = new Sprite(sprite.colorVary);
};
var saveOption = document.getElementById('option-save');
saveOption.onclick = function () {
    image = preview.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    location.href = image;
};
var image = null;
function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxP.clearRect(0, 0, preview.width, preview.height);
    sprite.preview();
    sprite.render();
    if (configuration.showGrid && configuration.scale != scaleSize.Original) {
        sprite.grid();
    }
}
requestAnimationFrame(update);
function draw(mouseEvent) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor((mouseEvent.clientX - rect.left) / configuration.scale);
    var y = Math.floor((mouseEvent.clientY - rect.top) / configuration.scale);
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
