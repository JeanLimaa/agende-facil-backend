import { Test, TestingModule } from '@nestjs/testing';
import { GuestClientsService } from './guest-clients.service';

describe('GuestClientsService', () => {
  let service: GuestClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestClientsService],
    }).compile();

    service = module.get<GuestClientsService>(GuestClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
