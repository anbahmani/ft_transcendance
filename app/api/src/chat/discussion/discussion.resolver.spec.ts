import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionResolver } from './discussion.resolver';

describe('DiscussionResolver', () => {
  let resolver: DiscussionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscussionResolver],
    }).compile();

    resolver = module.get<DiscussionResolver>(DiscussionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
