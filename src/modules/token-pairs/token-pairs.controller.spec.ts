import { Test, TestingModule } from '@nestjs/testing';
import { TokenPairsController } from './token-pairs.controller';

describe('TokenPairsController', () => {
  let controller: TokenPairsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenPairsController],
    }).compile();

    controller = module.get<TokenPairsController>(TokenPairsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
