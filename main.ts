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
        if (localStorage.length == 1){
            let retrievedObject = localStorage.getItem('configObject');
            this.data = JSON.parse(retrievedObject);
        } else {
            this.data = this.loadConfig();
        }
        this.pic = new Image();
        this.pic.src = "img/gems-s3ec6b0050c.png";
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

            //clear offsetY for next spinning
            for (let i = 0; i < this.dataSpin.length; i++) {
                this.dataSpin[i].offsetY = 0;
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
    private createColumn(col: number, timeout: number): void {
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
    private draw(col: number): void {
        //every column should start with different images
        let imgPosition: number = col * this.data.rows;
        //calculate the starting X position for column
        let dataPosX: number = this.data.marginX * (col + 1) + col * this.data.sizeImageInField;

        // clean up canvas
        this.ctx.clearRect(dataPosX, 0, this.data.sizeImageInField, this.game.height);
        let endSpin = 0;
        for (let j = this.data.randomImageArraySize - 1; j >= 0; j--) {
            //calculate the starting Y position for row, and reduce it in every call in setInterval for animate reels spinning
            //let dataPosY: number = this.dataSpin[col].offsetY + j * (this.data.sizeImageInField + this.data.marginY) + this.data.marginY;
            let dataPosY: number = this.dataSpin[col].offsetY - this.data.sizeImageInField * (j - 2) - this.data.marginY * (j - 3);

            //image; sprite position in x, in y; sprite size in x, in y; field position in x, in y; field image width, field image height
            this.ctx.drawImage(this.pic, 0, this.imageRandomCoords[imgPosition], this.data.sizeSpriteImage, this.data.sizeSpriteImage, dataPosX, dataPosY, this.data.sizeImageInField, this.data.sizeImageInField);
            if (imgPosition == this.data.randomImageArraySize - 1)
                imgPosition = 0
            else
                imgPosition++;

            //increasing the value (for animate) until 3 images remained on the field. Then stoped spinning reels
            if (this.dataSpin[col].offsetY < (this.data.randomImageArraySize - this.data.rows) * (this.data.sizeImageInField + this.data.marginY)) {
                this.dataSpin[col].offsetY++;
            }
            else {
                if (this.dataSpin[col] && typeof this.dataSpin[col].callback === 'function') {
                    this.dataSpin[col].callback();
                }
                if (col == this.data.columns - 1) {
                    endSpin++;
                    if (endSpin == this.data.rows) {
                        this.win();
                        break;
                    }
                }
                clearInterval(this.dataSpin[col].interval);
            }
        }

    }

    private win(): void {
        let self = this;
        let array: number[][] = [];
        let gem: number;
        let row: number;
        let count: number = 0;

        for (let i = 0; i < this.data.rows; i++) {
            array.push([i]);
            for (let j = 1; j <= this.data.columns; j++) {
                let imgPosition: number = i + (j-1) * this.data.rows;
                array[i].push(this.imageRandomCoords[imgPosition]);

                if (gem == array[i][j] && row == i) {
                    count++;
                    if (count >= 2) {
                        $('.wrapper').append('<div id="win"></div>');
                        setTimeout(function () {
                            $('#win').remove();
                        }, 1200);
                    }
                }
                else {
                    count = 0;
                    gem = array[i][j];
                    row = i;
                }
            }
        }
    }

    //loading configuration from config.json
    private loadConfig(): any {
        let data;

        $.ajax({
            url: 'config.json',
            async: false
        }).done((response) => {
            data = response;
        }).fail(() => {
            //datas for local game
            data = {
                "sizeSpriteImage": 120,
                "marginX": 40,
                "marginY": 20,
                "sizeImageInField": 120,
                "columns": 5,
                "rows": 3,
                "speed": 350,
                "randomImageArraySize": 60,
                "drawLinesColor": "#eba8d3"
            };
        });

        localStorage.setItem('configObject', JSON.stringify(data));

        return data;
    }
}

class AudioGame{
    constructor() {
        
    }

}

window.onload = () => {
    new SlotMachine().startGame();
    new AudioGame();
};

$(document).ready(function () {
    $('a[data-modal="rulesModal"]').on('click', function (e) {
        e.preventDefault();
        $('#rulesModal').show();
    });
    window.onclick = function (e) {
        if ($('#rulesModal').is(e.target) || $('#rulesModal .close').is(e.target)) {
            $('#rulesModal').removeAttr('style');
        }
    }


    /*

    // создаем аудио контекст
    var context = new window.AudioContext(); //
    // переменные для буфера, источника и получателя
    var buffer, source, destination;
    // функция для подгрузки файла в буфер
    var loadSoundFile = function (url) {
        // делаем XMLHttpRequest (AJAX) на сервер
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer'; // важно
        xhr.onload = function (e) {
            // декодируем бинарный ответ
            context.decodeAudioData(this.response,
                function (decodedArrayBuffer) {
                    // получаем декодированный буфер
                    buffer = decodedArrayBuffer;
                }, function (e) {
                    console.log('Error decoding file', e);
                });
        };
        xhr.send();
    }
    // функция начала воспроизведения
    var play = function () {
        // создаем источник
        source = context.createBufferSource();
        // подключаем буфер к источнику
        source.buffer = buffer;
        // дефолтный получатель звука
        destination = context.destination;
        // подключаем источник к получателю
        source.connect(destination);
        // воспроизводим
        source.start(0);
    }
    // функция остановки воспроизведения
    var stop = function () {
        source.stop(0);
    }
    loadSoundFile('http://d.zaix.ru/88a9392ea.MP3');
    $('.play').on('click', function () {
        play();
    })*/
});



/*
var context;
window.addEventListener('load', function () {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    }
    catch (e) {
        alert('Opps.. Your browser do not support audio API');
    }

    // создаем аудио контекст
    var context = new window.AudioContext(); //
    // переменные для буфера, источника и получателя
    var buffer, source, destination;
    // функция для подгрузки файла в буфер
    var loadSoundFile = function (url) {
        // делаем XMLHttpRequest (AJAX) на сервер
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer'; // важно
        xhr.onload = function (e) {
            // декодируем бинарный ответ
            context.decodeAudioData(this.response,
                function (decodedArrayBuffer) {
                    // получаем декодированный буфер
                    buffer = decodedArrayBuffer;
                }, function (e) {
                    console.log('Error decoding file', e);
                });
        };
        xhr.send();
    }
    // функция начала воспроизведения
    var play = function () {
        // создаем источник
        source = context.createBufferSource();
        // подключаем буфер к источнику
        source.buffer = buffer;
        // дефолтный получатель звука
        destination = context.destination;
        // подключаем источник к получателю
        source.connect(destination);
        // воспроизводим
        source.start(0);
        console.log('dd')
    }
    // функция остановки воспроизведения
    var stop = function () {
        source.stop(0);
    }
    loadSoundFile('http://d.zaix.ru/88a9392ea.MP3');

    
}, false);*/