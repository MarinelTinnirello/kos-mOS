/* ------------
    Scheduler.ts

    Keeps track of and schedules processes for the CPU.
    This is where we'll be handling our scheduling algorithms: Round Robin, First Come First Serve, and Non-preemptive Priority.
    We'll also handle our turnaround and wait times here (although that should be pretty simple).

    I wanted "currProcess" to be global, but setting it to type "Pcb" was being ass, so I left it as a variable in here :(
    ------------ */
var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor(quantum = 6, // how many cycles allowed before switching processes
        turns = 0, // how many cycles it's been
        currProcess = null, // current process
        currSchedulerType = "rr", // current algorithm type
        availableSchedulerType = { rr: "Round Robin",
            fcfs: "First Come, First Serve",
            pri: "Priority" }) {
            this.quantum = quantum;
            this.turns = turns;
            this.currProcess = currProcess;
            this.currSchedulerType = currSchedulerType;
            this.availableSchedulerType = availableSchedulerType;
        }
        //
        // Process handling
        //
        scheduleProcess() {
            this.currProcess = _ReadyQueue.find(element => element.state == "running");
            switch (this.currSchedulerType) {
                case "rr": // Round robin
                    _Kernel.krnTrace(`Round robin scheduling; quantum = ${this.quantum}`);
                    this.roundRobin();
                    break;
                case "fcfs": // First come, first serve
                    _Kernel.krnTrace("First come, first serve scheduling");
                    /* We can get away with not having a dedicated function so long as we have an unreachable quantum
                    * in JS, there are a few ways to do this:
                    * "Infinity", "Number.MAX_SAFE_INTEGER"
                    * I just figured "MAX_SAFE_INTEGER" was the smartest way that also keeps in-line with our limited
                    * amount of memory
                    */
                    this.quantum = Number.MAX_SAFE_INTEGER;
                    this.roundRobin();
                    break;
                case "pri": // Non-preemptive priority
                    _Kernel.krnTrace("Non-preemptive priority scheduling");
                    this.priority();
                    break;
            }
        }
        runNextProcess() {
            /** check if there's a process currently running **/
            if (this.currProcess !== null || this.currProcess.pid !== _ReadyQueue[0].pid) {
                _Kernel.krnTrace("Context switch in progress...");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
            }
            this.isLastProcess(_CPU.Pcb);
        }
        terminateCurrProcess(currProcess) {
            currProcess.state = "terminated";
            _ReadyQueue = _ReadyQueue.filter(element => element.pid != currProcess.pid);
            _MemoryManager.isAvailable[currProcess.segment.index] = true;
            _StdOut.advanceLine();
            _StdOut.putText(`Process: ${currProcess.pid} terminated.`);
            _StdOut.advanceLine();
            _StdOut.putText(`Turnaround time: ${currProcess.executeCycles} cycles.`);
            _StdOut.advanceLine();
            _StdOut.putText(`Wait time: ${currProcess.waitCycles} cycles.`);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }
        loadToReadyQueue(pcb) {
            pcb.state = "ready";
            /** if ready queue's length is 0,
             * then load the 1st indexed process
            **/
            if (_ReadyQueue.length === 0) {
                _CPU.Pcb = pcb;
                _CPU.updatePcb(pcb);
                this.currProcess = pcb;
                this.turns = this.quantum;
                _StdOut.putText(`Current process: ${this.currProcess.pid}`);
                _StdOut.advanceLine();
            }
            _ReadyQueue.push(pcb);
        }
        isLastProcess(pcb) {
            if (_ReadyQueue[_ReadyQueue.length - 1] && pcb.state === "terminated") {
                this.turns = 0;
                _CPU.init();
            }
        }
        updateCyclesTaken() {
            _Kernel.krnTrace("Updating turnaround and wait time...");
            for (var pcb of _ResidentList) {
                pcb.executeCycles++;
                if (pcb.state === "ready") {
                    pcb.waitCycles++;
                }
            }
        }
        //
        // Scheduling algorithms
        //
        /**** Processes are pushed into the Ready Queue as they are received,
         * so there's no reason to sort, as they're already in their order of arrival
        ****/
        roundRobin() {
            //_StdOut.putText(`Round Robin check, turns left: ${this.turns}`);
            //_StdOut.advanceLine();
            /** if process isn't null,
             * check how many turns left there are
             * else set turns to the quantum
            **/
            if (this.currProcess !== null) {
                /** check if turns >= 0,
                 * if so, then shift the 1st indexed process and push it
                 * else, decrement turns by the quantum
                **/
                if (this.turns <= 0) {
                    var process = _ReadyQueue.shift();
                    _ReadyQueue.push(process);
                    this.turns = this.quantum;
                }
                else {
                    this.turns--;
                }
            }
            else {
                this.turns = this.quantum;
            }
            this.runNextProcess();
        }
        priority() {
            _ReadyQueue.sort((a, b) => (b.priority <= a.priority) ? 1 : -1);
            this.runNextProcess();
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map