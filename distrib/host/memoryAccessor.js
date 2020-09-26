/* ------------
     MemoryAccessor.ts

     Accesses memory by reading and writing to segments via their addresses.
     Here, we're going to split the addresses into "Physical" and "Virtual" addresses.  This is namely to keep
     processes separate when running.  And it keeps the code clean (bonus!).

     Physical accesses RAM (or what we're going to consider RAM) and has to use relocation tables for allocation.
        This also means we need contiguous blocks of memory.
     Virtual can be mapped to any Physical address, allowing each program or segment to have their own address.
        This helps free up some of the fragmentation issues.

    (Thanks to OSDev Wiki for helping me to clear up conceptual issues : ) )
    ------------ */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        read(segment, v_addr) {
            var p_addr = v_addr + segment.base;
            if (p_addr >= segment.limit || v_addr < 0) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(INVALID_ADDR_IRQ, _CPU.Pcb.pid));
                _MemoryManager.terminate();
                return;
            }
            else {
                return _Memory.memory[p_addr];
            }
        }
        write(segment, v_addr, hexPair) {
            var p_addr = v_addr + segment.base;
            if (p_addr >= segment.limit || v_addr < 0) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(INVALID_ADDR_IRQ, _CPU.Pcb.pid));
                _MemoryManager.terminate();
                return false;
            }
            else {
                _Memory.memory[p_addr] = hexPair;
                return true;
            }
        }
        reset(segment) {
            for (var i = 0; i < MEMORY_SIZE; i++) {
                this.write(segment, i, "00");
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map