import { Test, TestingModule } from '@nestjs/testing';
import { TokenPairsService } from './token-pairs.service';

describe('TokenPairsService', () => {
  let service: TokenPairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenPairsService],
    }).compile();

    service = module.get<TokenPairsService>(TokenPairsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
