/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var isCtrled = params[2];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) || // digits
                (keyCode == 32) || // space
                (keyCode == 13)) { // enter
                /** for printable special characters on the numpad **/
                if (isShifted) {
                    var specialChars = { 49: "!", 50: "@", 51: "#", 52: "$", 53: "%", 54: "^", 55: "&", 56: "*", 57: "(", 58: ")" };
                    chr = specialChars[keyCode];
                    if (!chr) {
                        chr = "";
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 186) && (keyCode <= 222)) {
                /** for printable special characters elsewhere **/
                if (isShifted) {
                    var specialSymbols = { 186: ":", 187: "+", 188: "<", 189: "_", 190: ">", 191: "?", 192: "~", 219: "{", 221: "}", 220: "|", 222: "\"" };
                    chr = specialSymbols[keyCode];
                }
                else {
                    var symbolKeys = { 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'" };
                    chr = symbolKeys[keyCode];
                }
                if (!chr) {
                    chr = "";
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 8) || // backspace
                (keyCode == 9)) { // tab
                if (!isShifted) {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
            else if (keyCode == 38) {
                // send as string, otherwise it prints the keycode/string
                chr = "up";
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 40) {
                // send as string, otherwise it prints the keycode/string
                chr = "down";
                _KernelInputQueue.enqueue(chr);
            }
            else if (isCtrled === true && keyCode == 67) {
                // send as string, otherwise it prints the keycode/string
                chr = "reset";
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map