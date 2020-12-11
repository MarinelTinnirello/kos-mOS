/* ------------
     Memory.ts

     The representation of the hardware storage using HTML5 session storage.

     Note: For this project, we're using session storage over local because when the user runs the OS,
           we want them to have a fresh start each time.  In a real OS, we wouldn't necessarily want that.
    ------------ */
var TSOS;
(function (TSOS) {
    class Disk {
        constructor(trackNum = 4, // number of tracks
        sectorNum = 8, // number of sectors
        blockNum = 8, // number of blocks
        dataHeader = 4, // size of the data's header
        dataSize = 60) {
            this.trackNum = trackNum;
            this.sectorNum = sectorNum;
            this.blockNum = blockNum;
            this.dataHeader = dataHeader;
            this.dataSize = dataSize;
        }
        init() {
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
        initBlock(key) {
            // builds an initial data set for the disk
            var availabilityBit = '0';
            // we want some initialization char, either 0 or F makes the most sense, but we could also do ~
            // I like ~ :)
            var pointerBits = ['F', 'F', 'F'];
            var data = Array(this.dataSize).fill("00");
            data = pointerBits.concat(data);
            data.unshift(availabilityBit);
            sessionStorage.setItem(key, data.join(''));
        }
        //
        // Getters
        //
        getTrackNum() {
            return this.trackNum;
        }
        getSectorNum() {
            return this.sectorNum;
        }
        getBlockNum() {
            return this.blockNum;
        }
        getDataHeader() {
            return this.dataHeader;
        }
        getDataSize() {
            return this.dataSize;
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map