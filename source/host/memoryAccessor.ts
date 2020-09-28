/* ------------
     MemoryAccessor.ts

     Accesses memory by reading and writing to segments via their addresses.
     Here, we're going to split the addresses into "Physical" and "Virtual" addresses.  This is namely to keep
        processes separate when running.  And it keeps the code clean (bonus!).

     Physical accesses RAM (or what we're going to consider RAM) and has to use relocation tables for allocation.
        This also means we need contiguous blocks of memory.
     Virtual can be mapped to any Physical address, allowing each program or segment to have their own address.
        This helps free up some of the fragmentation issues.

    (Thanks to OSDev Wiki for helping me to clear up conceptual issues :) )
    ------------ */

module TSOS {
    export class MemoryAccessor {
        public p_addr;
        public v_addr;

        public read(segment, v_addr): string {
            var p_addr = v_addr + segment.base;

            /** if the physical address >= segment's limit or the virtual address is less than 0,
             * throw an invalid address interrupt on the CPU's PCB pid and terminate the program
             * else, set the memory to be the physical address
            **/
            if (p_addr >= segment.limit || v_addr < 0) {
                _KernelInterruptQueue.enqueue(new Interrupt(INVALID_ADDR_IRQ, _CPU.Pcb.pid))
                _MemoryManager.terminate();

                return;
            }
            else {
                return _Memory.memory[p_addr];
            }
        }

        public write(segment, v_addr, hexPair): boolean {
            var p_addr = v_addr + segment.base;

            /** if the physical address >= segment's limit or the virtual address is less than 0,
             * throw an invalid address interrupt on the CPU's PCB pid, terminate the program, and return false
             * else, set the memory, using the physical address as the index, to be the hex pair, and return true
            **/
            if (p_addr >= segment.limit || v_addr < 0) {
                _KernelInterruptQueue.enqueue(new Interrupt(INVALID_ADDR_IRQ, _CPU.Pcb.pid))
                _MemoryManager.terminate();

                return false;
            }
            else {
                _Memory.memory[p_addr] = hexPair;

                return true;
            }
        }

        public reset(segment): void {
            /*** loop through memory segment to reset all addresses to 0 ***/
            for (var i = 0; i < MEMORY_SIZE; i++) {
                this.write(segment, i, "00");
            }
        }
    }
}