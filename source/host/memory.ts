/* ------------
     Memory.ts

     The representation of the hardware memory (think like RAM or cache).

     Note: For this project, we have a limit.  Since we're basing our project on the 6502 processors of
     old, we only have 255 bytes of memory to work with :).
    ------------ */

module TSOS {
    
    export class Memory {
        //public memory;

        constructor(public memory: string[] = []) {
            //this.memory = memory;
        }

        public init(): void {
            for (var i = 0; i < MEMORY_SIZE; i++) {
                this.memory[i] = "00";
            }
        }
    }
}