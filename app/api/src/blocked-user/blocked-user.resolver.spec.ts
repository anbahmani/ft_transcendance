import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUserResolver } from './blocked-user.resolver';

describe('BlockedUserResolver', () => {
  let resolver: BlockedUserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockedUserResolver],
    }).compile();

    resolver = module.get<BlockedUserResolver>(BlockedUserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
