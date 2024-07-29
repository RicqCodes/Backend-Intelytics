import { Test, TestingModule } from '@nestjs/testing';
import { DailyClaimsController } from './daily-claims.controller';

describe('DailyClaimsController', () => {
  let controller: DailyClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyClaimsController],
    }).compile();

    controller = module.get<DailyClaimsController>(DailyClaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
