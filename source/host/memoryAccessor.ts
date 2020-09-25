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

module TSOS {
    export class MemoryAccessor {
        public p_addr;
        public v_addr;

        public read(segment, v_addr) {
            var p_addr = v_addr + segment.base;

            if (p_addr >= segment.limit || v_addr < 0) {
                //_Kernel.krnTrapError("Memory read exception: Cannot read memory address. Address is out of bounds");
                //_Dispatcher.terminateCurrentProcess();

                return;
            }
            else {
                return _Memory.memory[p_addr];
            }
        }

        public write(segment, v_addr, hexPair): boolean {
            var p_addr = v_addr + segment.base;

            // Memory protection
            if (p_addr >= segment.limit || v_addr < 0) {
                //_Kernel.krnTrapError("Memory write exception: Cannot write to memory address. Address is out of bounds.");
                //_Dispatcher.terminateCurrentProcess();

                return false;
            }
            else {
                _Memory.memory[p_addr] = hexPair;

                return true;
            }
        }

        public reset(segment): void {
            for (var i = 0; i < MEMORY_SIZE; i++) {
                this.write(segment, i, "00");
            }
        }
    }
}