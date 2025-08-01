"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAdmissionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAdmissionDto {
}
exports.CreateAdmissionDto = CreateAdmissionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "hireDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Salário deve ser um número válido' }),
    (0, class_validator_1.Min)(0, { message: 'Salário deve ser maior ou igual a 0' }),
    __metadata("design:type", Number)
], CreateAdmissionDto.prototype, "salary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['CLT', 'PJ', 'Estágio']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "contractType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "positionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['active', 'vacation', 'inactive', 'terminated']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "benefits", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.ValidateIf)(o => o.status === 'terminated'),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "terminationDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)(o => o.status === 'terminated'),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "terminationReason", void 0);
//# sourceMappingURL=create-admission.dto.js.map