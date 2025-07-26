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
exports.CompleteTrainingDto = exports.EnrollTrainingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class EnrollTrainingDto {
}
exports.EnrollTrainingDto = EnrollTrainingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do usuário' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EnrollTrainingDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do treinamento' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EnrollTrainingDto.prototype, "trainingId", void 0);
class CompleteTrainingDto {
}
exports.CompleteTrainingDto = CompleteTrainingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pontuação obtida', minimum: 0, maximum: 10, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CompleteTrainingDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL do certificado', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteTrainingDto.prototype, "certificate", void 0);
//# sourceMappingURL=enroll-training.dto.js.map