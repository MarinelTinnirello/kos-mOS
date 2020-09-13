/* ------------
     PCB.ts

     The process control block tracks whatever program is currently running.
    ------------ */

module TSOS {

    export class Pcb {

        constructor(public pid: number,
                    public base: number,
                    public limit: number,
                    public priority: number,
                    public PC: number = 0,
                    public IR: number = -1,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public waitCycles: number = 0,
                    public executeCycles: number = 0) {
        }
    }
}