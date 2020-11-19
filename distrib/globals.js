/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME = "KOS-MOS"; // character's name
const APP_VERSION = "000000001"; // KOS-MOS's serial number
const CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
// Interrupt Queues
const TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ = 1;
const INVALID_ADDR_IRQ = 2; // invalid memory address interrupt
const INVALID_OPCODE_IRQ = 3; // invalid op code interrupt
const TERMINATE_PROCESS_IRQ = 4; // terminate process from CPU interrupt
const SYSCALL_IRQ = 5; // system call interrupt
const KILL_PROCESS_IRQ = 6; // terminate process interrupt
const CONTEXT_SWITCH_IRQ = 7; // context switch interrupt
const KILL_ALL_PROCESS_IRQ = 8; // terminate all processes interrupt
// Memory
const MEMORY_SIZE = 256; // size of a memory segment
const NUM_OF_SEGMENTS = 3; // number of memory segments
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _PCB; // Utilize TypeScript's type annotation system to ensure that _PCB is an instance of the Pcb class.
var _Memory; // Utilize TypeScript's type annotation system to ensure that _Memory is an instance of the Memory class.
var _MemoryAccessor; // Utilize TypeScript's type annotation system to ensure that _MemoryAccessor is an instance of the MemoryAccessor class.
var _MemoryManager; // Utilize TypeScript's type annotation system to ensure that _MemoryManager is an instance of the MemoryManager class.
var _Scheduler; // Utilize TypeScript's type annotation system to ensure that _Scheduler is an instance of the Scheduler class.
var _Disk = TSOS.Disk; // Utilize TypeScript's type annotation system to ensure that _Disk is an instance of the Disk class.
var _OSclock = 0; // Page 23.
// Processes
var _PidCount = 0; // counts PIDs over runtime
var _ResidentList = []; // list of processes
var _ReadyQueue = []; // list of processes ready to be ran
//var _ReadyQueue: TSOS.Queue = new TSOS.Queue();      // queue of ready processes
// Modes
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _SingleStepMode = false;
var _NextStepMode = false;
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelInputQueue = null;
var _KernelBuffers = null;
// Standard input and output
var _StdIn = null;
var _StdOut = null;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;
var _krnDiskDriver;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
//# sourceMappingURL=globals.js.map