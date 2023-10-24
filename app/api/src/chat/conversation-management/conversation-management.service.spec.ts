import { Test, TestingModule } from '@nestjs/testing';
import { ConversationManagementService } from './conversation-management.service';

describe('ConversationManagementService', () => {
  let service: ConversationManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationManagementService],
    }).compile();

    service = module.get<ConversationManagementService>(ConversationManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
