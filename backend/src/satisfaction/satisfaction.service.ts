import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SatisfactionSurvey, SurveyResponse } from './entities/survey.entity';

@Injectable()
export class SatisfactionService {
  constructor(
    @InjectRepository(SatisfactionSurvey)
    private readonly surveyRepo: Repository<SatisfactionSurvey>,
    @InjectRepository(SurveyResponse)
    private readonly responseRepo: Repository<SurveyResponse>,
  ) {}

  findAll(): Promise<SatisfactionSurvey[]> {
    return this.surveyRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<SatisfactionSurvey> {
    const survey = await this.surveyRepo.findOne({ where: { id } });
    if (!survey) throw new NotFoundException(`Enquête ${id} non trouvée`);
    return survey;
  }

  create(dto: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey> {
    const survey = this.surveyRepo.create(dto);
    return this.surveyRepo.save(survey);
  }

  async update(id: string, dto: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey> {
    const survey = await this.findOne(id);
    Object.assign(survey, dto);
    return this.surveyRepo.save(survey);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.surveyRepo.update(id, { is_active: false });
  }

  async addResponse(surveyId: string, dto: Partial<SurveyResponse>): Promise<SurveyResponse> {
    const response = this.responseRepo.create({ ...dto, survey_id: surveyId });
    return this.responseRepo.save(response);
  }

  getResponses(surveyId: string): Promise<SurveyResponse[]> {
    return this.responseRepo.find({ where: { survey_id: surveyId } });
  }
}
