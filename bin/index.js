#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
const options = (0, command_1.parseCommand)();
(0, command_1.executeCommand)(options);
//# sourceMappingURL=index.js.map