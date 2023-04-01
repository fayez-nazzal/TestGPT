#!/usr/bin/env node
import { parseCommand, executeCommand } from "./command";

const options = parseCommand();

executeCommand(options);
