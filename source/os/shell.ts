/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                    "date",
                                    " - Displays the current date and time");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                    "whereami",
                                    " - Displays where you are in the U.M.N.");
            this.commandList[this.commandList.length] = sc;

            // yeshallbeasgods
            sc = new ShellCommand(this.shellYeShallBeAsGods,
                                    "yeshallbeasgods",
                                    " - Knowing good and evil?");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellBSOD,
                                    "bsod",
                                    " - ERROR in KOS-MOS.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus, 
                                    "status",
                                    "<string> - Sets the status.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                    "load",
                                    "<priority> - Loads program from User Program Input.  Priority optional, except in Priority scheduling.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                                    "run",
                                    "<pid> - Runs specified process.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                                    "runall",
                                    "Runs all processes in 'process' state.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                                    "clearmem",
                                    "Clears all memory segments. (Ignores running processes.)");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                                    "ps",
                                    "Lists running processes and their PIDs.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                                    "kill",
                                    "<pid> - Kills specified process.");
            this.commandList[this.commandList.length] = sc;

            // killall
            sc = new ShellCommand(this.shellKillAll,
                                    "killall",
                                    "Kills all processes.");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                                    "quantum",
                                    "<int> - Sets quantum for Round Robin scheduling.");
            this.commandList[this.commandList.length] = sc;

            // getscheduler
            sc = new ShellCommand(this.shellGetSchedule,
                                    "getschedule",
                                    "Gets the current scheduler algorithm type.");
            this.commandList[this.commandList.length] = sc;

            // setscheduler
            sc = new ShellCommand(this.shellSetSchedule,
                                    "setschedule",
                                    "<type (rr, fcfs, pri)> - Sets the scheduler algorithm type to Round Robin, First Come First Serve, or Priority.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLs,
                                    "ls",
                                    "<-l> - Lists files in directory. Params is optional, but includes special files in the list.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                                    "format",
                                    "<-quick, -full> - Initializes data blocks.  Quick only initializes 1st 4, Full initializes entire block.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.shellCreate,
                                    "create",
                                    "<filename> - Creates file.");
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new ShellCommand(this.shellRead,
                                    "read",
                                    "<filename> - Outputs contents of specified file.");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new ShellCommand(this.shellWrite,
                                    "write",
                                    "<filename> <text> - Writes data within quotes to specified file.");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new ShellCommand(this.shellDelete,
                                    "delete",
                                    "<filename> - Deletes file.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
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
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
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
                        _StdOut.putText("Loads program from User Program Input.  Priority optional, except in Priority scheduling.");
                        break;
                    case "run":
                        _StdOut.putText("Runs specified process.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all processes in 'process' state.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears all memory segments. (Ignores running processes.)");
                        break;
                    case "ps":
                        _StdOut.putText("Lists running processes and their PIDs.");
                        break;
                    case "kill":
                        _StdOut.putText("Kills specified process.");
                        break;
                    case "killall":
                        _StdOut.putText("Kills all processes.");
                        break;
                    case "quantum":
                        _StdOut.putText("Sets specified quantum for Round Robin scheduling.");
                        break;
                    case "getschedule":
                        _StdOut.putText("Gets the current scheduler algorithm type.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Sets the scheduler algorithm type to Round Robin, First Come First Serve, or Priority.  Default is Round Robin.");
                        break;
                    case "ls":
                        _StdOut.putText("Lists files in directory. Params is optional, but includes special files in the list.");
                        break;
                    case "format":
                        _StdOut.putText("Initializes data blocks.  Quick only initializes 1st 4, Full initializes entire block.  Will terminate any processes stored.");
                        break;
                    case "create":
                        _StdOut.putText("Creates file.");
                        break;
                    case "read":
                        _StdOut.putText("Outputs contents of specified file.");
                        break;
                    case "write":
                        _StdOut.putText("Writes data within quotes to specified file.");
                        break;
                    case "delete":
                        _StdOut.putText("Deletes file.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            // this is a Caesar cipher by 13
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            var time = TSOS.Control.getCurrTime();

            _StdOut.putText(time);
        }

        public shellWhereAmI(args: string[]) {
            // Important area in Xenosaga
            _StdOut.putText("Miltian system, Tantus arm 4th finger, Galaxy 18 - Old Miltia");
        }

        public shellYeShallBeAsGods(args: string[]) {
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

        public shellBSOD(args: string[]) {
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
                var glitch = document.getElementsByClassName('box') as HTMLCollectionOf<HTMLElement>;

                for (var i = 0; i < glitch.length; i++) {
                    // TypeScript doesn't have ".style" on any ol' element
                    // Instead, we set the document's elements as HTMLCollectionOf elements
                    glitch[i].style.left=Math.floor(Math.random()*100)+'vw';
                    glitch[i].style.top=Math.floor(Math.random()*100)+'vh';
                    glitch[i].style.width=Math.floor(Math.random()*400)+'px';
                    glitch[i].style.height=Math.floor(Math.random()*100)+'px';
                }
            }, 200);

            document.getElementById("overlay").style.width = "100%";
            document.getElementById("overlay").style.backgroundColor = "blue";
            document.getElementById("overlay-content-h").innerHTML = txt;

            _Kernel.krnTrapError("You killed Kevin.");
        }

        public shellStatus(args: string[]) {
            if (args.length > 0) {
                var status = args.toString();

                document.getElementById("Status").innerHTML = args.join(" ");
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }

        public shellLoad(args: string[]) {
            /* In between Project 1 and 2, I should have changed all instances of toUpperCase() into toLocaleUpperCase()
             * I was reading an article on the internationalization of software and realized "Oh yeah, I should do that".
             * ... Well that, and I also did it to my time functions, so I should keep it consistent.
            */

            // TypeScript doesn't have ".value" on elements
            var program = (document.getElementById("taProgramInput") as HTMLTextAreaElement).value.trim().toLocaleUpperCase();
            var programArr = program.replace(/\s/g, "");

            /** Checks if program in text area is valid **/
            /* In Project 1, I originally checked input via cycling through a for loop
             * I changed this in Project 2 because I kept reading in the input character by character, which doesn't work
             * out well cause I needed pairs of hex.  So instead, I switched to the match() in the Regex class.  Not sure
             * if it's a problem, but instead of throwing an error for say having 3 hex digits strung together, match()
             * will instead split them to be with whatever comes next.
             * Ex:      a9f ff 00   =>      a9, ff, f0 (leaves off that last 0 since there's no pair)
            */
            if (program === "") {
                _StdOut.putText("Usage: Text area is empty.");
            } else {
                // trick I learned from Java
                // regex blocks out whatever specified tokens, in this case, all non-numbers and A - F
                var regex = /^[0-9a-f]+$/i;
                var isValid = regex.test(programArr);

                if (isValid) {
                    var hexPair = programArr.match(/.{2}/g);
                    var Pcb = _MemoryManager.load(hexPair, args[0]);

                    /* As of Project 4, the standard "Program loaded" now gives the location 
                     * of the process as either "memory" (default) or "hdd"
                    */
                    if (Pcb) {
                        if (Pcb.location == "memory") {
                            _StdOut.putText(`Program loaded - PID: ${Pcb.pid}, into memory segment ${Pcb.segment.index}.`);
                        } else {
                            _StdOut.putText(`Program loaded - PID: ${Pcb.pid}, into hard drive.`);
                        }
                        //_StdOut.putText(`Program loaded - PID: ${Pcb.pid}.`);
                    }
                    
                } else {
                    _StdOut.putText("Usage: Invalid hex characters.");
                }
            }
        }

        public shellRun(args): void {
            /** check if there's a pid arguement to pass **/
            if (args.length > 0) {
                // parse the pid arguement and push it into a list of processes
                var pid = parseInt(args[0]);
                var pcb = _ResidentList.find(val => val.pid == pid);
                
                /** check whether there's anything in the PCB or if it's being ran or terminated **/
                if (!pcb) {
                    _StdOut.putText(`Usage: ${pid} does not exist.`);
                } else if (pcb.state === "ready") {
                    _StdOut.putText(`Process ${pid} is currently running.`);
                } else if (pcb.state === "terminated") {
                    _StdOut.putText(`Usage: ${pid} already ran and has been terminated.`);
                } else {
                    _StdOut.putText(`Running process.  PID: ${pid}`);
                    _StdOut.advanceLine();
                    _Scheduler.loadToReadyQueue(pcb);
                    _CPU.isExecuting = true;
                }
            } else {
                _StdOut.putText("Usage: run <pid>  Please supply a pid.");
            }
        }

        public shellRunAll(args): void {
            var residentList = _ResidentList.filter(val => val.state == "process");
            var pidMap = residentList.map(val => val.pid);

            for (var pid of pidMap) {
                var pcb: Pcb = _ResidentList.find(val => val.pid == pid);

                _StdOut.putText(`Running process.  PID: ${pcb.pid}`);
                _StdOut.advanceLine();
                _Scheduler.loadToReadyQueue(pcb);
            }

            if (_Scheduler.currProcess !== null || _ReadyQueue.length > 0) {
                _CPU.isExecuting = true;
            }
        }

        public shellPs(args): void {
            for (var process of _ResidentList) {
                _StdOut.putText(`${process.pid}: ${process.state}`);
                _StdOut.advanceLine();
            }
        }

        public shellClearMem(args): void {
            // for ignoring running processes
            var ignoreProcesses = [];

            /*** for all processes in resident list
             * if process's state isn't terminated or running, create terminate interrupt 
             * else if process's state is running, push to ignore process
            ***/
            for (var pcb of _ResidentList) {
                if ((pcb.state !== "terminated") && (pcb.state !== "running")) {
                    _KernelInputQueue.enqueue(new Interrupt(KILL_PROCESS_IRQ, [pcb]));
                } else if (pcb.state == "running") {
                    ignoreProcesses.push(pcb.segment.index);
                }
            }

            _MemoryManager.clearAllMem(ignoreProcesses);
        }

        public shellKill(args): void {
            /** check if there's a pid arguement to pass **/
            if (args.length > 0) {
                var pid = parseInt(args[0]);
                var pcb = _ReadyQueue.find(val => val.pid == args[0]);

                if (pcb) {
                    _KernelInputQueue.enqueue(new Interrupt(KILL_PROCESS_IRQ, [pcb]));
                } else {
                    _StdOut.putText(`Process ${pid} not found.  Please supply a valid pid.`);
                }
            } else {
                _StdOut.putText("Usage: kill <pid>  Please supply a pid.");
            }
        }

        public shellKillAll(args): void {
            if (_ReadyQueue.length > 0) {
                for (var i = 0; i < _ReadyQueue.length; i++) {
                    this.shellKill(`${_ReadyQueue[i].pid}`);
                }
            }
        }

        public shellQuantum(args): void {
            if (args.length > 0) {
                if ((parseInt(args[0]) <= 0) || isNaN(args[0])) {
                    _StdOut.putText(`Quantum: ${args[0]} is invalid.`);
                }

                _StdOut.putText(`Quantum: ${args[0]}.`);
                _Scheduler.quantum = parseInt(args[0]);
            } else {
                _StdOut.putText("Usage: kill <pid>  Please supply a integer.");
            }
        }

        public shellGetSchedule(args): void {
            _StdOut.putText(`Current scheduling algorithm: ${_Scheduler.availableSchedulerType[_Scheduler.currSchedulerType]}`);
        }

        public shellSetSchedule(args): void {
            if (args.length > 0) {
                if (Object.keys(_Scheduler.availableSchedulerType).includes(args[0])) {
                    _StdOut.putText(`Scheduling algorithm set to: ${_Scheduler.availableSchedulerType[args[0]]}.`);
                    _Scheduler.currSchedulerType = args[0];
                } else {
                    _StdOut.putText(`Scheduler: ${args[0]} is invalid.`);
                }
            }
        }

        public shellLs(args) {
            // grab flags, removes dashes
            args = args.filter(val => val[0] == "-").map(flag => flag.substring(1));
            // interrupt sends table info
            _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, ['list', null, null, args]));
        }

        public shellFormat(args) {
            // grab flags, removes dashes
            args = args.filter(val => val[0] == "-").map(flag => flag.substring(1));
            // interrupt sends table info
            _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, ['format', null, null, args]));
        }

        public shellCreate(args) {
            if (args.length > 0) {
                args.unshift('create');

                /** check if file name starts with illegal char **/
                if (_krnDiskDriver.illegalPrefixes.includes(args.slice(0, 2)[1][0])) {
                    return _StdOut.putText(`File name: ${args.slice(0, 2)[1][0]} is invalid.`);
                }
                
                _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, args.slice(0, 2)));
            } else {
                _StdOut.putText("Usage: create <filename>  Please supply a file name.");
            }
        }

        public shellRead(args) {
            if (args.length > 0) {
                args.unshift('read');
                
                _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, args.slice(0, 2)));
            } else {
                _StdOut.putText("Usage: read <filename>  Please supply a file name.");
            }
        }

        public shellWrite(args) {
            if (args.length > 0) {
                var file = args.shift();
                var indices = [];

                /** checks if attempting to edit swap file **/
                if (file[0] == '@') {
                    return _StdOut.putText("Swap files cannot be edited.");
                }

                args = args.join(" ").split("");
                args.filter((val, ind) => {
                    /** check if contains quote char at all **/
                    if (val == '"') {
                        indices.push(ind);
                    }
                });

                /** check if surrounded by quote chars **/
                if (indices.length < 2) {
                    return _StdOut.putText("Specify file name and surround data by quotes.");
                }

                var data = args.splice(indices[0] + 1, indices[1] - indices[0] - 1).join("");

                /** if empty, then add a space char **/
                if (data.length == 0) {
                    data = ' ';
                }
                
                _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, ['write', file, data]));
            } else {
                _StdOut.putText(`Usage: write <filename> "<text>"  Please supply a file name.`);
            }
        }

        public shellDelete(args) {
            if (args.length > 0) {
                /** checks if attempting to delete swap file **/
                if (args[0][0] == '@') {
                    return _StdOut.putText("Swap files cannot be deleted.");
                }

                args.unshift('delete');
                
                _KernelInterruptQueue.enqueue(new Interrupt(FILE_SYSTEM_IRQ, args.slice(0, 2)));
            } else {
                _StdOut.putText("Usage: delete <filename>  Please supply a file name.");
            }
        }
    }
}
