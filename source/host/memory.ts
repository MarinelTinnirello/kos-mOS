/* ------------
     Memory.ts

     The representation of the hardware memory (think like RAM or cache).

     Note: For this project, we have a limit.  Since we're basing our project on the 6502 processors of
     old, we only have 255 bytes of memory to work with :).
    ------------ */

module TSOS {
    
    export class Memory {

        constructor(public bytes: number[] = new Array()) {
            this.resetMemory();
        }

        public resetMemory(): void {
            for (var i = 0; i < 256; i++) {
                this.bytes[i] = 0x0;
            }
        }

        public setBytes(address: number, bytes: number[]): void {
            for (var i = 0; i < bytes.length; i++) {
                this.bytes[address + i] = bytes[i];
            }
        }

        public getBytes(address: number, bytes: number = 1) {
            if (bytes < 0) {
                return [];
            }

            return this.bytes.slice(address, address + bytes);
        }
    }
}