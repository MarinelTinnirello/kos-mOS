/* ------------
     PCB.ts

     The process control block tracks whatever program is currently running.
     States include:
        - "new"             // initialized process
        - "ready"           // ready to be pushed into process list (will be important for Scheduler)
        - "running"         // process is currently running
        - "process"         // process has been pushed into process list
        - "terminated"      // process has been terminated
     Locations include:
        - "memory"          // process is in memory
        - "hdd"             // process is in hard drive
    
    PID increments per loaded input.
    ------------ */

module TSOS {

    export class Pcb {

        constructor(public pid: number = _PidCount++,   // process ID
                    public priority: number = 0,        // priority of ID
                    public PC: number = 0,              // program counter
                    public IR: number = -1,             // intstruction register
                    public Acc: number = 0,             // accumulator
                    public Xreg: number = 0,            // X register
                    public Yreg: number = 0,            // Y register
                    public Zflag: number = 0,           // Z flag
                    public waitCycles: number = 0,      // how many cycles it had to wait
                    public executeCycles: number = 0,   // how many cycles it had to execute
                    public segment: any = {},           // segment object
                    public state: string = "new",       // state of process
                    public location: string = "memory", // location of process
                    public swapFile: string = '') {     // swap file's value
        }
    }
}