/* ------------
     Memory.ts

     The representation of the hardware memory (think like RAM or cache).

     Note: For this project, we have a limit.  Since we're basing our project on the 6502 processors of
           old, we only have 255 bytes of memory to work with :).
    ------------ */
var TSOS;
(function (TSOS) {
    class Memory {
        constructor(memory = []) {
            this.memory = memory;
        }
        init() {
            /*** loop through memory segment size and initialize all indices to 0
             * or rather, "00" cause everything is considered in hex pairs
            ***/
            for (var i = 0; i < MEMORY_SIZE * NUM_OF_SEGMENTS; i++) {
                this.memory[i] = "00";
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map