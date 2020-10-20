/* ------------
     PCB.ts

     The process control block tracks whatever program is currently running.
     States include:
        - "new"             // initialized process
        - "ready"           // ready to be pushed into process list (will be important for Scheduler)
        - "running"         // process is currently running
        - "process"         // process has been pushed into process list
        - "terminate"       // process has been terminated
    ------------ */

module TSOS {

    export class Pcb {

        constructor(public pid: number = 0,             // process ID
                    public priority: number = 0,        // priority of ID
                    public PC: number = 0,              // program counter
                    public IR: number = -1,             // intstruction register
                    public Acc: number = 0,             // accumulator
                    public Xreg: number = 0,            // X register
                    public Yreg: number = 0,            // Y register
                    public Zflag: number = 0,           // Z flag
                    public waitCycles: number = 0,      // how many cycles it had to wait
                    public executeCycles: number = 0,   // how many cycles it had to execute
                    public segment = {},                // segment object
                    public state: string = "new") {     // state of PCB
        }
    }
}