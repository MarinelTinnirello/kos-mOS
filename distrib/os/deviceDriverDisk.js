var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor(formatted = false, forbiddenPrefixes = ['@'], specialPrefixes = ['@', '.'], masterBootRecord = '0:0:0', directoryDataInfo = { 'type': 'directory', 'start': '0:0:1', 'end': '0:7:7' }, fileDataInfo = { 'type': 'file', 'start': '1:0:0', 'end': '3:7:7' }) {
            super();
            this.formatted = formatted;
            this.forbiddenPrefixes = forbiddenPrefixes;
            this.specialPrefixes = specialPrefixes;
            this.masterBootRecord = masterBootRecord;
            this.directoryDataInfo = directoryDataInfo;
            this.fileDataInfo = fileDataInfo;
            this.driverEntry = this.krnFsDriverEntry;
            this.isr = this.krnFsDispatchOperation;
        }
        krnFsDriverEntry() {
            this.status = "loaded";
        }
        krnFsDispatchOperation(params) {
            var action = params[0]; // Operation to be completed
            var target = params[1]; // Target of operation -- file or directory name
            var data = params[2]; // Any data associated with operation
            var flags = params[3]; // Flags that modify action
            var result;
            if (action == 'format') {
                result = this.format(flags);
                _StdOut.putText(result.msg);
            }
            else {
                if (this.formatted) {
                    switch (action) {
                        case 'create': {
                            result = this.create(target, false);
                            _StdOut.putText(result.msg);
                            break;
                        }
                        case 'read': {
                            result = this.readFile(target, target[0] == '@');
                            _StdOut.putText(typeof result.msg == 'string' ? result.msg : result.msg.join(''));
                            break;
                        }
                        case 'write': {
                            result = this.writeFile(target, data, false);
                            _StdOut.putText(result.msg);
                            break;
                        }
                        case 'delete': {
                            result = this.deleteFile(target, false);
                            _StdOut.putText(result.msg);
                            break;
                        }
                        case 'list': {
                            result = this.list(flags);
                            _StdOut.putText(result.msg);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
                else {
                    _StdOut.putText("The disk must be formatted first!");
                }
            }
        }
        create(fileName, isSwap) {
            // Checks for files before creation
            /** if file's length is greater than data size,
             * then file is too big
            **/
            if (fileName.length > _Disk.getDataSize()) {
                return { status: 1, msg: `File name '${fileName}' is too big` };
            }
            /** if file is found within directory,
             * then file already exists
            **/
            if (this.searchFiles(new RegExp(`^${fileName}$`), this.directoryDataInfo)[0]) {
                return { status: 1, msg: `File with name '${fileName}' already exists` };
            }
            var key = this.findFreeSpace(1, this.directoryDataInfo)[0];
            /** if there's no key,
             * then there's no space to create file
            **/
            if (!key) {
                return { status: 1, msg: `Insufficient space to create file '${fileName}'` };
            }
            // if all these checks pass, grab a block of memory
            var block = this.read(key);
            block.availabilityBit = 1;
            block.data = fileName;
            this.write(key, block);
            return { status: 0, msg: `File '${fileName}' created successfully` };
        }
        read(key) {
            /** if key is of type object,
             * turn key into string
            **/
            if (typeof key == 'object') {
                key = this.keyObjectToString(key);
            }
            var block = sessionStorage.getItem(key);
            // I hate how this looks, might think of a smarter way to do it just cause it looks ugly
            var blockObj = { 'availabilityBit': parseInt(block[0]),
                'pointerBits': this.keyStringToObject(block.substring(1, 4)),
                'data': block.substring(_Disk.getDataHeader()).match(/.{1,2}/g) };
            return blockObj;
        }
        write(key, block) {
            // Checks before writing data
            /** if key is of type object,
             * turn key into string
            **/
            if (typeof key == 'object') {
                key = this.keyObjectToString(key);
            }
            /** if block's data is of type string,
             * then turn it into hex
            **/
            if (typeof block.data == 'string') {
                block.data = this.translateToHex(block.data);
            }
            /** if data's length is less than the size,
             * loop through and fill in 00s
            **/
            if (block.data.length < _Disk.getDataSize()) {
                var orgDataSize = block.data.length;
                for (var i = 0; i < _Disk.getDataSize() - orgDataSize; i++) {
                    block.data.push('00');
                }
            }
            var data = Object.values(block.pointer).concat(block.data);
            data.unshift(block.availability.toString());
            sessionStorage.setItem(key, data.join(''));
        }
        readFile(target, isSwap) {
            var result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
            if (result.length == 0) {
                return { status: 1, msg: `File '${target}' does not exist` };
            }
            var dirKey = result[0];
            var dirBlock = this.read(dirKey);
            var output = isSwap ? [] : '';
            var currBlock;
            var currPointer = this.keyObjectToString(dirBlock.pointerBits);
            while (currPointer != "0:0:0") {
                currBlock = this.read(currPointer);
                // Program hex should not be translated
                /** if current pointer isn't swapped,
                 * turn output into hex
                 * else, concatinate
                **/
                if (!isSwap) {
                    output += this.translateFromHex(currBlock.data);
                }
                else {
                    output = output.concat(currBlock.data);
                }
                currPointer = this.keyObjectToString(currBlock.pointer);
            }
            /** if is swapped and output is of type object,
             * loop through output and get rid of extra 00s
            **/
            if (isSwap && typeof output == 'object') {
                while (output[output.length - 1] == '00' && (output[output.length - 2] && output[output.length - 2] == '00')) {
                    output.pop();
                }
            }
            return { status: 0, msg: output };
        }
        writeFile(target, data, isSwap) {
            /** if not a swap file,
             * then don't split data
            **/
            if (!isSwap) {
                data = data.split("");
            }
            // Break up data into an array of arrays each at most 60 characters in length
            var dataPieces = [];
            while (data.length > 0) {
                dataPieces.push(data.splice(0, _Disk.dataSize));
            }
            var dirBlockResult = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
            /** if directory block's result's length is 0,
             * then file doesn't exist
            **/
            if (dirBlockResult.length == 0) {
                return { status: 1, msg: `File '${target}' does not exist` };
            }
            var dirKey = dirBlockResult[0];
            var dirBlock = this.read(dirKey);
            var currBlock;
            var currPointer = this.keyObjectToString(dirBlock.pointerBits);
            /*** while current pointer isn't empty,
             * read current pointer and set the key object to string
            ***/
            while (currPointer != "F:F:F") {
                currBlock = this.read(currPointer);
                this.delete(currPointer);
                currPointer = this.keyObjectToString(currBlock.pointer);
            }
            var keys = this.findFreeSpace(Object.keys(dataPieces).length, this.fileDataInfo);
            var freeBlocks = keys.map(key => this.read(key));
            if (freeBlocks.length != Object.keys(dataPieces).length) {
                return { status: 1, msg: `Insufficient space` };
            }
            // Set pointer to key of 1st block, update
            dirBlock.pointerBits = this.keyStringToObject(keys[0]);
            this.write(dirKey, dirBlock);
            /*** for i < amount of free blocks, increment,
             * fill the blocks with data, pointer, and availbility bit
             * update disk
            ***/
            for (var i = 0; i < freeBlocks.length; i++) {
                /** if the indexed free block's data is swapped and on the current data piece,
                 * avoid joining
                **/
                freeBlocks[i].data = isSwap ? dataPieces[i] : dataPieces[i].join("");
                freeBlocks[i].availabilityBit = 1;
                /** if index++ is not the amount of free blocks,
                 * set the indexed's pointer bits to be key string's object
                **/
                if (i + 1 != freeBlocks.length) {
                    freeBlocks[i].pointerBits = this.keyStringToObject(keys[i + 1]);
                }
                this.write(keys[i], freeBlocks[i]);
            }
            return { status: 0, msg: `Data successfully written to file '${target}'` };
        }
        delete(key) {
            _Disk.initBlock(key);
        }
        deleteFile(target, isSwap) {
            var result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
            if (result.length == 0)
                return { status: 1, msg: `File '${target}' does not exist` };
            var dirKey = result[0];
            var dirBlock = this.read(dirKey);
            this.delete(dirKey);
            var currBlock;
            var currPointer = this.keyObjectToString(dirBlock.pointerBits);
            /*** while current pointer isn't empty,
             * set current block to read pointer
             * set current pointer to key object's string
            ***/
            while (currPointer != "F:F:F") {
                currBlock = this.read(currPointer);
                this.delete(currPointer);
                currPointer = this.keyObjectToString(currBlock.pointer);
            }
            return { status: 0, msg: `File '${target}' successfully deleted` };
        }
        list(flags) {
            var keys;
            /** if flag is "L",
             * search files
             * else, search for special chars
            **/
            if (flags.includes('l')) {
                keys = this.searchFiles(new RegExp('.'), this.directoryDataInfo);
            }
            else {
                keys = this.searchFiles(new RegExp(`^(?!^[${this.specialPrefixes.join('')}])`), this.directoryDataInfo);
            }
            var files = keys.map(key => this.translateFromHex(this.read(key).data));
            return { status: 0, msg: files.join(' ') };
        }
        format(flags) {
            /** if flag is "quick",
             * then format full 1st, then do a quick format
             * else if flag is "full" and length is 0, then full format
            **/
            if (flags.includes('quick')) {
                /** if this isn't formatted,
                 * then can't perform a quick format
                **/
                if (!this.formatted) {
                    return { status: 1, msg: "Hard drive must be fully formatted first" };
                }
                var key = this.keyStringToObject(this.directoryDataInfo.start);
                var keyLimit = this.keyStringToObject(this.fileDataInfo.end);
                /*** for t, s, b,
                 * read into block
                 * skip previously initialized blocks
                ***/
                for (var t = key.t; t <= keyLimit.t; t++) {
                    for (var s = key.s; s <= keyLimit.s; s++) {
                        // Ternary to skip MBR
                        for (var b = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                            var block = this.read({ t, s, b });
                            if (block.availabilityBit) {
                                block.availabilityBit = 0;
                                block.pointerBits = { 't': 'F', 's': 'F', 'b': 'F' };
                                this.write({ t, s, b }, block);
                            }
                        }
                    }
                }
                var processes = _ResidentList.filter(proc => proc.storageLocation == 'hdd' && proc.state != 'terminated');
                for (var proc of processes) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, [proc]));
                }
                return { status: 0, msg: "Hard drive quickly formatted" };
            }
            else if (flags.includes('full') || flags.length == 0) { // No flags, assume full format
                _Disk.init();
                this.formatted = true;
                var processes = _ResidentList.filter(proc => proc.storageLocation == 'hdd' && proc.state != 'terminated');
                for (var proc of processes) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, [proc]));
                }
                return { status: 0, msg: "Hard drive fully formatted" };
            }
            else {
                return { status: 1, msg: "Supplied flag(s) not valid" };
            }
        }
        findFreeSpace(amount, dataInfo) {
            var key = this.keyStringToObject(dataInfo.start);
            var keyLimit = this.keyStringToObject(dataInfo.end);
            var freeKeys = [];
            /*** for t, s, b,
             * read into block
             * break out if all keys found
            ***/
            trackLoop: for (var t = key.t; t <= keyLimit.t; t++) {
                sectorLoop: for (var s = key.s; s <= keyLimit.s; s++) {
                    blockLoop: // Ternary to skip MBR
                     for (var b = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                        var block = this.read({ t, s, b });
                        if (!block.availabilityBit) {
                            freeKeys.push(this.keyObjectToString({ t, s, b }));
                            amount--;
                        }
                        if (amount == 0) {
                            break trackLoop;
                        }
                    }
                }
            }
            return freeKeys;
        }
        keyStringToObject(key) {
            /** if key is initialized ("FFF"),
             * then return t, s, b initialized
             *  else if key is ":", parse t, s, b into ints
             * else, split key by parsing (this will be the pointer)
            **/
            if (key == 'FFF') {
                return { 't': 'F', 's': 'F', 'b': 'F' };
            }
            else if (key.includes(':')) {
                key = key.split(':');
                return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2]) };
            }
            else {
                key = key.split('');
                return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2]) };
            }
        }
        keyObjectToString(key) {
            // Make key into string for session storage
            return `${key.t}:${key.s}:${key.b}`;
        }
        translateToHex(data) {
            data = data.split('');
            for (var i in data) {
                data[i] = data[i].charCodeAt().toString(16);
            }
            return data;
        }
        translateFromHex(data) {
            var output = '';
            for (var i in data) {
                if (data[i] == "00") {
                    break;
                }
                output += String.fromCharCode(parseInt(data[i], 16));
            }
            return output;
        }
        searchFiles(re, dataInfo) {
            var key = this.keyStringToObject(dataInfo.start);
            var keyLimit = this.keyStringToObject(dataInfo.end);
            var outputKeys = [];
            /*** for t, s, b,
             * read into block
             * check if it lines up with search
            ***/
            for (var t = key.t; t <= keyLimit.t; t++) {
                for (var s = key.s; s <= keyLimit.s; s++) {
                    // Ternary to skip MBR
                    for (var b = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                        var block = this.read({ t, s, b });
                        if (!block.availabilityBit) {
                            continue;
                        }
                        block.data = this.translateFromHex(block.data);
                        if (re.test(block.data)) {
                            outputKeys.push(this.keyObjectToString({ t, s, b }));
                        }
                    }
                }
            }
            return outputKeys;
        }
        clearBlock(key) {
            _Disk.initBlock(key);
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map