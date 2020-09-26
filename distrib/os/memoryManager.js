/* ------------
    MemoryManager.ts

    Organizes, controls, and talks with memory.
    Here, we set the registers and availability of any given segment, as well as load our programs.

    (Thanks to OSDev Wiki for helping me to clear up conceptual issues)
    ------------ */
var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor(registers = [], isAvailable = []) {
            this.registers = registers;
            this.isAvailable = isAvailable;
        }
        init() {
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
            for (var i = 0; i < this.isAvailable.length; i++) {
                if (this.isAvailable[i]) {
                    segment = i;
                    break;
                }
            }
            var pcb = new TSOS.Pcb();
            _MemoryAccessor.reset(this.registers[segment]);
            var status;
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.registers[segment], i, program[i]);
                if (!status) {
                    return;
                }
            }
            this.isAvailable[segment] = false;
            pcb.segment = this.registers[segment];
            pcb.priority = parseInt(priority) || 0;
            return pcb;
        }
        run(pcb) {
            pcb.state = "running";
            if (_CPU.Pcb && _CPU.Pcb.state !== "terminated") {
                _CPU.Pcb.state = "ready";
            }
            _CPU.isExecuting = true;
        }
        terminate() {
            var pcb = _CPU.Pcb;
            if (_CPU.Pcb && _CPU.Pcb != "terminated") {
                _CPU.updatePcb(pcb);
                _CPU.Pcb.state = "terminated";
                _CPU.isExecuting = false;
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map