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
                if (chr === String.fromCharCode(13)) { // enter
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { // backspace
                    this.erasePrevChar();
                }
                else if (chr === String.fromCharCode(9)) { // tab
                    this.autoComplete();
                    console.log("tab pressed");
                }
                else if ((chr === "up") || (chr === "down")) { // up, down
                    this.putCmdHistory(chr);
                    console.log("cmd hit");
                }
                else if (chr === "reset") {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_PROCESS_IRQ, _CPU.Pcb.pid));
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
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                //var arr = text.split(' ');
                var arr = text.toString().split(' ');
                if (arr.length > 1 && text !== ' ') {
                    for (var i = 0; i < arr.length; i++) {
                        this.putText(arr[i]);
                        if (i !== arr.length - 1) {
                            this.putText(' ');
                        }
                    }
                }
                else {
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    if (this.currentXPosition + offset > _Canvas.width / window.devicePixelRatio) {
                        this.advanceLine();
                    }
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        }
        autoComplete() {
            // the tab function is for auto completing a cmd based on whatever characters we type
            // could also do this taking a char param, but grabbing all the commands is just easier
            //     plus, we don't have to make a case for if there's nothing in the buffer
            var possibleCmds = [];
            /*** Look through all commands, push them into command list ***/
            for (var i = 0; i < _OsShell.commandList.length; i++) {
                if (_OsShell.commandList[i].command.indexOf(this.buffer) === 0) {
                    possibleCmds.push(_OsShell.commandList[i].command);
                }
            }
            /** if there's more than 1 command in the list, clear buffer and put possible cmd
             * else, print out all possible commands on the next line
            **/
            if (possibleCmds.length === 1) {
                this.clearBuffer();
                this.putText(possibleCmds[0]);
                this.buffer = possibleCmds[0];
            }
            else {
                this.clearBuffer();
                this.putText("Possible Commands:");
                for (var i = 0; i < possibleCmds.length; i++) {
                    this.advanceLine();
                    this.putText("  " + possibleCmds[i]);
                }
                this.advanceLine();
                // even though it's in clearBuffer(), advanceLine() takes it out
                // so put this in to make the transition less awkward
                _StdOut.putText(_OsShell.promptStr);
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
            // DO NOT try this with a scrollbar added
            // it would be waaaaaaay too hard to continuously capture and recapture what we count as images
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
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.slice(-1));
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
                /** handles line wrap for backspacing **/
                if (this.currentXPosition <= 0) {
                    this.currentYPosition -= this.bufferLineHeight();
                    // use this instead of regular xPos so that we can handle anything relating to 
                    //      different fonts
                    var xCursor = _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr + this.buffer);
                    xCursor = xCursor % _Canvas.width;
                    this.currentXPosition = xCursor;
                }
            }
        }
        putCmdHistory(chr) {
            // remember, "++" is going to add 2 indices, which might skip around a bit
            /** if > 0,
             * if up, check the index compared to the length and either increment or set to 0
             * if down, check the index compared to going under -1 and either decerement or set to 0
            **/
            if (this.cmdInd >= 0) {
                if (chr === "up") {
                    if (this.cmdInd + 1 < this.cmdHistory.length) {
                        this.cmdInd++;
                    }
                    else {
                        this.cmdInd = 0;
                    }
                }
                else if (chr === "down") {
                    if (this.cmdInd - 1 > -1) {
                        this.cmdInd--;
                    }
                    else {
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
            // For clearing the whole line
            this.currentXPosition = 0;
            var bufferSize = _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr + this.buffer);
            var lineCount = Math.ceil(bufferSize / _Canvas.width);
            /** if line wrapped, reset yPos **/
            if (lineCount > 1) {
                this.currentYPosition -= (lineCount - 1) * this.bufferLineHeight();
            }
            // clear row, put cmd on screen
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, _Canvas.width, lineCount * this.bufferLineHeight());
            _StdOut.putText(_OsShell.promptStr);
        }
        bufferLineHeight() {
            // this was too long for me to use multiple times, so it's in it's own function
            /* You found Totaka's Song!
                4|------------------c---|-----------|-------|-------|-------|-
                3|--c-c-d-e-d-c-g-e---g-|-g-g-G-f-D-|-d-g-c-|-------|-------|-
            */
            return _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map