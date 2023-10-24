import { Test, TestingModule } from '@nestjs/testing';
import { ConversationManagementResolver } from './conversation-management.resolver';

describe('ConversationManagementResolver', () => {
  let resolver: ConversationManagementResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationManagementResolver],
    }).compile();

    resolver = module.get<ConversationManagementResolver>(ConversationManagementResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
