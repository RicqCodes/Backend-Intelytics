import { Test, TestingModule } from '@nestjs/testing';
import { ClaimController } from './daily-claims.controller';
ClaimController;
// import { DailyClaimsController } from './daily-claims.controller';

describe('DailyClaimsController', () => {
  let controller: ClaimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimController],
    }).compile();

    controller = module.get<ClaimController>(ClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
