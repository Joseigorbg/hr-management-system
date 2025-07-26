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
exports.UpdateSupporterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateSupporterDto {
}
exports.UpdateSupporterDto = UpdateSupporterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'João Silva', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '(99) 99999-9999', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Rua das Flores, 123, Macapá, AP', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '68900000', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "cep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Zona Norte', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "mapping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'people', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "supportType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'active', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSupporterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.0349, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSupporterDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -51.0694, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSupporterDto.prototype, "lng", void 0);
//# sourceMappingURL=update-supporter.dto.js.map