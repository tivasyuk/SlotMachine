//parameters for dataSpin
var DataColumn = (function () {
    function DataColumn(offsetY, interval, callback) {
        this.offsetY = offsetY;
        this.interval = interval;
        this.callback = callback;
    }
    return DataColumn;
}());
//start game
var SlotMachine = (function () {
    function SlotMachine() {
        this.coordsInSprite = [];
        this.imageRandomCoords = [];
        this.dataSpin = new Array();
        this.game = document.getElementById("game");
        this.ctx = this.game.getContext("2d");
        this.data = this.loadConfig();
        this.pic = new Image();
        this.pic.src = "img/gems-s3ec6b0050c.png";
        this.loadImages();
        this.handleEvents();
    }
    //create random images and start game
    SlotMachine.prototype.startGame = function () {
        for (var i = 0; i <= 6; i++) {
            this.coordsInSprite[i] = i * this.data.sizeSpriteImage;
        }
        for (var i = 0; i < this.data.randomImageArraySize; i++) {
            this.imageRandomCoords.push(this.coordsInSprite[Math.floor(Math.random() * this.coordsInSprite.length)]);
        }
    };
    //create first game layer when page loaded
    SlotMachine.prototype.loadImages = function () {
        var _this = this;
        //calculate width and height for game layer
        this.game.width = this.data.columns * this.data.sizeImageInField + (this.data.columns + 1) * this.data.marginX;
        this.game.height = this.data.rows * this.data.sizeImageInField + (this.data.rows + 1) * this.data.marginY;
        //draw vertical lines in field
        $(function () {
            var grd = _this.ctx.createLinearGradient(0, 0, 0, _this.game.height);
            grd.addColorStop(0, "transparent");
            grd.addColorStop(0.5, _this.data.drawLinesColor);
            grd.addColorStop(1, "transparent");
            _this.ctx.fillStyle = grd;
            for (var i = 0; i <= _this.data.columns + 1; i++) {
                _this.ctx.fillRect(20 + _this.data.sizeImageInField * i + _this.data.marginX * i, 0, 4, _this.game.height);
            }
        });
        //first draw images in game layer
        this.pic.onload = function () {
            var imgPosition = 0;
            for (var i = 0; i < _this.data.columns; i++) {
                //calculate the starting X position for column
                var dataPosX = _this.data.marginX * (i + 1) + i * _this.data.sizeImageInField;
                for (var j = 0; j < _this.data.rows; j++) {
                    //calculate the starting Y position for row
                    var dataPosY = _this.data.marginY * (j + 1) + j * _this.data.sizeImageInField;
                    //image; sprite position in x, in y; sprite size in x, in y; field position in x, in y; field image width, field image height
                    _this.ctx.drawImage(_this.pic, 0, _this.imageRandomCoords[imgPosition], _this.data.sizeSpriteImage, _this.data.sizeSpriteImage, dataPosX, dataPosY, _this.data.sizeImageInField, _this.data.sizeImageInField);
                    imgPosition++;
                }
            }
        };
    };
    //spinning reels when the button clicked
    SlotMachine.prototype.handleEvents = function () {
        var _this = this;
        $("#spin").on("click", function () {
            //disabled button when reels spinning
            $("#spin").attr('disabled', "disabled");
            //clear data for next spinning
            for (var i = 0; i < _this.dataSpin.length; i++) {
                _this.dataSpin[i].offsetY = 0;
                clearInterval(_this.dataSpin[i].interval);
            }
            //start reels spinning in every columns
            for (var i = 0; i < _this.data.columns; i++) {
                _this.createColumn(i, _this.data.speed * i);
            }
            //clear arrays
            _this.dataSpin.length = 0;
            _this.imageRandomCoords.length = 0;
            //random images for new game
            for (var i = 0; i < _this.data.randomImageArraySize; i++) {
                _this.imageRandomCoords.push(_this.coordsInSprite[Math.floor(Math.random() * _this.coordsInSprite.length)]);
            }
        });
    };
    //start reels spinning in every columns with delays
    SlotMachine.prototype.createColumn = function (col, timeout) {
        var $this = this;
        setTimeout(function () {
            var column = new DataColumn(0, setInterval(function () { $this.draw(col); }, 30), $this.enableSpinButtonCallback(col));
            $this.dataSpin.push(column);
        }, timeout);
    };
    //create callback for enable spin button
    SlotMachine.prototype.enableSpinButtonCallback = function (col) {
        var callback;
        //add callback function when last reel start spin
        if (col == this.data.columns - 1) {
            callback = function () {
                $("#spin").removeAttr('disabled');
            };
        }
        return callback;
    };
    //draw and animate reels spinning
    SlotMachine.prototype.draw = function (col) {
        //every column should start with different images
        var imgPosition = col * this.data.rows;
        //calculate the starting X position for column
        var dataPosX = this.data.marginX * (col + 1) + col * this.data.sizeImageInField;
        // clean up canvas
        this.ctx.clearRect(dataPosX, 0, this.data.sizeImageInField, this.game.height);
        for (var j = this.data.randomImageArraySize - 1; j >= 0; j--) {
            //calculate the starting Y position for row, and reduce it in every call in setInterval for animate reels spinning
            var dataPosY = -this.dataSpin[col].offsetY + j * (this.data.sizeImageInField + this.data.marginY) + this.data.marginY;
            //image; sprite position in x, in y; sprite size in x, in y; field position in x, in y; field image width, field image height
            this.ctx.drawImage(this.pic, 0, this.imageRandomCoords[imgPosition], this.data.sizeSpriteImage, this.data.sizeSpriteImage, dataPosX, dataPosY, this.data.sizeImageInField, this.data.sizeImageInField);
            if (imgPosition == this.data.randomImageArraySize)
                imgPosition = 0;
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
            }
        }
    };
    //loading configuration from config.json
    SlotMachine.prototype.loadConfig = function () {
        var data;
        $.ajax({
            url: 'config.json',
            async: false
        }).done(function (response) {
            data = response;
        }).fail(function () {
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
        return data;
    };
    return SlotMachine;
}());
window.onload = function () {
    new SlotMachine().startGame();
};
//# sourceMappingURL=main.js.map