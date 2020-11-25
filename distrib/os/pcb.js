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
var TSOS;
(function (TSOS) {
    class Pcb {
        constructor(pid = _PidCount++, // process ID
        priority = 0, // priority of ID
        PC = 0, // program counter
        IR = -1, // intstruction register
        Acc = 0, // accumulator
        Xreg = 0, // X register
        Yreg = 0, // Y register
        Zflag = 0, // Z flag
        waitCycles = 0, // how many cycles it had to wait
        executeCycles = 0, // how many cycles it had to execute
        segment = {}, // segment object
        state = "new", // state of process
        location = "memory", // location of process
        swapFile = '') {
            this.pid = pid;
            this.priority = priority;
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.waitCycles = waitCycles;
            this.executeCycles = executeCycles;
            this.segment = segment;
            this.state = state;
            this.location = location;
            this.swapFile = swapFile;
        }
    }
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map