"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModule = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const settings_controller_1 = require("./settings.controller");
const config_service_1 = require("./config.service");
const prisma_module_1 = require("../common/prisma/prisma.module");
const email_service_1 = require("./email.service");
const backup_scheduler_1 = require("./backup.scheduler");
const config_1 = require("@nestjs/config");
let SettingsModule = class SettingsModule {
};
exports.SettingsModule = SettingsModule;
exports.SettingsModule = SettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [settings_controller_1.SettingsController],
        providers: [settings_service_1.SettingsService, config_service_1.ConfigService, email_service_1.EmailService, backup_scheduler_1.BackupScheduler],
        exports: [settings_service_1.SettingsService, config_service_1.ConfigService],
    })
], SettingsModule);
//# sourceMappingURL=settings.module.js.map