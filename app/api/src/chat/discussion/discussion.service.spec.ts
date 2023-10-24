import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionService } from './discussion.service';

describe('DiscussionService', () => {
  let service: DiscussionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscussionService],
    }).compile();

    service = module.get<DiscussionService>(DiscussionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
