//parameters for dataSpin
class DataColumn {
    public offsetY: number;
    public interval: any;
    public callback: any;

    constructor(offsetY: number, interval: any, callback: any) {
        this.offsetY = offsetY;
        this.interval = interval;
        this.callback = callback;
    }
}

//start game
class SlotMachine {
    private game: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private pic: HTMLImageElement;
    private coordsInSprite: Array<number> = [];
    private imageRandomCoords: Array<number> = [];
    private data: any;
    private dataSpin = new Array<DataColumn>();

    constructor() {
        this.game = <HTMLCanvasElement>document.getElementById("game");
        this.ctx = this.game.getContext("2d");
        this.pic = new Image();
        this.pic.src = "img/gems-s3ec6b0050c.png";
        this.data = this.loadConfig();
        this.loadImages();
        this.handleEvents();
    }

    //create random images and start game
    public startGame(): any {
        for (let i = 0; i <= 6; i++) {
            this.coordsInSprite[i] = i * this.data.sizeSpriteImage;
        }
        for (let i = 0; i < this.data.randomImageArraySize; i++) {
            this.imageRandomCoords.push(this.coordsInSprite[Math.floor(Math.random() * this.coordsInSprite.length)]);
        }
    }

    //create first game layer when page loaded
    private loadImages(): void {
        //calculate width and height for game layer
        this.game.width = this.data.columns * this.data.sizeImageInField + (this.data.columns + 1) * this.data.marginX;
        this.game.height = this.data.rows * this.data.sizeImageInField + (this.data.rows + 1) * this.data.marginY;

        //draw vertical lines in field
        $(() => {
            let grd = this.ctx.createLinearGradient(0, 0, 0, this.game.height);
            grd.addColorStop(0, "transparent");
            grd.addColorStop(0.5, this.data.drawLinesColor);
            grd.addColorStop(1, "transparent");
            this.ctx.fillStyle = grd;
            for (let i = 0; i <= this.data.columns + 1; i++) {
                this.ctx.fillRect(20 + this.data.sizeImageInField * i + this.data.marginX * i, 0, 4, this.game.height);
            }
        });        

        //first draw images in game layer
        this.pic.onload = () => {
            let imgPosition: number = 0;
            for (let i = 0; i < this.data.columns; i++) {
                //calculate the starting X position for column
                let dataPosX: number = this.data.marginX * (i + 1) + i * this.data.sizeImageInField;
                for (let j = 0; j < this.data.rows; j++) {
                    //calculate the starting Y position for row
                    let dataPosY: number = this.data.marginY * (j + 1) + j * this.data.sizeImageInField;
                    //image; sprite position in x, in y; sprite size in x, in y; field position in x, in y; field image width, field image height
                    this.ctx.drawImage(this.pic, 0, this.imageRandomCoords[imgPosition], this.data.sizeSpriteImage, this.data.sizeSpriteImage, dataPosX, dataPosY, this.data.sizeImageInField, this.data.sizeImageInField);
                    imgPosition++;
                }
            }
        }
    }

    //spinning reels when the button clicked
    private handleEvents(): void {
        $("#spin").on("click", () => {

            //disabled button when reels spinning
            $("#spin").attr('disabled', "disabled");

            //clear data for next spinning
            for (let i = 0; i < this.dataSpin.length; i++) {
                this.dataSpin[i].offsetY = 0;
                clearInterval(this.dataSpin[i].interval);
            }

            //start reels spinning in every columns
            for (let i = 0; i < this.data.columns; i++) {
                this.createColumn(i, this.data.speed * i);
            }

            //clear arrays
            this.dataSpin.length = 0;
            this.imageRandomCoords.length = 0;

            //random images for new game
            for (let i = 0; i < this.data.randomImageArraySize; i++) {
                this.imageRandomCoords.push(this.coordsInSprite[Math.floor(Math.random() * this.coordsInSprite.length)]);
            }

        });
    }

    //start reels spinning in every columns with delays
    private createColumn(col: number, timeout: number) {
        var $this = this;
        setTimeout(() => {
            var column = new DataColumn(0, setInterval(() => { $this.draw(col); }, 30), $this.enableSpinButtonCallback(col));
            $this.dataSpin.push(column);
        }, timeout)
    }

    //create callback for enable spin button
    private enableSpinButtonCallback(col): any {
        let callback;

        //add callback function when last reel start spin
        if (col == this.data.columns - 1) {
            callback = () => {
                $("#spin").removeAttr('disabled');
            };
        }

        return callback;
    }

    //draw and animate reels spinning
    private draw(col: number) {
        //every column should start with different images
        let imgPosition: number = col * this.data.rows;

        //calculate the starting X position for column
        let dataPosX: number = this.data.marginX * (col + 1) + col * this.data.sizeImageInField;

        // clean up canvas
        this.ctx.clearRect(dataPosX, 0, this.data.sizeImageInField, this.game.height);

        for (let j = this.data.randomImageArraySize - 1; j >= 0; j--) {
            //calculate the starting Y position for row, and reduce it in every call in setInterval for animate reels spinning
            let dataPosY: number = -this.dataSpin[col].offsetY + j * (this.data.sizeImageInField + this.data.marginY) + this.data.marginY;

            //image; sprite position in x, in y; sprite size in x, in y; field position in x, in y; field image width, field image height
            this.ctx.drawImage(this.pic, 0, this.imageRandomCoords[imgPosition], this.data.sizeSpriteImage, this.data.sizeSpriteImage, dataPosX, dataPosY, this.data.sizeImageInField, this.data.sizeImageInField);

            if (imgPosition == this.data.randomImageArraySize)
                imgPosition = 0
            else
                imgPosition++;

            //increasing the value (for animate) until 3 images remained on the field. Then stoped spinning reels
            if (this.dataSpin[col].offsetY < (this.data.randomImageArraySize - this.data.rows) * (this.data.sizeImageInField + this.data.marginY)) {
                this.dataSpin[col].offsetY++;
            }
            else {
                if (this.dataSpin[col]  && typeof this.dataSpin[col].callback === 'function') {
                    this.dataSpin[col].callback();
                }
            }
        }
    }

    //loading configuration from config.json
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
    new SlotMachine().startGame();
};