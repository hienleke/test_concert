"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAMES = void 0;
var QUEUE_NAMES;
(function (QUEUE_NAMES) {
    QUEUE_NAMES["EMAIL"] = "email-queue";
    QUEUE_NAMES[QUEUE_NAMES["CONCERT"] = {
        AVAILABILITY: 'concert-availability',
        BOOKING: 'concert-booking'
    }] = "CONCERT";
    QUEUE_NAMES[QUEUE_NAMES["AUTH"] = {
        TOKEN_VALIDATION: 'auth-token-validation'
    }] = "AUTH";
})(QUEUE_NAMES || (exports.QUEUE_NAMES = QUEUE_NAMES = {}));
//# sourceMappingURL=queue.types.js.map