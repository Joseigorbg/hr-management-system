"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const positions_module_1 = require("./positions/positions.module");
const departments_module_1 = require("./departments/departments.module");
const performance_evaluations_module_1 = require("./performance-evaluations/performance-evaluations.module");
const admissions_module_1 = require("./admissions/admissions.module");
const tasks_module_1 = require("./tasks/tasks.module");
const groups_module_1 = require("./groups/groups.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
const profile_module_1 = require("./profile/profile.module");
const chat_module_1 = require("./chat/chat.module");
const training_module_1 = require("./training/training.module");
const supporter_module_1 = require("./supporter/supporter.module");
const app_controller_1 = require("./app.controller");
const mailer_1 = require("@nestjs-modules/mailer");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    transport: {
                        host: configService.get('SMTP_HOST'),
                        port: parseInt(configService.get('SMTP_PORT'), 10),
                        secure: false,
                        auth: {
                            user: configService.get('SMTP_USER'),
                            pass: configService.get('SMTP_PASS'),
                        },
                    },
                    defaults: {
                        from: configService.get('SMTP_FROM'),
                    },
                    template: {
                        dir: (0, path_1.join)(__dirname, 'templates'),
                        adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            positions_module_1.PositionsModule,
            departments_module_1.DepartmentsModule,
            performance_evaluations_module_1.PerformanceEvaluationsModule,
            admissions_module_1.AdmissionsModule,
            tasks_module_1.TasksModule,
            groups_module_1.GroupsModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
            profile_module_1.ProfileModule,
            chat_module_1.ChatModule,
            training_module_1.TrainingModule,
            supporter_module_1.SupporterModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map