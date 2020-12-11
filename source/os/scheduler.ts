/* ------------
    Scheduler.ts

    Keeps track of and schedules processes for the CPU.
    This is where we'll be handling our scheduling algorithms: Round Robin, First Come First Serve, and Non-preemptive Priority.
    We'll also handle our turnaround and wait times here (although that should be pretty simple).

    I wanted "currProcess" to be global, but setting it to type "Pcb" was being ass, so I left it as a variable in here :(
    ------------ */

module TSOS {

    export class Scheduler {

        constructor(public quantum: number = 6,                 // how many cycles allowed before switching processes
                    public turns: number = 0,                   // how many cycles it's been
                    public currProcess: Pcb = null,             // current process
                    public currSchedulerType: string = "rr",    // current algorithm type
                    public availableSchedulerType: any = {rr: "Round Robin",
                                                          fcfs: "First Come, First Serve",
                                                          pri: "Priority"}
                    ) {
        }

        //
        // Process handling
        //
        public scheduleProcess(): void {
            this.currProcess = _ReadyQueue.find(val => val.state == "running");

            switch(this.currSchedulerType) {
                case "rr":      // Round robin
                    _Kernel.krnTrace(`Round robin scheduling; quantum = ${this.quantum}`);
                    this.roundRobin();

                    break;
                case "fcfs":    // First come, first serve
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
                case "pri":     // Non-preemptive priority
                    _Kernel.krnTrace("Non-preemptive priority scheduling");
                    this.priority();

                    break;
            }
        }

        public runNextProcess(): void {
            /** check if there's a process currently running **/
            if (this.currProcess !== null || this.currProcess.pid !== _ReadyQueue[0].pid)
            {
                /** checks if location of current process is in hard drive **/
                if (_ReadyQueue[0].location == "hdd") {
                    var segment;

                    /** loop through all available segments
                     * check if there's any available segments 
                    **/
                    for (var i = 0; i < _MemoryManager.isAvailable.length; i++) {
                        if (_MemoryManager.isAvailable[i]) {
                            segment = i;

                            break;
                        }
                    }

                    /** if there's no available segments,
                     * then roll out process 
                    **/
                    if (segment === undefined) {
                        var processInMemory = _ResidentList.filter((process) => {
                            return process.location == "memory" &&
                                   (process.state == "ready" || process.state == "process");
                        });

                        _Kernel.krnTrace("Rolling out process...");
                        _MemoryManager.rollOut(processInMemory[processInMemory.length - 1]);
                    }

                    _Kernel.krnTrace("Rolling in process...");
                    _MemoryManager.rollIn(_ReadyQueue[0]);
                }

                // switches context
                // necessary for all, but as of Project 4, we need to check the location of our process 1st
                _Kernel.krnTrace("Context switch in progress...");
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []))
            }
        }

        public terminateCurrProcess(currProcess): void {
            currProcess.state = "terminated";
            _ReadyQueue = _ReadyQueue.filter(val => val.pid != currProcess.pid);
            _MemoryManager.isAvailable[currProcess.segment.index] = true;

            /** check if current process's location is in hard drive **/
            if (currProcess.location == 'hdd') {
                _krnDiskDriver.deleteFile(currProcess.swapFile, true);
            }

            _StdOut.advanceLine();
            _StdOut.putText(`Process: ${currProcess.pid} terminated.`);
            _StdOut.advanceLine();
            _StdOut.putText(`Turnaround time: ${currProcess.executeCycles} cycles.`);
            _StdOut.advanceLine();
            _StdOut.putText(`Wait time: ${currProcess.waitCycles} cycles.`);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public loadToReadyQueue(pcb: Pcb): void {
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

        public updateCyclesTaken(): void {
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

        public roundRobin(): void {
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
                } else {
                    this.turns--;
                }
            } else {
                this.turns = this.quantum;
            }

            this.runNextProcess();
        }

        public priority(): void {
            _ReadyQueue.sort((a, b) => (b.priority <= a.priority) ? 1 : -1);
            this.runNextProcess();
        }
    }
}