class SlotMachine {
    private game: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private pic: HTMLImageElement;
    private coord: Array<number> = [];
    private img: Array<number> = [];

    constructor() {
        this.game = <HTMLCanvasElement>document.getElementById("game");
        this.ctx = this.game.getContext("2d");
        this.pic = new Image();
        this.pic.src = "img/gems-s3ec6b0050c.png";

        for (let i = 0; i <= 6; i++) {
            this.coord[i] = i * this.loadConfig().size;
        }
        for (let i = 0; i < 90; i++) {
            this.img.push(this.coord[Math.floor(Math.random() * this.coord.length)]);
        }

        this.loadImages();
        this.animate();
    }

    private loadImages(): void {
        let data = this.loadConfig();
        let game = this.game;
        let ctx = this.ctx;
        let pic = this.pic;
        game.width = data.columns * data.sizeInField + (data.columns + 1) * data.marginX;
        game.height = data.rows * data.sizeInField + (data.rows + 1) * data.marginY;
        let img = this.img;
        let coord = this.coord;
        
        //draw lines in field
        let grd = ctx.createLinearGradient(0, 0, 0, game.height);
        grd.addColorStop(0, "transparent");
        grd.addColorStop(0.5, "#eba8d3");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        for (let i = 0; i < 7; i++) {
            ctx.fillRect(20 + data.sizeInField * i + data.marginX * i, 0, 4, game.height);
        }

        //first draw image in game layer
        pic.onload = () => {
            let k: number = 0;
            for (let i = 0; i < 5; i++) {
                let dataPosX: number = data.marginX * (i + 1) + i * data.sizeInField;
                for (let j = 0; j < 3; j++) {
                    let dataPosY: number = data.marginY * (j + 1) + j * data.sizeInField;
                    //sprite position in x, in y. size in x, in y. field position in x, in y. width, height.
                    ctx.drawImage(pic, 0, img[k], data.size, data.size, dataPosX, dataPosY, data.sizeInField, data.sizeInField);
                    k++;
                }
            }
        }
    }
    private animate(): void {
        let data = this.loadConfig();
        let game = this.game;
        let ctx = this.ctx;
        let pic = this.pic;
        let coord = this.coord;
        let img = this.img;

        //draw animation
        let array = new Array<Object>();

        function draw(col:number) {
            let k:number = col * 18;
            let dataPosX:number = data.marginX * (col + 1) + col * data.sizeInField;

            ctx.clearRect(dataPosX, 0, data.sizeInField, game.height);

            for (let j = 89; j >= 0; j--) {              
                let dataPosY:number = -array[col].offsetY + j * (data.sizeInField + data.marginY) + data.marginY;

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
            setTimeout(() => {
                array.push({
                    offsetY: 0,
                    interval: setInterval(draw, 30, col),
                    callback: callback
                })
            }, timeout)
        }

        $(() => {
            $("#spin").on("click", () => {

                $("#spin").attr('disabled', "disabled");

                for (let i = 0; i < array.length; i++) {
                    array[i].offsetY = 0;
                    clearInterval(array[i].interval);
                }

                for (let i = 0; i < 5; i++) {
                    let callback;

                    if (i == 4) {
                        callback = () => {
                            $("#spin").removeAttr('disabled');
                        };
                    }

                    createColumn(i, data.speed * i, callback);
                }

                array.length = 0;
                img.length = 0;

                for (let i = 0; i < 90; i++) {
                    img.push(coord[Math.floor(Math.random() * coord.length)]);
                }

            });
        });

    }

    private loadConfig(): any {
        let data;

        $.ajax({
            url: 'config.json',
            async: false,
        }).done((response) => {
            data = response;
        });

        return data;
    }
}

window.onload = () => {
    let machine = new SlotMachine();
};