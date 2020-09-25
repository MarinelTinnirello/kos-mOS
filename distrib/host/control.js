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
            var table = document.getElementById("tableMemory");
            var tBody = document.createElement('tbody');
            table.style.display = 'block';
            // table data taken from Memory
            var row;
            var rowLabel = "0x000";
            var rowNum = 0;
            var placeNum = 0;
            var highlightCell;
            // Memory data needed to be placed in table
            var p_addr = 0;
            var memory = _Memory.memory;
            for (var i = 0; i < MEMORY_SIZE / 8; i++) {
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
                row.insertCell(-1).innerHTML = rowLabel.slice(0, placeNum) + rowNum.toString(16).toLocaleUpperCase();
                // ... grabbing info from Memory
                var cell;
                var currOp = _CPU.IR.toString(16).toLocaleUpperCase();
                ;
                var opHighlights = [];
                for (var j = 0; j < 8; j++) {
                    cell = row.insertCell(-1);
                    cell.innerHTML = memory[p_addr].toLocaleUpperCase();
                    // ... hightlights current address and op codes
                    if (_CPU.Pcb && _CPU.isExecuting && opCodeMap[currOp].pcNum) {
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
                        if ((opHighlights[0] > 0) && opHighlights[1]) {
                            cell.style.background = "#ff00ff";
                            highlightCell = cell;
                            opHighlights[0]--;
                        }
                        if ((opHighlights[0] > 0) && (!opHighlights[1])) {
                            opHighlights[1] = true;
                        }
                    }
                    p_addr++;
                }
                table.replaceChild(tBody, table.tBodies[0]);
                if (highlightCell) {
                    highlightCell.scrollIntoView({ block: `nearest` });
                }
            }
        }
        static hostCputDisplay() {
            var table = document.getElementById("tableCpu");
            var tBody = document.createElement("tbody");
            var currOp = _CPU.IR.toString(16).toLocaleUpperCase();
            var row = table.rows[1];
            /** if invalid op code, exit **/
            if (!opCodeMap[currOp]) {
                return;
            }
            // ... grabs info from CPU
            row.cells[0].innerHTML = (_CPU.PC - opCodeMap[currOp].pcNum - 1).toString();
            row.cells[1].innerHTML = currOp;
            row.cells[2].innerHTML = _CPU.Acc.toString(16).toLocaleUpperCase();
            row.cells[3].innerHTML = _CPU.Xreg.toString(16).toLocaleUpperCase();
            row.cells[4].innerHTML = _CPU.Yreg.toString(16).toLocaleUpperCase();
            row.cells[5].innerHTML = _CPU.Zflag.toString(16).toLocaleUpperCase();
        }
        // TODO: don't do this for Project 2, you're gonna need to set up a Scheduler
        static hostPcbDisplay() {
            var table = document.getElementById("tablePcb");
            var tBody = document.createElement("tbody");
            table.style.display = 'block';
            table.style.height = '200px';
            var row;
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