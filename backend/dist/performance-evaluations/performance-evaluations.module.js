"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceEvaluationsModule = void 0;
const common_1 = require("@nestjs/common");
const performance_evaluations_service_1 = require("./performance-evaluations.service");
const performance_evaluations_controller_1 = require("./performance-evaluations.controller");
const prisma_module_1 = require("../common/prisma/prisma.module");
let PerformanceEvaluationsModule = class PerformanceEvaluationsModule {
};
exports.PerformanceEvaluationsModule = PerformanceEvaluationsModule;
exports.PerformanceEvaluationsModule = PerformanceEvaluationsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [performance_evaluations_controller_1.PerformanceEvaluationsController],
        providers: [performance_evaluations_service_1.PerformanceEvaluationsService],
        exports: [performance_evaluations_service_1.PerformanceEvaluationsService],
    })
], PerformanceEvaluationsModule);
//# sourceMappingURL=performance-evaluations.module.js.map