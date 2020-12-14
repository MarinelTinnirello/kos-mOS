/* --------
   Utils.ts

   Utility functions.
   -------- */
var TSOS;
(function (TSOS) {
    class Utils {
        static trim(str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }
        static rot13(str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) { // We need to cast the string to any for use in the for...in construct.
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
        static insertProgramIntoInput(id) {
            var opCodes = "";
            switch (id) {
                case 0:
                    opCodes = "A9 00 8D 00 00 A9 00 8D 4B 00 A9 00 8D 4B 00 A2 03 EC 4B 00 D0 07 A2 01 EC 00 00 D0 05 A2 00 EC 00 00 D0 26 A0 4C A2 02 FF AC 4B 00 A2 01 FF A9 01 6D 4B 00 8D 4B 00 A2 02 EC 4B 00 D0 05 A0 55 A2 02 FF A2 01 EC 00 00 D0 C5 00 00 63 6F 75 6E 74 69 6E 67 00 68 65 6C 6C 6F 20 77 6F 72 6C 64 00";
                    break;
                case 1:
                    opCodes = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 A2 02 A0 42 FF 00";
                    break;
                case 2:
                    opCodes = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 61 00 61 64 6F 6E 65 00";
                    break;
                case 3:
                    opCodes = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 06 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 62 00 62 64 6F 6E 65 00";
                    break;
                case 4:
                    opCodes = "A9 00 8D C8 00 A9 01 8D C8 00 A9 01 8D C9 00 A2 01 EC C8 00 D0 16 A9 02 8D C8 00 AD 9E 00 A0 9E 8D CD 00 A2 02 FF AC C8 00 A2 01 FF A9 01 8D CA 00 AE C8 00 EC CA 00 A2 00 D0 02 A2 01 EC FF 00 D0 16 A9 03 8D C8 00 AD A8 00 A0 A8 8D CE 00 A2 02 FF AC C8 00 A2 01 FF A9 01 8D CB 00 AE C8 00 EC CA 00 D0 10 A9 03 8D C8 00 AD B3 00 A0 B3 8D CF 00 A2 02 FF AD 8C 00 A0 8C 8D CC 00 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 20 74 68 69 73 20 77 6F 72 6B 73 20 72 69 67 68 74 00 61 20 69 73 20 6E 6F 77 20 00 20 61 20 69 73 20 6E 6F 77 20 00 74 68 69 73 20 64 6F 65 73 20 6E 6F 74 20 70 72 69 6E 74 00";
                    break;
                case 5:
                    opCodes = "A9 00 8D 69 00 A9 00 8D 6A 00 A9 00 8D 6E 00 A9 05 8D 69 00 A9 01 8D 6A 00 A9 63 8D 6E 00 AC 6E 00 A2 02 FF A9 00 8D 6B 00 A9 5F 8D 6B 00 AC 6B 00 A2 02 FF A2 01 EC 6A 00 A0 54 D0 02 A0 5A A2 02 FF AD 61 00 A0 61 8D 6D 00 A2 02 FF AC 69 00 A2 01 FF 00 66 61 6C 73 65 00 74 72 75 65 00 20 00 20 00 69 6E 74 61 00";
                    break;
                case 6:
                    opCodes = "AD 17 00 A0 17 8D 2A 00 A2 02 FF 00 66 61 6C 73 65 00 74 72 75 65 00 73 70 6F 69 6C 65 72 3A 20 4B 4F 53 2D 4D 4F 53 20 69 73 20 61 63 74 75 61 6C 20 4D 61 72 79 00";
                    break;
            }
            //document.getElementById("taProgramInput").value = opCodes;
            var input = document.getElementById("taProgramInput");
            input.nodeValue = opCodes;
        }
        static dropDown(btn) {
            document.getElementById("dropdown-menu").classList.toggle("show");
            // window.onclick = function(event) {
            //     if (!event.target.matches('.dropbtn')) {
            //         var dropdowns = document.getElementsByClassName("dropdown-content");
            //         for (var i = 0; i < dropdowns.length; i++) {
            //             var openDropdown = dropdowns[i];
            //             if (openDropdown.classList.contains('show')) {
            //                 openDropdown.classList.remove('show');
            //             }
            //         }
            //     }
            // }
        }
    }
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=utils.js.map