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
var sprite = [];
var sprites = [];
function pixel() {
    return {
        r: 0,
        g: 255,
        b: 0
    };
}
for (var i = 0; i < size; i++) {
    var columns = [];
    for (var j = 0; j < size; j++) {
        columns.push(pixel());
    }
    sprite.push(columns);
}
sprites.push(sprite);
function setCanvaseSize(newSize) {
    size = newSize;
    canvas.width = size * scale;
    canvas.height = size * scale;
    preview.width = size;
    preview.height = size;
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
function rgb(color) {
    return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}
function rgba(color) {
    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ',' + color.a + ')';
}
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
function renderSprite() {
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            ctx.beginPath();
            ctx.fillStyle = rgb(sprite[i][j]);
            ctx.fillRect(i * scale, j * scale, scale, scale);
            ctx.closePath();
        }
    }
}
function renderPreview() {
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            ctxP.beginPath();
            ctxP.fillStyle = rgb(sprite[i][j]);
            ctxP.fillRect(i, j, 1, 1);
            ctxP.closePath();
        }
    }
}
function update() {
    requestAnimationFrame(update);
    renderSprite();
    renderGrid();
    renderPreview();
}
requestAnimationFrame(update);
