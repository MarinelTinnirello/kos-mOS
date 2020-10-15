/* ------------
    Scheduler.ts

    Keeps track of and schedules processes for the CPU.
    This is where we'll be handling our scheduling algorithms: Round Robin, First Come First Serve, and Non-preemptive Priority.
    We'll also handle our turnaround and wait times here (although that should be pretty simple).

    I wanted "currProcess" to be global, but setting it to type "Pcb" was being ass, so I left it as a variable in here : (
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
        public scheduleProcess() {
            this.currProcess = _ReadyQueue.find(element => element.state == "running");

            switch(this.currSchedulerType) {
                case "rr":      // Round robin
                    _Kernel.krnTrace(`Round robin scheduling; quantum = ${this.quantum}`);
                    this.roundRobin(this.quantum);

                    break;
                case "fcfs":    // First come, first serve
                    _Kernel.krnTrace("First come, first serve scheduling");
                    // we can get away with not having a dedicated function so long as we have an unreachable quantum
                    this.roundRobin(Number.MAX_SAFE_INTEGER);

                    break;
                case "pri":     // Non-preemptive priority
                    _Kernel.krnTrace("Non-preemptive priority scheduling");
                    this.priority;

                    break;
            }
        }

        public runNextProcess() {
            /** check if there's a process currently running **/
            if ((!this.currProcess) || (this.currProcess.pid !== _ReadyQueue[0]))
            {
                _Kernel.krnTrace("Context switch in progress");
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, [_ReadyQueue[0]]))
            }
        }

        public loadToReadyQueue(pcb: Pcb) {
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        }

        //
        // Scheduling algorithms
        //
        /**** Processes are pushed into the Ready Queue as they are received,
         * so there's no reason to sort, as they're already in their order of arrival 
        ****/

        public roundRobin(quantum: number) {
            /** if process in the ready queue lines up with our current process's PID,
             * reorder ready queue and get ready to run next process
             * else, reset quantum 
            **/
            if ((this.currProcess && _ReadyQueue[0].pid) === this.currProcess.pid) {
                if (this.turns <= 0) {
                    var process = _ReadyQueue.splice(0, 1);

                    _ReadyQueue.push(process[0]);
                    this.turns = quantum;
                } else {
                    this.turns--;
                }
            } else {
                this.turns = quantum;
            }

            this.runNextProcess();
        }

        public priority() {
            _ReadyQueue.sort((a, b) => (b.priority <= a.priority) ? 1 : -1);
            this.runNextProcess();
        }
    }
}