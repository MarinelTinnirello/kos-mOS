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
        clearAllMem(ignoreProcesses) {
            for (var segment of this.registers) {
                if (!ignoreProcesses.includes(segment.index)) {
                    _MemoryAccessor.reset(segment);
                }
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
            var status;
            /** if memory is full
             * then set location to hard drive
             * else, run process from CPU
            **/
            if (segment === undefined) {
                // made it it's own function since all I wanted to do was to output some print statements
                // but I already set the return type to PCB, so it wasn't happening
                this.loadFromFile(pcb, status, program);
            }
            else {
                _MemoryAccessor.reset(this.registers[segment]);
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
            }
            // Set priority for current process
            pcb.priority = parseInt(priority) || 0;
            pcb.state = "process";
            // push current PCB into process list
            _ResidentList.push(pcb);
            return pcb;
        }
        //
        // File functions
        //
        loadFromFile(pcb, status, program) {
            /** if not formatted,
             * then cannot throw process into hard drive
            **/
            if (!_krnDiskDriver.isFormatted) {
                return _StdOut.putText("No memory available, format hard drive to run another process.");
            }
            // create file to put into hard drive
            pcb.swapFile = `@${pcb.pid}`;
            status = _krnDiskDriver.create(pcb.swapFile, true);
            if (status.status) {
                return _StdOut.putText(status.msg);
            }
            // write file into hard drive
            status = _krnDiskDriver.writeFile(pcb.swapFile, program, true);
            if (status.status) {
                return _StdOut.putText(status.msg);
            }
        }
        rollIn(pcb) {
            var segment;
            /*** loop through available segments,
             * if segment is available,
             * then stick to current segment
            ***/
            for (var i = 0; i < this.isAvailable.length; i++) {
                if (this.isAvailable[i]) {
                    segment = i;
                    break;
                }
            }
            var program = _krnDiskDriver.readFile(pcb.swapFile, true).msg;
            var status;
            _MemoryAccessor.reset(this.registers[segment]);
            /*** for program's length,
             * load into current free segment
            ***/
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.registers[segment], i, segment);
                /** if outside limit,
                 * terminate program
                **/
                if (!status) {
                    return;
                }
            }
            // update segment info
            this.isAvailable[segment] = false;
            pcb.segment = this.registers[segment];
            // delete temp swap file, update location
            _krnDiskDriver.deleteFile(pcb.swapFile, true);
            pcb.location = 'memory';
            return;
        }
        rollOut(pcb) {
            var programs = [];
            /*** for segment size,
             * grab program
            ***/
            for (var i = 0; i < MEMORY_SIZE; i++) {
                programs.push(_MemoryAccessor.read(pcb.segment, i));
            }
            this.isAvailable[pcb.segment.index] = true;
            // update PCB info
            pcb.swapFile = `@${pcb.pid}`;
            pcb.location = 'hdd';
            pcb.segment = {};
            // create temp swap file, write program
            _krnDiskDriver.create(pcb.swapFile, true);
            _krnDiskDriver.writeFile(pcb.swapFile, programs, true);
            return;
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
            _CPU.Pcb.state = "running";
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