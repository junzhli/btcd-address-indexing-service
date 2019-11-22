import { EventEmitter } from "events";
import { Task } from "./types/rabbitmq";

class UserDataListener extends EventEmitter {
    constructor() {
        super();
    }

    genKey(addr: string, cmd: Task) {
        return addr + "+" + cmd;
    }
}

export default UserDataListener;
