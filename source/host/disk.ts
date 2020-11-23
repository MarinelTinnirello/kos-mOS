/* ------------
     Memory.ts

     The representation of the hardware storage using HTML5 session storage.

     Note: For this project, we're using session storage over local because when the user runs the OS, 
           we want them to have a fresh start each time.  In a real OS, we wouldn't necessarily want that.
    ------------ */

module TSOS {

    export class Disk {

        constructor(public trackNum: number = 4,        // number of tracks
                    public sectorNum: number = 4,       // number of sectors
                    public blockNum: number = 8,        // number of blocks
                    public dataHeader: number = 4,      // size of the data's header
                    public dataSize: number = 60) {     // size of the rest of the data
        }

        public init(): void {
            /*** for each track, sector, and block, initialize the block ***/
            for (var i = 0; i < this.trackNum; i++) {
                for (var j = 0; j < this.sectorNum; j++) {
                    for (var k = 0; k < this.blockNum; k++) {
                        this.initBlock(`${i}:${j}:${k}`);
                    }
                }
            }

            // Fill the MBR (only done once)
            var block = _krnDiskDriver.read('0:0:0');

            block.availabilityBit = 1;
            block.data = `Anti-Gnosis Humanoid Fighting System, serial number 00-00-00-00-1.`;
            _krnDiskDriver.write('0:0:0', block);
        }

        public initBlock(key): void {
            // builds an initial data set for the disk
            var availabilityBit = '0';
            // we want some initialization char, either 0 or F makes the most sense, but we could also do ~
            var pointerBits = ['F', 'F', 'F'];
            var data = Array(this.dataSize).fill("00");

            data = pointerBits.concat(data);
            data.unshift(availabilityBit);
            sessionStorage.setItem(key, data.join(''));
        }


        //
        // Getters
        //
        public getTrackNum(): number {
            return this.trackNum;
        }

        public getSectorNum(): number {
            return this.sectorNum;
        }

        public getBlockNum(): number {
            return this.blockNum;
        }

        public getDataHeader(): number {
            return this.dataHeader;
        }

        public getDataSize(): number {
            return this.dataSize;
        }
    }
}