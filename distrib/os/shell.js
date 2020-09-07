/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Displays the current date and time.")
            this.commandList[this.commandList.length] = sc;
            // where am I
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", " - Displays where you are in the U.M.N.");
            this.commandList[this.commandList.length] = sc;
            // ye shall be as gods
            sc = new TSOS.ShellCommand(this.shellYeShallBeAsGods, "yeshallbeasgods", " - Knowing good and evil?");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", " - ERROR in KOS-MOS.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads program from User Program Input.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "ver":
                        _StdOut.putText("Displays KOS-MOS's serial number.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down KOS-MOS, but her host continues to run.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears KOS-MOS's display terminal.");
                        break;
                    case "man":
                        _StdOut.putText("Displays information about <topic>.");
                        break;
                    case "trace":
                        _StdOut.putText("Sets the trace for KOS-MOS to <on | off>");
                        break;
                    case "rot13":
                        _StdOut.putText("Uses a Caesar cipher shift 13 to decode a string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Changes the prompt to be <string>");
                        break;
                    case "date":
                        _StdOut.putText("Displays the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Displays where you are in the U.M.N.");
                        break;
                    case "yeshallbeasgods":
                        _StdOut.putText("Knowing good and evil?");
                        break;
                    case "bsod":
                        _StdOut.putText("ERROR in KOS-MOS.");
                        break;
                    case "status":
                        _StdOut.putText("Sets the status to be <string>.");
                        break;
                    case "load":
                        _StdOut.putText("Loads program from User Program Input.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            // This is a Caesar cipher by 13
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate(args) {
            var time = TSOS.Control.getCurrTime();

            _StdOut.putText(time);
        }
        shellWhereAmI(args) {
            // Important area in Xenosaga
            _StdOut.putText("Miltian system, Tantus arm 4th finger, Galaxy 18 - Old Miltia");
        }
        shellYeShallBeAsGods(args) {
            // For fun typewriter effect (defunct, but here for my reference)
            // var ind = 0;
            // var txt = ' Ye shall be as gods ';
            // var spd = 100;
            // var times = 30;

            // /**** Prints out txt 1 char at a time *****/
            // function typeWrite() {
            //     if (ind < txt.length) {
            //         document.getElementById("overlay-content-p").innerHTML += txt.charAt(ind);
            //         ind++;
            //         setTimeout(typeWrite, spd);
            //     }

            //     return txt;
            // }

            // document.getElementById("overlay").style.width = "100%";
            // document.getElementById("overlay-content-p").innerHTML = typeWrite().repeat(times);

            _StdOut.putText("Ye shall be as gods...");
        }
        shellBSOD(args) {
            // the cooler BSOD function, with CSS done in TS
            // I could also throw it in the Kernel, but I didn't feel like it
            var container = document.getElementById("overlay");
            var count = 20;
            var txt = " 【Ｇａｍｅ　ｏｖｅｒ】 . . . ";

            /*** Creates box divs ***/
            for (var i = 0; i < count; i++) {
                var glitchBx = document.createElement('div');

                glitchBx.className = 'box';
                container.appendChild(glitchBx);
            }

            /**** Creates random assortment of box divs every 200 ms ****/
            setInterval(function() {
                var glitch = document.getElementsByClassName('box');

                for (var i = 0; i < glitch.length; i++) {
                    glitch[i].style.left = Math.floor(Math.random() * 100) + 'vw';
                    glitch[i].style.top = Math.floor(Math.random() * 100) + 'vh';
                    glitch[i].style.width = Math.floor(Math.random() * 400) + 'px';
                    glitch[i].style.height = Math.floor(Math.random() * 100) + 'px';
                }
            }, 200);

            document.getElementById("overlay").style.width = "100%";
            document.getElementById("overlay").style.backgroundColor = "blue";
            document.getElementById("overlay-content-h").innerHTML = txt;

            _Kernel.krnTrapError("You killed Kevin.");
        }
        shellStatus(args) {
            if (args.length > 0) {
                var status = args.toString();

                document.getElementById("Status").innerHTML = args.join(" ");
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }
        shellLoad(args) {
            var program = document.getElementById("taProgramInput").value.trim().toUpperCase();
            // put extra split(" ") here cause we need it for test()
            var programArr = program.split(" ");

            /** Checks if program in text area is valid **/
            if (program === "") {
                _StdOut.putText("Invalid program.  Usage: Text area is empty.");
            } else {
                // trick I learned from Java
                // regex blocks out whatever specified tokens, in this case, all non-numbers and A - F
                var regex = /^[0-9a-f]+$/i;

                /*** Cycles through parsed input to check if chars are valid ***/
                for (var i = 0; i < programArr.length; i++) {
                    if (regex.test(programArr[i]) === false) {
                        _StdOut.putText("Invalid program.  Usage: Invalid hex characters.");
                    } else {
                        _StdOut.putText("Program is valid.");
                    }
                }
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map