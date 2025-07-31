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
exports.autoTest = exports.streamTestContent = exports.getTestContent = exports.getMessages = exports.initHuggingFace = exports.readYamlFile = exports.getExampleMessages = exports.getPrompt = exports.parseTemplatePrompt = exports.toList = exports.getFileType = exports.EFileType = exports.divideFileName = exports.writeToFile = exports.readFile = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inference_1 = require("@huggingface/inference");
const yaml_1 = require("yaml");
const types_1 = require("./types");
const readFile = (path) => {
    try {
        const fileContent = fs_1.default.readFileSync(path, "utf-8");
        return fileContent;
    }
    catch (err) {
        console.error(`Error reading file: ${err}`);
        return "";
    }
};
exports.readFile = readFile;
const writeToFile = (path, content, append) => {
    try {
        fs_1.default.writeFileSync(path, content, {
            flag: append ? "a" : "w",
        });
        console.log(chalk_1.default.green(`Successfully wrote to file: ${path}`));
    }
    catch (err) {
        console.error(`Error writing to file: ${err}`);
    }
};
exports.writeToFile = writeToFile;
const divideFileName = (fileName) => {
    const extension = path_1.default.extname(fileName);
    const name = path_1.default.basename(fileName, extension);
    return { name, extension };
};
exports.divideFileName = divideFileName;
var EFileType;
(function (EFileType) {
    EFileType[EFileType["File"] = 0] = "File";
    EFileType[EFileType["Directory"] = 1] = "Directory";
})(EFileType || (exports.EFileType = EFileType = {}));
const getFileType = (path) => {
    try {
        const isDirectory = fs_1.default.lstatSync(path).isDirectory();
        return isDirectory ? EFileType.Directory : EFileType.File;
    }
    catch (err) {
        console.error(`Error getting file type: ${err}`);
        return EFileType.File;
    }
};
exports.getFileType = getFileType;
const toList = (arr) => arr.map((tip, index) => `${index + 1}. ${tip}`).join("\r\n");
exports.toList = toList;
const parseTemplatePrompt = (template, args) => {
    const regex = /{(\w+)}/g;
    return template.replace(regex, (_, key) => {
        return args[key];
    });
};
exports.parseTemplatePrompt = parseTemplatePrompt;
const getPrompt = ({ content, fileName, techs, instructions, promptTemplate, }) => {
    let prompt = promptTemplate !== null && promptTemplate !== void 0 ? promptTemplate : `Please provide unit tests for the file {fileName} using {techs}
{instructions}

Please begin your response with \`\`\` and end it with \`\`\` directly.

Here is the file content:
\`\`\`{content}\`\`\``;
    const techsCotent = (techs === null || techs === void 0 ? void 0 : techs.length) ? (0, exports.toList)(techs) : "same techs as the file";
    const instructionsContent = (instructions === null || instructions === void 0 ? void 0 : instructions.join("\r\n")) || "";
    const resultPrompt = (0, exports.parseTemplatePrompt)(prompt, {
        content,
        fileName,
        techs: techsCotent,
        instructions: instructionsContent,
    });
    return resultPrompt;
};
exports.getPrompt = getPrompt;
const getExampleMessages = (promptArgs, examples) => {
    if (!examples) {
        return [];
    }
    const messages = examples
        .map((g) => {
        const prompt = (0, exports.getPrompt)(Object.assign(Object.assign({}, promptArgs), { content: g.code, fileName: g.fileName }));
        return [
            {
                role: types_1.ERole.User,
                content: prompt,
            },
            {
                role: types_1.ERole.Assistant,
                content: g.tests,
            },
        ];
    })
        .flat();
    return messages;
};
exports.getExampleMessages = getExampleMessages;
const readYamlFile = (path) => {
    const content = (0, exports.readFile)(path);
    return (0, yaml_1.parse)(content);
};
exports.readYamlFile = readYamlFile;
const initHuggingFace = (apiKey) => {
    return new inference_1.HfInference(apiKey);
};
exports.initHuggingFace = initHuggingFace;
const getMessages = (systemMessage, prompt, examples) => {
    systemMessage !== null && systemMessage !== void 0 ? systemMessage : (systemMessage = "You are my unit testing assistant, you will help me write unit tests for the files I provide, your reply will only include the unit tests without any additional information, starting your response with ``` and ending it with ``` directly will help me understand your response better.");
    return [
        {
            role: types_1.ERole.System,
            content: systemMessage,
        },
        ...examples,
        {
            role: types_1.ERole.User,
            content: prompt,
        },
    ];
};
exports.getMessages = getMessages;
const getTestContent = (_a) => __awaiter(void 0, [_a], void 0, function* ({ model, messages, openai, }) {
    const fullPrompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const response = yield openai.textGeneration({
        model,
        inputs: fullPrompt,
        parameters: {
            max_new_tokens: 1024,
            return_full_text: false,
        },
    });
    const regex = /^```.*$/gm;
    return response.generated_text.replace(regex, "").trim();
});
exports.getTestContent = getTestContent;
const streamTestContent = (_a) => __awaiter(void 0, [_a], void 0, function* ({ model, messages, openai, onToken, }) {
    const fullPrompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const response = yield openai.textGeneration({
        model,
        inputs: fullPrompt,
        parameters: {
            max_new_tokens: 1024,
            return_full_text: false,
        },
    });
    const text = response.generated_text;
    // Simulation du streaming : on envoie un token � la fois (ou par mot)
    for (const token of text.split(" ")) {
        onToken(token + " "); // espace pour garder la forme du texte
        yield new Promise(resolve => setTimeout(resolve, 30)); // d�lai optionnel
    }
});
exports.streamTestContent = streamTestContent;
const autoTest = (_a) => __awaiter(void 0, [_a], void 0, function* ({ inputFile, outputFile, apiKey, model, systemMessage, promptTemplate, examples, techs, instructions, stream, modelEndpoint, }) {
    console.log(chalk_1.default.blue("Reading input file..."));
    let content;
    try {
        content = (0, exports.readFile)(inputFile);
    }
    catch (err) {
        console.error(chalk_1.default.red(`Error reading file: ${err}`));
        process.exit(1);
    }
    console.log(chalk_1.default.blue("Generating tests..."));
    const promptArgs = {
        content,
        fileName: inputFile,
        techs,
        instructions,
        promptTemplate,
    };
    const prompt = (0, exports.getPrompt)(promptArgs);
    const exampleMessages = (0, exports.getExampleMessages)(promptArgs, examples);
    if (modelEndpoint) {
        console.log("Found model endpoint, using it instead of OpenAI API");
        const response = yield fetch(modelEndpoint, {
            method: "POST",
            body: JSON.stringify({
                prompt,
                examples: exampleMessages,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const text = yield response.text();
        (0, exports.writeToFile)(outputFile, text);
        return;
    }
    const messages = (0, exports.getMessages)(systemMessage, prompt, exampleMessages);
    const huggingface = yield (0, exports.initHuggingFace)(apiKey);
    if (stream) {
        const onToken = (token) => {
            (0, exports.writeToFile)(outputFile, token, true);
        };
        yield (0, exports.streamTestContent)({
            openai: huggingface,
            model,
            messages,
            onToken,
        });
    }
    else {
        const testContent = yield (0, exports.getTestContent)({
            openai: huggingface,
            model,
            messages,
        });
        if (!testContent) {
            console.error(chalk_1.default.red("Error generating tests - No tests content"));
            process.exit(1);
        }
        (0, exports.writeToFile)(outputFile, testContent);
    }
});
exports.autoTest = autoTest;
//# sourceMappingURL=utils.js.map