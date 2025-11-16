"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
require("./uploads/ipfs");
dotenv_1.default.config();
const app = (0, app_1.buildApp)();
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
