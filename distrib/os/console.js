/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", cmdHistory = [], cmdInd = 0) {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.cmdHistory = cmdHistory;
            this.cmdInd = cmdInd;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13) || chr === String.fromCharCode(9)) { // enter, tab
                    // The enter key marks the end of a console command, so ...
                    // check if there's currently any input in the buffer
                    if (this.buffer.length === 0) {
                        this.advanceLine();
                        _OsShell.putPrompt();
                        return;
                    }

                    // store cmd
                    this.cmdHistory[this.cmdHistory.length] = this.buffer;
                    this.cmdInd = this.cmdHistory.length;

                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) {        // backspace
                    this.erasePrevChar();
                } else if (chr === String.fromCharCode(9)) {        // tab
                    console.log("tab pressed");
                } else if ((chr === "up") || (chr === "down")) {    // up, down
                    // TODO: overflow error when I'm done with scrolling
                    this.putCmdHistory(chr);
                    console.log("cmd hit");
                } else if (chr == "reset") {
                    // TODO: just doesn't work
                    TSOS.Control.hostBtnReset_click(null);
                    console.log("reset");
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            
            // TODO: Handle scrolling. (iProject 1)
            //          Fix not fully scrolling back up to top
            //          Probably a scrollbar error, not encapsulating canvas
            /** if yPos > canvas height, capture img data, set height - 5 **/
            if (this.currentYPosition > _Canvas.height) {
                var imgData = _DrawingContext.getImageData(0, 20, _Canvas.width, _Canvas.height);

                this.clearScreen();
                _DrawingContext.putImageData(imgData, 0, 0);
                this.currentYPosition = _Canvas.height - 5;
            }
        }
        erasePrevChar() {
            if (this.buffer.length > 0) {
                // offset of our current char via slice (new array)
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, 
                                                            this.buffer.slice(-1));
                // grabs current x - offset
                var xPos = this.currentXPosition - offset;
                // grabs current y++ - font size
                var yPos = this.currentYPosition + 1 - this.currentFontSize;

                _DrawingContext.clearRect(xPos, yPos, this.currentXPosition, this.currentYPosition);
                this.currentXPosition = xPos;
                /* use substr() over substring() because we want to specify the string length,
                * not the end position
                * this is cause we're doing x/y pos as vars and keeping clearRect() clean
                */
                this.buffer = this.buffer.substr(0, this.buffer.length - 1);
            }
        }
        putCmdHistory(chr) {
            // TODO:    fix error for when space is empty
            if (this.cmdInd >= 0) {
                if (chr === "up") {
                    if (this.cmdInd++ < this.cmdHistory.length) {
                        this.cmdInd++;
                    } else {
                        this.cmdInd = 0;
                    }
                } else if (chr === "down") {
                    if (this.cmdInd-- < -1) {
                        this.cmdInd--;
                    } else {
                        this.cmdInd = 0;
                    }
                }
            }

            // clear buffer, put cmd on line
            this.clearBuffer();
            this.buffer = this.cmdHistory[this.cmdInd];
            this.putText(this.buffer);
        }
        clearBuffer() {
            this.currentXPosition = 0;

            var bufferSize = _DrawingContext.measureText(this.currentFont, this.currentFontSize, 
                                                        _OsShell.promptStr + this.buffer);
            var lineCount = Math.ceil(bufferSize / _Canvas.width);

            /** if line wrapped, reset yPos **/
            if (lineCount > 1) {
                this.currentYPosition -= (lineCount - 1) * this.bufferLineHeight();
            }

            // clear row, put cmd on screen
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize,
                                        _Canvas.width, lineCount * this.bufferLineHeight());
            _StdOut.putText(_OsShell.promptStr);
        }
        // lineWrap(text) {
        //     var currWidth = _Canvas.width - this.currentXPosition;
        //     var buffer = "";
        //     var lineWrapStr = [];

        //     /*** Change line ending position based on whatever the current character is ***/
        //     while (text.length > 0) {
        //         while ((text.length > 0) &&
        //             _DrawingContext.measureText(this.currentFont, this.currentFontSize, 
        //               (buffer + text.charAt(0) <= currWidth))) {
        //             buffer += text.charAt(0);
        //             text = text.slice(1);
        //         }

        //         // push new character
        //         lineWrapStr.push(buffer);
        //         buffer = "";
        //         currWidth = _Canvas.width;
        //     }
            
        //     return lineWrapStr;
        // }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // var lineWrapStr = this.lineWrap(text);

                // /*** Push new text slice to next line ***/
                // for (var i = 0; i < lineWrapStr.length; i++) {
                //     var line = lineWrapStr[i];

                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, 
                                                this.currentYPosition, text);

                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);

                    this.currentXPosition = this.currentXPosition + offset;

                //     if (i++ < lineWrapStr.length) {
                //         this.advanceLine();
                //     }
                // }
            }
        }
        bufferLineHeight() {
            return _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +_FontHeightMargin;
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map