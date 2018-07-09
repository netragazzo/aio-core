
class Timer {
    constructor() {
        this.startTime = new Date().getTime();
    }

    parametersValidated() {
        this.parametersValidTime = new Date().getTime() - this.startTime;
        console.log('Parameters validated: ' + this.parametersValidTime);
    }

    vmStarted() {
        this.vmStartTime = new Date().getTime() - this.startTime;
        console.log('VM Start: ' + this.vmStartTime);
    }

    functionReturned() {
        this.functionReturnTime = new Date().getTime() - this.startTime;
        console.log('Function return: ' + this.functionReturnTime);
    }
}

module.exports = Timer;