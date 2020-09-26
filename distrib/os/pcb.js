/* ------------
     PCB.ts

     The process control block tracks whatever program is currently running.
    ------------ */
var TSOS;
(function (TSOS) {
    class Pcb {
        constructor(pid = 0, priority = 0, PC = 0, IR = -1, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, waitCycles = 0, executeCycles = 0, segment = {}, state = "new") {
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
        }
    }
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map