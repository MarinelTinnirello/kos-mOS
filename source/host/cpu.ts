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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public IR: number = 0x00,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public Pcb = null) {
        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.IR = 0x00;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.Pcb = null;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            // ... fetch
            this.IR = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC), 16);

            // ... execute
            switch(this.IR) {
                case 0xA9:                  // LDA
                    this.loadAccConst();
                    break;
                case 0xAD:                  // LDA
                    this.loadAccMem();
                    break;
                case 0x8D:                  // STA
                    this.storeAccMem();
                    break;
                case 0x6D:                  // ADC
                    this.addWithCarry();
                    break;
                case 0xA2:                  // LDX
                    this.loadXRegConst();
                    break;
                case 0xAE:                  // LDX
                    this.loadXRegMem();
                    break;
                case 0xA0:                  // LDY
                    this.loadYRegConst();
                    break;
                case 0xAC:                  // LDY
                    this.loadYRegMem();
                    break;
                case 0x00:                  // BRK
                    this.brk();
                    break;
                case 0xEA:                  // NOP
                    this.noOp();
                    break;
                case 0xEC:                  // CPX
                    this.compare();
                    break;
                case 0xD0:                  // BNE
                    this.branch();
                    break;
                case 0xEE:                  // INC
                    this.increment();
                    break;
                case 0xFF:                  // SYS
                    this.sysCall();
                    break;
                default:
                    _StdOut.advanceLine();
                    _StdOut.putText("Invalid op code. Process cannot be loaded.");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    
                    _Kernel.krnTrapError("Invalid op code. Process cannot be loaded.");
                    //_KernelInterruptQueue.enqueue(new Interrupt(INVALID_OPCODE_IRQ, this.Pcb.pid))
                    this.isExecuting = false;
            }
        }

        public savePcbState(): void {
            if (this.Pcb) {
                this.Pcb.PC = this.PC;
                this.Pcb.Acc = this.Acc;
                this.Pcb.Xreg = this.Xreg;
                this.Pcb.Yreg = this.Yreg;
                this.Pcb.Zflag = this.Zflag;
            }
        }

        public updatePcb(pcb: Pcb): void {
            this.savePcbState();

            this.Pcb = pcb;
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        }

        //
        // Op code functions
        //
        public loadAccConst(): void {
            this.Acc = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 1), 16);
            this.PC += 2;
        }

        public loadAccMem(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);

            this.Acc = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }

        public storeAccMem(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);
            var val = this.Acc.toString(16);

            _MemoryAccessor.write(this.Pcb.segment, addr, val);
            this.PC += 3;
        }

        public addWithCarry(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);
            var val = _MemoryAccessor.read(this.Pcb.segment, addr);

            this.Acc += parseInt(val, 16);
            this.PC += 3;
        }

        public loadXRegConst(): void {
            this.Xreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 1), 16);
            this.PC += 2;
        }

        public loadXRegMem(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);

            this.Xreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }

        public loadYRegConst(): void {
            this.Yreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 1), 16);
            this.PC += 2;
        }

        public loadYRegMem(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);

            this.Yreg = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr), 16);
            this.PC += 3;
        }

        public noOp(): void {
            this.PC++;
        }

        public brk(): void {
            console.log("BRK");            
            this.savePcbState();
            this.isExecuting = false;
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_PROCESS_IRQ, this.Pcb.pid));
        }

        public compare(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);
            var compareByte = _MemoryAccessor.read(this.Pcb.segment, addr);

            if (this.Xreg == parseInt(compareByte.toString(), 16)) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }

            this.PC += 3;
        }

        public branch(): void {
            if (this.Zflag == 0) {
                this.PC += parseInt(_MemoryAccessor.read(this.Pcb.segment, this.PC + 1), 16);
                this.PC += 2;
                this.PC %= 256;
            }
            else {
                this.PC += 2;
            }
        }

        public increment(): void {
            var swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 1);

            swapStr = _MemoryAccessor.read(this.Pcb.segment, this.PC + 2) + swapStr;

            var addr = parseInt(swapStr, 16);
            var incByte = parseInt(_MemoryAccessor.read(this.Pcb.segment, addr));

            incByte++;

            var hexByte = incByte.toString(16);

            _MemoryAccessor.write(this.Pcb.segment, addr, hexByte);
            this.PC += 3;
        }

        public sysCall(): void {
            // TODO: change the putText() to be the interrupts
            //       didn't like the passed params, so look up what the issue is

            if (this.Xreg === 1) {
                //_KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSCALL_IRQ, this.Yreg.toString()));
                _StdOut.putText("" + this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var output = "";
                var addr = this.Yreg;
                var value = parseInt(_MemoryAccessor.read(_CPU.Pcb.segment, addr), 16);

                while (value !== 0) {
                    output += String.fromCharCode(value);
                    value = parseInt(_MemoryAccessor.read(_CPU.Pcb.segment, ++addr), 16);
                }

                //_KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSCALL_IRQ, output));
                _StdOut.putText(output);
            }

            this.PC++;
        }
    }
}
