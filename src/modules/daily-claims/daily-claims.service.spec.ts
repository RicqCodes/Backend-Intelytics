import { Test, TestingModule } from '@nestjs/testing';
import { DailyClaimsService } from './daily-claims.service';

describe('DailyClaimsService', () => {
  let service: DailyClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyClaimsService],
    }).compile();

    service = module.get<DailyClaimsService>(DailyClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
