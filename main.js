var SlotMachine = (function () {
    function SlotMachine() {
        this.coord = [];
        this.img = [];
        this.game = document.getElementById("game");
        this.ctx = this.game.getContext("2d");
        this.pic = new Image();
        this.pic.src = "img/gems-s3ec6b0050c.png";
        for (var i = 0; i <= 6; i++) {
            this.coord[i] = i * this.loadConfig().size;
        }
        for (var i = 0; i < 90; i++) {
            this.img.push(this.coord[Math.floor(Math.random() * this.coord.length)]);
        }
        this.loadImages();
        this.animate();
    }
    SlotMachine.prototype.loadImages = function () {
        var data = this.loadConfig();
        var game = this.game;
        var ctx = this.ctx;
        var pic = this.pic;
        game.width = data.columns * data.sizeInField + (data.columns + 1) * data.marginX;
        game.height = data.rows * data.sizeInField + (data.rows + 1) * data.marginY;
        var img = this.img;
        var coord = this.coord;
        //draw lines in field
        var grd = ctx.createLinearGradient(0, 0, 0, game.height);
        grd.addColorStop(0, "transparent");
        grd.addColorStop(0.5, "#eba8d3");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        for (var i = 0; i < 7; i++) {
            ctx.fillRect(20 + data.sizeInField * i + data.marginX * i, 0, 4, game.height);
        }
        //first draw image in game layer
        pic.onload = function () {
            var k = 0;
            for (var i = 0; i < 5; i++) {
                var dataPosX = data.marginX * (i + 1) + i * data.sizeInField;
                for (var j = 0; j < 3; j++) {
                    var dataPosY = data.marginY * (j + 1) + j * data.sizeInField;
                    //sprite position in x, in y. size in x, in y. field position in x, in y. width, height.
                    ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);
                    k++;
                }
            }
        };
    };
    SlotMachine.prototype.animate = function () {
        var data = this.loadConfig();
        var game = this.game;
        var ctx = this.ctx;
        var pic = this.pic;
        var coord = this.coord;
        var img = this.img;
        //draw animation
        var array = new Array();
        function draw(col) {
            var k = col * 18;
            var dataPosX = data.marginX * (col + 1) + col * data.sizeInField;
            ctx.clearRect(dataPosX, 0, data.sizeInField, game.height);
            for (var j = 89; j >= 0; j--) {
                var dataPosY = -array[col].offsetY + j * (data.sizeInField + data.marginY) + data.marginY;
                ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);
                k == 90 ? k = 0 : k++;
                if (array[col].offsetY < 87 * data.sizeInField + 87 * data.marginY) {
                    array[col].offsetY++;
                }
                else {
                    if (array[col].callback != null) {
                        array[col].callback();
                    }
                }
            }
        }
        function createColumn(col, timeout, callback) {
            setTimeout(function () {
                array.push({
                    offsetY: 0,
                    interval: setInterval(draw, 30, col),
                    callback: callback
                });
            }, timeout);
        }
        $(function () {
            $("#spin").on("click", function () {
                $("#spin").attr('disabled', "disabled");
                for (var i = 0; i < array.length; i++) {
                    array[i].offsetY = 0;
                    clearInterval(array[i].interval);
                }
                for (var i = 0; i < 5; i++) {
                    var callback = void 0;
                    if (i == 4) {
                        callback = function () {
                            $("#spin").removeAttr('disabled');
                        };
                    }
                    createColumn(i, data.speed * i, callback);
                }
                array.length = 0;
                img.length = 0;
                for (var i = 0; i < 90; i++) {
                    img.push(coord[Math.floor(Math.random() * coord.length)]);
                }
            });
        });
    };
    SlotMachine.prototype.loadConfig = function () {
        var data;
        $.ajax({
            url: 'config.json',
            async: false,
        }).done(function (response) {
            data = response;
        });
        return data;
    };
    return SlotMachine;
}());
window.onload = function () {
    var machine = new SlotMachine();
};
//# sourceMappingURL=main.js.map