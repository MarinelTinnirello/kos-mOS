/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    // TODO: try and change the op code map to be a public object, should throw it into CPU.ts
    //       if I do that, I can probably scrap the whole switch case and keep the decode/execute a lot smaller
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Functions
        //
        static getCurrTime() {
            var date = new Date(); // date object holds date (mm/dd/yyyy) and time
            var day = new Array(7); // holds days in strings
            day[0] = "Sunday";
            day[1] = "Monday";
            day[2] = "Tuesday";
            day[3] = "Wednesday";
            day[4] = "Thursday";
            day[5] = "Friday";
            day[6] = "Saturday";
            var time = day[date.getDay()] + " " + date.toLocaleDateString() + " " + date.toLocaleTimeString();
            return time;
        }
        static hostMemoryDisplay() {
            var opCodeMap = { "A9": { "pcNum": 1 },
                "AD": { "pcNum": 2 },
                "8D": { "pcNum": 2 },
                "6D": { "pcNum": 2 },
                "A2": { "pcNum": 1 },
                "AE": { "pcNum": 2 },
                "A0": { "pcNum": 1 },
                "AC": { "pcNum": 2 },
                "EA": { "pcNum": 0 },
                "00": { "pcNum": 0 },
                "EC": { "pcNum": 2 },
                "D0": { "pcNum": 1 },
                "EE": { "pcNum": 2 },
                "FF": { "pcNum": 0 }
            };
            var table = document.getElementById("tableMemory");
            var tBody = document.createElement('tbody');
            // table data taken from Memory
            var row;
            var rowLabel = "0x000";
            var rowNum = 0;
            var placeNum = 0;
            var highlightCell;
            // Memory data needed to be placed in table
            var p_addr = 0;
            var memory = _Memory.memory;
            /*** split the table into 8x8 ***/
            for (var i = 0; i < (MEMORY_SIZE * NUM_OF_SEGMENTS) / 8; i++) {
                row = tBody.insertRow(-1);
                rowNum = i * 8;
                // ... setting up padding for labels
                /** for placing 0s in the row label **/
                if (rowNum > 255) {
                    placeNum = 2;
                }
                else if (rowNum > 15) {
                    placeNum = 3;
                }
                else {
                    placeNum = 4;
                }
                // ... sets a given row's label
                row.insertCell(-1).innerHTML = rowLabel.slice(0, placeNum) + rowNum.toString(16).toLocaleUpperCase();
                // ... grabbing info from Memory
                var cell;
                var currOp = _CPU.IR.toString(16).toLocaleUpperCase();
                ;
                var opHighlights = [];
                /*** loop through cells in the row ***/
                for (var j = 0; j < 8; j++) {
                    cell = row.insertCell(-1);
                    cell.innerHTML = memory[p_addr].toLocaleUpperCase();
                    /** highlights current address and op codes
                     * if PCB exists in CPU, program is executing, and whatever current op code we're on, highlight
                    **/
                    if (_CPU.Pcb && _CPU.isExecuting && opCodeMap[currOp]) {
                        /** if PCB segment's base + PC - current op code's PC - 1 = physical address, highlight blue
                         * we want that extra "-1" due to the PC being incremented at the end of a cycle
                        **/
                        if ((_CPU.Pcb.segment.base + _CPU.PC - opCodeMap[currOp].pcNum - 1) == p_addr) {
                            cell.style.background = "#00adec";
                            highlightCell = cell;
                            opHighlights[0] = opCodeMap[currOp].pcNum;
                            opHighlights[1] = false;
                            /** if current op code is D0, don't highlight
                             * this is cause D0 is our branch operation
                            **/
                            if (currOp == "D0") {
                                opHighlights[0] = 0;
                            }
                        }
                        /** if the 1st index is greater than 0 and there's something in the 2nd, highlight pink **/
                        if ((opHighlights[0] > 0) && opHighlights[1]) {
                            cell.style.background = "#ff00ff";
                            highlightCell = cell;
                            opHighlights[0]--;
                        }
                        /** if the 1st index is greater than 0 and there's not something in the 2nd, skip highlight **/
                        if ((opHighlights[0] > 0) && (!opHighlights[1])) {
                            opHighlights[1] = true;
                        }
                    }
                    p_addr++;
                }
                table.replaceChild(tBody, table.tBodies[0]);
                // TODO: maybe throw this back in
                // /** if highlighted cell, scroll into view **/
                // if (highlightCell) {
                //     highlightCell.scrollIntoView(true);
                // }
            }
        }
        static hostCpuDisplay() {
            var table = document.getElementById("tableCpu");
            table.deleteRow(-1);
            var row = table.insertRow(-1);
            var cell;
            // PC
            cell = row.insertCell();
            cell.innerHTML = _CPU.PC.toString(16).toLocaleUpperCase();
            // Acc
            cell = row.insertCell();
            cell.innerHTML = _CPU.Acc.toString(16).toLocaleUpperCase();
            // IR
            cell = row.insertCell();
            cell.innerHTML = _Memory.memory[_CPU.PC].toString().toLocaleUpperCase();
            // X Reg
            cell = row.insertCell();
            cell.innerHTML = _CPU.Xreg.toString(16).toLocaleUpperCase();
            // Y Reg
            cell = row.insertCell();
            cell.innerHTML = _CPU.Yreg.toString(16).toLocaleUpperCase();
            // Z Flag
            cell = row.insertCell();
            cell.innerHTML = _CPU.Zflag.toString(16).toLocaleUpperCase();
        }
        // TODO: change to allow for multiple PCBs for Project 3
        static hostPcbDisplay() {
            // var table = document.getElementById("tablePcb") as HTMLTableElement;
            // table.deleteRow(-1);
            // var row = table.insertRow(-1);
            // var cell;
            // // PID
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().pid.toString(16).toLocaleUpperCase();
            // // PC
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().PC.toString(16).toLocaleUpperCase();
            // // Acc
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().Acc.toString(16).toLocaleUpperCase();
            // // IR
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().IR.toString(16).toLocaleUpperCase();
            // // X Reg
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().Xreg.toString(16).toLocaleUpperCase();
            // // Y Reg
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().Yreg.toString(16).toLocaleUpperCase();
            // // Z Flag
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().Zflag.toString(16).toLocaleUpperCase();
            // // Priority
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().priority.toString(16).toLocaleUpperCase();
            // // State
            // cell = row.insertCell();
            // cell.innerHTML = _ResidentList.pop().state;
            var table = document.getElementById("tablePcb");
            var tBody = document.createElement('tbody');
            var row;
            for (var i = 0; i < _ResidentList.length; i++) {
                row = tBody.insertRow(-1);
                row.insertCell(-1).innerHTML = _ResidentList[i].pid;
                row.insertCell(-1).innerHTML = _ResidentList[i].PC;
                row.insertCell(-1).innerHTML = _ResidentList[i].Acc.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].Xreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].Yreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].Zflag.toString(16);
                row.insertCell(-1).innerHTML = _ResidentList[i].priority;
                row.insertCell(-1).innerHTML = _ResidentList[i].state.toLocaleUpperCase();
            }
            table.replaceChild(tBody, table.tBodies[0]);
        }
        //
        // Host Button Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStepMode").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // .. set status
            document.getElementById("Status").innerHTML = "Status:  RUNNING";
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... Create and initialize memory
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            //_MemoryManager = new TSOS.MemoryManager();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
            document.getElementById("Status").innerHTML = "Status:  HALTED";
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static hostBtnSingleStepMode_click(btn) {
            _SingleStepMode = !_SingleStepMode;
            var nextStep = document.getElementById("btnNextStepMode").disabled = !_SingleStepMode;
        }
        static hostBtnNextStepMode_click(btn) {
            if (_SingleStepMode) {
                _NextStepMode = true;
            }
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map