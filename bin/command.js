"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeForFile = exports.executeCommand = exports.parseCommand = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const const_1 = require("./const");
const types_1 = require("./types");
const utils_1 = require("./utils");
const ajv_1 = __importDefault(require("ajv"));
const parseCommand = () => {
    commander_1.program
        .option("-i, --inputFile <char>")
        .option("-o, --outputFile <char>")
        .option("-k, --apiKey <char>")
        .option("-m, --model <char>")
        .option("-p, --promptTemplate <char>")
        .option("-y, --systemMessage <char>")
        .option("-t, --techs <char>")
        .option("-n, --instructions <char>")
        .option("-x, --examples <char>")
        .option("-c, --config <char>")
        .option("-s, --stream")
        .option("-e, --modelEndpoint <char>")
        .option("-h, --help");
    commander_1.program.parse();
    const options = commander_1.program.opts();
    if (options.help) {
        console.log(chalk_1.default.blue(`Usage: testgpt -i <inputFile> -o <outputFile> -k <apiKey> -m <model> -t <techs> -p <instructions> -c <config>`));
        console.log(chalk_1.default.green("\r\nAll fields are optional except for the input file. If no output file is provided, the default will be used."));
        // exit the program
        process.exit(0);
    }
    return options;
};
exports.parseCommand = parseCommand;
const executeCommand = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const { help, inputFile, outputFile } = args;
    if (help) {
        console.log(chalk_1.default.blue(`Usage: testgpt -i <inputFile> -o <outputFile> -k <apiKey> -m <model> -t <techs> -p <instructions> -c <config>`));
        console.log(chalk_1.default.green("\r\nAll fields are optional except inputFile. If no inputFile is provided, the default will be used."));
        // exit the program
        process.exit(0);
    }
    const isInputDirectory = (0, utils_1.getFileType)(inputFile) === utils_1.EFileType.Directory;
    const isOutputDirectory = outputFile && (0, utils_1.getFileType)(outputFile) === utils_1.EFileType.Directory;
    if (isInputDirectory && outputFile && !isOutputDirectory) {
        console.error(chalk_1.default.red("If inputFile is a directory, outputFile must also be a directory"));
        process.exit(1);
    }
    if (isInputDirectory) {
        // if outputDirectory is not provided, use the inputDirectory
        const outputDirectory = outputFile || inputFile;
        const files = fs_1.default.readdirSync(inputFile);
        for (const file of files) {
            const inputFilePath = path_1.default.join(inputFile, file);
            const { name: inputFileName, extension } = (0, utils_1.divideFileName)(inputFilePath);
            const outputFilePath = path_1.default.join(outputDirectory, `${inputFileName}.test${extension}`);
            yield (0, exports.executeForFile)(Object.assign(Object.assign({}, args), { inputFile: inputFilePath, outputFile: outputFilePath }));
        }
    }
    else {
        yield (0, exports.executeForFile)(args);
    }
    process.exit(0);
});
exports.executeCommand = executeCommand;
const executeForFile = (_a) => __awaiter(void 0, [_a], void 0, function* ({ inputFile, outputFile, apiKey, model, systemMessage, promptTemplate, techs, instructions, examples, config, stream, modelEndpoint, }) {
    var _b, _c, _d;
    if (examples && typeof examples === "string") {
        const ajv = new ajv_1.default();
        const validate = ajv.compile(types_1.examplesSchema);
        examples = JSON.parse(examples);
        const valid = validate(examples);
        if (!valid) {
            console.error(chalk_1.default.red("Invalid examples format"));
            console.error(chalk_1.default.red(JSON.stringify(validate.errors, null, 2)));
            process.exit(1);
        }
    }
    let { extension: inputFileExtension } = (0, utils_1.divideFileName)(inputFile);
    if (!inputFile) {
        console.error(chalk_1.default.red("Please provide an input file"));
        process.exit(1);
    }
    console.log(chalk_1.default.blue(`Reading ${const_1.CONFIG_FILE_NAME}...`));
    const configFilePath = path_1.default.join(process.cwd(), `${const_1.CONFIG_FILE_NAME}`);
    let testGPTConfig = {};
    if (fs_1.default.existsSync(configFilePath)) {
        console.log(chalk_1.default.green("Config file found, using.."));
        testGPTConfig = (0, utils_1.readYamlFile)(config || path_1.default.join(process.cwd(), `${const_1.CONFIG_FILE_NAME}`));
    }
    else {
        if (techs) {
            console.log(chalk_1.default.blue(`Config file not found, using passed config`));
            testGPTConfig = {
                [inputFileExtension]: {
                    techs: (techs === null || techs === void 0 ? void 0 : techs.split(",")) || [],
                    instructions: (instructions === null || instructions === void 0 ? void 0 : instructions.split(",")) || [],
                    examples: [],
                },
            };
        }
        else {
            console.log(chalk_1.default.blue(`Config file not found, continuing with default config`));
        }
    }
    if (!outputFile) {
        const inputFileWithoutExtension = inputFile.replace(inputFileExtension, "");
        outputFile = `${inputFileWithoutExtension}.test${inputFileExtension}`;
        console.log(chalk_1.default.blue("No output file provided, using default."));
        console.log(chalk_1.default.yellow(`Output file: ${outputFile}`));
    }
    const parsedTechs = (_b = testGPTConfig === null || testGPTConfig === void 0 ? void 0 : testGPTConfig[inputFileExtension]) === null || _b === void 0 ? void 0 : _b.techs;
    const parsedInstructions = (_c = testGPTConfig === null || testGPTConfig === void 0 ? void 0 : testGPTConfig[inputFileExtension]) === null || _c === void 0 ? void 0 : _c.instructions;
    examples !== null && examples !== void 0 ? examples : (examples = (_d = testGPTConfig === null || testGPTConfig === void 0 ? void 0 : testGPTConfig[inputFileExtension]) === null || _d === void 0 ? void 0 : _d.examples);
    apiKey !== null && apiKey !== void 0 ? apiKey : (apiKey = process.env.HUGGINGFACE_API_KEY);
    model !== null && model !== void 0 ? model : (model = const_1.DEFAULT_MODEL);
    yield (0, utils_1.autoTest)({
        inputFile,
        outputFile,
        apiKey,
        model: model,
        systemMessage,
        promptTemplate,
        examples,
        techs: parsedTechs,
        instructions: parsedInstructions,
        stream,
        modelEndpoint,
    });
});
exports.executeForFile = executeForFile;
//# sourceMappingURL=command.js.map