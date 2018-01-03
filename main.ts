class SlotMachine {

    private test = new Array<HTMLImageElement>();


    constructor() {
        this.loadImages();
    }

    private loadImages(): void {

        var data = this.loadConfig();

        let game = (<HTMLCanvasElement>document.getElementById("game"));
        let ctx = game.getContext("2d");
        let lines = game.getContext("2d");

        game.width = data.columns * data.sizeInField + (data.columns + 1) * data.marginX;
        game.height = data.rows * data.sizeInField + (data.rows + 1) * data.marginY;


        /*var grd = lines.createLinearGradient(0, 0, 0, game.height);
        grd.addColorStop(0, "transparent");
        grd.addColorStop(0.5, "#eba8d3");
        grd.addColorStop(1, "transparent");
        lines.fillStyle = grd;

        lines.shadowOffsetX = 0;
        lines.shadowOffsetY = 0;
        lines.shadowBlur = 20;
        lines.shadowColor = '#eba8d3';

        for (var i = 0; i < 7; i++) {
            lines.fillRect(20 + data.sizeInField * i + data.marginX * i, 0, 4, game.height);
        }*/


        let pic = new Image();
        pic.src = "img/gems-s3ec6b0050c.png";

        let img: Array<number> = [];
        let coord: Array<number> = [];

        for (var i = 0; i <= 6; i++) {
            coord[i] = i * data.size;
        }

        for (var i = 0; i < 90; i++) {
            img.push(coord[Math.floor(Math.random() * coord.length)]);
        }


        pic.onload = () => {
            var k = 0;
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 3; j++) {
                    var dataPosX = data.marginX * (i + 1) + i * data.sizeInField;
                    var dataPosY = data.marginY * (j + 1) + j * data.sizeInField;

                    //sprite position in x, in y. size in x, in y. field position in x, in y. width, height.
                    ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);
                    k++;
                }
            }
        }


        var offsetY = 0;

        var array = new Array<Object>();

        function draw(col) {

            var k = col * 18;
            var dataPosX = data.marginX * (col + 1) + col * data.sizeInField;

            ctx.clearRect(dataPosX, 0, data.sizeInField, game.height);

            for (var j = 90; j >= 0; j--) {
                var dataPosY = -array[col].offsetY + j * (data.sizeInField + data.marginY) + data.marginY;

                ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);

                if (k == 90) {
                    k = 0;
                } else {
                    k++;
                }

                if (array[col].offsetY < data.sizeInField * 91) {
                    array[col].offsetY++;
                }
                else
                {
                    if (array[col].callback != null) {
                        array[col].callback();
                    }
                }
            }
        }

        $(() => {
            $("#spin").click(() => {

                $("#spin").attr('disabled', "disabled");

                for (var i = 0; i < array.length; i++) {
                    array[i].offsetY = 0;

                    clearInterval(array[i].interval);
                }

                for (var i = 0; i < 5; i++) {

                    var callback;

                    if (i == 4) {
                        callback = function () {
                            $("#spin").removeAttr('disabled');
                        };
                    }

                    createColumn(i, data.speed * i, callback);
                }

                array = [];

                img = [];

                for (var i = 0; i < 90; i++) {
                    img.push(coord[Math.floor(Math.random() * coord.length)]);
                }
               
            });
        });

        function createColumn(col, timeout, callback) {
            setTimeout(function () {
                array.push( {
                    offsetY: 0,
                    interval: setInterval(draw, 30, col),
                    callback: callback
                })
            }, timeout)
        }
    }

    private loadConfig(): any {
        var data;

        $.ajax({
            url: 'config.json',
            async: false,
        }).done(function (response) {
            data = response;
        });

        return data;
    }
}

window.onload = () => {
    var machine = new SlotMachine();
};