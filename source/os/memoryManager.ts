/* ------------
    MemoryManager.ts

    Organizes, controls, and talks with memory.
    Here, we set the registers and availability of any given segment, as well as load our programs.

    Memory segments can be considered with a "base" register (a min) and a "limit" register (a max) for
        available addresses.  This will be important for keeping track of multiple programs in memory.

    (Thanks to OSDev Wiki for helping me to clear up conceptual issues)
    ------------ */

module TSOS {

    export class MemoryManager {
        constructor(public registers: any[] = [],               // registers for the given segment
                    public isAvailable: boolean[] = []) {       // availability of segment
        }

        public init(): void {
            /*** loops through number of memory segments to assign availibility and register attributes ***/
            for (var i = 0; i < MEMORY_SIZE / NUM_OF_SEGMENTS; i++) {
                this.isAvailable[i] = true;
                this.registers[i] = { index: i,
                                      base: MEMORY_SIZE * i,
                                      limit: MEMORY_SIZE * (i + 1) 
                                    };
            }
        }

        public load(program, priority): Pcb {
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

        public clearAllMem(ignoreProcesses): void {
            for (var segment of this.registers) {
                if (!ignoreProcesses.includes(segment.index)) {
                    _MemoryAccessor.reset(segment);
                }
            }
        }

        // TODO: might want to throw run() and terminate() into another file come Project 3

        public run(pcb) {
            pcb.state = "running";

            /*** check if there's a PCB in CPU and if the state hasn't been set to "terminated" 
             * if so, then set state to "ready"
            ***/
            if (_CPU.Pcb && _CPU.Pcb.state !== "terminated") {
                _CPU.Pcb.state = "ready";
            }

            // TODO: change to CURR_PROCESS later
            _CPU.Pcb = _ResidentList[0];
            _CPU.isExecuting = true;
        }

        public terminate() {
            var pcb = _CPU.Pcb;
            
            /** check if there's a PCB in CPU and if the PCB there has been set to "terminated"
             * if so, update the PCB in CPU, change the state, and stop execution 
            **/
            if (_CPU.Pcb && _CPU.Pcb != "terminated") {
                _CPU.updatePcb(pcb);
                _CPU.Pcb.state = "terminated";
                _CPU.isExecuting = false;
            }
        }
    }
}