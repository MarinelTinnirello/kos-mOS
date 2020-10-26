/* ------------
    MemoryManager.ts

    Organizes, controls, and talks with memory.
    Here, we set the registers and availability of any given segment, as well as load our programs.

    Memory segments can be considered with a "base" register (a min) and a "limit" register (a max) for
        available addresses.  This will be important for keeping track of multiple programs in memory.

    (Thanks to OSDev Wiki for helping me to clear up conceptual issues)
    ------------ */
var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor(registers = [], // registers for the given segment
        isAvailable = []) {
            this.registers = registers;
            this.isAvailable = isAvailable;
        }
        init() {
            /*** loops through number of memory segments to assign availibility and register attributes ***/
            for (var i = 0; i < MEMORY_SIZE / NUM_OF_SEGMENTS; i++) {
                this.isAvailable[i] = true;
                this.registers[i] = { index: i,
                    base: MEMORY_SIZE * i,
                    limit: MEMORY_SIZE * (i + 1)
                };
            }
        }
        load(program, priority) {
            var segment;
            /*** loop through availability array to check if the current index is available
             * if so, set that segment to that index and break out
            ***/
            for (var i = 0; i < this.isAvailable.length; i++) {
                if (this.isAvailable[i]) {
                    segment = i;
                    break;
                }
            }
            var pcb = new TSOS.Pcb();
            _MemoryAccessor.reset(this.registers[segment]);
            var status;
            /*** loop through program's length to set the status
             * if there is no status, break out
            ***/
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.registers[segment], i, program[i]);
                if (!status) {
                    return;
                }
            }
            // Set availability for current segment and PCB
            this.isAvailable[segment] = false;
            pcb.segment = this.registers[segment];
            // Set priority for current process
            pcb.priority = parseInt(priority) || 0;
            pcb.state = "process";
            // push current PCB into process list
            _ResidentList.push(pcb);
            return pcb;
        }
        clearAllMem(ignoreProcesses) {
            for (var segment of this.registers) {
                if (!ignoreProcesses.includes(segment.index)) {
                    _MemoryAccessor.reset(segment);
                }
            }
        }
        //
        // Dispatcher functions
        //
        run() {
            // Ready queue already re-ordered, but the current process hasn't been updated yet
            /*** check if there's a PCB in CPU and if the state hasn't been set to "terminated"
             * if so, then set state to "ready"
            ***/
            if (_CPU.Pcb && _CPU.Pcb.state !== "terminated") {
                _CPU.Pcb.state = "ready";
            }
            _CPU.updatePcb(_ReadyQueue[0]);
            _CPU.isExecuting = true;
        }
        terminate() {
            var pcb = _CPU.Pcb;
            /** check if there's a PCB in CPU and if the PCB there has been set to "terminated"
             * if so, update the PCB in CPU, change the state, and stop execution
            **/
            if (_CPU.Pcb && _CPU.Pcb != "terminated") {
                _CPU.savePcbState();
                _Scheduler.terminateCurrProcess(pcb);
                if (_ReadyQueue.length == 1) {
                    _CPU.isExecuting = false;
                }
            }
        }
        contextSwitch() {
            var currentProcess = _ReadyQueue.shift();
            _ReadyQueue.push(currentProcess);
            _Scheduler.currProcess = _ReadyQueue[0];
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map