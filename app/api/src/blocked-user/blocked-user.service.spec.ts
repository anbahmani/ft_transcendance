import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUserService } from './blocked-user.service';

describe('BlockedUserService', () => {
  let service: BlockedUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockedUserService],
    }).compile();

    service = module.get<BlockedUserService>(BlockedUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
