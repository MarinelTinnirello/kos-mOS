/* ------------
     Memory.ts

     The representation of the hardware memory (think like RAM or cache).

     Note: For this project, we have a limit.  Since we're basing our project on the 6502 processors of
           old, we only have 255 bytes of memory to work with :).
    ------------ */

module TSOS {
    
    export class Memory {

        constructor(public memory: string[] = []) {
        }

        public init(): void {
            /*** loop through memory segment size and initialize all indices to 0
             * or rather, "00" cause everything is considered in hex pairs 
            ***/
            for (var i = 0; i < MEMORY_SIZE * NUM_OF_SEGMENTS; i++) {
                this.memory[i] = "00";
            }
        }
    }
}