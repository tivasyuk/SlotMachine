var SlotMachine = (function () {
    function SlotMachine() {
        this.test = new Array();
        this.loadImages();
    }
    SlotMachine.prototype.loadImages = function () {
        var data = this.loadConfig();
        var game = document.getElementById("game");
        var ctx = game.getContext("2d");
        game.width = data.columns * data.sizeInField + (data.columns + 1) * data.marginX;
        game.height = data.rows * data.sizeInField + (data.rows + 1) * data.marginY;
        var bg = new Image();
        bg.src = "https://cdn.wccftech.com/wp-content/uploads/2016/09/spacee.jpg";
        var pic = new Image();
        pic.src = "img/diamonds-s6406dbfa96.png";
        /*bg.onload = function () {
            ctx.drawImage(bg, 0, 0, game.width, game.height);
        }*/
        var img = [];
        var coord = [];
        for (var i = 0; i <= 2; i++) {
            coord[i] = i * data.size;
        }
        for (var i = 0; i < 90; i++) {
            img.push(coord[Math.floor(Math.random() * coord.length)]);
        }
        pic.onload = function () {
            var k = 0;
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 3; j++) {
                    //sprite position in x, in y. size in x, in y. field position in x, in y. width, height.
                    var dataPosX = data.marginX * (i + 1) + i * data.sizeInField;
                    var dataPosY = data.marginY * (j + 1) + j * data.sizeInField;
                    ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, 100, 100);
                    k++;
                }
            }
        };
        var currentFrame = 0;
        var array = new Array();
        function draw(col) {
            var k = col * 18;
            var dataPosX = data.marginX * (col + 1) + col * data.sizeInField;
            ctx.clearRect(dataPosX, 0, data.sizeInField, game.height);
            for (var j = 18 * 5; j >= 0; j--) {
                var dataPosY = -array[col].currentFrame + j * 120 + 20;
                ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);
                if (k == 90) {
                    k = 0;
                }
                else {
                    k++;
                }
                if (array[col].currentFrame < data.sizeInField * 18 * 5) {
                    array[col].currentFrame++;
                }
                else {
                    if (array[col].callback != null) {
                        array[col].callback();
                    }
                }
            }
        }
        // var currentFrame = 0;
        //function draw() {
        //    var index = 0;
        //    for (var column = 0; column < 5; column++) {
        //        var dataPosX = data.marginX * (column + 1) + column * data.sizeInField;
        //        ctx.clearRect(dataPosX, 0, data.sizeInField, game.height);
        //        for (var row = 0; row < 18; row++) {
        //            var dataPosY = -currentFrame + row * 120 + 20;
        //            ctx.drawImage(pic, 0, img[index], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);
        //            if (currentFrame <= data.sizeInField * 18) {
        //                currentFrame++;
        //            }
        //            index++;
        //        }
        //    }
        //}
        $(function () {
            $("#spin").click(function () {
                $("#spin").attr('disabled', "disabled");
                for (var i = 0; i < array.length; i++) {
                    array[i].currentFrame = 0;
                    clearInterval(array[i].interval);
                }
                for (var i = 0; i < 5; i++) {
                    var callback;
                    if (i == 4) {
                        callback = function () {
                            $("#spin").removeAttr('disabled');
                        };
                    }
                    createColumn(i, 350 * i, callback);
                }
                array = [];
                img = [];
                for (var i = 0; i < 90; i++) {
                    img.push(coord[Math.floor(Math.random() * coord.length)]);
                }
            });
        });
        function createColumn(col, timeout, callback) {
            currentFrame = 0;
            setTimeout(function () {
                array.push({
                    currentFrame: 0,
                    interval: setInterval(draw, 30, col),
                    callback: callback
                });
            }, timeout);
        }
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
    //machine.animate();
};
//# sourceMappingURL=main.js.map