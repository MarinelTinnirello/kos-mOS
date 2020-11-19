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
        sectorNum = 4, // number of sectors
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
                        //
                    }
                }
            }
            // Fill the MBR (only done once)
        }
        initBlock(key) {
            // builds an initial data set for the disk
            var availabilityBit = '0';
            var pointerBits = ['0', '0', '0'];
            var data = Array(this.dataSize).fill("0");
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