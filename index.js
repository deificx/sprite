var canvas = document.getElementById('sprite-editor');
var preview = document.getElementById('sprite-preview');
var ctx = canvas.getContext('2d');
var ctxP = preview.getContext('2d');
var tileSize;
(function (tileSize) {
    tileSize[tileSize["Small"] = 16] = "Small";
    tileSize[tileSize["Medium"] = 32] = "Medium";
    tileSize[tileSize["Large"] = 64] = "Large";
})(tileSize || (tileSize = {}));
var size = tileSize.Medium;
var scale = 20;
function rgb(color) {
    return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}
function rgba(color) {
    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}
var Sprite = (function () {
    function Sprite(spriteSize) {
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
    Sprite.prototype.color = function (x, y) {
        this.sprite[x][y] = { r: 0, g: 0, b: 0 };
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
    return Sprite;
}());
var sprite = new Sprite(size);
function setCanvaseSize(newSize) {
    size = newSize;
    canvas.width = size * scale;
    canvas.height = size * scale;
    preview.width = size;
    preview.height = size;
    sprite = new Sprite(size);
}
setCanvaseSize(tileSize.Medium);
var sizeOptions = document.getElementById('option-size');
var sizeOptionSmall = document.createElement('option');
var sizeOptionMedium = document.createElement('option');
var sizeOptionLarge = document.createElement('option');
sizeOptionSmall.value = tileSize.Small.toString();
sizeOptionSmall.innerHTML = 'Small';
sizeOptions.appendChild(sizeOptionSmall);
sizeOptionMedium.value = tileSize.Medium.toString();
sizeOptionMedium.innerHTML = 'Medium';
sizeOptions.appendChild(sizeOptionMedium);
sizeOptionLarge.value = tileSize.Large.toString();
sizeOptionLarge.innerHTML = 'Large';
sizeOptions.appendChild(sizeOptionLarge);
sizeOptions.selectedIndex = 1;
sizeOptions.onchange = function () {
    setCanvaseSize(this.value);
};
function renderGrid() {
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
}
function update() {
    requestAnimationFrame(update);
    sprite.render();
    renderGrid();
    sprite.preview();
}
requestAnimationFrame(update);
function pixelate(mouseEvent) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor((mouseEvent.clientX - rect.left) / scale);
    var y = Math.floor((mouseEvent.clientY - rect.top) / scale);
    sprite.color(x, y);
}
var drawing = false;
canvas.onmousedown = function (event) {
    drawing = true;
    pixelate(event);
};
canvas.onmousemove = function (event) {
    if (drawing) {
        pixelate(event);
    }
};
canvas.onmouseup = function (event) {
    drawing = false;
};
canvas.onmouseleave = function (event) {
    drawing = false;
};
