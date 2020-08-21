/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */
var TSOS;
(function (TSOS) {
    class DeviceDriver {
        constructor() {
            this.version = '000000001';
            this.status = 'unloaded';
            this.preemptable = false;
            this.driverEntry = null;
            this.isr = null;
            // The constructor below is useless because child classes
            // cannot pass "this" arguments when calling super().
            //constructor(public driverEntry = null,
            //            public isr = null) {
            //}
        }
    }
    TSOS.DeviceDriver = DeviceDriver;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriver.js.map