/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, Acc = 0, IR = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, Pcb = null) {
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.Pcb = Pcb;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.Pcb = null;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // ... fetch
            this.IR = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC), 16);
            // ... execute
            switch (this.IR) {
                case 0xA9:
                    this.loadAccConst();
                    break;
                case 0xAD:
                    this.loadAccMem();
                    break;
                case 0x8D:
                    this.storeAccMem();
                    break;
                case 0x6D:
                    this.addWithCarry();
                    break;
                case 0xA2:
                    this.loadXRegConst();
                    break;
                case 0xAE:
                    this.loadXRegMem();
                    break;
                case 0xA0:
                    this.loadYRegConst();
                    break;
                case 0x00:
                    this.brk();
                    break;
                case 0xEA:
                    this.noOp();
                    break;
                case 0xEC:
                    this.compare();
                    break;
                case 0xD0:
                    this.branch();
                    break;
                case 0xEE:
                    this.increment();
                    break;
                case 0xFF:
                    this.sysCall();
                    break;
                default:
                    //_Kernel.krnTrapError(`Process Execution Exception: Instruction '${this.IR.toString(16).toUpperCase()}' is not valid`);
                    //this.PCB.terminate();
                    this.isExecuting = false;
            }
        }
        //
        // Op code functions
        //
        loadAccConst() {
            this.Acc = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 1), 16);
            this.PC += 2;
        }
        loadAccMem() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            this.Acc = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }
        storeAccMem() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            _MemoryAccessor.write(this.Pcb.segment, addr, this.Acc.toString(16));
            this.Acc = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }
        addWithCarry() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            this.Acc = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }
        loadXRegConst() {
            this.Xreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC), 16);
            this.PC += 2;
        }
        loadXRegMem() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            this.Xreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }
        loadYRegConst() {
            this.Yreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC), 16);
            this.PC += 2;
        }
        loadYRegMem() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            this.Yreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }
        noOp() {
            this.PC++;
        }
        brk() {
            //return;
        }
        compare() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            this.Zflag = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16) === this.Xreg ? 1 : 0;
            this.PC += 3;
        }
        branch() {
            if (this.Zflag == 0) {
                this.PC += parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 1), 16);
                this.PC += 2;
                this.PC %= 256;
            }
            else {
                this.PC += 2;
            }
        }
        increment() {
            var addr = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 2), 16);
            var val = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            val++;
            _MemoryAccessor.write(this.Pcb.segment, addr, val.toString(16));
            this.PC += 3;
        }
        sysCall() {
            if (this.Xreg === 1) {
                //_KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_YREGISTER_IRQ));
            }
            else if (this.Xreg === 2) {
                //_KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_FROM_MEMORY_IRQ));
            }
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map